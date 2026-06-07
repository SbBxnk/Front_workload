export interface RoundList {
  round_list_id: number
  round_list_name: string
  date_start: string
  date_end: string
  year: string
  round: number
  has_completed_forms?: number
}

export interface CreateRoundListRequest {
  round_list_name: string
  date_start: string
  date_end: string
  year: string
  round: number
}

export interface UpdateRoundListRequest {
  round_list_name: string
  date_start: string
  date_end: string
  year: string
  round: number
}

export interface SetAssessorList {
  set_asses_list_id: number
  as_u_id: number
  round_list_id: number
  prefix_name: string
  u_fname: string
  u_lname: string
  u_img: string
  u_id_card: string
  ex_position_name: string
  workload_group_id: number
  workload_group_name: string
  date_save: string
  as_user_name?: string
  as_user_email?: string
}

export interface CreateSetAssessorListRequest {
  as_u_id: number
  round_list_id: number
}

export interface CreateSetAssessorListMultipleRequest {
  as_u_id: number[]
  round_list_id: number
}

export interface SetAssessorInfo {
  set_asses_info_id: number
  ex_u_id: number
  set_asses_list_id: number
  ex_user_name?: string
  ex_user_email?: string
}

export interface AssesseeSummary {
  set_asses_list_id: number
  as_u_id: number
  prefix_name?: string | null
  u_fname?: string | null
  u_lname?: string | null
  u_img?: string | null
  u_id_card?: string | null
  position_name?: string | null
  ex_position_name?: string | null
  workload_group_id?: number | null
  workload_group_name?: string | null
  date_save?: string | null
}

export interface CreateSetAssessorInfoRequest {
  ex_u_id: number
  set_asses_list_id: number
}

export interface CreateSetAssessorInfoMultipleRequest {
  ex_u_id: number[]
  set_asses_list_id: number
}
