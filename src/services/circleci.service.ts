import env from "../common/env";
import axios from "axios";
import logger from "../common/logger";
import {TriggerBuildPipelineRequest} from "./dtos/requests/circleci.dto";
import {FunctionResponseDTO} from "../common/entities";
import {resolveAxiosError} from "../common/utils/helpers";

const _axios = axios.create({
    baseURL: env.circleciBaseURL,
    headers: {
        'Content-Type': 'application/json',
        'Circle-Token': env.circleciToken
    }
});

/**
 * https://circleci.com/docs/api/v2/index.html#operation/triggerPipeline
 * @param payload
 */
export const triggerBuildPipeline = async (payload: TriggerBuildPipelineRequest): Promise<FunctionResponseDTO<any>> => {
    try{
        const response = await _axios.post(`/api/v2/project/github/${env.circleciOrg}/${payload.service}/pipeline`, {
            branch: payload.branch,
            parameters: payload.parameters
        });

        console.log("Response", response.data);
        return {
            statusCode: 200,
            data: response.data
        }
    }catch (e){
        console.log('error triggering build pipeline', e);

        const axiosError  = resolveAxiosError(e)

        return {
            error: axiosError?.raw?.message || e.message,
            statusCode: 500,
            data: null
        }
    }
}

export const getProjects = async (): Promise<FunctionResponseDTO<any>> => {
    try{
        const response = await _axios.get(`/api/v1.1/projects`);
        return {
            statusCode: 200,
            data: response.data
        }
    }catch (e){
        console.log('error getting projects', e);

        const axiosError  = resolveAxiosError(e)

        return {
            error: e.message,
            statusCode: 500,
            data: null
        }
    }
};

/**
 * https://circleci.com/docs/api/v2/index.html#operation/getProjectBySlug
 * @param project
 */
export const getProjectByName = async (project: string): Promise<FunctionResponseDTO<any>> => {
    try{
        const response = await _axios.get(`/api/v2/project/${project}`);
        return {
            statusCode: 200,
            data: response.data
        }
    }catch (e){
        console.log('error getting project', e);

        const axiosError  = resolveAxiosError(e)


        return {
            error: e.message,
            statusCode: 500,
            data: null
        }
    }
};


/**
 * https://circleci.com/docs/api/v2/index.html#operation/getWebhooks
 * @param projectId
 */
export const getWebhooks = async (projectId: string): Promise<FunctionResponseDTO<any>> => {
    try{
        const response = await _axios.get(`/api/v2/webhook`, {
            params: {
                "scope-id": projectId,
                "scope-type": "project"
            }
        });
        return {
            statusCode: 200,
            data: response.data.items
        }
    }catch (e){
        console.log('error getting webhooks', e);

        const axiosError  = resolveAxiosError(e)

        return {
            error: e.message,
            statusCode: 500,
            data: null
        }
    }
};

/**
 * https://circleci.com/docs/api/v2/index.html#operation/createWebhook
 * @param payload
 */
export const createWebhook = async (payload: any): Promise<FunctionResponseDTO<any>> => {
    try{
        const response = await _axios.post(`/api/v2/webhook`, payload);
        return {
            statusCode: 200,
            data: response.data
        }
    }catch (e){
        console.log('error creating webhook', e);

        const axiosError  = resolveAxiosError(e)

        return {
            error: e.message,
            statusCode: 500,
            data: null
        }
    }
};
