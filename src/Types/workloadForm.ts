// Types for Workload Form
export interface WorkloadFormFile {
  fileinfo_id: number
  file_name: string
  size: number
  form_id: number
}

export interface WorkloadFormLink {
  link_id: number
  link_path: string
  link_name: string
  form_id: number
}

export interface WorkloadFormData {
  form_id: number
  as_u_id: number
  formlist_id: number
  form_title: string
  description: string
  workload: number
  quality: number
  file_type: 'link' | 'external file' | 'file in system'
  ex_score: number
  files: WorkloadFormFile[]
  links: WorkloadFormLink[]
}

export interface WorkloadFormDetail {
  form_id: number
  as_u_id: number
  formlist_id: number
  form_title: string
  description: string
  workload: number
  quality: number
  file_type: 'link' | 'external file' | 'file in system'
  ex_score: number
  subtask_id: number
  files?: WorkloadFormFile[]
  links?: WorkloadFormLink[]
  link?: string
  link_name?: string
}

export interface WorkloadFormTerms {
  task_id?: number
  task_name: string
  workload_group_id?: number
  workload_group_name: string
  quantity_workload_hours: number
}

export interface WorkloadFormGroup {
  workload_group_id: number
  workload_group_name: string
  round: number
  year: string
  round_list_id: number
  set_asses_list_id: number
  u_id: number
  status_id: number | null
  status_name: string | null
  formlist_id: number
  u_fname: string
  u_lname: string
}

export interface WorkloadFormFileInfo {
  fileinfo_id: number
  file_name: string
  file_path: string
  form_id: number
  size: number
}
