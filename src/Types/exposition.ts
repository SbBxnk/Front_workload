export interface ExPosition {
  ex_position_id: number
  ex_position_name: string
}

export interface ExpositionSearchParams {
  search?: string
  page?: number
  limit?: number
  sort?: string
  order?: string
}

export interface CreateExpositionRequest {
  ex_position_name: string
}

export interface UpdateExpositionRequest {
  ex_position_name: string
}
