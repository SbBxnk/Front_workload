'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useQuery } from '@tanstack/react-query'
import { jwtDecode } from 'jwt-decode'
import AssesseeService from '@/services/assesseeService'
import WorkloadFormServices from '@/services/workloadFormServices'
import SetAssessorServices from '@/services/setAssessorServices'
import { useAssessor } from '@/hooks/useAssessor'
import useUtility from '@/hooks/useUtility'
import type { Assessee, AssesseeMeta } from '@/Types/assessee'
import type { DecodedToken } from '@/Types/decodetoken'

export type EvaluationStatus = 'not_started' | 'in_progress' | 'completed'

export type AssesseeWithProgress = Assessee & {
  formlist_id?: number
  form_status?: number | null
  evaluation_status?: EvaluationStatus
  workload_group_name?: string | null
}

interface FormListResult {
  assessees: AssesseeWithProgress[]
  meta: AssesseeMeta
  roundInfo: Record<string, unknown> | null
}

const DEFAULT_ROWS_PER_PAGE = 10

// อ่านค่า page/limit เริ่มต้นจาก query string (รองรับ refresh / แชร์ลิงก์)
function readPaginationFromUrl(): { page: number; limit: number } {
  if (typeof window === 'undefined') return { page: 1, limit: DEFAULT_ROWS_PER_PAGE }
  const url = new URLSearchParams(window.location.search)
  const pageFromUrl = parseInt(url.get('page') ?? '', 10)
  const limitFromUrl = parseInt(url.get('limit') ?? '', 10)
  return {
    page: !Number.isNaN(pageFromUrl) && pageFromUrl > 0 ? pageFromUrl : 1,
    limit: !Number.isNaN(limitFromUrl) && limitFromUrl > 0 ? limitFromUrl : DEFAULT_ROWS_PER_PAGE,
  }
}

function writePaginationToUrl(page: number, limit: number) {
  if (typeof window === 'undefined') return
  const url = new URLSearchParams(window.location.search)
  url.set('page', String(page))
  url.set('limit', String(limit))
  const queryString = url.toString()
  window.history.replaceState({}, '', `${window.location.pathname}${queryString ? `?${queryString}` : ''}`)
}

// ดึงข้อมูลรอบการประเมิน (เรียกครั้งเดียวต่อรอบ)
async function fetchRoundInfo(roundNumericId: number): Promise<Record<string, unknown> | null> {
  if (Number.isNaN(roundNumericId)) return null
  try {
    const roundResponse = await SetAssessorServices.getRoundListById(roundNumericId)
    const roundPayload = Array.isArray(roundResponse.payload)
      ? roundResponse.payload[0]
      : roundResponse.payload
    return (roundPayload as unknown as Record<string, unknown> | undefined) ?? null
  } catch (error) {
    console.error('Error fetching round details:', error)
    return null
  }
}

/**
 * เติมสถานะแบบฟอร์ม / สถานะการตรวจประเมิน ให้ผู้รับการประเมินแต่ละราย
 * โดย cache ผลตาม set_asses_info_id และ as_u_id เพื่อลดการเรียก API ซ้ำ
 */
