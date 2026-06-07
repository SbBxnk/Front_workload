'use client'

import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import MainTaskServices from '@/services/mainTaskServices'
import type { MainTaskSearchParams } from '@/Types'
import type { SortOrder, SortState } from '@/components/Table'

const DEFAULT_PARAMS: MainTaskSearchParams = {
  search: '',
  page: 1,
  limit: 10,
  sort: '',
  order: '',
}

// อ่านค่าเริ่มต้นจาก query string (รองรับ refresh / แชร์ลิงก์)
function readParamsFromUrl(): MainTaskSearchParams {
  if (typeof window === 'undefined') return DEFAULT_PARAMS
  const url = new URLSearchParams(window.location.search)
  return {
    search: url.get('search') ?? '',
    page: Number(url.get('page') ?? 1),
    limit: Number(url.get('limit') ?? 10),
    sort: url.get('sort') ?? '',
    order: url.get('order') ?? '',
  }
}

function writeParamsToUrl(params: MainTaskSearchParams) {
  if (typeof window === 'undefined') return
  const url = new URLSearchParams()
  if (params.search) url.set('search', params.search)
  if (params.page) url.set('page', String(params.page))
  if (params.limit) url.set('limit', String(params.limit))
  if (params.sort) url.set('sort', params.sort)
  if (params.order) url.set('order', params.order)
  window.history.replaceState({}, '', `?${url.toString()}`)
}

/**
 * จัดการ state ของตารางภาระงานหลัก (ค้นหา/หน้า/เรียงลำดับ) + ดึงข้อมูลผ่าน React Query
 */
export function useMainTaskList() {
  const [params, setParams] = useState<MainTaskSearchParams>(DEFAULT_PARAMS)
  const [searchInput, setSearchInput] = useState('')

  // โหลดค่าจาก URL ครั้งแรกที่ mount
  useEffect(() => {
    const fromUrl = readParamsFromUrl()
    setParams(fromUrl)
    setSearchInput(fromUrl.search ?? '')
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
    queryKey: ['mainTasks', params],
    queryFn: () => MainTaskServices.getAllMainTasks(params),
  })

  const meta = query.data?.meta
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

  return {
    mainTasks: query.data?.payload ?? [],
    total: meta?.total_rows ?? 0,
    totalPages: meta?.total_pages ?? 0,
    isLoading: query.isLoading,
    params: {
      page: params.page ?? 1,
      limit: params.limit ?? 10,
    },
    searchInput,
    sortState,
    handleSearchChange,
    clearSearch,
    handlePageChange,
    handleRowsPerPageChange,
    handleSort,
  }
}
