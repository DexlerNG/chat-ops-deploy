import {Context, WaterfallPipeline} from "@boost/pipeline";
import {ContextEntity, LoggerInterface} from "bridge-mix/lib/types";
import {dayjs, Logger, logger} from "bridge-mix";

import * as slackService from "../../../services/slack.service";
import * as circleciService from "../../../services/circleci.service";
import {ChatPostMessageArguments} from "@slack/web-api";
import {DeployEntity, DeployStatus} from "../deploy.entity";
import {ExecuteDeployCommandDTO} from "../deploy.dto";
import deployRepository from "../deploy.repository";
import {SlackUser} from "../../../common/entities";
interface ProcessJobCompletedPipelineInput {
    context: ContextEntity
    event?: any
    logger?: LoggerInterface
    deployEntity?: DeployEntity
}

class ProcessJobCompletedPipeline {
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
        if(input.event.job.status === "success") {
            messages.push(":white_check_mark: *Job Completed*".toUpperCase());
        } else {
            messages.push(":x: *Job Failed*".toUpperCase());
        }

        messages.push(`Name: *${input.event.job.name}*`);
        messages.push(`Workflow: *${input.event.workflow.name}*`);
        messages.push(`Environment: *${input.deployEntity.env}*`);
        messages.push(`Service: *${input.deployEntity.service}*`);
        messages.push(`Service Slug: *${input.event.project.slug}*`);
        messages.push(`Branch: *${input.event.pipeline.vcs.branch}*`)
        messages.push(`Build Number: *${input.event.job.number}*`);
        messages.push(`Build Time: *${dayjs(input.event.job.stopped_at).unix() - dayjs(input.event.job.started_at).unix()} seconds*`);

        messages.push(`Commit: *${input.event.pipeline.vcs.revision}*`)
        messages.push(`Workflow URL: *${input.event.workflow.url}*`);
        messages.push(`Triggered By: *${input.deployEntity.user.name}*`);
        messages.push(`Status: *${input.event.job.status}*`);

        postMessagePayload.text = messages.join("\n");
        await slackService.chatPostMessage(postMessagePayload);

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
            .run()
            .catch(error => input.logger.exception(error));
    }
}

export = ProcessJobCompletedPipeline;
