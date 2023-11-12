import {Context, WaterfallPipeline} from "@boost/pipeline";
import logger from "../../../common/logger";
import * as slackService from "../../../services/slack.service";
import * as circleciService from "../../../services/circleci.service";
import {ChatPostMessageArguments} from "@slack/web-api";
import {DeployEntity, DeployStatus} from "../entity";
import {ExecuteDeployCommandDTO} from "../dto";
import deployRepository from "../repository";
import {RequestEntity, SlackUser} from "../../../common/entities";
interface TriggerCircleCIBuildPipelineInput {
    request: RequestEntity
    eventPayload?: any
    params?: ExecuteDeployCommandDTO
    postMessagePayload?: ChatPostMessageArguments
    slackUser?: SlackUser
    deployEntity?: DeployEntity
}

class TriggerCircleCIBuildPipeline {
    constructor(private readonly request: RequestEntity ) {}

    async validateMessageContent(_: Context, input: TriggerCircleCIBuildPipelineInput){
        const params: string[] = input.eventPayload.event.text.split(" ");
        input.params = {
            service: params?.[1],
            env: params?.[2],
            branch: params?.[3]
        }

        input.postMessagePayload = {
            channel: input.eventPayload.event.channel,
            thread_ts: input.eventPayload.event.event_ts,
            text: ""
        };

        if(!input.params.service) {
            input.postMessagePayload.text = ":x: Service is a required parameter";
            await slackService.chatPostMessage(input.postMessagePayload);
        }

        if(!input.params.env) {
            input.postMessagePayload.text = ":x: Deployment Environment is a required parameter";
            await slackService.chatPostMessage(input.postMessagePayload);
        }

        if(!input.params.branch) {
            input.postMessagePayload.text = ":x: Git Branch is a required parameter";
            await slackService.chatPostMessage(input.postMessagePayload);
        }

        if(input.postMessagePayload.text) throw Error("Validation Error Occurred: " + input.postMessagePayload.text);

        return input;
    }

    async getSlackUser(_: Context, input: TriggerCircleCIBuildPipelineInput){
        const slackUserResponse = await slackService.getUserInfo(input.eventPayload.event.user);
        console.log("Slack User", JSON.stringify(slackUserResponse));
        logger.info("slackUser", slackUserResponse);

        if(slackUserResponse.error) throw new Error("Error getting slack user info");

        input.slackUser = slackUserResponse.data;

        return input;
    }

    async createDeployRecord(_: Context, input: TriggerCircleCIBuildPipelineInput){
        let deployEntity: DeployEntity = {
            chatProvider: input.request.params.chatProvider,
            repoProvider: input.request.params.repoProvider,
            branch: input.params.branch,
            channel: input.eventPayload.event.channel,
            env: input.params.env,
            pipelineId: "",
            pipelineNumber: "",
            service: input.params.service,
            status: DeployStatus.processing,
            text: input.eventPayload.event.text,
            threadId: input.eventPayload.event.event_ts,
            user: {
                name: input.slackUser.real_name,
                id: input.slackUser.id
            }
        };

        input.deployEntity = await deployRepository.create(deployEntity);

        return input;
    }

    async startBuildProcess(_: Context, input: TriggerCircleCIBuildPipelineInput){

        const buildResponse = await circleciService.triggerBuildPipeline({
            branch: input.params.branch,
            service: input.params.service,
            parameters: {
                env: input.params.env
            }
        });

        if(buildResponse.error){
            input.postMessagePayload.text = `:x: Error triggering build pipeline: ${buildResponse.error}:x:`;
            await slackService.chatPostMessage(input.postMessagePayload);
            throw new Error("Error triggering build pipeline: " + buildResponse.error);
        }

        input.deployEntity = await deployRepository.findOneAndUpdate({_id: input.deployEntity._id}, {pipelineId: buildResponse.data.id, pipelineNumber: buildResponse.data.number});

        input.postMessagePayload.text = `:rotating_light: ${input.deployEntity.user.name} started a build process :rotating_light: \nService: *${input.params.service}* \nEnvironment: *${input.params.env}* \nBranch: *${input.params.branch}* \nCircleCI Build Number: *${input.deployEntity.pipelineNumber}*`


        slackService.sendReaction({
            channel: input.postMessagePayload.channel,
            timestamp: input.postMessagePayload.thread_ts,
            name: "thumbsup"
        }).catch(error => logger.error(error.message));

        await slackService.chatPostMessage(input.postMessagePayload);

        return input;
    }
    run() {

        const triggerInput: TriggerCircleCIBuildPipelineInput = {
            request: this.request,
            eventPayload: this.request.body
        }

        new WaterfallPipeline(new Context(), triggerInput)
            .pipe("validateMessageContent", this.validateMessageContent)
            .pipe("getSlackUser", this.getSlackUser)
            .pipe("createDeployRecord", this.createDeployRecord)
            .pipe("startBuildProcess", this.startBuildProcess)
            .run()
            .catch(error => logger.error(error));
    }
}

export = TriggerCircleCIBuildPipeline;
