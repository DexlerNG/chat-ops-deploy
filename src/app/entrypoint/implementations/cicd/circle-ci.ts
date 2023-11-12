import {CICDProviderInterface} from "../../interface";
import {FunctionResponseDTO, RequestEntity} from "../../../../common/entities";
import {DeployEntity, DeployStatus} from "../../entity";
import * as circleciService from "../../../../services/circleci.service";
import {CICDProviderProcessCommandResponse, CICDProviderResolveWebhookResponse} from "../../dto";
import dayjs from "dayjs";

export default class CircleCI implements CICDProviderInterface{
    async processDeploymentCommand(deployEntity: DeployEntity): Promise<FunctionResponseDTO<CICDProviderProcessCommandResponse>> {
        const buildResponse = await circleciService.triggerBuildPipeline({
            branch: deployEntity.branch,
            service: deployEntity.service,
            parameters: {
                env: deployEntity.env
            }
        });

        if(buildResponse.error){
            const error = `:x: Error triggering build pipeline: ${buildResponse.error}:x:`;
            return {
                error,
                statusCode: 500
            }
        }


        return {
            data: {
                message: `:rotating_light: ${deployEntity.user.name} started a build process :rotating_light: \nService: *${deployEntity.service}* \nEnvironment: *${deployEntity.env}* \nBranch: *${deployEntity.branch}* \nCircleCI Build Number: *${buildResponse.data.number}*`,
                pipelineId: buildResponse.data.id,
                pipelineNumber: buildResponse.data.number
            }
        }
    }

    async getPipelineIdFromWebhook(request: RequestEntity): Promise<FunctionResponseDTO<string>> {
        return {
            data: request.body.pipeline.id
        }
    }

    async resolveWebhook(request: RequestEntity, deployEntity: DeployEntity): Promise<FunctionResponseDTO<CICDProviderResolveWebhookResponse>> {
        const messages: string[]  = []
        let status: DeployStatus = DeployStatus.processing;

        if (request.body.type === "job-completed") {
            if(request.body.job.status === "success") {
                messages.push(":white_check_mark: *Job Completed*".toUpperCase());
            } else {
                messages.push(":x: *Job Failed*".toUpperCase());
            }

            messages.push(`Name: *${request.body.job.name}*`);
            messages.push(`Workflow: *${request.body.workflow.name}*`);
            messages.push(`Environment: *${deployEntity.env}*`);
            messages.push(`Service: *${deployEntity.service}*`);
            messages.push(`Service Slug: *${request.body.project.slug}*`);
            messages.push(`Branch: *${request.body.pipeline.vcs.branch}*`)
            messages.push(`Build Number: *${request.body.job.number}*`);
            messages.push(`Build Time: *${dayjs(request.body.job.stopped_at).unix() - dayjs(request.body.job.started_at).unix()} seconds*`);

            messages.push(`Commit: *${request.body.pipeline.vcs.revision}*`)
            messages.push(`Workflow URL: *${request.body.workflow.url}*`);
            messages.push(`Triggered By: *${deployEntity.user.name}*`);
            messages.push(`Status: *${request.body.job.status}*`);
        }

        if(request.body.type === "workflow-completed"){
            status = DeployStatus.completed;
            if(request.body.workflow.status === "success") {
                messages.push(":white_check_mark: *Build Successfully Completed*".toUpperCase());
            } else {
                messages.push(":x: Build Failed".toUpperCase());
                status = request.body.workflow.status;
            }

            messages.push(`Workflow: *${request.body.workflow.name}*`);
            messages.push(`Environment: *${deployEntity.env}*`);
            messages.push(`Service: *${deployEntity.service}*`);
            messages.push(`Service Slug: *${request.body.project.slug}*`);
            messages.push(`Branch: *${request.body.pipeline.vcs.branch}*`)
            messages.push(`Build Time: *${dayjs(request.body.workflow.stopped_at).unix() - dayjs(request.body.workflow.created_at).unix()} seconds*`);
            messages.push(`Build Number: *${request.body.pipeline.number}*`);
            messages.push(`Commit: *${request.body.pipeline.vcs.revision}*`)
            messages.push(`Workflow URL: *${request.body.workflow.url}*`);
            messages.push(`Triggered By: *${deployEntity.user.name}*`);
            messages.push(`Status: *${request.body.workflow.status}*`);
        }

        return {
            data: {
                message: messages.join("\n"),
                status,
            }
        }
    }
}
