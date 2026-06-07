import { SubTask, SubTaskSearchParams, ResponsePayload } from '@/Types'
import http from '@/utils/http'

export interface CreateSubTaskRequest {
  subtask_name: string
  task_id: number
}

export interface UpdateSubTaskRequest {
  subtask_name: string
  task_id: number
}

const SubTaskServices = {
  getAllSubTasks: ( accessToken: string, param: SubTaskSearchParams ): Promise<ResponsePayload<SubTask>> => {
    return http.get('/subtask', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      params: {
        search: param.search,
        page: param.page,
        limit: param.limit,
        sort: param.sort,
        order: param.order,
      },
    })
  },

  createSubTask: (
    data: CreateSubTaskRequest,
    accessToken: string
  ): Promise<SubTask> => {
    return http.post('/subtask/add', data, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
  },

  updateSubTask: (
    subtaskId: number,
    data: UpdateSubTaskRequest,
    accessToken: string
  ): Promise<SubTask> => {
    return http.put(`/subtask/update/${subtaskId}`, data, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
  },

  deleteSubTask: (subtaskId: number, accessToken: string): Promise<void> => {
    return http.delete(`/subtask/delete/${subtaskId}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
  },

  getSubTaskById: (subtaskId: number, accessToken: string): Promise<SubTask> => {
    return http.get(`/subtask/${subtaskId}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
  },

  getSubTasksByTask: (
    taskId: number,
    accessToken: string,
    params?: { sort?: string; order?: string; limit?: number }
  ): Promise<SubTask[]> => {
    return http.get(`/subtask/task/${taskId}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      params,
    })
  },
}

export default SubTaskServices
