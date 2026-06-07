import {
  CreatePositionRequest,
  Position,
  PositionSearchParams,
  ResponsePayload,
  UpdatePositionRequest,
} from '@/Types'
import http from '@/utils/http'

const PositionServices = {
  getAllPositions: (
    param?: PositionSearchParams
  ): Promise<ResponsePayload<Position>> => {
    return http.get('/position', {
      params: {
        search: param?.search,
        page: param?.page,
        limit: param?.limit,
        sort: param?.sort,
        order: param?.order,
      },
    })
  },

  createPosition: (data: CreatePositionRequest): Promise<Position> => {
    return http.post('/position/add', data)
  },

  updatePosition: (
    positionId: number,
    data: UpdatePositionRequest
  ): Promise<Position> => {
    return http.put(`/position/update/${positionId}`, data)
  },

  deletePosition: (positionId: number): Promise<void> => {
    return http.delete(`/position/delete/${positionId}`)
  },

  getPositionById: (positionId: number): Promise<Position> => {
    return http.get(`/position/${positionId}`)
  },
}

export default PositionServices
