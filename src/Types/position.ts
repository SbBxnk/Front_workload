export interface Position {
  position_id: number
  position_name: string
  position_short_name?: string
}

export interface PositionSearchParams {
  search?: string
  page?: number
  limit?: number
  sort?: string
  order?: string
}

export interface CreatePositionRequest {
  position_name: string
  position_short_name?: string
}

export interface UpdatePositionRequest {
  position_name: string
  position_short_name?: string
}
