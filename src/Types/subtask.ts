export interface SubTask {
  subtask_id: number
  subtask_name: string
  task_id: number
  task_name: string
}

export interface SubTaskSearchParams {
  search: string
  limit: number
  page: number
  sort: string
  order: string
}

export interface CreateSubTaskRequest {
  subtask_name: string
  task_id: number
}

export interface UpdateSubTaskRequest {
  subtask_name: string
  task_id: number
}
