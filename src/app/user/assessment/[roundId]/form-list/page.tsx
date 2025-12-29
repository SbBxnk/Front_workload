'use client'

import { useSession } from 'next-auth/react'
import { useAssessor } from '@/hooks/useAssessor'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Eye, NotebookText } from 'lucide-react'
import AssesseeService, { type Assessee, type AssesseeMeta } from '@/services/assesseeService'
import WorkloadFormServices from '@/services/workloadFormServices'
import SetAssessorServices from '@/services/setAssessorServices'
import { jwtDecode } from 'jwt-decode'
import type { DecodedToken } from '@/Types/decodetoken'
import useUtility from '@/hooks/useUtility'
import Table, { type TableColumn } from '@/components/Table'

export default function AssessmentRoundPage() {
  const { setBreadcrumbs } = useUtility()
  const { data: session, status } = useSession()
  const { isAssessor, loading: assessorLoading, isInitialized: assessorInitialized } = useAssessor()
  const router = useRouter()
  const params = useParams()
  const roundId = params?.roundId as string

  type AssesseeWithProgress = Assessee & {
    formlist_id?: number
    form_status?: number | null
    evaluation_status?: 'not_started' | 'in_progress' | 'completed'
    workload_group_name?: string | null
  }

  const [assessees, setAssessees] = useState<AssesseeWithProgress[]>([])
  const [loadingData, setLoadingData] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [roundInfo, setRoundInfo] = useState<any>(null)
  const [meta, setMeta] = useState<AssesseeMeta | null>(null)
  const [page, setPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [isQueryInitialized, setIsQueryInitialized] = useState(false)
  const roundDetailsFetchedRef = useRef<string | null>(null)

  const fetchRoundDetails = useCallback(async (accessToken: string, roundNumericId: number) => {
    if (!accessToken || Number.isNaN(roundNumericId)) return

    try {
      const roundResponse = await SetAssessorServices.getRoundListById(roundNumericId, accessToken)
      const roundPayload = Array.isArray(roundResponse.payload) ? roundResponse.payload[0] : roundResponse.payload

      if (roundPayload) {
        setRoundInfo((prev: any) => ({
          ...prev,
          ...roundPayload,
        }))
      }
    } catch (error) {
      console.error('Error fetching round details:', error)
    }
  }, [])

  useEffect(() => {
    setBreadcrumbs(
      [
        { text: 'ตรวจประเมินภาระงาน', path: '/user/assessment' },
        { text: `${roundInfo?.round_list_name || 'รายการผู้รับการประเมิน'}`, path: `/user/assessment/${roundId}` },
      ])
  }, [setBreadcrumbs, roundId, roundInfo?.round_list_name])

  const updateUrlParams = useCallback((newParams: { page?: number; limit?: number }) => {
    if (typeof window === 'undefined') return

    const searchParams = new URLSearchParams(window.location.search)

    if (newParams.page !== undefined) {
      searchParams.set('page', newParams.page.toString())
    }

    if (newParams.limit !== undefined) {
      searchParams.set('limit', newParams.limit.toString())
    }

    const queryString = searchParams.toString()
    const nextUrl = queryString ? `?${queryString}` : ''

    window.history.replaceState({}, '', `${window.location.pathname}${nextUrl}`)
  }, [])

  useEffect(() => {
    if (isQueryInitialized) return
    if (typeof window === 'undefined') return

    const searchParams = new URLSearchParams(window.location.search)
    const pageFromUrl = parseInt(searchParams.get('page') ?? '', 10)
    const limitFromUrl = parseInt(searchParams.get('limit') ?? '', 10)

    if (!Number.isNaN(pageFromUrl) && pageFromUrl > 0) {
      setPage(pageFromUrl)
    }

    if (!Number.isNaN(limitFromUrl) && limitFromUrl > 0) {
      setRowsPerPage(limitFromUrl)
    }

    setIsQueryInitialized(true)
  }, [isQueryInitialized])

  const fetchAssessees = useCallback(async (pageParam: number, limitParam: number) => {
    if (!session?.accessToken || !roundId) return

    try {
      setLoadingData(true)
      setError(null)

      const decoded: DecodedToken = jwtDecode(session.accessToken)
      const roundNumericId = parseInt(roundId)

      if (roundDetailsFetchedRef.current !== roundId) {
        await fetchRoundDetails(session.accessToken as string, roundNumericId)
        roundDetailsFetchedRef.current = roundId
      }

      const safePage = pageParam > 0 ? pageParam : 1
      const safeLimit = limitParam > 0 ? limitParam : rowsPerPage

      const response = await AssesseeService.getAssesseesByRound(
        decoded.id,
        roundNumericId,
        session.accessToken,
        {
          page: safePage,
          limit: safeLimit,
          sort: 'date_save',
          order: 'desc',
        }
      )

      const responseMeta: AssesseeMeta = response.meta ?? {
        limit: safeLimit,
        page: safePage,
        sort: 'date_save',
        total_rows: response.payload?.length ?? 0,
        total_pages: safeLimit > 0 ? Math.max(1, Math.ceil((response.payload?.length ?? 0) / safeLimit)) : 1,
      }
      setMeta(responseMeta)
      updateUrlParams({ page: responseMeta.page, limit: responseMeta.limit })

      if (responseMeta.page !== page) {
        setPage(responseMeta.page)
      }

      if (responseMeta.limit !== rowsPerPage) {
        setRowsPerPage(responseMeta.limit)
      }

      const assesseesData = response.payload ?? []

      const formlistCache = new Map<number, { formlist_id?: number; status: number | null }>()
      const fetchedFormlistUsers = new Set<number>()
      const evaluationStatusCache = new Map<number, { evaluation_status: 'not_started' | 'in_progress' | 'completed'; form_status: number | null }>()

      const enrichedAssessees = await Promise.all(
        assesseesData.map(async (assessee) => {
          let formlistId: number | undefined
          let formStatus: number | null | undefined = assessee.form_status
          let evaluationStatus: 'not_started' | 'in_progress' | 'completed' | undefined = assessee.evaluation_status

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
                  assessee.set_asses_info_id,
                  session.accessToken as string
                )
                const statusPayload = Array.isArray(statusRes.payload) ? statusRes.payload[0] : statusRes.payload

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
                roundNumericId,
                session.accessToken as string
              )
              const formlistPayload = Array.isArray(formlistRes.payload) ? formlistRes.payload : [formlistRes.payload]

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

      setAssessees(enrichedAssessees)

      if (enrichedAssessees.length > 0) {
        setRoundInfo((prev: any) => ({
          ...prev,
          ...enrichedAssessees[0],
        }))
      }
    } catch (err) {
      console.error('Error fetching assessees:', err)
      setAssessees([])
      setError('เกิดข้อผิดพลาดในการดึงข้อมูล')
      roundDetailsFetchedRef.current = null
    } finally {
      setLoadingData(false)
    }
  }, [fetchRoundDetails, roundId, rowsPerPage, session?.accessToken, updateUrlParams, page])

  useEffect(() => {
    if (!isQueryInitialized || status === 'loading' || assessorLoading || !assessorInitialized) return

    if (status === 'unauthenticated') {
      router.push('/login')
      return
    }

    if (!isAssessor) {
      router.push('/user')
      return
    }

    void fetchAssessees(page, rowsPerPage)
  }, [status, assessorLoading, assessorInitialized, isAssessor, fetchAssessees, router, page, rowsPerPage, isQueryInitialized])

  useEffect(() => {
    roundDetailsFetchedRef.current = null
    setMeta(null)
    setAssessees([])
    setPage(1)
    setError(null)
  }, [roundId])

  const total = meta?.total_rows ?? assessees.length
  const totalPages = Math.max(1, meta?.total_pages ?? Math.ceil(total / rowsPerPage))

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages)
    }
  }, [page, totalPages])

  const currentData = useMemo(() => assessees, [assessees])

  const handlePageChange = (newPage: number) => {
    setPage(newPage)
  }

  const handleRowsPerPageChange = (newRows: number) => {
    setRowsPerPage(newRows)
    setPage(1)
  }

  const renderFormStatusBadge = (status: number | null | undefined) => {
    if (!status || status <= 0) {
      return <span className="inline-flex px-2 py-1 text-xs font-normal rounded-md bg-gray-200 text-gray-500">ยังไม่ได้เริ่ม</span>
    }

    if (status === 1) {
      return <span className="inline-flex px-2 py-1 text-xs font-normal rounded-md bg-success text-white">ส่งแล้ว</span>
    }

    return <span className="inline-flex px-2 py-1 text-xs font-normal rounded-md bg-success text-white">ส่งแล้ว</span>
  }

  const renderEvaluationStatusBadge = (status: 'not_started' | 'in_progress' | 'completed' | undefined) => {
    switch (status) {
      case 'completed':
        return <span className="inline-flex px-2 py-1 text-xs font-normal rounded-md bg-success text-white">เสร็จสิ้น</span>
      case 'in_progress':
        return <span className="inline-flex px-2 py-1 text-xs font-normal rounded-md bg-blue-500 text-white">กำลังตรวจ</span>
      default:
        return <span className="inline-flex px-2 py-1 text-xs font-normal rounded-md bg-gray-200 text-gray-500">ยังไม่ตรวจ</span>
    }
  }

  const columns = useMemo<TableColumn<AssesseeWithProgress>[]>(() => [
    {
      key: 'index',
      label: '#',
      width: '60px',
      align: 'center',
      render: (_value, _row, index) => (
        <span className="font-regular text-sm text-gray-600 dark:text-gray-300">
          {(page - 1) * rowsPerPage + index + 1}
        </span>
      ),
    },
    {
      key: 'assessee',
      label: 'ผู้รับการประเมิน',
      render: (_value, row) => (
        <div className="space-y-1 text-left">
          <div className="text-sm font-light text-gray-500 dark:text-gray-300">
            {row.prefix_name} {row.u_fname} {row.u_lname}
          </div>
        </div>
      ),
    },
    {
      key: 'position_name',
      label: 'ตำแหน่งวิชาการ',
      render: (value) => (
        <span className="text-sm font-light text-gray-500 dark:text-gray-400">{value || '-'}</span>
      ),
    },
    {
      key: 'ex_position_name',
      label: 'ตำแหน่งบริหาร',
      render: (value) => (
        <span className="text-sm font-light text-gray-500 dark:text-gray-400">{value || '-'}</span>
      ),
    },
    {
      key: 'workload_group_name',
      label: 'กลุ่มภาระงาน',
      render: (value) => (
        <span className="text-sm font-light text-gray-500 dark:text-gray-400">{value || '-'}</span>
      ),
    },
    {
      key: 'form_status',
      label: 'สถานะผู้รับการประเมิน',
      align: 'left',
      render: (_value, row) => (
        <span className="text-left text-sm font-light text-gray-500 dark:text-gray-400">
          {renderFormStatusBadge(row.form_status)}
        </span>
      ),
    },
    {
      key: 'evaluation_status',
      label: 'สถานะตรวจประเมิน',
      align: 'left',
      render: (_value, row) => (
        <span className="text-left text-sm font-light text-gray-500 dark:text-gray-400">
          {renderEvaluationStatusBadge(row.evaluation_status)}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'จัดการ',
      align: 'center',
      render: (_value, row) => {
        const formStatus = row.form_status ?? null
        const canAccess = formStatus !== null && formStatus >= 1 && row.formlist_id

        const navigateToForm = () => {
          if (!row.formlist_id || !row.set_asses_info_id) return
          router.push(
            `/user/assessment/${roundId}/form-list/${row.formlist_id}/info/${row.set_asses_info_id}`
          )
        }

        return (
          <div className="flex w-full justify-center gap-2 p-0">
            {!canAccess ? (
              <button
                type="button"
                disabled
                className="cursor-default rounded-md p-1 text-gray-300 transition-colors dark:text-gray-600"
                title="รอผู้รับการประเมินส่งแบบฟอร์ม"
              >
                <NotebookText className="h-4 w-4" />
              </button>
            ) : row.evaluation_status === 'completed' ? (
              <button
                type="button"
                onClick={navigateToForm}
                className="cursor-pointer rounded-md p-1 text-blue-500 transition-colors hover:bg-blue-500 hover:text-white"
                title="ดูผลการประเมิน"
              >
                <Eye className="h-4 w-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={navigateToForm}
                className="cursor-pointer rounded-md p-1 text-emerald-500 transition-colors hover:bg-emerald-500 hover:text-white"
                title="เริ่มประเมิน"
              >
                <NotebookText className="h-4 w-4" />
              </button>
            )}
          </div>
        )
      },
    },
  ], [page, rowsPerPage, renderFormStatusBadge, renderEvaluationStatusBadge, router, roundId])

  if (assessorInitialized && !isAssessor) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">ไม่พบข้อมูลการประเมิน</h1>
          <p className="text-gray-600">คุณไม่มีสิทธิ์เข้าถึงหน้านี้</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">เกิดข้อผิดพลาด</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => router.push('/user/assessment')}
            className="bg-business1 text-white px-4 py-2 rounded-md hover:bg-business1/90 transition-colors"
          >
            กลับไปหน้ารายการ
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-md bg-white p-4 shadow transition-all duration-300 ease-in-out dark:bg-zinc-900 dark:text-gray-400">
      <div className="mb-4">
        {loadingData || assessorLoading ? (
          <div className="space-y-2">
            <div className="skeleton animate-pulse dark:bg-zinc-700 h-6 w-48 rounded-md"></div>
          </div>
        ) : (
          <>
            <h2 className="text-xl font-normal text-gray-700 dark:text-gray-300">
              {roundInfo?.round_list_name ?? 'รอบการประเมินภาระงาน'}
            </h2>
          </>
        )}
      </div>
      <div className="mb-4 flex items-end justify-between">
      <div className="flex w-full flex-wrap items-end gap-4 md:w-auto">
          {loadingData ? (
            <div className="skeleton h-7 w-16 rounded-md"></div>
          ) : (
            <div className="w-auto rounded-md bg-gray-200 px-2 py-1 text-sm font-normal text-business1 dark:text-blue-500 dark:bg-zinc-800">
              {total} รายการ
            </div>
          )}
        </div>
        </div>
      <Table
        data={currentData}
        columns={columns}
        loading={loadingData}
        total={total}
        currentPage={page}
        totalPages={totalPages}
        rowsPerPage={rowsPerPage}
        onPageChange={handlePageChange}
        onRowsPerPageChange={handleRowsPerPageChange}
        emptyMessage="คุณยังไม่มีผู้รับการประเมินในรอบนี้"
        skeletonRows={rowsPerPage}
        rowsPerPageOptions={[5, 10, 20, 50]}
      />
    </div>
  )
}
