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
  getAllQuantityWorkloads: ( accessToken: string, param?: QuantityWorkloadSearchParams ): Promise<ResponsePayload<QuantityWorkload>> => {
    return http.get('/quantity-workload', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
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
    data: CreateQuantityWorkloadRequest,
    accessToken: string
  ): Promise<QuantityWorkload> => {
    return http.post('/quantity-workload/add', data, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
  },

  updateQuantityWorkload: (
    quantityWorkloadId: number,
    data: UpdateQuantityWorkloadRequest,
    accessToken: string
  ): Promise<QuantityWorkload> => {
    return http.put(`/quantity-workload/update/${quantityWorkloadId}`, data, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
  },

  deleteQuantityWorkload: (quantityWorkloadId: number, accessToken: string): Promise<void> => {
    return http.delete(`/quantity-workload/delete/${quantityWorkloadId}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
  },

  getQuantityWorkloadById: (quantityWorkloadId: number, accessToken: string): Promise<QuantityWorkload> => {
    return http.get(`/quantity-workload/${quantityWorkloadId}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
  },
}

export default QuantityWorkloadServices
