import {ChatProviderInterface} from "../../interface";
import {FunctionResponseDTO, RequestEntity} from "../../../../common/entities";
import TriggerCircleCIBuildPipeline from "../../pipelines/trigger-circleci-build.pipeline";
import logger from "../../../../common/logger";
import ProcessJobCompletedPipeline from "../../pipelines/process-job-completed.pipeline";
import ProcessWorkflowCompletedPipeline from "../../pipelines/process-workflow-completed.pipeline";
import {ChatProviderProcessCommandResponse, ExecuteDeployCommandDTO, SendMessageParams} from "../../dto";
import * as slackService from "../../../../services/slack.service";

export default class Slack implements ChatProviderInterface {
    async processVerification(request: RequestEntity): Promise<FunctionResponseDTO<string>> {
        if (request.body.type == "url_verification") {
            return {
                data: request.body.challenge,
                statusCode: 200
            }
        }

        return {
            error: null,
            data: undefined,
            statusCode: 200
        };
    }

    async processCommand(request: RequestEntity): Promise<FunctionResponseDTO<ChatProviderProcessCommandResponse>> {
        const message: string = request.body.event.text;

        if (!message) {
            logger.error("Message is empty", request.body);

            return {
                error: "Empty Event Payload",
                statusCode: 400
            }
        }

        if (!message.toLowerCase().trim().startsWith("deploy")) {
            return {
                error: "Command Not Starting with 'deploy'",
                statusCode: 200 //we are returning 200 because we don't want to send an error message back to slack as they will keep on retrying
            }
        }

        const params: string[] = message.split(" ");

        const deployParams: ExecuteDeployCommandDTO = {
            service: params?.[1],
            env: params?.[2],
            branch: params?.[3]
        };

        const sendMessageParams: SendMessageParams = {
            channel: request.body.event.channel,
            threadId: request.body.event.event_ts,
            messageId: request.body.event.event_ts,
        }

        const postMessagePayload = {
            channel: request.body.event.channel,
            thread_ts: request.body.event.event_ts,
            text: ""
        };

        if (!deployParams.service) {
            postMessagePayload.text = ":x: Service is a required parameter";
            await slackService.chatPostMessage(postMessagePayload);
        }

        if (!deployParams.env) {
            postMessagePayload.text = ":x: Deployment Environment is a required parameter";
            await slackService.chatPostMessage(postMessagePayload);
        }

        if (!deployParams.branch) {
            postMessagePayload.text = ":x: Git Branch is a required parameter";
            await slackService.chatPostMessage(postMessagePayload);
        }

        if (postMessagePayload.text) return {
            error: "Validation Error Occurred: " + postMessagePayload.text,
            statusCode: 422
        }


        //get user
        const slackUserResponse = await slackService.getUserInfo(request.body.event.user);
        logger.info("slackUser", slackUserResponse);


        if(slackUserResponse.error) {
            logger.info("slackUser", slackUserResponse);
        }

        let user: any = {
            name: slackUserResponse.data?.real_name || "anonymous",
            id: slackUserResponse.data?.id || "anonymous"
        };


        return {
            data: {
                command: message,
                user,
                messageParams: sendMessageParams,
                deployParams: {
                    service: params?.[1],
                    env: params?.[2],
                    branch: params?.[3]
                },
            },
            statusCode: 200
        };
    }

    async sendMessage(sendMessageParams: SendMessageParams, text: string): Promise<FunctionResponseDTO<any>> {
       try{
           const postMessagePayload = {
               channel: sendMessageParams.channel,
               thread_ts: sendMessageParams.threadId,
               text: text
           };

           console.log("P", postMessagePayload);

           const response = await slackService.chatPostMessage(postMessagePayload);

           return {
               data: response,
               statusCode: 200
           }
       }catch (error){
           logger.error(error.message, {
               sendMessageParams,
               text
           });
       }
    }
    async processWebhook(request: RequestEntity): Promise<FunctionResponseDTO<string>> {

        if (request.body.type === "job-completed") {
            new ProcessJobCompletedPipeline(request).run();
        }

        if (request.body.type === "workflow-completed") {
            new ProcessWorkflowCompletedPipeline(request).run();
        }

        return {
            data: "processed"
        }
    }


}
