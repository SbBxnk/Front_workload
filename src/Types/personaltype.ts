export interface PersonalType {
  type_p_id: number
  type_p_name: string
}

export interface PersonalTypeSearchParams {
  search: string
  limit: number
  page: number
  sort: string
  order: string
}
