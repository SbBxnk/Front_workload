import { Prefix, PrefixSearchParams, ResponsePayload } from '@/Types'
import http from '@/utils/http'

export interface CreatePrefixRequest {
  prefix_name: string
}

export interface UpdatePrefixRequest {
  prefix_name: string
}

const PrefixServices = {
  getAllPrefixes: ( accessToken: string, param: PrefixSearchParams ): Promise<ResponsePayload<Prefix>> => {
    return http.get('/prefix', {
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

  createPrefix: (
    data: CreatePrefixRequest,
    accessToken: string
  ): Promise<Prefix> => {
    return http.post('/prefix/add', data, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
  },

  updatePrefix: (
    prefixId: number,
    data: UpdatePrefixRequest,
    accessToken: string
  ): Promise<Prefix> => {
    return http.put(`/prefix/update/${prefixId}`, data, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
  },

  deletePrefix: (prefixId: number, accessToken: string): Promise<void> => {
    return http.delete(`/prefix/delete/${prefixId}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
  },

  getPrefixById: (prefixId: number, accessToken: string): Promise<Prefix> => {
    return http.get(`/prefix/${prefixId}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
  },
}

export default PrefixServices
