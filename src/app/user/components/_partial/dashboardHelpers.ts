import type { Task } from '../../workload_round/[round_list_id]/types'
import type { EvaluationStatus } from './types'

export const POSITIONS = [
  { position_id: 1, position_name: 'อาจารย์', short_name: 'อ.' },
  { position_id: 2, position_name: 'ผู้ช่วยศาสตราจารย์', short_name: 'ผศ.' },
  { position_id: 3, position_name: 'รองศาสตราจารย์', short_name: 'รศ.' },
  { position_id: 4, position_name: 'ศาสตราจารย์', short_name: 'ศ.' },
]

export function formatStatus(status: EvaluationStatus) {
  switch (status) {
    case 'IN_PROGRESS':
      return 'กำลังดำเนินการ'
    case 'PENDING_REVIEW':
      return 'รอการตรวจสอบ'
    case 'COMPLETED':
      return 'ประเมินเสร็จสิ้น'
    case 'NOT_STARTED':
    default:
      return 'ยังไม่เริ่มดำเนินการ'
  }
}

export function statusBadgeColor(status: EvaluationStatus) {
  switch (status) {
    case 'IN_PROGRESS':
      return 'text-blue-700 dark:text-blue-300'
    case 'PENDING_REVIEW':
      return 'text-amber-700 dark:text-amber-300'
    case 'COMPLETED':
      return 'text-emerald-700 dark:text-emerald-300'
    case 'NOT_STARTED':
    default:
      return 'text-gray-700 dark:text-gray-400'
  }
}

export function getGrade(score: number | null) {
  if (score === null) return null
  if (score >= 90) return { label: 'ดีเด่น', color: 'text-emerald-700 bg-emerald-50 dark:bg-emerald-900/30 dark:text-emerald-300', border: 'border-emerald-100 dark:border-emerald-800' }
  if (score >= 80) return { label: 'ดีมาก', color: 'text-blue-700 bg-blue-50 dark:bg-blue-900/30 dark:text-blue-300', border: 'border-blue-100 dark:border-blue-800' }
  if (score >= 70) return { label: 'ดี', color: 'text-sky-700 bg-sky-50 dark:bg-sky-900/30 dark:text-sky-300', border: 'border-sky-100 dark:border-sky-800' }
  if (score >= 60) return { label: 'พอใช้', color: 'text-amber-700 bg-amber-50 dark:bg-amber-900/30 dark:text-amber-300', border: 'border-amber-100 dark:border-amber-800' }
  return { label: 'ต้องปรับปรุง', color: 'text-red-700 bg-red-50 dark:bg-red-900/30 dark:text-red-300', border: 'border-red-100 dark:border-red-800' }
}

export const calculatePerformanceScoreEvaluated = (data: Task[]) => {
  if (!Array.isArray(data)) return 0
  const totalPoints = data.slice(0, 5).reduce((sum, task) =>
    sum + Object.values(task.subtasks).reduce((subSum, subtask) =>
      subSum + subtask.form_infos.reduce((formSum, formInfo: any) => {
        if (formInfo.evaluation_score != null) {
          return formSum + Number(formInfo.evaluation_score)
        }
        return formSum
      }, 0), 0
    ), 0
  )
  const score = (totalPoints * 70) / 100
  return Math.min(70, score)
}
