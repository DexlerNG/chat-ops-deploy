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
const githubActionsService = __importStar(require("../../../../services/github-actions.service"));
const env_1 = __importDefault(require("../../../../common/env"));
const dayjs_1 = __importDefault(require("dayjs"));
class GithubActions {
    processDeploymentCommand(deployEntity) {
        return __awaiter(this, void 0, void 0, function* () {
            const buildResponse = yield githubActionsService.triggerWorkflowDispatch({
                branch: deployEntity.branch,
                service: deployEntity.service,
                workflowId: env_1.default.githubWorkflowId,
                inputs: {
                    env: deployEntity.env,
                    // service: deployEntity.service,
                    // branch: deployEntity.branch,
                    // triggered_by: deployEntity.user?.name || "unknown"
                }
            });
            if (buildResponse.error) {
                const error = `:x: Error triggering GitHub Actions workflow: ${buildResponse.error}:x:`;
                return {
                    error,
                    statusCode: 500
                };
            }
            return {
                data: {
                    message: `:rotating_light: ${deployEntity.user.name} started a build process :rotating_light: \nService: *${deployEntity.service}* \nEnvironment: *${deployEntity.env}* \nBranch: *${deployEntity.branch}* \nGitHub Workflow: *${env_1.default.githubWorkflowId}*`,
                    pipelineId: "",
                    pipelineNumber: ""
                }
            };
        });
    }
    getPipelineIdFromWebhook(request) {
        var _a, _b, _c, _d, _e, _f, _g, _h;
        return __awaiter(this, void 0, void 0, function* () {
            const runId = ((_b = (_a = request.body) === null || _a === void 0 ? void 0 : _a.workflow_run) === null || _b === void 0 ? void 0 : _b.id) || ((_d = (_c = request.body) === null || _c === void 0 ? void 0 : _c.workflow_job) === null || _d === void 0 ? void 0 : _d.run_id) || ((_f = (_e = request.body) === null || _e === void 0 ? void 0 : _e.workflow) === null || _f === void 0 ? void 0 : _f.id) || ((_h = (_g = request.body) === null || _g === void 0 ? void 0 : _g.deployment) === null || _h === void 0 ? void 0 : _h.id);
            return {
                data: String(runId || "")
            };
        });
    }
    resolveWebhook(request, deployEntity) {
        var _a, _b, _c, _d;
        return __awaiter(this, void 0, void 0, function* () {
            const messages = [];
            const workflowRun = (_a = request.body) === null || _a === void 0 ? void 0 : _a.workflow_run;
            const workflowJob = (_b = request.body) === null || _b === void 0 ? void 0 : _b.workflow_job;
            let status = entity_1.DeployStatus.processing;
            if (((_c = request.body) === null || _c === void 0 ? void 0 : _c.action) === "completed" && workflowJob) {
                if (workflowJob.conclusion === "success") {
                    messages.push(":white_check_mark: *Job Completed*".toUpperCase());
                }
                else {
                    messages.push(":x: *Job Failed*".toUpperCase());
                }
                messages.push(`Name: *${workflowJob.name}*`);
                messages.push(`Workflow: *${workflowJob.workflow_name || env_1.default.githubWorkflowId}*`);
                messages.push(`Environment: *${deployEntity.env}*`);
                messages.push(`Service: *${deployEntity.service}*`);
                messages.push(`Branch: *${workflowJob.head_branch}*`);
                messages.push(`Build Number: *${workflowJob.run_id}*`);
                messages.push(`Build Time: *${(0, dayjs_1.default)(workflowJob.completed_at).unix() - (0, dayjs_1.default)(workflowJob.started_at).unix()} seconds*`);
                messages.push(`Commit: *${workflowJob.head_sha}*`);
                messages.push(`Workflow URL: ${workflowJob.html_url}`);
                messages.push(`Triggered By: *${deployEntity.user.name}*`);
                messages.push(`Status: *${workflowJob.conclusion || workflowJob.status}*`);
            }
            if (((_d = request.body) === null || _d === void 0 ? void 0 : _d.action) === "completed" && workflowRun) {
                status = workflowRun.conclusion === "success" ? entity_1.DeployStatus.completed : entity_1.DeployStatus.failed;
                if (workflowRun.conclusion === "success") {
                    messages.push(":white_check_mark: *Build Successfully Completed*".toUpperCase());
                }
                else {
                    messages.push(":x: Build Failed".toUpperCase());
                }
                messages.push(`Workflow: *${workflowRun.name || env_1.default.githubWorkflowId}*`);
                messages.push(`Environment: *${deployEntity.env}*`);
                messages.push(`Service: *${deployEntity.service}*`);
                messages.push(`Branch: *${workflowRun.head_branch}*`);
                messages.push(`Build Time: *${(0, dayjs_1.default)(workflowRun.updated_at).unix() - (0, dayjs_1.default)(workflowRun.created_at).unix()} seconds*`);
                messages.push(`Build Number: *${workflowRun.run_number}*`);
                messages.push(`Commit: *${workflowRun.head_sha}*`);
                messages.push(`Workflow URL: ${workflowRun.html_url}`);
                messages.push(`Triggered By: *${deployEntity.user.name}*`);
                messages.push(`Status: *${workflowRun.conclusion || workflowRun.status}*`);
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
exports.default = GithubActions;
//# sourceMappingURL=github-actions.js.map