import {FunctionResponseDTO, RequestEntity} from "../../common/entities";


export interface DeployInterface{
    processVerification(request: RequestEntity): Promise<FunctionResponseDTO<string>>
    processCommand(request: RequestEntity): Promise<FunctionResponseDTO<string>>
}
export enum DeployStatus {
    processing = "processing",
    failed = "failed",
    completed = "completed"
}


export class DeployEntity{
    id?: string;
    chatProvider: string
    repoProvider: string
    channel?: string;
    text: string;
    service: string;
    env: string;
    branch: string;
    threadId: string;
    pipelineId: string
    pipelineNumber: string
    user: any;
    status: DeployStatus;


    [x:string]: any
}
