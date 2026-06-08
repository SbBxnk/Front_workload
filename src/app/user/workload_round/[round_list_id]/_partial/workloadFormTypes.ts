import type { Terms } from '@/Types'

export interface WorkloadFormProps {
  selectedGroupName?: string
  terms?: Terms[]
  userId?: number
  roundId?: number
  isPreview?: boolean
  forceSnapshot?: boolean // เพิ่ม prop สำหรับบังคับให้ใช้ snapshot
}

export interface PositionInfo {
  position_id: number
  position_name: string
  short_name: string
}

export interface CompetencyScoreRow {
  id: string
  multiplier: number
  count: number
  score: number
}

export interface CompetencyScoreSummary {
  rows: CompetencyScoreRow[]
  totalScore: number
  totalCount: number
}
