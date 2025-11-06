import { PerformanceTerm, ResponsePayload } from '@/Types'
import http from '@/utils/http'

export interface PerformanceTermSearchParams {
  search?: string
  page?: number
  limit?: number
  sort?: string
  order?: string
}

export interface CreatePerformanceTermRequest {
  competency_id: number
  position_id: number
  expected_level: number
}

export interface UpdatePerformanceTermRequest {
  competency_id: number
  position_id: number
  expected_level: number
}

const PerformanceTermServices = {
  getAllPerformanceTerms: (accessToken: string, param?: PerformanceTermSearchParams): Promise<ResponsePayload<PerformanceTerm>> => {
    return http.get('/performance/term', {
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

  createPerformanceTerm: (
    data: CreatePerformanceTermRequest,
    accessToken: string
  ): Promise<PerformanceTerm> => {
    return http.post('/performance/term/add', data, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
  },

  updatePerformanceTerm: (
    expectedLevelId: number,
    data: UpdatePerformanceTermRequest,
    accessToken: string
  ): Promise<PerformanceTerm> => {
    return http.put(`/performance/term/update/${expectedLevelId}`, data, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
  },

  deletePerformanceTerm: (expectedLevelId: number, accessToken: string): Promise<void> => {
    return http.delete(`/performance/term/delete/${expectedLevelId}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
  },

  getPerformanceTermById: (expectedLevelId: number, accessToken: string): Promise<PerformanceTerm> => {
    return http.get(`/performance/term/${expectedLevelId}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
  },
}

export default PerformanceTermServices

