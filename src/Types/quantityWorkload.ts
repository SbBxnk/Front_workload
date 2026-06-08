export interface QuantityWorkload {
  quantity_workload_id: number
  quantity_workload_hours: number
  workload_group_id: number
  task_id: number
  workload_group_name: string
  task_name: string
}

// state ของตาราง matrix ฝั่ง client (แก้ไขทีละ cell ก่อนบันทึกรวม)
export interface QuantityMatrixDataState {
  [task_id: number]: {
    [workload_group_id: number]: {
      quantity_workload_id?: number
      quantity_workload_hours: number | null
      isNew?: boolean
    }
  }
}

export interface QuantityWorkloadSearchParams {
  search?: string
  limit?: number
  page?: number
  sort?: string
  order?: string
}

export interface CreateQuantityWorkloadRequest {
  quantity_workload_hours: number
  workload_group_id: number
  task_id: number
}

export interface UpdateQuantityWorkloadRequest {
  quantity_workload_hours: number
  workload_group_id: number
  task_id: number
}
