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

export interface CreatePersonalTypeRequest {
  type_p_name: string
}

export interface UpdatePersonalTypeRequest {
  type_p_name: string
}
