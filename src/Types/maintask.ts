export interface MainTask {
  task_id: number
  task_name: string
}

export interface MainTaskSearchParams {
  search?: string
  limit?: number
  page?: number
  sort?: string
  order?: string
}

export interface CreateMainTaskRequest {
  task_name: string
}

export interface UpdateMainTaskRequest {
  task_name: string
}
