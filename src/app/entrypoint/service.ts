"use strict";

import {RequestEntity} from "../../common/entities";
import DeployFactory from "./implementations";
import env from "../../common/env";
import logger from "../../common/logger";
import deployRepository from "./repository";
import {DeployEntity, DeployStatus} from "./entity";
import * as messageAction from "./actions/message.action";
import {SendMessageParams} from "./dto";
export const processCommand = async (request: RequestEntity) => {
    logger.info("Request Data", request.body);

    request.params.chatProvider = request.params.chatProvider || env.defaultChatProvider;
    request.params.CICDProvider = request.params.CICDProvider || env.defaultCICDProvider;
    request.params.repoProvider = request.params.repoProvider || env.defaultRepoProvider;

    const chatInterface = DeployFactory.getChatProviderImplementation(request.params.chatProvider);

    if (!chatInterface) {
        return {
            error: `Oops, Chat Provider "${request.params.chatProvider}" is not supported`,
            statusCode: 400
        }
    }


    const verificationResponse = await chatInterface.processVerification(request);

    if (verificationResponse.error) {
        return {
            error: verificationResponse.error,
            statusCode: verificationResponse.statusCode
        }
    }

    if (verificationResponse.data) {
        return {
            data: verificationResponse.data,
            statusCode: verificationResponse.statusCode
        }
    }

    //process command should return the following to be passed to the circle-ci provider: env, branch, service
    const chatProcessCommandResponse = await chatInterface.getMessageContent(request);

    console.log("chatProcessCommandResponse", JSON.stringify(chatProcessCommandResponse));
    if (chatProcessCommandResponse.error) {
        return {
            error: chatProcessCommandResponse.error,
            statusCode: 200
        }
    }


    const processMessageResult = await messageAction.processMessage(chatProcessCommandResponse.data);

    const channelParams: SendMessageParams = {
        threadId:chatProcessCommandResponse.data.threadId,
        messageId: chatProcessCommandResponse.data.messageId,
        channel: chatProcessCommandResponse.data.channel,
    };

    console.log("processMessageResult", JSON.stringify(processMessageResult));

    if(processMessageResult.error){
        await chatInterface.sendMessage(channelParams, processMessageResult.error);

        return {
            data: "Ok",
            statusCode: 200
        }
    }

    const CICDInterface = DeployFactory.getCICDProviderImplementation(request.params.CICDProvider);

    if (!CICDInterface) {
        return {
            error: `Oops, CICD Provider "${request.params.CICDProvider}" is not supported`,
            statusCode: 400
        }
    }

    const checkIfMessageHasBeenProcessed = await deployRepository.countDocuments({
        chatProvider: request.params.chatProvider,
        messageId: chatProcessCommandResponse.data.messageId,
    });
    console.log("checkIfMessageHasBeenProcessed", checkIfMessageHasBeenProcessed);

    if(checkIfMessageHasBeenProcessed) return {
        data: "processed",
        statusCode: 200
    };

    let deployEntity: DeployEntity = {
        chatProvider: request.params.chatProvider,
        repoProvider: request.params.repoProvider,
        CICDProvider: request.params.CICDProvider,
        branch: processMessageResult.data.branch,
        channel: chatProcessCommandResponse.data.channel,
        env: processMessageResult.data.env,
        service: processMessageResult.data.service,
        pipelineId: "",
        pipelineNumber: "",
        status: DeployStatus.processing,
        command: chatProcessCommandResponse.data.content,
        threadId: chatProcessCommandResponse.data.threadId,
        messageId: chatProcessCommandResponse.data.messageId,
        user: chatProcessCommandResponse.data.user,
    }

    deployEntity = await deployRepository.create(deployEntity);


    const CICDResponse = await CICDInterface.processDeploymentCommand(deployEntity);

    if (CICDResponse.error) {
        chatInterface.sendMessage(channelParams, CICDResponse.error)
            .catch(console.log);


        return {
            error: CICDResponse.error,
            statusCode: CICDResponse.statusCode || 500
        }
    }

    deployEntity = await deployRepository.findOneAndUpdate({_id: deployEntity._id}, {
        pipelineId: CICDResponse.data.pipelineId,
        pipelineNumber: CICDResponse.data.pipelineNumber
    });

    chatInterface.sendMessage(channelParams, CICDResponse.data.message)
        .catch(console.log);

    return {
        error: null,
        data: deployEntity,
        statusCode: 200
    }
}

export const processWebhook = async (request: RequestEntity) => {

    console.log("Broker Payload", JSON.stringify(request.body), request.params);

    const CICDProvider = request.params.CICDProvider || env.defaultCICDProvider;

    const CICDInterface = DeployFactory.getCICDProviderImplementation(CICDProvider);

    if (!CICDInterface) {
        return {
            error: `Oops, CICD Provider "${CICDProvider}" is not supported`,
            statusCode: 400
        }
    }

    const getPipelineIdFromWebhookResponse = await CICDInterface.getPipelineIdFromWebhook(request);
    if (getPipelineIdFromWebhookResponse.error) {
        return {
            error: getPipelineIdFromWebhookResponse.error
        }
    }


    let deployEntity: DeployEntity = await deployRepository.findOne({
        pipelineId: getPipelineIdFromWebhookResponse.data
    });

    if (!deployEntity) {
        return {
            error: `Oops, Deployment with pipelineId "${getPipelineIdFromWebhookResponse.data}" not found`,
            statusCode: 404
        }
    }

    if(deployEntity.status == DeployStatus.completed){
        return {
            data: "processed",
            statusCode: 200
        }
    }


    const webhookResponse = await CICDInterface.resolveWebhook(request, deployEntity);
    if (webhookResponse.error) {
        return {
            error: webhookResponse.error
        }
    }

    deployEntity = await deployRepository.findOneAndUpdate({
        _id: deployEntity._id,
    }, {
        status: webhookResponse.data.status
    });

    const chatInterface = DeployFactory.getChatProviderImplementation(deployEntity.chatProvider);

    if (!chatInterface) {
        logger.error(`Oops, Chat Provider "${deployEntity.chatProvider}" is not supported`);
        return {
            data: "processed",
            statusCode: 200
        }
    }

    chatInterface.sendMessage({
        messageId: deployEntity.messageId,
        channel: deployEntity.channel,
        threadId: deployEntity.threadId
    }, webhookResponse.data.message)
        .catch(console.log);


    return {
        data: "processed"
    }
};

