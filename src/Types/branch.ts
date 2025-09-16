export interface Branch {
  branch_id: number
  branch_name: string
}

export interface BranchSearchParams {
  search: string
  limit: number
  page: number
  sort: string
  order: string
}
