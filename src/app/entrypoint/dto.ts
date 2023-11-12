import {DeployEntity, DeployStatus} from "./entity";
export class ExecuteDeployCommandDTO{
    service: string
    env: string
    branch: string
}

export class SendMessageParams {
    channel: string
    threadId: string
    messageId: string
}


export class ChatProviderProcessCommandResponse {
    command: string
    user: {
        name: string
        id: string
    }
    deployParams: ExecuteDeployCommandDTO
    messageParams: SendMessageParams
}


export class CICDProviderProcessCommandResponse {
    pipelineId: string
    pipelineNumber: string
    message: string
}

export class CICDProviderResolveWebhookResponse {
    message: string
    status: DeployStatus
}
