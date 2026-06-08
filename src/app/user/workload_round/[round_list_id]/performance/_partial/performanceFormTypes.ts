export interface PerformanceFormProps {
  userId?: number
  roundId?: number
  formlist_id?: number
}

export interface Position {
  position_id: number
  position_name: string
  short_name: string // อ., ผศ., รศ., ศ.
}

// ตำแหน่งที่ใช้ในระบบ
export const POSITIONS: Position[] = [
  { position_id: 1, position_name: 'อาจารย์', short_name: 'อ.' },
  { position_id: 2, position_name: 'ผู้ช่วยศาสตราจารย์', short_name: 'ผศ.' },
  { position_id: 3, position_name: 'รองศาสตราจารย์', short_name: 'รศ.' },
  { position_id: 4, position_name: 'ศาสตราจารย์', short_name: 'ศ.' },
]
