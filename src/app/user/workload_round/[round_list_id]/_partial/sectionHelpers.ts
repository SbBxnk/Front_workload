// helper สำหรับ format ตัวเลขที่ใช้ร่วมในส่วนแสดงผลของฟอร์มภาระงาน

// Section 1: แสดงจำนวนเต็มถ้าไม่มีทศนิยม, แสดงทศนิยมถ้ามี
export const formatNumber = (num: number): string => {
  if (!Number.isFinite(num)) return '-'
  const rounded = Number(num.toFixed(2))
  return Number.isInteger(rounded) ? rounded.toString() : num.toFixed(2)
}

// Section 2: ปัดเศษและแสดงเป็นจำนวนเต็ม
// ถ้าทศนิยมตำแหน่งที่ 2 >= 0.50 ให้ปัดขึ้น, ถ้า < 0.50 ให้ปัดลง
export const formatAverageLevel = (value: number): string => {
  // คำนวณทศนิยมตำแหน่งที่ 2 (เช่น 2.56 -> 6, 2.50 -> 0, 2.49 -> 9)
  const secondDecimal = Math.floor((value * 100) % 10)

  // ถ้า >= 5 (0.50) ปัดขึ้น, ถ้า < 5 (0.50) ปัดลง
  let rounded: number
  if (secondDecimal >= 5) {
    rounded = Math.ceil(value)
  } else {
    rounded = Math.floor(value)
  }

  return rounded.toString()
}
