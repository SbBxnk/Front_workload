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

// payload ที่ decode มาจาก JWT (session.accessToken) — ใช้กับหน้าโปรไฟล์ผู้ใช้
export interface UserLoginData {
  id: string
  gender: string
  prefix_name: string
  prefix_id: number
  u_fname: string
  u_lname: string
  age: number
  branch_name: string
  branch_id: number
  course_name: string
  course_id: number
  ex_position_name: string
  ex_position_id: number
  exp: number
  iat: number
  level_name: string
  level_id: number
  position_id: number
  position_name: string
  salary: number
  type_p_name: string
  type_p_id: number
  u_email: string
  u_id_card: string
  u_img: string
  u_tel: string
  work_start: string
}
