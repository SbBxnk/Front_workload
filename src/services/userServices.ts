import { Personal, ResponsePayload } from '@/Types'
import http from '@/utils/http'

export interface UserSearchParams {
  search?: string
  position_name?: string
  branch_name?: string
  course_name?: string
  ex_position_name?: string
  gender?: string
  page?: number
  limit?: number
  sort?: string
  order?: string
}

export interface CreateUserRequest {
  u_fname: string
  u_lname: string
  u_email: string
  u_pass: string
  u_tel: string
  u_id_card: string
  age: number
  salary: number
  gender: string
  level_id: number
  prefix_id: number
  position_id: number
  course_id: number
  type_p_id: number
  ex_position_id?: number
  work_start: string
}

export interface UpdateUserRequest {
  u_fname?: string
  u_lname?: string
  u_email?: string
  u_pass?: string
  u_tel?: string
  u_id_card?: string
  age?: number
  salary?: number
  gender?: string
  level_id?: number
  prefix_id?: number
  position_id?: number
  course_id?: number
  type_p_id?: number
  ex_position_id?: number
  work_start?: string
}

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
