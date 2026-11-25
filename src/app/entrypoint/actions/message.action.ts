import {
    ChatProviderMessageContent,
    ExecuteDeployCommandDTO,
} from "../dto";
import {FunctionResponseDTO} from "../../../common/entities";

export async function processMessage(chatProviderMessageContent: ChatProviderMessageContent): Promise<FunctionResponseDTO<ExecuteDeployCommandDTO>>{

    let deployParams: ExecuteDeployCommandDTO;

    const params: string[] = chatProviderMessageContent.content.trim().split(/\s+/);
    if (chatProviderMessageContent.content.toLowerCase().trim().startsWith("error")){
        return {
            data: {
                service: undefined,
                env: undefined,
                branch: undefined
            }
        }
    }
    if(params[0].toLowerCase() === "deploy" && params.length === 4){
        deployParams = {
            service: params?.[1],
            env: params?.[2],
            branch: params?.[3]
        };
    }

    if(params[0].toLowerCase() === "smoke" && (params.length === 2 || params.length === 3)){
        deployParams = {
            service: "payfonte-e2e",
            env: params?.[1],
            branch: params?.[2] ?? "master"
        };
    }


    if(!deployParams){
        return {
            // error: "Command Not Starting with 'deploy'",
            error: "Error: Invalid Command. Command should start with deploy/smoke",
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


    // Accept internal branch paths and reject ambiguous Git reference components.
    const branch = deployParams.branch;
    if (!/^[A-Za-z0-9_][A-Za-z0-9._/-]*$/.test(branch) || branch.includes("..") ||
        branch.endsWith(".") || branch.split("/").some(part => !part || part.startsWith(".") || part.endsWith(".lock"))) {
        return {error: "Invalid internal branch name", statusCode: 422};
    }

    // Only operator-registered service/target pairs are eligible, including named frontend slots.
    const registry = JSON.parse(process.env.SLACK_RELEASE_TARGETS_JSON || "{}");
    const targets = Object.prototype.hasOwnProperty.call(registry, deployParams.service) && registry[deployParams.service];
    if (!Array.isArray(targets) || !targets.includes(deployParams.env)) {
        return {error: "Unregistered deployment service or target", statusCode: 403};
    }
    return {
        data: deployParams,
        statusCode: 200
    }
}
