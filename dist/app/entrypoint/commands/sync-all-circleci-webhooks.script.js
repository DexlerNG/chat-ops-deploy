#!/usr/bin/env node
"use strict";
//ts-node src/app/entrypoint/commands/sync-all-circleci-webhooks.script.ts --webhook=https://deploy.6thbridge.com/v1/process-webhook/circleci
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
const yargs_1 = __importDefault(require("yargs"));
const helpers_1 = require("yargs/helpers");
const circleciService = __importStar(require("../../../services/circleci.service"));
const env_1 = __importDefault(require("../../../common/env"));
const argv = (0, yargs_1.default)((0, helpers_1.hideBin)(process.argv)).argv;
const execute = () => __awaiter(void 0, void 0, void 0, function* () {
    if (!argv.webhook)
        throw new Error("Webhook is required");
    //get all projects
    const projectsResponse = yield circleciService.getProjects();
    // console.log("project response", projectsResponse);
    if (projectsResponse.error)
        throw new Error(projectsResponse.error);
    for (let project of projectsResponse.data) {
        console.log("project.username !== env.circleciOrg", project.username, env_1.default.circleciOrg);
        if (project.username !== env_1.default.circleciOrg)
            continue;
        yield processWebhook(project, argv);
    }
    process.exit(0);
});
function processWebhook(project, argv) {
    return __awaiter(this, void 0, void 0, function* () {
        const vcsSlug = `${project.vcs_type}/${project.username}/${project.reponame}`;
        const projectResponse = yield circleciService.getProjectByName(vcsSlug);
        console.log("projectResponse", projectResponse);
        if (projectResponse.error)
            throw new Error(projectResponse.error);
        const webhookResponse = yield circleciService.getWebhooks(projectResponse.data.id);
        console.log("webhookResponse", webhookResponse);
        if (webhookResponse.error)
            throw new Error(webhookResponse.error);
        const isWebhookPresent = webhookResponse.data.find((webhook) => webhook.url === argv.webhook);
        if (isWebhookPresent) {
            console.log("Webhook already present");
            return;
        }
        const createWebhookResponse = yield circleciService.createWebhook({
            name: "6thbridge Webhook",
            url: argv.webhook,
            events: ["workflow-completed", "job-completed"],
            "verify-tls": false,
            "signing-secret": "",
            "scope": {
                "type": "project",
                "id": projectResponse.data.id,
            }
        });
        console.log("createWebhookResponse", createWebhookResponse);
    });
}
execute();
//# sourceMappingURL=sync-all-circleci-webhooks.script.js.map