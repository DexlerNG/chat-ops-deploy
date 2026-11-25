"use strict";

import {RequestEntity} from "../../common/entities";
import DeployFactory from "./implementations";
import {createHash} from "crypto";
import env from "../../common/env";
import logger from "../../common/logger";
import deployRepository from "./repository";
import {DeployEntity, DeployStatus} from "./entity";
import * as messageAction from "./actions/message.action";
import {SendMessageParams} from "./dto";
export const processCommand = async (request: RequestEntity) => {

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

    if (chatProcessCommandResponse.error) {
        return {
            error: chatProcessCommandResponse.error,
            statusCode: chatProcessCommandResponse.statusCode || 400
        }
    }

    const processMessageResult = await messageAction.processMessage(chatProcessCommandResponse.data);

    const channelParams: SendMessageParams = {
        threadId:chatProcessCommandResponse.data.threadId,
        messageId: chatProcessCommandResponse.data.messageId,
        channel: chatProcessCommandResponse.data.channel,
    };

    if(processMessageResult.error){
        if (/^(deploy|smoke)\b/i.test(chatProcessCommandResponse.data.content.trim())) await chatInterface.sendMessage(channelParams, processMessageResult.error);

        return {
            data: "Ok",
            statusCode: 200
        }
    }

    if(!processMessageResult.data.service){
        return {
            data: "OK",
            statusCode: 200
        }
    }

    if (/^smoke\b/i.test(chatProcessCommandResponse.data.content.trim())) {
        request.params.CICDProvider = process.env.SMOKE_CICD_PROVIDER || "circleci";
    }
    if (processMessageResult.data.service !== "payfonte-e2e" && request.params.CICDProvider !== "github") {
        return {error: "Registered releases use GitHub Actions", statusCode: 403};
    }
    const CICDInterface = DeployFactory.getCICDProviderImplementation(request.params.CICDProvider);

    if (!CICDInterface) {
        return {
            error: `Oops, CICD Provider "${request.params.CICDProvider}" is not supported`,
            statusCode: 400
        }
    }

    let deployEntity: DeployEntity = {
        _id: createHash("sha256").update("slack:" + request.body.team_id + ":" + request.body.event_id).digest("hex").slice(0, 24),
        releaseId: request.body.event_id,
        dispatchState: "pending",
        workspaceId: request.body.team_id,
        actorId: chatProcessCommandResponse.data.user.id,
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

    try {
        deployEntity = await deployRepository.create(deployEntity);
    } catch (error) {
        if (!(error.code === 11000 && error.keyPattern?._id)) throw error;
    }

    const claimed = await deployRepository.findOneAndUpdate({_id: deployEntity._id, dispatchState:"pending"}, {dispatchState:"dispatching"});
    if (!claimed) return {data:"already accepted", statusCode:200};
    const CICDResponse = await CICDInterface.processDeploymentCommand(deployEntity);

    if (CICDResponse.error) {
        await deployRepository.findOneAndUpdate({_id: deployEntity._id, dispatchState:"dispatching"}, {dispatchState:"unconfirmed"});
        chatInterface.sendMessage(channelParams, CICDResponse.error)
            .catch(console.log);

        return {
            error: CICDResponse.error,
            statusCode: CICDResponse.statusCode || 500
        }
    }

    deployEntity = await deployRepository.findOneAndUpdate({_id: deployEntity._id}, {
        dispatchState: "dispatched",
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
        CICDProvider,
        pipelineId: getPipelineIdFromWebhookResponse.data
    });

    if (CICDProvider === "github") {
        const run = request.body.workflow_run;
        const repo = request.body.repository;
        const releaseId = /^Slack release (Ev[A-Za-z0-9]+)$/.exec(run?.display_title || "")?.[1];
        if (!env.githubReleaseBot || run?.actor?.login !== env.githubReleaseBot || !releaseId ||
            repo?.owner?.login !== env.githubOwner || run?.event !== "workflow_dispatch" ||
            run.head_branch !== repo.default_branch || run.path !== ".github/workflows/slack-release.yml") {
            return {error:"Unexpected release workflow identity", statusCode:403};
        }
        if (!deployEntity) {
            // A signed GitHub event can recover a successful dispatch whose response was lost.
            deployEntity = await deployRepository.findOneAndUpdate({
                CICDProvider, releaseId, service:repo.name, pipelineId:"",
                dispatchState:{$in:["dispatching","unconfirmed"]}
            }, {dispatchState:"dispatched", pipelineId:String(run.id), pipelineNumber:String(run.run_number)});
        }
        if (!deployEntity || deployEntity.service!==repo.name || deployEntity.releaseId!==releaseId)
            return {error:"Release audit mismatch",statusCode:403};
    }
    if (!deployEntity) return {error:"Unknown pipeline",statusCode:404};

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

