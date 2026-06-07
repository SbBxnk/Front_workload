'use client'

import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import SetAssessorServices from '@/services/setAssessorServices'
import type { RoundList } from '@/Types/setAssessor'
import type { SortOrder, SortState } from '@/components/Table'

export interface RoundListParams {
  search: string
  page: number
  limit: number
  sort: string
  order: string
  year: string
}

const DEFAULT_PARAMS: RoundListParams = {
  search: '',
  page: 1,
  limit: 10,
  sort: '',
  order: '',
  year: '',
}

// อ่านค่าเริ่มต้นจาก query string (รองรับ refresh / แชร์ลิงก์)
function readParamsFromUrl(): RoundListParams {
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

function writeParamsToUrl(params: RoundListParams) {
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

// ตรวจว่ารอบนี้มีข้อมูลผู้ประเมินแล้วหรือยัง (ใช้ปิดปุ่มลบ)
async function checkRoundHasAssessorData(roundListId: number): Promise<boolean> {
  try {
    const response =
      await SetAssessorServices.getSetAssessorListByRound(roundListId)
    return (
      Array.isArray(response.payload) && response.payload.length > 0
    )
  } catch (error) {
    console.error(
      `Error checking assessor data for round ${roundListId}:`,
      error
    )
    return false
  }
}

/**
 * จัดการ state ของตารางรอบการประเมิน (ค้นหา/หน้า/เรียงลำดับ/ปีกรอง) + ดึงข้อมูลผ่าน React Query
 * รวมถึงตรวจรอบที่มีผู้ประเมินแล้ว (roundsWithAssessorData) คืนค่าให้ page นำไปแสดงผลได้ทันที
 */
export function useRoundList() {
  const [params, setParams] = useState<RoundListParams>(DEFAULT_PARAMS)
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

  const query = useQuery({
    queryKey: ['roundLists', params],
    queryFn: () =>
      SetAssessorServices.getAllRoundLists({
        search: params.search,
        page: params.page,
        limit: params.limit,
        sort: params.sort || 'date_save',
        order: params.order,
        year: params.year,
      }),
  })

  const rounds: RoundList[] = query.data?.payload ?? []

  // ตรวจรอบที่มีผู้ประเมินแล้ว (parallel) อิงตามผลลัพธ์ list ปัจจุบัน
  const assessorQuery = useQuery({
    queryKey: ['roundsWithAssessorData', rounds.map((r) => r.round_list_id)],
    enabled: rounds.length > 0,
    queryFn: async () => {
      const results = await Promise.all(
        rounds.map((round) => checkRoundHasAssessorData(round.round_list_id))
      )
      return rounds
        .filter((_, index) => results[index])
        .map((round) => round.round_list_id)
    },
  })

  const meta = query.data?.meta
  const total = meta?.total_rows ?? rounds.length
  const sortState: SortState = {
    column: params.sort || null,
    order: (params.order as SortOrder) || null,
  }

  const handleSearchChange = (value: string) => setSearchInput(value)

  const clearSearch = () => setSearchInput('')

  const handlePageChange = (page: number) =>
    setParams((prev) => ({ ...prev, page }))

  const handleRowsPerPageChange = (limit: number) =>
    setParams((prev) => ({ ...prev, limit, page: 1 }))

  const handleSort = (column: string, order: SortOrder) =>
    setParams((prev) => ({
      ...prev,
      sort: order ? column : '',
      order: order ?? '',
      page: 1,
    }))

  const handleYearChange = (year: string) =>
    setParams((prev) => ({ ...prev, year, page: 1 }))

  return {
    rounds,
    total,
    totalPages: meta?.total_pages ?? Math.ceil(total / params.limit),
    isLoading: query.isLoading,
    params,
    searchInput,
    sortState,
    roundsWithAssessorData: assessorQuery.data ?? [],
    handleSearchChange,
    clearSearch,
    handlePageChange,
    handleRowsPerPageChange,
    handleSort,
    handleYearChange,
  }
}
