'use client'
import React, { useEffect, useState, useMemo } from 'react'
import type { Terms } from '@/Types'
import useAuthHeaders from '@/hooks/Header'
import { LinkIcon, FileText, ImageIcon, FileDown } from 'lucide-react'
import axios from 'axios'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { jwtDecode } from 'jwt-decode'
import { useSession } from 'next-auth/react'
import SetAssessorServices from '@/services/setAssessorServices'

interface WorkloadFormProps {
  selectedGroupName?: string
  terms?: Terms[]
  userId?: number
  roundId?: number
}

// เพิ่มฟังก์ชันสำหรับตรวจสอบประเภทไฟล์
const isImageFile = (fileName: string | null | undefined): boolean => {
  if (!fileName) return false

  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp']
  const ext = fileName.substring(fileName.lastIndexOf('.')).toLowerCase()
  return imageExtensions.includes(ext)
}

interface FormInfo {
  form_id: number
  form_title: string
  description: string
  workload: number
  quality: number
  file_type: string
  ex_score: number
  evidence?: string
  link_name?: string
  link_path?: string
  files?: Array<{
    fileinfo_id: number
    file_name: string
  }>
  links?: Array<{
    link_name: string
    link_path: string
  }>
}

interface Subtask {
  subtask_id: number
  subtask_name: string
  form_infos: FormInfo[]
}

interface Task {
  task_id: number
  task_name: string
  workload_group_id?: number
  workload_group_name?: string
  quantity_workload_hours?: number
  subtasks: { [key: number]: Subtask }
}

