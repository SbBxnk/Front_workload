// Types for Performance Evaluation
export interface Competency {
  competency_id: number
  competency_name: string
  competency_order: number
}

export interface ExpectedLevel {
  expected_level_id: number
  competency_id: number
  position_id: number
  expected_level: number
  competency_name: string
  competency_order: number
  position_name: string
}

export interface PerformanceEvaluation {
  evaluation_id: number
  formlist_id: number
  u_id: number
  round_list_id: number
  position_id: number
  competency_id: number
  demonstrated_level: number | null
  competency_name: string
  competency_order: number
  position_name: string
}

export interface PerformanceEvaluationFormData {
  competencies: Competency[]
  expectedLevels: ExpectedLevel[]
  evaluations: PerformanceEvaluation[]
  userPositionId: number
}

export interface PerformanceEvaluationRequest {
  formlist_id: number
  u_id: number
  round_list_id: number
  position_id: number
  competency_id: number
  demonstrated_level: number | null
}

export interface PerformanceSnapshotEvaluation {
  snapshot_perf_detail_id: number
  // เก็บข้อมูลเป็น text เพื่อป้องกันการเปลี่ยนแปลงหลังจากส่งฟอร์ม
  position_name: string | null // เก็บชื่อตำแหน่งเป็น text
  position_short_name: string | null // เก็บชื่อย่อตำแหน่งเป็น text
  competency_name: string | null // เก็บชื่อสมรรถนะเป็น text
  competency_order: number | null
  demonstrated_level: number | null
  expected_level: number | null // เก็บ expected_level ที่ตรงกับ position ของ user จาก snapshot
}

export interface PerformanceSnapshot {
  snapshot_perf_id: number
  formlist_id: number
  u_id: number
  round_list_id: number
  snapshot_date: string
  status: number
  date_save: string
  updated_at: string
  evaluations: PerformanceSnapshotEvaluation[]
}
