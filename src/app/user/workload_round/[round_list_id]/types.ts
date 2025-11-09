export interface FormInfo {
  form_id: number
  form_title: string
  description: string
  workload: number
  quality: number
  file_type: string
  ex_score: number
  evidence?: string
  link_name?: string
  link_path?: string
  files?: Array<{
    fileinfo_id: number
    file_name: string
  }>
  links?: Array<{
    link_name: string
    link_path: string
  }>
}

export interface Subtask {
  subtask_id: number
  subtask_name: string
  form_infos: FormInfo[]
}

export interface Task {
  task_id: number
  task_name: string
  workload_group_id?: number
  workload_group_name?: string
  quantity_workload_hours?: number
  subtasks: { [key: number]: Subtask }
}


