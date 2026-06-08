import http from '@/utils/http'

export const AuditLogServices = {
  getAllLogs: (
    params: {
      page?: number
      limit?: number
      search?: string
      method?: string
    } = {}
  ): Promise<any> => {
    return http.get('/audit-logs', { params })
  },

  getLogById: (id: number): Promise<any> => {
    return http.get(`/audit-logs/${id}`)
  },
}
