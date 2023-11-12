import {Context, WaterfallPipeline} from "@boost/pipeline";
import {ContextEntity, LoggerInterface} from "bridge-mix/lib/types";
import {dayjs, Logger, logger} from "bridge-mix";

import * as slackService from "../../../services/slack.service";
import {ChatPostMessageArguments} from "@slack/web-api";
import {DeployEntity, DeployStatus} from "../deploy.entity";
import deployRepository from "../deploy.repository";

interface ProcessJobCompletedPipelineInput {
    context: ContextEntity
    event?: any
    logger?: LoggerInterface
    deployEntity?: DeployEntity
    status?: DeployStatus
}

class ProcessWorkflowCompletedPipeline {
    constructor(private readonly context: ContextEntity ) {}

    async getDeployEntity(_: Context, input: ProcessJobCompletedPipelineInput){
        input.deployEntity = await deployRepository.findOne({pipelineId: input.event.pipeline.id});

        if(!input.deployEntity) throw new Error("Oops, We are unable to find a deploy entity");

        console.log("input.deployEntity", input.deployEntity);
        return input;
    }

    async sendSlackMessage(_: Context, input: ProcessJobCompletedPipelineInput){
        const postMessagePayload: ChatPostMessageArguments = {
            channel: input.deployEntity.channel,
            thread_ts: input.deployEntity.threadId,
            text: ""
        };

        let messages: string[]  = []
        if(input.event.workflow.status === "success") {
            messages.push(":white_check_mark: *Build Successfully Completed*".toUpperCase());
            input.status = DeployStatus.completed;
        } else {
            messages.push(":x: Build Failed".toUpperCase());
            input.status = input.event.workflow.status;
        }

        messages.push(`Workflow: *${input.event.workflow.name}*`);
        messages.push(`Environment: *${input.deployEntity.env}*`);
        messages.push(`Service: *${input.deployEntity.service}*`);
        messages.push(`Service Slug: *${input.event.project.slug}*`);
        messages.push(`Branch: *${input.event.pipeline.vcs.branch}*`)
        messages.push(`Build Time: *${dayjs(input.event.workflow.stopped_at).unix() - dayjs(input.event.workflow.created_at).unix()} seconds*`);
        messages.push(`Build Number: *${input.event.pipeline.number}*`);
        messages.push(`Commit: *${input.event.pipeline.vcs.revision}*`)
        messages.push(`Workflow URL: *${input.event.workflow.url}*`);
        messages.push(`Triggered By: *${input.deployEntity.user.name}*`);
        messages.push(`Status: *${input.event.workflow.status}*`);

        postMessagePayload.text = messages.join("\n");
        await slackService.chatPostMessage(postMessagePayload);

        return input;
    }


    async updateDeployRecordWithCircleCIWorkflowStatus(_: Context, input: ProcessJobCompletedPipelineInput){
        await deployRepository.findOneAndUpdate({_id: input.deployEntity._id}, {status: input.status, });
        return input;
    }

    run() {
        const input: ProcessJobCompletedPipelineInput = {
            context: this.context,
            logger: this.context.logger,
            event: this.context.request.body
        };

        new WaterfallPipeline(new Context(), input)
            .pipe("getDeployEntity", this.getDeployEntity)
            .pipe("sendSlackMessage", this.sendSlackMessage)
            .pipe("updateDeployRecordWithCircleCIWorkflowStatus", this.updateDeployRecordWithCircleCIWorkflowStatus)
            .run()
            .catch(error => input.logger.exception(error));
    }
}

export = ProcessWorkflowCompletedPipeline;
