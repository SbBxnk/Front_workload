export type EvaluationStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'PENDING_REVIEW' | 'COMPLETED'

export interface CriteriaComparison {
  name: string
  expectedScore: number
  actualScore?: number | null
  assessedScore?: number | null // ระดับสมรรถนะจากผู้ตรวจ
  quantityScore?: number | null // ค่าภาระงานตามเกณฑ์ (เขียว)
}

export interface FeedbackItem {
  reviewerName?: string
  comment: string
  createdAt?: string
}

export interface EvaluationDashboard {
  roundId: number
  roundName: string
  status: EvaluationStatus
  progressPercent: number
  workloadScore: {
    expected: number
    actual: number | null
  }
  performanceScore: {
    expected: number
    actual: number | null
    assessed: number | null
  }
  criteriaComparison: CriteriaComparison[]
  performanceComparison: CriteriaComparison[]
  feedback: FeedbackItem[]
  workloadGroupName?: string
  positionName?: string
}
