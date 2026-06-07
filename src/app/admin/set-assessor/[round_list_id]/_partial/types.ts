export interface Assessor {
  set_asses_list_id: number
  round_list_id: number
  as_u_id: number
  prefix_name: string
  u_fname: string
  u_lname: string
  ex_position_name: string
  u_id_card: string
  u_img: string
  workload_group_id: number
  workload_group_name: string
  date_save: string
}

export interface Round {
  round_list_id: number
  round_list_name: string
  round: number
  year: string
  date_start: string
  date_end: string
}

export interface Delete {
  set_asses_list_id: number[]
}

export interface WorkloadFormList {
  set_asses_list_id: number
  status_id: number
}

export interface EvaluationStatus {
  set_asses_list_id: number
  workload_group_id: number | null
  form_status: number
  evaluation_status: 'not_started' | 'in_progress' | 'completed'
}
