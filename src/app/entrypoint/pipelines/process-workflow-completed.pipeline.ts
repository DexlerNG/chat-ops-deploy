import {Context, WaterfallPipeline} from "@boost/pipeline";

import * as slackService from "../../../services/slack.service";
import {ChatPostMessageArguments} from "@slack/web-api";
import {DeployEntity, DeployStatus} from "../entity";
import deployRepository from "../repository";
import {RequestEntity} from "../../../common/entities";
import dayjs from "dayjs";
import logger from "../../../common/logger";

interface ProcessJobCompletedPipelineInput {
    request: RequestEntity
    event?: any
    deployEntity?: DeployEntity
    status?: DeployStatus
}

class ProcessWorkflowCompletedPipeline {
    constructor(private readonly request: RequestEntity ) {}

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
            request: this.request,
            event: this.request.body
        };

        new WaterfallPipeline(new Context(), input)
            .pipe("getDeployEntity", this.getDeployEntity)
            .pipe("sendSlackMessage", this.sendSlackMessage)
            .pipe("updateDeployRecordWithCircleCIWorkflowStatus", this.updateDeployRecordWithCircleCIWorkflowStatus)
            .run()
            .catch(error => logger.error(error.message));
    }
}

export = ProcessWorkflowCompletedPipeline;
