import type { Terms } from '@/Types'
import type { PerformanceSnapshot } from '@/Types/performance'
import type { Task } from '../types'

// ===== Section 1 =====
export interface Section1Props {
  mergedTasks: Task[]
  terms?: Terms[]
  selectedGroupName?: string
  totalPerformanceWorkload: number
  performanceScoreOutOf70: number
  performanceScoreOutOf70Evaluated?: number
  isImageFile: (fileName: string | null | undefined) => boolean
  formlistStatus?: number | null
}

// ===== Section 2 =====
export interface Section2PositionInfo {
  position_id: number
  position_name: string
  short_name: string
}

export interface Section2CompetencyScoreRow {
  id: string
  multiplier: number
  count: number
  score: number
}

export interface Section2CompetencyScoreSummary {
  rows: Section2CompetencyScoreRow[]
  totalScore: number
  totalCount: number
}

export interface Section2Props {
  isPreview?: boolean
  competencies: any[]
  expectedLevels: any[]
  performanceEvaluations: any[]
  performanceSnapshot: PerformanceSnapshot | null
  userPositionName: string
  userPositionId?: number | null
  positions: Section2PositionInfo[]
  competencyScoreSummary: Section2CompetencyScoreSummary
  competencyTotalScoreCalc: number
  onOpenCompetencyModal: () => void
  formlistStatus?: number | null
  userId?: number
  roundId?: number
  onEvaluatedCompetencyScoreSummaryChange?: (summary: Section2CompetencyScoreSummary | null) => void
}
