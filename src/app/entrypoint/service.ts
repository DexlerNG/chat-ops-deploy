"use strict";

// import TriggerCircleCIBuildPipeline from "./pipelines/trigger-circleci-build.pipeline";
// import ProcessJobCompletedPipeline from "./pipelines/process-job-completed.pipeline";
// import ProcessWorkflowCompletedPipeline from "./pipelines/process-workflow-completed.pipeline";
import {RequestEntity} from "../../common/entities";
import DeployFactory from "./implementations";
import env from "../../common/env";
import logger from "../../common/logger";
export const processCommand = async (request: RequestEntity) => {
    const payload = request.body;
    logger.info("Request Data", request.body);

    const chatProvider = request.params.chatProvider || env.defaultChatProvider;
    const chatInterface = DeployFactory.getImplementation(chatProvider);

    if(!chatInterface){
        return {
            error: `Oops, Provider "${chatProvider}" is not supported`,
            statusCode: 400
        }
    }

    const verificationResponse = await chatInterface.processVerification(request);

    if(verificationResponse.error){
        return {
            error: verificationResponse.error,
            statusCode: verificationResponse.statusCode
        }
    }

    if(verificationResponse.data){
        return{
            data: verificationResponse.data,
            statusCode: verificationResponse.statusCode
        }
    }

    await chatInterface.processCommand(request);

    return {
        error: null,
        data: payload,
        statusCode: 200
    }
}


// export const processWebhookEvents = async (brokerPayload: any) => {
//     const {event, provider, data} = brokerPayload;
//
//     console.log("Broker Payload", JSON.stringify(brokerPayload));
//
//     const clientId = "circleci";
//     const context: ContextEntity = new ContextEntity();
//     context.data = data;
//     context.request = {
//         body: data
//     };
//     context.clientId = clientId;
//     context.requestClientId = clientId;
//     context.contextClientId = clientId;
//     context.requestId = data?.pipeline?.id;
//     context.logger = new Logger({
//         requestId: context.requestId,
//         url: "pipeline-webhook",
//         contextClientId: context.contextClientId,
//         requestClientId: context.requestClientId
//     }, broker);
//
//
//     console.log("processWebhookEvents", data.type, data?.pipeline?.id)
//
//     if (data.type === "job-completed") {
//         new ProcessJobCompletedPipeline(context).run();
//     }
//
//     if(data.type === "workflow-completed"){
//         new ProcessWorkflowCompletedPipeline(context).run();
//     }
//
//     return {
//         data: true
//     }
// };

