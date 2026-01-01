'use client'
import React, { useEffect, useState, useMemo } from 'react'
import type { Terms } from '@/Types'
import useAuthHeaders from '@/hooks/Header'
import { FileDown } from 'lucide-react'
import axios from 'axios'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { jwtDecode } from 'jwt-decode'
import { useSession } from 'next-auth/react'
import SetAssessorServices from '@/services/setAssessorServices'
import SnapshotService from '@/services/snapshotService'
import MainTaskServices from '@/services/mainTaskServices'
import SubTaskServices from '@/services/subTaskServices'
import WorkloadGroupServices from '@/services/workloadGroupServices'
import PerformanceService, { type PerformanceSnapshot } from '@/services/performanceService'
import type {
  Subtask,
  Task
} from './types'
import Section1 from './section_1'
import Section2 from './section_2'
import Section3 from './section_3'
import Section4 from './section_4'
import Section5 from './section_5'
import Section6 from './section_6'
import Section2CalModal from './_partial/section2CalModal'
import { handleExportPDFWithLinks } from './exportPDF'
import { handleExportPDFWithLinks as handleExportPDFEvaluatedWithLinks } from './exportPDFEvaluated'

interface WorkloadFormProps {
  selectedGroupName?: string
  terms?: Terms[]
  userId?: number
  roundId?: number
  isPreview?: boolean
  forceSnapshot?: boolean // เพิ่ม prop สำหรับบังคับให้ใช้ snapshot
}

// เพิ่มฟังก์ชันสำหรับตรวจสอบประเภทไฟล์
const isImageFile = (fileName: string | null | undefined): boolean => {
  if (!fileName) return false

  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp']
  const ext = fileName.substring(fileName.lastIndexOf('.')).toLowerCase()
  return imageExtensions.includes(ext)
}

