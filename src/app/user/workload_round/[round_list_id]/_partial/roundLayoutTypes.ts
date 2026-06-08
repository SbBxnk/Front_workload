import type { WorkloadGroup } from '@/Types'

// ข้อมูลรอบการประเมินปัจจุบัน (ย้าย verbatim จาก layout.tsx — โครงเดิมเป็น any)
export interface RoundLayoutCurrentRound {
  round_list_id: number
  round_list_name: string
  round: number
  year: number
  date_start: string
  date_end: string
}

// ข้อมูลกลุ่มภาระงานที่ผู้ใช้เลือกแล้ว (null = ยังไม่เลือก)
export interface RoundLayoutWorkloadGroupInfo {
  workload_group_id: number | null
  workload_group_name: string | null
}

export type RoundStatus = 'not_found' | 'not_started' | 'active'

// ค่าที่ hook ส่งกลับให้ layout ใช้งาน
export interface UseRoundLayoutResult {
  // state
  currentRound: RoundLayoutCurrentRound | null
  workloadGroupInfo: RoundLayoutWorkloadGroupInfo | null
  setWorkloadGroupInfo: React.Dispatch<React.SetStateAction<RoundLayoutWorkloadGroupInfo | null>>
  workloadGroups: WorkloadGroup[]
  terms: any[]
  selectedWorkloadGroup: WorkloadGroup | null
  setSelectedWorkloadGroup: React.Dispatch<React.SetStateAction<WorkloadGroup | null>>
  hasFormInRound: boolean | null
  loading: boolean
  isCheckingAccess: boolean
  user: any
  // derived
  targetRoundStatus: RoundStatus
}
