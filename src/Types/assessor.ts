export interface AssessorData {
  isAssessor: boolean
  assessorId?: number
  roundListId?: number
  lastChecked: number
}
export interface Params {
  page: string,
  limit: string,
  search: string,
  year: string,
  sort: string,
  order: string,
}

export interface RoundList {
  round_list_id: number
  round_list_name: string
  year: number
  round: number
  date_start: string
  date_end: string
  form_count: number
}

export interface CheckAssessorResponse {
  assessor_id: number
  round_list_id: number
}
