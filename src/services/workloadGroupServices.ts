import { WorkloadGroup, WorkloadGroupSearchParams, ResponsePayload } from '@/Types'
import http from '@/utils/http'

export interface CreateWorkloadGroupRequest {
  workload_group_name: string
}

export interface UpdateWorkloadGroupRequest {
  workload_group_name: string
}

const WorkloadGroupServices = {
  getAllWorkloadGroups: ( param?: WorkloadGroupSearchParams ): Promise<ResponsePayload<WorkloadGroup>> => {
    return http.get('/workload_group', {
      params: {
        search: param?.search,
        page: param?.page,
        limit: param?.limit,
        sort: param?.sort,
        order: param?.order,
      },
    })
  },

  createWorkloadGroup: (
    data: CreateWorkloadGroupRequest
  ): Promise<WorkloadGroup> => {
    return http.post('/workload_group/add', data)
  },

  updateWorkloadGroup: (
    workloadGroupId: number,
    data: UpdateWorkloadGroupRequest
  ): Promise<WorkloadGroup> => {
    return http.put(`/workload_group/update/${workloadGroupId}`, data)
  },

  deleteWorkloadGroup: (workloadGroupId: number): Promise<void> => {
    return http.delete(`/workload_group/delete/${workloadGroupId}`)
  },

  getWorkloadGroupById: (workloadGroupId: number): Promise<WorkloadGroup> => {
    return http.get(`/workload_group/${workloadGroupId}`)
  },
}

export default WorkloadGroupServices
