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
  getAllExpositions: (param?: ExpositionSearchParams): Promise<ResponsePayload<ExPosition>> => {
    return http.get('/ex_position', {
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
    data: CreateExpositionRequest
  ): Promise<ExPosition> => {
    return http.post('/ex_position/add', data)
  },

  updateExposition: (
    expositionId: number,
    data: UpdateExpositionRequest
  ): Promise<ExPosition> => {
    return http.put(`/ex_position/update/${expositionId}`, data)
  },

  deleteExposition: (expositionId: number): Promise<void> => {
    return http.delete(`/ex_position/delete/${expositionId}`)
  },

  getExpositionById: (expositionId: number): Promise<ExPosition> => {
    return http.get(`/ex_position/${expositionId}`)
  },
}

export default ExpositionServices