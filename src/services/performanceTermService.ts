import {
  CreatePerformanceTermRequest,
  PerformanceTerm,
  PerformanceTermSearchParams,
  ResponsePayload,
  UpdatePerformanceTermRequest,
} from '@/Types'
import http from '@/utils/http'

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

