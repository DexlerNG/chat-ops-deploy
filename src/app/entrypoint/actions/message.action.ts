import {
    ChatProviderMessageContent,
    ExecuteDeployCommandDTO,
} from "../dto";
import {FunctionResponseDTO} from "../../../common/entities";

export async function processMessage(chatProviderMessageContent: ChatProviderMessageContent): Promise<FunctionResponseDTO<ExecuteDeployCommandDTO>>{

    let deployParams: ExecuteDeployCommandDTO;

    const params: string[] = chatProviderMessageContent.content.split(" ");
    if(chatProviderMessageContent.content.toLowerCase().trim().startsWith("deploy")){
        deployParams = {
            service: params?.[1],
            env: params?.[2],
            branch: params?.[3]
        };
    }

    if(chatProviderMessageContent.content.toLowerCase().trim().startsWith("smoke")){
        deployParams = {
            service: "payfonte-e2e",
            env: params?.[1],
            branch: params?.[2] ?? "master"
        };
    }


    if(!deployParams){
        return {
            // error: "Command Not Starting with 'deploy'",
            error: "Invalid Command",
            statusCode: 200 //we are returning 200 because we don't want to send an error message back to slack as they will keep on retrying
        }
    }


    if (!deployParams.service) {
        return {
            error: ":x: Service is a required parameter",
            statusCode: 200
        }
    }

    if (!deployParams.env) {
        return {
            error: ":x: Deployment Environment is a required parameter",
            statusCode: 200
        }
    }


    if (!deployParams.branch) {
        return {
            error: ":x: Git Branch is a required parameter",
            statusCode: 200
        }
    }


    return {
        data: deployParams,
        statusCode: 200
    }
}
