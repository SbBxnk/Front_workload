import { PersonalType, PersonalTypeSearchParams, ResponsePayload } from '@/Types'
import http from '@/utils/http'

export interface CreatePersonalTypeRequest {
  type_p_name: string
}

export interface UpdatePersonalTypeRequest {
  type_p_name: string
}

const PersonalTypeServices = {
  getAllPersonalTypes: (accessToken: string, param: PersonalTypeSearchParams): Promise<ResponsePayload<PersonalType>> => {
    return http.get('/personalType', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      params: {
        search: param.search,
        page: param.page,
        limit: param.limit,
        sort: param.sort,
        order: param.order,
      },
    })
  },

  createPersonalType: (
    data: CreatePersonalTypeRequest,
    accessToken: string
  ): Promise<PersonalType> => {
    return http.post('/personalType/add', data, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
  },

  updatePersonalType: (
    typePId: number,
    data: UpdatePersonalTypeRequest,
    accessToken: string
  ): Promise<PersonalType> => {
    return http.put(`/personalType/update/${typePId}`, data, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
  },

  deletePersonalType: (typePId: number, accessToken: string): Promise<void> => {
    return http.delete(`/personalType/delete/${typePId}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
  },

  getPersonalTypeById: (typePId: number, accessToken: string): Promise<PersonalType> => {
    return http.get(`/personalType/${typePId}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
  },
}

export default PersonalTypeServices
