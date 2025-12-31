import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { jwtDecode } from 'jwt-decode'
import SetAssessorServices from '@/services/setAssessorServices'
import WorkloadGroupServices from '@/services/workloadGroupServices'
import type { Terms } from '@/Types'
import type { PerformanceSnapshot } from '@/services/performanceService'
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

export const handleExportPDFWithLinks = async (params: ExportPDFParams) => {

    try {

      params.onExportStart()



      const baseUrl = process.env.NEXT_PUBLIC_API?.replace('/api', '') || 'http://localhost:3333'



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

          const response = await SetAssessorServices.getAllRounds(params.session.accessToken)

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

              params.session.accessToken,

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

          const groupsResponse = await WorkloadGroupServices.getAllWorkloadGroups(params.session.accessToken, {

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

                (formInfo.quality * formInfo.workload).toString(),

                formInfo.description && formInfo.description !== '-' ? formInfo.description : '-'

              ])

              workloadRowLinks.push(evidenceLinks.length > 0 ? evidenceLinks[0] : null)

            }

            )

          })



          const hasAny = allSubtasks.some(st => st.form_infos && st.form_infos.length > 0)

          const taskTotal = allSubtasks.reduce((subSum, subtask) =>

            subSum + (subtask.form_infos || []).reduce((formSum, formInfo) =>

              formSum + (formInfo.quality * formInfo.workload), 0

            ), 0

          )



          const isBelowRequired = task.quantity_workload_hours && taskTotal < task.quantity_workload_hours



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

                (formInfo.quality * formInfo.workload).toString(),

                formInfo.description && formInfo.description !== '-' ? formInfo.description : '-'

              ])

              rowLinks.push(evidenceLinks.length > 0 ? evidenceLinks[0] : null)

            })

          })



          const hasAny = allSubtasks.some(st => st.form_infos && st.form_infos.length > 0)

          const taskTotal = allSubtasks.reduce((subSum, subtask) =>

            subSum + (subtask.form_infos || []).reduce((formSum, formInfo) =>

              formSum + (formInfo.quality * formInfo.workload), 0

            ), 0

          )



          const isBelowRequired = task.quantity_workload_hours && taskTotal < task.quantity_workload_hours





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



      const totalWorkload = Array.isArray(params.workloadData) ? params.workloadData.reduce((sum, task) =>

        sum + Object.values(task.subtasks).reduce((subSum, subtask) =>

          subSum + subtask.form_infos.reduce((formSum, formInfo) =>

            formSum + (formInfo.quality * formInfo.workload), 0

          ), 0

        ), 0

      ) : 0



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

              formSum + (formInfo.quality * formInfo.workload), 0

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

            formSum + (formInfo.quality * formInfo.workload), 0

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

      const scoreNumber = params.performanceScoreOutOf70.toFixed(2)

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



        // ดึง position_name และ position_short_name จาก snapshot

        const snapshotPositionName = sortedEvaluations.length > 0

          ? sortedEvaluations[0]?.position_name || null

          : null

        const snapshotPositionShortName = sortedEvaluations.length > 0

          ? sortedEvaluations[0]?.position_short_name || null

          : null



        // สร้างข้อมูลตาราง performance evaluation

        const performanceHead = [[

          'ลำดับ',

          'สมรรถนะหลัก (ที่สภามหาวิทยาลัยกำหนด)',

          `ระดับสมรรถนะที่คาดหวัง\n(${snapshotPositionShortName || snapshotPositionName || 'ตำแหน่ง'})`,

          'ระดับสมรรถนะที่แสดงออก'

        ]]



        const performanceBody: any[] = sortedEvaluations.map((evaluation, index) => [

          (index + 1).toString(),

          evaluation.competency_name || '-',

          evaluation.expected_level !== null && evaluation.expected_level !== undefined

            ? evaluation.expected_level.toString()

            : '-',

          evaluation.demonstrated_level !== null && evaluation.demonstrated_level !== undefined

            ? evaluation.demonstrated_level.toString()

            : '-'

        ])



        autoTable(doc, {

          startY: performanceStartY,

          margin: { left: 10, right: 10, top: 30 },

          head: performanceHead,

          body: performanceBody,

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

              cellWidth: 20,

              halign: 'center',

              font: 'THSarabunNew'

            },

            1: {

              cellWidth: 80,

              font: 'THSarabunNew',

              halign: 'left'

            },

            2: {

              cellWidth: 50,

              halign: 'center',

              font: 'THSarabunNew',

              textColor: [0, 0, 0],

              fillColor: [255, 255, 255] // สีขาว (ไม่ highlight สีเขียวแล้ว)

            },

            3: {

              cellWidth: 40,

              halign: 'center',

              font: 'THSarabunNew',

              textColor: [0, 0, 255] // สีน้ำเงิน

            }

          }

        })

      }



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
