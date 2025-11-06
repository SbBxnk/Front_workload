export interface WorkloadGroup {
  workload_group_id: number
  workload_group_name: string
}

export interface WorkloadGroupSearchParams {
  search?: string
  limit?: number
  page?: number
  sort?: string
  order?: string
}