#!/usr/bin/env node
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
//ts-node src/app/entrypoint/commands/delete-circle-ci-ssh-key.script.ts --project=user-service --sshKey="privateKeyHere"
const yargs_1 = __importDefault(require("yargs"));
const helpers_1 = require("yargs/helpers");
const circleciService = __importStar(require("../../../services/circleci.service"));
const env_1 = __importDefault(require("../../../common/env"));
const argv = (0, yargs_1.default)((0, helpers_1.hideBin)(process.argv)).argv;
const execute = () => __awaiter(void 0, void 0, void 0, function* () {
    if (!argv.project)
        throw new Error("Project is required");
    if (!argv.fingerprint)
        throw new Error("Fingerprint is required");
    //get all projects
    const projectsResponse = yield circleciService.getProjects();
    // console.log("project response", projectsResponse);
    if (projectsResponse.error)
        throw new Error(projectsResponse.error);
    for (let project of projectsResponse.data) {
        if (project.reponame !== argv.project)
            continue;
        if (project.username !== env_1.default.circleciOrg)
            continue;
        yield processSSHKey(project, argv);
    }
    process.exit(0);
});
function processSSHKey(project, argv) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        const vcsSlug = `${project.vcs_type}/${project.username}/${project.reponame}`;
        const projectResponse = yield circleciService.getProjectByName(vcsSlug);
        console.log("projectResponse", (_a = projectResponse.data) === null || _a === void 0 ? void 0 : _a.length);
        if (projectResponse.error)
            throw new Error(projectResponse.error);
        const createSSHKeyResponse = yield circleciService.deleteSSHKey(vcsSlug, {
            hostname: argv.host || null,
            fingerprint: argv.fingerprint
        });
        console.log("sshKeyResponse", createSSHKeyResponse);
    });
}
execute();
//# sourceMappingURL=delete-circle-ci-ssh-key.script.js.map