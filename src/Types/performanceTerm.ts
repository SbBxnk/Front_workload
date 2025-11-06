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

