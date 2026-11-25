import Github from "./github";
import {DeployStatus} from "../../entity";
import * as githubService from "../../../../services/github.service";

jest.mock("../../../../services/github.service");

const mockedGithubService = githubService as jest.Mocked<typeof githubService>;

const deployEntity: any = {
    releaseId: "Ev123",
    messageId: "1770000000.000001",
    branch: "feature/github-provider",
    service: "chat-ops-deploy",
    env: "production",
    user: {
        name: "Micheal"
    }
};

describe("Github CICD provider", () => {
    beforeEach(() => {
        jest.resetAllMocks();
    });

    it("triggers a workflow dispatch with the deploy branch and env input", async () => {
        mockedGithubService.triggerWorkflowDispatch.mockResolvedValue({
            data: {
                id: 123456,
                run_number: 42
            }
        });

        const response = await new Github().processDeploymentCommand(deployEntity);

        expect(mockedGithubService.triggerWorkflowDispatch).toHaveBeenCalledWith({
            branch: "feature/github-provider",
            service: "chat-ops-deploy",
            parameters: {
                release_id: "Ev123",
                requested_at: "1770000000.000001",
                env: "production"
            }
        });
        expect(response.error).toBeUndefined();
        expect(response.data.pipelineId).toBe("123456");
        expect(response.data.pipelineNumber).toBe("42");
        expect(response.data.message).toContain("GitHub Workflow Run Number: *42*");
    });

    it("returns a safe error when workflow dispatch fails", async () => {
        mockedGithubService.triggerWorkflowDispatch.mockResolvedValue({
            error: "Not Found",
            statusCode: 500
        });

        const response = await new Github().processDeploymentCommand(deployEntity);

        expect(response.statusCode).toBe(500);
        expect(response.error).toBe(":x: Error triggering GitHub workflow: Not Found:x:");
    });

    it("extracts the workflow run id from a webhook", async () => {
        const response = await new Github().getPipelineIdFromWebhook({
            body: {
                workflow_run: {
                    id: 98765
                }
            },
            headers: {},
            params: {},
            query: {}
        });

        expect(response.data).toBe("98765");
    });

    it("keeps an in-progress workflow as processing", async () => {
        const response = await new Github().resolveWebhook({
            body: {
                workflow_run: {
                    id: 98765,
                    name: "Deploy",
                    status: "in_progress",
                    run_number: 12,
                    head_branch: "main",
                    head_sha: "abc123",
                    html_url: "https://github.com/org/repo/actions/runs/98765",
                    repository: {
                        full_name: "org/chat-ops-deploy"
                    }
                }
            },
            headers: {},
            params: {},
            query: {}
        }, deployEntity);

        expect(response.data.status).toBe(DeployStatus.processing);
        expect(response.data.message).toContain("WORKFLOW IN_PROGRESS");
    });

    it("marks a successful workflow as completed", async () => {
        const response = await new Github().resolveWebhook({
            body: {
                workflow_run: {
                    id: 98765,
                    name: "Deploy",
                    status: "completed",
                    conclusion: "success",
                    run_number: 12,
                    head_branch: "main",
                    head_sha: "abc123",
                    html_url: "https://github.com/org/repo/actions/runs/98765",
                    repository: {
                        full_name: "org/chat-ops-deploy"
                    }
                }
            },
            headers: {},
            params: {},
            query: {}
        }, deployEntity);

        expect(response.data.status).toBe(DeployStatus.published);
        expect(response.data.message).toContain("BUILD SUCCESSFULLY COMPLETED");
    });

    it("marks a failed workflow as failed", async () => {
        const response = await new Github().resolveWebhook({
            body: {
                workflow_run: {
                    id: 98765,
                    name: "Deploy",
                    status: "completed",
                    conclusion: "failure",
                    run_number: 12,
                    head_branch: "main",
                    head_sha: "abc123",
                    html_url: "https://github.com/org/repo/actions/runs/98765",
                    repository: {
                        full_name: "org/chat-ops-deploy"
                    }
                }
            },
            headers: {},
            params: {},
            query: {}
        }, deployEntity);

        expect(response.data.status).toBe(DeployStatus.failed);
        expect(response.data.message).toContain("BUILD FAILED");
    });
});
