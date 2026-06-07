'use client'

import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useSession } from 'next-auth/react'
import { jwtDecode } from 'jwt-decode'
import AssessorServices from '@/services/assessorService'
import AssesseeService from '@/services/assesseeService'
import type { RoundList } from '@/Types/assessor'
import type { DecodedToken } from '@/Types/decodetoken'
import type { SortOrder, SortState } from '@/components/Table'

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

// เติมจำนวนผู้รับการประเมินให้แต่ละรอบ โดยยิงทีละรอบแบบขนาน
async function withAssesseeCount(
  assessorId: number,
  rounds: RoundList[]
): Promise<RoundList[]> {
  return Promise.all(
    rounds.map(async (round) => {
      try {
        const res = await AssesseeService.getAssesseesByRound(
          assessorId,
          round.round_list_id
        )
        const formCount = res.meta?.total_rows ?? res.payload?.length ?? 0
        return { ...round, form_count: formCount }
      } catch (error) {
        console.error(
          `Error fetching assessees for round ${round.round_list_id}:`,
          error
        )
        return { ...round, form_count: 0 }
      }
    })
  )
}

/**
 * จัดการ state ของรายการรอบประเมินฝั่งผู้ประเมิน (ค้นหา/ปี/หน้า/เรียงลำดับ)
 * + ดึงข้อมูลผ่าน React Query แล้วเติมจำนวนผู้รับการประเมินให้แต่ละรอบ
 * คืนค่าให้ page นำไปแสดงผลได้ทันที โดยไม่ต้องรู้รายละเอียดการ fetch
 */
export function useAssessmentRounds() {
  const { data: session } = useSession()
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

  const accessToken = session?.accessToken

  const query = useQuery({
    queryKey: ['assessment-rounds', params],
    enabled: Boolean(accessToken),
    queryFn: async () => {
      const decoded: DecodedToken = jwtDecode(accessToken as string)
      const response = await AssessorServices.checkRound({
        search: params.search,
        page: String(params.page),
        limit: String(params.limit),
        sort: params.sort,
        order: params.order,
        year: params.year,
      })

      const payload = Array.isArray(response.payload) ? response.payload : []
      const rounds = await withAssesseeCount(decoded.id, payload)

      return {
        rounds,
        total: response.meta?.total_rows ?? rounds.length,
      }
    },
  })

  const rounds = query.data?.rounds ?? []
  const total = query.data?.total ?? 0
  const totalPages = Math.ceil(total / params.limit)
  const isLoading = Boolean(accessToken) && query.isLoading

  const error = !accessToken
    ? 'กรุณาเข้าสู่ระบบก่อน'
    : query.isError
      ? 'เกิดข้อผิดพลาดในการโหลดข้อมูล'
      : ''

  const sortState: SortState = {
    column: params.sort || null,
    order: (params.order as SortOrder) || null,
  }

  // ตัวเลือกปีจากข้อมูลที่โหลดมา
  const years = Array.from(new Set(rounds.map((item) => item.year)))
  const selectedLabel =
    rounds.find((r) => r.year.toString() === params.year)?.year?.toString() ||
    'เลือกรอบการประเมิน'

  const handleSearchChange = (value: string) => setSearchInput(value)

  const handlePageChange = (page: number) =>
    setParams((prev) => ({ ...prev, page: page + 1 }))

  const handleRowsPerPageChange = (limit: number) =>
    setParams((prev) => ({ ...prev, limit, page: 1 }))

  const handleYearSelect = (year: string) =>
    setParams((prev) => ({ ...prev, year, page: 1 }))

  const handleSort = (column: string, order: SortOrder) =>
    setParams((prev) => ({
      ...prev,
      sort: order ? column : '',
      order: order ?? '',
      page: 1,
    }))

  return {
    rounds,
    total,
    totalPages,
    isLoading,
    error,
    // Table ใช้ index หน้าแบบเริ่มที่ 0
    page: params.page - 1,
    rowsPerPage: params.limit,
    searchInput,
    sortState,
    years,
    selectedLabel,
    handleSearchChange,
    handlePageChange,
    handleRowsPerPageChange,
    handleYearSelect,
    handleSort,
  }
}
