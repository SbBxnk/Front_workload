import http, { server } from '@/utils/http'
import { ResponsePayload } from '@/Types/response'

export interface LoginCredentials {
  email: string
  password: string
  callbackUrl?: string
}

export interface LoginResponse {
  status: string
  token: string
  message?: string
}


export interface UserProfile {
    u_email: string 
    level_id: number
    prefix_id: number
    u_fname: string
    u_lname: string
    u_id_card: string
    u_tel: string
    position_id: number
    course_id: number
    type_p_id: number
    gender: string
    salary: number
    age: number
    ex_position_id: number
    work_start: string
}

const AuthService = {
  
  SignIn: ({ email, password }: LoginCredentials): Promise<LoginResponse> => {
    return server.post('/login', { u_email: email, u_pass: password });
  },

  UpdateProfile: (accessToken: string, data: FormData): Promise<ResponsePayload<UserProfile>> => {
    return server.patch('/profile/update', data, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
  },

}

export default AuthService
