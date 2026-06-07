export interface Competency {
  competency_id: number
  competency_name: string
  competency_order: number
}

export interface CompetencySearchParams {
  search?: string
  page?: number
  limit?: number
  sort?: string
  order?: string
}

export interface CreateCompetencyRequest {
  competency_name: string
  competency_order: number
}

export interface UpdateCompetencyRequest {
  competency_name: string
  competency_order: number
}
