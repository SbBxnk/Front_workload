'use client'

import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useSession } from 'next-auth/react'
import { jwtDecode } from 'jwt-decode'
import SetAssessorServices from '@/services/setAssessorServices'
import type { RoundList } from '@/Types/setAssessor'
import type { SortOrder, SortState } from '@/components/Table'

export interface RoundAccessInfo {
  hasUserAssignment: boolean
  hasAssignedAssessor: boolean
}

interface RoundParams {
  search: string
  page: number
  limit: number
  sort: string
  order: string
  year: string
}

const DEFAULT_PARAMS: RoundParams = {
  search: '',
  page: 1,
  limit: 10,
  sort: '',
  order: '',
  year: '',
}

const NO_ACCESS: RoundAccessInfo = {
  hasUserAssignment: false,
  hasAssignedAssessor: false,
}

// แปลง access token เป็น userId (number) — รองรับทั้งกรณี id เป็น number/string
function decodeUserId(accessToken?: string): number | null {
  if (!accessToken) return null
  try {
    const decoded = jwtDecode<{ id?: number | string }>(accessToken)
    const id = decoded?.id
    if (typeof id === 'number') return id
    if (typeof id === 'string') {
      const parsed = Number(id)
      return Number.isFinite(parsed) ? parsed : null
    }
    return null
  } catch (error) {
    console.error('Error decoding access token:', error)
    return null
  }
}

// อ่านค่าเริ่มต้นจาก query string (รองรับ refresh / แชร์ลิงก์)
function readParamsFromUrl(): RoundParams {
  if (typeof window === 'undefined') return DEFAULT_PARAMS
  const url = new URLSearchParams(window.location.search)
  return {
    search: url.get('search') ?? '',
    page: Number(url.get('page') ?? 1),
    limit: Number(url.get('limit') ?? 10),
    sort: url.get('sort') ?? '',
    order: url.get('order') ?? '',
    year: url.get('year') ?? '',
  }
}

function writeParamsToUrl(params: RoundParams) {
  if (typeof window === 'undefined') return
  const url = new URLSearchParams()
  if (params.search) url.set('search', params.search)
  if (params.page) url.set('page', String(params.page))
  if (params.limit) url.set('limit', String(params.limit))
  if (params.sort) url.set('sort', params.sort)
  if (params.order) url.set('order', params.order)
  if (params.year) url.set('year', params.year)
  window.history.replaceState({}, '', `?${url.toString()}`)
}

/**
 * จัดการ state ของรายการรอบประเมินภาระงาน (ค้นหา/หน้า/เรียงลำดับ/ปี)
 * + ดึงข้อมูลรอบและสิทธิ์เข้าถึงต่อรอบผ่าน React Query
 * คืนค่าให้ page นำไปแสดงผลได้ทันที โดยไม่ต้องรู้รายละเอียดการ fetch
 */
