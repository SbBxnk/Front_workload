'use client'

import { useEffect, useMemo, useState, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { jwtDecode } from 'jwt-decode'
import AssessorServices from '@/services/assessorService'
import type { RoundList } from '@/Types/assessor'
import WorkloadFormServices from '@/services/workloadFormServices'
import SnapshotService from '@/services/snapshotService'
import PerformanceService from '@/services/performanceService'
import PerformanceEvaluationAssessmentService from '@/services/performanceEvaluationAssessmentService'
import MainTaskServices from '@/services/mainTaskServices'
import SubTaskServices from '@/services/subTaskServices'
import SetAssessorServices from '@/services/setAssessorServices'
import WorkloadEvaluationService from '@/services/workloadEvaluationService'
import QuantityWorkloadServices from '@/services/quantityWorkloadServices'
import type { Task, Subtask } from '../../workload_round/[round_list_id]/types'
import type { Terms } from '@/Types'
import { handleExportPDFWithLinks } from '../../workload_round/[round_list_id]/exportPDF'
import { handleExportPDFEvaluatedWithLinks } from '../../workload_round/[round_list_id]/exportPDFEvaluated'
import type { CriteriaComparison, EvaluationDashboard, FeedbackItem } from './types'
import { POSITIONS, calculatePerformanceScoreEvaluated } from './dashboardHelpers'
import { useCurrentUser } from '@/hooks/useCurrentUser'

export function useWorkloadDashboard() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: session } = useSession()
  const { data: currentUser } = useCurrentUser()
  const [userId, setUserId] = useState<number | null>(null)
  const [rounds, setRounds] = useState<RoundList[]>([])
  const [selectedRoundId, setSelectedRoundId] = useState<number | null>(null)
  const [initializedRoundFromUrl, setInitializedRoundFromUrl] = useState(false)
  const [dashboardData, setDashboardData] = useState<EvaluationDashboard | null>(
    null
  )
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [invalidRoundFromUrl, setInvalidRoundFromUrl] = useState<boolean>(false)
  const [hasFormInRound, setHasFormInRound] = useState<boolean | null>(null)
  const [exporting, setExporting] = useState(false)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [showGradeInfo, setShowGradeInfo] = useState(false)
  const [isUserAssigned, setIsUserAssigned] = useState<boolean | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const gradeInfoRef = useRef<HTMLDivElement>(null)

  // Handle click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
      if (gradeInfoRef.current && !gradeInfoRef.current.contains(event.target as Node)) {
        setShowGradeInfo(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])
  useEffect(() => {
    if (!session?.accessToken) {
      setUserId(null)
      return
    }

    try {
      const decoded = jwtDecode<{ id?: number | string }>(session.accessToken)
      const rawId = decoded.id
      if (typeof rawId === 'number') setUserId(rawId)
      else if (typeof rawId === 'string') {
        const parsed = Number(rawId)
        setUserId(Number.isFinite(parsed) ? parsed : null)
      } else {
        setUserId(null)
      }
    } catch (e) {
      console.error('Error decoding token in WorkloadDashboard:', e)
      setUserId(null)
    }
  }, [session?.accessToken])

  // load available rounds for this user (assessee)
  useEffect(() => {
    const loadRounds = async () => {
      if (!session?.accessToken) return
      try {
        // ดึงค่า roundId จาก URL ถ้ามี
        const roundIdFromUrl = searchParams.get('roundId')
        const parsedRoundId = roundIdFromUrl ? Number(roundIdFromUrl) : null

        const response = await AssessorServices.checkRound(
          {
            page: '1',
            limit: '20',
            search: '',
            year: '',
            sort: 'date_start',
            order: 'desc',
          }
        )

        const payload = Array.isArray(response.payload)
          ? response.payload
          : []
        setRounds(payload)
        // กำหนด round เริ่มต้น
        if (payload.length > 0 && !initializedRoundFromUrl) {
          const existsInPayload =
            parsedRoundId != null &&
            payload.some((r: RoundList) => r.round_list_id === parsedRoundId)

          if (parsedRoundId != null && !existsInPayload) {
            // มี param roundId แต่ไม่ตรงกับรอบใดเลย
            setInvalidRoundFromUrl(true)
            setSelectedRoundId(null)
            setInitializedRoundFromUrl(true)
          } else {
            const now = new Date()
            const currentRound = payload.find((r: RoundList) => {
              const start = new Date(r.date_start)
              const end = new Date(r.date_end)
              return now >= start && now <= end
            })

            const initialId =
              parsedRoundId != null && existsInPayload
                ? parsedRoundId
                : currentRound
                  ? currentRound.round_list_id
                  : payload[0].round_list_id

            setSelectedRoundId(initialId!)
            setInitializedRoundFromUrl(true)

            // sync ค่า initial กลับไปใน URL ด้วย
            const params = new URLSearchParams(searchParams.toString())
            params.set('roundId', String(initialId))
            router.replace(`?${params.toString()}`, { scroll: false })
          }
        }
      } catch (e) {
        console.error('Error loading rounds for dashboard:', e)
        setError('ไม่สามารถโหลดรอบการประเมินได้')
      }
    }

    loadRounds()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.accessToken])

  // load dashboard data when round or user changes
  useEffect(() => {
    const loadDashboard = async () => {
      if (!session?.accessToken || !userId || !selectedRoundId) {
        return
      }

      setLoading(true)
      setError(null)
      setHasFormInRound(null)

      try {
        let formlistPayload: any = null
        try {
          const formlistRes = await WorkloadFormServices.getFormlistByUserAndRound(
            userId,
            selectedRoundId
          )
          const rawPayload = (formlistRes as any)?.payload
          formlistPayload = Array.isArray(rawPayload) ? rawPayload[0] : rawPayload
        } catch (e) {
          const status = (e as any)?.response?.status
          if (status !== 404) {
            throw e
          }
        }

        // Check if user is assigned to this round
        let isAssigned = false
        try {
          const accessRes = await SetAssessorServices.checkUserAccessToRound(
            Number(userId),
            selectedRoundId
          )
          isAssigned = !!(accessRes as any)?.payload
        } catch (accessCheckErr) {
          console.warn("Could not check user access to round:", accessCheckErr)
        }
        setIsUserAssigned(isAssigned)

        if (!isAssigned) {
          setDashboardData(null)
          setLoading(false)
          return
        }

        // Fetch assigned workload group info from backend JOIN query
        let assignedUserInfo: any = null
        if (isAssigned) {
          try {
            assignedUserInfo = await WorkloadEvaluationService.getAssignedWorkloadGroup(
              userId,
              selectedRoundId
            )
          } catch (accessErr) {
            console.warn("Could not fetch assigned workload group:", accessErr)
          }
        }

        const workloadGroupId = assignedUserInfo?.workload_group_id || formlistPayload?.workload_group_id;

        // Fetch quantity workload criteria
        let quantityCriteriaPayload: any[] = []
        if (workloadGroupId) {
          try {
            const res = await QuantityWorkloadServices.getQuantityWorkloadByGroupId(
              workloadGroupId
            )
            quantityCriteriaPayload = (res as any)?.payload || []
          } catch (err) {
            console.warn("Could not fetch quantity workload criteria:", err)
          }
        }

        const quantityCriteriaMap = new Map<number, number>()
        quantityCriteriaPayload.forEach((item) => {
          if (item.task_id != null) {
            quantityCriteriaMap.set(item.task_id, Number(item.quantity_workload_hours || 0))
          }
        })

        const selectedRound = rounds.find((r: RoundList) => r.round_list_id === selectedRoundId)
        const isPastRound = selectedRound ? new Date() > new Date(selectedRound.date_end) : false

        if (!formlistPayload) {
          if (isPastRound) {
            setHasFormInRound(false)
            setDashboardData(null)
            setLoading(false)
            return
          } else {
            setHasFormInRound(true)
          }
        } else {
          setHasFormInRound(true)
        }

        const formlistId: number | null = formlistPayload?.formlist_id ?? null
        const formStatus: number | null = formlistPayload?.status ?? null

        let rawWorkloadExpected = 0
        let rawWorkloadActual: number | null = null
        const criteriaComparison: CriteriaComparison[] = []
        const feedback: FeedbackItem[] = []

        if (formlistId != null) {
          let rows: any[] = []
          try {
            const snapshotRes = await SnapshotService.getFormInfoWithSnapshot(
              formlistId,
              1,
              userId,
              selectedRoundId
            )
            rows = snapshotRes?.payload ?? []
          } catch (snapshotErr) {
            const status = (snapshotErr as any)?.response?.status
            if (status !== 404) throw snapshotErr
            console.warn("Snapshot not found for form, showing empty data")
          }

          const byTaskName = new Map<string, { task_id: number; name: string; expected: number; actual: number | null }>()

          // Pre-populate with standard tasks from quantityCriteriaPayload
          quantityCriteriaPayload.forEach((item) => {
            if (item.task_name) {
              const nameKey = item.task_name.trim()
              byTaskName.set(nameKey, {
                task_id: item.task_id ?? 0,
                name: nameKey,
                expected: 0,
                actual: null
              })
            }
          })

          rows.forEach((item: any) => {
            const taskId = item.task_id ?? 0
            const label = (item.task_name || 'ภาระงาน').trim()
            const baseExpected = Number(item.workload ?? 0) * Number(item.quality ?? 0)
            const evalScore = item.evaluation_score != null ? Number(item.evaluation_score) : null

            if (!byTaskName.has(label)) {
              byTaskName.set(label, { task_id: taskId, name: label, expected: 0, actual: null })
            }

            const agg = byTaskName.get(label)!
            agg.expected += baseExpected
            if (evalScore != null) {
              agg.actual = (agg.actual ?? 0) + evalScore
            }
          })

          const taskArray = Array.from(byTaskName.values())

          const firstFiveTasks = taskArray.filter((_, idx) => idx < 5)
          const totalRawExpected1to5 = firstFiveTasks.reduce((sum, t) => sum + t.expected, 0)
          const totalRawActual1to5 = firstFiveTasks.reduce((sum, t) => sum + (t.actual ?? 0), 0)

          rawWorkloadExpected = totalRawExpected1to5
          if (formStatus === 2 || formStatus === 1) {
            rawWorkloadActual = totalRawActual1to5
          }

          criteriaComparison.push(
            ...taskArray.map((t) => ({
              name: t.name,
              expectedScore: Number(t.expected.toFixed(2)),
              actualScore: t.actual != null ? Number(t.actual.toFixed(2)) : null,
              quantityScore: quantityCriteriaMap.get(t.task_id) ?? null
            }))
          )
        } else {
          // กรณีรอบใหม่ยังไม่มีฟอร์ม ดึงหัวข้อหลักมาแสดงกราฟเปล่า
          try {
            const mainTasksRes: any = await MainTaskServices.getAllMainTasks({
              page: 1, limit: 20, sort: 'task_id', order: 'asc'
            } as any)
            const mainTasks = Array.isArray(mainTasksRes?.payload) ? mainTasksRes.payload : (Array.isArray(mainTasksRes?.data) ? mainTasksRes.data : [])
            mainTasks.forEach((mt: any) => {
              criteriaComparison.push({
                name: mt.task_name,
                expectedScore: 0,
                actualScore: null,
                quantityScore: quantityCriteriaMap.get(mt.task_id) ?? null
              })
            })
          } catch (e) {
            console.error("Error fetching main tasks for empty dashboard:", e)
          }
        }

        let performanceActual: number | null = null
        let performanceAssessed: number | null = null
        const performanceExpected = 30
        const performanceComparison: CriteriaComparison[] = []
        let positionName = '-'

        try {
          const userPositionId = currentUser?.position_id ?? null

          if (currentUser?.position_name) {
            positionName = currentUser.position_name
          } else if (userPositionId) {
            const matched = POSITIONS.find(p => p.position_id === userPositionId)
            if (matched) positionName = matched.position_name
          } else {
            positionName = currentUser?.level_name ?? '-'
          }

          if (formlistId) {
            let evaluations: any[] = []

            try {
              const snapshotRes = await PerformanceService.getPerformanceSnapshot(formlistId, userId!, selectedRoundId)
              const payload = snapshotRes?.payload
              const snapshotData = (payload && !Array.isArray(payload)) ? payload : (Array.isArray(payload) && payload.length > 0 ? payload[0] : null)

              if (snapshotData?.evaluations) {
                evaluations = snapshotData.evaluations
              }
            } catch (perfSnapshotErr) {
              const status = (perfSnapshotErr as any)?.response?.status
              if (status !== 404) throw perfSnapshotErr
              console.warn("Performance Snapshot not found, showing live data or empty")
            }

            if (evaluations.length === 0) {
              try {
                const [evalsRes, competencyRes, allExpectedRes] = await Promise.all([
                  PerformanceService.getPerformanceEvaluation(formlistId),
                  PerformanceService.getAllCompetencies(),
                  PerformanceService.getAllExpectedLevels()
                ])

                const rawEvals = Array.isArray(evalsRes?.payload) ? evalsRes.payload : []
                const competencies = Array.isArray(competencyRes?.payload) ? competencyRes.payload : []
                const allExpected = Array.isArray(allExpectedRes?.payload) ? allExpectedRes.payload : []

                const compNameMap: Record<number, string> = {}
                competencies.forEach((c: any) => compNameMap[c.competency_id] = c.competency_name)

                const expectedMap: Record<number, number> = {}
                allExpected.forEach((lvl: any) => {
                  if (lvl.position_id === userPositionId) expectedMap[lvl.competency_id] = lvl.expected_level
                })

                evaluations = rawEvals.map((ev: any) => ({
                  competency_id: ev.competency_id,
                  competency_name: compNameMap[ev.competency_id] || `สมรรถนะ ${ev.competency_id}`,
                  expected_level: expectedMap[ev.competency_id] || ev.expected_level || 0,
                  demonstrated_level: ev.demonstrated_level || ev.demonstratedLevel || 0,
                  competency_order: ev.competency_order
                }))
              } catch (fallbackErr) {
                console.warn("Could not load live performance data:", fallbackErr)
              }
            }

            if (evaluations.length > 0) {
              const [competencyRes, averages] = await Promise.all([
                PerformanceService.getAllCompetencies(),
                PerformanceEvaluationAssessmentService.getAverageAssessedLevels(formlistId)
              ])

              const competencies = Array.isArray(competencyRes?.payload) ? competencyRes.payload : []
              const compIdToName: Record<number, string> = {}
              competencies.forEach((c: any) => compIdToName[c.competency_id] = c.competency_name)

              const averageMapByName = new Map<string, number>()
              averages.forEach((avg: any) => {
                const value = avg.average_assessed_level
                const name = compIdToName[Number(avg.competency_id)]
                if (value != null && name) {
                  const secondDecimal = Math.floor((value * 100) % 10)
                  const rounded = secondDecimal >= 5 ? Math.ceil(value) : Math.floor(value)
                  averageMapByName.set(name, rounded)
                }
              })

              const sortedEvaluations = [...evaluations].sort(
                (a, b) => (a.competency_order || 0) - (b.competency_order || 0)
              )

              sortedEvaluations.forEach((ev: any) => {
                const name = ev.competency_name || ev.competencyName || ""
                const expected = Number(ev.expected_level || ev.expectedLevel || 0)
                const demonstrated = Number(ev.demonstrated_level || ev.demonstratedLevel || 0)
                const assessed = averageMapByName.get(name) ?? null

                performanceComparison.push({
                  name: name || `สมรรถนะ`,
                  expectedScore: expected,
                  actualScore: demonstrated,
                  assessedScore: assessed
                })
              })

              let totalPoints = 0
              sortedEvaluations.forEach((ev: any) => {
                const name = ev.competency_name || ev.competencyName || ""
                const expected = Number(ev.expected_level || ev.expectedLevel || 0)
                const currentDemonstrated = formStatus === 2
                  ? (averageMapByName.get(name) ?? 0)
                  : Number(ev.demonstrated_level || ev.demonstratedLevel || 0)

                const diff = currentDemonstrated - expected
                if (diff >= 0) totalPoints += 3
                else if (diff === -1) totalPoints += 2
                else if (diff === -2) totalPoints += 1
              })
              performanceActual = totalPoints
              let userPoints = 0
              let assessedPoints = 0
              sortedEvaluations.forEach((ev: any) => {
                const name = ev.competency_name || ev.competencyName || ""
                const expected = Number(ev.expected_level || ev.expectedLevel || 0)

                // User's self-score
                const userDemonstrated = Number(ev.demonstrated_level || ev.demonstratedLevel || 0)
                const userDiff = userDemonstrated - expected
                if (userDiff >= 0) userPoints += 3
                else if (userDiff === -1) userPoints += 2
                else if (userDiff === -2) userPoints += 1

                // Assessor's score
                const assessedDemonstrated = averageMapByName.get(name) ?? null
                if (assessedDemonstrated !== null) {
                  const assessedDiff = assessedDemonstrated - expected
                  if (assessedDiff >= 0) assessedPoints += 3
                  else if (assessedDiff === -1) assessedPoints += 2
                  else if (assessedDiff === -2) assessedPoints += 1
                }
              })
              performanceActual = userPoints
              performanceAssessed = assessedPoints
            }
          } else {
            // กรณีรอบใหม่ยังไม่มีฟอร์ม ดึงสมรรถนะมาแสดงกราฟเปล่า
            try {
              const competencyRes = await PerformanceService.getAllCompetencies()
              const competencies = Array.isArray(competencyRes?.payload) ? competencyRes.payload : []
              competencies.forEach((c: any) => {
                performanceComparison.push({
                  name: c.competency_name,
                  expectedScore: 0,
                  actualScore: 0,
                  assessedScore: null
                })
              })
            } catch (e) {
              console.error("Error fetching competencies for empty dashboard:", e)
            }
          }
        } catch (err) {
          console.error('Error calculating performance score:', err)
        }

        const roundNameValue = selectedRound?.round_list_name ?? `รอบประเมินที่ ${selectedRoundId}`

        const finalWorkloadExpected = Math.min(70, (rawWorkloadExpected * 70) / 100)
        const finalWorkloadActual = rawWorkloadActual !== null ? Math.min(70, (rawWorkloadActual * 70) / 100) : null

        const dashboard: EvaluationDashboard = {
          roundId: selectedRoundId,
          roundName: roundNameValue,
          status: 'NOT_STARTED',
          progressPercent: 0,
          workloadScore: {
            expected: finalWorkloadExpected,
            actual: finalWorkloadActual
          },
          performanceScore: {
            expected: performanceExpected, // Requirement (30)
            actual: formStatus !== null ? performanceActual : 0, // User Claim (0 if not started)
            assessed: performanceAssessed
          },
          criteriaComparison,
          performanceComparison,
          feedback,
          workloadGroupName: assignedUserInfo?.workload_group_name ?? formlistPayload?.workload_group_name ?? 'ยังไม่ระบุ',
          positionName,
        }

        if (formStatus === 0) {
          // Progress 40% only if they have actually entered some data (workload or performance)
          const hasWorkloadData = criteriaComparison.some(c =>
            c.actualScore !== null && c.actualScore !== undefined && c.actualScore > 0
          )
          const hasPerformanceData = performanceComparison.some(p => p.actualScore !== null && p.actualScore !== undefined && p.actualScore > 0)

          if (hasWorkloadData || hasPerformanceData) {
            dashboard.status = 'IN_PROGRESS'
            dashboard.progressPercent = 40
          } else {
            dashboard.status = 'NOT_STARTED'
            dashboard.progressPercent = 0
          }
        } else if (formStatus === 1) {
          dashboard.status = 'PENDING_REVIEW'
          dashboard.progressPercent = 100
        } else if (formStatus === 2) {
          dashboard.status = 'COMPLETED'
          dashboard.progressPercent = 100
        }

        setDashboardData(dashboard)
      } catch (e) {
        console.error('Error loading workload dashboard:', e)
        const status = (e as any)?.response?.status
        if (status === 404) {
          const selectedRound = rounds.find((r) => r.round_list_id === selectedRoundId)
          const isPastRound = selectedRound ? new Date() > new Date(selectedRound.date_end) : false
          if (isPastRound) {
            setHasFormInRound(false)
            setDashboardData(null)
          } else {
            setHasFormInRound(true)
          }
        } else {
          setError('ไม่สามารถโหลดข้อมูลการประเมินได้')
          setDashboardData(null)
        }
      } finally {
        setLoading(false)
      }
    }

    loadDashboard()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.accessToken, userId, selectedRoundId])

  const handleExportPDF = async (evaluated: boolean = false) => {
    if (!userId || !selectedRoundId || !session?.accessToken || !dashboardData) return

    try {
      setExporting(true)

      // 1. ดึงข้อมูลเบื้องต้น
      const [termsRes, roundsRes, formlistResponse] = await Promise.all([
        WorkloadFormServices.getTerms(),
        SetAssessorServices.getAllRounds(),
        SnapshotService.getFormlistId(userId, selectedRoundId)
      ])

      if (!formlistResponse.success || !formlistResponse.payload || formlistResponse.payload.length === 0) {
        throw new Error("ไม่พบข้อมูลสำหรับการส่งออก")
      }

      const terms: Terms[] = termsRes.payload || []
      // Fixed shadowing issue (lint ID: 6e473545-9082-4392-8ae4-2420d534f736)
      const allRounds = Array.isArray(roundsRes.payload) ? roundsRes.payload : []
      const exportRound = allRounds.find((r: any) => r.round_list_id === selectedRoundId)
      const formlist_id = formlistResponse.payload[0].formlist_id
      const status = formlistResponse.payload[0].status

      // 2. ดึงโครงสร้างหลัก (Master)
      const mainTasksRes: any = await MainTaskServices.getAllMainTasks({
        page: 1, limit: 100, sort: 'task_id', order: 'asc'
      } as any)
      const mainTasks = Array.isArray(mainTasksRes?.payload) ? mainTasksRes.payload : (Array.isArray(mainTasksRes?.data) ? mainTasksRes.data : [])

      const masterTasks: Task[] = []
      for (const mt of mainTasks) {
        try {
          const subRes: any = await SubTaskServices.getSubTasksByTask(mt.task_id)
          const subtasksArr = Array.isArray(subRes?.payload) ? subRes.payload : (Array.isArray(subRes) ? subRes : [])
          const subtasksMap: { [key: number]: Subtask } = {}
          for (const st of subtasksArr) {
            subtasksMap[st.subtask_id] = { subtask_id: st.subtask_id, subtask_name: st.subtask_name, form_infos: [] }
          }
          masterTasks.push({ task_id: mt.task_id, task_name: mt.task_name, subtasks: subtasksMap })
        } catch (e) {
          masterTasks.push({ task_id: mt.task_id, task_name: mt.task_name, subtasks: {} })
        }
      }

      // 3. ดึงข้อมูล Workload จาก Snapshot
      let workloadData: Task[] = []
      const snapshotResponse = await SnapshotService.getFormInfoWithSnapshot(formlist_id, 1, userId, selectedRoundId)

      if (snapshotResponse.success && snapshotResponse.payload) {
        const taskMap = new Map();
        snapshotResponse.payload.forEach((item: any) => {
          const taskId = item.task_id || 1;
          const subtaskId = item.subtask_id || 1;
          if (!taskMap.has(taskId)) {
            taskMap.set(taskId, {
              task_id: taskId, task_name: item.task_name || "ภาระงาน",
              workload_group_id: item.workload_group_id, workload_group_name: item.workload_group_name,
              quantity_workload_hours: item.quantity_workload_hours, subtasks: new Map()
            });
          }
          const task = taskMap.get(taskId);
          if (!task.subtasks.has(subtaskId)) {
            task.subtasks.set(subtaskId, { subtask_id: subtaskId, subtask_name: item.subtask_name || "", form_infos: [] });
          }
          const subtask = task.subtasks.get(subtaskId);

          const files = Array.isArray(item.files) ? item.files.map((f: any) => ({ file_name: (f.file_name || '').trim() }))
            : (typeof item.files === 'string' && item.files.length > 0 ? item.files.split(', ').map((f: string) => ({ file_name: f.trim() })) : [])

          const links = Array.isArray(item.links) ? item.links.map((l: any) => ({ link_name: l.link_name || '', link_path: l.link_path || '' }))
            : (typeof item.links === 'string' && item.links.length > 0 ? item.links.split(', ').map((l: string) => {
              const parts = l.split('|'); return { link_name: parts[0] || '', link_path: parts[1] || parts[0] || '' }
            }) : [])

          subtask.form_infos.push({
            form_id: item.form_id, form_title: item.form_title, description: item.description,
            workload: item.workload, quality: item.quality, file_type: item.file_type, ex_score: item.ex_score,
            files, links, evaluation_score: item.evaluation_score != null ? Number(item.evaluation_score) : null
          });
        });
        workloadData = Array.from(taskMap.values()).map(task => ({ ...task, subtasks: Object.fromEntries(task.subtasks) }));
      }

      // 4. Merge ข้อมูล
      let finalMergedTasks = workloadData
      if (masterTasks.length > 0) {
        const result: Task[] = []
        const userTaskMap = new Map<number, Task>()
        for (const t of workloadData) userTaskMap.set(t.task_id, t)
        for (const mt of masterTasks) {
          const userTask = userTaskMap.get(mt.task_id)
          if (!userTask) { result.push(mt); continue; }
          const mergedSubtasks: { [key: number]: Subtask } = { ...userTask.subtasks }
          for (const [sid, s] of Object.entries(mt.subtasks)) {
            const sidNum = Number(sid)
            if (!mergedSubtasks[sidNum]) mergedSubtasks[sidNum] = { ...s, form_infos: [] }
          }
          result.push({ ...userTask, subtasks: mergedSubtasks })
        }
        finalMergedTasks = result
      }

      // 5. ดึง Performance Snapshot รายละเอียด
      const perfSnapshotRes = await PerformanceService.getPerformanceSnapshot(formlist_id, userId, selectedRoundId)
      const performanceSnapshot = (perfSnapshotRes?.payload && !Array.isArray(perfSnapshotRes.payload))
        ? perfSnapshotRes.payload
        : (Array.isArray(perfSnapshotRes?.payload) && perfSnapshotRes.payload.length > 0 ? perfSnapshotRes.payload[0] : null)

      const exportParams = {
        onExportStart: () => { },
        onExportEnd: () => { },
        year: exportRound?.year || "",
        session,
        roundId: selectedRoundId,
        mergedTasks: finalMergedTasks,
        workloadData,
        selectedGroupName: workloadData[0]?.workload_group_name,
        roundName: exportRound?.round_list_name || "",
        terms,
        performanceSnapshot,
        performanceScoreOutOf70: evaluated ? calculatePerformanceScoreEvaluated(workloadData) : (dashboardData.workloadScore.actual || 0),
        userId,
        userProfile: currentUser ?? undefined,
      }

      if (evaluated) {
        await handleExportPDFEvaluatedWithLinks({ ...exportParams, isFinalized: status === 2 })
      } else {
        await handleExportPDFWithLinks(exportParams)
      }

    } catch (err) {
      console.error("Export Error:", err)
      alert("เกิดข้อผิดพลาดในการส่งออก PDF กรุณาลองใหม่ภายหลัง")
    } finally {
      setExporting(false)
    }
  }

  const comparisonChartOptions = useMemo(
    () => ({
      chart: {
        type: 'bar' as const,
        toolbar: { show: false },
        fontFamily: 'inherit',
        animations: { enabled: false },
      },
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: '65%',
          borderRadius: 4,
        },
      },
      dataLabels: {
        enabled: false,
      },
      stroke: {
        show: true,
        width: 2,
        colors: ['transparent'],
      },
      xaxis: {
        categories:
          dashboardData?.criteriaComparison?.map((c) => c.name) ?? [],
        labels: {
          style: {
            fontSize: '11px',
            colors: undefined,
          },
          trim: true,
          formatter: (val: string) => {
            if (typeof val === 'string' && val.length > 15) {
              return val.substring(0, 15) + '...'
            }
            return val
          },
        },
      },
      yaxis: {
        title: {
          text: 'ภาระงาน (ชั่วโมง)',
        },
      },
      fill: {
        opacity: 1,
      },
      legend: {
        position: 'bottom' as const,
      },
      colors: ['#1e3a8a', '#3b82f6', '#10b981'],
      theme: {
        mode: 'light' as const,
      },
      grid: {
        borderColor: '#f1f1f1',
        strokeDashArray: 4,
        yaxis: {
          lines: {
            show: true
          }
        }
      },
      tooltip: {
        y: {
          formatter: (val: number) => `${val.toFixed(2)} ชั่วโมง`,
        },
      },
    }),
    [dashboardData?.criteriaComparison]
  )

  const comparisonChartSeries = useMemo(
    () => {
      const categories = dashboardData?.criteriaComparison ?? []

      const series: any[] = [
        {
          name: 'ภาระงานตามเกณฑ์',
          data: categories.map((c) => c.quantityScore || 0),
        },
        {
          name: 'ภาระงานที่คาดหวัง',
          data: categories.map((c) => c.expectedScore),
        }
      ]

      // แท่งที่ 3: ภาระงานที่ได้ (แสดงเมื่อเริ่มทำขึ้นไป)
      if (dashboardData?.status !== 'NOT_STARTED') {
        series.push({
          name: 'ภาระงานที่ได้',
          data: categories.map((c) => (c.actualScore != null ? Number(c.actualScore.toFixed(2)) : 0)),
        })
      }

      return series
    },
    [dashboardData]
  )

  const totalChartSeries = useMemo(() => {
    if (!dashboardData) return []
    const userWorkload = dashboardData.workloadScore.expected
    const assessedWorkload = dashboardData.workloadScore.actual ?? 0
    const userPerformance = dashboardData.performanceScore.actual ?? 0
    const assessedPerformance = dashboardData.performanceScore.assessed ?? 0

    const series = [
      {
        name: 'คะแนนเต็ม',
        data: [70, 30, 100],
      },
      {
        name: 'คะแนนคาดหวัง',
        data: [
          Number(userWorkload.toFixed(2)),
          Number(userPerformance.toFixed(2)),
          Number((userWorkload + userPerformance).toFixed(2)),
        ],
      },
    ]

    // แสดงแท่งที่ 3 (คะแนนจากการประเมิน) เฉพาะเมื่อมีการประเมินเสร็จสิ้น (Status 2)
    if (dashboardData.status === 'COMPLETED') {
      series.push({
        name: 'คะแนนจากการประเมิน',
        data: [
          Number(assessedWorkload.toFixed(2)),
          Number(assessedPerformance.toFixed(2)),
          Number((assessedWorkload + assessedPerformance).toFixed(2)),
        ],
      })
    }

    return series
  }, [dashboardData])

  const totalChartOptions = useMemo(
    () => ({
      chart: {
        type: 'bar' as const,
        toolbar: { show: false },
        fontFamily: 'inherit',
        animations: { enabled: false },
      },
      plotOptions: {
        bar: {
          horizontal: true,
          barHeight: '90%',
          borderRadius: 4,
          dataLabels: {
            position: 'top',
          },
        },
      },
      stroke: {
        show: true,
        width: 4,
        colors: ['#fff'],
      },
      dataLabels: {
        enabled: true,
        offsetX: -25,
        style: {
          fontSize: '12px',
          colors: ['#fff'],
          fontWeight: 600,
        },
        formatter: (val: number) => `${val.toFixed(2)}`,
        offsetY: 0,
      },
      xaxis: {
        categories: [
          ['ส่วนที่ 1 ', 'ผลสัมฤทธิ์ของงาน', '(70 คะแนน)'],
          ['ส่วนที่ 2 ', 'พฤติกรรมการปฏิบัติงาน', '(30 คะแนน)'],
          ['คะแนนรวม ', '(100 คะแนน)'],
        ],
        max: 110,
      },
      colors: ['#1e3a8a', '#3b82f6', '#10b981'],
      legend: { position: 'bottom' as const },
      tooltip: {
        y: {
          formatter: (val: number) => `${val.toFixed(2)} คะแนน`,
        },
      },
    }),
    []
  )

  const performanceComparisonChartSeries = useMemo(
    () => {
      const categories = dashboardData?.performanceComparison ?? []
      return [
        {
          name: 'ระดับคาดหวังตามตำแหน่ง',
          data: categories.map((c) => c.expectedScore),
        },
        {
          name: 'ระดับที่แสดงออก',
          data: categories.map((c) => c.actualScore != null ? c.actualScore : 0),
        },
        {
          name: 'ระดับจากผู้ตรวจ',
          data: categories.map((c) => c.assessedScore != null ? c.assessedScore : 0),
        }
      ]
    },
    [dashboardData]
  )

  const performanceComparisonChartOptions = useMemo(
    () => ({
      chart: {
        type: 'line' as const,
        toolbar: { show: false },
        zoom: { enabled: false },
        fontFamily: 'inherit',
        animations: { enabled: false },
      },
      dataLabels: {
        enabled: true,
        background: { enabled: true, borderRadius: 2 },
        formatter: (val: number) => val.toFixed(0),
      },
      stroke: {
        curve: 'straight' as const,
        width: 3,
      },
      markers: {
        size: 5,
        strokeWidth: 2,
        strokeColors: '#fff',
      },
      xaxis: {
        categories: dashboardData?.performanceComparison?.map((c) => c.name) ?? [],
        labels: {
          style: {
            fontSize: '11px',
            colors: '#64748b',
          },
          trim: true,
          formatter: (val: string) => {
            if (typeof val === 'string' && val.length > 12) {
              return val.substring(0, 12) + '...'
            }
            return val
          },
        },
      },
      yaxis: {
        title: { text: 'ระดับสมรรถนะ' },
        min: 0,
        max: 5,
        tickAmount: 5,
        labels: {
          formatter: (val: number) => val.toFixed(0)
        }
      },
      grid: {
        show: true,
        borderColor: '#e5e7eb',
        strokeDashArray: 4,
        xaxis: { lines: { show: true } },
        yaxis: { lines: { show: true } },
      },
      legend: { position: 'bottom' as const },
      colors: ['#1e3a8a', '#3b82f6', '#10b981'], // น้ำเงินเข้ม (คาดหวัง), น้ำเงิน (แสดงออก), เขียว (ผู้ตรวจ)
      tooltip: {
        y: {
          formatter: (val: number) => `ระดับ ${val}`,
        },
      },
    }),
    [dashboardData?.performanceComparison]
  )

  const isLoading = loading
  const hasError = !!error

  return {
    // route / session
    router,
    searchParams,
    // data
    rounds,
    selectedRoundId,
    setSelectedRoundId,
    dashboardData,
    // status flags
    invalidRoundFromUrl,
    hasFormInRound,
    exporting,
    isUserAssigned,
    isLoading,
    hasError,
    error,
    // dropdown / popover
    isDropdownOpen,
    setIsDropdownOpen,
    showGradeInfo,
    setShowGradeInfo,
    dropdownRef,
    gradeInfoRef,
    // actions
    handleExportPDF,
    // charts
    comparisonChartOptions,
    comparisonChartSeries,
    totalChartOptions,
    totalChartSeries,
    performanceComparisonChartOptions,
    performanceComparisonChartSeries,
  }
}
