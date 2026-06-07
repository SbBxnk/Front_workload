import {
  CreatePrefixRequest,
  Prefix,
  PrefixSearchParams,
  ResponsePayload,
  UpdatePrefixRequest,
} from '@/Types'
import http from '@/utils/http'

const PrefixServices = {
  getAllPrefixes: (
    param: PrefixSearchParams
  ): Promise<ResponsePayload<Prefix>> => {
    return http.get('/prefix', {
      params: {
        search: param.search,
        page: param.page,
        limit: param.limit,
        sort: param.sort,
        order: param.order,
      },
    })
  },

  createPrefix: (data: CreatePrefixRequest): Promise<Prefix> => {
    return http.post('/prefix/add', data)
  },

  updatePrefix: (
    prefixId: number,
    data: UpdatePrefixRequest
  ): Promise<Prefix> => {
    return http.put(`/prefix/update/${prefixId}`, data)
  },

  deletePrefix: (prefixId: number): Promise<void> => {
    return http.delete(`/prefix/delete/${prefixId}`)
  },

  getPrefixById: (prefixId: number): Promise<Prefix> => {
    return http.get(`/prefix/${prefixId}`)
  },
}

export default PrefixServices
