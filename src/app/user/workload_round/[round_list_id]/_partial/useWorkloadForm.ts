'use client'
import { useEffect, useState, useMemo } from 'react'
import { useSession } from 'next-auth/react'
import { useCurrentUser } from '@/hooks/useCurrentUser'
import SetAssessorServices from '@/services/setAssessorServices'
import SnapshotService from '@/services/snapshotService'
import MainTaskServices from '@/services/mainTaskServices'
import SubTaskServices from '@/services/subTaskServices'
import WorkloadFormServices from '@/services/workloadFormServices'
import PerformanceService from '@/services/performanceService'
import type { PerformanceSnapshot } from '@/Types/performance'
import type { Subtask, Task } from '../types'
import { handleExportPDFWithLinks } from '../exportPDF'
import { handleExportPDFEvaluatedWithLinks } from '../exportPDFEvaluated'
import type { WorkloadFormProps } from './workloadFormTypes'
import { POSITIONS, convertSnapshotPayloadToTasks, getMockWorkloadData } from './workloadFormHelpers'

export function useWorkloadForm({ selectedGroupName, terms = [], userId, roundId, isPreview = false, forceSnapshot = false }: WorkloadFormProps) {
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
  const { data: session } = useSession()
  const { data: currentUser } = useCurrentUser()

  // ใช้ Personal จาก useCurrentUser แทน jwtDecode
  const userPositionName = useMemo(() => {
    if (!currentUser) return '-'
    if (currentUser.position_name) return currentUser.position_name
    if (currentUser.position_id) {
      const matchedPosition = POSITIONS.find(
        position => position.position_id === currentUser.position_id
      )
      if (matchedPosition) {
        return matchedPosition.position_name
      }
    }
    return '-'
  }, [currentUser])

  const userPositionId = currentUser?.position_id ?? null

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
        const mainTasksRes: any = await MainTaskServices.getAllMainTasks({
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
            const subRes: any = await SubTaskServices.getSubTasksByTask(mt.task_id)
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
              const convertedData = convertSnapshotPayloadToTasks(snapshotResponse.payload)

              setWorkloadData(convertedData)
              return
            } else {
              throw new Error('Snapshot data is empty')
            }
          } catch (snapshotError: any) {
            console.error('Error fetching snapshot data (Force):', snapshotError)

            // ถ้า snapshot error ให้ใช้ API ปกติ
            try {
              const response = await WorkloadFormServices.getWorkloadItems(
                Number(userId),
                Number(roundId)
              )

              if (response.success && response.payload) {
                setWorkloadData(response.payload)
                return
              } else {
                console.error('Regular API response is not successful:', response)
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
        const response = await WorkloadFormServices.getWorkloadItems(
          Number(userId),
          Number(roundId)
        )

        if (response.success && response.payload) {
          setWorkloadData(response.payload)
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

            // Debug: ตรวจสอบ evaluation_score
            if (status === 2) {
              snapshotResponse.payload.forEach((item: any) => {
                if (item.evaluation_score != null) {
                  console.log(`Item ${item.snapshot_form_id || item.form_id}: evaluation_score = ${item.evaluation_score}`)
                }
              })
            }

            const convertedData = convertSnapshotPayloadToTasks(snapshotResponse.payload)

            setWorkloadData(convertedData)
          }
        } catch (snapshotError) {
          console.error('Error fetching snapshot data:', snapshotError)
          // ถ้า snapshot error ให้ใช้ API ปกติ
          try {
            const response = await WorkloadFormServices.getWorkloadItems(
              Number(userId),
              Number(roundId)
            )

            if (response.success && response.payload) {
              console.log('Fallback to regular API:', response.payload)
              setWorkloadData(response.payload)
            }
          } catch (fallbackError) {
            console.error('Fallback API also failed:', fallbackError)
            // Use mock data as last resort
            setWorkloadData(getMockWorkloadData())
          }
        }
      } else {
        try {
          const response = await WorkloadFormServices.getWorkloadItems(
            Number(userId),
            Number(roundId)
          )

          if (response.success && response.payload) {
            console.log('API Response:', response.payload)
            console.log('Number of tasks:', response.payload.length)
            setWorkloadData(response.payload)
          }
        } catch (regularApiError) {
          console.error('Error fetching regular API:', regularApiError)
          setWorkloadData(getMockWorkloadData())
        }
      }
    } catch (error) {
      console.error('Error fetching workload data:', error)
      setWorkloadData(getMockWorkloadData())
    } finally {
      setLoading(false)
    }
  }



  useEffect(() => {
    fetchWorkloadData()
  }, [userId, roundId, session?.accessToken])

  // ดึงข้อมูล snapshot ของ performance evaluation
  useEffect(() => {
    const fetchPerformanceSnapshot = async () => {
      if (!userId || !roundId || !session?.accessToken) return

      try {
        // ดึงข้อมูล expected levels และ competencies เสมอ
        try {
          const [competenciesRes, expectedLevelsRes] = await Promise.all([
            PerformanceService.getAllCompetencies(),
            PerformanceService.getAllExpectedLevels()
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
              roundId
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
              userId
            ),
            PerformanceService.getPerformanceEvaluation(formlist_id),
            PerformanceService.getAllCompetencies(),
            PerformanceService.getAllExpectedLevels()
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
              PerformanceService.getAllCompetencies(),
              PerformanceService.getAllExpectedLevels()
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
              userId
            ),
            PerformanceService.getPerformanceEvaluation(formlist_id)
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
        const response = await SetAssessorServices.getAllRounds()

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
      userId,
      userProfile: currentUser ?? undefined,
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

  const isFinalized = formlistStatus === 2

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
      userId,
      isFinalized,
      userProfile: currentUser ?? undefined,
    })
  }

  return {
    workloadData,
    loading,
    exporting,
    performanceSnapshot,
    expectedLevels,
    competencies,
    performanceEvaluations,
    isCompetencyModalOpen,
    setIsCompetencyModalOpen,
    currentUser,
    userPositionName,
    userPositionId,
    competencyScoreSummary,
    competencyTotalScoreCalc,
    formlistStatus,
    evaluatedCompetencyScoreSummary,
    setEvaluatedCompetencyScoreSummary,
    totalPerformanceWorkload,
    performanceScoreOutOf70,
    mergedTasks,
    performanceScoreOutOf70Evaluated,
    isFinalized,
    handleExportPDFWithLinksWrapper,
    handleExportPDFEvaluatedWrapper,
  }
}
