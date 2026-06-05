import axios from "axios";
import env from "../common/env";
import {FunctionResponseDTO} from "../common/entities";
import {resolveAxiosError} from "../common/utils/helpers";
import {TriggerWorkflowDispatchRequest} from "./dtos/requests/github-actions.dto";

const _axios = axios.create({
    baseURL: env.githubBaseURL,
    headers: {
        "Content-Type": "application/json",
        "Accept": "application/vnd.github+json",
        ...(env.githubToken ? {Authorization: `Bearer ${env.githubToken}`} : {})
    }
});

export const triggerWorkflowDispatch = async (payload: TriggerWorkflowDispatchRequest): Promise<FunctionResponseDTO<any>> => {
    try {
        await _axios.post(`/repos/${env.githubOwner}/${payload.service}/actions/workflows/${payload.workflowId}/dispatches`, {
            ref: payload.branch,
            inputs: payload.inputs
        });

        return {
            statusCode: 200,
            data: {
                id: `${payload.service}:${payload.workflowId}:${payload.branch}:${Date.now()}`,
                number: payload.branch,
                workflowId: payload.workflowId
            }
        }
    } catch (e: any) {
        const axiosError = resolveAxiosError(e);

        return {
            error: axiosError?.raw?.message || e.message,
            statusCode: 500,
            data: null
        }
    }
}
