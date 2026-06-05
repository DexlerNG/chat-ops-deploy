import {CICDProviderInterface} from "../../interface";
import {FunctionResponseDTO, RequestEntity} from "../../../../common/entities";
import {DeployEntity, DeployStatus} from "../../entity";
import {CICDProviderProcessCommandResponse, CICDProviderResolveWebhookResponse} from "../../dto";
import * as githubActionsService from "../../../../services/github-actions.service";
import env from "../../../../common/env";
import dayjs from "dayjs";

export default class GithubActions implements CICDProviderInterface {
    async processDeploymentCommand(deployEntity: DeployEntity): Promise<FunctionResponseDTO<CICDProviderProcessCommandResponse>> {
        const buildResponse = await githubActionsService.triggerWorkflowDispatch({
            branch: deployEntity.branch,
            service: deployEntity.service,
            workflowId: env.githubWorkflowId,
            inputs: {
                env: deployEntity.env,
                // service: deployEntity.service,
                // branch: deployEntity.branch,
                // triggered_by: deployEntity.user?.name || "unknown"
            }
        });

        if (buildResponse.error) {
            const error = `:x: Error triggering GitHub Actions workflow: ${buildResponse.error}:x:`;
            return {
                error,
                statusCode: 500
            }
        }

        return {
            data: {
                message: `:rotating_light: ${deployEntity.user.name} started a build process :rotating_light: \nService: *${deployEntity.service}* \nEnvironment: *${deployEntity.env}* \nBranch: *${deployEntity.branch}* \nGitHub Workflow: *${env.githubWorkflowId}*`,
                pipelineId: "",
                pipelineNumber: ""
            }
        }
    }

    async getPipelineIdFromWebhook(request: RequestEntity): Promise<FunctionResponseDTO<string>> {
        const runId = request.body?.workflow_run?.id || request.body?.workflow_job?.run_id || request.body?.workflow?.id || request.body?.deployment?.id;

        return {
            data: String(runId || "")
        }
    }

    async resolveWebhook(request: RequestEntity, deployEntity: DeployEntity): Promise<FunctionResponseDTO<CICDProviderResolveWebhookResponse>> {
        const messages: string[] = [];
        const workflowRun = request.body?.workflow_run;
        const workflowJob = request.body?.workflow_job;
        let status: DeployStatus = DeployStatus.processing;

        if (request.body?.action === "completed" && workflowJob) {
            if (workflowJob.conclusion === "success") {
                messages.push(":white_check_mark: *Job Completed*".toUpperCase());
            } else {
                messages.push(":x: *Job Failed*".toUpperCase());
            }

            messages.push(`Name: *${workflowJob.name}*`);
            messages.push(`Workflow: *${workflowJob.workflow_name || env.githubWorkflowId}*`);
            messages.push(`Environment: *${deployEntity.env}*`);
            messages.push(`Service: *${deployEntity.service}*`);
            messages.push(`Branch: *${workflowJob.head_branch}*`);
            messages.push(`Build Number: *${workflowJob.run_id}*`);
            messages.push(`Build Time: *${dayjs(workflowJob.completed_at).unix() - dayjs(workflowJob.started_at).unix()} seconds*`);
            messages.push(`Commit: *${workflowJob.head_sha}*`);
            messages.push(`Workflow URL: ${workflowJob.html_url}`);
            messages.push(`Triggered By: *${deployEntity.user.name}*`);
            messages.push(`Status: *${workflowJob.conclusion || workflowJob.status}*`);
        }

        if (request.body?.action === "completed" && workflowRun) {
            status = workflowRun.conclusion === "success" ? DeployStatus.completed : DeployStatus.failed;

            if (workflowRun.conclusion === "success") {
                messages.push(":white_check_mark: *Build Successfully Completed*".toUpperCase());
            } else {
                messages.push(":x: Build Failed".toUpperCase());
            }

            messages.push(`Workflow: *${workflowRun.name || env.githubWorkflowId}*`);
            messages.push(`Environment: *${deployEntity.env}*`);
            messages.push(`Service: *${deployEntity.service}*`);
            messages.push(`Branch: *${workflowRun.head_branch}*`);
            messages.push(`Build Time: *${dayjs(workflowRun.updated_at).unix() - dayjs(workflowRun.created_at).unix()} seconds*`);
            messages.push(`Build Number: *${workflowRun.run_number}*`);
            messages.push(`Commit: *${workflowRun.head_sha}*`);
            messages.push(`Workflow URL: ${workflowRun.html_url}`);
            messages.push(`Triggered By: *${deployEntity.user.name}*`);
            messages.push(`Status: *${workflowRun.conclusion || workflowRun.status}*`);
        }

        return {
            data: {
                message: messages.join("\n"),
                status,
            }
        }
    }
}