async function enrichAssessees(
  assesseesData: Assessee[],
  roundNumericId: number
): Promise<AssesseeWithProgress[]> {
  const formlistCache = new Map<number, { formlist_id?: number; status: number | null }>()
  const fetchedFormlistUsers = new Set<number>()
  const evaluationStatusCache = new Map<
    number,
    { evaluation_status: EvaluationStatus; form_status: number | null }
  >()

  return Promise.all(
    assesseesData.map(async (assessee) => {
      let formlistId: number | undefined
      let formStatus: number | null | undefined = assessee.form_status
      let evaluationStatus: EvaluationStatus | undefined = assessee.evaluation_status

      // ใช้ set_asses_info_id แทน set_asses_list_id เพื่อตรวจสอบสถานะของ assessor เฉพาะคน
      if (assessee.set_asses_info_id) {
        const cachedEvaluation = evaluationStatusCache.get(assessee.set_asses_info_id)

        if (cachedEvaluation) {
          evaluationStatus = cachedEvaluation.evaluation_status
          formStatus = cachedEvaluation.form_status ?? formStatus ?? null
        } else if (evaluationStatus !== undefined && evaluationStatus !== null) {
          evaluationStatusCache.set(assessee.set_asses_info_id, {
            evaluation_status: evaluationStatus,
            form_status: formStatus ?? null,
          })
        } else {
          try {
            const statusRes = await WorkloadFormServices.getAssessorEvaluationStatus(
              assessee.set_asses_info_id
            )
            const statusPayload = Array.isArray(statusRes.payload)
              ? statusRes.payload[0]
              : statusRes.payload

            if (statusPayload) {
              evaluationStatus = statusPayload.evaluation_status
              formStatus = statusPayload.form_status ?? formStatus ?? null
              evaluationStatusCache.set(assessee.set_asses_info_id, {
                evaluation_status: evaluationStatus,
                form_status: formStatus ?? null,
              })
            }
          } catch (error) {
            console.error('Error fetching evaluation status:', error)
          }
        }
      }

      const cacheKey = assessee.set_asses_list_id ?? null
      const cachedFormlist = cacheKey !== null ? formlistCache.get(cacheKey) : undefined

      if (cachedFormlist) {
        formlistId = cachedFormlist.formlist_id
        formStatus = cachedFormlist.status ?? formStatus ?? null
      } else if (!fetchedFormlistUsers.has(assessee.as_u_id)) {
        fetchedFormlistUsers.add(assessee.as_u_id)
        try {
          const formlistRes = await WorkloadFormServices.getFormlistByUserAndRound(
            assessee.as_u_id,
            roundNumericId
          )
          const formlistPayload = Array.isArray(formlistRes.payload)
            ? formlistRes.payload
            : [formlistRes.payload]

          for (const item of formlistPayload) {
            if (item?.set_asses_list_id) {
              formlistCache.set(item.set_asses_list_id, {
                formlist_id: item.formlist_id,
                status: item.status ?? null,
              })
            }
          }

          if (cacheKey !== null) {
            const matchedFormlist = formlistCache.get(cacheKey)

            if (matchedFormlist) {
              formlistId = matchedFormlist.formlist_id
              formStatus = matchedFormlist.status ?? formStatus ?? null
            }
          }
        } catch (error) {
          console.error('Error fetching formlist info:', error)
          fetchedFormlistUsers.delete(assessee.as_u_id)
        }
      } else if (cacheKey !== null) {
        const cachedAfterFetch = formlistCache.get(cacheKey)

        if (cachedAfterFetch) {
          formlistId = cachedAfterFetch.formlist_id
          formStatus = cachedAfterFetch.status ?? formStatus ?? null
        }
      }

      return {
        ...assessee,
        formlist_id: formlistId,
        form_status: formStatus ?? null,
        evaluation_status: evaluationStatus ?? 'not_started',
      }
    })
  )
}

/**
 * จัดการ data-fetching + state ของหน้ารายการผู้รับการประเมินในรอบหนึ่ง
 * - guard สิทธิ์ผู้ประเมิน (assessor) และ redirect เมื่อไม่ผ่าน
 * - ดึงข้อมูลรอบ + รายชื่อผู้รับการประเมิน (พร้อมสถานะแบบฟอร์ม/การตรวจ) ผ่าน React Query
 * - sync page/limit กับ query string
 */
