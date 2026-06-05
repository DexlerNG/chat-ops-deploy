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
const logger_1 = __importDefault(require("../../../../common/logger"));
const process_job_completed_pipeline_1 = __importDefault(require("../../pipelines/process-job-completed.pipeline"));
const process_workflow_completed_pipeline_1 = __importDefault(require("../../pipelines/process-workflow-completed.pipeline"));
const slackService = __importStar(require("../../../../services/slack.service"));
class Slack {
    processVerification(request) {
        return __awaiter(this, void 0, void 0, function* () {
            if (request.body.type == "url_verification") {
                return {
                    data: request.body.challenge,
                    statusCode: 200
                };
            }
            return {
                error: null,
                data: undefined,
                statusCode: 200
            };
        });
    }
    getMessageContent(request) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            const message = request.body.event.text;
            if (!message) {
                logger_1.default.error("Message is empty", request.body);
                return {
                    error: "Empty Event Payload",
                    statusCode: 400
                };
            }
            //get user
            const slackUserResponse = yield slackService.getUserInfo(request.body.event.user);
            logger_1.default.info("slackUser", slackUserResponse);
            if (slackUserResponse.error) {
                logger_1.default.info("slackUser", slackUserResponse);
            }
            let user = {
                name: ((_a = slackUserResponse.data) === null || _a === void 0 ? void 0 : _a.real_name) || "anonymous",
                id: ((_b = slackUserResponse.data) === null || _b === void 0 ? void 0 : _b.id) || "anonymous"
            };
            return {
                data: {
                    content: message,
                    user,
                    channel: request.body.event.channel,
                    threadId: request.body.event.event_ts,
                    messageId: request.body.event.event_ts,
                    meta: request.body
                }
            };
        });
    }
    processCommand(request) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            const message = request.body.event.text;
            if (!message) {
                logger_1.default.error("Message is empty", request.body);
                return {
                    error: "Empty Event Payload",
                    statusCode: 400
                };
            }
            if (!message.toLowerCase().trim().startsWith("deploy")) {
                return {
                    error: "Command Not Starting with 'deploy'",
                    statusCode: 200 //we are returning 200 because we don't want to send an error message back to slack as they will keep on retrying
                };
            }
            const params = message.split(" ");
            const deployParams = {
                service: params === null || params === void 0 ? void 0 : params[1],
                env: params === null || params === void 0 ? void 0 : params[2],
                branch: params === null || params === void 0 ? void 0 : params[3]
            };
            const sendMessageParams = {
                channel: request.body.event.channel,
                threadId: request.body.event.event_ts,
                messageId: request.body.event.event_ts,
            };
            const postMessagePayload = {
                channel: request.body.event.channel,
                thread_ts: request.body.event.event_ts,
                text: ""
            };
            if (!deployParams.service) {
                postMessagePayload.text = ":x: Service is a required parameter";
                yield slackService.chatPostMessage(postMessagePayload);
            }
            if (!deployParams.env) {
                postMessagePayload.text = ":x: Deployment Environment is a required parameter";
                yield slackService.chatPostMessage(postMessagePayload);
            }
            if (!deployParams.branch) {
                postMessagePayload.text = ":x: Git Branch is a required parameter";
                yield slackService.chatPostMessage(postMessagePayload);
            }
            if (postMessagePayload.text)
                return {
                    error: "Validation Error Occurred: " + postMessagePayload.text,
                    statusCode: 422
                };
            //get user
            const slackUserResponse = yield slackService.getUserInfo(request.body.event.user);
            logger_1.default.info("slackUser", slackUserResponse);
            if (slackUserResponse.error) {
                logger_1.default.info("slackUser", slackUserResponse);
            }
            let user = {
                name: ((_a = slackUserResponse.data) === null || _a === void 0 ? void 0 : _a.real_name) || "anonymous",
                id: ((_b = slackUserResponse.data) === null || _b === void 0 ? void 0 : _b.id) || "anonymous"
            };
            return {
                data: {
                    command: message,
                    user,
                    messageParams: sendMessageParams,
                    deployParams: {
                        service: params === null || params === void 0 ? void 0 : params[1],
                        env: params === null || params === void 0 ? void 0 : params[2],
                        branch: params === null || params === void 0 ? void 0 : params[3]
                    },
                },
                statusCode: 200
            };
        });
    }
    sendMessage(sendMessageParams, text) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const postMessagePayload = {
                    channel: sendMessageParams.channel,
                    thread_ts: sendMessageParams.threadId,
                    text: text
                };
                console.log("P", postMessagePayload);
                const response = yield slackService.chatPostMessage(postMessagePayload);
                return {
                    data: response,
                    statusCode: 200
                };
            }
            catch (error) {
                logger_1.default.error(error.message, {
                    sendMessageParams,
                    text
                });
            }
        });
    }
    processWebhook(request) {
        return __awaiter(this, void 0, void 0, function* () {
            if (request.body.type === "job-completed") {
                new process_job_completed_pipeline_1.default(request).run();
            }
            if (request.body.type === "workflow-completed") {
                new process_workflow_completed_pipeline_1.default(request).run();
            }
            return {
                data: "processed"
            };
        });
    }
}
exports.default = Slack;
//# sourceMappingURL=slack.js.map