export default function _workloadForm({ selectedGroupName, terms = [], userId, roundId }: WorkloadFormProps) {
  const [workloadData, setWorkloadData] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [exporting, setExporting] = useState(false)
  const [roundName, setRoundName] = useState<string>('')
  const [year, setYear] = useState<string>('')
  const headers = useAuthHeaders()
  const { data: session } = useSession()

  const memoizedHeaders = useMemo(() => headers, [headers.Authorization])

  useEffect(() => {
    const fetchWorkloadData = async () => {
      if (!userId || !roundId) return

      try {
        setLoading(true)
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API}/workload_form/items/${userId}/${roundId}`,
          { headers: memoizedHeaders }
        )

        if (response.data.success && response.data.payload) {
          console.log('API Response:', response.data.payload)
          console.log('Number of tasks:', response.data.payload.length)
          setWorkloadData(response.data.payload)
        }
      } catch (error) {
        console.error('Error fetching workload data:', error)
        const mockData: Task[] = [
          {
            task_id: 1,
            task_name: "ภาระงานสอน",
            subtasks: {
              1: {
                subtask_id: 1,
                subtask_name: "ภาระงานเกณฑ์การคิดภาระงานสอนชั่วโมงทฤษฎี",
                form_infos: [
                  {
                    form_id: 1,
                    form_title: "ภาระงานสอนชั่วโมงทฤษฎี 1/2567",
                    description: "จำนวน 12 ชม/สัปดาห์",
                    workload: 2,
                    quality: 6,
                    file_type: "external file",
                    ex_score: 0
                  }
                ]
              }
            }
          }
        ]
        setWorkloadData(mockData)
      } finally {
        setLoading(false)
      }
    }

    fetchWorkloadData()
  }, [userId, roundId, memoizedHeaders])

  // ดึงข้อมูลรอบการประเมิน
  useEffect(() => {
    const fetchRoundName = async () => {
      if (!roundId || !session?.accessToken) return

      try {
        const response = await SetAssessorServices.getAllRounds(session.accessToken)

        if (response.success && response.payload && Array.isArray(response.payload)) {
          const rounds = response.payload as any[]
          const currentRound = rounds.find((round: any) => round.round_list_id === roundId)
          if (currentRound && currentRound.round_list_name) {
            setRoundName(currentRound.round_list_name)
            setYear(currentRound.year)
          }
        }
      } catch (error) {
        console.error('Error fetching round name:', error)
      }
    }

    fetchRoundName()
  }, [roundId, session?.accessToken])


  const loadThaiFont = async () => {
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

  const loadThaiFontBold = async () => {
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

  const handleExportPDFWithLinks = async () => {
    try {
      setExporting(true)

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
      const currentYear = year
      doc.setFont('THSarabunNew', 'normal')
      doc.text('ข้อตกลงและแบบประเมินผลการปฏิบัติงานของบุคลากรสายวิชาการ', doc.internal.pageSize.getWidth() / 2, 15, { align: 'center' })
      doc.text('มหาวิทยาลัยเทคโนโลยีราชมงคลล้านนา' + ' ' + `ประจำปีงบประมาณ ${currentYear}`, doc.internal.pageSize.getWidth() / 2, 22, { align: 'center' })

      // หัวข้อแบบฟอร์ม
      doc.setFontSize(12)
      doc.setFont('THSarabunNew', 'normal')

      // ดึงข้อมูล currentRound
      let currentRound: any = null
      try {
        if (session?.accessToken) {
          const response = await SetAssessorServices.getAllRounds(session.accessToken)
          if (response.success && response.payload && Array.isArray(response.payload)) {
            const rounds = response.payload as any[]
            currentRound = rounds.find((round: any) => round.round_list_id === roundId)
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

      // กลุ่มต่างๆ
      const groups = [
        { name: 'กลุ่มทั่วไป', selected: false },
        { name: 'กลุ่มเน้นวิจัย', selected: false },
        { name: 'กลุ่มเน้นสอน', selected: selectedGroupName === 'เน้นสอน' || selectedGroupName?.includes('สอน') },
        { name: 'กลุ่มเน้นบริการวิชาการ', selected: false }
      ]

      let checkboxY = 42
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

      // แสดง roundName แทน checkbox
      let displayRoundName = currentRound?.round_list_name || roundName || '-'

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
        if (session?.accessToken) {
          const decoded = jwtDecode<any>(session.accessToken)
          userInfo = decoded
          console.log('User info from token:', userInfo)
        }
      } catch (error) {
        console.warn('Could not decode token:', error)
      }

      // หน่วยงาน
      doc.setFontSize(14)
      doc.setFont('THSarabunNew', 'bold')
      const fullText = 'หน่วยงาน  คณะบริหารธุรกิจและศิลปศาสตร์  มหาวิทยาลัยเทคโนโลยีราชมงคลล้านนา'
      const textWidth = doc.getTextWidth(fullText)
      const centerX = (pageWidth - textWidth) / 2
      doc.text(fullText, centerX, roundY + 8)

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
       doc.text('ลงชื่อ', doc.internal.pageSize.getWidth() / 2 - 90, currentY)
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



      // อัปเดต currentY หลังจากลงชื่อ
      currentY += 35

      if (terms && terms.length > 0) {
        doc.setFontSize(14)
        currentY += 10
        doc.text('เกณฑ์การประเมินภาระงาน', 14, currentY)
        currentY += 10

        const uniqueTasks = [...new Set(terms.map((term) => term.task_name))]
        const uniqueGroups = selectedGroupName
          ? [selectedGroupName]
          : [...new Set(terms.map((term) => term.workload_group_name))]

        const criteriaTableData: any[] = []

        criteriaTableData.push(['ภาระงาน', ...uniqueGroups.map(group => group)])

        uniqueTasks.forEach((taskName) => {
          const row = [taskName]
          uniqueGroups.forEach((groupName) => {
            const item = terms.find(
              (term) => term.task_name === taskName && term.workload_group_name === groupName
            )
            row.push(item ? item.quantity_workload_hours.toString() : '0')
          })
          criteriaTableData.push(row)
        })

        const totalRow = ['ผลรวม (ไม่น้อยกว่า)']
        uniqueGroups.forEach((groupName) => {
          const total = uniqueTasks.reduce((sum, taskName) => {
            const item = terms.find(
              (term) => term.task_name === taskName && term.workload_group_name === groupName
            )
            return sum + (item ? item.quantity_workload_hours : 0)
          }, 0)
          totalRow.push(total.toString())
        })
        criteriaTableData.push(totalRow)

        autoTable(doc, {
          startY: currentY,
          margin: { left: margin, right: margin },
          head: [criteriaTableData[0]],
          body: criteriaTableData.slice(1),
          theme: 'grid',
          styles: {
            font: 'THSarabunNew',
            fontSize: 12,
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

      workloadData.forEach((task) => {
        const taskTitle = task.quantity_workload_hours
          ? `${task.task_id}. ${task.task_name} (ภาระงานขั้นต่ำ) : ${task.quantity_workload_hours} ภาระงาน/สัปดาห์`
          : `${task.task_id}. ${task.task_name}`

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

        Object.values(task.subtasks).forEach((subtask, subtaskIndex) => {
          tableData.push([
            {
              content: `    ${task.task_id}.${subtaskIndex + 1} ${subtask.subtask_name}`,
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

          subtask.form_infos.forEach((formInfo, index) => {
            const rowKey = `${task.task_id}-${subtask.subtask_id}-${index}`

            let evidenceText = '-'
            let evidenceLinks: string[] = []

            if (formInfo.files && formInfo.files.length > 0) {
              evidenceText = formInfo.files.map(f => f.file_name).join(', ')
              evidenceLinks = formInfo.files.map(f => `${baseUrl}/files/${f.file_name}`)
            } else if (formInfo.links && formInfo.links.length > 0) {
              evidenceText = formInfo.links.map(l => l.link_name || l.link_path).join(', ')
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

        const taskTotal = Object.values(task.subtasks).reduce((subSum, subtask) =>
          subSum + subtask.form_infos.reduce((formSum, formInfo) =>
            formSum + (formInfo.quality * formInfo.workload), 0
          ), 0
        )

        const isBelowRequired = task.quantity_workload_hours && taskTotal < task.quantity_workload_hours

        console.log(`Task ${task.task_id} total:`, taskTotal)

        tableData.push([
          '',
          '',
          '',
          { content: 'รวมภาระงาน', styles: { halign: 'right', font: 'THSarabunNew', fontSize: 14, textColor: [0, 0, 0], fillColor: [255, 255, 255] } },
          {
            content: taskTotal.toString(),
            styles: {
              halign: 'center',
              font: 'THSarabunNew',
              fontSize: 14,
              textColor: isBelowRequired ? [255, 0, 0] : [0, 0, 0],
              fillColor: [255, 255, 255]
            }
          },
          ''
        ])
        rowLinks.push(null)
      })


      const totalItems = workloadData.reduce((sum, task) =>
        sum + Object.values(task.subtasks).reduce((subSum, subtask) =>
          subSum + subtask.form_infos.length, 0
        ), 0
      )

      const totalWorkload = workloadData.reduce((sum, task) =>
        sum + Object.values(task.subtasks).reduce((subSum, subtask) =>
          subSum + subtask.form_infos.reduce((formSum, formInfo) =>
            formSum + (formInfo.quality * formInfo.workload), 0
          ), 0
        ), 0
      )

      // Generate table with autoTable
      const startY = terms && terms.length > 0 ? (doc as any).lastAutoTable.finalY + 10 : currentY

      autoTable(doc, {
        startY: startY,
        margin: { left: margin, right: margin },
        head: [[
          '(1)\nภาระงาน/กิจกรรม/โครงการ/งาน',
          '(2)\nหลักฐาน',
          '(3)\nจำนวน',
          '(4)\nภาระงาน',
          '(5)\nรวมภาระงาน\n(3 x 4)',
          'หมายเหตุ'
        ]],
        body: tableData,
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
            cellWidth: 50, // ปรับให้พอดี A4 portrait
            font: 'THSarabunNew',
            textColor: [0, 0, 0],
            overflow: 'linebreak',
            halign: 'left'
          },
          1: {
            cellWidth: 35, // ปรับให้พอดี A4 portrait
            textColor: [37, 99, 235],
            font: 'THSarabunNew',
            overflow: 'linebreak'
          },
          2: {
            cellWidth: 23, // ปรับให้พอดี A4 portrait
            halign: 'center',
            font: 'THSarabunNew',
            textColor: [0, 0, 0]
          },
          3: {
            cellWidth: 25, // ปรับให้พอดี A4 portrait
            halign: 'center',
            font: 'THSarabunNew',
            textColor: [0, 0, 0]
          },
          4: {
            cellWidth: 27, // ปรับให้พอดี A4 portrait
            halign: 'center',
            textColor: [0, 0, 0],
            font: 'THSarabunNew'
          },
          5: {
            cellWidth: 30, // ปรับให้พอดี A4 portrait
            font: 'THSarabunNew',
            textColor: [0, 0, 0],
            overflow: 'linebreak',
            halign: 'left'
          }
        },
        // เพิ่มการตั้งค่าเพื่อป้องกันเส้นซ้อนกัน
        tableLineColor: [0, 0, 0],
        tableLineWidth: 0.1,
        // ป้องกันเส้นซ้อนกัน
        showHead: 'everyPage',
        showFoot: 'everyPage',
        // ไม่ซ่อนเส้นใดๆ - ให้แถวสรุปเป็นช่องตารางปกติ
        didDrawCell: (data: any) => {


          if (data.cell.section === 'body' && data.column.index === 1) {
            const link = rowLinks[data.row.index] || null
            if (link) {
              // Add a single link annotation covering the evidence cell
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

      // Add summary section
      const finalY = (doc as any).lastAutoTable.finalY + 15

      doc.setTextColor(0, 0, 0)
      doc.setFontSize(14)
      doc.setFont('THSarabunNew', 'normal')
      doc.text('สรุปภาระงาน', 14, finalY)

      // สร้างตารางสรุปภาระงาน 1-5
      const summaryTableData = []

      // เพิ่ม header สำหรับตารางสรุป
      summaryTableData.push(['ภาระงาน/กิจกรรม/โครงการ/งาน', 'รวมภาระงาน', 'หมายเหตุ'])

      // เพิ่มข้อมูลภาระงาน 1-5
      const taskNames = [
        '1. ภาระงานสอน',
        '2. ภาระงานวิจัยและงานวิชาการอื่นที่ปรากฏเป็นผลงานวิชาการตามหลักเกณฑ์ที่ ก.พ.อ.กำหนด',
        '3. ภาระงานบริการทางวิชาการ',
        '4. ภาระงานทำนุบำรุงศิลปวัฒนธรรม',
        '5. ภาระงานอื่น ๆ ที่สอดคล้องกับพันธกิจของคณะ มหาวิทยาลัย'
      ]

      let totalSummary = 0

      workloadData.forEach((task, index) => {
        if (index < 5) { // เฉพาะภาระงาน 1-5
          const taskTotal = Object.values(task.subtasks).reduce((subSum, subtask) =>
            subSum + subtask.form_infos.reduce((formSum, formInfo) =>
              formSum + (formInfo.quality * formInfo.workload), 0
            ), 0
          )

          summaryTableData.push([
            taskNames[index],
            taskTotal.toString(),
            '-'
          ])

          totalSummary += taskTotal
        }
      })

      // เพิ่มแถวสรุป
      summaryTableData.push(['(6) รวม', totalSummary.toString(), ''])

      autoTable(doc, {
        startY: finalY + 10,
        margin: { left: margin, right: margin },
        head: [summaryTableData[0]],
        body: summaryTableData.slice(1),
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
        },
        columnStyles: {
          0: {
            cellWidth: 120,
            font: 'THSarabunNew',
            textColor: [0, 0, 0],
            overflow: 'linebreak',
            halign: 'left'
          },
          1: {
            cellWidth: 30,
            halign: 'center',
            font: 'THSarabunNew',
            textColor: [0, 0, 0]
          },
          2: {
            cellWidth: 40,
            halign: 'center',
            font: 'THSarabunNew',
            textColor: [0, 0, 0]
          }
        }
      })

      // สรุปข้อมูลทั่วไป
      const generalSummaryY = (doc as any).lastAutoTable.finalY + 15
      doc.setFontSize(14)
      doc.setFont('THSarabunNew', 'normal')
      doc.text(`กลุ่มภาระงานที่เลือก: ${selectedGroupName || 'ยังไม่ได้เลือก'}`, 14, generalSummaryY)
      doc.text(`จำนวนรายการ: ${totalItems} รายการ`, 100, generalSummaryY)
      doc.text(`รวมภาระงานทั้งหมด: ${totalWorkload} ชั่วโมง`, 180, generalSummaryY)

      // Save PDF
      doc.save(`workload-report-${roundId || 'export'}.pdf`)

    } catch (error) {
      console.error('Export PDF with links error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      alert('เกิดข้อผิดพลาดในการ export PDF: ' + errorMessage)
    } finally {
      setExporting(false)
    }
  }

  if (loading) {
    return (
      <div className="rounded-md bg-white p-6 shadow dark:bg-zinc-900">
        <div className="animate-pulse">
          <div className="h-6 w-48 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div id="workload-content" className="space-y-4">
      <div className="flex justify-end gap-3 mb-4">
        <button
          id="export-pdf-btn"
          onClick={handleExportPDFWithLinks}
          disabled={exporting || workloadData.length === 0}
          className="inline-flex h-10 items-center px-4 py-2 bg-transparent border border-red-500 text-red-500 rounded-lg hover:text-white hover:bg-red-600 transition-colors duration-200"
          title="Export PDF พร้อม clickable links"
        >
          <FileDown className="mr-2 h-4 w-4" />
          ส่งออกเป็น PDF
        </button>
      </div>

      <div className="rounded-md p-4 bg-white dark:bg-zinc-900">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-300 dark:border-gray-600">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="border border-gray-300 px-4 py-3 text-center text-gray-700 dark:text-gray-300 font-medium">
                  ภาระงาน/กิจกรรม/โครงการ/งาน
                </th>
                <th className="border border-gray-300 px-4 py-3 text-left text-gray-700 dark:text-gray-300 font-medium">
                  หลักฐาน
                </th>
                <th className="border border-gray-300 px-4 py-3 text-center text-gray-700 dark:text-gray-300 font-medium">
                  จำนวน
                </th>
                <th className="border border-gray-300 px-4 py-3 text-center text-gray-700 dark:text-gray-300 font-medium">
                  ภาระงาน
                </th>
                <th className="border border-gray-300 px-4 py-3 text-center text-gray-700 dark:text-gray-300 font-medium">
                  รวมภาระงาน
                </th>
                <th className="border border-gray-300 px-4 py-3 text-center text-gray-700 dark:text-gray-300 font-medium max-w-10">
                  หมายเหตุ
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-zinc-900">
              {workloadData.length === 0 ? (
                <tr>
                  <td colSpan={6} className="border border-gray-300 px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                    <div className="flex flex-col items-center">
                      <div className="text-lg font-medium mb-2">ไม่มีข้อมูลภาระงาน</div>
                      <div className="text-sm">กรุณาเพิ่มข้อมูลภาระงานในระบบ</div>
                    </div>
                  </td>
                </tr>
              ) : (
                workloadData.map((task) => (
                  <React.Fragment key={task.task_id}>
                    {/* Task Row */}
                    <tr className="bg-business1 text-white dark:bg-zinc-900">
                      <td colSpan={6} className="border border-gray-300 px-4 py-3 dark:text-gray-200 font-normal">
                        <div className="flex items-center justify-between">
                          <span className="">
                            {task.task_id}. {task.task_name} (ภาระงานขั้นต่ำ)
                          </span>
                          {task.quantity_workload_hours && (
                            <span className="text-sm bg-white text-business1 px-2 py-1 rounded">
                              {task.quantity_workload_hours} ภาระงาน/สัปดาห์
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>

                    {/* Subtask Rows */}
                    {Object.values(task.subtasks).map((subtask, subtaskIndex) => (
                      <React.Fragment key={subtask.subtask_id}>
                        {/* Subtask Header */}
                        <tr className="bg-gray-50 dark:bg-gray-800/50">
                          <td colSpan={6} className="border border-gray-300 px-4 py-2 text-gray-700 dark:text-gray-300">
                            <div className="ml-6 flex items-center gap-2">
                              <span className="text-sm">
                                {task.task_id}.{subtaskIndex + 1} {subtask.subtask_name}
                              </span>
                            </div>
                          </td>
                        </tr>

                        {subtask.form_infos.map((formInfo, index) => (
                          <tr key={`${task.task_id}-${subtask.subtask_id}-${formInfo.form_id}-${index}`}>
                            <td className="border border-gray-300 px-4 py-2 text-gray-800 dark:text-gray-200">
                              <div className="ml-12 flex items-center gap-2">
                                <div>
                                  <div className="font-light text-sm dark:text-gray-200 max-w-[280px]">
                                    {task.task_id}.{subtaskIndex + 1}.{index + 1} {formInfo.form_title}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="border border-gray-300 px-4 py-2 text-left text-blue-600 dark:text-blue-400 text-sm max-w-[200px]">
                              <div className="space-y-1">
                                {formInfo.files && formInfo.files.length > 0 ? (
                                  formInfo.files.map((file, fileIndex) => (
                                    <button
                                      key={`file-${formInfo.form_id}-${fileIndex}`}
                                      onClick={() => {
                                        const baseUrl = process.env.NEXT_PUBLIC_API?.replace('/api', '') || 'http://localhost:3333'
                                        window.open(`${baseUrl}/files/${file.file_name}`, '_blank')
                                      }}
                                      className="inline-flex items-center text-sm text-blue-600 transition-colors duration-150 hover:text-blue-700 hover:underline dark:text-blue-400 dark:hover:text-blue-300 w-full"
                                      title={file.file_name}
                                    >
                                      {isImageFile(file.file_name) ? (
                                        <ImageIcon className="mr-2 h-4 w-4 text-blue-500 dark:text-blue-400" />
                                      ) : (
                                        <FileText className="mr-2 h-4 w-4 text-blue-500 dark:text-blue-400" />
                                      )}
                                      <span className="max-w-32 truncate">
                                        {file.file_name}
                                      </span>
                                    </button>
                                  ))
                                ) : formInfo.links && formInfo.links.length > 0 ? (
                                  formInfo.links.map((link, linkIndex) => (
                                    <button
                                      key={`link-${formInfo.form_id}-${linkIndex}`}
                                      onClick={() => {
                                        let url = link.link_path || ''
                                        if (!url.startsWith('http://') && !url.startsWith('https://')) {
                                          url = `https://${url}`
                                        }
                                        window.open(url, '_blank')
                                      }}
                                      className="inline-flex items-center text-sm text-blue-600 transition-colors duration-150 hover:text-blue-700 hover:underline dark:text-blue-400 dark:hover:text-blue-300 w-full"
                                      title={link.link_path}
                                    >
                                      <LinkIcon className="mr-2 h-4 w-4 text-blue-500 dark:text-blue-400" />
                                      <span className="max-w-32 truncate">
                                        {link.link_name}
                                      </span>
                                    </button>
                                  ))
                                ) : formInfo.evidence ? (
                                  <button
                                    onClick={() => {
                                      if (formInfo.file_type === 'link') {
                                        let url = formInfo.link_path || formInfo.evidence || ''
                                        if (!url.startsWith('http://') && !url.startsWith('https://')) {
                                          url = `https://${url}`
                                        }
                                        window.open(url, '_blank')
                                      } else {
                                        const baseUrl = process.env.NEXT_PUBLIC_API?.replace('/api', '') || 'http://localhost:3333'
                                        window.open(`${baseUrl}/files/${formInfo.evidence}`, '_blank')
                                      }
                                    }}
                                    className="inline-flex items-center text-sm text-blue-600 transition-colors duration-150 hover:text-blue-700 hover:underline dark:text-blue-400 dark:hover:text-blue-300 w-full"
                                    title={formInfo.link_path || formInfo.evidence}
                                  >
                                    {formInfo.file_type === 'link' ? (
                                      <LinkIcon className="mr-2 h-4 w-4 text-blue-500 dark:text-blue-400" />
                                    ) : isImageFile(formInfo.evidence) ? (
                                      <ImageIcon className="mr-2 h-4 w-4 text-blue-500 dark:text-blue-400" />
                                    ) : (
                                      <FileText className="mr-2 h-4 w-4 text-blue-500 dark:text-blue-400" />
                                    )}
                                    <span className="max-w-32 truncate">
                                      {formInfo.file_type === 'link' ? (formInfo.link_name || formInfo.evidence) : formInfo.evidence}
                                    </span>
                                  </button>
                                ) : (
                                  <span className="text-gray-500 dark:text-gray-400">-</span>
                                )}
                              </div>
                            </td>
                            <td className="border border-gray-300 px-4 py-2 text-center dark:text-blue-400 font-light text-sm">
                              {formInfo.quality}
                            </td>
                            <td className="border border-gray-300 px-4 py-2 text-center dark:text-blue-400 font-light text-sm">
                              {formInfo.workload}
                            </td>
                            <td className="border border-gray-300 px-4 py-2 text-center dark:text-success-400 font-normal text-sm">
                              {formInfo.quality * formInfo.workload}
                            </td>
                            <td className="border border-gray-300 px-4 py-2 text-left dark:text-blue-400 text-sm font-light break-words whitespace-normal max-w-[200px]">
                              {formInfo.description && formInfo.description !== '-' ? formInfo.description : '-'}
                            </td>
                          </tr>
                        ))}
                      </React.Fragment>
                    ))}

                    <tr className="dark:bg-blue-900/20 dark:border-blue-700">
                      <td colSpan={4} className="border border-gray-300 px-4 py-2 text-right font-light dark:text-blue-200 text-sm">
                        รวมภาระงาน
                      </td>
                      <td className={`border border-gray-300 px-4 py-2 text-center font-normal dark:text-blue-200 text-sm ${task.quantity_workload_hours &&
                        Object.values(task.subtasks).reduce((subSum, subtask) =>
                          subSum + subtask.form_infos.reduce((formSum, formInfo) =>
                            formSum + (formInfo.quality * formInfo.workload), 0
                          ), 0
                        ) < task.quantity_workload_hours
                        ? 'text-red-500'
                        : ''
                        }`}>
                        {Object.values(task.subtasks).reduce((subSum, subtask) =>
                          subSum + subtask.form_infos.reduce((formSum, formInfo) =>
                            formSum + (formInfo.quality * formInfo.workload), 0
                          ), 0
                        )}
                      </td>
                      <td className="border border-gray-300 px-4 py-2 text-left dark:text-blue-200">
                      </td>
                    </tr>
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="rounded-md bg-white p-6 shadow dark:bg-zinc-900">
        <h4 className="text-md font-normal text-gray-800 dark:text-gray-200 mb-4">
          ส่วนที่ 1 องค์ประกอบที่ 1 ผลสัมฤทธิ์ของงาน
        </h4>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-300 dark:border-gray-600">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="border border-gray-300 px-4 py-3 text-sm text-center text-gray-700 dark:text-gray-300 font-normal">
                  ภาระงาน/กิจกรรม/โครงการ/งาน
                </th>
                <th className="border border-gray-300 px-4 py-3 text-sm text-center text-gray-700 dark:text-gray-300 font-normal">
                  รวมภาระงาน
                </th>
                <th className="border border-gray-300 px-4 py-3 text-sm text-center text-gray-700 dark:text-gray-300 font-normal">
                  หมายเหตุ
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-zinc-900">
              {workloadData.slice(0, 5).map((task, index) => {
                const taskTotal = Object.values(task.subtasks).reduce((subSum, subtask) =>
                  subSum + subtask.form_infos.reduce((formSum, formInfo) =>
                    formSum + (formInfo.quality * formInfo.workload), 0
                  ), 0
                )

                const taskNames = [
                  '1. ภาระงานสอน',
                  '2. ภาระงานวิจัยและงานวิชาการอื่นที่ปรากฏเป็นผลงานวิชาการตามหลักเกณฑ์ที่ ก.พ.อ.กำหนด',
                  '3. ภาระงานบริการทางวิชาการ',
                  '4. ภาระงานทำนุบำรุงศิลปวัฒนธรรม',
                  '5. ภาระงานอื่น ๆ ที่สอดคล้องกับพันธกิจของคณะ มหาวิทยาลัย'
                ]

                return (
                  <tr key={task.task_id} className="hover:bg-gray-50 dark:hover:bg-zinc-800">
                    <td className="border border-gray-300 px-4 py-2 text-gray-800 font-light text-sm dark:text-gray-200">
                      {taskNames[index]}
                    </td>
                    <td className="border border-gray-300 px-4 py-2 text-center font-normal text-sm dark:text-green-400">
                      {taskTotal}
                    </td>
                    <td className="border border-gray-300 px-4 py-2 text-center text-gray-500 dark:text-gray-400">

                    </td>
                  </tr>
                )
              })}
              <tr className="bg-gray-100 dark:bg-gray-800 font-bold">
                <td className="border border-gray-300 px-4 py-2 text-end text-sm font-normal text-gray-700 dark:text-gray-300">
                  รวม
                </td>
                <td className="border border-gray-300 px-4 py-2 text-center font-normal text-sm">
                  {workloadData.slice(0, 5).reduce((sum, task) =>
                    sum + Object.values(task.subtasks).reduce((subSum, subtask) =>
                      subSum + subtask.form_infos.reduce((formSum, formInfo) =>
                        formSum + (formInfo.quality * formInfo.workload), 0
                      ), 0
                    ), 0
                  )}
                </td>
                <td className="border border-gray-300 px-4 py-2 text-center text-gray-500 dark:text-gray-400">

                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* <div className="rounded-md bg-green-50 dark:bg-green-900/20 p-6 border border-green-200 dark:border-green-700">
        <h4 className="text-lg font-semibold text-green-800 dark:text-green-200 mb-2">
          สรุปภาระงาน
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <span className="font-medium text-green-700 dark:text-green-300">กลุ่มภาระงานที่เลือก:</span>
            <span className="ml-2 text-green-600 dark:text-green-400">{selectedGroupName || 'ยังไม่ได้เลือก'}</span>
          </div>
          <div>
            <span className="font-medium text-green-700 dark:text-green-300">จำนวนรายการ:</span>
            <span className="ml-2 text-green-600 dark:text-green-400">
              {workloadData.reduce((sum, task) =>
                sum + Object.values(task.subtasks).reduce((subSum, subtask) =>
                  subSum + subtask.form_infos.length, 0
                ), 0
              )} รายการ
            </span>
          </div>
          <div>
            <span className="font-medium text-green-700 dark:text-green-300">รวมภาระงานทั้งหมด:</span>
            <span className="ml-2 text-green-600 dark:text-green-400">
              {workloadData.reduce((sum, task) =>
                sum + Object.values(task.subtasks).reduce((subSum, subtask) =>
                  subSum + subtask.form_infos.reduce((formSum, formInfo) =>
                    formSum + (formInfo.quality * formInfo.workload), 0
                  ), 0
                ), 0
              )} ชั่วโมง
            </span>
          </div>
        </div>
      </div> */}
    </div>
  )
}
