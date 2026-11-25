import Slack from "./chats/slack";
import CircleCI from "./cicd/circle-ci";
import Github from "./cicd/github";
import {ChatProviderInterface, CICDProviderInterface} from "../interface";


const chatProviderImplementationMap = {
    "slack": new Slack()
}

const CICDProviderImplementationMap = {
    "circleci": new CircleCI(),
    "github": new Github()
}



export default class DeployFactory {
    static getChatProviderImplementation(provider: string): ChatProviderInterface {
        return chatProviderImplementationMap[provider];
    }
    static getCICDProviderImplementation(provider: string): CICDProviderInterface {
        return CICDProviderImplementationMap[provider];
    }
}
