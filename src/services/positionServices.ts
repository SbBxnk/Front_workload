import { Position, ResponsePayload } from '@/Types'
import http from '@/utils/http'

export interface PositionSearchParams {
  search?: string
  page?: number
  limit?: number
  sort?: string
  order?: string
}

export interface CreatePositionRequest {
  position_name: string
}

export interface UpdatePositionRequest {
  position_name: string
}

const PositionServices = {
  getAllPositions: (accessToken: string, param?: PositionSearchParams): Promise<ResponsePayload<Position>> => {
    return http.get('/position', {
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

  createPosition: (
    data: CreatePositionRequest,
    accessToken: string
  ): Promise<Position> => {
    return http.post('/position/add', data, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
  },

  updatePosition: (
    positionId: number,
    data: UpdatePositionRequest,
    accessToken: string
  ): Promise<Position> => {
    return http.put(`/position/update/${positionId}`, data, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
  },

  deletePosition: (positionId: number, accessToken: string): Promise<void> => {
    return http.delete(`/position/delete/${positionId}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
  },

  getPositionById: (positionId: number, accessToken: string): Promise<Position> => {
    return http.get(`/position/${positionId}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
  },
}

export default PositionServices
