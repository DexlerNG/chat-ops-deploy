## GitHub Actions integration notes

- Set `DEFAULT_CICD_PROVIDER=github-actions` to use the new provider by default.
- Add `GITHUB_TOKEN`, `GITHUB_OWNER`, and optionally `GITHUB_WORKFLOW_ID` in `.env`.
- The provider dispatches workflows with the GitHub REST API endpoint `POST /repos/{owner}/{repo}/actions/workflows/{workflow_id}/dispatches`.
- Configure a GitHub webhook to send `workflow_run` and optionally `workflow_job` events to `https://<your-host>/v1/process-webhook/github-actions`.
- Ensure the workflow file supports `workflow_dispatch` inputs for at least `env`, `service`, `branch`, and `triggered_by` if you want to use the passed parameters directly.

## References used

- GitHub REST API: Create a workflow dispatch event: `https://docs.github.com/en/rest/actions/workflows#create-a-workflow-dispatch-event`
- GitHub webhook events and payloads: `https://docs.github.com/en/webhooks/webhook-events-and-payloads`
- GitHub webhook for workflow runs: `https://docs.github.com/en/webhooks/webhook-events-and-payloads#workflow_run`
- GitHub webhook for workflow jobs: `https://docs.github.com/en/webhooks/webhook-events-and-payloads#workflow_job`