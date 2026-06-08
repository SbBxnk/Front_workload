export interface PerformanceTerm {
  expected_level_id: number
  competency_id: number
  position_id: number
  expected_level: number
  competency_name: string
  competency_order: number
  position_name: string
  position_short_name?: string
}

export interface PerformanceTermMatrix {
  competency_id: number
  competency_name: string
  competency_order: number
  expectedLevelsByPosition: {
    [position_id: number]: {
      expected_level_id?: number
      expected_level: number | null
    }
  }
}

// state ของตาราง matrix ฝั่ง client (แก้ไขทีละ cell ก่อนบันทึกรวม)
export interface PerformanceMatrixDataState {
  [competency_id: number]: {
    [position_id: number]: {
      expected_level_id?: number
      expected_level: number | null
      isNew?: boolean
    }
  }
}

export interface PerformanceTermSearchParams {
  search?: string
  page?: number
  limit?: number
  sort?: string
  order?: string
}

export interface CreatePerformanceTermRequest {
  competency_id: number
  position_id: number
  expected_level: number
}

export interface UpdatePerformanceTermRequest {
  competency_id: number
  position_id: number
  expected_level: number
}
