'use client'
import React, { useEffect, useState, useMemo } from 'react'
import type { Terms } from '@/Types'
import useAuthHeaders from '@/hooks/Header'
import { LinkIcon, FileText, ImageIcon, FileDown } from 'lucide-react'
import axios from 'axios'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

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
  const headers = useAuthHeaders()
  
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
       doc.setFont('THSarabunNew', 'normal')
       doc.text('ข้อตกลงและแบบประเมินผลการปฏิบัติงานของบุคลากรสายวิชาการ', doc.internal.pageSize.getWidth() / 2, 10, { align: 'center' })
       doc.text('มหาวิทยาลัยเทคโนโลยีราชมงคลล้านนา', doc.internal.pageSize.getWidth() / 2, 17, { align: 'center' })
      
      doc.setFontSize(14)
      doc.text('ข้อมูลรอบการประเมิน', 14, 22)
      doc.setFontSize(14)
      doc.text(`รอบการประเมิน: ${roundId || '-'}`, 14, 29)
      doc.text(`กลุ่มภาระงาน: ${selectedGroupName || 'ยังไม่ได้เลือก'}`, 14, 35)
      
      if (terms && terms.length > 0) {
        doc.setFontSize(14)
        doc.text('เกณฑ์การประเมินภาระงาน', 14, 42)
        
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
          startY: 49,
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
          { content: 'รวมภาระงาน', styles: { halign: 'right', font: 'THSarabunNew', fontSize: 14, textColor: [0,0,0], fillColor: [255,255,255] } },
          { 
            content: taskTotal.toString(), 
            styles: { 
              halign: 'center', 
              font: 'THSarabunNew', 
              fontSize: 14, 
              textColor: isBelowRequired ? [255,0,0] : [0,0,0], 
              fillColor: [255,255,255] 
            } 
          },
          ''
        ])
        rowLinks.push(null)
      })
      
      console.log('Table data length:', tableData.length)
      console.log('Row links length:', rowLinks.length)
      console.log('Sample table data:', tableData.slice(0, 3))
      
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
      const startY = terms && terms.length > 0 ? (doc as any).lastAutoTable.finalY + 10 : 25
      
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
          // Debug: Log cell drawing info
          if (data.cell.section === 'body' && data.column.index === 0) {
            console.log(`Row ${data.row.index}: ${data.cell.raw}`)
          }
          
          // ไม่มีการซ่อนเส้น - ให้แถวสรุปเป็นช่องตารางปกติ
          
          // Add clickable links to evidence column (column index 1)
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
      const finalY = (doc as any).lastAutoTable.finalY + 10
      
      doc.setTextColor(0, 0, 0)
      doc.setFontSize(14)
      doc.setFont('THSarabunNew', 'normal')
      doc.text('สรุปภาระงาน', 14, finalY)
      
      doc.setFontSize(14)
      doc.setFont('THSarabunNew', 'normal')
      const summaryY = finalY + 8
      doc.text(`กลุ่มภาระงานที่เลือก: ${selectedGroupName || 'ยังไม่ได้เลือก'}`, 14, summaryY)
      doc.text(`จำนวนรายการ: ${totalItems} รายการ`, 100, summaryY)
      doc.text(`รวมภาระงานทั้งหมด: ${totalWorkload} ชั่วโมง`, 180, summaryY)
      
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
    <div id="workload-content" className="space-y-2">
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
                        
                          {subtask.form_infos.map((formInfo , index) => (
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
                       <td className={`border border-gray-300 px-4 py-2 text-center font-normal dark:text-blue-200 text-sm ${
                          task.quantity_workload_hours && 
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

      <div className="rounded-md bg-green-50 dark:bg-green-900/20 p-6 border border-green-200 dark:border-green-700">
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
      </div>
    </div>
  )
}
