"use strict";
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
exports.triggerWorkflowDispatch = void 0;
const axios_1 = __importDefault(require("axios"));
const env_1 = __importDefault(require("../common/env"));
const helpers_1 = require("../common/utils/helpers");
const _axios = axios_1.default.create({
    baseURL: env_1.default.githubBaseURL,
    headers: Object.assign({ "Content-Type": "application/json", "Accept": "application/vnd.github+json" }, (env_1.default.githubToken ? { Authorization: `Bearer ${env_1.default.githubToken}` } : {}))
});
const triggerWorkflowDispatch = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        console.log("payload", JSON.stringify({ payload, owner: env_1.default.githubOwner, repo: payload.service, workflowId: payload.workflowId, ref: payload.branch, inputs: payload.inputs }));
        yield _axios.post(`/repos/${env_1.default.githubOwner}/${payload.service}/actions/workflows/${payload.workflowId}/dispatches`, {
            ref: payload.branch,
            inputs: payload.inputs
        });
        return {
            statusCode: 200,
            data: {
                id: `${payload.service}:${payload.workflowId}:${payload.branch}:${Date.now()}`,
                number: payload.branch,
                workflowId: payload.workflowId
            }
        };
    }
    catch (e) {
        const axiosError = (0, helpers_1.resolveAxiosError)(e);
        return {
            error: ((_a = axiosError === null || axiosError === void 0 ? void 0 : axiosError.raw) === null || _a === void 0 ? void 0 : _a.message) || e.message,
            statusCode: 500,
            data: null
        };
    }
});
exports.triggerWorkflowDispatch = triggerWorkflowDispatch;
//# sourceMappingURL=github-actions.service.js.map