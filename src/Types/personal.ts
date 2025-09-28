export interface Personal {
  u_id: number
  prefix_id: number
  prefix_name: string
  u_email: string
  u_fname: string
  u_lname: string
  level_id: number
  level_name: string
  branch_id: number
  u_id_card: string
  u_tel: number
  position_id: number
  position_name: string
  ex_position_id: number
  ex_position_name: string
  course_id: number
  course_name: string
  branch_name: string
  type_p_id: number
  type_p_name: string
  gender: string
  age: number
  work_start: string
  work_length: string
  salary: number
  u_img: string | File
  u_pass: string
}
