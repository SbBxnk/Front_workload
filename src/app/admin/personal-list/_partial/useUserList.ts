'use client'

import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import UserServices from '@/services/userServices'
import PositionServices from '@/services/positionServices'
import BranchServices from '@/services/branchServices'
import CourseServices from '@/services/courseServices'
import ExpositionServices from '@/services/exPositionServices'
import UserLevelServices from '@/services/userLevelServices'
import type { UserSearchParams } from '@/Types'
import type { SortOrder, SortState } from '@/components/Table'

const DEFAULT_PARAMS: UserSearchParams = {
  search: '',
  page: 1,
  limit: 10,
  sort: '',
  order: '',
  position_name: '',
  branch_name: '',
  course_name: '',
  ex_position_name: '',
  gender: '',
}

type FilterValues = {
  position_name: string
  branch_name: string
  course_name: string
  ex_position_name: string
  gender: string
}

const EMPTY_FILTERS: FilterValues = {
  position_name: '',
  branch_name: '',
  course_name: '',
  ex_position_name: '',
  gender: '',
}

// อ่านค่าเริ่มต้นจาก query string (รองรับ refresh / แชร์ลิงก์)
function readParamsFromUrl(): UserSearchParams {
  if (typeof window === 'undefined') return DEFAULT_PARAMS
  const url = new URLSearchParams(window.location.search)
  return {
    search: url.get('search') ?? '',
    page: Number(url.get('page') ?? 1),
    limit: Number(url.get('limit') ?? 10),
    sort: url.get('sort') ?? '',
    order: url.get('order') ?? '',
    position_name: url.get('position_name') ?? '',
    branch_name: url.get('branch_name') ?? '',
    course_name: url.get('course_name') ?? '',
    ex_position_name: url.get('ex_position_name') ?? '',
    gender: url.get('gender') ?? '',
  }
}

function writeParamsToUrl(params: UserSearchParams) {
  if (typeof window === 'undefined') return
  const url = new URLSearchParams()
  if (params.search) url.set('search', params.search)
  if (params.page) url.set('page', String(params.page))
  if (params.limit) url.set('limit', String(params.limit))
  if (params.sort) url.set('sort', params.sort)
  if (params.order) url.set('order', params.order)
  if (params.position_name) url.set('position_name', params.position_name)
  if (params.branch_name) url.set('branch_name', params.branch_name)
  if (params.course_name) url.set('course_name', params.course_name)
  if (params.ex_position_name)
    url.set('ex_position_name', params.ex_position_name)
  if (params.gender) url.set('gender', params.gender)
  window.history.replaceState({}, '', `?${url.toString()}`)
}

/**
 * จัดการ state ของตารางบุคลากร (ค้นหา/หน้า/เรียงลำดับ/ตัวกรอง) + ดึงข้อมูลผ่าน React Query
 * รวมถึงโหลดตัวเลือก dropdown ของ dialog ตัวกรอง คืนค่าให้ page นำไปแสดงผลได้ทันที
 */
export function useUserList() {
  const [params, setParams] = useState<UserSearchParams>(DEFAULT_PARAMS)
  const [searchInput, setSearchInput] = useState('')

  // state ของ dialog ตัวกรอง (ค่าชั่วคราว ยังไม่ผูกกับ params จนกว่าจะกด "ค้นหา")
  const [isFilterDialogOpen, setIsFilterDialogOpen] = useState(false)
  const [tempFilters, setTempFilters] = useState<FilterValues>(EMPTY_FILTERS)

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
    queryKey: ['users', params],
    queryFn: () => UserServices.getAllUsers(params),
  })

  // ตัวเลือก dropdown สำหรับ dialog ตัวกรอง
  const positionsQuery = useQuery({
    queryKey: ['positions'],
    queryFn: () => PositionServices.getAllPositions(),
  })
  const branchesQuery = useQuery({
    queryKey: ['branches'],
    queryFn: () =>
      BranchServices.getAllBranches({
        search: '',
        page: 1,
        limit: 1000,
        sort: '',
        order: '',
      }),
  })
  const coursesQuery = useQuery({
    queryKey: ['courses'],
    queryFn: () => CourseServices.getAllCourses(),
  })
  const exPositionsQuery = useQuery({
    queryKey: ['exPositions'],
    queryFn: () => ExpositionServices.getAllExpositions(),
  })
  const levelsQuery = useQuery({
    queryKey: ['levels'],
    queryFn: () => UserLevelServices.getAllUserLevels(),
  })

  const meta = query.data?.meta
  const total = meta?.total_rows ?? 0
  const limit = params.limit ?? 10
  const sortState: SortState = {
    column: params.sort || null,
    order: (params.order as SortOrder) || null,
  }

  const handleSearchChange = (value: string) => setSearchInput(value)

  const handlePageChange = (page: number) =>
    setParams((prev) => ({ ...prev, page }))

  const handleRowsPerPageChange = (newLimit: number) =>
    setParams((prev) => ({ ...prev, limit: newLimit, page: 1 }))

  const handleSort = (column: string, order: SortOrder) =>
    setParams((prev) => ({
      ...prev,
      sort: order ? column : '',
      order: order ?? '',
      page: 1,
    }))

  // จำนวนตัวกรองที่ใช้งานอยู่ (สำหรับ badge บนปุ่มตัวกรอง)
  const activeFiltersCount = [
    params.position_name,
    params.branch_name,
    params.course_name,
    params.ex_position_name,
    params.gender,
  ].filter(Boolean).length

  // เปิด dialog พร้อมโหลดค่าตัวกรองปัจจุบันเข้า temp
  const openFilterDialog = () => {
    setTempFilters({
      position_name: params.position_name ?? '',
      branch_name: params.branch_name ?? '',
      course_name: params.course_name ?? '',
      ex_position_name: params.ex_position_name ?? '',
      gender: params.gender ?? '',
    })
    setIsFilterDialogOpen(true)
  }

  const closeFilterDialog = () => setIsFilterDialogOpen(false)

  const setTempFilter = (key: keyof FilterValues, value: string) =>
    setTempFilters((prev) => ({ ...prev, [key]: value }))

  // นำค่า temp ไปใช้จริง แล้วรีเซ็ตกลับหน้าแรก
  const applyFilters = () => {
    setParams((prev) => ({ ...prev, ...tempFilters, page: 1 }))
    setIsFilterDialogOpen(false)
  }

  // ล้างทั้งการค้นหาและตัวกรองทั้งหมด
  const clearAllFilters = () => {
    setSearchInput('')
    setTempFilters(EMPTY_FILTERS)
    setParams((prev) => ({ ...prev, search: '', ...EMPTY_FILTERS, page: 1 }))
    setIsFilterDialogOpen(false)
  }

  return {
    users: query.data?.payload ?? [],
    total,
    totalPages: meta?.total_pages ?? Math.ceil(total / limit),
    isLoading: query.isLoading,
    params,
    searchInput,
    sortState,
    handleSearchChange,
    handlePageChange,
    handleRowsPerPageChange,
    handleSort,
    // dropdown options
    positions: positionsQuery.data?.payload ?? [],
    branches: branchesQuery.data?.payload ?? [],
    courses: coursesQuery.data?.payload ?? [],
    exPositions: exPositionsQuery.data?.payload ?? [],
    levels: levelsQuery.data?.payload ?? [],
    // filter dialog
    isFilterDialogOpen,
    tempFilters,
    activeFiltersCount,
    openFilterDialog,
    closeFilterDialog,
    setTempFilter,
    applyFilters,
    clearAllFilters,
  }
}