export function useFormList(roundId: string) {
  const { setBreadcrumbs } = useUtility()
  const { data: session, status } = useSession()
  const {
    isAssessor,
    loading: assessorLoading,
    isInitialized: assessorInitialized,
  } = useAssessor()
  const router = useRouter()

  const [page, setPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(DEFAULT_ROWS_PER_PAGE)
  const [isQueryInitialized, setIsQueryInitialized] = useState(false)

  // โหลดค่า page/limit จาก URL ครั้งแรกที่ mount
  useEffect(() => {
    if (isQueryInitialized) return
    const { page: pageFromUrl, limit: limitFromUrl } = readPaginationFromUrl()
    setPage(pageFromUrl)
    setRowsPerPage(limitFromUrl)
    setIsQueryInitialized(true)
  }, [isQueryInitialized])

  // รีเซ็ตหน้าเมื่อเปลี่ยนรอบ
  useEffect(() => {
    setPage(1)
  }, [roundId])

  // guard สิทธิ์ผู้ประเมิน
  useEffect(() => {
    if (status === 'loading' || assessorLoading || !assessorInitialized) return
    if (status === 'unauthenticated') {
      router.push('/login')
      return
    }
    if (!isAssessor) {
      router.push('/user')
    }
  }, [status, assessorLoading, assessorInitialized, isAssessor, router])

  const enabled =
    isQueryInitialized &&
    status === 'authenticated' &&
    !assessorLoading &&
    assessorInitialized &&
    isAssessor &&
    !!session?.accessToken &&
    !!roundId

  const query = useQuery<FormListResult>({
    queryKey: ['assessment-form-list', roundId, page, rowsPerPage],
    enabled,
    queryFn: async () => {
      const decoded: DecodedToken = jwtDecode(session!.accessToken as string)
      const roundNumericId = parseInt(roundId)
      const safePage = page > 0 ? page : 1
      const safeLimit = rowsPerPage > 0 ? rowsPerPage : DEFAULT_ROWS_PER_PAGE

      const roundInfo = await fetchRoundInfo(roundNumericId)

      const response = await AssesseeService.getAssesseesByRound(decoded.id, roundNumericId, {
        page: safePage,
        limit: safeLimit,
        sort: 'date_save',
        order: 'desc',
      })

      const responseMeta: AssesseeMeta = response.meta ?? {
        limit: safeLimit,
        page: safePage,
        sort: 'date_save',
        total_rows: response.payload?.length ?? 0,
        total_pages:
          safeLimit > 0
            ? Math.max(1, Math.ceil((response.payload?.length ?? 0) / safeLimit))
            : 1,
      }

      const enriched = await enrichAssessees(response.payload ?? [], roundNumericId)

      return {
        assessees: enriched,
        meta: responseMeta,
        roundInfo:
          enriched.length > 0
            ? { ...(roundInfo ?? {}), ...enriched[0] }
            : roundInfo,
      }
    },
  })

  const meta = query.data?.meta ?? null
  const assessees = query.data?.assessees ?? []
  const roundInfo = query.data?.roundInfo ?? null

  // sync page/limit กลับ URL + แก้ state ให้ตรงกับ meta จาก backend
  useEffect(() => {
    if (!meta) return
    writePaginationToUrl(meta.page, meta.limit)
    if (meta.page !== page) setPage(meta.page)
    if (meta.limit !== rowsPerPage) setRowsPerPage(meta.limit)
  }, [meta, page, rowsPerPage])

  // breadcrumbs ตามชื่อรอบ
  useEffect(() => {
    const roundName = (roundInfo?.round_list_name as string | undefined) || 'รายการผู้รับการประเมิน'
    setBreadcrumbs([
      { text: 'ตรวจประเมินภาระงาน', path: '/user/assessment' },
      { text: roundName, path: `/user/assessment/${roundId}` },
    ])
  }, [setBreadcrumbs, roundId, roundInfo?.round_list_name])

  const total = meta?.total_rows ?? assessees.length
  const totalPages = Math.max(1, meta?.total_pages ?? Math.ceil(total / rowsPerPage))

  // กันหน้าเกินช่วง
  useEffect(() => {
    if (page > totalPages) setPage(totalPages)
  }, [page, totalPages])

  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage)
  }, [])

  const handleRowsPerPageChange = useCallback((newRows: number) => {
    setRowsPerPage(newRows)
    setPage(1)
  }, [])

  const navigateToForm = useCallback(
    (row: AssesseeWithProgress) => {
      if (!row.formlist_id || !row.set_asses_info_id) return
      router.push(
        `/user/assessment/${roundId}/form-list/${row.formlist_id}/info/${row.set_asses_info_id}`
      )
    },
    [router, roundId]
  )

  return {
    assessees,
    roundInfo,
    total,
    page,
    rowsPerPage,
    totalPages,
    loadingData: query.isLoading || (enabled && query.isFetching && !query.data),
    error: query.isError ? 'เกิดข้อผิดพลาดในการดึงข้อมูล' : null,
    assessorLoading,
    isAssessor,
    assessorInitialized,
    handlePageChange,
    handleRowsPerPageChange,
    navigateToForm,
    goBackToList: () => router.push('/user/assessment'),
  }
}
