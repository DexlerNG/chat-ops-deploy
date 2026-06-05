"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const slack_1 = __importDefault(require("./chats/slack"));
const circle_ci_1 = __importDefault(require("./cicd/circle-ci"));
const github_actions_1 = __importDefault(require("./cicd/github-actions"));
const chatProviderImplementationMap = {
    "slack": new slack_1.default()
};
const CICDProviderImplementationMap = {
    "circleci": new circle_ci_1.default(),
    "github-actions": new github_actions_1.default(),
    "github": new github_actions_1.default()
};
class DeployFactory {
    static getChatProviderImplementation(provider) {
        return chatProviderImplementationMap[provider];
    }
    static getCICDProviderImplementation(provider) {
        return CICDProviderImplementationMap[provider];
    }
}
exports.default = DeployFactory;
//# sourceMappingURL=index.js.map