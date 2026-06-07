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

export interface RegisterRequest {
  fname: string
  lname: string
  email: string
  password: string
}

// response ของ endpoint auth ที่ตอบ { status, message } (forgot/validate/reset/register)
export interface AuthMessageResponse {
  status: boolean | string
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

  Register: (data: RegisterRequest): Promise<AuthMessageResponse> => {
    return server.post('/register', data);
  },

  ForgotPassword: (email: string): Promise<AuthMessageResponse> => {
    return server.post('/forgot-password', { u_email: email });
  },

  ValidateResetToken: (token: string): Promise<AuthMessageResponse> => {
    return server.post('/validate-reset-token', { token });
  },

  ResetPassword: (token: string, newPassword: string): Promise<AuthMessageResponse> => {
    return server.post('/reset-password', { token, newPassword });
  },

  UpdateProfile: (data: FormData): Promise<ResponsePayload<UserProfile>> => {
    return http.patch('/profile/update', data);
  },

}

export default AuthService
