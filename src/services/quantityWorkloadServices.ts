import { QuantityWorkload, QuantityWorkloadSearchParams, ResponsePayload } from '@/Types'
import http from '@/utils/http'

export interface CreateQuantityWorkloadRequest {
  quantity_workload_hours: number
  workload_group_id: number
  task_id: number
}

export interface UpdateQuantityWorkloadRequest {
  quantity_workload_hours: number
  workload_group_id: number
  task_id: number
}

const QuantityWorkloadServices = {
  getAllQuantityWorkloads: (param?: QuantityWorkloadSearchParams): Promise<ResponsePayload<QuantityWorkload>> => {
    return http.get('/quantity-workload', {
      params: {
        search: param?.search,
        page: param?.page,
        limit: param?.limit,
        sort: param?.sort,
        order: param?.order,
      },
    })
  },

  createQuantityWorkload: (
    data: CreateQuantityWorkloadRequest
  ): Promise<QuantityWorkload> => {
    return http.post('/quantity-workload/add', data)
  },

  updateQuantityWorkload: (
    quantityWorkloadId: number,
    data: UpdateQuantityWorkloadRequest
  ): Promise<QuantityWorkload> => {
    return http.put(`/quantity-workload/update/${quantityWorkloadId}`, data)
  },

  deleteQuantityWorkload: (quantityWorkloadId: number): Promise<void> => {
    return http.delete(`/quantity-workload/delete/${quantityWorkloadId}`)
  },

  getQuantityWorkloadById: (quantityWorkloadId: number): Promise<QuantityWorkload> => {
    return http.get(`/quantity-workload/${quantityWorkloadId}`)
  },

  getQuantityWorkloadByGroupId: (workloadGroupId: number): Promise<ResponsePayload<QuantityWorkload>> => {
    return http.get(`/quantity-workload/group/${workloadGroupId}`)
  },
}

export default QuantityWorkloadServices
