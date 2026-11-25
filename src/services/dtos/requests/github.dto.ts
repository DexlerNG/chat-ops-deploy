export interface TriggerGithubWorkflowDispatchRequest {
    service: string
    branch: string
    parameters: Record<string, any>
}
