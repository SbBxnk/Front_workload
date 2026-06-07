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
  getAllSubTasks: ( param: SubTaskSearchParams ): Promise<ResponsePayload<SubTask>> => {
    return http.get('/subtask', {
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
    data: CreateSubTaskRequest
  ): Promise<SubTask> => {
    return http.post('/subtask/add', data)
  },

  updateSubTask: (
    subtaskId: number,
    data: UpdateSubTaskRequest
  ): Promise<SubTask> => {
    return http.put(`/subtask/update/${subtaskId}`, data)
  },

  deleteSubTask: (subtaskId: number): Promise<void> => {
    return http.delete(`/subtask/delete/${subtaskId}`)
  },

  getSubTaskById: (subtaskId: number): Promise<SubTask> => {
    return http.get(`/subtask/${subtaskId}`)
  },

  getSubTasksByTask: (
    taskId: number,
    params?: { sort?: string; order?: string; limit?: number }
  ): Promise<SubTask[]> => {
    return http.get(`/subtask/task/${taskId}`, {
      params,
    })
  },
}

export default SubTaskServices
