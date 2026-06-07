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
  getAllPerformanceTerms: (param?: PerformanceTermSearchParams): Promise<ResponsePayload<PerformanceTerm>> => {
    return http.get('/performance/term', {
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
    data: CreatePerformanceTermRequest
  ): Promise<PerformanceTerm> => {
    return http.post('/performance/term/add', data)
  },

  updatePerformanceTerm: (
    expectedLevelId: number,
    data: UpdatePerformanceTermRequest
  ): Promise<PerformanceTerm> => {
    return http.put(`/performance/term/update/${expectedLevelId}`, data)
  },

  deletePerformanceTerm: (expectedLevelId: number): Promise<void> => {
    return http.delete(`/performance/term/delete/${expectedLevelId}`)
  },

  getPerformanceTermById: (expectedLevelId: number): Promise<PerformanceTerm> => {
    return http.get(`/performance/term/${expectedLevelId}`)
  },
}

export default PerformanceTermServices

