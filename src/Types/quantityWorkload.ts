export interface QuantityWorkload {
  quantity_workload_id: number
  quantity_workload_hours: number
  workload_group_id: number
  task_id: number
  workload_group_name: string
  task_name: string
}

export interface QuantityWorkloadSearchParams {
  search: string
  limit: number
  page: number
  sort: string
  order: string
}
