import { WorkloadGroup, WorkloadGroupSearchParams, ResponsePayload } from '@/Types'
import http from '@/utils/http'

export interface CreateWorkloadGroupRequest {
  workload_group_name: string
}

export interface UpdateWorkloadGroupRequest {
  workload_group_name: string
}

const WorkloadGroupServices = {
  getAllWorkloadGroups: ( accessToken: string, param: WorkloadGroupSearchParams ): Promise<ResponsePayload<WorkloadGroup>> => {
    return http.get('/workload_group', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      params: {
        search: param.search,
        page: param.page,
        limit: param.limit,
        sort: param.sort,
        order: param.order,
      },
    })
  },

  createWorkloadGroup: (
    data: CreateWorkloadGroupRequest,
    accessToken: string
  ): Promise<WorkloadGroup> => {
    return http.post('/workload_group/add', data, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
  },

  updateWorkloadGroup: (
    workloadGroupId: number,
    data: UpdateWorkloadGroupRequest,
    accessToken: string
  ): Promise<WorkloadGroup> => {
    return http.put(`/workload_group/update/${workloadGroupId}`, data, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
  },

  deleteWorkloadGroup: (workloadGroupId: number, accessToken: string): Promise<void> => {
    return http.delete(`/workload_group/delete/${workloadGroupId}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
  },

  getWorkloadGroupById: (workloadGroupId: number, accessToken: string): Promise<WorkloadGroup> => {
    return http.get(`/workload_group/${workloadGroupId}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
  },
}

export default WorkloadGroupServices
