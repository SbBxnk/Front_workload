import { PersonalType, PersonalTypeSearchParams, ResponsePayload } from '@/Types'
import http from '@/utils/http'

export interface CreatePersonalTypeRequest {
  type_p_name: string
}

export interface UpdatePersonalTypeRequest {
  type_p_name: string
}

const PersonalTypeServices = {
  getAllPersonalTypes: (
    param: PersonalTypeSearchParams
  ): Promise<ResponsePayload<PersonalType>> => {
    return http.get('/personalType', {
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
    data: CreatePersonalTypeRequest
  ): Promise<PersonalType> => {
    return http.post('/personalType/add', data)
  },

  updatePersonalType: (
    typePId: number,
    data: UpdatePersonalTypeRequest
  ): Promise<PersonalType> => {
    return http.put(`/personalType/update/${typePId}`, data)
  },

  deletePersonalType: (typePId: number): Promise<void> => {
    return http.delete(`/personalType/delete/${typePId}`)
  },

  getPersonalTypeById: (typePId: number): Promise<PersonalType> => {
    return http.get(`/personalType/${typePId}`)
  },
}

export default PersonalTypeServices
