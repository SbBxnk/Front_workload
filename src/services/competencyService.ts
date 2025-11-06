import { Competency, ResponsePayload } from '@/Types'
import http from '@/utils/http'

export interface CompetencySearchParams {
  search?: string
  page?: number
  limit?: number
  sort?: string
  order?: string
}

export interface CreateCompetencyRequest {
  competency_name: string
  competency_order: number
}

export interface UpdateCompetencyRequest {
  competency_name: string
  competency_order: number
}

const CompetencyServices = {
  getAllCompetencies: (accessToken: string, param?: CompetencySearchParams): Promise<ResponsePayload<Competency>> => {
    return http.get('/competency', {
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

  createCompetency: (
    data: CreateCompetencyRequest,
    accessToken: string
  ): Promise<Competency> => {
    return http.post('/competency/add', data, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
  },

  updateCompetency: (
    competencyId: number,
    data: UpdateCompetencyRequest,
    accessToken: string
  ): Promise<Competency> => {
    return http.put(`/competency/update/${competencyId}`, data, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
  },

  deleteCompetency: (competencyId: number, accessToken: string): Promise<void> => {
    return http.delete(`/competency/delete/${competencyId}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
  },

  getCompetencyById: (competencyId: number, accessToken: string): Promise<Competency> => {
    return http.get(`/competency/${competencyId}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
  },
}

export default CompetencyServices

