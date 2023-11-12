
export enum DeployStatus {
    processing = "processing",
    failed = "failed",
    completed = "completed"
}


export class DeployEntity{
    id?: string;
    chatProvider: string
    repoProvider: string
    CICDProvider: string
    channel?: string;
    command: string;
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
