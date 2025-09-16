import { Personal, ResponsePayload } from '@/Types'
import http from '@/utils/http'

export interface UserSearchParams {
  search?: string
  position_name?: string
  branch_name?: string
  course_name?: string
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
  getAllUsers: (accessToken: string, param: UserSearchParams): Promise<any> => {
    return http.get('/user', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      params: {
        search: param.search,
        position_name: param.position_name,
        branch_name: param.branch_name,
        course_name: param.course_name,
        page: param.page,
        limit: param.limit,
        sort: param.sort,
        order: param.order,
      },
    })
  },

  createUser: (
    data: CreateUserRequest,
    accessToken: string
  ): Promise<Personal> => {
    return http.post('/user/add', data, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
  },

  updateUser: (
    userId: number,
    data: UpdateUserRequest,
    accessToken: string
  ): Promise<Personal> => {
    return http.put(`/user/update/${userId}`, data, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
  },

  deleteUser: (userId: number, accessToken: string): Promise<void> => {
    return http.delete(`/user/delete/${userId}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
  },

  getUserById: (userId: number, accessToken: string): Promise<Personal> => {
    return http.get(`/user/${userId}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
  },
}

export default UserServices
