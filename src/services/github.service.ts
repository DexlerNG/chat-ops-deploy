import env from "../common/env";
import axios from "axios";
import {TriggerGithubWorkflowDispatchRequest} from "./dtos/requests/github.dto";
import {FunctionResponseDTO} from "../common/entities";
import deployRepository from "../app/entrypoint/repository";


const _axios = axios.create({
    baseURL: env.githubBaseURL,
    headers: {
        "Accept": "application/vnd.github+json",
        "Authorization": `Bearer ${env.githubToken}`,
        "Content-Type": "application/json",
        "X-GitHub-Api-Version": env.githubApiVersion
    }
});

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const encodePathSegment = (value: string) => encodeURIComponent(value);

const encodeGitRef = (branch: string) => branch
    .split("/")
    .map(encodePathSegment)
    .join("/");

const getBranchHeadSha = async (service: string, branch: string): Promise<string> => {
    const response = await _axios.get(`/repos/${encodePathSegment(env.githubOwner)}/${encodePathSegment(service)}/git/ref/heads/${encodeGitRef(branch)}`);
    return response.data?.object?.sha;
};

const getReleaseRun = async (path: string, branch: string, releaseId: string) => {
    for (let attempt = 0; attempt < 8; attempt++) {
        if (attempt) await sleep(1500);
        const {data} = await _axios.get(path + "/runs", {params: {branch, event: "workflow_dispatch", per_page: 100}});
        const run = data.workflow_runs.find(item => item.display_title === "Slack release " + releaseId);
        if (run) return run;
    }
    return null;
};

/**
 * https://docs.github.com/en/rest/actions/workflows#create-a-workflow-dispatch-event
 * @param payload
 */
export const triggerWorkflowDispatch = async (payload: TriggerGithubWorkflowDispatchRequest): Promise<FunctionResponseDTO<any>> => {
    try{
        if (!env.githubOwner) {
            return {
                error: "GITHUB_OWNER is required",
                statusCode: 500,
                data: null
            }
        }

        if (!env.githubToken) {
            return {
                error: "GITHUB_TOKEN is required",
                statusCode: 500,
                data: null
            }
        }

        if (!env.githubWorkflowId) {
            return {
                error: "GITHUB_WORKFLOW_ID is required",
                statusCode: 500,
                data: null
            }
        }

        const releaseId = payload.parameters.release_id;
        if (!/^Ev[A-Za-z0-9]+$/.test(releaseId || "")) return {error: "A verified Slack release ID is required", statusCode: 403};
        const repoPath = "/repos/" + encodePathSegment(env.githubOwner) + "/" + encodePathSegment(payload.service);
        const {data: repo} = await _axios.get(repoPath);
        const {data: branch} = await _axios.get(repoPath + "/branches/" + encodeURIComponent(repo.default_branch));
        if (!branch.protected) return {error: "Release workflow requires a protected default branch", statusCode: 403};
        const headSha = await getBranchHeadSha(payload.service, payload.branch);
        if (!/^[0-9a-f]{40}$/.test(headSha || "")) return {error: "Unable to resolve source commit", statusCode: 422};
        const audit = await deployRepository.findOneAndUpdate({releaseId, service: payload.service}, {sourceSha: headSha});
        if (!audit) return {error: "Missing release audit record", statusCode: 500};
        const workflowPath = repoPath + "/actions/workflows/" + encodePathSegment(env.githubWorkflowId);
        const response = await _axios.post(workflowPath + "/dispatches", {
            ref: repo.default_branch,
            inputs: {...payload.parameters, source_sha: headSha},
        });
        const workflowRun = response.data?.workflow_run_id
            ? {id: response.data.workflow_run_id}
            : await getReleaseRun(workflowPath, repo.default_branch, releaseId);

        if (!workflowRun?.id) {
            return {
                error: "Workflow dispatch triggered, but no matching workflow run was found",
                statusCode: 500,
                data: null
            }
        }

        return {
            statusCode: 200,
            data: workflowRun
        }
    }catch (e){
        const status = axios.isAxiosError(e) ? e.response?.status : undefined;
        console.error("GitHub release dispatch failed", {status});
        return {error: "GitHub release dispatch failed", statusCode: status || 502};
    }
};
