import { MainTask, MainTaskSearchParams, ResponsePayload } from '@/Types'
import http from '@/utils/http'

export interface CreateMainTaskRequest {
  task_name: string
}

export interface UpdateMainTaskRequest {
  task_name: string
}

const MainTaskServices = {
  getAllMainTasks: ( accessToken: string, param?: MainTaskSearchParams ): Promise<ResponsePayload<MainTask>> => {
    return http.get('/maintask', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
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
    data: CreateMainTaskRequest,
    accessToken: string
  ): Promise<MainTask> => {
    return http.post('/maintask/add', data, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
  },

  updateMainTask: (
    taskId: number,
    data: UpdateMainTaskRequest,
    accessToken: string
  ): Promise<MainTask> => {
    return http.put(`/maintask/update/${taskId}`, data, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
  },

  deleteMainTask: (taskId: number, accessToken: string): Promise<void> => {
    return http.delete(`/maintask/delete/${taskId}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
  },

  getMainTaskById: (taskId: number, accessToken: string): Promise<MainTask> => {
    return http.get(`/maintask/${taskId}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
  },
}

export default MainTaskServices