export default function WorkloadForm({ selectedGroupName, terms = [], userId, roundId, isPreview = false, forceSnapshot = false }: WorkloadFormProps) {
  const [workloadData, setWorkloadData] = useState<Task[]>([])
  const [masterTasks, setMasterTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [exporting, setExporting] = useState(false)
  const [roundName, setRoundName] = useState<string>('')
  const [year, setYear] = useState<string>('')
  const [performanceSnapshot, setPerformanceSnapshot] = useState<PerformanceSnapshot | null>(null)
  const [expectedLevels, setExpectedLevels] = useState<any[]>([])
  const [competencies, setCompetencies] = useState<any[]>([])
  const [performanceEvaluations, setPerformanceEvaluations] = useState<any[]>([]) // สำหรับ preview
  const [isCompetencyModalOpen, setIsCompetencyModalOpen] = useState(false)
  const headers = useAuthHeaders()
  const { data: session } = useSession()

  // ตำแหน่งที่ใช้ในระบบ
  const POSITIONS = [
    { position_id: 1, position_name: 'อาจารย์', short_name: 'อ.' },
    { position_id: 2, position_name: 'ผู้ช่วยศาสตราจารย์', short_name: 'ผศ.' },
    { position_id: 3, position_name: 'รองศาสตราจารย์', short_name: 'รศ.' },
    { position_id: 4, position_name: 'ศาสตราจารย์', short_name: 'ศ.' },
  ]

  const decodedUser = useMemo(() => {
    if (!session?.accessToken) return null
    try {
      return jwtDecode<any>(session.accessToken)
    } catch (error) {
      console.warn('Failed to decode access token:', error)
      return null
    }
  }, [session?.accessToken])

  const userPositionName = useMemo(() => {
    if (!decodedUser) return '-'
    if (decodedUser.position_name) return decodedUser.position_name
    if (decodedUser.position_id) {
      const matchedPosition = POSITIONS.find(
        position => position.position_id === decodedUser.position_id
      )
      if (matchedPosition) {
        return matchedPosition.position_name
      }
    }
    return '-'
  }, [decodedUser])

  const userPositionId = decodedUser?.position_id ?? null

  const expectedLevelsByCompetency = useMemo(() => {
    const map = new Map<number, Map<number, number>>()

    expectedLevels.forEach((item: any) => {
      const competencyId = Number(item?.competency_id ?? item?.competencyId)
      const positionId = Number(item?.position_id ?? item?.positionId)
      const expectedLevel = Number(item?.expected_level ?? item?.expectedLevel)

      if (!Number.isFinite(competencyId) || !Number.isFinite(positionId) || !Number.isFinite(expectedLevel)) {
        return
      }

      if (!map.has(competencyId)) {
        map.set(competencyId, new Map<number, number>())
      }

      map.get(competencyId)!.set(positionId, expectedLevel)
    })

    return map
  }, [expectedLevels])

  const competencyScoreSummary = useMemo(() => {
    const rawSource = isPreview ? performanceEvaluations : performanceSnapshot?.evaluations ?? []
    const evaluations = Array.isArray(rawSource) ? rawSource : []

    const categories = [
      {
        id: 'gte',
        multiplier: 3,
        count: 0,
        score: 0,
      },
      {
        id: 'minus1',
        multiplier: 2,
        count: 0,
        score: 0,
      },
      {
        id: 'minus2',
        multiplier: 1,
        count: 0,
        score: 0,
      },
      {
        id: 'minus3',
        multiplier: 0,
        count: 0,
        score: 0,
      },
    ] as Array<{ id: string; multiplier: number; count: number; score: number }>

    evaluations.forEach((evaluation: any) => {
      const competencyId = Number(evaluation?.competency_id ?? evaluation?.competencyId)
      const demonstrated = Number(evaluation?.demonstrated_level ?? evaluation?.demonstratedLevel)

      if (!Number.isFinite(demonstrated)) {
        return
      }

      const fallbackExpected = evaluation?.expected_level ?? evaluation?.expectedLevel ?? evaluation?.expected
      let expected = Number(fallbackExpected)

      if (!Number.isFinite(expected)) {
        const byPosition = expectedLevelsByCompetency.get(competencyId)

        if (byPosition) {
          if (Number.isFinite(userPositionId) && userPositionId !== null && byPosition.has(userPositionId)) {
            expected = byPosition.get(userPositionId) ?? NaN
          } else {
            const iterator = byPosition.values()
            const first = iterator.next()
            if (!first.done) {
              expected = first.value
            }
          }
        }
      }

      if (!Number.isFinite(expected)) {
        return
      }

      const diff = demonstrated - expected

      let category = categories[3]
      if (diff >= 0) {
        category = categories[0]
      } else if (diff === -1) {
        category = categories[1]
      } else if (diff === -2) {
        category = categories[2]
      }

      category.count += 1
    })

    categories.forEach(category => {
      category.score = category.count * category.multiplier
    })

    const totalScore = categories.reduce((sum, category) => sum + category.score, 0)
    const totalCount = categories.reduce((sum, category) => sum + category.count, 0)

    return { rows: categories, totalScore, totalCount }
  }, [
    expectedLevelsByCompetency,
    isPreview,
    performanceEvaluations,
    performanceSnapshot,
    userPositionId,
  ])

  const competencyTotalScoreCalc = useMemo(() => {
    const raw = competencyScoreSummary?.totalScore ?? 0
    if (!Number.isFinite(raw)) {
      return 0
    }
    return raw / 30
  }, [competencyScoreSummary?.totalScore])

  const memoizedHeaders = useMemo(() => headers, [headers.Authorization])

  // ตรวจสอบ status ของ formlist
  const [formlistStatus, setFormlistStatus] = useState<number | null>(null)
  const [evaluatedCompetencyScoreSummary, setEvaluatedCompetencyScoreSummary] = useState<{ totalScore: number } | null>(null)

  // รวมผลสัมฤทธิ์ของงาน (นับเฉพาะ 5 งานแรก) และแปลงเป็นคะแนนเต็ม 70 (ค capped 70)
  // ใช้ quality * workload เสมอ (คะแนนที่คาดหวัง)
  const totalPerformanceWorkload = useMemo(() => {
    if (!Array.isArray(workloadData)) return 0
    return workloadData.slice(0, 5).reduce((sum, task) =>
      sum + Object.values(task.subtasks).reduce((subSum, subtask) =>
        subSum + subtask.form_infos.reduce((formSum, formInfo: any) => {
          // ใช้ quality * workload เสมอ (คะแนนที่คาดหวัง)
          return formSum + (formInfo.quality * formInfo.workload)
        }, 0), 0
      ), 0
    )
  }, [workloadData])

  const performanceScoreOutOf70 = useMemo(() => {
    const percent = Math.max(0, totalPerformanceWorkload)
    const score = (percent * 70) / 100
    return Math.min(70, score)
  }, [totalPerformanceWorkload])

  // โหลดโครงสร้างภาระงานหลัก/ย่อย เพื่อให้แสดงครบข้อแม้ไม่มีข้อมูล
  useEffect(() => {
    const loadMasterStructure = async () => {
      try {
        if (!session?.accessToken) return
        // ดึงภาระงานหลักทั้งหมด (หน้าแรกและ limit สูง ๆ เพื่อครอบคลุมทั้งหมด)
        const mainTasksRes: any = await MainTaskServices.getAllMainTasks(session.accessToken, {
          search: '',
          page: 1,
          limit: 100,
          sort: 'task_id',
          order: 'asc',
        } as any)

        const mainTasks = Array.isArray(mainTasksRes?.payload)
          ? mainTasksRes.payload
          : Array.isArray(mainTasksRes?.data)
            ? mainTasksRes.data
            : []

        const tasksWithSubtasks: Task[] = []

        for (const mt of mainTasks) {
          try {
            const subRes: any = await SubTaskServices.getSubTasksByTask(mt.task_id, session.accessToken)
            const subtasksArr = Array.isArray(subRes?.payload) ? subRes.payload : Array.isArray(subRes) ? subRes : []
            const subtasksMap: { [key: number]: Subtask } = {}
            for (const st of subtasksArr) {
              subtasksMap[st.subtask_id] = {
                subtask_id: st.subtask_id,
                subtask_name: st.subtask_name,
                form_infos: [],
              }
            }
            tasksWithSubtasks.push({
              task_id: mt.task_id,
              task_name: mt.task_name,
              quantity_workload_hours: (mt as any).quantity_workload_hours,
              subtasks: subtasksMap,
            })
          } catch (e) {
            // ถ้าดึง subtasks ไม่ได้ ให้ใส่ task เปล่า
            tasksWithSubtasks.push({
              task_id: mt.task_id,
              task_name: mt.task_name,
              subtasks: {},
            } as Task)
          }
        }

        setMasterTasks(tasksWithSubtasks)
      } catch (e) {
        // เงียบไว้หากไม่จำเป็น
      }
    }

    loadMasterStructure()
  }, [session?.accessToken])

  // รวมข้อมูลผู้ใช้กับโครงสร้างมาสเตอร์เพื่อให้แสดงครบข้อ
  const mergedTasks: Task[] = useMemo(() => {
    if (Array.isArray(workloadData) && workloadData.length > 0) {
      // ผสานกับ master เพื่อเติม task/subtask ที่ขาด
      if (!Array.isArray(masterTasks) || masterTasks.length === 0) return workloadData
      const result: Task[] = []
      const userTaskMap = new Map<number, Task>()
      for (const t of workloadData) userTaskMap.set(t.task_id, t)

      for (const mt of masterTasks) {
        const userTask = userTaskMap.get(mt.task_id)
        if (!userTask) {
          result.push(mt)
          continue
        }
        // ผสาน subtasks
        const mergedSubtasks: { [key: number]: Subtask } = { ...userTask.subtasks }
        for (const [sid, s] of Object.entries(mt.subtasks)) {
          const sidNum = Number(sid)
          if (!mergedSubtasks[sidNum]) {
            mergedSubtasks[sidNum] = { ...s, form_infos: [] }
          }
        }
        result.push({ ...userTask, subtasks: mergedSubtasks })
      }
      return result
    }
    // ถ้าไม่มีข้อมูลผู้ใช้ ให้ใช้ master ทั้งหมด
    return masterTasks
  }, [workloadData, masterTasks])

  // ฟังก์ชันดึงข้อมูลภาระงาน
  const fetchWorkloadData = async () => {
    if (!userId || !roundId) return

    try {
      setLoading(true)

      // ถ้า forceSnapshot = true ให้ใช้ snapshot เสมอ
      if (forceSnapshot) {
        const forceFormlistResponse = await SnapshotService.getFormlistId(
          userId,
          roundId
        )

        if (forceFormlistResponse.success && forceFormlistResponse.payload && forceFormlistResponse.payload.length > 0) {
          const formlist_id = forceFormlistResponse.payload[0].formlist_id
          try {
            const snapshotResponse = await SnapshotService.getFormInfoWithSnapshot(
              formlist_id,
              1, // subtask_id
              userId,
              roundId
            )

            if (snapshotResponse.success && snapshotResponse.payload && Array.isArray(snapshotResponse.payload) && snapshotResponse.payload.length > 0) {
              // จัดกลุ่มข้อมูลตาม task_id และ subtask_id
              const taskMap = new Map();

              snapshotResponse.payload.forEach((item) => {
                const taskId = item.task_id || 1;
                const subtaskId = item.subtask_id || 1;

                if (!taskMap.has(taskId)) {
                  taskMap.set(taskId, {
                    task_id: taskId,
                    task_name: item.task_name || "ภาระงานสอน",
                    workload_group_id: item.workload_group_id,
                    workload_group_name: item.workload_group_name,
                    quantity_workload_hours: item.quantity_workload_hours,
                    subtasks: new Map()
                  });
                }

                const task = taskMap.get(taskId);

                if (!task.subtasks.has(subtaskId)) {
                  task.subtasks.set(subtaskId, {
                    subtask_id: subtaskId,
                    subtask_name: item.subtask_name || "ภาระงานเกณฑ์การคิดภาระงานสอนชั่วโมงทฤษฎี",
                    form_infos: []
                  });
                }

                const subtask = task.subtasks.get(subtaskId);
                // แปลงข้อมูล files และ links รองรับทั้งแบบ array และแบบ string (GROUP_CONCAT)
                const files = Array.isArray(item.files)
                  ? item.files.map((f: any) => ({ file_name: (f.file_name || '').trim() }))
                  : (typeof item.files === 'string' && item.files.length > 0
                    ? (item.files as string).split(', ').map((f: string) => ({ file_name: f.trim() }))
                    : [])
                const links = Array.isArray(item.links)
                  ? item.links.map((l: any) => ({ link_name: l.link_name || '', link_path: l.link_path || '' }))
                  : (typeof item.links === 'string' && item.links.length > 0
                    ? (item.links as string).split(', ').map((l: string) => {
                      const parts = l.split('|')
                      return {
                        link_name: parts[0] || '',
                        link_path: parts[1] || parts[0] || ''
                      }
                    })
                    : [])

                subtask.form_infos.push({
                  form_id: item.form_id,
                  form_title: item.form_title,
                  description: item.description,
                  workload: item.workload,
                  quality: item.quality,
                  file_type: item.file_type,
                  ex_score: item.ex_score,
                  files: files,
                  links: links,
                  evaluation_score: item.evaluation_score != null ? Number(item.evaluation_score) : null
                });
              });

              // แปลง Map เป็น Array
              const convertedData: Task[] = Array.from(taskMap.values()).map(task => ({
                ...task,
                subtasks: Object.fromEntries(task.subtasks)
              }));

              setWorkloadData(convertedData)
              return
            } else {
              throw new Error('Snapshot data is empty')
            }
          } catch (snapshotError: any) {
            console.error('Error fetching snapshot data (Force):', snapshotError)

            // ถ้า snapshot error ให้ใช้ API ปกติ
            try {
              const response = await axios.get(
                `${process.env.NEXT_PUBLIC_API}/workload_form/items/${userId}/${roundId}`,
                { headers: memoizedHeaders }
              )

              if (response.data.success && response.data.payload) {
                setWorkloadData(response.data.payload)
                return
              } else {
                console.error('Regular API response is not successful:', response.data)
                // ให้ fall through ไปใช้ logic ถัดไป
              }
            } catch (fallbackError) {
              console.error('Fallback API also failed:', fallbackError)
              // ให้ fall through ไปใช้ logic ถัดไป
            }
          }
        } else {
          console.warn('No formlist_id found for force snapshot mode, will use regular flow')
          // ให้ fall through ไปใช้ logic ถัดไป
        }
      }

      // ดึง formlist_id ก่อน
      const formlistResponse = await SnapshotService.getFormlistId(
        userId,
        roundId
      )

      if (!formlistResponse.success || !formlistResponse.payload) {
        console.log('No formlist found, using regular API')
        // ถ้าไม่มี formlist ให้ใช้ API ปกติ
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API}/workload_form/items/${userId}/${roundId}`,
          { headers: memoizedHeaders }
        )

        if (response.data.success && response.data.payload) {
          console.log('API Response:', response.data.payload)
          console.log('Number of tasks:', response.data.payload.length)
          setWorkloadData(response.data.payload)
        }
        return
      }

      const formlist_id = formlistResponse.payload[0].formlist_id
      const status = formlistResponse.payload[0].status
      setFormlistStatus(status) // ตั้งค่า formlistStatus

      // ถ้า status = 1 (ส่งแล้ว) หรือ status = 2 (finalized) ให้ดึงข้อมูลจาก snapshot
      if (status === 1 || status === 2) {
        console.log('Form submitted, fetching from snapshot')
        try {
          const snapshotResponse = await SnapshotService.getFormInfoWithSnapshot(
            formlist_id,
            1, // subtask_id - อาจต้องปรับตามความต้องการ
            userId,
            roundId
          )

          if (snapshotResponse.success && snapshotResponse.payload) {
            console.log('Snapshot Response:', snapshotResponse.payload)
            console.log('Formlist Status:', status)
            // ตรวจสอบ evaluation_score ในข้อมูล
            if (status === 2) {
              const hasEvaluationScores = snapshotResponse.payload.some((item: any) => item.evaluation_score != null)
              console.log('Has evaluation scores:', hasEvaluationScores)
              if (hasEvaluationScores) {
                console.log('Sample evaluation scores:', snapshotResponse.payload
                  .filter((item: any) => item.evaluation_score != null)
                  .slice(0, 3)
                  .map((item: any) => ({ snapshot_form_id: item.snapshot_form_id, evaluation_score: item.evaluation_score }))
                )
              }
            }

            // จัดกลุ่มข้อมูลตาม task_id และ subtask_id
            const taskMap = new Map();

            snapshotResponse.payload.forEach((item: any) => {
              const taskId = item.task_id || 1;
              const subtaskId = item.subtask_id || 1;

              // Debug: ตรวจสอบ evaluation_score
              if (status === 2 && item.evaluation_score != null) {
                console.log(`Item ${item.snapshot_form_id || item.form_id}: evaluation_score = ${item.evaluation_score}`);
              }

              if (!taskMap.has(taskId)) {
                taskMap.set(taskId, {
                  task_id: taskId,
                  task_name: item.task_name || "ภาระงานสอน",
                  workload_group_id: item.workload_group_id,
                  workload_group_name: item.workload_group_name,
                  quantity_workload_hours: item.quantity_workload_hours,
                  subtasks: new Map()
                });
              }

              const task = taskMap.get(taskId);

              if (!task.subtasks.has(subtaskId)) {
                task.subtasks.set(subtaskId, {
                  subtask_id: subtaskId,
                  subtask_name: item.subtask_name || "ภาระงานเกณฑ์การคิดภาระงานสอนชั่วโมงทฤษฎี",
                  form_infos: []
                });
              }

              const subtask = task.subtasks.get(subtaskId);
              // แปลงข้อมูล files และ links รองรับทั้งแบบ array และแบบ string (GROUP_CONCAT)
              const files = Array.isArray(item.files)
                ? item.files.map((f: any) => ({ file_name: (f.file_name || '').trim() }))
                : (typeof item.files === 'string' && item.files.length > 0
                  ? (item.files as string).split(', ').map((f: string) => ({ file_name: f.trim() }))
                  : [])
              const links = Array.isArray(item.links)
                ? item.links.map((l: any) => ({ link_name: l.link_name || '', link_path: l.link_path || '' }))
                : (typeof item.links === 'string' && item.links.length > 0
                  ? (item.links as string).split(', ').map((l: string) => {
                    const parts = l.split('|')
                    return {
                      link_name: parts[0] || '',
                      link_path: parts[1] || parts[0] || ''
                    }
                  })
                  : [])

              subtask.form_infos.push({
                form_id: item.form_id,
                form_title: item.form_title,
                description: item.description,
                workload: item.workload,
                quality: item.quality,
                file_type: item.file_type,
                ex_score: item.ex_score,
                files: files,
                links: links,
                evaluation_score: item.evaluation_score != null ? Number(item.evaluation_score) : null
              });
            });

            // แปลง Map เป็น Array
            const convertedData: Task[] = Array.from(taskMap.values()).map(task => ({
              ...task,
              subtasks: Object.fromEntries(task.subtasks)
            }));

            setWorkloadData(convertedData)
          }
        } catch (snapshotError) {
          console.error('Error fetching snapshot data:', snapshotError)
          // ถ้า snapshot error ให้ใช้ API ปกติ
          try {
            const response = await axios.get(
              `${process.env.NEXT_PUBLIC_API}/workload_form/items/${userId}/${roundId}`,
              { headers: memoizedHeaders }
            )

            if (response.data.success && response.data.payload) {
              console.log('Fallback to regular API:', response.data.payload)
              setWorkloadData(response.data.payload)
            }
          } catch (fallbackError) {
            console.error('Fallback API also failed:', fallbackError)
            // Use mock data as last resort
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
          }
        }
      } else {
        // ถ้า status = 0 (ยังไม่ส่ง) ให้ใช้ API ปกติ
        console.log('Form not submitted, fetching from regular API')
        try {
          const response = await axios.get(
            `${process.env.NEXT_PUBLIC_API}/workload_form/items/${userId}/${roundId}`,
            { headers: memoizedHeaders }
          )

          if (response.data.success && response.data.payload) {
            console.log('API Response:', response.data.payload)
            console.log('Number of tasks:', response.data.payload.length)
            setWorkloadData(response.data.payload)
          }
        } catch (regularApiError) {
          console.error('Error fetching regular API:', regularApiError)
          // ใช้ mock data เป็น fallback
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
        }
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



  useEffect(() => {
    fetchWorkloadData()
  }, [userId, roundId, memoizedHeaders])

  // ดึงข้อมูล snapshot ของ performance evaluation
  useEffect(() => {
    const fetchPerformanceSnapshot = async () => {
      if (!userId || !roundId || !session?.accessToken) return

      try {
        // ดึงข้อมูล expected levels และ competencies เสมอ
        try {
          const [competenciesRes, expectedLevelsRes] = await Promise.all([
            PerformanceService.getAllCompetencies(session.accessToken),
            PerformanceService.getAllExpectedLevels(session.accessToken)
          ])

          if (competenciesRes.success && competenciesRes.payload) {
            const comps = Array.isArray(competenciesRes.payload)
              ? competenciesRes.payload
              : [competenciesRes.payload]
            setCompetencies(comps)
          }

          if (expectedLevelsRes.success && expectedLevelsRes.payload) {
            const levels = Array.isArray(expectedLevelsRes.payload)
              ? expectedLevelsRes.payload
              : [expectedLevelsRes.payload]
            setExpectedLevels(levels)
          }
        } catch (error) {
          console.error('Error fetching competencies or expected levels:', error)
        }

        // ดึง formlist_id ก่อน
        const formlistResponse = await SnapshotService.getFormlistId(
          userId,
          roundId
        )

        if (formlistResponse.success && formlistResponse.payload && formlistResponse.payload.length > 0) {
          const formlist_id = formlistResponse.payload[0].formlist_id
          const status = formlistResponse.payload[0].status
          setFormlistStatus(status) // ตั้งค่า formlistStatus

          // ถ้า status = 1 (ส่งแล้ว) หรือ status = 2 (finalized) หรือ forceSnapshot = true ให้ดึงข้อมูลจาก snapshot
          if (status === 1 || status === 2 || forceSnapshot === true) {
            const snapshotResponse = await PerformanceService.getPerformanceSnapshot(
              formlist_id,
              userId,
              roundId,
              session.accessToken
            )

            if (snapshotResponse.success && snapshotResponse.payload) {
              // ตรวจสอบว่า payload ไม่ใช่ array
              const payload = snapshotResponse.payload
              if (payload && typeof payload === 'object' && !Array.isArray(payload)) {
                const snapshot = payload as PerformanceSnapshot
                setPerformanceSnapshot(snapshot)
              } else {
                console.log('Payload is not valid object, setting to null')
                setPerformanceSnapshot(null)
              }
            } else {
              console.log('Snapshot response not successful or no payload')
              setPerformanceSnapshot(null)
            }
          } else {
            setPerformanceSnapshot(null)
          }
        }
      } catch (error) {
        console.error('Error fetching performance snapshot:', error)
        setPerformanceSnapshot(null)
      }
    }

    fetchPerformanceSnapshot()
  }, [userId, roundId, session?.accessToken, forceSnapshot])

  // ดึงข้อมูล performance evaluation สำหรับ preview (ไม่ใช่ snapshot)
  useEffect(() => {
    const fetchPerformanceEvaluation = async () => {
      if (!userId || !roundId || !session?.accessToken || !isPreview) return

      try {
        // ดึง formlist_id ก่อน
        const formlistResponse = await SnapshotService.getFormlistId(
          userId,
          roundId
        )

        if (formlistResponse.success && formlistResponse.payload && formlistResponse.payload.length > 0) {
          const formlist_id = formlistResponse.payload[0].formlist_id

          // ดึงข้อมูล performance evaluation (ไม่ใช่ snapshot)
          const [formResponse, evaluationsResponse, competenciesRes, expectedLevelsRes] = await Promise.all([
            PerformanceService.getPerformanceEvaluationForm(
              formlist_id,
              userId,
              session.accessToken
            ),
            PerformanceService.getPerformanceEvaluation(formlist_id, session.accessToken),
            PerformanceService.getAllCompetencies(session.accessToken),
            PerformanceService.getAllExpectedLevels(session.accessToken)
          ])

          // เก็บข้อมูล evaluations
          if (evaluationsResponse.success && evaluationsResponse.payload) {
            const evals = Array.isArray(evaluationsResponse.payload)
              ? evaluationsResponse.payload
              : [evaluationsResponse.payload]
            setPerformanceEvaluations(evals)
          }

          // เก็บข้อมูล competencies และ expected levels
          if (competenciesRes.success && competenciesRes.payload) {
            const comps = Array.isArray(competenciesRes.payload)
              ? competenciesRes.payload
              : [competenciesRes.payload]
            setCompetencies(comps)
          }

          if (expectedLevelsRes.success && expectedLevelsRes.payload) {
            const levels = Array.isArray(expectedLevelsRes.payload)
              ? expectedLevelsRes.payload
              : [expectedLevelsRes.payload]
            setExpectedLevels(levels)
          }
        }
      } catch (error) {
        console.error('Error fetching performance evaluation for preview:', error)
      }
    }
    fetchPerformanceEvaluation()
  }, [userId, roundId, session?.accessToken, isPreview])

  useEffect(() => {
    const fetchPerformanceEvaluationForForm = async () => {
      if (!userId || !roundId || !session?.accessToken || isPreview || forceSnapshot) return

      try {
        // ดึง formlist_id ก่อน
        const formlistResponse = await SnapshotService.getFormlistId(
          userId,
          roundId
        )

        // ถ้ายังไม่มี formlist หรือ status = 0 ให้ดึงข้อมูลจากตารางปกติ
        if (!formlistResponse.success || !formlistResponse.payload || formlistResponse.payload.length === 0) {
          // ถ้าไม่มี formlist ให้ดึงเฉพาะ competencies และ expected levels
          try {
            const [competenciesRes, expectedLevelsRes] = await Promise.all([
              PerformanceService.getAllCompetencies(session.accessToken),
              PerformanceService.getAllExpectedLevels(session.accessToken)
            ])

            if (competenciesRes.success && competenciesRes.payload) {
              const comps = Array.isArray(competenciesRes.payload)
                ? competenciesRes.payload
                : [competenciesRes.payload]
              setCompetencies(comps)
            }

            if (expectedLevelsRes.success && expectedLevelsRes.payload) {
              const levels = Array.isArray(expectedLevelsRes.payload)
                ? expectedLevelsRes.payload
                : [expectedLevelsRes.payload]
              setExpectedLevels(levels)
            }
          } catch (error) {
            console.error('Error fetching competencies or expected levels:', error)
          }
          return
        }

        const formlist_id = formlistResponse.payload[0].formlist_id
        const status = formlistResponse.payload[0].status
        setFormlistStatus(status) // ตั้งค่า formlistStatus

        // ถ้ายังไม่ส่งฟอร์ม (status = 0) ให้ดึงข้อมูลจากตารางปกติ
        if (status === 0) {
          // ดึงข้อมูล performance evaluation (ไม่ใช่ snapshot)
          const [formResponse, evaluationsResponse] = await Promise.all([
            PerformanceService.getPerformanceEvaluationForm(
              formlist_id,
              userId,
              session.accessToken
            ),
            PerformanceService.getPerformanceEvaluation(formlist_id, session.accessToken)
          ])

          // เก็บข้อมูล evaluations
          if (evaluationsResponse.success && evaluationsResponse.payload) {
            const evals = Array.isArray(evaluationsResponse.payload)
              ? evaluationsResponse.payload
              : [evaluationsResponse.payload]
            setPerformanceEvaluations(evals)
          }
        }
      } catch (error) {
        console.error('Error fetching performance evaluation for form:', error)
      }
    }

    fetchPerformanceEvaluationForForm()
  }, [userId, roundId, session?.accessToken, isPreview, forceSnapshot])

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

  const handleExportPDFWithLinksWrapper = async () => {
    await handleExportPDFWithLinks({
      onExportStart: () => setExporting(true),
      onExportEnd: () => setExporting(false),
      year,
      session,
      roundId,
      mergedTasks,
      workloadData,
      selectedGroupName,
      roundName,
      terms,
      performanceSnapshot,
      performanceScoreOutOf70,
      userId
    })
  }

  // คำนวณ totalPerformanceWorkload สำหรับ evaluated version (ใช้ evaluation_score เท่านั้น)
  const totalPerformanceWorkloadEvaluated = useMemo(() => {
    if (!Array.isArray(workloadData)) return 0
    return workloadData.slice(0, 5).reduce((sum, task) =>
      sum + Object.values(task.subtasks).reduce((subSum, subtask) =>
        subSum + subtask.form_infos.reduce((formSum, formInfo: any) => {
          // ใช้ evaluation_score เท่านั้น ถ้าไม่มีให้เป็น 0
          if (formInfo.evaluation_score != null) {
            return formSum + Number(formInfo.evaluation_score)
          }
          return formSum
        }, 0), 0
      ), 0
    )
  }, [workloadData])

  // คำนวณ performanceScoreOutOf70 สำหรับ evaluated version
  const performanceScoreOutOf70Evaluated = useMemo(() => {
    const percent = Math.max(0, totalPerformanceWorkloadEvaluated)
    const score = (percent * 70) / 100
    return Math.min(70, score)
  }, [totalPerformanceWorkloadEvaluated])

  const handleExportPDFEvaluatedWrapper = async () => {
    await handleExportPDFEvaluatedWithLinks({
      onExportStart: () => setExporting(true),
      onExportEnd: () => setExporting(false),
      year,
      session,
      roundId,
      mergedTasks,
      workloadData,
      selectedGroupName,
      roundName,
      terms,
      performanceSnapshot,
      performanceScoreOutOf70: performanceScoreOutOf70Evaluated,
      userId
    })
  }

  const isFinalized = formlistStatus === 2

  return (
    <>
      <div id="workload-content" className="space-y-4">
        <div className="flex flex-col gap-10 rounded-md p-4 bg-white dark:bg-zinc-900">
          <div className="flex justify-end gap-3 mb-4">
          {isFinalized && (
              <button
                id="export-pdf-btn-evaluation"
                onClick={handleExportPDFEvaluatedWrapper}
                disabled={exporting || !Array.isArray(workloadData) || workloadData.length === 0}
                className="inline-flex h-10 items-center px-4 py-2 bg-white text-red-500 border border-red-500 rounded-lg hover:text-white hover:bg-red-600 transition-colors duration-200"
                title="Export PDF พร้อม clickable links (คะแนนจากผู้ตรวจ)"
              >
                <FileDown className="mr-2 h-4 w-4" />
                คะแนนจากผู้ตรวจ
              </button>
            )}
            <button
              id="export-pdf-btn"
              onClick={handleExportPDFWithLinksWrapper}
              disabled={exporting || !Array.isArray(workloadData) || workloadData.length === 0}
              className="inline-flex h-10 items-center px-4 py-2 bg-red-500 text-white rounded-lg hover:text-white hover:bg-red-600 transition-colors duration-200"
              title="Export PDF พร้อม clickable links"
            >
              <FileDown className="mr-2 h-4 w-4" />
              ผลการประเมินภาระงาน
            </button>
          </div>

          <Section1
            mergedTasks={mergedTasks}
            terms={terms}
            selectedGroupName={selectedGroupName}
            totalPerformanceWorkload={totalPerformanceWorkload}
            performanceScoreOutOf70={performanceScoreOutOf70}
            performanceScoreOutOf70Evaluated={performanceScoreOutOf70Evaluated}
            isImageFile={isImageFile}
            formlistStatus={formlistStatus}
          />

          <Section2
            isPreview={isPreview}
            competencies={competencies}
            expectedLevels={expectedLevels}
            performanceEvaluations={performanceEvaluations}
            performanceSnapshot={performanceSnapshot}
            userPositionName={userPositionName}
            userPositionId={userPositionId}
            positions={POSITIONS}
            competencyScoreSummary={competencyScoreSummary}
            competencyTotalScoreCalc={competencyTotalScoreCalc}
            onOpenCompetencyModal={() => setIsCompetencyModalOpen(true)}
            formlistStatus={formlistStatus}
            userId={userId}
            roundId={roundId}
            onEvaluatedCompetencyScoreSummaryChange={(summary) => {
              setEvaluatedCompetencyScoreSummary(summary)
            }}
          />

          <Section3
            performanceScoreOutOf70={performanceScoreOutOf70}
            performanceScoreOutOf30={competencyScoreSummary.totalScore}
            formlistStatus={formlistStatus}
            performanceScoreOutOf70Evaluated={formlistStatus === 2 ? performanceScoreOutOf70Evaluated : null}
            performanceScoreOutOf30Evaluated={formlistStatus === 2 && evaluatedCompetencyScoreSummary ? evaluatedCompetencyScoreSummary.totalScore : null}
            userName={decodedUser ? `${decodedUser.prefix_name || ''} ${decodedUser.u_fname || ''} ${decodedUser.u_lname || ''}`.trim() || null : null}
            evaluatorName={null}
          />

          <Section4
            userName={decodedUser ? `${decodedUser.prefix_name || ''} ${decodedUser.u_fname || ''} ${decodedUser.u_lname || ''}`.trim() || null : null}
            evaluatorName={null}
          />
          <Section5/>
          <Section6/>
        </div>
      </div>
      <Section2CalModal
        isOpen={isCompetencyModalOpen}
        onClose={() => setIsCompetencyModalOpen(false)}
        title="วิธีคำนวณ"
      >
        <div className="flex flex-col items-center text-center text-base font-light">
          <p>ผลรวมคะแนน</p>
          <div className="my-3 h-px w-2/3 mx-auto bg-gray-300" />
          <p>จำนวนสมรรถนะที่ใช้ในการประเมิน x 3</p>
        </div>
      </Section2CalModal>
    </>
  )
}
