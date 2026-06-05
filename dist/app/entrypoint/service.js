"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.processWebhook = exports.processCommand = void 0;
const implementations_1 = __importDefault(require("./implementations"));
const env_1 = __importDefault(require("../../common/env"));
const logger_1 = __importDefault(require("../../common/logger"));
const repository_1 = __importDefault(require("./repository"));
const entity_1 = require("./entity");
const messageAction = __importStar(require("./actions/message.action"));
const processCommand = (request) => __awaiter(void 0, void 0, void 0, function* () {
    logger_1.default.info("Request Data", request.body);
    request.params.chatProvider = request.params.chatProvider || env_1.default.defaultChatProvider;
    request.params.CICDProvider = request.params.CICDProvider || env_1.default.defaultCICDProvider;
    request.params.repoProvider = request.params.repoProvider || env_1.default.defaultRepoProvider;
    const chatInterface = implementations_1.default.getChatProviderImplementation(request.params.chatProvider);
    if (!chatInterface) {
        return {
            error: `Oops, Chat Provider "${request.params.chatProvider}" is not supported`,
            statusCode: 400
        };
    }
    const verificationResponse = yield chatInterface.processVerification(request);
    if (verificationResponse.error) {
        return {
            error: verificationResponse.error,
            statusCode: verificationResponse.statusCode
        };
    }
    if (verificationResponse.data) {
        return {
            data: verificationResponse.data,
            statusCode: verificationResponse.statusCode
        };
    }
    //process command should return the following to be passed to the circle-ci provider: env, branch, service
    const chatProcessCommandResponse = yield chatInterface.getMessageContent(request);
    console.log("chatProcessCommandResponse", JSON.stringify(chatProcessCommandResponse));
    if (chatProcessCommandResponse.error) {
        return {
            error: chatProcessCommandResponse.error,
            statusCode: chatProcessCommandResponse.statusCode || 400
        };
    }
    const processMessageResult = yield messageAction.processMessage(chatProcessCommandResponse.data);
    const channelParams = {
        threadId: chatProcessCommandResponse.data.threadId,
        messageId: chatProcessCommandResponse.data.messageId,
        channel: chatProcessCommandResponse.data.channel,
    };
    console.log("processMessageResult", JSON.stringify(processMessageResult));
    if (processMessageResult.error) {
        // await chatInterface.sendMessage(channelParams, processMessageResult.error);
        return {
            data: "Ok",
            statusCode: 200
        };
    }
    if (!processMessageResult.data.service) {
        return {
            data: "OK",
            statusCode: 200
        };
    }
    if (processMessageResult.data.service === "client-admin" && processMessageResult.data.env === "staging") {
        request.params.CICDProvider = "github-actions";
    }
    const CICDInterface = implementations_1.default.getCICDProviderImplementation(request.params.CICDProvider);
    if (!CICDInterface) {
        return {
            error: `Oops, CICD Provider "${request.params.CICDProvider}" is not supported`,
            statusCode: 400
        };
    }
    const checkIfMessageHasBeenProcessed = yield repository_1.default.countDocuments({
        chatProvider: request.params.chatProvider,
        messageId: chatProcessCommandResponse.data.messageId,
    });
    console.log("checkIfMessageHasBeenProcessed", checkIfMessageHasBeenProcessed);
    if (checkIfMessageHasBeenProcessed)
        return {
            data: "processed",
            statusCode: 200
        };
    let deployEntity = {
        chatProvider: request.params.chatProvider,
        repoProvider: request.params.repoProvider,
        CICDProvider: request.params.CICDProvider,
        branch: processMessageResult.data.branch,
        channel: chatProcessCommandResponse.data.channel,
        env: processMessageResult.data.env,
        service: processMessageResult.data.service,
        pipelineId: "",
        pipelineNumber: "",
        status: entity_1.DeployStatus.processing,
        command: chatProcessCommandResponse.data.content,
        threadId: chatProcessCommandResponse.data.threadId,
        messageId: chatProcessCommandResponse.data.messageId,
        user: chatProcessCommandResponse.data.user,
    };
    deployEntity = yield repository_1.default.create(deployEntity);
    const CICDResponse = yield CICDInterface.processDeploymentCommand(deployEntity);
    if (CICDResponse.error) {
        chatInterface.sendMessage(channelParams, CICDResponse.error)
            .catch(console.log);
        return {
            error: CICDResponse.error,
            statusCode: CICDResponse.statusCode || 500
        };
    }
    deployEntity = yield repository_1.default.findOneAndUpdate({ _id: deployEntity._id }, {
        pipelineId: CICDResponse.data.pipelineId,
        pipelineNumber: CICDResponse.data.pipelineNumber
    });
    chatInterface.sendMessage(channelParams, CICDResponse.data.message)
        .catch(console.log);
    return {
        error: null,
        data: deployEntity,
        statusCode: 200
    };
});
exports.processCommand = processCommand;
const processWebhook = (request) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
    console.log("Webhoook", JSON.stringify(request.body), request.params);
    const CICDProvider = request.params.CICDProvider || env_1.default.defaultCICDProvider;
    const CICDInterface = implementations_1.default.getCICDProviderImplementation(CICDProvider);
    if (!CICDInterface) {
        console.log("error", {
            error: `Oops, CICD Provider "${CICDProvider}" is not supported`,
            statusCode: 404
        });
        return {
            data: "processed",
            statusCode: 200
        };
    }
    const getPipelineIdFromWebhookResponse = yield CICDInterface.getPipelineIdFromWebhook(request);
    if (getPipelineIdFromWebhookResponse.error) {
        console.log("error", {
            error: getPipelineIdFromWebhookResponse.error,
            statusCode: 404
        });
        return {
            data: "processed",
            statusCode: 200
        };
    }
    let deployEntity = yield repository_1.default.findOne({
        pipelineId: getPipelineIdFromWebhookResponse.data
    });
    if (!deployEntity && ["github-actions", "github"].includes(CICDProvider)) {
        const repositoryName = (_b = (_a = request.body) === null || _a === void 0 ? void 0 : _a.repository) === null || _b === void 0 ? void 0 : _b.name;
        const branch = ((_d = (_c = request.body) === null || _c === void 0 ? void 0 : _c.workflow_run) === null || _d === void 0 ? void 0 : _d.head_branch) || ((_f = (_e = request.body) === null || _e === void 0 ? void 0 : _e.workflow_job) === null || _f === void 0 ? void 0 : _f.head_branch);
        if (repositoryName && branch) {
            deployEntity = yield repository_1.default.findOne({
                CICDProvider,
                service: repositoryName,
                branch,
                status: entity_1.DeployStatus.processing
            });
            if (deployEntity && getPipelineIdFromWebhookResponse.data) {
                deployEntity = yield repository_1.default.findOneAndUpdate({ _id: deployEntity._id }, {
                    pipelineId: getPipelineIdFromWebhookResponse.data,
                    pipelineNumber: String(((_h = (_g = request.body) === null || _g === void 0 ? void 0 : _g.workflow_run) === null || _h === void 0 ? void 0 : _h.run_number) || ((_k = (_j = request.body) === null || _j === void 0 ? void 0 : _j.workflow_job) === null || _k === void 0 ? void 0 : _k.run_id) || deployEntity.pipelineNumber || "")
                });
            }
        }
    }
    if (!deployEntity) {
        console.log("error", {
            error: `Oops, Deployment with pipelineId "${getPipelineIdFromWebhookResponse.data}" not found`,
            statusCode: 404
        });
        return {
            data: "processed",
            statusCode: 200
        };
    }
    if (deployEntity.status == entity_1.DeployStatus.completed) {
        return {
            data: "processed",
            statusCode: 200
        };
    }
    const webhookResponse = yield CICDInterface.resolveWebhook(request, deployEntity);
    if (webhookResponse.error) {
        console.log("error", {
            error: webhookResponse.error
        });
        return {
            data: "processed",
            statusCode: 200
        };
    }
    deployEntity = yield repository_1.default.findOneAndUpdate({
        _id: deployEntity._id,
    }, {
        status: webhookResponse.data.status
    });
    const chatInterface = implementations_1.default.getChatProviderImplementation(deployEntity.chatProvider);
    if (!chatInterface) {
        logger_1.default.error(`Oops, Chat Provider "${deployEntity.chatProvider}" is not supported`);
        return {
            data: "processed",
            statusCode: 200
        };
    }
    console.log("Result", {
        messageId: deployEntity.messageId,
        channel: deployEntity.channel,
        threadId: deployEntity.threadId
    }, webhookResponse.data.message);
    if (webhookResponse.data.message) {
        chatInterface.sendMessage({
            messageId: deployEntity.messageId,
            channel: deployEntity.channel,
            threadId: deployEntity.threadId
        }, webhookResponse.data.message)
            .catch(console.log);
    }
    return {
        data: "processed"
    };
});
exports.processWebhook = processWebhook;
//# sourceMappingURL=service.js.map