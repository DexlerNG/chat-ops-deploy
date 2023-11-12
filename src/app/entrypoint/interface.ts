import {FunctionResponseDTO, RequestEntity} from "../../common/entities";
import {
    ChatProviderProcessCommandResponse,
    CICDProviderProcessCommandResponse, CICDProviderResolveWebhookResponse,
    SendMessageParams
} from "./dto";
import {DeployEntity} from "./entity";


export interface ChatProviderInterface{
    processVerification(request: RequestEntity): Promise<FunctionResponseDTO<string>>
    processCommand(request: RequestEntity): Promise<FunctionResponseDTO<ChatProviderProcessCommandResponse>>
    processWebhook(request: RequestEntity): Promise<FunctionResponseDTO<string>>
    sendMessage(sendMessageParams: SendMessageParams, text: string): Promise<FunctionResponseDTO<string>>
}
export interface CICDProviderInterface{
    processDeploymentCommand(deployEntity: DeployEntity): Promise<FunctionResponseDTO<CICDProviderProcessCommandResponse>>
    getPipelineIdFromWebhook(request: RequestEntity): Promise<FunctionResponseDTO<string>>
    resolveWebhook(request: RequestEntity, deployEntity: DeployEntity): Promise<FunctionResponseDTO<CICDProviderResolveWebhookResponse>>
}
