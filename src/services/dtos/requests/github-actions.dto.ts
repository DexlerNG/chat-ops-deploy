export interface TriggerWorkflowDispatchRequest {
    service: string
    branch: string
    workflowId: string
    inputs: Record<string, string>
}
