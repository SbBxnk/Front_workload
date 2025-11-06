'use client'
import React, { useEffect, useState, useMemo } from 'react'
import type { Terms } from '@/Types'
import useAuthHeaders from '@/hooks/Header'
import { LinkIcon, FileText, ImageIcon, FileDown, AlertCircle } from 'lucide-react'
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
  const headers = useAuthHeaders()
  const { data: session } = useSession()

  // ตำแหน่งที่ใช้ในระบบ
  const POSITIONS = [
    { position_id: 1, position_name: 'อาจารย์', short_name: 'อ.' },
    { position_id: 2, position_name: 'ผู้ช่วยศาสตราจารย์', short_name: 'ผศ.' },
    { position_id: 3, position_name: 'รองศาสตราจารย์', short_name: 'รศ.' },
    { position_id: 4, position_name: 'ศาสตราจารย์', short_name: 'ศ.' },
  ]

  const memoizedHeaders = useMemo(() => headers, [headers.Authorization])

  // รวมผลสัมฤทธิ์ของงาน (นับเฉพาะ 5 งานแรก) และแปลงเป็นคะแนนเต็ม 70 (ค capped 70)
  const totalPerformanceWorkload = useMemo(() => {
    if (!Array.isArray(workloadData)) return 0
    return workloadData.slice(0, 5).reduce((sum, task) =>
      sum + Object.values(task.subtasks).reduce((subSum, subtask) =>
        subSum + subtask.form_infos.reduce((formSum, formInfo) =>
          formSum + (formInfo.quality * formInfo.workload), 0
        ), 0
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
                  links: links
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

      // ถ้า status = 1 (ส่งแล้ว) ให้ดึงข้อมูลจาก snapshot
      if (status === 1) {
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
                links: links
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

          // ถ้า status = 1 (ส่งแล้ว) หรือ forceSnapshot = true ให้ดึงข้อมูลจาก snapshot
          if (status === 1 || forceSnapshot === true) {
            const snapshotResponse = await PerformanceService.getPerformanceSnapshot(
              formlist_id,
              userId,
              roundId,
              session.accessToken
            )

            if (snapshotResponse.success && snapshotResponse.payload) {
              // ตรวจสอบว่า payload ไม่ใช่ array
              const payload = snapshotResponse.payload
              console.log('Performance snapshot payload:', payload)
              if (payload && typeof payload === 'object' && !Array.isArray(payload)) {
                const snapshot = payload as PerformanceSnapshot
                console.log('Setting performance snapshot:', snapshot)
                console.log('Evaluations count:', snapshot.evaluations?.length || 0)
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

  // ดึงข้อมูล performance evaluation สำหรับกรณีที่ยังไม่ส่งฟอร์ม (ไม่ใช่ preview และไม่ใช่ snapshot)
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
      doc.setFont('THSarabunNew', 'bold')

      // วาด Header จะทำหลังจากสร้างเอกสารทั้งหมด (ใส่ทุกหน้า)

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

      // ดึงข้อมูล workload_group_name จาก API
      let actualWorkloadGroupName: string | null = null
      try {
        // ลองดึงจาก mergedTasks ก่อน (ถ้ามีข้อมูลแล้ว)
        if (Array.isArray(mergedTasks) && mergedTasks.length > 0) {
          const firstTaskWithGroup = mergedTasks.find(task => task.workload_group_name)
          if (firstTaskWithGroup?.workload_group_name) {
            actualWorkloadGroupName = firstTaskWithGroup.workload_group_name
          }
        }

        // ถ้ายังไม่มี ลองดึงจาก workloadData
        if (!actualWorkloadGroupName && Array.isArray(workloadData) && workloadData.length > 0) {
          const firstTaskWithGroup = workloadData.find(task => task.workload_group_name)
          if (firstTaskWithGroup?.workload_group_name) {
            actualWorkloadGroupName = firstTaskWithGroup.workload_group_name
          }
        }

        // ถ้ายังไม่มี ให้ดึงจาก API
        if (!actualWorkloadGroupName && userId && roundId && session?.accessToken) {
          try {
            const assessorListResponse = await SetAssessorServices.getSetAssessorListByRound(
              roundId,
              session.accessToken,
              {}
            )

            if (assessorListResponse.success && assessorListResponse.payload) {
              const assessorList = Array.isArray(assessorListResponse.payload)
                ? assessorListResponse.payload
                : [assessorListResponse.payload]

              const userAssessor = assessorList.find((item: any) => item.as_u_id === userId)
              if (userAssessor?.workload_group_name) {
                actualWorkloadGroupName = userAssessor.workload_group_name
              }
            }
          } catch (apiError) {
            console.error('Error fetching workload group from API:', apiError)
          }
        }

        // ถ้ายังไม่มี ให้ใช้ selectedGroupName prop
        if (!actualWorkloadGroupName && selectedGroupName) {
          actualWorkloadGroupName = selectedGroupName
        }
      } catch (error) {
        console.error('Error getting workload group name:', error)
      }

      // ดึงข้อมูลกลุ่มภาระงานทั้งหมดจาก API
      let allGroups: string[] = []
      try {
        if (session?.accessToken) {
          const groupsResponse = await WorkloadGroupServices.getAllWorkloadGroups(session.accessToken, {
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

      // ใช้ mergedTasks ให้ตรงกับ UI และรวมรายการว่างด้วย
      if (Array.isArray(mergedTasks)) {
        mergedTasks.forEach((task) => {
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
              // แถว placeholder เมื่อไม่มีข้อมูล: แสดงเฉพาะเลขข้อย่อย และปล่อยช่องว่าง พร้อมเพิ่มความสูงแถว
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
                // แสดงหลักฐานเป็นรายการ 1. 2. 3. แต่ละบรรทัด
                evidenceText = formInfo.files.map((f, i) => `${i + 1}. ${f.file_name}`).join('\n')
                evidenceLinks = formInfo.files.map(f => `${baseUrl}/files/${f.file_name}`)
              } else if (formInfo.links && formInfo.links.length > 0) {
                // แสดงหลักฐานเป็นรายการ 1. 2. 3. แต่ละบรรทัด
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
            })
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

      if (terms && terms.length > 0) {
        doc.setFontSize(14)
        currentY += 10
        doc.text('เกณฑ์การประเมินภาระงาน', 14, currentY)
        currentY += 10

        const uniqueTasks = [...new Set(terms.map((term) => term?.task_name || 'Unknown Task'))]
        const uniqueGroups = selectedGroupName
          ? [selectedGroupName]
          : [...new Set(terms.map((term) => term?.workload_group_name || 'Unknown Group'))]


        const criteriaTableData: any[] = []

        criteriaTableData.push(['ภาระงาน', ...uniqueGroups.map(group => group)])

        uniqueTasks.forEach((taskName) => {
          const row = [taskName]
          uniqueGroups.forEach((groupName) => {
            const item = terms.find(
              (term) => term?.task_name === taskName && term?.workload_group_name === groupName
            )
            row.push(item ? item.quantity_workload_hours.toString() : '0')
          })
          criteriaTableData.push(row)
        })

        const totalRow = ['ผลรวม (ไม่น้อยกว่า)']
        uniqueGroups.forEach((groupName) => {
          const total = uniqueTasks.reduce((sum, taskName) => {
            const item = terms.find(
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

      // ส่วนซ้ำด้านล่าง: ใช้ mergedTasks และรวมรายการว่างด้วย
      if (Array.isArray(mergedTasks)) {
        mergedTasks.forEach((task) => {
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


      const totalItems = Array.isArray(workloadData) ? workloadData.reduce((sum, task) =>
        sum + Object.values(task.subtasks).reduce((subSum, subtask) =>
          subSum + subtask.form_infos.length, 0
        ), 0
      ) : 0

      const totalWorkload = Array.isArray(workloadData) ? workloadData.reduce((sum, task) =>
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
      if (Array.isArray(mergedTasks)) {
        mergedTasks.forEach((task, index) => {
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
      const firstFive = Array.isArray(mergedTasks) ? mergedTasks.slice(0, 5) : []
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
      const scoreNumber = performanceScoreOutOf70.toFixed(2)
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
      // ตรวจสอบว่ามีข้อมูล snapshot หรือไม่
      if (performanceSnapshot && performanceSnapshot.evaluations && performanceSnapshot.evaluations.length > 0) {
        // ขึ้นหน้าใหม่สำหรับส่วนที่ 2
        doc.addPage()
        let performanceStartY = 32
        
        doc.setFont('THSarabunNew', 'bold')
        doc.setFontSize(14)
        doc.text('ส่วนที่ 2 องค์ประกอบที่ 2 พฤติกรรมการปฏิบัติงาน (สมรรถนะ)', 14, performanceStartY)
        performanceStartY += 5

        // จัดเรียง evaluations ตาม competency_order
        const sortedEvaluations = [...performanceSnapshot.evaluations].sort((a, b) => {
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
          'สมรรถนะหลัก',
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

      // วาด Header บนทุกหน้า (หน้าแรกมีปีงบประมาณ หน้าถัดไปไม่มี)
      // ต้องวาดหลังจากสร้างทุกหน้าหมดแล้ว เพื่อให้ครอบคลุมทุกหน้า รวมถึงหน้าส่วนที่ 2
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
      doc.save(`workload-report-${roundId || 'export'}.pdf`)

    } catch (error) {
      console.error('Export PDF with links error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      alert('เกิดข้อผิดพลาดในการ export PDF: ' + errorMessage)
    } finally {
      setExporting(false)
    }
  }

  // if (loading) {
  //   return (
  //     <div className="rounded-md h-[calc(93vh-200px)] w-full flex flex-col gap-4 items-center justify-center bg-white p-6 shadow dark:bg-zinc-900">
  //       <FileText className="h-40 w-40 text-business1" />
  //       <p className="text-lg font-light text-center text-gray-800 dark:text-gray-200 animate-pulse">กำลังโหลดข้อมูล ประเมินภาระงาน...</p>
  //     </div>
  //   )
  // }

  return (
    <div id="workload-content" className="space-y-4">
      <div className="flex flex-col gap-10 rounded-md p-4 bg-white dark:bg-zinc-900">
        <div className="flex justify-end gap-3 mb-4">
          <button
            id="export-pdf-btn"
            onClick={handleExportPDFWithLinks}
            disabled={exporting || !Array.isArray(workloadData) || workloadData.length === 0}
            className="inline-flex h-10 items-center px-4 py-2 bg-red-500 text-white rounded-lg hover:text-white hover:bg-red-600 transition-colors duration-200"
            title="Export PDF พร้อม clickable links"
          >
            <FileDown className="mr-2 h-4 w-4" />
            ส่งออกเป็น PDF
          </button>
        </div>
        <div className="overflow-x-auto">
          <div className="">
            <p className="text-lg font-light text-center text-gray-800 dark:text-gray-200">ข้อตกลงและแบบประเมินผลการปฏิบัติงานของบุคลากรสายวิชาการ</p>
            <p className="text-lg font-light text-center text-gray-800 dark:text-gray-200 mb-8">มหาวิทยาลัยเทคโนโลยีราชมงคลล้านนา</p>
            <p className="text-md font-normal text-gray-800 dark:text-gray-200 mb-4">ส่วนที่ 1 องค์ประกอบที่ 1 ผลสัมฤทธิ์ของงาน</p>
          </div>
          <table className="w-full border-collapse border border-gray-300 dark:border-gray-600">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="border border-gray-300 px-4 py-3 text-center text-gray-700 dark:text-gray-300 font-medium">
                  ภาระงาน/กิจกรรม/โครงการ/งาน
                  <p>(1)</p>
                </th>
                <th className="border border-gray-300 px-4 py-3 text-center text-gray-700 dark:text-gray-300 font-medium">
                  หลักฐาน
                  <p>(2)</p>
                </th>
                <th className="border border-gray-300 px-4 py-3 text-center text-gray-700 dark:text-gray-300 font-medium">
                  จำนวน
                  <p>(3)</p>
                </th>
                <th className="border border-gray-300 px-4 py-3 text-center text-gray-700 dark:text-gray-300 font-medium">
                  ภาระงาน
                  <p>(4)</p>
                </th>
                <th className="border border-gray-300 px-4 py-3 text-center text-gray-700 dark:text-gray-300 font-medium">
                  รวมภาระงาน
                  <p>(3 x 4)</p>
                </th>
                <th className="border border-gray-300 px-4 py-3 text-center text-gray-700 dark:text-gray-300 font-medium max-w-10">
                  หมายเหตุ
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-zinc-900">
              {Array.isArray(mergedTasks) && mergedTasks.length > 0 ? (
                mergedTasks.map((task) => (
                  <React.Fragment key={task.task_id}>
                    {/* Task Row */}
                    <tr className="bg-business1 text-white dark:bg-zinc-900">
                      <td colSpan={6} className="border border-gray-300 px-4 py-3 dark:text-gray-200 font-normal">
                        <div className="flex items-center justify-between">
                          <span className="">
                            {task.task_id}. {task?.task_name || 'Unknown Task'} (ภาระงานขั้นต่ำ)
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
                                {task.task_id}.{subtaskIndex + 1} {subtask?.subtask_name || 'Unknown Subtask'}
                              </span>
                            </div>
                          </td>
                        </tr>

                        {(subtask.form_infos.length === 0 ? [null] : subtask.form_infos).map((formInfo, index) => (
                          formInfo === null ? (
                            <tr key={`placeholder-${task.task_id}-${subtask.subtask_id}`}>
                              <td className="border border-gray-300 px-4 py-2 text-gray-500 dark:text-gray-400">
                                <div className="ml-12 text-sm">-</div>
                              </td>
                              <td className="border border-gray-300 px-4 py-2 text-left text-gray-500 dark:text-gray-400 text-sm">-</td>
                              <td className="border border-gray-300 px-4 py-2 text-center text-gray-500 dark:text-gray-400 text-sm">-</td>
                              <td className="border border-gray-300 px-4 py-2 text-center text-gray-500 dark:text-gray-400 text-sm">-</td>
                              <td className="border border-gray-300 px-4 py-2 text-center text-gray-500 dark:text-gray-400 text-sm">-</td>
                              <td className="border border-gray-300 px-4 py-2 text-left text-gray-500 dark:text-gray-400 text-sm">-</td>
                            </tr>
                          ) : (
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
                                  ) : (formInfo.files && formInfo.files.length > 0) || (formInfo.links && formInfo.links.length > 0) ? (
                                    <div className="space-y-1">
                                      {/* แสดงไฟล์ */}
                                      {formInfo.files && formInfo.files.map((file: any, fileIndex: number) => (
                                        <button
                                          key={fileIndex}
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
                                          <span className="max-w-32 truncate">{file.file_name}</span>
                                        </button>
                                      ))}

                                      {/* แสดงลิงก์ */}
                                      {formInfo.links && formInfo.links.map((link: any, linkIndex: number) => (
                                        <button
                                          key={linkIndex}
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
                                          <span className="max-w-32 truncate">{link.link_name}</span>
                                        </button>
                                      ))}
                                    </div>
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
                          )
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
                        {(() => {
                          const hasAny = Object.values(task.subtasks).some(st => st.form_infos.length > 0)
                          const total = Object.values(task.subtasks).reduce((subSum, subtask) =>
                            subSum + subtask.form_infos.reduce((formSum, formInfo) =>
                              formSum + (formInfo.quality * formInfo.workload), 0
                            ), 0
                          )
                          return hasAny ? total : '-'
                        })()}
                      </td>
                      <td className="border border-gray-300 px-4 py-2 text-left dark:text-blue-200">
                      </td>
                    </tr>
                  </React.Fragment>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="border border-gray-300 px-4 py-8 text-center text-gray-500 dark:text-gray-400">กำลังโหลดรายการ...</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

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
            <tbody className="bg-white dark:bg-white">
              {Array.isArray(mergedTasks) && mergedTasks.map((task, index) => {
                const hasAny = Object.values(task.subtasks).some(st => st.form_infos.length > 0)
                const taskTotal = Object.values(task.subtasks).reduce((subSum, subtask) =>
                  subSum + subtask.form_infos.reduce((formSum, formInfo) =>
                    formSum + (formInfo.quality * formInfo.workload), 0
                  ), 0
                )

                const displayTaskName = task?.task_name
                  ? (task?.task_id ? `${task.task_id}. ${task.task_name}` : task.task_name)
                  : ''

                // สร้างข้อมูล workloadGroups จาก terms แทน hardcode
                const workloadGroups: Array<{ name: string; hours: { [key: string]: number } }> = []
                if (terms && terms.length > 0) {
                  // สร้าง unique groups จาก terms
                  const uniqueGroups = [...new Set(terms.map(term => term.workload_group_name))]
                  uniqueGroups.forEach(groupName => {
                    // สร้าง map ของ task_name -> hours
                    const hours: { [key: string]: number } = {}
                    terms.forEach(term => {
                      if (term.workload_group_name === groupName) {
                        hours[term.task_name] = term.quantity_workload_hours
                      }
                    })
                    if (Object.values(hours).some(h => h > 0)) {
                      workloadGroups.push({ name: groupName, hours })
                    }
                  })
                }

                const hasGroupMinimum = workloadGroups.some(g => g.hours[task.task_name] > 0)
                // คำนวณจำนวนกลุ่มที่มีขั้นต่ำสำหรับ task นี้
                const groupCountWithMinimum = workloadGroups.filter(g => g.hours[task.task_name] > 0).length
                const rowSpanValue = hasGroupMinimum ? groupCountWithMinimum + 1 : 1

                return (
                  <React.Fragment key={task.task_id}>
                    {/* แสดงหัวข้อภาระงานหลัก */}
                    <tr className="bg-white">
                      <td className={`px-4 py-2 text-gray-800 font-normal text-sm underline ${index > 0 ? 'border-t border-l border-r border-gray-300' : 'border-l border-r border-gray-300'
                        }`}>
                        {displayTaskName}
                      </td>
                      <td rowSpan={rowSpanValue} className="border border-gray-300 px-4 py-3 text-center font-light text-sm bg-white">
                        {hasAny ? taskTotal : '-'}
                      </td>
                      <td rowSpan={rowSpanValue} className="border border-gray-300 px-4 py-3 text-center text-gray-500 bg-white">

                      </td>
                    </tr>

                    {/* แสดงตัวเลือกแต่ละกลุ่ม/term เฉพาะเมื่อมีขั้นต่ำในอย่างน้อยหนึ่งกลุ่ม */}
                    {hasGroupMinimum && workloadGroups.map((group, groupIndex) => {
                      // เช็กจาก selectedGroupName prop โดยตรง
                      const isSelected = selectedGroupName === group.name

                      // ถ้ากลุ่มนี้ไม่มีขั้นต่ำสำหรับภาระงานนี้ ไม่ต้องแสดงแถว
                      const hourValue = group.hours[task.task_name] || 0
                      if (!(hourValue > 0)) return null

                      return (
                        <tr key={`${task.task_id}-${groupIndex}`} className="bg-white">
                          <td className="border-l border-r border-gray-300 px-4 pb-2 text-gray-800 font-light text-sm">
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-4 h-4 border-2 rounded flex items-center justify-center flex-shrink-0 ${isSelected
                                    ? 'border-red-500 bg-red-500'
                                    : 'border-gray-400 bg-white'
                                  }`}
                                role="checkbox"
                                aria-checked={isSelected}
                              >
                                {isSelected && (
                                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                  </svg>
                                )}
                              </div>
                              <span className={isSelected ? 'text-red-500 font-light' : 'text-gray-700'}>
                                {group.name} {hourValue} ภาระงาน/สัปดาห์
                              </span>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </React.Fragment>
                )
              })}

              {/* แถวสรุป */}
              <tr className="bg-white font-bold">
                <td className="border border-gray-300 px-4 py-3 text-end text-sm font-semibold text-gray-800">
                  รวม
                </td>
                <td className="border border-gray-300 px-4 py-3 text-center font-semibold text-sm">
                  <span className="text-blue-600 font-bold">
                    {(() => {
                      const firstFive = Array.isArray(mergedTasks) ? mergedTasks.slice(0, 5) : []
                      const hasAny = firstFive.some(task => Object.values(task.subtasks).some(st => st.form_infos.length > 0))
                      return hasAny ? totalPerformanceWorkload : '-'
                    })()}
                  </span>
                </td>
                <td className="border border-gray-300 px-4 py-3 text-center text-gray-500">
                </td>
              </tr>
            </tbody>
          </table>
          <div className="flex justify-between items-center mt-4">
            <p className="text-md font-light text-gray-500 m-0 flex items-center gap-2">สรุปคะแนนส่วนผลสัมฤทธิ์ของงาน
              <span className="text-md font-light text-red-500 m-0">คะแนนเต็ม 70 คะแนน </span>
              <AlertCircle className="h-4 w-4" />
            </p>
            <p className="text-md font-semibold text-blue-600 m-0">{performanceScoreOutOf70.toFixed(2)} <span className="text-sm font-light text-gray-500 m-0">&nbsp;คะแนน</span></p>
          </div>
        </div>
                <div className="">
          <p className="text-md font-normal text-gray-800 dark:text-gray-200 mb-4">ส่วนที่ 2 องค์ประกอบที่ 2 พฤติกรรมการปฏิบัติงาน (สมรรถนะ)</p>
          
          {/* ตารางแสดงข้อมูล performance evaluation สำหรับ preview (ไม่ใช่ snapshot) */}
          {isPreview && competencies.length > 0 && (
            <div className="overflow-x-auto mt-4">
              <table className="w-full border-collapse border border-gray-300 dark:border-gray-600">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th
                      rowSpan={2}
                      className="border border-gray-300 px-2 py-2 text-center text-md font-normal text-gray-700 dark:text-gray-300 w-12"
                    >
                      ลำดับ
                    </th>
                    <th
                      rowSpan={2}
                      className="border border-gray-300 px-3 py-2 text-center text-md font-normal text-gray-700 dark:text-gray-300"
                    >
                      สมรรถนะหลัก
                    </th>
                    <th
                      colSpan={4}
                      className="border border-gray-300 px-2 py-2 text-center text-md font-normal text-gray-700 dark:text-gray-300"
                    >
                      ระดับสมรรถนะที่คาดหวัง
                    </th>
                    <th
                      rowSpan={2}
                      className="border border-gray-300 px-1 py-2 text-center text-md font-normal text-gray-700 dark:text-gray-300 w-32"
                    >
                      ระดับสมรรถนะที่แสดงออก
                    </th>
                  </tr>
                  <tr>
                    {POSITIONS.map((position) => {
                      // หา user position_id จาก decoded token
                      let userPositionId: number | null = null
                      try {
                        if (session?.accessToken) {
                          const decoded = jwtDecode(session.accessToken) as any
                          userPositionId = decoded?.position_id || null
                        }
                      } catch (error) {
                        console.error('Error decoding token:', error)
                      }
                      
                      const isHighlighted = userPositionId === position.position_id
                      
                      return (
                        <th
                          key={position.position_id}
                          className={`border border-gray-300 px-1 py-1 text-center text-md font-normal ${
                            isHighlighted
                              ? 'bg-green-100 dark:bg-green-900/30'
                              : 'bg-gray-50 dark:bg-gray-800'
                          } text-gray-700 dark:text-gray-300`}
                        >
                          {position.short_name}
                        </th>
                      )
                    })}
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-zinc-900">
                  {(() => {
                    // สร้าง map ของ expected levels: competency_id -> position_id -> expected_level
                    const expectedLevelsMap: Record<number, Record<number, number>> = {}
                    expectedLevels.forEach((level: any) => {
                      if (!expectedLevelsMap[level.competency_id]) {
                        expectedLevelsMap[level.competency_id] = {}
                      }
                      expectedLevelsMap[level.competency_id][level.position_id] = level.expected_level
                    })

                    // สร้าง map ของ evaluations: competency_id -> demonstrated_level
                    const evaluationsMap: Record<number, number | null> = {}
                    performanceEvaluations.forEach((evaluation: any) => {
                      evaluationsMap[evaluation.competency_id] = evaluation.demonstrated_level
                    })

                    // จัดเรียง competencies ตาม competency_order
                    const sortedCompetencies = [...competencies].sort((a, b) => (a.competency_order || 0) - (b.competency_order || 0))

                    return sortedCompetencies.map((competency: any, index: number) => {
                      // หา user position_id
                      let userPositionId: number | null = null
                      try {
                        if (session?.accessToken) {
                          const decoded = jwtDecode(session.accessToken) as any
                          userPositionId = decoded?.position_id || null
                        }
                      } catch (error) {
                        // ignore
                      }

                      return (
                        <tr key={competency.competency_id}>
                          <td className="border border-gray-300 px-2 py-2 text-center text-md font-light text-gray-800 dark:text-gray-200">
                            {index + 1}
                          </td>
                          <td className="border border-gray-300 px-3 py-2 text-md font-light text-gray-800 dark:text-gray-200">
                            {competency.competency_name || '-'}
                          </td>
                          {POSITIONS.map((position) => {
                            const expectedLevel = expectedLevelsMap[competency.competency_id]?.[position.position_id] || '-'
                            const isHighlighted = userPositionId === position.position_id

                            return (
                              <td
                                key={position.position_id}
                                className={`font-light border border-gray-300 px-1 py-2 text-center text-md text-gray-700 dark:text-gray-300 ${
                                  isHighlighted
                                    ? '!bg-green-200 dark:!bg-green-700/50'
                                    : ''
                                }`}
                              >
                                {expectedLevel}
                              </td>
                            )
                          })}
                          <td className="font-light border border-gray-300 px-4 py-2 text-center text-md text-blue-600 dark:text-blue-400">
                            {evaluationsMap[competency.competency_id] !== null && evaluationsMap[competency.competency_id] !== undefined
                              ? evaluationsMap[competency.competency_id]
                              : '-'}
                          </td>
                        </tr>
                      )
                    })
                  })()}
                </tbody>
              </table>
            </div>
          )}

          {/* แสดงข้อความเมื่อไม่มี snapshot */}
          {!isPreview && !performanceSnapshot && (
            <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-md border border-gray-300 dark:border-gray-600">
              <p className="text-center text-gray-600 dark:text-gray-400">
                ยังไม่มีข้อมูล snapshot กรุณาส่งฟอร์มเพื่อสร้าง snapshot
              </p>
            </div>
          )}

          {/* ตารางแสดงข้อมูล snapshot ของ performance evaluation - แสดงแค่ position ที่เก็บใน snapshot */}
          {!isPreview && performanceSnapshot && performanceSnapshot.evaluations && performanceSnapshot.evaluations.length > 0 && (() => {
            // จัดเรียง evaluations ตาม competency_order (ใช้ข้อมูลจาก snapshot โดยตรง)
            const sortedEvaluations = [...performanceSnapshot.evaluations].sort((a, b) => {
              const orderA = a.competency_order || 0
              const orderB = b.competency_order || 0
              return orderA - orderB
            })

            // ดึง position_name และ position_short_name จาก snapshot (จาก evaluation แรก - ทุก evaluation ควรมีค่าเดียวกัน)
            const snapshotPositionName = sortedEvaluations.length > 0 
              ? sortedEvaluations[0]?.position_name || null
              : null
            const snapshotPositionShortName = sortedEvaluations.length > 0 
              ? sortedEvaluations[0]?.position_short_name || null
              : null

            // ใช้ข้อมูลจาก snapshot โดยตรง (เก็บเป็น text เพื่อป้องกันการเปลี่ยนแปลง)
            const compsToShow = sortedEvaluations.map(e => ({
              competency_name: e.competency_name || '-', // ใช้ข้อมูล text จาก snapshot
              competency_order: e.competency_order || 0,
              demonstrated_level: e.demonstrated_level,
              expected_level: e.expected_level || null // ใช้ข้อมูลจาก snapshot (expected_level ของ position ที่เก็บไว้)
            }))

            return (
              <div className="overflow-x-auto mt-4">
                <table className="w-full border-collapse border border-gray-300 dark:border-gray-600">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th
                        rowSpan={2}
                        className="border border-gray-300 px-2 py-2 text-center text-md font-normal text-gray-700 dark:text-gray-300 w-12"
                      >
                        ลำดับ
                      </th>
                      <th
                        rowSpan={2}
                        className="border border-gray-300 px-3 py-2 text-center text-md font-normal text-gray-700 dark:text-gray-300 w-2/3"
                      >
                        สมรรถนะหลัก
                      </th>
                      <th
                        colSpan={1}
                        className="border border-gray-300 px-2 py-2 text-center text-md font-normal text-gray-700 dark:text-gray-300"
                      >
                        ระดับสมรรถนะที่คาดหวัง
                      </th>
                      <th
                        rowSpan={2}
                        className="border border-gray-300 px-1 py-2 text-center text-md font-normal text-gray-700 dark:text-gray-300 w-32"
                      >
                        ระดับสมรรถนะที่แสดงออก
                      </th>
                    </tr>
                    <tr>
                      {/* แสดงแค่ position ที่เก็บใน snapshot */}
                      <th
                        className="border border-gray-300 px-1 py-1 text-center text-md font-normal bg-green-100 dark:bg-green-900/30 text-gray-700 dark:text-gray-300"
                      >
                        {snapshotPositionShortName || snapshotPositionName || '-'}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-zinc-900">
                    {compsToShow.map((competency: any, index: number) => {
                      return (
                        <tr key={`${competency.competency_name}-${index}`}>
                          <td className="border border-gray-300 px-2 py-2 text-center text-md font-light text-gray-800 dark:text-gray-200">
                            {index + 1}
                          </td>
                          <td className="border border-gray-300 px-3 py-2 text-md font-light text-gray-800 dark:text-gray-200">
                            {competency.competency_name || '-'}
                          </td>
                          {/* แสดง expected_level จาก snapshot สำหรับ position ที่เก็บไว้ */}
                          <td className="font-light border border-gray-300 px-1 py-2 text-center text-md text-gray-700 dark:text-gray-300 !bg-green-200 dark:!bg-green-700/50">
                            {competency.expected_level !== null && competency.expected_level !== undefined
                              ? competency.expected_level
                              : '-'}
                          </td>
                          <td className="font-normal border border-gray-300 px-4 py-2 text-center text-md text-blue-600 dark:text-blue-400">
                            {competency.demonstrated_level !== null && competency.demonstrated_level !== undefined
                              ? competency.demonstrated_level
                              : '-'}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )
          })()}
        </div>
      </div>
    </div>
  )
}
