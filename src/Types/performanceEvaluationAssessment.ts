export interface AssessmentItem {
  assessment_item_id?: number
  competency_id: number
  assessed_level: number | null
  comment: string | null
  competency_name: string
  competency_order: number
  position_name: string
  expected_level: number | null
  demonstrated_level: number | null
  created_at?: string
  updated_at?: string
}

export interface EvaluationAssessmentPayload {
  evaluation_assessment_id: number
  formlist_id: number
  set_asses_info_id: number
  assessor_user_id: number
  assessee_user_id: number
  status: number
  comment: string | null
  submitted_at: string | null
  created_at: string
  updated_at: string
  round_list_id: number
  set_asses_list_id: number
}

export interface EvaluationAssessmentResponse {
  evaluation_assessment: EvaluationAssessmentPayload
  items: AssessmentItem[]
}

export interface SaveDraftRequest {
  comment?: string | null
  items?: Array<{
    competency_id: number
    assessed_level: number | null
    comment: string | null
  }>
}

export interface AverageAssessedLevel {
  competency_id: number
  average_assessed_level: number
  evaluator_count: number
}
