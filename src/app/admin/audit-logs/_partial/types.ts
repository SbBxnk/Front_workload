export interface AuditLog {
    log_id?: number
    created_at: string
    u_fname?: string
    u_lname?: string
    prefix_name?: string
    method: 'GET' | 'POST' | 'PUT' | 'DELETE'
    endpoint: string
    ip_address?: string
    action?: string
    payload?: string
}

export interface AuditLogParams {
    search: string
    page: number
    limit: number
    method: string
}
