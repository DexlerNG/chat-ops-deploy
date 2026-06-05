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
const pipeline_1 = require("@boost/pipeline");
const slackService = __importStar(require("../../../services/slack.service"));
const entity_1 = require("../entity");
const repository_1 = __importDefault(require("../repository"));
const dayjs_1 = __importDefault(require("dayjs"));
const logger_1 = __importDefault(require("../../../common/logger"));
class ProcessWorkflowCompletedPipeline {
    constructor(request) {
        this.request = request;
    }
    getDeployEntity(_, input) {
        return __awaiter(this, void 0, void 0, function* () {
            input.deployEntity = yield repository_1.default.findOne({ pipelineId: input.event.pipeline.id });
            if (!input.deployEntity)
                throw new Error("Oops, We are unable to find a deploy entity");
            console.log("input.deployEntity", input.deployEntity);
            return input;
        });
    }
    sendSlackMessage(_, input) {
        return __awaiter(this, void 0, void 0, function* () {
            const postMessagePayload = {
                channel: input.deployEntity.channel,
                thread_ts: input.deployEntity.threadId,
                text: ""
            };
            let messages = [];
            if (input.event.workflow.status === "success") {
                messages.push(":white_check_mark: *Build Successfully Completed*".toUpperCase());
                input.status = entity_1.DeployStatus.completed;
            }
            else {
                messages.push(":x: Build Failed".toUpperCase());
                input.status = input.event.workflow.status;
            }
            messages.push(`Workflow: *${input.event.workflow.name}*`);
            messages.push(`Environment: *${input.deployEntity.env}*`);
            messages.push(`Service: *${input.deployEntity.service}*`);
            messages.push(`Service Slug: *${input.event.project.slug}*`);
            messages.push(`Branch: *${input.event.pipeline.vcs.branch}*`);
            messages.push(`Build Time: *${(0, dayjs_1.default)(input.event.workflow.stopped_at).unix() - (0, dayjs_1.default)(input.event.workflow.created_at).unix()} seconds*`);
            messages.push(`Build Number: *${input.event.pipeline.number}*`);
            messages.push(`Commit: *${input.event.pipeline.vcs.revision}*`);
            messages.push(`Workflow URL: *${input.event.workflow.url}*`);
            messages.push(`Triggered By: *${input.deployEntity.user.name}*`);
            messages.push(`Status: *${input.event.workflow.status}*`);
            postMessagePayload.text = messages.join("\n");
            yield slackService.chatPostMessage(postMessagePayload);
            return input;
        });
    }
    updateDeployRecordWithCircleCIWorkflowStatus(_, input) {
        return __awaiter(this, void 0, void 0, function* () {
            yield repository_1.default.findOneAndUpdate({ _id: input.deployEntity._id }, { status: input.status, });
            return input;
        });
    }
    run() {
        const input = {
            request: this.request,
            event: this.request.body
        };
        new pipeline_1.WaterfallPipeline(new pipeline_1.Context(), input)
            .pipe("getDeployEntity", this.getDeployEntity)
            .pipe("sendSlackMessage", this.sendSlackMessage)
            .pipe("updateDeployRecordWithCircleCIWorkflowStatus", this.updateDeployRecordWithCircleCIWorkflowStatus)
            .run()
            .catch(error => logger_1.default.error(error.message));
    }
}
module.exports = ProcessWorkflowCompletedPipeline;
//# sourceMappingURL=process-workflow-completed.pipeline.js.map