import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { jwtDecode } from 'jwt-decode'
import SetAssessorServices from '@/services/setAssessorServices'
import WorkloadGroupServices from '@/services/workloadGroupServices'
import PerformanceService from '@/services/performanceService'
import PerformanceEvaluationAssessmentService from '@/services/performanceEvaluationAssessmentService'
import SnapshotService from '@/services/snapshotService'
import { BASE_URL_FILE } from '@/provider/config'
import type { Terms } from '@/Types'
import type { PerformanceSnapshot } from '@/Types/performance'
import type { Task } from './types'

export interface ExportPDFParams {
  onExportStart: () => void
  onExportEnd: () => void
  year: string
  session: { accessToken?: string } | null
  roundId: number | undefined
  mergedTasks: Task[]
  workloadData: Task[]
  selectedGroupName?: string
  roundName: string
  terms: Terms[]
  performanceSnapshot: PerformanceSnapshot | null
  performanceScoreOutOf70: number
  userId?: number
  isFinalized?: boolean
}

// ฟังก์ชันสำหรับโหลดฟอนต์ไทย
export const loadThaiFont = async (): Promise<string> => {
  try {
    const response = await fetch('/THSarabunNew.ttf')
    const fontBlob = await response.blob()
    const reader = new FileReader()

    return new Promise<string>((resolve, reject) => {
      reader.onloadend = () => {
        const base64 = reader.result as string
        const base64String = base64.split(',')[1]
        resolve(base64String)
      }
      reader.onerror = reject
      reader.readAsDataURL(fontBlob)
    })
  } catch (error) {
    console.error('Error loading Thai font:', error)
    throw error
  }
}

// ฟังก์ชันสำหรับโหลดฟอนต์ไทย (Bold)
export const loadThaiFontBold = async (): Promise<string> => {
  try {
    const response = await fetch('/THSarabunNew Bold.ttf')
    const fontBlob = await response.blob()
    const reader = new FileReader()

    return new Promise<string>((resolve, reject) => {
      reader.onloadend = () => {
        const base64 = reader.result as string
        const base64String = base64.split(',')[1]
        resolve(base64String)
      }
      reader.onerror = reject
      reader.readAsDataURL(fontBlob)
    })
  } catch (error) {
    console.error('Error loading Thai font bold:', error)
    throw error
  }
}

// Helper function สำหรับดึง evaluation_score จาก formInfo
const getEvaluationScore = (formInfo: any): number => {
  if (formInfo.evaluation_score != null) {
    return Number(formInfo.evaluation_score)
  }
  // ถ้าไม่มี evaluation_score ให้ใช้ quality * workload เป็น fallback
  return formInfo.quality * formInfo.workload
}

// Helper function สำหรับ format ตัวเลข: แสดงจำนวนเต็มถ้าไม่มีทศนิยม, แสดงทศนิยมถ้ามี
const formatNumber = (num: number): string => {
  if (!Number.isFinite(num)) return '-'
  const rounded = Number(num.toFixed(2))
  return Number.isInteger(rounded) ? rounded.toString() : num.toFixed(2)
}

// Helper function สำหรับแสดงค่า evaluation_score หรือ fallback
const getEvaluationScoreString = (formInfo: any): string => {
  if (formInfo.evaluation_score != null) {
    return formatNumber(Number(formInfo.evaluation_score))
  }
  // ถ้าไม่มี evaluation_score ให้ใช้ quality * workload เป็น fallback
  return (formInfo.quality * formInfo.workload).toString()
}

