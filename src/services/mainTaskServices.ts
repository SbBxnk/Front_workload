import { MainTask, MainTaskSearchParams, ResponsePayload } from '@/Types'
import http from '@/utils/http'

export interface CreateMainTaskRequest {
  task_name: string
}

export interface UpdateMainTaskRequest {
  task_name: string
}

const MainTaskServices = {
  getAllMainTasks: ( param?: MainTaskSearchParams ): Promise<ResponsePayload<MainTask>> => {
    return http.get('/maintask', {
      params: {
        search: param?.search,
        page: param?.page,
        limit: param?.limit,
        sort: param?.sort,
        order: param?.order,
      },
    })
  },

  createMainTask: (
    data: CreateMainTaskRequest
  ): Promise<MainTask> => {
    return http.post('/maintask/add', data)
  },

  updateMainTask: (
    taskId: number,
    data: UpdateMainTaskRequest
  ): Promise<MainTask> => {
    return http.put(`/maintask/update/${taskId}`, data)
  },

  deleteMainTask: (taskId: number): Promise<void> => {
    return http.delete(`/maintask/delete/${taskId}`)
  },

  getMainTaskById: (taskId: number): Promise<MainTask> => {
    return http.get(`/maintask/${taskId}`)
  },
}

export default MainTaskServices
