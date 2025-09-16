export interface Prefix {
  prefix_id: number
  prefix_name: string
}

export interface PrefixSearchParams {
  search: string
  limit: number
  page: number
  sort: string
  order: string
}
