import {CICDProviderInterface} from "../../interface";
import {FunctionResponseDTO, RequestEntity} from "../../../../common/entities";
import {DeployEntity, DeployStatus} from "../../entity";
import * as githubService from "../../../../services/github.service";
import {CICDProviderProcessCommandResponse, CICDProviderResolveWebhookResponse} from "../../dto";
import dayjs from "dayjs";

export default class Github implements CICDProviderInterface{
    async processDeploymentCommand(deployEntity: DeployEntity): Promise<FunctionResponseDTO<CICDProviderProcessCommandResponse>> {
        const workflowRunResponse = await githubService.triggerWorkflowDispatch({
            branch: deployEntity.branch,
            service: deployEntity.service,
            parameters: {
                release_id: deployEntity.releaseId,
                requested_at: deployEntity.messageId,
                env: deployEntity.env
            }
        });

        if(workflowRunResponse.error){
            const error = `:x: Error triggering GitHub workflow: ${workflowRunResponse.error}:x:`;
            return {
                error,
                statusCode: 500
            }
        }

        return {
            data: {
                message: `:rotating_light: ${deployEntity.user.name} started a build process :rotating_light: \nService: *${deployEntity.service}* \nEnvironment: *${deployEntity.env}* \nBranch: *${deployEntity.branch}* \nGitHub Workflow Run Number: *${workflowRunResponse.data.run_number || workflowRunResponse.data.id}*`,
                pipelineId: String(workflowRunResponse.data.id),
                pipelineNumber: String(workflowRunResponse.data.run_number || workflowRunResponse.data.id)
            }
        }
    }

    async getPipelineIdFromWebhook(request: RequestEntity): Promise<FunctionResponseDTO<string>> {
        if (!request.body?.workflow_run?.id) {
            return {
                error: "workflow_run.id is required",
                statusCode: 400
            }
        }

        return {
            data: String(request.body.workflow_run.id)
        }
    }

    async resolveWebhook(request: RequestEntity, deployEntity: DeployEntity): Promise<FunctionResponseDTO<CICDProviderResolveWebhookResponse>> {
        const workflowRun = request.body.workflow_run;
        const messages: string[]  = []
        let status: DeployStatus = DeployStatus.processing;

        if (workflowRun.status === "completed") {
            if(workflowRun.conclusion === "success") {
                messages.push(":white_check_mark: *Build Successfully Completed*".toUpperCase());
                messages.push("Release candidate published. Awaiting protected merge and cluster verification.");
                status = DeployStatus.published;
            } else {
                messages.push(":x: Build Failed".toUpperCase());
                status = DeployStatus.failed;
            }
        } else {
            messages.push(`:hourglass_flowing_sand: *Workflow ${workflowRun.status || "processing"}*`.toUpperCase());
        }

        messages.push(`Workflow: *${workflowRun.name}*`);
        messages.push(`Environment: *${deployEntity.env}*`);
        messages.push(`Service: *${deployEntity.service}*`);
        messages.push(`Repository: *${workflowRun.repository?.full_name || request.body.repository?.full_name || deployEntity.service}*`);
        messages.push(`Branch: *${deployEntity.branch}*`);

        if (workflowRun.run_started_at && workflowRun.updated_at) {
            messages.push(`Build Time: *${dayjs(workflowRun.updated_at).unix() - dayjs(workflowRun.run_started_at).unix()} seconds*`);
        }

        messages.push(`Run Number: *${workflowRun.run_number || workflowRun.id}*`);
        messages.push(`Commit: *${deployEntity.sourceSha || workflowRun.head_sha}*`);
        messages.push(`Workflow URL: ${workflowRun.html_url}`);
        messages.push(`Triggered By: *${deployEntity.user.name}*`);
        messages.push(`Status: *${workflowRun.status}*`);

        if (workflowRun.conclusion) {
            messages.push(`Conclusion: *${workflowRun.conclusion}*`);
        }

        return {
            data: {
                message: messages.join("\n"),
                status,
            }
        }
    }
}
