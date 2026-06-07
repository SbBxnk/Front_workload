import http, { server } from '@/utils/http'
import { ResponsePayload } from '@/Types/response'
import type {
  LoginCredentials,
  LoginResponse,
  RegisterRequest,
  AuthMessageResponse,
  UserProfile,
} from '@/Types/auth'

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