export function useWorkloadRounds() {
  const { data: session } = useSession()
  const accessToken = session?.accessToken
  const userId = decodeUserId(accessToken)

  const [params, setParams] = useState<RoundParams>(DEFAULT_PARAMS)
  const [searchInput, setSearchInput] = useState('')

  // โหลดค่าจาก URL ครั้งแรกที่ mount
  useEffect(() => {
    const fromUrl = readParamsFromUrl()
    setParams(fromUrl)
    setSearchInput(fromUrl.search)
  }, [])

  // ค้นหาแบบ debounce 500ms แล้วรีเซ็ตกลับหน้าแรก
  useEffect(() => {
    const timer = setTimeout(() => {
      setParams((prev) => ({ ...prev, search: searchInput.trim(), page: 1 }))
    }, 500)
    return () => clearTimeout(timer)
  }, [searchInput])

  // sync ค่ากลับ URL ทุกครั้งที่ params เปลี่ยน
  useEffect(() => {
    writeParamsToUrl(params)
  }, [params])

  const roundsQuery = useQuery({
    queryKey: ['workload-rounds', params],
    queryFn: () =>
      SetAssessorServices.getAllRoundLists({
        search: params.search,
        page: params.page,
        limit: params.limit,
        sort: params.sort || 'date_save',
        order: params.order,
        year: params.year,
      }),
    enabled: Boolean(accessToken),
  })

  const rounds = roundsQuery.data?.payload ?? []
  const total = roundsQuery.data?.meta?.total_rows ?? rounds.length

  // ดึงสิทธิ์เข้าถึงต่อรอบ (ขึ้นกับรายการรอบที่โหลดมาได้ + userId)
  const roundIds = rounds.map((r) => r.round_list_id)
  const accessQuery = useQuery({
    queryKey: ['workload-rounds-access', userId, roundIds],
    queryFn: async () => {
      const results = await Promise.all(
        rounds.map(async (round) => {
          try {
            const res = await SetAssessorServices.checkUserAccessToRound(
              userId as number,
              round.round_list_id
            )
            if (res.success && Array.isArray(res.payload)) {
              return {
                id: round.round_list_id,
                info: {
                  hasUserAssignment: res.payload.length > 0,
                  hasAssignedAssessor: res.payload.some(
                    (record: any) => record.ex_u_id !== null
                  ),
                } as RoundAccessInfo,
              }
            }
          } catch (error) {
            console.error(
              `Error checking user access for round ${round.round_list_id}:`,
              error
            )
          }
          return { id: round.round_list_id, info: NO_ACCESS }
        })
      )
      return results.reduce<Record<number, RoundAccessInfo>>((acc, cur) => {
        acc[cur.id] = cur.info
        return acc
      }, {})
    },
    enabled: Boolean(accessToken) && Boolean(userId) && rounds.length > 0,
  })

  const roundAccessInfo = accessQuery.data ?? {}

  // ===== derived =====
  const totalPages = Math.ceil(total / params.limit)
  const uniqueYears = Array.from(new Set(rounds.map((item) => item.year)))
  const selectedLabel =
    rounds.find((pos) => pos.year === params.year)?.year || 'เลือกรอบการประเมิน'
  const sortState: SortState = {
    column: params.sort || null,
    order: (params.order as SortOrder) || null,
  }
  const errorMessage = accessToken
    ? roundsQuery.isError
      ? 'เกิดข้อผิดพลาดในการโหลดข้อมูล'
      : ''
    : 'กรุณาเข้าสู่ระบบก่อน'

  // ===== handlers =====
  const handleSearchChange = (value: string) => setSearchInput(value)

  const clearSearch = () => {
    setSearchInput('')
    setParams((prev) => ({ ...prev, search: '', page: 1 }))
  }

  // หมายเหตุ: Table ใช้ page เริ่มที่ 0, API เริ่มที่ 1
  const handlePageChange = (newPage: number) =>
    setParams((prev) => ({ ...prev, page: newPage + 1 }))

  const handleRowsPerPageChange = (limit: number) =>
    setParams((prev) => ({ ...prev, limit, page: 1 }))

  const handleYearSelect = (value: string) =>
    setParams((prev) => ({ ...prev, year: value, page: 1 }))

  const handleSort = (column: string, order: SortOrder) =>
    setParams((prev) => ({
      ...prev,
      sort: order ? column : '',
      order: order ?? '',
      page: 1,
    }))

  const refetch = () => roundsQuery.refetch()

  return {
    rounds: rounds as RoundList[],
    total,
    totalPages,
    currentPage: params.page - 1,
    rowsPerPage: params.limit,
    isLoading: roundsQuery.isLoading,
    error: errorMessage,
    roundAccessInfo,
    searchInput,
    sortState,
    selectedLabel,
    uniqueYears,
    handleSearchChange,
    clearSearch,
    handlePageChange,
    handleRowsPerPageChange,
    handleYearSelect,
    handleSort,
    refetch,
  }
}
