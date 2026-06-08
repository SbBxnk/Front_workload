import {
  CreateUserRequest,
  Personal,
  ResponsePayload,
  UpdateUserRequest,
  UserSearchParams,
} from '@/Types'
import http from '@/utils/http'

const UserServices = {
  getAllUsers: (param: UserSearchParams): Promise<ResponsePayload<Personal>> => {
    return http.get('/user', {
      params: {
        search: param.search,
        position_name: param.position_name,
        branch_name: param.branch_name,
        course_name: param.course_name,
        ex_position_name: param.ex_position_name,
        gender: param.gender,
        page: param.page,
        limit: param.limit,
        sort: param.sort,
        order: param.order,
      },
    })
  },

  createUser: (
    data: CreateUserRequest | FormData
  ): Promise<ResponsePayload<Personal>> => {
    return http.post('/user/add', data)
  },

  updateUser: (
    userId: number,
    data: UpdateUserRequest | FormData
  ): Promise<ResponsePayload<Personal>> => {
    return http.patch(`/user/update/${userId}`, data, {
      headers: {
        ...(data instanceof FormData ? {} : { 'Content-Type': 'application/json' })
      },
    })
  },

  deleteUser: (userId: number): Promise<ResponsePayload<void>> => {
    return http.delete(`/user/delete/${userId}`)
  },

  getUserById: (userId: number): Promise<ResponsePayload<Personal>> => {
    return http.get(`/user/${userId}`)
  },

  getMe: (): Promise<ResponsePayload<Personal>> => {
    return http.get('/me')
  },

  exportUsersToExcel: (params: UserSearchParams): Promise<Blob> => {
    return http.get('/user/export', {
      params: {
        search: params.search,
        position_name: params.position_name,
        branch_name: params.branch_name,
        course_name: params.course_name,
        ex_position_name: params.ex_position_name,
        gender: params.gender,
        sort: params.sort,
        order: params.order,
      },
      responseType: 'blob', // Important for file downloads
    })
  },
}

export default UserServices
