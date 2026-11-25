import {FunctionResponseDTO, RequestEntity} from "../../../common/entities";
import env from "../../../common/env";
import {getDeliveryJobs} from "../../../services/github.service";
import {chatPostMessage} from "../../../services/slack.service";

export async function reportGitHubDelivery(request: RequestEntity): Promise<FunctionResponseDTO<unknown> | undefined> {
    const {workflow_run: run, repository: repo, action} = request.body;
    if (!run || ![".github/workflows/release.yml", ".github/workflows/release-build.yml"].includes(run.path)) return;
    if (repo?.owner?.login !== env.githubOwner || !(process.env.PR_DELIVERY_SERVICES || "").split(",").includes(repo.name))
        return {data:"ignored", statusCode:200};
    if (action !== "completed" || !Number.isSafeInteger(run.id) || !Number.isSafeInteger(run.run_attempt))
        return {data:"ignored", statusCode:200};

    let message: string;
    if (run.path === ".github/workflows/release-build.yml") {
        if (run.conclusion !== "failure" || run.head_repository?.id !== repo.id) return {data:"ignored",statusCode:200};
        message = "Application build failed.";
    } else {
        if (run.event !== "workflow_run" || run.head_branch !== repo.default_branch) return {data:"ignored",statusCode:200};
        const jobs = await getDeliveryJobs(repo.name, run.id, run.run_attempt);
        const results: string[] = [];
        for (const job of jobs) {
            const leg = /(?:^| \/ )Verify (staging|sandbox|production|preview-[a-z0-9-]+) ([0-9a-f]{40})$/.exec(job.name);
            if (leg && job.conclusion !== "skipped") results.push(`${leg[1]} · ${leg[2].slice(0, 12)} · ${job.conclusion === "success" ? "healthy" : job.conclusion}`);
        }
        if (run.conclusion === "failure") results.push("Delivery failed. See the run for the failed step.");
        if (!results.length) return {data:"ignored",statusCode:200};
        message = results.join("\n");
    }
    return chatPostMessage({
        channel: env.slackDeployChannel,
        text: `<https://github.com/${env.githubOwner}/${repo.name}/actions/runs/${run.id}|${repo.name} release>\n${message}`,
        unfurl_links: false,
    });
}
