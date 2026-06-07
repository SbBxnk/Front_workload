import {
  Competency,
  CompetencySearchParams,
  CreateCompetencyRequest,
  ResponsePayload,
  UpdateCompetencyRequest,
} from '@/Types'
import http from '@/utils/http'

const CompetencyServices = {
  getAllCompetencies: (param?: CompetencySearchParams): Promise<ResponsePayload<Competency>> => {
    return http.get('/competency', {
      params: {
        search: param?.search,
        page: param?.page,
        limit: param?.limit,
        sort: param?.sort,
        order: param?.order,
      },
    })
  },

  createCompetency: (
    data: CreateCompetencyRequest
  ): Promise<Competency> => {
    return http.post('/competency/add', data)
  },

  updateCompetency: (
    competencyId: number,
    data: UpdateCompetencyRequest
  ): Promise<Competency> => {
    return http.put(`/competency/update/${competencyId}`, data)
  },

  deleteCompetency: (competencyId: number): Promise<void> => {
    return http.delete(`/competency/delete/${competencyId}`)
  },

  getCompetencyById: (competencyId: number): Promise<Competency> => {
    return http.get(`/competency/${competencyId}`)
  },
}

export default CompetencyServices

