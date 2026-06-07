export interface SnapshotFormData {
  form_id: number
  subtask_id: number
  task_id?: number
  task_name?: string
  subtask_name?: string
  workload_group_id?: number
  workload_group_name?: string
  quantity_workload_hours?: number
  form_title: string
  description: string
  workload: number
  quality: number
  file_type: string
  ex_score: number
  evidence?: string
  evaluation_score?: number | null
  snapshot_form_id?: number
  files?:
  | string
  | Array<{
    fileinfo_id?: number
    file_name: string
    file_path?: string
    file_size?: number
    file_type?: string
  }>
  links?:
  | string
  | Array<{
    link_id?: number
    link_name: string
    link_path: string
  }>
}

export interface SubmitFormRequest {
  formlist_id: number
  as_u_id: number
  round_list_id: number
}

export interface FormlistIdResponse {
  formlist_id: number
  set_asses_list_id: number
  status: number
}
