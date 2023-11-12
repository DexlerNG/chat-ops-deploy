import Slack from "./chats/slack";
import {DeployInterface} from "../entity";


const implementationMap = {
    "slack": new Slack()
}



export default class DeployFactory {
    static getImplementation(provider: string): DeployInterface {
        return implementationMap[provider];
    }
}
