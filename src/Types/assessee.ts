export interface Assessee {
  set_asses_info_id: number
  set_asses_list_id: number
  ex_u_id: number
  as_u_id: number
  round_list_id: number
  round_list_name: string
  round: number
  year: number
  date_start: string
  date_end: string
  prefix_name: string
  u_fname: string
  u_lname: string
  u_img: string
  u_id_card: string
  position_name: string
  ex_position_name: string
  workload_group_name: string
  date_save: string
  form_status?: number | null
  evaluation_status?: 'not_started' | 'in_progress' | 'completed'
}

export interface AssesseeMeta {
  limit: number
  page: number
  sort: string
  total_rows: number
  total_pages: number
}

export interface AssesseeResponse {
  code: number
  timestamp: string
  transactionCode: string
  success: boolean
  titleMessage: string
  message: string
  errorCode: string
  meta: AssesseeMeta | null
  payload: Assessee[]
}
