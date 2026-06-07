// ฟอร์แมตวันที่เป็นรูปแบบไทย (พ.ศ. + ชื่อเดือนภาษาไทย)
export const formatThaiDate = (dateString: string) => {
  if (!dateString) return '-'

  const date = new Date(dateString)
  if (isNaN(date.getTime())) return dateString

  const day = date.getDate()
  const year = date.getFullYear() + 543

  const thaiMonths = [
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

  const month = thaiMonths[date.getMonth()]

  return `${day} ${month} ${year}`
}

// รอบนี้กำลังดำเนินการอยู่หรือไม่ (วันนี้อยู่ในช่วง start–end)
export const isCurrentRound = (startDate: string, endDate: string) => {
  const now = new Date()
  const start = new Date(startDate)
  const end = new Date(endDate)

  return now >= start && now <= end
}
