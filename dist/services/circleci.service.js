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
exports.deleteSSHKey = exports.createSSHKey = exports.getSSHDigests = exports.deleteWebhook = exports.createWebhook = exports.getWebhooks = exports.getProjectByName = exports.getProjects = exports.triggerBuildPipeline = void 0;
const env_1 = __importDefault(require("../common/env"));
const axios_1 = __importDefault(require("axios"));
const helpers_1 = require("../common/utils/helpers");
const _axios = axios_1.default.create({
    baseURL: env_1.default.circleciBaseURL,
    headers: {
        'Content-Type': 'application/json',
        'Circle-Token': env_1.default.circleciToken
    }
});
/**
 * https://circleci.com/docs/api/v2/index.html#operation/triggerPipeline
 * @param payload
 */
const triggerBuildPipeline = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const response = yield _axios.post(`/api/v2/project/github/${env_1.default.circleciOrg}/${payload.service}/pipeline`, {
            branch: payload.branch,
            parameters: payload.parameters
        });
        console.log("Response", response.data);
        return {
            statusCode: 200,
            data: response.data
        };
    }
    catch (e) {
        console.log('error triggering build pipeline', e);
        const axiosError = (0, helpers_1.resolveAxiosError)(e);
        return {
            error: ((_a = axiosError === null || axiosError === void 0 ? void 0 : axiosError.raw) === null || _a === void 0 ? void 0 : _a.message) || e.message,
            statusCode: 500,
            data: null
        };
    }
});
exports.triggerBuildPipeline = triggerBuildPipeline;
const getProjects = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const response = yield _axios.get(`/api/v1.1/projects`);
        return {
            statusCode: 200,
            data: response.data
        };
    }
    catch (e) {
        console.log('error getting projects', e);
        const axiosError = (0, helpers_1.resolveAxiosError)(e);
        return {
            error: e.message,
            statusCode: 500,
            data: null
        };
    }
});
exports.getProjects = getProjects;
/**
 * https://circleci.com/docs/api/v2/index.html#operation/getProjectBySlug
 * @param project
 */
const getProjectByName = (project) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const response = yield _axios.get(`/api/v2/project/${project}`);
        return {
            statusCode: 200,
            data: response.data
        };
    }
    catch (e) {
        console.log('error getting project', e);
        const axiosError = (0, helpers_1.resolveAxiosError)(e);
        return {
            error: e.message,
            statusCode: 500,
            data: null
        };
    }
});
exports.getProjectByName = getProjectByName;
/**
 * https://circleci.com/docs/api/v2/index.html#operation/getWebhooks
 * @param projectId
 */
const getWebhooks = (projectId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const response = yield _axios.get(`/api/v2/webhook`, {
            params: {
                "scope-id": projectId,
                "scope-type": "project"
            }
        });
        return {
            statusCode: 200,
            data: response.data.items
        };
    }
    catch (e) {
        console.log('error getting webhooks', e);
        const axiosError = (0, helpers_1.resolveAxiosError)(e);
        return {
            error: e.message,
            statusCode: 500,
            data: null
        };
    }
});
exports.getWebhooks = getWebhooks;
/**
 * https://circleci.com/docs/api/v2/index.html#operation/createWebhook
 * @param payload
 */
const createWebhook = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const response = yield _axios.post(`/api/v2/webhook`, payload);
        return {
            statusCode: 200,
            data: response.data
        };
    }
    catch (e) {
        console.log('error creating webhook', e);
        const axiosError = (0, helpers_1.resolveAxiosError)(e);
        return {
            error: e.message,
            statusCode: 500,
            data: null
        };
    }
});
exports.createWebhook = createWebhook;
/**
 * https://circleci.com/docs/api/v2/index.html#operation/deleteWebhook
 * @param webhookId
 */
const deleteWebhook = (webhookId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const response = yield _axios.delete(`/api/v2/webhook/${webhookId}`);
        return {
            statusCode: 200,
            data: response.data
        };
    }
    catch (e) {
        console.log('error creating webhook', e);
        const axiosError = (0, helpers_1.resolveAxiosError)(e);
        return {
            error: e.message,
            statusCode: 500,
            data: null
        };
    }
});
exports.deleteWebhook = deleteWebhook;
const getSSHDigests = (projectId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const response = yield _axios.get(`/api/v1.1/project/${projectId}/settings?ssh-key-digest=sha256`);
        return {
            statusCode: 200,
            data: response.data
        };
    }
    catch (e) {
        console.log('error getting ssh', e);
        const axiosError = (0, helpers_1.resolveAxiosError)(e);
        return {
            error: e.message,
            statusCode: 500,
            data: null
        };
    }
});
exports.getSSHDigests = getSSHDigests;
const createSSHKey = (projectId, payload) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const response = yield _axios.post(`/api/v1.1/project/${projectId}/ssh-key`, payload);
        return {
            statusCode: 200,
            data: response.data
        };
    }
    catch (e) {
        console.log('error creating SSHKey', e);
        const axiosError = (0, helpers_1.resolveAxiosError)(e);
        return {
            error: e.message,
            statusCode: 500,
            data: null
        };
    }
});
exports.createSSHKey = createSSHKey;
const deleteSSHKey = (projectId, payload) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log("p", payload);
        const response = yield _axios.delete(`/api/v1.1/project/${projectId}/ssh-key`, {
            data: payload
        });
        return {
            statusCode: 200,
            data: response.data
        };
    }
    catch (e) {
        console.log('error creating SSHKey', e);
        const axiosError = (0, helpers_1.resolveAxiosError)(e);
        return {
            error: e.message,
            statusCode: 500,
            data: null
        };
    }
});
exports.deleteSSHKey = deleteSSHKey;
//# sourceMappingURL=circleci.service.js.map