export const handleExportPDFEvaluatedWithLinks = async (params: ExportPDFParams) => {

  try {

    params.onExportStart()



    const baseUrl = BASE_URL_FILE



    const doc = new jsPDF({

      orientation: 'portrait',

      unit: 'mm',

      format: 'a4',

      compress: true

    })



    const pageWidth = doc.internal.pageSize.getWidth()

    const pageHeight = doc.internal.pageSize.getHeight()

    const margin = 10



    try {

      const thaiFont = await loadThaiFont()

      const thaiFontBold = await loadThaiFontBold()



      doc.addFileToVFS('THSarabunNew.ttf', thaiFont)

      doc.addFont('THSarabunNew.ttf', 'THSarabunNew', 'normal')



      doc.addFileToVFS('THSarabunNew Bold.ttf', thaiFontBold)

      doc.addFont('THSarabunNew Bold.ttf', 'THSarabunNew', 'bold')



      doc.setFont('THSarabunNew')

    } catch (fontError) {

      console.warn('Could not load Thai font, using default:', fontError)

      doc.setFont('helvetica')

    }



    doc.setProperties({

      title: 'รายงานภาระงาน',

      subject: 'Workload Report',

      author: 'Workload System',

      keywords: 'workload, report, ภาระงาน',

      creator: 'Workload System'

    })



    doc.setTextColor(0, 0, 0)

    doc.setFontSize(14)

    const currentYear = params.year

    doc.setFont('THSarabunNew', 'bold')



    // วาด Header จะทำหลังจากสร้างเอกสารทั้งหมด (ใส่ทุกหน้า)



    // หัวข้อแบบฟอร์ม

    doc.setFontSize(12)

    doc.setFont('THSarabunNew', 'normal')



    // ดึงข้อมูล currentRound

    let currentRound: any = null

    try {

      if (params.session?.accessToken) {

        const response = await SetAssessorServices.getAllRounds()

        if (response.success && response.payload && Array.isArray(response.payload)) {

          const rounds = response.payload as any[]

          currentRound = rounds.find((round: any) => round.round_list_id === params.roundId)

        }

      }

    } catch (error) {

      console.error('Error fetching current round:', error)

    }



    // UI Checkbox สำหรับกลุ่มภาระงาน

    doc.setFontSize(14)

    doc.setFont('THSarabunNew', 'normal')



    // กลุ่มภาระงาน

    doc.text('กลุ่มภาระงาน:', 14, 35)



    // ดึงข้อมูล workload_group_name จาก API

    let actualWorkloadGroupName: string | null = null

    try {

      // ลองดึงจาก params.mergedTasks ก่อน (ถ้ามีข้อมูลแล้ว)

      if (Array.isArray(params.mergedTasks) && params.mergedTasks.length > 0) {

        const firstTaskWithGroup = params.mergedTasks.find(task => task.workload_group_name)

        if (firstTaskWithGroup?.workload_group_name) {

          actualWorkloadGroupName = firstTaskWithGroup.workload_group_name

        }

      }



      // ถ้ายังไม่มี ลองดึงจาก params.workloadData

      if (!actualWorkloadGroupName && Array.isArray(params.workloadData) && params.workloadData.length > 0) {

        const firstTaskWithGroup = params.workloadData.find(task => task.workload_group_name)

        if (firstTaskWithGroup?.workload_group_name) {

          actualWorkloadGroupName = firstTaskWithGroup.workload_group_name

        }

      }



      // ถ้ายังไม่มี ให้ดึงจาก API

      if (!actualWorkloadGroupName && params.userId && params.roundId && params.session?.accessToken) {

        try {

          const assessorListResponse = await SetAssessorServices.getSetAssessorListByRound(

            params.roundId,

            {}

          )



          if (assessorListResponse.success && assessorListResponse.payload) {

            const assessorList = Array.isArray(assessorListResponse.payload)

              ? assessorListResponse.payload

              : [assessorListResponse.payload]



            const userAssessor = assessorList.find((item: any) => item.as_u_id === params.userId)

            if (userAssessor?.workload_group_name) {

              actualWorkloadGroupName = userAssessor.workload_group_name

            }

          }

        } catch (apiError) {

          console.error('Error fetching workload group from API:', apiError)

        }

      }



      // ถ้ายังไม่มี ให้ใช้ params.selectedGroupName prop

      if (!actualWorkloadGroupName && params.selectedGroupName) {

        actualWorkloadGroupName = params.selectedGroupName

      }

    } catch (error) {

      console.error('Error getting workload group name:', error)

    }



    // ดึงข้อมูลกลุ่มภาระงานทั้งหมดจาก API

    let allGroups: string[] = []

    try {

      if (params.session?.accessToken) {

        const groupsResponse = await WorkloadGroupServices.getAllWorkloadGroups({

          search: '',

          page: 1,

          limit: 100,

          sort: 'workload_group_id',

          order: 'asc'

        } as any)



        if (groupsResponse.success && groupsResponse.payload) {

          const groupsArray = Array.isArray(groupsResponse.payload)

            ? groupsResponse.payload

            : [groupsResponse.payload]

          allGroups = groupsArray.map((g: any) => g.workload_group_name)

        }

      }

    } catch (error) {

      console.error('Error fetching workload groups:', error)

    }



    // กลุ่มต่างๆ - เช็กจากข้อมูลจริงที่ได้จาก API

    const groups = allGroups.length > 0

      ? allGroups.map(groupName => ({

        name: groupName,

        selected: actualWorkloadGroupName === groupName || actualWorkloadGroupName?.includes(groupName)

      }))

      : [

        { name: 'กลุ่มทั่วไป', selected: actualWorkloadGroupName === 'กลุ่มทั่วไป' || actualWorkloadGroupName?.includes('ทั่วไป') },

        { name: 'กลุ่มเน้นวิจัย', selected: actualWorkloadGroupName === 'กลุ่มเน้นวิจัย' || actualWorkloadGroupName?.includes('วิจัย') },

        { name: 'กลุ่มเน้นสอน', selected: actualWorkloadGroupName === 'กลุ่มเน้นสอน' || actualWorkloadGroupName?.includes('สอน') },

        { name: 'กลุ่มเน้นบริการวิชาการ', selected: actualWorkloadGroupName === 'กลุ่มเน้นบริการวิชาการ' || actualWorkloadGroupName?.includes('บริการ') }

      ]



    const checkboxY = 42

    groups.forEach((group, index) => {

      const x = 14 + (index % 2) * 100

      const y = checkboxY + Math.floor(index / 2) * 8



      // วาด checkbox

      doc.setLineWidth(0.5)

      doc.setDrawColor(0, 0, 0)

      doc.rect(x, y - 2, 3, 3)



      // ถ้าเลือกแล้ว ให้เติมสี

      if (group.selected) {

        doc.setFillColor(0, 0, 0)

        doc.rect(x + 0.5, y - 1.5, 2, 2, 'F')

      }



      // ข้อความ

      doc.setTextColor(group.selected ? 0 : 0, group.selected ? 0 : 0, group.selected ? 255 : 0) // เลือก = น้ำเงิน, ไม่เลือก = ดำ

      doc.text(group.name, x + 8, y)

      doc.setTextColor(0, 0, 0) // รีเซ็ตสี

    })



    // รอบการประเมิน

    const roundY = checkboxY + 16

    doc.text('รอบการประเมิน:', 14, roundY)



    // แสดง params.roundName แทน checkbox

    let displayRoundName = currentRound?.round_list_name || params.roundName || '-'



    // เพิ่มวันที่เริ่มต้นและสิ้นสุด

    if (currentRound?.date_start && currentRound?.date_end) {

      try {

        const formatThaiDate = (dateString: string) => {

          const date = new Date(dateString)

          if (!isNaN(date.getTime())) {

            const thaiMonths = [

              'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',

              'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'

            ]

            const day = date.getDate()

            const month = thaiMonths[date.getMonth()]

            const year = date.getFullYear() + 543

            return `${day} ${month} ${year}`

          }

          return dateString

        }



        const startDate = formatThaiDate(currentRound.date_start)

        const endDate = formatThaiDate(currentRound.date_end)

        displayRoundName = `${displayRoundName} (${startDate} - ${endDate})`

      } catch (error) {

        console.error('Error formatting round dates:', error)

      }

    }



    doc.setTextColor(0, 0, 255) // สีน้ำเงิน

    doc.text(displayRoundName, 40, roundY)

    doc.setTextColor(0, 0, 0) // กลับเป็นสีดำ



    // ข้อมูลส่วนตัวของผู้ใช้

    let userInfo: any = {}

    try {

      if (params.session?.accessToken) {

        const decoded = jwtDecode<any>(params.session.accessToken)

        userInfo = decoded

      }

    } catch (error) {

      console.warn('Could not decode token:', error)

    }



    // หน่วยงาน

    doc.setFontSize(14)

    doc.setFont('THSarabunNew', 'normal')

    const titleText = 'หน่วยงาน'

    doc.setTextColor(0, 0, 0)

    doc.text(titleText, 14, roundY + 8)

    const bluePart = 'คณะบริหารธุรกิจและศิลปศาสตร์'

    const blackPart = '  มหาวิทยาลัยเทคโนโลยีราชมงคลล้านนา'

    const subTextX = 14 + doc.getTextWidth(titleText) + 5

    doc.setTextColor(0, 0, 255)

    doc.text(bluePart, subTextX, roundY + 8)

    doc.setTextColor(0, 0, 0)

    doc.text(blackPart, subTextX + doc.getTextWidth(bluePart), roundY + 8)



    // ข้อมูลส่วนตัว - จัดแนว Y

    doc.setFont('THSarabunNew', 'normal')

    doc.setFontSize(14)

    let currentY = roundY + 18



    // ชื่อ - สกุล

    doc.text('1. ชื่อ - สกุล', 14, currentY)

    const fullName = `${userInfo.prefix_name || ''} ${userInfo.u_fname || '-'} ${userInfo.u_lname || '-'}`.trim()

    doc.setTextColor(0, 0, 255)

    doc.text(fullName, 40, currentY)

    doc.setTextColor(0, 0, 0)



    // ประเภทตำแหน่งวิชาการ

    doc.text('ประเภทตำแหน่งวิชาการ', 80, currentY)

    const positionName = `${userInfo.type_p_name || '-'}`

    doc.setTextColor(0, 0, 255)

    doc.text(positionName, 130, currentY)

    doc.setTextColor(0, 0, 0)

    currentY += 7



    // ตำแหน่งบริหาร

    doc.text('ตำแหน่งบริหาร', 18, currentY)

    const expositionName = `${userInfo.ex_position_name || '-'}`

    doc.setTextColor(0, 0, 255)

    doc.text(expositionName, 50, currentY)

    doc.setTextColor(0, 0, 0)

    currentY += 7



    // เงินเดือน

    doc.text('เงินเดือน', 18, currentY)

    const salaryText = userInfo.salary

      ? Number(userInfo.salary).toLocaleString('th-TH')

      : '-'

    doc.setTextColor(0, 0, 255)

    doc.text(salaryText, 40, currentY)

    doc.setTextColor(0, 0, 0)

    doc.text('บาท', 40 + doc.getTextWidth(salaryText) + 5, currentY)



    // เลขที่ประจำตำแหน่ง

    doc.text('เลขที่ประจำตำแหน่ง', 75, currentY)

    const idCardText = `${userInfo.u_id_card || '-'}`

    doc.setTextColor(0, 0, 255)

    doc.text(idCardText, 120, currentY)

    doc.setTextColor(0, 0, 0)

    currentY += 7



    // สังกัด

    doc.text('สังกัด', 18, currentY)

    const branchText = `${userInfo.branch_name || '-'}`

    const departmentText = `คณะบริหารธุรกิจและศิลปศาสตร์ มทร.ล้านนา ลําปาง`

    doc.setTextColor(0, 0, 255)

    doc.text(branchText + ' ' + departmentText, 40, currentY)

    doc.setTextColor(0, 0, 0)

    currentY += 7



    // มาช่วยราชการจากที่ใด

    doc.text('มาช่วยราชการจากที่ใด (ถ้ามี)', 18, currentY)

    doc.setTextColor(0, 0, 255)

    doc.text('-', 80, currentY)

    doc.setTextColor(0, 0, 0)



    // หน้าที่พิเศษ

    doc.text('หน้าที่พิเศษ', 100, currentY)

    doc.setTextColor(0, 0, 255)

    doc.text('-', 125, currentY)

    doc.setTextColor(0, 0, 0)

    currentY += 2



    // จัดรูปแบบวันที่เริ่มรับราชการ

    let workStartDate = '-'

    const workStartValue = userInfo.work_start || userInfo.start_date || userInfo.workStart || userInfo.startDate



    if (workStartValue) {

      try {

        const date = new Date(workStartValue)

        if (!isNaN(date.getTime())) {

          const thaiMonths = [

            'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',

            'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'

          ]

          const day = date.getDate()

          const month = thaiMonths[date.getMonth()]

          const year = date.getFullYear() + 543

          workStartDate = `${day} เดือน ${month} พ.ศ. ${year}`

        } else {

          workStartDate = workStartValue.toString()

        }

      } catch (error) {

        workStartDate = workStartValue.toString()

      }

    }



    // คำนวณรวมเวลารับราชการ

    let workDurationText = '-'

    if (workStartValue) {

      try {

        const startDate = new Date(workStartValue)

        const currentDate = new Date()



        if (!isNaN(startDate.getTime())) {

          let years = currentDate.getFullYear() - startDate.getFullYear()

          let months = currentDate.getMonth() - startDate.getMonth()

          let days = currentDate.getDate() - startDate.getDate()



          // ปรับค่าถ้าวันติดลบ

          if (days < 0) {

            months--

            const lastMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0)

            days += lastMonth.getDate()

          }



          // ปรับค่าถ้าเดือนติดลบ

          if (months < 0) {

            years--

            months += 12

          }



          const parts = []

          if (years > 0) parts.push(`${years} ปี`)

          if (months > 0) parts.push(`${months} เดือน`)

          if (days > 0) parts.push(`${days} วัน`)



          workDurationText = parts.length > 0 ? parts.join(' ') : '0 วัน'

        }

      } catch (error) {

        console.error('Error calculating work duration:', error)

      }

    }



    // ข้อมูลการรับราชการ - ใช้ currentY

    currentY += 7

    doc.text('2. เริ่มรับราชการเมื่อวันที่', 14, currentY)

    doc.setTextColor(0, 0, 255) // สีน้ำเงิน

    doc.text(`${workStartDate}`, 60, currentY)

    doc.setTextColor(0, 0, 0) // กลับเป็นสีดำ

    currentY += 7



    doc.text('รวมเวลารับราชการ', 18, currentY)

    doc.setTextColor(0, 0, 255) // สีน้ำเงิน

    doc.text(workDurationText, 60, currentY)

    doc.setTextColor(0, 0, 0) // กลับเป็นสีดำ

    currentY += 7



    // ข้อ 3: บันทึกการมาปฏิบัติงาน

    currentY += 10

    doc.setFontSize(14)

    doc.setFont('THSarabunNew', 'bold')

    doc.text('3. บันทึกการมาปฏิบัติงาน', 14, currentY)

    currentY += 7



    // สร้างตารางการลา

    const leaveData = [

      ['ประเภท', 'รอบที่ 1', '', 'รอบที่ 2', ''],

      ['', 'ครั้ง', 'วัน', 'ครั้ง', 'วัน'],

      ['ลาป่วย', '', '', '', ''],

      ['ลากิจ', '', '', '', ''],

      ['มาสาย', '', '', '', ''],

      ['ลาคลอดบุตร', '', '', '', ''],

      ['ลาอุปสมบท', '', '', '', ''],

      ['ลาป่วยจำเป็นต้องรักษาตัวเป็นเวลานานคราวเดียว หรือหลายคราวรวมกัน', '', '', '', ''],

      ['ขาดราชการ', '', '', '', '']

    ]



    // สร้างตารางการลาด้วยวิธี manual

    const tableStartY = currentY

    const cellHeight = 8

    const cellWidths = [105, 20, 20, 20, 20] // รวม 190 หน่วย เหมือนตารางภาระงาน



    // วาดเส้นตาราง

    doc.setLineWidth(0.1)

    doc.setDrawColor(0, 0, 0)



    // วาดเส้นแนวตั้ง

    let currentX = 14

    for (let i = 0; i <= 5; i++) {

      doc.line(currentX, tableStartY, currentX, tableStartY + (leaveData.length * cellHeight))

      if (i < 5) {

        currentX += cellWidths[i]

      }

    }



    // วาดเส้นแนวนอน

    for (let i = 0; i <= leaveData.length; i++) {

      const y = tableStartY + (i * cellHeight)

      doc.line(14, y, currentX, y)

    }



    // เขียนข้อมูลในตาราง

    doc.setFontSize(12)

    doc.setFont('THSarabunNew', 'normal')



    // เขียนหัวข้อตาราง

    doc.setFont('THSarabunNew', 'bold')



    // "ประเภท" - อยู่กึ่งกลางของคอลัมน์ 0 และครอบคลุม 2 แถว

    const typeCenterX = 16 + cellWidths[0] / 2

    const typeCenterY = tableStartY + (cellHeight) + 5 // อยู่กึ่งกลางของ 2 แถว

    doc.text('ประเภท', typeCenterX, typeCenterY)



    // "รอบที่ 1" - อยู่กึ่งกลางของคอลัมน์ 1-2

    const round1CenterX = 16 + (cellWidths[0]) + (cellWidths[1] + cellWidths[2]) / 2

    doc.text('รอบที่ 1', round1CenterX, tableStartY + 5)



    // "รอบที่ 2" - อยู่กึ่งกลางของคอลัมน์ 3-4

    const round2CenterX = 16 + (cellWidths[0]) + cellWidths[1] + cellWidths[2] + (cellWidths[3] + cellWidths[4]) / 2

    doc.text('รอบที่ 2', round2CenterX, tableStartY + 5)



    // "ครั้ง" และ "วัน" สำหรับรอบที่ 1 และ 2

    let headerX = 16 + cellWidths[0] // เริ่มจากหลังคอลัมน์ประเภท



    // "ครั้ง" รอบที่ 1

    doc.text('ครั้ง', headerX + cellWidths[1] / 2, tableStartY + cellHeight + 5)

    headerX += cellWidths[1]



    // "วัน" รอบที่ 1

    doc.text('วัน', headerX + cellWidths[2] / 2, tableStartY + cellHeight + 5)

    headerX += cellWidths[2]



    // "ครั้ง" รอบที่ 2

    doc.text('ครั้ง', headerX + cellWidths[3] / 2, tableStartY + cellHeight + 5)

    headerX += cellWidths[3]



    // "วัน" รอบที่ 2

    doc.text('วัน', headerX + cellWidths[4] / 2, tableStartY + cellHeight + 5)



    // เขียนข้อมูลในตาราง

    leaveData.forEach((row, rowIndex) => {

      if (rowIndex >= 2) { // เริ่มจากแถวที่ 3 (ข้อมูล)

        let x = 16

        row.forEach((cell, colIndex) => {

          if (cell) {

            doc.setFont('THSarabunNew', 'normal')

            doc.text(cell, x, tableStartY + (rowIndex * cellHeight) + 5)

          }

          x += cellWidths[colIndex] || 30

        })

      }

    })



    // อัปเดต currentY หลังจากตาราง

    currentY = tableStartY + (leaveData.length * cellHeight) + 10

    // ลงชื่อ

    doc.setFontSize(14)

    doc.setFont('THSarabunNew', 'normal')

    doc.text('ลงชื่อ..........................................................................................................................', doc.internal.pageSize.getWidth() / 2 - 90, currentY)

    doc.text('ผู้ปฏิบัติหน้าที่ตรวจสอบการมาปฏิบัติราชการของหน่วยงาน', doc.internal.pageSize.getWidth() / 2 + 15, currentY)



    // ข้อ 4: การกระทำผิดวินัย/การถูกลงโทษ

    currentY += 14

    doc.setFontSize(14)

    doc.setFont('THSarabunNew', 'bold')

    doc.text('4. การกระทำผิดวินัย/การถูกลงโทษ', 14, currentY)

    currentY += 10



    // เส้นประสำหรับเขียนข้อมูล

    doc.setLineWidth(0.2)

    doc.setDrawColor(0, 0, 0)



    // วาดเส้นประด้วยวิธี manual

    const dashLength = 0.5

    const gapLength = 1

    const startX = 14

    const endX = doc.internal.pageSize.getWidth() - 14



    // เส้นประบรรทัดที่ 1

    let x = startX

    while (x < endX) {

      doc.line(x, currentY, Math.min(x + dashLength, endX), currentY)

      x += dashLength + gapLength

    }

    currentY += 8



    // เส้นประบรรทัดที่ 2

    x = startX

    while (x < endX) {

      doc.line(x, currentY, Math.min(x + dashLength, endX), currentY)

      x += dashLength + gapLength

    }

    currentY += 8



    // เส้นประบรรทัดที่ 3

    x = startX

    while (x < endX) {

      doc.line(x, currentY, Math.min(x + dashLength, endX), currentY)

      x += dashLength + gapLength

    }

    currentY += 15





    // ตรวจสอบว่าหัวข้อจะอยู่ในหน้าที่ถูกต้องหรือไม่

    const docPageHeight = doc.internal.pageSize.getHeight()

    const docMargin = 20

    const availableHeight = docPageHeight - docMargin







    // ถ้าหัวข้อจะเกินหน้า ให้ขึ้นหน้าใหม่

    if (currentY > availableHeight) {

      doc.addPage()

      currentY = docMargin

    }



    doc.setFontSize(14)

    doc.setFont('THSarabunNew', 'bold')

    // บังคับให้หัวข้ออยู่ต่ำกว่าหัวกระดาษอย่างน้อย 34mm

    if (currentY < 34) {

      currentY = 34

    }

    doc.text('ส่วนที่ 1 องค์ประกอบที่ 1 ผลสัมฤทธิ์ของงาน', 14, currentY)



    // อัปเดต currentY หลังจากลงชื่อ

    currentY -= 5



    // เพิ่มตารางภาระงานด้านล่างหัวข้อ

    const workloadTableData: any[] = []

    const workloadRowLinks: Array<string | null> = []



    // ใช้ params.mergedTasks ให้ตรงกับ UI และรวมรายการว่างด้วย

    if (Array.isArray(params.mergedTasks)) {

      params.mergedTasks.forEach((task) => {

        const taskTitle = task.quantity_workload_hours

          ? `${task.task_id}. ${task?.task_name || 'Unknown Task'} (ภาระงานขั้นต่ำ) : ${task.quantity_workload_hours} ภาระงาน/สัปดาห์`

          : `${task.task_id}. ${task?.task_name || 'Unknown Task'}`



        workloadTableData.push([

          {

            content: taskTitle,

            colSpan: 6,

            styles: {

              fillColor: [255, 255, 255],

              textColor: [0, 0, 0],

              fontStyle: 'bold',

              fontSize: 14,

              font: 'THSarabunNew'

            }

          },

          '', '', '', '', ''

        ])

        workloadRowLinks.push(null)



        const allSubtasks = Object.values(task.subtasks)

        allSubtasks.forEach((subtask, subtaskIndex) => {

          workloadTableData.push([

            {

              content: `    ${task.task_id}.${subtaskIndex + 1} ${subtask?.subtask_name || 'Unknown Subtask'}`,

              colSpan: 6,

              styles: {

                fillColor: [255, 255, 255],

                textColor: [0, 0, 0],

                fontSize: 14,

                font: 'THSarabunNew'

              }

            },

            '', '', '', '', ''

          ])

          workloadRowLinks.push(null)



          if (!subtask.form_infos || subtask.form_infos.length === 0) {

            workloadTableData.push([

              { content: `        ${task.task_id}.${subtaskIndex + 1}.1`, styles: { minCellHeight: 12 } },

              { content: '', styles: { minCellHeight: 12 } },

              { content: '', styles: { minCellHeight: 12, halign: 'center' } },

              { content: '', styles: { minCellHeight: 12, halign: 'center' } },

              { content: '', styles: { minCellHeight: 12, halign: 'center' } },

              { content: '', styles: { minCellHeight: 12 } }

            ])

            workloadRowLinks.push(null)

            return

          }



          subtask.form_infos.forEach((formInfo, index) => {

            const rowKey = `${task.task_id}-${subtask.subtask_id}-${index}`



            let evidenceText = '-'

            let evidenceLinks: string[] = []



            if (formInfo.files && formInfo.files.length > 0) {

              evidenceText = formInfo.files.map((f, i) => `${i + 1}. ${f.file_name}`).join('\n')

              evidenceLinks = formInfo.files.map(f => `${baseUrl}/files/${f.file_name}`)

            } else if (formInfo.links && formInfo.links.length > 0) {

              evidenceText = formInfo.links.map((l, i) => `${i + 1}. ${l.link_name || l.link_path}`).join('\n')

              evidenceLinks = formInfo.links.map(l => {

                let url = l.link_path || ''

                if (!url.startsWith('http://') && !url.startsWith('https://')) {

                  url = `https://${url}`

                }

                return url

              })

            } else if (formInfo.evidence) {

              if (formInfo.file_type === 'link') {

                let url = formInfo.link_path || formInfo.evidence || ''

                if (!url.startsWith('http://') && !url.startsWith('https://')) {

                  url = `https://${url}`

                }

                evidenceText = formInfo.link_name || formInfo.evidence

                evidenceLinks = [url]

              } else {

                evidenceText = formInfo.evidence

                evidenceLinks = [`${baseUrl}/files/${formInfo.evidence}`]

              }

            }



            workloadTableData.push([

              `        ${task.task_id}.${subtaskIndex + 1}.${index + 1} ${formInfo.form_title}`,

              evidenceText,

              formInfo.quality.toString(),

              formInfo.workload.toString(),

              getEvaluationScoreString(formInfo), // ใช้ evaluation_score แทน quality * workload

              formInfo.description && formInfo.description !== '-' ? formInfo.description : '-'

            ])

            workloadRowLinks.push(evidenceLinks.length > 0 ? evidenceLinks[0] : null)

          }

          )

        })



        const hasAny = allSubtasks.some(st => st.form_infos && st.form_infos.length > 0)

        const taskTotal = allSubtasks.reduce((subSum, subtask) =>

          subSum + (subtask.form_infos || []).reduce((formSum, formInfo) =>

            formSum + getEvaluationScore(formInfo), 0 // ใช้ evaluation_score แทน quality * workload

          ), 0

        )



        // สำหรับ evaluated version ไม่ต้องเช็ค isBelowRequired เนื่องจากใช้ evaluation_score
        const isBelowRequired = false



        workloadTableData.push([

          '',

          '',

          '',

          { content: 'รวม', styles: { halign: 'right', fontStyle: 'bold', font: 'THSarabunNew', fontSize: 14, textColor: [0, 0, 255], fillColor: [255, 255, 255] }, colSpan: 2 },

          {

            content: hasAny ? taskTotal.toString() : '-',

            styles: {

              halign: 'center',

              font: 'THSarabunNew',

              fontSize: 14,

              textColor: isBelowRequired ? [255, 0, 0] : [0, 0, 255],

              fillColor: [255, 255, 255]

            }

          },

          ''

        ])

        workloadRowLinks.push(null)

      })

    }



    // สร้างตารางภาระงาน

    autoTable(doc, {

      startY: currentY + 10,

      margin: { left: 10, right: 10, top: 30 },

      head: [[

        '(1)\nภาระงาน/กิจกรรม/โครงการ/งาน',

        '(2)\nหลักฐาน',

        '(3)\nจำนวน',

        '(4)\nภาระงาน',

        '(5)\nรวมภาระงาน\n(3 x 4)',

        'หมายเหตุ'

      ]],

      body: workloadTableData,

      theme: 'grid',

      styles: {

        font: 'THSarabunNew',

        fontSize: 14,

        cellPadding: 2,

        lineColor: [0, 0, 0],

        lineWidth: 0.1,

        textColor: [0, 0, 0],

        fillColor: [255, 255, 255],

        overflow: 'linebreak',

        cellWidth: 'wrap'

      },

      headStyles: {

        fillColor: [255, 255, 255],

        textColor: [0, 0, 0],

        fontStyle: 'bold',

        halign: 'center',

        fontSize: 14,

        font: 'THSarabunNew',

        lineWidth: 0.1,

        lineColor: [0, 0, 0]

      },

      columnStyles: {

        0: {

          cellWidth: 50,

          font: 'THSarabunNew',

          textColor: [0, 0, 0],

          overflow: 'linebreak',

          halign: 'left'

        },

        1: {

          cellWidth: 43,

          textColor: [13, 131, 186],

          font: 'THSarabunNew',

          overflow: 'linebreak'

        },

        2: {

          cellWidth: 20,

          halign: 'center',

          font: 'THSarabunNew',

          textColor: [0, 0, 255],

          fontStyle: 'normal'

        },

        3: {

          cellWidth: 20,

          halign: 'center',

          font: 'THSarabunNew',

          textColor: [0, 0, 255],

          fontStyle: 'normal'

        },

        4: {

          cellWidth: 27,

          halign: 'center',

          textColor: [0, 0, 255],

          font: 'THSarabunNew',

          fontStyle: 'bold'

        },

        5: {

          cellWidth: 30,

          font: 'THSarabunNew',

          textColor: [0, 0, 0],

          overflow: 'linebreak',

          halign: 'left'

        }

      },

      showHead: 'everyPage',

      showFoot: 'everyPage',

      didDrawCell: (data: any) => {

        if (data.cell.section === 'body' && data.column.index === 1) {

          const link = workloadRowLinks[data.row.index] || null

          if (link) {

            doc.link(

              data.cell.x,

              data.cell.y,

              data.cell.width,

              data.cell.height,

              { url: link }

            )

          }

        }

      }

    })



    // อัปเดต currentY หลังจากตาราง

    currentY = (doc as any).lastAutoTable.finalY + 15



    if (params.terms && params.terms.length > 0) {

      doc.setFontSize(14)

      currentY += 10

      doc.text('เกณฑ์การประเมินภาระงาน', 14, currentY)

      currentY += 10



      const uniqueTasks = [...new Set(params.terms.map((term) => term?.task_name || 'Unknown Task'))]

      const uniqueGroups = params.selectedGroupName

        ? [params.selectedGroupName]

        : [...new Set(params.terms.map((term) => term?.workload_group_name || 'Unknown Group'))]





      const criteriaTableData: any[] = []



      criteriaTableData.push(['ภาระงาน', ...uniqueGroups.map(group => group)])



      uniqueTasks.forEach((taskName) => {

        const row = [taskName]

        uniqueGroups.forEach((groupName) => {

          const item = params.terms.find(

            (term) => term?.task_name === taskName && term?.workload_group_name === groupName

          )

          row.push(item ? item.quantity_workload_hours.toString() : '0')

        })

        criteriaTableData.push(row)

      })



      const totalRow = ['ผลรวม (ไม่น้อยกว่า)']

      uniqueGroups.forEach((groupName) => {

        const total = uniqueTasks.reduce((sum, taskName) => {

          const item = params.terms.find(

            (term) => term?.task_name === taskName && term?.workload_group_name === groupName

          )

          return sum + (item ? item.quantity_workload_hours : 0)

        }, 0)

        totalRow.push(total.toString())

      })

      criteriaTableData.push(totalRow)



      autoTable(doc, {

        startY: currentY,

        margin: { left: margin, right: margin, top: 30 },

        head: [criteriaTableData[0]],

        body: criteriaTableData.slice(1),

        theme: 'grid',

        styles: {

          font: 'THSarabunNew',

          fontSize: 14,

          cellPadding: 2,

          lineColor: [0, 0, 0],

          lineWidth: 0.1,

          textColor: [0, 0, 0],

          fillColor: [255, 255, 255]

        },

        headStyles: {

          fillColor: [200, 200, 200],

          textColor: [0, 0, 0],

          fontStyle: 'bold',

          halign: 'center',

          fontSize: 14,

          font: 'THSarabunNew'

        }

      })



      // อัปเดต currentY หลังจากตารางเกณฑ์การประเมิน

      currentY = (doc as any).lastAutoTable.finalY + 15

    }



    const tableData: any[] = []

    const rowLinks: Array<string | null> = []



    // ส่วนซ้ำด้านล่าง: ใช้ params.mergedTasks และรวมรายการว่างด้วย

    if (Array.isArray(params.mergedTasks)) {

      params.mergedTasks.forEach((task) => {

        const taskTitle = task.quantity_workload_hours

          ? `${task.task_id}. ${task?.task_name || 'Unknown Task'} (ภาระงานขั้นต่ำ) : ${task.quantity_workload_hours} ภาระงาน/สัปดาห์`

          : `${task.task_id}. ${task?.task_name || 'Unknown Task'}`



        tableData.push([

          {

            content: taskTitle,

            colSpan: 6,

            styles: {

              fillColor: [255, 255, 255],

              textColor: [0, 0, 0],

              fontStyle: 'bold',

              fontSize: 14,

              font: 'THSarabunNew'

            }

          },

          '', '', '', '', ''

        ])

        rowLinks.push(null)



        const allSubtasks = Object.values(task.subtasks)

        allSubtasks.forEach((subtask, subtaskIndex) => {

          tableData.push([

            {

              content: `    ${task.task_id}.${subtaskIndex + 1} ${subtask?.subtask_name || 'Unknown Subtask'}`,

              colSpan: 6,

              styles: {

                fillColor: [255, 255, 255],

                textColor: [0, 0, 0],

                fontSize: 14,

                font: 'THSarabunNew'

              }

            },

            '', '', '', '', ''

          ])

          rowLinks.push(null)



          if (!subtask.form_infos || subtask.form_infos.length === 0) {

            // แถว placeholder เมื่อไม่มีข้อมูล: แสดงเฉพาะเลขข้อย่อย และปล่อยช่องว่าง พร้อมเพิ่มความสูงแถว

            tableData.push([

              { content: `        ${task.task_id}.${subtaskIndex + 1}.1`, styles: { minCellHeight: 12 } },

              { content: '', styles: { minCellHeight: 12 } },

              { content: '', styles: { minCellHeight: 12, halign: 'center' } },

              { content: '', styles: { minCellHeight: 12, halign: 'center' } },

              { content: '', styles: { minCellHeight: 12, halign: 'center' } },

              { content: '', styles: { minCellHeight: 12 } }

            ])

            rowLinks.push(null)

            return

          }



          subtask.form_infos.forEach((formInfo, index) => {

            const rowKey = `${task.task_id}-${subtask.subtask_id}-${index}`



            let evidenceText = '-'

            let evidenceLinks: string[] = []



            if (formInfo.files && formInfo.files.length > 0) {

              // แสดงเป็นรายการ 1. 2. 3. แต่ละบรรทัด

              evidenceText = formInfo.files.map((f, i) => `${i + 1}. ${f.file_name}`).join('\n')

              evidenceLinks = formInfo.files.map(f => `${baseUrl}/files/${f.file_name}`)

            } else if (formInfo.links && formInfo.links.length > 0) {

              // แสดงเป็นรายการ 1. 2. 3. แต่ละบรรทัด

              evidenceText = formInfo.links.map((l, i) => `${i + 1}. ${l.link_name || l.link_path}`).join('\n')

              evidenceLinks = formInfo.links.map(l => {

                let url = l.link_path || ''

                if (!url.startsWith('http://') && !url.startsWith('https://')) {

                  url = `https://${url}`

                }

                return url

              })

            } else if (formInfo.evidence) {

              if (formInfo.file_type === 'link') {

                let url = formInfo.link_path || formInfo.evidence || ''

                if (!url.startsWith('http://') && !url.startsWith('https://')) {

                  url = `https://${url}`

                }

                evidenceText = formInfo.link_name || formInfo.evidence

                evidenceLinks = [url]

              } else {

                evidenceText = formInfo.evidence

                evidenceLinks = [`${baseUrl}/files/${formInfo.evidence}`]

              }

            }



            tableData.push([

              `        ${task.task_id}.${subtaskIndex + 1}.${index + 1} ${formInfo.form_title}`,

              evidenceText,

              formInfo.quality.toString(),

              formInfo.workload.toString(),

              getEvaluationScoreString(formInfo), // ใช้ evaluation_score แทน quality * workload

              formInfo.description && formInfo.description !== '-' ? formInfo.description : '-'

            ])

            rowLinks.push(evidenceLinks.length > 0 ? evidenceLinks[0] : null)

          })

        })



        const hasAny = allSubtasks.some(st => st.form_infos && st.form_infos.length > 0)

        const taskTotal = allSubtasks.reduce((subSum, subtask) =>

          subSum + (subtask.form_infos || []).reduce((formSum, formInfo) =>

            formSum + getEvaluationScore(formInfo), 0 // ใช้ evaluation_score แทน quality * workload

          ), 0

        )



        // สำหรับ evaluated version ไม่ต้องเช็ค isBelowRequired เนื่องจากใช้ evaluation_score
        const isBelowRequired = false





        tableData.push([

          '',

          '',

          '',

          { content: 'รวม', styles: { halign: 'bold', font: 'THSarabunNew', fontSize: 14, textColor: [0, 0, 255], fillColor: [255, 255, 255] }, colSpan: 2 },

          {

            content: taskTotal.toString(),

            styles: {

              halign: 'center',

              font: 'THSarabunNew',

              fontStyle: 'bold',

              fontSize: 14,

              textColor: isBelowRequired ? [255, 0, 0] : [0, 0, 255],

              fillColor: [255, 255, 255]

            }

          },

          ''

        ])

        rowLinks.push(null)

      })

    }





    const totalItems = Array.isArray(params.workloadData) ? params.workloadData.reduce((sum, task) =>

      sum + Object.values(task.subtasks).reduce((subSum, subtask) =>

        subSum + subtask.form_infos.length, 0

      ), 0

    ) : 0



    // ไม่ใช้ totalWorkload ในไฟล์นี้ เนื่องจากเราใช้ evaluation_score แทน
    // const totalWorkload = Array.isArray(params.workloadData) ? params.workloadData.reduce((sum, task) =>

    //   sum + Object.values(task.subtasks).reduce((subSum, subtask) =>

    //     subSum + subtask.form_infos.reduce((formSum, formInfo) =>

    //       formSum + (formInfo.quality * formInfo.workload), 0

    //     ), 0

    //   ), 0

    // ) : 0



    // สรุปผลสัมฤทธิ์ของงาน (ขึ้นหน้าใหม่เสมอ)

    doc.addPage()

    let summaryStartY = 32

    doc.setFont('THSarabunNew', 'bold')

    doc.setFontSize(14)

    doc.text('ส่วนที่ 1 องค์ประกอบที่ 1 ผลสัมฤทธิ์ของงาน', 14, summaryStartY)

    summaryStartY += 5



    // สร้างข้อมูลตารางสรุปให้ตรงกับ UI: ภาระงาน/จำนวนภาระงานต่อสัปดาห์/รวมภาระงาน/หมายเหตุ

    const summaryHead = [[

      'ภาระงาน/กิจกรรม/โครงการ/งาน',

      'จำนวนภาระงานต่อสัปดาห์',

      'รวมภาระงาน',

      'หมายเหตุ'

    ]]



    const summaryBody: any[] = []

    if (Array.isArray(params.mergedTasks)) {

      params.mergedTasks.forEach((task, index) => {

        const hasAny = Object.values(task.subtasks).some(st => st.form_infos.length > 0)

        const taskTotal = Object.values(task.subtasks).reduce((subSum, subtask) =>

          subSum + subtask.form_infos.reduce((formSum, formInfo) =>

            formSum + getEvaluationScore(formInfo), 0 // ใช้ evaluation_score แทน quality * workload

          ), 0

        )

        const displayTaskName = task?.task_name

          ? (task?.task_id ? `${task.task_id}. ${task.task_name}` : task.task_name)

          : ''



        // ใช้ค่า quantity_workload_hours จาก task โดยตรง (เหมือนตารางแรก)

        const minimumWorkload = task.quantity_workload_hours

          ? task.quantity_workload_hours.toString()

          : ''



        // ตรวจสอบว่าคะแนนถึงเกณฑ์หรือไม่

        const isBelowRequired = minimumWorkload && taskTotal < parseFloat(minimumWorkload)



        summaryBody.push([

          displayTaskName,

          minimumWorkload || '-',

          {

            content: hasAny ? taskTotal.toString() : '-',

            styles: {

              halign: 'center',

              textColor: isBelowRequired ? [255, 0, 0] : [0, 0, 255] // สีแดงถ้าไม่ถึงเกณฑ์

            }

          },

          ''

        ])

      })

    }



    // เพิ่มแถวสรุป "รวม"

    const firstFive = Array.isArray(params.mergedTasks) ? params.mergedTasks.slice(0, 5) : []

    const hasAnySummary = firstFive.some(task => Object.values(task.subtasks).some(st => st.form_infos.length > 0))

    const totalSummary = firstFive.reduce((sum, task) =>

      sum + Object.values(task.subtasks).reduce((subSum, subtask) =>

        subSum + subtask.form_infos.reduce((formSum, formInfo) =>

          formSum + getEvaluationScore(formInfo), 0 // ใช้ evaluation_score แทน quality * workload

        ), 0

      ), 0

    )



    summaryBody.push([

      { content: '(6) รวม', colSpan: 2, styles: { fontStyle: 'bold', halign: 'right' } },

      {

        content: hasAnySummary ? totalSummary.toString() : '-',

        styles: { fontStyle: 'bold', halign: 'center', textColor: [0, 0, 255] }

      },

      ''

    ])



    autoTable(doc, {

      startY: summaryStartY,

      margin: { left: 10, right: 10, top: 30 },

      head: summaryHead,

      body: summaryBody,

      theme: 'grid',

      styles: {

        font: 'THSarbunNew',

        fontSize: 14,

        cellPadding: 2,

        lineColor: [0, 0, 0],

        lineWidth: 0.1,

        textColor: [0, 0, 0],

        fillColor: [255, 255, 255]

      },

      headStyles: {

        fillColor: [255, 255, 255],

        textColor: [0, 0, 0],

        fontStyle: 'bold',

        halign: 'center',

        fontSize: 14,

        font: 'THSarabunNew',

        lineWidth: 0.1,

        lineColor: [0, 0, 0]

      },

      columnStyles: {

        0: { cellWidth: 80, font: 'THSarabunNew' },

        1: { cellWidth: 40, halign: 'center', font: 'THSarabunNew' },

        2: { cellWidth: 30, halign: 'center', font: 'THSarabunNew' },

        3: { cellWidth: 40, font: 'THSarabunNew' }

      },

    })



    // อัปเดต currentY หลังจากตารางสรุป

    const summaryTableFinalY = (doc as any).lastAutoTable.finalY + 10



    // แสดงข้อความ "สรุปคะแนนส่วนผลสัมฤทธิ์ของงาน" พร้อมคะแนน

    doc.setFontSize(14)

    doc.setFont('THSarabunNew', 'normal')



    const scoreText = `สรุปคะแนนส่วนผลสัมฤทธิ์ของงาน คะแนนเต็ม 70 คะแนน`



    // วางข้อความทางซ้าย

    doc.text(scoreText, 14, summaryTableFinalY)



    // วางค่า calculated ทางขวา

    const textBeforeScore = '(7) คะแนนที่ได้ '

    const scoreNumber = formatNumber(params.performanceScoreOutOf70)

    const textAfterScore = ''



    // คำนวณตำแหน่งเริ่มต้นของข้อความทางขวา

    const totalScoreWidth = doc.getTextWidth(textBeforeScore + scoreNumber + textAfterScore)

    const scoreStartX = pageWidth - 14 - totalScoreWidth



    doc.setFont('THSarabunNew', 'normal')

    doc.setTextColor(0, 0, 0) // สีดำ

    doc.text(textBeforeScore, scoreStartX, summaryTableFinalY)



    // วาดตัวเลขสีน้ำเงิน

    const beforeWidth = doc.getTextWidth(textBeforeScore)

    doc.setFont('THSarabunNew', 'bold')

    doc.setTextColor(0, 0, 255) // สีน้ำเงิน

    doc.text(scoreNumber, scoreStartX + beforeWidth, summaryTableFinalY)



    // วาดข้อความหลังสีดำ

    const numberWidth = doc.getTextWidth(scoreNumber)

    doc.setFont('THSarabunNew', 'normal')

    doc.setTextColor(0, 0, 0) // สีดำ

    doc.text(textAfterScore, scoreStartX + beforeWidth + numberWidth, summaryTableFinalY)



    // ส่วนที่ 2 องค์ประกอบที่ 2 พฤติกรรมการปฏิบัติงาน (สมรรถนะ)

    let finalEvaluationLevelsY = 0
    if (params.performanceSnapshot && params.performanceSnapshot.evaluations && params.performanceSnapshot.evaluations.length > 0) {

      // ขึ้นหน้าใหม่สำหรับส่วนที่ 2

      doc.addPage()

      let performanceStartY = 32



      doc.setFont('THSarabunNew', 'bold')

      doc.setFontSize(14)

      doc.text('ส่วนที่ 2 องค์ประกอบที่ 2 พฤติกรรมการปฏิบัติงาน (สมรรถนะ)', 14, performanceStartY)

      performanceStartY += 5



      // จัดเรียง evaluations ตาม competency_order

      const sortedEvaluations = [...params.performanceSnapshot.evaluations].sort((a, b) => {

        const orderA = a.competency_order || 0

        const orderB = b.competency_order || 0

        return orderA - orderB

      })

      // ดึง expectedLevels จาก API
      let expectedLevels: any[] = []
      let userPositionId: number | null = null

      if (params.session?.accessToken) {
        try {
          const expectedLevelsRes = await PerformanceService.getAllExpectedLevels()
          if (expectedLevelsRes.success && expectedLevelsRes.payload) {
            expectedLevels = Array.isArray(expectedLevelsRes.payload) ? expectedLevelsRes.payload : [expectedLevelsRes.payload]
          }

          // หา userPositionId จาก token
          const decodedUser = jwtDecode<any>(params.session.accessToken)
          userPositionId = decodedUser?.position_id ?? null
        } catch (error) {
          console.error('Error fetching expected levels:', error)
        }
      }

      // ตำแหน่งที่ใช้ในระบบ
      const POSITIONS = [
        { position_id: 1, position_name: 'อาจารย์', short_name: 'อ.' },
        { position_id: 2, position_name: 'ผู้ช่วยศาสตราจารย์', short_name: 'ผศ.' },
        { position_id: 3, position_name: 'รองศาสตราจารย์', short_name: 'รศ.' },
        { position_id: 4, position_name: 'ศาสตราจารย์', short_name: 'ศ.' },
      ]

      // สร้าง map ของ expectedLevels ตาม competency_id และ position_id
      const expectedLevelsMap: Record<number, Record<number, number>> = {}
      expectedLevels.forEach((level: any) => {
        const competencyId = Number(level?.competency_id ?? level?.competencyId)
        const positionId = Number(level?.position_id ?? level?.positionId)
        const expectedLevel = Number(level?.expected_level ?? level?.expectedLevel)

        if (Number.isFinite(competencyId) && Number.isFinite(positionId) && Number.isFinite(expectedLevel)) {
          if (!expectedLevelsMap[competencyId]) {
            expectedLevelsMap[competencyId] = {}
          }
          expectedLevelsMap[competencyId][positionId] = expectedLevel
        }
      })

      // สร้าง header 2 แถว
      const performanceHead = [
        [
          { content: 'ลำดับ', rowSpan: 2 },
          { content: 'สมรรถนะหลัก (ที่สภามหาวิทยาลัยกำหนด)', rowSpan: 2 },
          { content: 'ระดับสมรรถนะที่คาดหวัง', colSpan: 4 },
          { content: 'ระดับสมรรถนะที่แสดงออก', rowSpan: 2 }
        ],
        [
          ...POSITIONS.map((pos: { position_id: number; position_name: string; short_name: string }) => pos.short_name)
        ]
      ]

      // สร้าง map ของ competency_name -> competency_id จาก expectedLevels
      const competencyNameToIdMap: Record<string, number> = {}
      expectedLevels.forEach((level: any) => {
        const competencyId = Number(level?.competency_id ?? level?.competencyId)
        const competencyName = level?.competency_name
        if (Number.isFinite(competencyId) && competencyName) {
          competencyNameToIdMap[competencyName] = competencyId
        }
      })

      // สร้าง body โดยแสดง expected_level ตามตำแหน่งทั้งหมด
      // สำหรับ evaluated version: ถ้าเป็น isFinalized ให้ใช้ average assessed levels (จากผู้ประเมิน) แสดงในคอลัมน์สุดท้าย
      // มิฉะนั้น ให้ใช้ demonstrated_level เช่นเดิม

      // ถ้า isFinalized ให้พยายามดึง average assessed levels (formlist_id -> averages)
      let averageAssessedLevels: Array<{ competency_id: number; average_assessed_level: number }> = []
      if (params.isFinalized && params.session?.accessToken && params.userId && params.roundId) {
        try {
          const formlistResp: any = await SnapshotService.getFormlistId(params.userId, params.roundId)
          if (formlistResp && formlistResp.success && Array.isArray(formlistResp.payload) && formlistResp.payload.length > 0) {
            const formlistId = formlistResp.payload[0].formlist_id
            try {
              averageAssessedLevels = await PerformanceEvaluationAssessmentService.getAverageAssessedLevels(
                formlistId
              )
            } catch (err) {
              console.error('Error fetching average assessed levels:', err)
              averageAssessedLevels = []
            }
          }
        } catch (err) {
          console.error('Error fetching formlist id for averages:', err)
          averageAssessedLevels = []
        }
      }

      // map competency_id -> average value
      const averageMap: Record<number, number> = {}
      averageAssessedLevels.forEach((a: any) => {
        if (a && a.competency_id != null && a.average_assessed_level != null) {
          averageMap[Number(a.competency_id)] = Number(a.average_assessed_level)
        }
      })

      // helper for rounding average as in UI (section_2.formatAverageLevel)
      const formatAverageLevel = (value: number): string => {
        if (!Number.isFinite(value)) return '-'
        const secondDecimal = Math.floor((value * 100) % 10)
        let rounded: number
        if (secondDecimal >= 5) {
          rounded = Math.ceil(value)
        } else {
          rounded = Math.floor(value)
        }
        return rounded.toString()
      }

      // numeric version of the same rounding rule (returns number)
      const formatAverageLevelNumber = (value: number): number | null => {
        if (!Number.isFinite(value)) return null
        const secondDecimal = Math.floor((value * 100) % 10)
        if (secondDecimal >= 5) {
          return Math.ceil(value)
        }
        return Math.floor(value)
      }

      const performanceBody: any[] = sortedEvaluations.map((evaluation, index) => {
        // หา competency_id: ใช้ evaluation.competency_id ถ้ามี (ตรงกับ average payload),
        // ถ้าไม่มี ให้ fallback ไปหาโดยชื่อจาก competencyNameToIdMap
        const competencyName = evaluation.competency_name
        const competencyId = (evaluation as any).competency_id != null
          ? Number((evaluation as any).competency_id)
          : (competencyName ? competencyNameToIdMap[competencyName] : null)

        // เตรียมค่าคอลัมน์ expected levels ตามตำแหน่ง
        const expectedCols = POSITIONS.map((pos: { position_id: number; position_name: string; short_name: string }) => {
          if (competencyId && expectedLevelsMap[competencyId]) {
            const expectedLevel = expectedLevelsMap[competencyId][pos.position_id]
            return expectedLevel !== null && expectedLevel !== undefined
              ? expectedLevel.toString()
              : '-'
          }
          return '-'
        })

        // คอลัมน์สุดท้าย: ถ้า isFinalized และมี average ให้แสดง average (rounded ตามกฎของ UI)
        let lastCol: string | number = '-'
        if (params.isFinalized && competencyId != null && averageMap[Number(competencyId)] != null) {
          lastCol = formatAverageLevel(averageMap[Number(competencyId)])
        } else if (evaluation.demonstrated_level !== null && evaluation.demonstrated_level !== undefined) {
          lastCol = evaluation.demonstrated_level.toString()
        }

        const row = [
          (index + 1).toString(),
          competencyName || '-',
          ...expectedCols,
          lastCol
        ]
        return row
      })



      // คำนวณความกว้างคอลัมน์ ให้เหมือนใน exportPDF
      const totalWidth = pageWidth - 20 // margin left 10 + right 10
      const columnWidths = {
        0: 20, // ลำดับ
        1: 80, // สมรรถนะหลัก
        2: (totalWidth - 20 - 80 - 40) / 4, // อ.
        3: (totalWidth - 20 - 80 - 40) / 4, // ผศ.
        4: (totalWidth - 20 - 80 - 40) / 4, // รศ.
        5: (totalWidth - 20 - 80 - 40) / 4, // ศ.
        6: 40  // ระดับสมรรถนะที่แสดงออก
      }

      autoTable(doc, {

        startY: performanceStartY,

        margin: { left: 10, right: 10, top: 30 },

        head: performanceHead,

        body: performanceBody,

        theme: 'grid',

        styles: {

          font: 'THSarabunNew',

          fontSize: 14,

          cellPadding: 1.3,

          lineColor: [0, 0, 0],

          lineWidth: 0.1,

          textColor: [0, 0, 0],

          fillColor: [255, 255, 255]

        },

        headStyles: {

          fillColor: [255, 255, 255], // สีขาว

          textColor: [0, 0, 0],

          fontStyle: 'bold',

          halign: 'center',

          fontSize: 14,

          font: 'THSarabunNew',

          lineWidth: 0.1,

          lineColor: [0, 0, 0]

        },

        columnStyles: {

          0: {

            cellWidth: columnWidths[0],

            halign: 'center',

            font: 'THSarabunNew'

          },

          1: {

            cellWidth: columnWidths[1],

            font: 'THSarabunNew',

            halign: 'left'

          },

          2: {

            cellWidth: columnWidths[2],

            halign: 'center',

            font: 'THSarabunNew',

            textColor: [0, 0, 0],

            fillColor: [255, 255, 255] // สีขาว

          },

          3: {

            cellWidth: columnWidths[3],

            halign: 'center',

            font: 'THSarabunNew',

            textColor: [255, 0, 0], // สีแดง

            fillColor: [200, 255, 200] // สีเขียวอ่อนๆ

          },

          4: {

            cellWidth: columnWidths[4],

            halign: 'center',

            font: 'THSarabunNew',

            textColor: [0, 0, 0],

            fillColor: [255, 255, 255] // สีขาว

          },

          5: {

            cellWidth: columnWidths[5],

            halign: 'center',

            font: 'THSarabunNew',

            textColor: [0, 0, 0],

            fillColor: [255, 255, 255] // สีขาว

          },

          6: {

            cellWidth: columnWidths[6],

            halign: 'center',

            font: 'THSarabunNew',

            textColor: [0, 0, 255], // สีน้ำเงิน

            fillColor: [255, 255, 230] // สีเหลืองอ่อนๆ

          }

        },

        didParseCell: (data: any) => {
          // กำหนดสีตามตำแหน่งที่ผู้ใช้อยู่ (เฉพาะแถวข้อมูล ไม่ใช่ header)
          if (data.row.index >= 0 && !data.row.section || data.row.section === 'body') {
            if (data.column.index >= 2 && data.column.index <= 5) {
              const positionIndex = data.column.index - 2
              const positionId = POSITIONS[positionIndex]?.position_id

              if (userPositionId && positionId === userPositionId) {
                // ตำแหน่งที่ผู้ใช้อยู่: สีเขียวอ่อน + ตัวเลขสีแดง
                data.cell.styles.fillColor = [242, 250, 237]
                data.cell.styles.textColor = [255, 0, 0]
              } else {
                // ตำแหน่งอื่น: สีขาว + ตัวเลขสีดำ
                data.cell.styles.fillColor = [255, 255, 255]
                data.cell.styles.textColor = [0, 0, 0]
              }
            }
          }
        }

      })

      // อัปเดต currentY หลังจากตาราง performance
      let section3StartY = (doc as any).lastAutoTable.finalY + 7

      // ตรวจสอบว่าหน้าจะพอหรือไม่ ถ้าไม่พอให้ขึ้นหน้าใหม่
      if (section3StartY > doc.internal.pageSize.getHeight() - 50) {
        doc.addPage()
        section3StartY = 30
      }

      // คำนวณ competencyScoreSummary จาก performanceSnapshot ก่อน (ต้องใช้ก่อนสร้างตาราง)
      const competencyScoreSummary = {
        rows: [
          { id: 'gte', multiplier: 3, count: 0, score: 0 },
          { id: 'minus1', multiplier: 2, count: 0, score: 0 },
          { id: 'minus2', multiplier: 1, count: 0, score: 0 },
          { id: 'minus3', multiplier: 0, count: 0, score: 0 }
        ],
        totalScore: 0,
        totalCount: 0
      }

      if (params.performanceSnapshot && params.performanceSnapshot.evaluations) {
        const evaluations = params.performanceSnapshot.evaluations

        // สร้าง map ของ average assessed levels โดยใช้ competency_name เป็น key (เหมือนใน section_2)
        const averageAssessedLevelsNameMap: Map<string, number> = new Map()
        try {
          averageAssessedLevels.forEach((a: any) => {
            const cid = Number(a?.competency_id)
            const avg = Number(a?.average_assessed_level)
            if (!Number.isFinite(cid) || !Number.isFinite(avg)) return

            // หา competency name: พยายามจาก sortedEvaluations ก่อน
            const found = (sortedEvaluations || []).find((ev: any) => {
              const evCid = Number(ev?.competency_id ?? ev?.competencyId)
              if (Number.isFinite(evCid) && evCid === cid) return true
              return false
            })

            let name: string | null = found?.competency_name ?? null

            // ถ้ายังไม่มี ให้ลอง invert จาก competencyNameToIdMap
            if (!name) {
              for (const key in competencyNameToIdMap) {
                if (competencyNameToIdMap[key] === cid) {
                  name = key
                  break
                }
              }
            }

            if (name) {
              averageAssessedLevelsNameMap.set(name, avg)
            }
          })
        } catch (err) {
          console.error('Error building averageAssessedLevelsNameMap:', err)
        }

        // สร้าง expectedLevels map สำหรับตำแหน่งของผู้ใช้ (userPositionId)
        const expectedLevelsForUserPos: Record<number, number> = {}
        try {
          expectedLevels.forEach((lvl: any) => {
            const cid = Number(lvl?.competency_id)
            const posId = Number(lvl?.position_id)
            const expectedVal = Number(lvl?.expected_level)
            if (Number.isFinite(cid) && Number.isFinite(posId) && Number.isFinite(expectedVal)) {
              if (userPositionId != null && posId === userPositionId) {
                expectedLevelsForUserPos[cid] = expectedVal
              }
            }
          })
        } catch (err) {
          // ignore
        }

        evaluations.forEach((evaluation: any) => {
          const competencyName = evaluation?.competency_name
          if (!competencyName) return

          // หา expected level: ดูจาก expectedLevelsForUserPos ตาม competency_id ถ้ามี
          const competencyId = Number(evaluation?.competency_id ?? evaluation?.competencyId)
          let expected = Number(evaluation?.expected_level ?? NaN)
          if (Number.isFinite(competencyId) && expectedLevelsForUserPos[competencyId] != null) {
            expected = Number(expectedLevelsForUserPos[competencyId])
          }
          if (!Number.isFinite(expected)) return

          // กำหนดค่าที่จะใช้เปรียบเทียบ: ถ้า finalized และมี average ให้ใช้ average (ปัดเศษตามกฎ), มิฉะนั้นใช้ demonstrated_level
          let comparedLevel: number | null = null
          if (params.isFinalized && averageAssessedLevelsNameMap.has(competencyName)) {
            const avg = averageAssessedLevelsNameMap.get(competencyName) as number
            const secondDecimal = Math.floor((avg * 100) % 10)
            comparedLevel = secondDecimal >= 5 ? Math.ceil(avg) : Math.floor(avg)
          } else if (evaluation?.demonstrated_level != null) {
            comparedLevel = Number(evaluation.demonstrated_level)
          }

          if (comparedLevel == null || !Number.isFinite(comparedLevel)) return

          const diff = comparedLevel - expected
          if (diff >= 0) {
            competencyScoreSummary.rows[0].count += 1
          } else if (diff === -1) {
            competencyScoreSummary.rows[1].count += 1
          } else if (diff === -2) {
            competencyScoreSummary.rows[2].count += 1
          } else {
            competencyScoreSummary.rows[3].count += 1
          }
        })

        competencyScoreSummary.rows.forEach(row => {
          row.score = row.count * row.multiplier
        })

        competencyScoreSummary.totalScore = competencyScoreSummary.rows.reduce((sum, row) => sum + row.score, 0)
        competencyScoreSummary.totalCount = competencyScoreSummary.rows.reduce((sum, row) => sum + row.count, 0)
      }

      const tableSpacing = 5
      const availableWidth = pageWidth - 20 - tableSpacing // margin left 10 + right 10 + spacing
      const tableWidth = availableWidth / 2

      // เพิ่มข้อความด้านบนสองตาราง
      doc.setFont('THSarabunNew', 'normal')
      doc.setFontSize(14)
      doc.text('(กรณีมีการประเมินสมรรถนะทางการบริหารให้ระบุชื่อตำแหน่งด้วย)', 14, section3StartY)

      // "ตำแหน่ง" พร้อมเส้นประ (ยาวขึ้น)
      const positionLabel = 'ตำแหน่ง'
      const positionLabelWidth = doc.getTextWidth(positionLabel)
      // ย้าย "ตำแหน่ง" ไปทางซ้ายขึ้นเพื่อให้เส้นประยาวขึ้น
      const positionLabelX = pageWidth - 80
      doc.text(positionLabel, positionLabelX, section3StartY)

      // วาดเส้นประยาวสำหรับตำแหน่ง
      const posDashLength = 1
      const posGapLength = 1
      let posX = positionLabelX + positionLabelWidth + 2
      const posEndX = pageWidth - 10
      while (posX < posEndX) {
        doc.line(posX, section3StartY, Math.min(posX + posDashLength, posEndX), section3StartY)
        posX += posDashLength + posGapLength
      }

      // อัปเดต startY สำหรับตาราง (ลดระยะห่าง)
      section3StartY += 3

      const managementCompetencies = [
        'สภาวะผู้นำ',
        'วิสัยทัศน์',
        'การวางแผนกลยุทธ์ภาครัฐ',
        'ศักยภาพเพื่อนำการปรับเปลี่ยน',
        'การควบคุมตนเอง',
        'การสอนงานและการมอบหมายงาน'
      ]

      const managementTableHead = [[
        'สมรรถนะทางการบริหาร (ที่สภามหาวิทยาลัยกำหนด)',
        'ระดับสมรรถนะที่คาดหวัง',
        'ระดับสมรรถนะที่แสดงออก'
      ]]

      const managementTableBody = managementCompetencies.map(comp => [comp, '', ''])

      autoTable(doc, {
        startY: section3StartY,
        margin: { left: 10, right: pageWidth - 10 - tableWidth, top: 30 },
        tableWidth: tableWidth,
        head: managementTableHead,
        body: managementTableBody,
        theme: 'grid',
        styles: {
          font: 'THSarabunNew',
          fontSize: 12,
          cellPadding: 1.5,
          lineColor: [0, 0, 0],
          lineWidth: 0.1,
          textColor: [0, 0, 0],
          fillColor: [255, 255, 255]
        },
        headStyles: {
          fillColor: [255, 255, 255],
          textColor: [0, 0, 0],
          fontStyle: 'bold',
          halign: 'center',
          fontSize: 12,
          font: 'THSarabunNew'
        },
        columnStyles: {
          0: { cellWidth: tableWidth * 0.5, font: 'THSarabunNew', halign: 'left', fontSize: 12 },
          1: { cellWidth: tableWidth * 0.2, halign: 'center', font: 'THSarabunNew', fontSize: 12 },
          2: { cellWidth: tableWidth * 0.25, halign: 'center', font: 'THSarabunNew', fontSize: 12 }
        }
      })

      const competencyCountY = section3StartY
      const competencyCountTableHead = [[
        'จำนวนสมรรถนะ',
        'คูณ (X)',
        'คะแนน'
      ]]

      const competencyCountTableBody: any[] = competencyScoreSummary.rows
        .filter(row => row.count > 0)
        .map(row => [
          { content: row.count.toString(), styles: { textColor: [0, 0, 255] } },
          { content: row.multiplier.toString(), styles: { textColor: [255, 0, 0] } },
          { content: row.score.toString(), styles: { textColor: [0, 0, 255], fontStyle: 'bold' } }
        ])

      if (competencyScoreSummary.totalCount > 0) {
        competencyCountTableBody.push([
          { content: 'ผลรวมคะแนน', styles: { fontStyle: 'bold' as const, halign: 'right' }, colSpan: 2 },
          { content: competencyScoreSummary.totalScore.toString(), styles: { fontStyle: 'bold' as const, textColor: [0, 0, 255] } }
        ])
      }

      autoTable(doc, {
        startY: competencyCountY,
        margin: { left: 10 + tableWidth + tableSpacing, right: 10, top: 30 },
        tableWidth: tableWidth,
        head: competencyCountTableHead,
        body: competencyCountTableBody.length > 0 ? competencyCountTableBody : [['', '', '']],
        theme: 'grid',
        styles: {
          font: 'THSarabunNew',
          fontSize: 14,
          cellPadding: 1.2,
          lineColor: [0, 0, 0],
          lineWidth: 0.1,
          textColor: [0, 0, 0],
          fillColor: [255, 255, 255]
        },
        headStyles: {
          fillColor: [255, 255, 255],
          textColor: [0, 0, 0],
          fontStyle: 'bold',
          halign: 'center',
          fontSize: 14,
          font: 'THSarabunNew'
        },
        columnStyles: {
          0: { cellWidth: 'auto', halign: 'center', font: 'THSarabunNew', fontSize: 14 },
          1: { cellWidth: 'auto', halign: 'center', font: 'THSarabunNew', fontSize: 14 },
          2: { cellWidth: 'auto', halign: 'center', font: 'THSarabunNew', fontSize: 14 }
        }
      })

      let criteriaTableY = (doc as any).lastAutoTable.finalY + 23

      // ตรวจสอบว่าหน้าจะพอหรือไม่
      if (criteriaTableY > doc.internal.pageSize.getHeight() - 40) {
        doc.addPage()
        criteriaTableY = 30
      }

      const criteriaTableHead = [[
        'หลักเกณฑ์การประเมิน'
      ]]

      const criteriaTableBody = [
        ['จำนวนสมรรถนะหลัก/สมรรถนะเฉพาะ/สมรรถนะทางการบริหาร ที่มีระดับสมรรถนะที่แสดงออก สูงกว่าหรือเท่ากับ ระดับสมรรถนะที่คาดหวัง x 3 คะแนน'],
        ['จำนวนสมรรถนะหลัก/สมรรถนะเฉพาะ/สมรรถนะทางการบริหาร ที่มีระดับสมรรถนะที่แสดงออก ต่ำกว่า ระดับสมรรถนะที่คาดหวัง 1 ระดับ x 2 คะแนน'],
        ['จำนวนสมรรถนะหลัก/สมรรถนะเฉพาะ/สมรรถนะทางการบริหาร ที่มีระดับสมรรถนะที่แสดงออก ต่ำกว่า ระดับสมรรถนะที่คาดหวัง 2 ระดับ x 1 คะแนน'],
        ['จำนวนสมรรถนะหลัก/สมรรถนะเฉพาะ/สมรรถนะทางการบริหาร ที่มีระดับสมรรถนะที่แสดงออก ต่ำกว่า ระดับสมรรถนะที่คาดหวัง 3 ระดับ x 0 คะแนน']
      ]

      autoTable(doc, {
        startY: criteriaTableY,
        margin: { left: 10, right: 10, top: 30 },
        head: criteriaTableHead,
        body: criteriaTableBody,
        theme: 'grid',
        styles: {
          font: 'THSarabunNew',
          fontSize: 12,
          cellPadding: 1,
          lineColor: [0, 0, 0],
          lineWidth: 0.1,
          textColor: [0, 0, 0],
          fillColor: [255, 255, 255]
        },
        headStyles: {
          fillColor: [255, 255, 255],
          textColor: [0, 0, 0],
          fontStyle: 'bold',
          halign: 'center',
          fontSize: 12,
          font: 'THSarabunNew'
        },
        columnStyles: {
          0: { cellWidth: 'auto', font: 'THSarabunNew', halign: 'left', fontSize: 12 }
        }
      })

      // แสดงวิธีคำนวณ
      let calculationY = (doc as any).lastAutoTable.finalY + 10

      // ตรวจสอบว่าหน้าจะพอหรือไม่
      if (calculationY > doc.internal.pageSize.getHeight() - 30) {
        doc.addPage()
        calculationY = 30
      }

      doc.setFont('THSarabunNew', 'normal')
      doc.setFontSize(14)

      // คำนวณค่าต่างๆ
      const competencyTotalScore = competencyScoreSummary.totalScore
      const totalCount = competencyScoreSummary.totalCount
      const competencyTotalScoreCalc = competencyTotalScore / 30

      // กำหนดตำแหน่งซ้ายและขวา
      const leftMargin = 14
      const rightMargin = pageWidth - 14

      // "วิธีคำนวณ" ด้านซ้าย
      doc.setTextColor(0, 0, 0)
      const methodText = 'วิธีคำนวณ'
      doc.text(methodText, leftMargin, calculationY)

      // วาดเส้นใต้ "วิธีคำนวณ"
      const methodTextWidth = doc.getTextWidth(methodText)
      doc.setLineWidth(0.2)
      doc.setDrawColor(0, 0, 0)
      doc.line(leftMargin, calculationY + 1, leftMargin + methodTextWidth, calculationY + 1)

      // คำนวณความกว้างของส่วนขวา (8) คะแนนที่ได้ + กล่อง
      doc.setFontSize(14)
      const scoreCalcText = `(8) คะแนนที่ได้`
      const scoreCalcTextWidth = doc.getTextWidth(scoreCalcText)
      const boxWidth = doc.getTextWidth(competencyTotalScoreCalc.toFixed(2)) + 4
      const rightSectionWidth = scoreCalcTextWidth + 3 + boxWidth

      // คำนวณความกว้างของส่วนกลาง (สูตร + เท่ากับ + X/30)
      doc.setFontSize(14)
      const numeratorText = 'ผลรวมคะแนน'
      const numeratorWidth = doc.getTextWidth(numeratorText)
      const denominatorText = `จำนวนสมรรถนะที่ใช้ในการประเมิน x 3`
      const denominatorWidth = doc.getTextWidth(denominatorText)
      const formulaLineLength = Math.max(numeratorWidth, denominatorWidth)

      doc.setFontSize(14)
      const equalsText = 'เท่ากับ'
      const equalsTextWidth = doc.getTextWidth(equalsText)
      const scoreText = competencyTotalScore.toString()
      const scoreTextWidth = doc.getTextWidth(scoreText)
      const slashText = ' / '
      const slashTextWidth = doc.getTextWidth(slashText)
      const maxScoreText = '30'
      const maxScoreTextWidth = doc.getTextWidth(maxScoreText)

      const middleSectionWidth = formulaLineLength + 8 + equalsTextWidth + 3 + scoreTextWidth + slashTextWidth + maxScoreTextWidth

      // คำนวณตำแหน่งเริ่มต้นของส่วนกลาง (ให้อยู่ตรงกลางระหว่างซ้ายและขวา)
      const calculationAvailableWidth = rightMargin - leftMargin - methodTextWidth - rightSectionWidth
      const formulaStartX = leftMargin + methodTextWidth + (calculationAvailableWidth - middleSectionWidth) / 2
      const formulaY = calculationY

      // วาดสูตร: ผลรวมคะแนน / (จำนวนสมรรถนะ x 3)
      doc.setFontSize(12)

      // วาดเส้นแบ่ง (fraction line) ก่อน
      doc.setLineWidth(0.2)
      doc.setDrawColor(0, 0, 0)
      doc.line(formulaStartX, formulaY, formulaStartX + formulaLineLength, formulaY)

      // คำนวณจุดกึ่งกลางของเส้นขีด
      const lineCenterX = formulaStartX + formulaLineLength / 2
      // ให้ตัวเศษอยู่ตรงกลางของเส้นขีด
      const numeratorX = lineCenterX
      doc.text(numeratorText, numeratorX - numeratorWidth / 2, formulaY - 3)

      // ตัวส่วน: "จำนวนสมรรถนะที่ใช้ในการประเมิน x 3"
      const denominatorX = formulaStartX + (denominatorWidth / 2)
      doc.text(denominatorText, denominatorX - denominatorWidth / 2, formulaY + 4)

      // "เท่ากับ" หลังสูตร
      const equalsX = formulaStartX + formulaLineLength + 8
      doc.setFontSize(14)
      doc.text(equalsText, equalsX, formulaY)

      // แสดงผลลัพธ์: X / 30
      const resultX = equalsX + equalsTextWidth + 3
      doc.setTextColor(0, 0, 255) // สีน้ำเงิน
      doc.text(scoreText, resultX, formulaY)

      // วาดเส้นประใต้ตัวเลข (ใช้วิธี manual)
      doc.setLineWidth(0.1)
      doc.setDrawColor(0, 0, 255)
      const dashLength = 0.5
      const gapLength = 0.5
      let x = resultX
      while (x < resultX + scoreTextWidth) {
        doc.line(x, formulaY + 1, Math.min(x + dashLength, resultX + scoreTextWidth), formulaY + 1)
        x += dashLength + gapLength
      }

      doc.setTextColor(0, 0, 0) // สีดำ
      doc.text(slashText, resultX + scoreTextWidth, formulaY)

      doc.setTextColor(255, 0, 0) // สีแดง
      doc.text(maxScoreText, resultX + scoreTextWidth + slashTextWidth, formulaY)

      // วาดเส้นประใต้ "30"
      doc.setLineWidth(0.1)
      doc.setDrawColor(255, 0, 0)
      const maxScoreStartX = resultX + scoreTextWidth + slashTextWidth
      x = maxScoreStartX
      while (x < maxScoreStartX + maxScoreTextWidth) {
        doc.line(x, formulaY + 1, Math.min(x + dashLength, maxScoreStartX + maxScoreTextWidth), formulaY + 1)
        x += dashLength + gapLength
      }

      // "(8) คะแนนที่ได้" และผลลัพธ์ในกล่อง (ชิดขวา)
      const scoreCalcX = rightMargin - rightSectionWidth

      doc.setTextColor(0, 0, 0) // สีดำ
      doc.text(scoreCalcText, scoreCalcX, formulaY)

      // วาดกล่องสำหรับผลลัพธ์
      const boxX = scoreCalcX + scoreCalcTextWidth + 3
      const boxY = formulaY - 3
      const boxHeight = 5
      doc.setLineWidth(0.2)
      doc.setDrawColor(0, 0, 0)
      doc.rect(boxX, boxY, boxWidth, boxHeight)

      // ตัวเลขในกล่อง
      doc.setTextColor(0, 0, 255) // สีน้ำเงิน
      doc.text(competencyTotalScoreCalc.toFixed(2), boxX + 2, formulaY)

      // อัปเดต currentY หลังจากตารางทั้งสอง (ใช้ค่าจาก autoTable)
      const tableFinalY = calculationY + 8

      // ตรวจสอบว่าหน้าจะพอหรือไม่ ถ้าไม่พอให้ขึ้นหน้าใหม่
      if (tableFinalY > doc.internal.pageSize.getHeight() - 50) {
        doc.addPage()
        section3StartY = 32
      } else {
        section3StartY = tableFinalY + 15 // เพิ่มระยะห่างจากตาราง
      }

      // ส่วนที่ 3: สรุปการประเมินผลการปฏิบัติราชการ
      // Section 9: ลายมือชื่อ (ก่อนส่วนที่ 3) - ใช้ตาราง
      const section9Y = section3StartY

      // เตรียมข้อมูลสำหรับตาราง
      const section9Header = [[
        {
          content: '(9) ผู้ประเมินและผู้รับการประเมินได้ตกลงร่วมกันและเห็นพ้องกันแล้ว (ระบุข้อมูลใน (1) ให้ครบ) จึงลงลายมือชื่อไว้เป็นหลักฐาน (ลงนามเมื่อจัดทำข้อตกลง)',
          colSpan: 2,
          styles: {
            font: 'THSarabunNew',
            fontSize: 14,
            halign: 'left' as const,
            fillColor: [255, 255, 255] as [number, number, number],
            textColor: [0, 0, 0] as [number, number, number]
          }
        }
      ]]

      // เตรียม body สำหรับตาราง - ใช้ placeholder text แล้วจะวาดเส้นประและชื่อใน didDrawCell
      const section9Body: any[] = [
        ['', ''],
        ['', ''],
        ['', '']
      ]

      // เก็บข้อมูลชื่อผู้ใช้สำหรับวาดใน didDrawCell
      const userFullName = userInfo.u_fname && userInfo.u_lname
        ? `${userInfo.prefix_name || ''} ${userInfo.u_fname || ''} ${userInfo.u_lname || ''}`.trim()
        : null

      autoTable(doc, {
        startY: section9Y,
        margin: { left: 10, right: 10, top: 30 },
        head: section9Header,
        body: section9Body,
        theme: 'grid',
        styles: {
          font: 'THSarabunNew',
          fontSize: 14,
          cellPadding: 2,
          lineColor: [0, 0, 0],
          lineWidth: 0.1,
          textColor: [0, 0, 0],
          fillColor: [255, 255, 255]
        },
        headStyles: {
          fillColor: [255, 255, 255],
          textColor: [0, 0, 0],
          fontStyle: 'normal',
          halign: 'left',
          fontSize: 14,
          font: 'THSarabunNew',
          cellPadding: { top: 3, bottom: 3, left: 2, right: 2 }
        },
        columnStyles: {
          0: { cellWidth: 'auto', font: 'THSarabunNew', halign: 'left' },
          1: { cellWidth: 'auto', font: 'THSarabunNew', halign: 'left' }
        },
        didDrawCell: (data: any) => {
          // วาดเส้นประและชื่อใน cell ที่เหมาะสม
          if (data.cell.section === 'body') {
            const cell = data.cell
            const rowIndex = data.row.index
            const colIndex = data.column.index

            // แถวแรก: วาดเส้นประสำหรับลายมือชื่อ
            if (rowIndex === 0) {
              doc.setFontSize(14)
              doc.setFont('THSarabunNew', 'normal')
              const label = 'ลายมือชื่อ'
              const labelWidth = doc.getTextWidth(label)

              // วาดข้อความ "ลายมือชื่อ" (ขยับลงมาจากเส้นด้านบนมากขึ้น)
              doc.text(label, cell.x + 2, cell.y + 8)

              // วาดเส้นประ
              doc.setLineWidth(0.1)
              doc.setDrawColor(0, 0, 0)
              const dashLength = 1
              const gapLength = 1
              let x = cell.x + 2 + labelWidth + 2
              const endX = cell.x + cell.width - 2

              while (x < endX) {
                doc.line(x, cell.y + 8, Math.min(x + dashLength, endX), cell.y + 8)
                x += dashLength + gapLength
              }

              // วาดชื่อผู้ใช้ในคอลัมน์ขวา (ผู้รับการประเมิน)
              if (colIndex === 1 && userFullName) {
                const cellCenterX = cell.x + cell.width / 2
                const nameWidth = doc.getTextWidth(userFullName)
                doc.text(userFullName, cellCenterX - nameWidth / 2, cell.y + 7)
              }
            }

            // แถวที่สอง: แสดง (ผู้ประเมิน) และ (ผู้รับการประเมิน) ตรงกลาง
            // ลบเฉพาะเส้นตารางแนวนอนด้านบนและด้านล่าง (คงเส้นตารางแนวตั้งไว้)
            if (rowIndex === 1) {
              // ลบเส้นตารางแนวนอนด้านบนทั้งหมด
              doc.setLineWidth(0.3)
              doc.setDrawColor(255, 255, 255) // ใช้สีขาวเพื่อลบเส้น
              doc.line(cell.x, cell.y, cell.x + cell.width, cell.y)

              // ลบเส้นตารางแนวนอนด้านล่างทั้งหมด
              doc.line(cell.x, cell.y + cell.height, cell.x + cell.width, cell.y + cell.height)

              doc.setFontSize(14)
              doc.setFont('THSarabunNew', 'normal')
              const label = colIndex === 0 ? '(ผู้ประเมิน)' : '(ผู้รับการประเมิน)'
              const labelWidth = doc.getTextWidth(label)
              const cellCenterX = cell.x + cell.width / 2
              doc.text(label, cellCenterX - labelWidth / 2, cell.y + 5)
            }

            // แถวที่สาม: วาดเส้นประสำหรับวันที่ เดือน พ.ศ.
            if (rowIndex === 2) {
              doc.setFontSize(14)
              doc.setFont('THSarabunNew', 'normal')
              doc.setLineWidth(0.1)
              doc.setDrawColor(0, 0, 0)
              const dashLength = 1
              const gapLength = 1

              const fieldWidth = (cell.width - 4) / 3
              let currentX = cell.x + 2

              // วันที่
              doc.text('วันที่', currentX, cell.y + 5)
              let x = currentX + 12
              const dateEndX = currentX + fieldWidth - 2
              while (x < dateEndX) {
                doc.line(x, cell.y + 5, Math.min(x + dashLength, dateEndX), cell.y + 5)
                x += dashLength + gapLength
              }

              // เดือน
              currentX += fieldWidth
              doc.text('เดือน', currentX, cell.y + 5)
              x = currentX + 12
              const monthEndX = currentX + fieldWidth - 2
              while (x < monthEndX) {
                doc.line(x, cell.y + 5, Math.min(x + dashLength, monthEndX), cell.y + 5)
                x += dashLength + gapLength
              }

              // พ.ศ.
              currentX += fieldWidth
              doc.text('พ.ศ.', currentX, cell.y + 5)
              x = currentX + 12
              const yearEndX = cell.x + cell.width - 2
              while (x < yearEndX) {
                doc.line(x, cell.y + 5, Math.min(x + dashLength, yearEndX), cell.y + 5)
                x += dashLength + gapLength
              }
            }
          }
        }
      })

      // ส่วนที่ 3: สรุปการประเมินผลการปฏิบัติราชการ
      let section3TableY = (doc as any).lastAutoTable.finalY + 8

      // ตรวจสอบว่าหน้าจะพอหรือไม่
      if (section3TableY > doc.internal.pageSize.getHeight() - 40) {
        doc.addPage()
        section3TableY = 32
      }

      doc.setFont('THSarabunNew', 'bold')
      doc.setFontSize(14)
      doc.setTextColor(0, 0, 0)
      doc.text('ส่วนที่ 3 สรุปการประเมินผลการปฏิบัติราชการ', 14, section3TableY)
      section3TableY += 5

      // ตารางสรุปคะแนน (ไม่แสดง evaluated column เพราะไม่ใช่ isFinalized)
      const summaryTableHead = [[
        'องค์ประกอบการประเมิน',
        'คะแนนเต็ม',
        'คะแนนที่ได้',
        'หมายเหตุ'
      ]]

      // คำนวณคะแนนส่วนที่ 2 (สมรรถนะ)
      let competencyScore = 0
      if (params.performanceSnapshot && params.performanceSnapshot.evaluations) {
        const evaluations = params.performanceSnapshot.evaluations
        const categories = [
          { multiplier: 3, count: 0 },
          { multiplier: 2, count: 0 },
          { multiplier: 1, count: 0 },
          { multiplier: 0, count: 0 }
        ]

        evaluations.forEach((evaluation: any) => {
          const demonstrated = Number(evaluation?.demonstrated_level ?? 0)
          const expected = Number(evaluation?.expected_level ?? 0)
          if (Number.isFinite(demonstrated) && Number.isFinite(expected)) {
            const diff = demonstrated - expected
            if (diff >= 0) {
              categories[0].count += 1
            } else if (diff === -1) {
              categories[1].count += 1
            } else if (diff === -2) {
              categories[2].count += 1
            } else {
              categories[3].count += 1
            }
          }
        })

        competencyScore = categories.reduce((sum, cat) => sum + (cat.count * cat.multiplier), 0)
      }

      const totalScore = params.performanceScoreOutOf70 + competencyScore
      const totalMaxScore = 70 + 30

      const summaryTableBody: any[] = [
        ['องค์ประกอบที่ 1 : ผลสัมฤทธิ์ของงาน (7)', '70.00', params.performanceScoreOutOf70.toFixed(2), ''],
        ['องค์ประกอบที่ 2 : พฤติกรรมการปฏิบัติราชการ (สมรรถนะ) (8)', '30.00', competencyScore.toFixed(2), ''],
        ['องค์ประกอบอื่น ๆ (ถ้ามี)', '', '', ''],
        [{ content: 'รวม (7) + (8)', styles: { fontStyle: 'bold' as const, halign: 'right' } }, '100.00', { content: totalScore.toFixed(2), styles: { fontStyle: 'bold' as const, textColor: [0, 0, 255] } }, '']
      ]

      autoTable(doc, {
        startY: section3TableY,
        margin: { left: 10, right: 10, top: 30 },
        head: summaryTableHead,
        body: summaryTableBody,
        theme: 'grid',
        styles: {
          font: 'THSarabunNew',
          fontSize: 14,
          cellPadding: 2,
          lineColor: [0, 0, 0],
          lineWidth: 0.1,
          textColor: [0, 0, 0],
          fillColor: [255, 255, 255]
        },
        headStyles: {
          fillColor: [255, 255, 255],
          textColor: [0, 0, 0],
          fontStyle: 'bold',
          halign: 'center',
          fontSize: 14,
          font: 'THSarabunNew'
        },
        columnStyles: {
          0: { cellWidth: 100, font: 'THSarabunNew', halign: 'left' },
          1: { cellWidth: 30, halign: 'center', font: 'THSarabunNew' },
          2: { cellWidth: 30, halign: 'center', font: 'THSarabunNew', textColor: [0, 0, 255] },
          3: { cellWidth: 30, font: 'THSarabunNew' }
        }
      })

      // ระดับผลการประเมิน
      let evaluationLevelsY = (doc as any).lastAutoTable.finalY + 10
      finalEvaluationLevelsY = evaluationLevelsY

      if (evaluationLevelsY > doc.internal.pageSize.getHeight() - 30) {
        doc.addPage()
        evaluationLevelsY = 32
      }

      doc.setFont('THSarabunNew', 'bold')
      doc.setFontSize(16)
      doc.text('ระดับผลการประเมิน', 14, evaluationLevelsY)
      evaluationLevelsY += 7

      const percentage = (totalScore / totalMaxScore) * 100
      const evaluationLevels = [
        { label: 'ดีเด่น', description: '(90 - 100)', min: 90, max: 100 },
        { label: 'ดีมาก', description: '(80 - 89.99)', min: 80, max: 89.99 },
        { label: 'ดี', description: '(70 - 79.99)', min: 70, max: 79.99 },
        { label: 'พอใช้', description: '(60 - 69.99)', min: 60, max: 69.99 },
        { label: 'ต้องปรับปรุง', description: '(ต่ำกว่า 60)', min: -Infinity, max: 59.99 }
      ]

      evaluationLevels.forEach((level) => {
        const checked = percentage >= level.min && percentage <= level.max

        // วาด checkbox
        doc.setLineWidth(0.5)
        doc.setDrawColor(0, 0, 0)
        doc.rect(14, evaluationLevelsY - 2, 3, 3)

        if (checked) {
          doc.setFillColor(0, 0, 0) // business1 color
          doc.rect(14.5, evaluationLevelsY - 1.5, 2, 2, 'F')
          // ไม่ต้องวาดเครื่องหมายถูก
        }

        doc.setFont('THSarabunNew', checked ? 'bold' : 'normal')
        doc.setFontSize(14)
        doc.setTextColor(checked ? 46 : 0, checked ? 68 : 0, checked ? 151 : 0)
        doc.text(`${level.label} ${level.description}`, 20, evaluationLevelsY)
        doc.setTextColor(0, 0, 0)

        evaluationLevelsY += 6
      })
      finalEvaluationLevelsY = evaluationLevelsY
    } else {
      // ถ้าไม่มี performanceSnapshot ให้ใช้ตำแหน่งจากตารางสรุป
      finalEvaluationLevelsY = (doc as any).lastAutoTable.finalY + 10
    }
    // ส่วนที่ 4: แผนพัฒนาการปฏิบัติราชการรายบุคคล
    let section4Y = finalEvaluationLevelsY + 8

    // ตรวจสอบว่าหน้าจะพอหรือไม่
    if (section4Y > doc.internal.pageSize.getHeight() - 60) {
      doc.addPage()
      section4Y = 32
    }

    doc.setFont('THSarabunNew', 'bold')
    doc.setFontSize(14)
    doc.text('ส่วนที่ 4 : แผนพัฒนาการปฏิบัติราชการรายบุคคล', 14, section4Y)
    section4Y += 7

    // ตารางแผนพัฒนา
    const developmentTableHead = [[
      'ความรู้/ทักษะ/สมรรถนะที่ต้องได้รับการพัฒนา',
      'วิธีการพัฒนา',
      'ช่วงเวลาที่ต้องการพัฒนา'
    ]]

    const developmentTableBody = [
      ['', '', '']
    ]

    // คำนวณความกว้างตารางให้เท่ากับตารางอื่นๆ
    const tableTotalWidth = pageWidth - 20 // margin left 10 + right 10
    const developmentColumnWidths = {
      0: tableTotalWidth * 0.4, // ความรู้/ทักษะ/สมรรถนะ
      1: tableTotalWidth * 0.35, // วิธีการพัฒนา
      2: tableTotalWidth * 0.25 // ช่วงเวลาที่ต้องการพัฒนา
    }

    autoTable(doc, {
      startY: section4Y,
      margin: { left: 10, right: 10, top: 30 },
      head: developmentTableHead,
      body: developmentTableBody,
      theme: 'grid',
      styles: {
        font: 'THSarabunNew',
        fontSize: 14,
        cellPadding: 2,
        lineColor: [0, 0, 0],
        lineWidth: 0.1,
        textColor: [0, 0, 0],
        fillColor: [255, 255, 255]
      },
      headStyles: {
        fillColor: [255, 255, 255],
        textColor: [0, 0, 0],
        fontStyle: 'bold',
        halign: 'center',
        fontSize: 14,
        font: 'THSarabunNew',
        cellPadding: 2,
        minCellHeight: 0
      },
      bodyStyles: {
        minCellHeight: 50,
        cellPadding: 2
      },
      columnStyles: {
        0: { cellWidth: developmentColumnWidths[0], font: 'THSarabunNew' },
        1: { cellWidth: developmentColumnWidths[1], font: 'THSarabunNew' },
        2: { cellWidth: developmentColumnWidths[2], font: 'THSarabunNew' }
      }
    })

    // Section 10: ความเห็นเพิ่มเติมของผู้ประเมิน
    let section10Y = (doc as any).lastAutoTable.finalY + 10

    if (section10Y > doc.internal.pageSize.getHeight() - 40) {
      doc.addPage()
      section10Y = 32
    }

    // สร้างตารางข้อ 10 - ใช้ autoTable เฉพาะ header
    const section10Header = [[
      {
        content: '(10) ความเห็นเพิ่มเติมของผู้ประเมิน (ระบุข้อมูลเมื่อสิ้นรอบการประเมิน)',
        colSpan: 1,
        styles: {
          font: 'THSarabunNew',
          fontSize: 14,
          halign: 'left' as const,
          fillColor: [255, 255, 255] as [number, number, number],
          textColor: [0, 0, 0] as [number, number, number]
        }
      }
    ]]

    // เก็บตำแหน่งเริ่มต้นสำหรับวาดกรอบ
    const marginLeft = 10
    const marginRight = 10
    const contentWidth = doc.internal.pageSize.getWidth() - marginLeft - marginRight
    let actualHeaderY = section10Y // เก็บตำแหน่ง header จริง

    autoTable(doc, {
      startY: section10Y,
      margin: { left: 10, right: 10, top: 0 },
      head: section10Header,
      body: [],
      theme: 'plain',
      styles: {
        font: 'THSarabunNew',
        fontSize: 14,
        cellPadding: 2,
        lineColor: [0, 0, 0],
        lineWidth: 0.1,
        textColor: [0, 0, 0],
        fillColor: [255, 255, 255]
      },
      headStyles: {
        fillColor: [255, 255, 255],
        textColor: [0, 0, 0],
        fontStyle: 'normal',
        halign: 'left',
        fontSize: 14,
        font: 'THSarabunNew',
        cellPadding: { top: 3, bottom: 3, left: 2, right: 2 }
      },
      didDrawCell: (data: any) => {
        // เก็บตำแหน่ง Y จริงของ header cell
        if (data.cell.section === 'head' && data.row.index === 0) {
          actualHeaderY = data.cell.y
        }
      }
    })

    // ใช้ตำแหน่ง header จริงสำหรับวาดกรอบ
    const boxStartY = actualHeaderY

    // วาด body โดยตรง (ไม่มีตาราง)
    let bodyY = (doc as any).lastAutoTable.finalY + 5
    const lineHeight = 10 // ลดจาก 15 เป็น 10

    doc.setFont('THSarabunNew', 'normal')
    doc.setFontSize(14)
    doc.setTextColor(0, 0, 0)

    // ส่วนที่ 1: จุดเด่น และ/หรือ สิ่งที่ควรปรับปรุงแก้ไข
    bodyY += 3 // เพิ่มระยะห่างก่อนข้อความ
    doc.text('1) จุดเด่น และ/หรือ สิ่งที่ควรปรับปรุงแก้ไข', marginLeft + 2, bodyY)
    bodyY += lineHeight + 2

    // วาดเส้นประ 3 แถว
    for (let i = 0; i < 3; i++) {
      doc.setLineWidth(0.1)
      doc.setDrawColor(0, 0, 0)
      const section10DashLength = 1
      const section10GapLength = 1
      let x = marginLeft + 2
      const endX = marginLeft + contentWidth - 2

      while (x < endX) {
        doc.line(x, bodyY, Math.min(x + section10DashLength, endX), bodyY)
        x += section10DashLength + section10GapLength
      }
      bodyY += lineHeight
    }

    // เส้นแบ่งระหว่างส่วน
    bodyY += 2
    doc.setLineWidth(0.1)
    doc.setDrawColor(0, 0, 0)
    doc.line(marginLeft, bodyY, marginLeft + contentWidth, bodyY)
    bodyY += 3

    // ส่วนที่ 2: ข้อเสนอแนะเกี่ยวกับวิธีส่งเสริมและพัฒนา
    bodyY += 3 // เพิ่มระยะห่างก่อนข้อความ
    doc.text('2) ข้อเสนอแนะเกี่ยวกับวิธีส่งเสริมและพัฒนา', marginLeft + 2, bodyY)
    bodyY += lineHeight + 2

    // วาดเส้นประ 3 แถว
    for (let i = 0; i < 3; i++) {
      doc.setLineWidth(0.1)
      doc.setDrawColor(0, 0, 0)
      const section10DashLength = 1
      const section10GapLength = 1
      let x = marginLeft + 2
      const endX = marginLeft + contentWidth - 2

      while (x < endX) {
        doc.line(x, bodyY, Math.min(x + section10DashLength, endX), bodyY)
        x += section10DashLength + section10GapLength
      }
      bodyY += lineHeight
    }

    // วาดกรอบรอบทั้งหมด (header + body)
    const boxHeight = bodyY - boxStartY + 3
    doc.setLineWidth(0.1)
    doc.setDrawColor(0, 0, 0)
    doc.rect(marginLeft, boxStartY, contentWidth, boxHeight)

      // อัพเดท lastAutoTable.finalY เพื่อให้ Section 11 รู้ตำแหน่งที่ถูกต้อง
      ; (doc as any).lastAutoTable = { finalY: bodyY + 3 }

    // Section 11: ลายมือชื่อ (ใช้ตารางเหมือน Section 9)
    let section11Y = (doc as any).lastAutoTable.finalY + 10

    if (section11Y > doc.internal.pageSize.getHeight() - 30) {
      doc.addPage()
      section11Y = 32
    }

    // เตรียมข้อมูลสำหรับตาราง
    const section11Header = [[
      {
        content: '(11) ผู้ประเมินและผู้รับการประเมินได้ตกลงร่วมกันและเห็นพ้องกันแล้ว (ระบุข้อมูล (1) - (10) ให้ครบ) จึงลงลายมือชื่อไว้เป็นหลักฐาน (ลงนามเมื่อสิ้นรอบการประเมิน)',
        colSpan: 2,
        styles: {
          font: 'THSarabunNew',
          fontSize: 14,
          halign: 'left' as const,
          fillColor: [255, 255, 255] as [number, number, number],
          textColor: [0, 0, 0] as [number, number, number]
        }
      }
    ]]

    // เตรียม body สำหรับตาราง - ใช้ placeholder text แล้วจะวาดเส้นประและชื่อใน didDrawCell
    const section11Body: any[] = [
      ['', ''],
      ['', ''],
      ['', '']
    ]

    // เก็บข้อมูลชื่อผู้ใช้สำหรับวาดใน didDrawCell
    const userFullName11 = userInfo.u_fname && userInfo.u_lname
      ? `${userInfo.prefix_name || ''} ${userInfo.u_fname || ''} ${userInfo.u_lname || ''}`.trim()
      : null

    autoTable(doc, {
      startY: section11Y,
      margin: { left: 10, right: 10, top: 30 },
      head: section11Header,
      body: section11Body,
      theme: 'grid',
      styles: {
        font: 'THSarabunNew',
        fontSize: 14,
        cellPadding: 2,
        lineColor: [0, 0, 0],
        lineWidth: 0.1,
        textColor: [0, 0, 0],
        fillColor: [255, 255, 255]
      },
      headStyles: {
        fillColor: [255, 255, 255],
        textColor: [0, 0, 0],
        fontStyle: 'normal',
        halign: 'left',
        fontSize: 14,
        font: 'THSarabunNew',
        cellPadding: { top: 3, bottom: 3, left: 2, right: 2 }
      },
      columnStyles: {
        0: { cellWidth: 'auto', font: 'THSarabunNew', halign: 'left' },
        1: { cellWidth: 'auto', font: 'THSarabunNew', halign: 'left' }
      },
      didDrawCell: (data: any) => {
        // วาดเส้นประและชื่อใน cell ที่เหมาะสม
        if (data.cell.section === 'body') {
          const cell = data.cell
          const rowIndex = data.row.index
          const colIndex = data.column.index

          // แถวแรก: วาดเส้นประสำหรับลายมือชื่อ
          if (rowIndex === 0) {
            doc.setFontSize(14)
            doc.setFont('THSarabunNew', 'normal')
            const label = 'ลายมือชื่อ'
            const labelWidth = doc.getTextWidth(label)

            // วาดข้อความ "ลายมือชื่อ" (ขยับลงมาจากเส้นด้านบนมากขึ้น)
            doc.text(label, cell.x + 2, cell.y + 8)

            // วาดเส้นประ
            doc.setLineWidth(0.1)
            doc.setDrawColor(0, 0, 0)
            const dashLength = 1
            const gapLength = 1
            let x = cell.x + 2 + labelWidth + 2
            const endX = cell.x + cell.width - 2

            while (x < endX) {
              doc.line(x, cell.y + 8, Math.min(x + dashLength, endX), cell.y + 8)
              x += dashLength + gapLength
            }

            // วาดชื่อผู้ใช้ในคอลัมน์ขวา (ผู้รับการประเมิน)
            if (colIndex === 1 && userFullName11) {
              const cellCenterX = cell.x + cell.width / 2
              const nameWidth = doc.getTextWidth(userFullName11)
              doc.text(userFullName11, cellCenterX - nameWidth / 2, cell.y + 7)
            }
          }

          // แถวที่สอง: แสดง (ผู้ประเมิน) และ (ผู้รับการประเมิน) ตรงกลาง
          // ลบเฉพาะเส้นตารางแนวนอนด้านบนและด้านล่าง (คงเส้นตารางแนวตั้งไว้)
          if (rowIndex === 1) {
            // ลบเส้นตารางแนวนอนด้านบนทั้งหมด
            doc.setLineWidth(0.3)
            doc.setDrawColor(255, 255, 255) // ใช้สีขาวเพื่อลบเส้น
            doc.line(cell.x, cell.y, cell.x + cell.width, cell.y)

            // ลบเส้นตารางแนวนอนด้านล่างทั้งหมด
            doc.line(cell.x, cell.y + cell.height, cell.x + cell.width, cell.y + cell.height)

            doc.setFontSize(14)
            doc.setFont('THSarabunNew', 'normal')
            const label = colIndex === 0 ? '(ผู้ประเมิน)' : '(ผู้รับการประเมิน)'
            const labelWidth = doc.getTextWidth(label)
            const cellCenterX = cell.x + cell.width / 2
            doc.text(label, cellCenterX - labelWidth / 2, cell.y + 5)
          }

          // แถวที่สาม: วาดเส้นประสำหรับวันที่ เดือน พ.ศ.
          if (rowIndex === 2) {
            doc.setFontSize(14)
            doc.setFont('THSarabunNew', 'normal')
            doc.setLineWidth(0.1)
            doc.setDrawColor(0, 0, 0)
            const dashLength = 1
            const gapLength = 1

            const fieldWidth = (cell.width - 4) / 3
            let currentX = cell.x + 2

            // วันที่
            doc.text('วันที่', currentX, cell.y + 5)
            let x = currentX + 12
            const dateEndX = currentX + fieldWidth - 2
            while (x < dateEndX) {
              doc.line(x, cell.y + 5, Math.min(x + dashLength, dateEndX), cell.y + 5)
              x += dashLength + gapLength
            }

            // เดือน
            currentX += fieldWidth
            doc.text('เดือน', currentX, cell.y + 5)
            x = currentX + 12
            const monthEndX = currentX + fieldWidth - 2
            while (x < monthEndX) {
              doc.line(x, cell.y + 5, Math.min(x + dashLength, monthEndX), cell.y + 5)
              x += dashLength + gapLength
            }

            // พ.ศ.
            currentX += fieldWidth
            doc.text('พ.ศ.', currentX, cell.y + 5)
            x = currentX + 12
            const yearEndX = cell.x + cell.width - 2
            while (x < yearEndX) {
              doc.line(x, cell.y + 5, Math.min(x + dashLength, yearEndX), cell.y + 5)
              x += dashLength + gapLength
            }
          }
        }
      }
    })

    // ส่วนที่ 5: การรับทราบผลการประเมิน
    let section5StartY = (doc as any).lastAutoTable.finalY + 10
    if (section5StartY > doc.internal.pageSize.getHeight() - 120) {
      doc.addPage()
      section5StartY = 32
    }

    doc.setFont('THSarabunNew', 'bold')
    doc.setFontSize(14)
    doc.text('ส่วนที่ 5 : การรับทราบผลการประเมิน', 14, section5StartY)
    const section5Y = section5StartY + 7

    const section5MarginLeft = 14
    const section5MarginRight = 14
    const section5ContentWidth = pageWidth - section5MarginLeft - section5MarginRight
    const section5DashLength = 1
    const section5GapLength = 1
    const section5LineSpacing = 8

    doc.setFont('THSarabunNew', 'normal')
    doc.setFontSize(14)
    doc.setLineWidth(0.1)
    doc.setDrawColor(0, 0, 0)

    // วาดกรอบหลัก
    const section5BoxY = section5Y
    const section5BoxHeight = 75
    doc.rect(section5MarginLeft, section5BoxY, section5ContentWidth, section5BoxHeight)

    // เส้นแบ่งแนวตั้งระหว่างคอลัมน์ซ้ายและขวา
    const section5VerticalLineX = section5MarginLeft + section5ContentWidth / 2
    doc.line(section5VerticalLineX, section5BoxY, section5VerticalLineX, section5BoxY + section5BoxHeight)

    // เส้นแบ่งระหว่างผู้รับการประเมินและผู้ประเมิน
    doc.line(section5MarginLeft, section5BoxY + 37, section5MarginLeft + section5ContentWidth, section5BoxY + 37)

    let section5CurrentY = section5BoxY + 8

    // ส่วนที่ 1: ผู้รับการประเมิน
    doc.setFont('THSarabunNew', 'bold')
    doc.text('ผู้รับการประเมิน', section5MarginLeft + 2, section5CurrentY)
    section5CurrentY += 6

    doc.setFont('THSarabunNew', 'normal')
    // Checkbox
    doc.setLineWidth(0.5)
    doc.rect(section5MarginLeft + 2, section5CurrentY - 2, 3, 3)

    // แบ่งข้อความเป็น 2 บรรทัด
    const checkbox1Text1 = 'ได้รับทราบผลการประเมินและแผนพัฒนาการปฏิบัติราชการ'
    const checkbox1Text2 = 'รายบุคคลแล้ว'
    const checkbox1TextX = section5MarginLeft + 7
    const checkbox1MaxX = section5VerticalLineX - 2

    // ตรวจสอบความกว้างของข้อความแรก
    const checkbox1Text1Width = doc.getTextWidth(checkbox1Text1)
    if (checkbox1TextX + checkbox1Text1Width > checkbox1MaxX) {
      // ถ้าเกิน ให้ขึ้นบรรทัดใหม่
      section5CurrentY += section5LineSpacing
    }
    doc.text(checkbox1Text1, checkbox1TextX, section5CurrentY)

    // ขึ้นบรรทัดใหม่สำหรับ "รายบุคคลแล้ว"
    section5CurrentY += section5LineSpacing
    doc.text(checkbox1Text2, checkbox1TextX, section5CurrentY)

    // คอลัมน์ขวา: ลงชื่อ ตำแหน่ง วันที่
    const section5RightColumnX = section5VerticalLineX + 2
    let section5RightY = section5BoxY + 12

    // ลงชื่อ
    doc.text('ลงชื่อ', section5RightColumnX, section5RightY)
    let section5X = section5RightColumnX + 18
    while (section5X < section5MarginLeft + section5ContentWidth - 2) {
      doc.setLineWidth(0.1)
      doc.line(section5X, section5RightY, Math.min(section5X + section5DashLength, section5MarginLeft + section5ContentWidth - 2), section5RightY)
      section5X += section5DashLength + section5GapLength
    }
    // TODO: ยังไม่ต้องใส่ชื่อผู้ใช้ตามบัญชี
    // if (userInfo.u_fname && userInfo.u_lname) {
    //   const fullName = `${userInfo.prefix_name || ''} ${userInfo.u_fname || ''} ${userInfo.u_lname || ''}`.trim()
    //   doc.text(fullName, section5RightColumnX + 20, section5RightY)
    // }

    // ตำแหน่ง
    section5RightY += section5LineSpacing
    doc.text('ตำแหน่ง', section5RightColumnX, section5RightY)
    section5X = section5RightColumnX + 20
    while (section5X < section5MarginLeft + section5ContentWidth - 2) {
      doc.setLineWidth(0.1)
      doc.line(section5X, section5RightY, Math.min(section5X + section5DashLength, section5MarginLeft + section5ContentWidth - 2), section5RightY)
      section5X += section5DashLength + section5GapLength
    }
    // TODO: ยังไม่ต้องใส่ตำแหน่งตามบัญชี
    // if (userInfo.type_p_name) {
    //   doc.text(userInfo.type_p_name, section5RightColumnX + 22, section5RightY)
    // }

    // วันที่
    section5RightY += section5LineSpacing
    doc.text('วันที่', section5RightColumnX, section5RightY)
    section5X = section5RightColumnX + 18
    while (section5X < section5MarginLeft + section5ContentWidth - 2) {
      doc.setLineWidth(0.1)
      doc.line(section5X, section5RightY, Math.min(section5X + section5DashLength, section5MarginLeft + section5ContentWidth - 2), section5RightY)
      section5X += section5DashLength + section5GapLength
    }

    // ส่วนที่ 2: ผู้ประเมิน
    section5CurrentY = section5BoxY + 42

    doc.setFont('THSarabunNew', 'bold')
    doc.text('ผู้ประเมิน', section5MarginLeft + 2, section5CurrentY)
    section5CurrentY += 6

    doc.setFont('THSarabunNew', 'normal')
    // Checkbox 1
    doc.setLineWidth(0.5)
    doc.rect(section5MarginLeft + 2, section5CurrentY - 2, 3, 3)
    doc.text('ได้แจ้งผลการประเมินและผู้รับการประเมิน ได้ลงนาม รับทราบ', section5MarginLeft + 7, section5CurrentY)

    // คอลัมน์ขวา: ลงชื่อ ตำแหน่ง วันที่ (สำหรับ checkbox 1)
    section5RightY = section5BoxY + 42 + 4 // เริ่มต้นที่ checkbox 1
    doc.text('ลงชื่อ', section5RightColumnX, section5RightY)
    section5X = section5RightColumnX + 18
    while (section5X < section5MarginLeft + section5ContentWidth - 2) {
      doc.setLineWidth(0.1)
      doc.line(section5X, section5RightY, Math.min(section5X + section5DashLength, section5MarginLeft + section5ContentWidth - 2), section5RightY)
      section5X += section5DashLength + section5GapLength
    }

    // ตำแหน่ง
    section5RightY += section5LineSpacing
    doc.text('ตำแหน่ง', section5RightColumnX, section5RightY)
    section5X = section5RightColumnX + 20
    while (section5X < section5MarginLeft + section5ContentWidth - 2) {
      doc.setLineWidth(0.1)
      doc.line(section5X, section5RightY, Math.min(section5X + section5DashLength, section5MarginLeft + section5ContentWidth - 2), section5RightY)
      section5X += section5DashLength + section5GapLength
    }

    // วันที่
    section5RightY += section5LineSpacing
    doc.text('วันที่', section5RightColumnX, section5RightY)
    section5X = section5RightColumnX + 18
    while (section5X < section5MarginLeft + section5ContentWidth - 2) {
      doc.setLineWidth(0.1)
      doc.line(section5X, section5RightY, Math.min(section5X + section5DashLength, section5MarginLeft + section5ContentWidth - 2), section5RightY)
      section5X += section5DashLength + section5GapLength
    }

    // Checkbox 2
    section5CurrentY += section5LineSpacing + 2
    doc.setLineWidth(0.5)
    doc.rect(section5MarginLeft + 2, section5CurrentY - 2, 3, 3)
    const section5TextX = section5MarginLeft + 7
    const section5MaxX = section5VerticalLineX - 2 // จำกัดให้ไม่เกินเส้นแบ่งคอลัมน์
    const section5AvailableWidth = section5MaxX - section5TextX // ความกว้างที่ใช้ได้

    // สร้างข้อความทั้งหมด
    const checkbox2Text = 'ได้แจ้งผลการประเมินเมื่อวันที่'
    const checkbox2Text2 = 'แต่ ผู้รับการประเมินไม่ลงนามรับทราบผลการประเมินโดย มี'
    const checkbox2Text3 = 'เป็นพยาน'

    // ตรวจสอบความกว้างและตัดขึ้นบรรทัดใหม่ถ้าจำเป็น
    let currentLineY = section5CurrentY
    let currentLineX = section5TextX

    // บรรทัดที่ 1: "ได้แจ้งผลการประเมินเมื่อวันที่" + เส้นประ
    const text1Width = doc.getTextWidth(checkbox2Text)
    if (currentLineX + text1Width + 30 > section5MaxX) {
      // ถ้าเกิน ให้ขึ้นบรรทัดใหม่
      currentLineY += section5LineSpacing
      currentLineX = section5MarginLeft + 7
    }
    doc.text(checkbox2Text, currentLineX, currentLineY)
    currentLineX += text1Width + 2

    // เส้นประสำหรับวันที่ (จำกัดความยาวเท่ากับเส้นประพยาน)
    const dateDashLength = Math.min(40, section5MaxX - currentLineX - 10)
    const dateDashEndX = currentLineX + dateDashLength
    let dateDashX = currentLineX
    while (dateDashX < dateDashEndX) {
      doc.setLineWidth(0.1)
      doc.setDrawColor(0, 0, 0)
      doc.line(dateDashX, currentLineY, Math.min(dateDashX + section5DashLength, dateDashEndX), currentLineY)
      dateDashX += section5DashLength + section5GapLength
    }
    currentLineX = dateDashEndX

    // ตรวจสอบว่ามีพื้นที่พอสำหรับข้อความ "แต่ ผู้รับการประเมินไม่ลงนามรับทราบผลการประเมินโดย มี" หรือไม่
    const text2Width = doc.getTextWidth(checkbox2Text2)
    const availableWidthForText2 = section5MaxX - currentLineX

    if (text2Width > availableWidthForText2) {
      // ถ้าเกิน ให้ขึ้นบรรทัดใหม่
      currentLineY += section5LineSpacing
      currentLineX = section5MarginLeft + 7
    }

    // "แต่ ผู้รับการประเมินไม่ลงนามรับทราบผลการประเมินโดย มี"
    doc.text(checkbox2Text2, currentLineX, currentLineY)
    currentLineX += doc.getTextWidth(checkbox2Text2) + 2

    // ขึ้นบรรทัดใหม่สำหรับ "มี" (เส้นประ) และ "เป็นพยาน"
    currentLineY += section5LineSpacing
    currentLineX = section5MarginLeft + 7

    // "มี"
    doc.text('มี', currentLineX, currentLineY)
    currentLineX += doc.getTextWidth('มี') + 2

    // เส้นประสำหรับพยาน
    const witnessTextWidth = doc.getTextWidth(checkbox2Text3)
    const witnessDashLength = Math.min(40, section5MaxX - currentLineX - witnessTextWidth - 5)
    const witnessDashEndX = currentLineX + witnessDashLength

    while (currentLineX < witnessDashEndX && currentLineX < section5MaxX - witnessTextWidth - 5) {
      doc.setLineWidth(0.1)
      doc.line(currentLineX, currentLineY, Math.min(currentLineX + section5DashLength, witnessDashEndX), currentLineY)
      currentLineX += section5DashLength + section5GapLength
    }
    currentLineX = witnessDashEndX

    // "เป็นพยาน"
    doc.text(checkbox2Text3, currentLineX + 2, currentLineY)

    // เก็บตำแหน่งสุดท้าย
    const section5FinalY = section5BoxY + section5BoxHeight

    // ส่วนที่ 6: ความเห็นของผู้บังคับบัญชาเหนือขึ้นไป
    let section6Y = section5FinalY + 10

    // ตรวจสอบว่าหน้าจะพอหรือไม่ ถ้าไม่พอให้ขึ้นหน้าใหม่
    if (section6Y > doc.internal.pageSize.getHeight() - 100) {
      doc.addPage()
      section6Y = 32
    }

    doc.setFont('THSarabunNew', 'bold')
    doc.setFontSize(14)
    doc.text('ส่วนที่ 6 : ความเห็นของผู้บังคับบัญชาเหนือขึ้นไป', 14, section6Y)
    section6Y += 7

    // วาดกล่อง
    const section6MarginLeft = 14
    const section6MarginRight = 14
    const section6ContentWidth = pageWidth - section6MarginLeft - section6MarginRight
    const section6BoxY = section6Y
    const section6BoxHeight = 70
    doc.rect(section6MarginLeft, section6BoxY, section6ContentWidth, section6BoxHeight)

    // เส้นแบ่งแนวตั้งระหว่างคอลัมน์ซ้ายและขวา
    const section6VerticalLineX = section6MarginLeft + section6ContentWidth / 2
    doc.line(section6VerticalLineX, section6BoxY, section6VerticalLineX, section6BoxY + section6BoxHeight)

    // เส้นแบ่งระหว่างผู้บังคับบัญชาเหนือขึ้นไปและอีกชั้นหนึ่ง
    doc.line(section6MarginLeft, section6BoxY + 37, section6MarginLeft + section6ContentWidth, section6BoxY + 37)

    const section6DashLength = 1
    const section6GapLength = 1
    const section6LineSpacing = 8
    const section6RightColumnX = section6VerticalLineX + 2
    const section6MaxX = section6VerticalLineX - 2

    doc.setFont('THSarabunNew', 'normal')
    doc.setFontSize(14)
    doc.setLineWidth(0.1)
    doc.setDrawColor(0, 0, 0)

    let section6CurrentY = section6BoxY + 8

    // ส่วนที่ 1: ผู้บังคับบัญชาเหนือขึ้นไป
    doc.setFont('THSarabunNew', 'bold')
    doc.text('ผู้บังคับบัญชาเหนือขึ้นไป', section6MarginLeft + 2, section6CurrentY)
    section6CurrentY += 6

    doc.setFont('THSarabunNew', 'normal')
    // Checkbox 1
    doc.setLineWidth(0.5)
    doc.rect(section6MarginLeft + 2, section6CurrentY - 2, 3, 3)
    doc.text('เห็นด้วยกับผลการประเมิน', section6MarginLeft + 7, section6CurrentY)
    section6CurrentY += section6LineSpacing

    // Checkbox 2
    doc.setLineWidth(0.5)
    doc.rect(section6MarginLeft + 2, section6CurrentY - 2, 3, 3)
    doc.text('มีความเห็นแตกต่าง ดังนี้', section6MarginLeft + 7, section6CurrentY)
    let section6X = section6MarginLeft + 7 + doc.getTextWidth('มีความเห็นแตกต่าง ดังนี้') + 2
    while (section6X < section6MaxX) {
      doc.setLineWidth(0.1)
      doc.line(section6X, section6CurrentY, Math.min(section6X + section6DashLength, section6MaxX), section6CurrentY)
      section6X += section6DashLength + section6GapLength
    }

    // คอลัมน์ขวา: ลงชื่อ ตำแหน่ง วันที่
    let section6RightY = section6BoxY + 12
    doc.text('ลงชื่อ', section6RightColumnX, section6RightY)
    section6X = section6RightColumnX + 18
    while (section6X < section6MarginLeft + section6ContentWidth - 2) {
      doc.setLineWidth(0.1)
      doc.line(section6X, section6RightY, Math.min(section6X + section6DashLength, section6MarginLeft + section6ContentWidth - 2), section6RightY)
      section6X += section6DashLength + section6GapLength
    }

    section6RightY += section6LineSpacing
    doc.text('ตำแหน่ง', section6RightColumnX, section6RightY)
    section6X = section6RightColumnX + 20
    while (section6X < section6MarginLeft + section6ContentWidth - 2) {
      doc.setLineWidth(0.1)
      doc.line(section6X, section6RightY, Math.min(section6X + section6DashLength, section6MarginLeft + section6ContentWidth - 2), section6RightY)
      section6X += section6DashLength + section6GapLength
    }

    section6RightY += section6LineSpacing
    doc.text('วันที่', section6RightColumnX, section6RightY)
    section6X = section6RightColumnX + 18
    while (section6X < section6MarginLeft + section6ContentWidth - 2) {
      doc.setLineWidth(0.1)
      doc.line(section6X, section6RightY, Math.min(section6X + section6DashLength, section6MarginLeft + section6ContentWidth - 2), section6RightY)
      section6X += section6DashLength + section6GapLength
    }

    // ส่วนที่ 2: ผู้บังคับบัญชาเหนือขึ้นไปอีกชั้นหนึ่ง
    section6CurrentY = section6BoxY + 42

    doc.setFont('THSarabunNew', 'bold')
    doc.text('ผู้บังคับบัญชาเหนือขึ้นไปอีกชั้นหนึ่ง (ถ้ามี)', section6MarginLeft + 2, section6CurrentY)
    section6CurrentY += 6

    doc.setFont('THSarabunNew', 'normal')
    // Checkbox 1
    doc.setLineWidth(0.5)
    doc.rect(section6MarginLeft + 2, section6CurrentY - 2, 3, 3)
    doc.text('เห็นด้วยกับผลการประเมิน', section6MarginLeft + 7, section6CurrentY)
    section6CurrentY += section6LineSpacing

    // Checkbox 2
    doc.setLineWidth(0.5)
    doc.rect(section6MarginLeft + 2, section6CurrentY - 2, 3, 3)
    doc.text('มีความเห็นแตกต่าง ดังนี้', section6MarginLeft + 7, section6CurrentY)
    section6X = section6MarginLeft + 7 + doc.getTextWidth('มีความเห็นแตกต่าง ดังนี้') + 2
    while (section6X < section6MaxX) {
      doc.setLineWidth(0.1)
      doc.line(section6X, section6CurrentY, Math.min(section6X + section6DashLength, section6MaxX), section6CurrentY)
      section6X += section6DashLength + section6GapLength
    }

    // คอลัมน์ขวา: ลงชื่อ ตำแหน่ง วันที่
    section6RightY = section6BoxY + 42 + 4
    doc.text('ลงชื่อ', section6RightColumnX, section6RightY)
    section6X = section6RightColumnX + 18
    while (section6X < section6MarginLeft + section6ContentWidth - 2) {
      doc.setLineWidth(0.1)
      doc.line(section6X, section6RightY, Math.min(section6X + section6DashLength, section6MarginLeft + section6ContentWidth - 2), section6RightY)
      section6X += section6DashLength + section6GapLength
    }

    section6RightY += section6LineSpacing
    doc.text('ตำแหน่ง', section6RightColumnX, section6RightY)
    section6X = section6RightColumnX + 20
    while (section6X < section6MarginLeft + section6ContentWidth - 2) {
      doc.setLineWidth(0.1)
      doc.line(section6X, section6RightY, Math.min(section6X + section6DashLength, section6MarginLeft + section6ContentWidth - 2), section6RightY)
      section6X += section6DashLength + section6GapLength
    }

    section6RightY += section6LineSpacing
    doc.text('วันที่', section6RightColumnX, section6RightY)
    section6X = section6RightColumnX + 18
    while (section6X < section6MarginLeft + section6ContentWidth - 2) {
      doc.setLineWidth(0.1)
      doc.line(section6X, section6RightY, Math.min(section6X + section6DashLength, section6MarginLeft + section6ContentWidth - 2), section6RightY)
      section6X += section6DashLength + section6GapLength
    }

    // คำจำกัดความ
    // บังคับขึ้นหน้าใหม่
    doc.addPage()
    let definitionsY = 32

    doc.setFont('THSarabunNew', 'bold')
    doc.setFontSize(14)
    doc.text('คำจำกัดความ', 14, definitionsY)
    definitionsY += 7

    const definitions = [
      { title: 'ภาระงานหลัก', text: 'คือ งานที่ต้องรับผิดชอบตามตำแหน่งหน้าที่หรืองานที่ผู้บังคับบัญชาได้กำหนดให้เป็นภาระงาน' },
      { title: 'ภาระงานบริหาร', text: 'คือ การปฏิบัติงานที่ครอบคลุมถึงการมอบหมาย วินิจฉัย สั่งการ ควบคุม ตรวจสอบ ให้คำปรึกษาแนะนำปรับปรุงแก้ไข ติดตาม ประเมินผลและแก้ปัญหาขัดข้องในหน่วยงานที่รับผิดชอบให้เกิดความถูกต้อง เรียบร้อย สมบูรณ์และทันเหตุการณ์ทั้งนี้รวมถึงงานวางแผนประจำ งานแผนกลยุทธ์ งานการประชุม' },
      { title: 'ภาระงานเชิงพัฒนา/บริการวิชาการ', text: 'คือ การปฏิบัติงานโครงการ กิจกรรมที่มีการคิดค้น แก้ปัญหา ปรับปรุงและพัฒนาหรือสร้างนวัตกรรม ระบบงาน อาทิ การจัดทำคู่มือการปฏิบัติงานมาตรฐานการทำงานการลดขั้นตอนการทำงานรวมถึงการค้นคว้า วิเคราะห์ วิจัยเพื่อพัฒนางานใหม่' },
      { title: 'ภาระงานที่ได้รับมอบหมาย', text: 'คือ การปฏิบัติงานตามที่ได้รับมอบหมายอื่น ๆ เช่นหน้าที่ที่ได้รับมอบหมายจากผู้บังคับบัญชานอกเหนือจากภาระงานหลัก การเป็นกรรมการหรือคณะทำงานเพื่อพัฒนางานส่วนรวมของหน่วยงานหรือมหาวิทยาลัย' }
    ]

    doc.setFontSize(12)
    const definitionsAvailableWidth = pageWidth - 50 // margin left + right + padding
    const definitionsStartX = 18

    definitions.forEach((def) => {
      // แสดง bullet point และ title
      doc.setFont('THSarabunNew', 'normal')
      doc.text('-', definitionsStartX - 4, definitionsY)

      doc.setFont('THSarabunNew', 'bold')
      doc.text(def.title, definitionsStartX, definitionsY)

      const titleWidth = doc.getTextWidth(def.title)
      const textStartX = definitionsStartX + titleWidth + 1
      const textAvailableWidth = definitionsAvailableWidth - (textStartX - definitionsStartX)

      // แบ่งข้อความ (text) เป็นหลายบรรทัดโดยอัตโนมัติโดยใช้ splitTextToSize
      doc.setFont('THSarabunNew', 'normal')

      // ใช้ splitTextToSize เพื่อแบ่งข้อความ
      const splitLines = doc.splitTextToSize(def.text, textAvailableWidth)

      splitLines.forEach((line: string, index: number) => {
        const lineY = definitionsY + (index * 8)
        if (index === 0) {
          // บรรทัดแรก เริ่มต่อจาก title
          doc.text(line, textStartX, lineY)
        } else {
          // บรรทัดถัดไป เริ่มจาก definitionsStartX
          doc.text(line, definitionsStartX, lineY)
        }
      })

      const lineY = definitionsY + (splitLines.length * 8)

      // เว้นระยะห่างระหว่างข้อ
      definitionsY = lineY
    })

    const titleLine1 = 'ข้อตกลงและแบบประเมินผลการปฏิบัติงานของบุคลากรสายวิชาการ'

    const titleLine2 = `มหาวิทยาลัยเทคโนโลยีราชมงคลล้านนา${currentYear ? ' ประจำปีงบประมาณ ' + currentYear : ''}`

    const titleLine2NoYear = 'มหาวิทยาลัยเทคโนโลยีราชมงคลล้านนา'



    const totalPages = (doc as any).internal.getNumberOfPages()

    for (let i = 1; i <= totalPages; i++) {

      doc.setPage(i)

      doc.setFont('THSarabunNew', 'bold')

      doc.setFontSize(14)

      const midX = doc.internal.pageSize.getWidth() / 2

      if (i === 1) {

        doc.text(titleLine1, midX, 15, { align: 'center' })

        doc.text(titleLine2, midX, 22, { align: 'center' })

      } else {

        doc.text(titleLine1, midX, 15, { align: 'center' })

        doc.text(titleLine2NoYear, midX, 22, { align: 'center' })

      }

    }



    // Save PDF

    doc.save(`workload-report-${params.roundId || 'export'}.pdf`)



  } catch (error) {

    console.error('Export PDF with links error:', error)

    const errorMessage = error instanceof Error ? error.message : 'Unknown error'

    alert('เกิดข้อผิดพลาดในการ export PDF: ' + errorMessage)

  } finally {

    params.onExportEnd()

  }

}
