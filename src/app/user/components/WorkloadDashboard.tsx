'use client'

import { useEffect, useMemo, useState, useRef } from 'react'
import dynamic from 'next/dynamic'
import { useRouter, useSearchParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { jwtDecode } from 'jwt-decode'
import AssessorServices, { type RoundList } from '@/services/assessorService'
import WorkloadFormServices from '@/services/workloadFormServices'
import SnapshotService from '@/services/snapshotService'
import PerformanceService, { type PerformanceSnapshot } from '@/services/performanceService'
import PerformanceEvaluationAssessmentService from '@/services/performanceEvaluationAssessmentService'
import MainTaskServices from '@/services/mainTaskServices'
import SubTaskServices from '@/services/subTaskServices'
import SetAssessorServices from '@/services/setAssessorServices'
import WorkloadEvaluationService from '@/services/workloadEvaluationService'
import QuantityWorkloadServices from '@/services/quantityWorkloadServices'
import { TriangleAlertIcon, CircleX, TrendingUp, UserCheck, BarChart3, FileDown, ChevronDown, Calendar, Info } from 'lucide-react'
import type { Task, Subtask } from '../workload_round/[round_list_id]/types'
import type { Terms } from '@/Types'
import { handleExportPDFWithLinks } from '../workload_round/[round_list_id]/exportPDF'
import { handleExportPDFEvaluatedWithLinks } from '../workload_round/[round_list_id]/exportPDFEvaluated'

const ReactApexChart = dynamic(() => import('react-apexcharts'), {
  ssr: false,
})

type EvaluationStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'PENDING_REVIEW' | 'COMPLETED'

interface CriteriaComparison {
  name: string
  expectedScore: number
  actualScore?: number | null
  assessedScore?: number | null // ระดับสมรรถนะจากผู้ตรวจ
  quantityScore?: number | null // ค่าภาระงานตามเกณฑ์ (เขียว)
}

interface FeedbackItem {
  reviewerName?: string
  comment: string
  createdAt?: string
}

interface EvaluationDashboard {
  roundId: number
  roundName: string
  status: EvaluationStatus
  progressPercent: number
  workloadScore: {
    expected: number
    actual: number | null
  }
  performanceScore: {
    expected: number
    actual: number | null
    assessed: number | null
  }
  criteriaComparison: CriteriaComparison[]
  performanceComparison: CriteriaComparison[]
  feedback: FeedbackItem[]
  workloadGroupName?: string
  positionName?: string
}

function formatStatus(status: EvaluationStatus) {
  switch (status) {
    case 'IN_PROGRESS':
      return 'กำลังดำเนินการ'
    case 'PENDING_REVIEW':
      return 'รอการตรวจสอบ'
    case 'COMPLETED':
      return 'ประเมินเสร็จสิ้น'
    case 'NOT_STARTED':
    default:
      return 'ยังไม่เริ่มดำเนินการ'
  }
}

function statusBadgeColor(status: EvaluationStatus) {
  switch (status) {
    case 'IN_PROGRESS':
      return 'text-blue-700 dark:text-blue-300'
    case 'PENDING_REVIEW':
      return 'text-amber-700 dark:text-amber-300'
    case 'COMPLETED':
      return 'text-emerald-700 dark:text-emerald-300'
    case 'NOT_STARTED':
    default:
      return 'text-gray-700 dark:text-gray-400'
  }
}

function getGrade(score: number | null) {
  if (score === null) return null
  if (score >= 90) return { label: 'ดีเด่น', color: 'text-emerald-700 bg-emerald-50 dark:bg-emerald-900/30 dark:text-emerald-300', border: 'border-emerald-100 dark:border-emerald-800' }
  if (score >= 80) return { label: 'ดีมาก', color: 'text-blue-700 bg-blue-50 dark:bg-blue-900/30 dark:text-blue-300', border: 'border-blue-100 dark:border-blue-800' }
  if (score >= 70) return { label: 'ดี', color: 'text-sky-700 bg-sky-50 dark:bg-sky-900/30 dark:text-sky-300', border: 'border-sky-100 dark:border-sky-800' }
  if (score >= 60) return { label: 'พอใช้', color: 'text-amber-700 bg-amber-50 dark:bg-amber-900/30 dark:text-amber-300', border: 'border-amber-100 dark:border-amber-800' }
  return { label: 'ต้องปรับปรุง', color: 'text-red-700 bg-red-50 dark:bg-red-900/30 dark:text-red-300', border: 'border-red-100 dark:border-red-800' }
}

function GradeDisplay({ label, score, title, disabled, colorClass, borderClass }: { label: string, score: number | null, title: string, disabled?: boolean, colorClass: string, borderClass: string }) {
  const grade = getGrade(score)

  if (disabled || !grade) {
    return (
      <div className="flex w-full flex-col gap-1 rounded-lg border border-gray-100 bg-gray-50/50 p-3 text-center transition-all dark:border-zinc-800 dark:bg-zinc-800/30">
        <div className="text-[10px] font-normal uppercase tracking-wider text-gray-400 dark:text-zinc-500">
          {label}
        </div>
        <div className="text-sm font-normal text-gray-300 dark:text-zinc-600">
          ยังไม่สรุปผล
        </div>
      </div>
    )
  }

  return (
    <div className={`flex w-full flex-col gap-1 rounded-lg border ${borderClass} ${colorClass} p-3 text-center transition-all shadow-sm`}>
      <div className="text-[10px] font-normal uppercase tracking-wider opacity-80">
        {label}
      </div>
      <div className="text-sm font-normal">
        {grade.label}
      </div>
    </div>
  )
}

export default function WorkloadDashboard() {
  const POSITIONS = [
    { position_id: 1, position_name: 'อาจารย์', short_name: 'อ.' },
    { position_id: 2, position_name: 'ผู้ช่วยศาสตราจารย์', short_name: 'ผศ.' },
    { position_id: 3, position_name: 'รองศาสตราจารย์', short_name: 'รศ.' },
    { position_id: 4, position_name: 'ศาสตราจารย์', short_name: 'ศ.' },
  ]

  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: session } = useSession()
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
          },
          session.accessToken
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
            selectedRoundId,
            session.accessToken
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
            selectedRoundId,
            session.accessToken
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
              session.accessToken,
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
              workloadGroupId,
              session.accessToken
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
            const mainTasksRes: any = await MainTaskServices.getAllMainTasks(session.accessToken, {
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
        let performanceExpected = 30
        const performanceComparison: CriteriaComparison[] = []
        let positionName = '-'

        try {
          const decodedToken = jwtDecode<any>(session.accessToken)
          const userPositionId = decodedToken?.position_id ?? null

          if (decodedToken?.position_name) {
            positionName = decodedToken.position_name
          } else if (userPositionId) {
            const matched = POSITIONS.find(p => p.position_id === userPositionId)
            if (matched) positionName = matched.position_name
          } else {
            positionName = decodedToken?.level_name ?? '-'
          }

          if (formlistId) {
            let evaluations: any[] = []

            try {
              const snapshotRes = await PerformanceService.getPerformanceSnapshot(formlistId, userId!, selectedRoundId, session.accessToken)
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
                  PerformanceService.getPerformanceEvaluation(formlistId, session.accessToken),
                  PerformanceService.getAllCompetencies(session.accessToken),
                  PerformanceService.getAllExpectedLevels(session.accessToken)
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
                PerformanceService.getAllCompetencies(session.accessToken),
                PerformanceEvaluationAssessmentService.getAverageAssessedLevels(session.accessToken, formlistId)
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
              const competencyRes = await PerformanceService.getAllCompetencies(session.accessToken)
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

  const calculatePerformanceScoreEvaluated = (data: Task[]) => {
    if (!Array.isArray(data)) return 0
    const totalPoints = data.slice(0, 5).reduce((sum, task) =>
      sum + Object.values(task.subtasks).reduce((subSum, subtask) =>
        subSum + subtask.form_infos.reduce((formSum, formInfo: any) => {
          if (formInfo.evaluation_score != null) {
            return formSum + Number(formInfo.evaluation_score)
          }
          return formSum
        }, 0), 0
      ), 0
    )
    const score = (totalPoints * 70) / 100
    return Math.min(70, score)
  }

  const handleExportPDF = async (evaluated: boolean = false) => {
    if (!userId || !selectedRoundId || !session?.accessToken || !dashboardData) return

    try {
      setExporting(true)

      // 1. ดึงข้อมูลเบื้องต้น
      const [termsRes, roundsRes, formlistResponse] = await Promise.all([
        WorkloadFormServices.getTerms(session.accessToken),
        SetAssessorServices.getAllRounds(session.accessToken),
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
      const mainTasksRes: any = await MainTaskServices.getAllMainTasks(session.accessToken, {
        page: 1, limit: 100, sort: 'task_id', order: 'asc'
      } as any)
      const mainTasks = Array.isArray(mainTasksRes?.payload) ? mainTasksRes.payload : (Array.isArray(mainTasksRes?.data) ? mainTasksRes.data : [])

      const masterTasks: Task[] = []
      for (const mt of mainTasks) {
        try {
          const subRes: any = await SubTaskServices.getSubTasksByTask(mt.task_id, session.accessToken)
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
      const perfSnapshotRes = await PerformanceService.getPerformanceSnapshot(formlist_id, userId, selectedRoundId, session.accessToken)
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
        userId
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

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-lg bg-white p-4 shadow transition-all duration-300 ease-in-out dark:bg-zinc-900">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-lg font-normal text-gray-700 dark:text-gray-200">
              ภาพรวมการประเมินภาระงานอาจารย์
            </h2>
          </div>

          <div className="flex flex-col items-end gap-2 sm:flex-row sm:items-center">
            <div className="relative w-full md:w-72" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex w-full items-center justify-between gap-3 rounded-md border border-gray-200 bg-white px-4 py-2.5 text-sm font-normal text-gray-700 dark:border-zinc-800 dark:bg-zinc-900 dark:text-gray-100"
              >
                <div className="flex items-center gap-2.5 truncate">
                  <Calendar className="h-4 w-4 text-blue-500" />
                  <span className="truncate">
                    {rounds.find(r => r.round_list_id === selectedRoundId)?.round_list_name || 'เลือกรอบการประเมิน'}
                  </span>
                </div>
                <ChevronDown className={`h-4 w-4 text-gray-400 ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {isDropdownOpen && (
                <div className="absolute left-0 right-0 z-50 mt-2 max-h-64 overflow-y-auto rounded-xl border border-gray-100 bg-white p-1.5 shadow-xl dark:border-zinc-800 dark:bg-zinc-900">
                  {rounds.length === 0 ? (
                    <div className="px-4 py-3 text-sm text-gray-500">ไม่พบรอบการประเมิน</div>
                  ) : (
                    rounds.map((round) => (
                      <button
                        key={round.round_list_id}
                        onClick={() => {
                          setSelectedRoundId(round.round_list_id)
                          setIsDropdownOpen(false)
                          const params = new URLSearchParams(searchParams.toString())
                          params.set('roundId', String(round.round_list_id))
                          router.replace(`?${params.toString()}`, { scroll: false })
                        }}
                        className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm ${selectedRoundId === round.round_list_id
                          ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                          : 'text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-zinc-800'
                          }`}
                      >
                        <span className="truncate font-medium">{round.round_list_name}</span>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>


      <div className="rounded-lg bg-white p-4 shadow transition-all duration-300 ease-in-out dark:bg-zinc-900">

        {hasFormInRound === false && !isLoading && !invalidRoundFromUrl && (
          <div className="mb-4 rounded-md bg-white p-6 dark:bg-zinc-900 dark:text-gray-400">
            <div className="flex flex-col items-center justify-center gap-4 py-8 text-center">
              <TriangleAlertIcon className="h-12 w-12 text-red-500 md:h-24 md:w-24" />
              <div className="">
                <h2 className="mb-2 text-4xl font-medium text-gray-700 dark:text-gray-300">
                  การประเมินสิ้นสุดแล้ว
                </h2>
                <p className="text-gray-500 dark:text-gray-400">
                  คุณไม่ได้ถูกกำหนดให้เป็นผู้ประเมินในรอบนี้
                </p>
                <p className="text-gray-500 dark:text-gray-400">
                  กรุณาติดต่อผู้ดูแลระบบหากคิดว่านี่เป็นข้อผิดพลาด
                </p>
              </div>
            </div>
          </div>
        )}

        {isUserAssigned === false && !isLoading && !invalidRoundFromUrl && (
          <div className="mb-4 rounded-md bg-white p-6 dark:bg-zinc-900 dark:text-gray-400">
            <div className="flex flex-col items-center justify-center gap-4 py-8 text-center">
              <CircleX className="h-12 w-12 text-red-500 md:h-24 md:w-24" />
              <div className="">
                <h2 className="mb-2 text-4xl font-normal text-gray-700 dark:text-gray-300">
                  ไม่พบรอบการประเมิน
                </h2>
                <p className="text-gray-500 dark:text-gray-400">
                  คุณไม่ได้ถูกกำหนดให้เป็นผู้รับการประเมินในรอบนี้
                </p>
                <p className="text-gray-500 dark:text-gray-400">
                  กรุณาติดต่อผู้ดูแลระบบหากคิดว่านี่เป็นข้อผิดพลาด
                </p>
              </div>
            </div>
          </div>
        )}


        {invalidRoundFromUrl && !isLoading && (
          <div className="mb-4 rounded-md bg-white p-6 shadow dark:bg-zinc-900 dark:text-gray-400">
            <div className="flex flex-col items-center justify-center gap-4 py-8 text-center">
              <TriangleAlertIcon className="h-12 w-12 text-red-500 md:h-24 md:w-24" />
              <div>
                <h2 className="mb-2 text-2xl md:text-4xl font-medium text-gray-700 dark:text-gray-300">
                  การประเมินสิ้นสุดแล้ว
                </h2>
                <p className="text-gray-500 dark:text-gray-400">
                  ไม่พบรอบการประเมินตามลิงก์ที่คุณเข้าถึง หรือคุณไม่ได้ถูกกำหนดให้เป็นผู้รับการประเมินในรอบนี้
                </p>
                <p className="text-gray-500 dark:text-gray-400">
                  กรุณาติดต่อผู้ดูแลระบบหากคิดว่านี่เป็นข้อผิดพลาด
                </p>
              </div>
            </div>
          </div>
        )}

        {hasError && !isLoading && !invalidRoundFromUrl && hasFormInRound !== false && (
          <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-900/20 dark:text-red-200">
            {error}
          </div>
        )}

        {!isLoading &&
          !hasError &&
          !invalidRoundFromUrl &&
          isUserAssigned === true &&
          hasFormInRound !== false &&
          dashboardData && (
            <>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-md border border-gray-100 p-4 flex flex-col justify-between">
                  <div className="mb-4">
                    <div className="text-md font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                      {/* รอบประเมิน {dashboardData.roundName} */}
                      การทำฟอร์มประเมินภาระงาน
                    </div>
                  </div>

                  <div className="flex flex-col items-center justify-center">
                    <div className="relative h-40 w-40">
                      <ReactApexChart
                        options={{
                          chart: {
                            type: 'radialBar',
                            animations: { enabled: false },
                            sparkline: { enabled: true },
                          },
                          labels: ['ความคืบหน้า'],
                          tooltip: { enabled: false },
                          plotOptions: {
                            radialBar: {
                              hollow: { size: '65%' },
                              track: { background: '#e5e7eb', strokeWidth: '100%' },
                              dataLabels: {
                                name: { show: false },
                                value: {
                                  show: true,
                                  fontSize: '20px',
                                  fontWeight: 700,
                                  color: '#1e293b',
                                  offsetY: 5,
                                  formatter: (val: number) => `${val.toFixed(0)}%`,
                                },
                              },
                            },
                          },
                          colors: [
                            dashboardData.status === 'COMPLETED'
                              ? '#10b981'
                              : dashboardData.status === 'PENDING_REVIEW'
                                ? '#f59e0b'
                                : dashboardData.status === 'IN_PROGRESS'
                                  ? '#3b82f6'
                                  : '#94a3b8',
                          ],
                          stroke: { lineCap: 'round' },
                        }}
                        series={[dashboardData.progressPercent]}
                        type="radialBar"
                        height={180}
                      />
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className={`inline-flex items-center rounded-md px-2 py-0.5 mt-10 text-[10px] font-normal uppercase tracking-tight ${statusBadgeColor(dashboardData.status)}`}>
                          {formatStatus(dashboardData.status)}
                        </span>
                      </div>
                    </div>
                    <div className="w-full flex flex-row items-center gap-2">
                      <p className="text-xs font-normal text-gray-400 dark:text-zinc-500 m-0">เกณฑ์ประเมินฟอร์มภาระงาน</p>
                      <div className="relative inline-block" ref={gradeInfoRef}>
                        <button
                          onClick={() => setShowGradeInfo(!showGradeInfo)}
                          className="flex items-center text-gray-400 hover:text-blue-500 transition-colors"
                        >
                          <Info className="h-4 w-4" />
                        </button>

                        {showGradeInfo && (
                          <div className="absolute left-0 top-6 z-50 w-64 rounded-md border border-gray-100 bg-white p-4 shadow-md dark:border-zinc-800 dark:bg-zinc-900 ">
                            <h4 className="mb-3 text-sm font-normal text-gray-700 dark:text-gray-200">เกณฑ์การวัดระดับคะแนน</h4>
                            <div className="flex flex-col gap-2.5">
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-normal text-emerald-600 dark:text-emerald-400">ดีเด่น</span>
                                <span className="text-xs text-gray-500">(90 - 100)</span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-normal text-blue-600 dark:text-blue-400">ดีมาก</span>
                                <span className="text-xs text-gray-500">(80 - 89.99)</span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-normal text-sky-600 dark:text-sky-400">ดี</span>
                                <span className="text-xs text-gray-500">(70 - 79.99)</span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-normal text-amber-600 dark:text-amber-400">พอใช้</span>
                                <span className="text-xs text-gray-500">(60 - 69.99)</span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-normal text-red-600 dark:text-red-400">ต้องปรับปรุง</span>
                                <span className="text-xs text-gray-500">(ต่ำกว่า 60)</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col lg:flex-row w-full gap-4 mt-4">
                      <GradeDisplay
                        label="เกณฑ์ที่คาดหวัง"
                        score={dashboardData.workloadScore.expected + dashboardData.performanceScore.expected}
                        title="ผลรวมคะแนนคาดหวัง"
                        colorClass="text-blue-700 bg-blue-50 dark:bg-blue-900/30 dark:text-blue-300"
                        borderClass="border-blue-100 dark:border-blue-800 w-full"
                        disabled={dashboardData.status === 'NOT_STARTED' || dashboardData.status === 'IN_PROGRESS'}
                      />
                      <GradeDisplay
                        label="เกณฑ์ที่ได้"
                        score={
                          dashboardData.workloadScore.actual !== null && dashboardData.performanceScore.assessed !== null
                            ? dashboardData.workloadScore.actual + dashboardData.performanceScore.assessed
                            : null
                        }
                        title="ผลรวมคะแนนที่ได้"
                        colorClass="text-emerald-700 bg-emerald-50 dark:bg-emerald-900/30 dark:text-emerald-300"
                        borderClass="border-emerald-100 dark:border-emerald-800 w-full"
                        disabled={dashboardData.status !== 'COMPLETED'}
                      />
                    </div>
                  </div>


                  <div className="mt-4 flex flex-col gap-2">
                    {(dashboardData.status === 'IN_PROGRESS' || dashboardData.status === 'PENDING_REVIEW' || dashboardData.status === 'COMPLETED') && (
                      <>
                        <button
                          onClick={() => handleExportPDF(false)}
                          disabled={exporting}
                          className="w-full inline-flex h-9 items-center justify-start gap-2 rounded-lg bg-red-500 px-4 text-xs font-medium text-white shadow-sm hover:bg-red-600 transition-colors duration-200 disabled:opacity-50"
                        >
                          <FileDown className="h-4 w-4" />
                          {exporting ? 'กำลังประมวลผล...' : 'ผลการประเมินภาระงาน'}
                        </button>

                        {dashboardData.status === 'COMPLETED' && (
                          <button
                            onClick={() => handleExportPDF(true)}
                            disabled={exporting}
                            className="w-full inline-flex h-9 items-center justify-start gap-2 rounded-lg border border-red-500 bg-white px-4 text-xs font-medium text-red-500 shadow-sm hover:bg-red-600 hover:text-white transition-colors duration-200 disabled:opacity-50"
                          >
                            <FileDown className="h-4 w-4" />
                            {exporting ? 'กำลังประมวลผล...' : 'คะแนนจากผู้ตรวจ'}
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>

                <div className="rounded-md border border-gray-100 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900 md:col-span-2">
                  <div className="mb-2">
                    <div className="text-md text-gray-500 dark:text-gray-400">
                      เปรียบเทียบคะแนนรวมจากการประเมินภาระงาน
                    </div>
                  </div>
                  <div className="mt-1">
                    {totalChartSeries.length > 0 && (
                      <ReactApexChart
                        options={totalChartOptions}
                        series={totalChartSeries}
                        type="bar"
                        height={350}
                      />
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-4 rounded-lg border border-gray-100 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
                <div className="mb-2">
                  <div className="text-md text-gray-500 dark:text-gray-400">
                    เปรียบเทียบคะแนนองค์ประกอบที่ 1 ผลสัมฤทธิ์ของงาน
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    ภาระงาน : <span className="text-blue-600 dark:text-blue-400">
                      {dashboardData.workloadGroupName || 'ไม่ได้ระบุ'}
                    </span>
                  </div>
                </div>
                <div className="mt-1">
                  {dashboardData.criteriaComparison?.length ? (
                    <ReactApexChart
                      options={comparisonChartOptions}
                      series={comparisonChartSeries}
                      type="bar"
                      height={380}
                    />
                  ) : (
                    <div className="rounded-md border border-dashed border-gray-300 p-4 text-center text-sm text-gray-500 dark:border-zinc-700 dark:text-gray-400">
                      ยังไม่มีข้อมูลการเปรียบเทียบคะแนน
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-4 rounded-lg border border-gray-100 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
                <div className="mb-2">
                  <div className="text-md text-gray-500 dark:text-gray-400">
                    เปรียบเทียบคะแนนองค์ประกอบที่ 2 พฤติกรรมการปฏิบัติงาน (สมรรถนะ)
                  </div>
                  {dashboardData.positionName && (
                    <div className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      ระดับตำแหน่งผู้รับการประเมิน : <span className="text-blue-600 dark:text-blue-400">{dashboardData.positionName}</span>
                    </div>
                  )}
                </div>
                <div className="mt-1">
                  {dashboardData.performanceComparison?.length ? (
                    <ReactApexChart
                      options={performanceComparisonChartOptions}
                      series={performanceComparisonChartSeries}
                      type="line"
                      height={400}
                    />
                  ) : (
                    <div className="rounded-md border border-dashed border-gray-300 p-4 text-center text-sm text-gray-500 dark:border-zinc-700 dark:text-gray-400">
                      ยังไม่มีข้อมูลการเปรียบเทียบคะแนน
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-4 flex flex-col gap-3 rounded-lg border border-gray-100 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
                <div className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  คำติชมจากผู้ประเมิน
                </div>
                {dashboardData.feedback?.length ? (
                  <div className="flex max-h-72 flex-col gap-3 overflow-y-auto pr-1 text-sm">
                    {dashboardData.feedback.map((fb, idx) => (
                      <div
                        key={idx}
                        className="rounded-md border border-gray-100 bg-gray-50 p-3 text-gray-700 dark:border-zinc-800 dark:bg-zinc-900/60 dark:text-gray-200"
                      >
                        <div className="mb-1 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                          <span>{fb.reviewerName ?? 'ผู้ประเมิน'}</span>
                          {fb.createdAt && (
                            <span>{new Date(fb.createdAt).toLocaleDateString('th-TH')}</span>
                          )}
                        </div>
                        <p className="text-sm leading-relaxed">{fb.comment}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-md border border-dashed border-gray-300 p-4 text-center text-sm text-gray-500 dark:border-zinc-700 dark:text-gray-400">
                    ยังไม่มีคำติชมจากผู้ประเมินในรอบนี้
                  </div>
                )}
              </div>
            </>
          )}
      </div>
    </div>
  )
}
