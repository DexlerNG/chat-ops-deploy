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
const entity_1 = require("../../entity");
const circleciService = __importStar(require("../../../../services/circleci.service"));
const dayjs_1 = __importDefault(require("dayjs"));
class CircleCI {
    processDeploymentCommand(deployEntity) {
        return __awaiter(this, void 0, void 0, function* () {
            const buildResponse = yield circleciService.triggerBuildPipeline({
                branch: deployEntity.branch,
                service: deployEntity.service,
                parameters: {
                    env: deployEntity.env
                }
            });
            if (buildResponse.error) {
                const error = `:x: Error triggering build pipeline: ${buildResponse.error}:x:`;
                return {
                    error,
                    statusCode: 500
                };
            }
            return {
                data: {
                    message: `:rotating_light: ${deployEntity.user.name} started a build process :rotating_light: \nService: *${deployEntity.service}* \nEnvironment: *${deployEntity.env}* \nBranch: *${deployEntity.branch}* \nCircleCI Build Number: *${buildResponse.data.number}*`,
                    pipelineId: buildResponse.data.id,
                    pipelineNumber: buildResponse.data.number
                }
            };
        });
    }
    getPipelineIdFromWebhook(request) {
        var _a, _b, _c, _d;
        return __awaiter(this, void 0, void 0, function* () {
            if (!((_b = (_a = request.body) === null || _a === void 0 ? void 0 : _a.pipeline) === null || _b === void 0 ? void 0 : _b.id)) {
                return {
                    error: "Not CircleCI"
                };
            }
            return {
                data: (_d = (_c = request.body) === null || _c === void 0 ? void 0 : _c.pipeline) === null || _d === void 0 ? void 0 : _d.id
            };
        });
    }
    resolveWebhook(request, deployEntity) {
        return __awaiter(this, void 0, void 0, function* () {
            const messages = [];
            let status = entity_1.DeployStatus.processing;
            if (request.body.type === "job-completed") {
                if (request.body.job.status === "success") {
                    messages.push(":white_check_mark: *Job Completed*".toUpperCase());
                }
                else {
                    messages.push(":x: *Job Failed*".toUpperCase());
                }
                messages.push(`Name: *${request.body.job.name}*`);
                messages.push(`Workflow: *${request.body.workflow.name}*`);
                messages.push(`Environment: *${deployEntity.env}*`);
                messages.push(`Service: *${deployEntity.service}*`);
                messages.push(`Service Slug: *${request.body.project.slug}*`);
                messages.push(`Branch: *${request.body.pipeline.vcs.branch}*`);
                messages.push(`Build Number: *${request.body.job.number}*`);
                messages.push(`Build Time: *${(0, dayjs_1.default)(request.body.job.stopped_at).unix() - (0, dayjs_1.default)(request.body.job.started_at).unix()} seconds*`);
                messages.push(`Commit: *${request.body.pipeline.vcs.revision}*`);
                messages.push(`Workflow URL: ${request.body.workflow.url}`);
                messages.push(`Triggered By: *${deployEntity.user.name}*`);
                messages.push(`Status: *${request.body.job.status}*`);
            }
            if (request.body.type === "workflow-completed") {
                status = entity_1.DeployStatus.completed;
                if (request.body.workflow.status === "success") {
                    messages.push(":white_check_mark: *Build Successfully Completed*".toUpperCase());
                }
                else {
                    messages.push(":x: Build Failed".toUpperCase());
                    status = request.body.workflow.status;
                }
                messages.push(`Workflow: *${request.body.workflow.name}*`);
                messages.push(`Environment: *${deployEntity.env}*`);
                messages.push(`Service: *${deployEntity.service}*`);
                messages.push(`Service Slug: *${request.body.project.slug}*`);
                messages.push(`Branch: *${request.body.pipeline.vcs.branch}*`);
                messages.push(`Build Time: *${(0, dayjs_1.default)(request.body.workflow.stopped_at).unix() - (0, dayjs_1.default)(request.body.workflow.created_at).unix()} seconds*`);
                messages.push(`Build Number: *${request.body.pipeline.number}*`);
                messages.push(`Commit: *${request.body.pipeline.vcs.revision}*`);
                messages.push(`Workflow URL: ${request.body.workflow.url}`);
                messages.push(`Triggered By: *${deployEntity.user.name}*`);
                messages.push(`Status: *${request.body.workflow.status}*`);
            }
            return {
                data: {
                    message: messages.join("\n"),
                    status,
                }
            };
        });
    }
}
exports.default = CircleCI;
//# sourceMappingURL=circle-ci.js.map