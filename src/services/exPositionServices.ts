import { ExPosition, ResponsePayload } from '@/Types'
import http from '@/utils/http'

export interface ExpositionSearchParams {
  search?: string
  page?: number
  limit?: number
  sort?: string
  order?: string
}

export interface CreateExpositionRequest {
  ex_position_name: string
}

export interface UpdateExpositionRequest {
  ex_position_name: string
}

const ExpositionServices = {
  getAllExpositions: (accessToken: string, param?: ExpositionSearchParams): Promise<ResponsePayload<ExPosition>> => {
    return http.get('/ex_position', {
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

  createExposition: (
    data: CreateExpositionRequest,
    accessToken: string
  ): Promise<ExPosition> => {
    return http.post('/ex_position/add', data, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
  },

  updateExposition: (
    expositionId: number,
    data: UpdateExpositionRequest,
    accessToken: string
  ): Promise<ExPosition> => {
    return http.put(`/ex_position/update/${expositionId}`, data, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
  },

  deleteExposition: (expositionId: number, accessToken: string): Promise<void> => {
    return http.delete(`/ex_position/delete/${expositionId}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
  },

  getExpositionById: (expositionId: number, accessToken: string): Promise<ExPosition> => {
    return http.get(`/ex_position/${expositionId}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
  },
}

export default ExpositionServices