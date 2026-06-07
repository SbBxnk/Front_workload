import type { RoundAccessInfo } from './useWorkloadRounds'

const THAI_MONTHS = [
  'มกราคม',
  'กุมภาพันธ์',
  'มีนาคม',
  'เมษายน',
  'พฤษภาคม',
  'มิถุนายน',
  'กรกฎาคม',
  'สิงหาคม',
  'กันยายน',
  'ตุลาคม',
  'พฤศจิกายน',
  'ธันวาคม',
]

export const formatThaiDate = (dateString: string) => {
  if (!dateString) return '-'

  const date = new Date(dateString)
  if (isNaN(date.getTime())) return dateString

  const day = date.getDate()
  const year = date.getFullYear() + 543
  const month = THAI_MONTHS[date.getMonth()]

  return `${day} ${month} ${year}`
}

export const getRoundStatusLabel = (
  startDate: string,
  endDate: string,
  hasCompletedForms?: number,
  accessInfo?: RoundAccessInfo
): string => {
  if (!startDate || !endDate) return 'รอดำเนินการ'

  if (hasCompletedForms === 1) {
    return 'รอการประเมิน'
  }
  if (Number(hasCompletedForms) === 2) {
    return 'เสร็จสิ้น'
  }

  const currentDate = new Date()
  const start = new Date(startDate)
  const end = new Date(endDate)

  if (currentDate < start) {
    return 'รอดำเนินการ'
  }

  if (currentDate > end) {
    return 'สิ้นสุดการดำเนินการ'
  }

  if (!accessInfo?.hasUserAssignment || !accessInfo?.hasAssignedAssessor) {
    return 'รอดำเนินการ'
  }

  return 'กำลังดำเนินการ'
}

export const getRoundStatusColor = (
  startDate: string,
  endDate: string,
  hasCompletedForms?: number,
  accessInfo?: RoundAccessInfo
): string => {
  const status = getRoundStatusLabel(startDate, endDate, hasCompletedForms, accessInfo)

  switch (status) {
    case 'เสร็จสิ้น':
      return 'bg-success text-white'
    case 'รอการประเมิน':
      return 'text-white bg-purple-500'
    case 'กำลังดำเนินการ':
      return 'text-white bg-blue-500'
    case 'สิ้นสุดการดำเนินการ':
      return 'bg-gray-200 text-gray-500'
    case 'รอดำเนินการ':
    default:
      return 'bg-amber-500 text-white'
  }
}
