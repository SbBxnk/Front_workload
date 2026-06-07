'use client'

import type React from 'react'
import { useEffect, useState, useRef, useCallback } from 'react'
import { useParams } from 'next/navigation'
import { SortState } from '@/components/Table'
import type { ExPosition } from '@/Types'
import Swal from 'sweetalert2'
import useUtility from '@/hooks/useUtility'
import SetAssessorServices from '@/services/setAssessorServices'
import ExpositionServices from '@/services/exPositionServices'
import type { Assessor } from './types'

export function useAssignAssessor() {
  const { setBreadcrumbs } = useUtility()
  const routeParams = useParams()

  const round_list_id = Number(Array.isArray(routeParams.round_list_id) ? routeParams.round_list_id[0] : routeParams.round_list_id)
  const set_asses_list_id = routeParams.set_asses_list_id
    ? Number(Array.isArray(routeParams.set_asses_list_id) ? routeParams.set_asses_list_id[0] : routeParams.set_asses_list_id)
    : routeParams.ex_u_id
      ? Number(Array.isArray(routeParams.ex_u_id) ? routeParams.ex_u_id[0] : routeParams.ex_u_id)
      : 0

  // Function to check if there are available examiners
  const checkAvailableExaminers = useCallback(async () => {
    try {
      setIsCheckingExaminers(true)
      if (!set_asses_list_id) {
        setIsCheckingExaminers(false)
        return
      }

      const response = await SetAssessorServices.getAllExUsers(
        set_asses_list_id
      )

      console.log('checkAvailableExaminers response:', response)
      console.log('Response type:', typeof response)
      console.log('Response keys:', response ? Object.keys(response) : 'null')

      // Handle different response formats
      let userData = []
      if (response && typeof response === 'object') {
        if ('payload' in response && Array.isArray(response.payload)) {
          userData = response.payload
          console.log('Using payload data')
        } else if ('data' in response && Array.isArray(response.data)) {
          userData = response.data
          console.log('Using data property')
        } else if (Array.isArray(response)) {
          userData = response
          console.log('Using response as array')
        }
      }

      console.log('Available examiners count:', userData.length)
      console.log('Sample user data:', userData.slice(0, 2))
      setHasAvailableExaminers(userData.length > 0)
    } catch (error) {
      console.error('Error checking available examiners:', error)
      setHasAvailableExaminers(false)
    } finally {
      setIsCheckingExaminers(false)
    }
  }, [set_asses_list_id])

  const [assessors, setAssessors] = useState<Assessor[]>([])
  const [expositons, setExPosition] = useState<ExPosition[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchName, setSearchName] = useState<string>('')
  const [selectedAssessor, setSelectedAssessor] = useState<string>('')
  const [total, setTotal] = useState<number>(0)
  const [rowsPerPage, setRowsPerPage] = useState<number>(10)
  const [page, setPage] = useState<number>(0)
  const [selectedSetAssesInfoId, setSelectedSetAssesInfoId] =
    useState<number>(0)
  const [FormData, setFormData] = useState<{
    ex_u_id: number[]
    set_asses_list_id: number
  }>({
    ex_u_id: [],
    set_asses_list_id: set_asses_list_id,
  })
  const [sortState, setSortState] = useState<SortState>({
    column: null,
    order: null,
  })
  const [hasAvailableExaminers, setHasAvailableExaminers] = useState<boolean>(false)
  const [isCheckingExaminers, setIsCheckingExaminers] = useState<boolean>(true)

  const hasFetchedInitial = useRef(false)
  const isFirstRender = useRef(true)
  const prevParamsRef = useRef<string>('')

  // Debug: Log when hasAvailableExaminers changes
  useEffect(() => {
    console.log('hasAvailableExaminers changed to:', hasAvailableExaminers)
  }, [hasAvailableExaminers])
  const [assesseeInfo, setAssesseeInfo] = useState<{
    prefix_name: string
    u_fname: string
    u_lname: string
  } | null>(null)
  const [params, setParams] = useState({
    search: '',
    page: 1,
    limit: 10,
    sort: '',
    order: '',
    ex_position_name: '',
  })
  const [searchInput, setSearchInput] = useState<string>('')

  useEffect(() => {
    setBreadcrumbs(
      [{ text: 'รอบประเมินภาระงาน', path: '/admin/set-assessor' },
      { text: 'ผู้รับการประเมินภาระงาน', path: `/admin/set-assessor/${round_list_id}` },
      { text: 'ผู้ประเมินภาระงาน', path: `/admin/set-assessor/${round_list_id}/assessor/${set_asses_list_id}` }
      ])
  }, [setBreadcrumbs, round_list_id])

  useEffect(() => {
    if (!set_asses_list_id) return

    const urlParams = new URLSearchParams(window.location.search)
    const searchFromUrl = urlParams.get('search') || ''
    const pageFromUrl = parseInt(urlParams.get('page') || '1', 10)
    const limitFromUrl = parseInt(urlParams.get('limit') || '10', 10)
    const sortFromUrl = urlParams.get('sort') || ''
    const orderFromUrl = urlParams.get('order') || ''
    const exPositionFromUrl = urlParams.get('ex_position_name') || ''

    setSearchInput(searchFromUrl)
    setSearchName(searchFromUrl)
    setSelectedAssessor(exPositionFromUrl)

    const initialParams = {
      search: searchFromUrl,
      page: pageFromUrl,
      limit: limitFromUrl,
      sort: sortFromUrl,
      order: orderFromUrl,
      ex_position_name: exPositionFromUrl,
    }

    setParams(initialParams)

    if (sortFromUrl && orderFromUrl) {
      setSortState({ column: sortFromUrl, order: orderFromUrl as any })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const updateUrlParams = (params: {
    search?: string
    page?: number
    limit?: number
    sort?: string
    order?: string
    ex_position_name?: string
  }) => {
    const searchParams = new URLSearchParams()
    if (params.search) searchParams.set('search', params.search)
    if (params.page) searchParams.set('page', params.page.toString())
    if (params.limit) searchParams.set('limit', params.limit.toString())
    if (params.sort) {
      searchParams.set('sort', params.sort)
    }
    if (params.order) {
      searchParams.set('order', params.order)
    }
    if (params.ex_position_name) {
      searchParams.set('ex_position_name', params.ex_position_name)
    }
    window.history.replaceState({}, '', `?${searchParams.toString()}`)
  }

  const fetchAssessorData = useCallback(async (
    search: string,
    limit: number | undefined,
    page: number | undefined,
    sort: string,
    order: string,
    ex_position_name: string = '',
    afterSuccess?: () => void
  ) => {
    try {
      setLoading(true)
      setError(null)
      setAssessors([])

      // ดึงข้อมูล exposition, assessee info และ assessor info พร้อมกัน
      const [resExposition, resAssesseeInfo, resAssesDetail] = await Promise.all([
        ExpositionServices.getAllExpositions(),
        SetAssessorServices.getAssesseeBySetAssesListId(set_asses_list_id),
        SetAssessorServices.getSetAssessorInfo(set_asses_list_id, {
          search,
          limit: limit ?? 10,
          page: page ?? 1,
          sort,
          order,
          ex_position_name: ex_position_name
        })
      ])

      // Set exposition data
      if (resExposition.success && resExposition.payload) {
        setExPosition(resExposition.payload)
      }

      // Set assessee info
      if (resAssesseeInfo.success && resAssesseeInfo.payload) {
        const payload = resAssesseeInfo.payload as any
        setAssesseeInfo({
          prefix_name: payload.prefix_name,
          u_fname: payload.u_fname,
          u_lname: payload.u_lname
        })
      }

      // Set assessor data with pagination
      if (resAssesDetail.success) {
        const responseMeta = resAssesDetail.meta
        if (responseMeta) {
          setTotal(responseMeta.total_rows)
          setPage(responseMeta.page - 1)
          setRowsPerPage(responseMeta.limit)
        }

        const assessorsData = (resAssesDetail.payload || []) as Assessor[]
        setAssessors(assessorsData)
      } else {
        setAssessors([])
        setTotal(0)
        setPage(0)
      }

      if (afterSuccess) {
        afterSuccess()
      }
    } catch (error) {
      console.error('Error in fetchAssessorData:', error)
      setError('เกิดข้อผิดพลาดในการดึงข้อมูล')

      if (!expositons.length) {
        setExPosition([])
      }

      setAssessors([])
      setTotal(0)
    } finally {
      setLoading(false)
      updateUrlParams({
        search,
        page,
        limit,
        sort,
        order,
        ex_position_name,
      })
    }
  }, [set_asses_list_id])

  // Auto search with debounce
  useEffect(() => {
    // Skip on first render to prevent duplicate API call
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }

    const delayDebounce = setTimeout(() => {
      setParams((prev) => ({
        ...prev,
        search: searchInput.trim(),
        page: 1,
      }))
    }, 500)
    return () => clearTimeout(delayDebounce)
  }, [searchInput])

  // Initialize from URL
  useEffect(() => {
    if (!set_asses_list_id) return

    const initialParams = {
      search: params.search,
      page: params.page,
      limit: params.limit,
      sort: params.sort,
      order: params.order,
      ex_position_name: params.ex_position_name,
    }

    if (!hasFetchedInitial.current) {
      hasFetchedInitial.current = true

      // Set initial params ref
      prevParamsRef.current = JSON.stringify(initialParams)

      // Fetch initial data
      fetchAssessorData(
        params.search || '',
        params.limit,
        params.page,
        params.sort || '',
        params.order || '',
        params.ex_position_name || ''
      )
      checkAvailableExaminers()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [set_asses_list_id])

  // Fetch data when params change
  useEffect(() => {
    if (!set_asses_list_id || !hasFetchedInitial.current) {
      return
    }

    // Create a string representation of current params to compare
    const currentParamsString = JSON.stringify({
      search: params.search,
      page: params.page,
      limit: params.limit,
      sort: params.sort,
      order: params.order,
      ex_position_name: params.ex_position_name,
    })

    // Only fetch if params actually changed
    if (currentParamsString !== prevParamsRef.current) {
      prevParamsRef.current = currentParamsString
      fetchAssessorData(
        params.search || '',
        params.limit,
        params.page,
        params.sort || '',
        params.order || '',
        params.ex_position_name || ''
      )
      checkAvailableExaminers()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    params.search,
    params.page,
    params.limit,
    params.sort,
    params.order,
    params.ex_position_name,
    set_asses_list_id,
  ])

  const clearSearch = () => {
    setSearchInput('')
  }

  const handlePageChange = (newPage: number) => {
    setPage(newPage)
    setParams((prev) => ({
      ...prev,
      page: newPage + 1,
    }))
  }

  const handleSort = (column: string, order: any) => {
    setSortState({ column, order })
    setParams((prev) => ({
      ...prev,
      sort: order ? column : '',
      order: order || '',
      page: 1, // Reset to first page when sorting
    }))
    setPage(0) // Reset page to 0 (display page 1)
  }

  const handleRowsPerPageChange = (newRowsPerPage: number) => {
    setRowsPerPage(newRowsPerPage)
    setParams((prev) => ({
      ...prev,
      limit: newRowsPerPage,
      page: 1, // Reset to first page when changing rows per page
    }))
    setPage(0) // Reset page to 0 (display page 1)
  }

  const handleAssessorSelect = (value: string) => {
    setSelectedAssessor(value)
    setParams((prev) => ({
      ...prev,
      ex_position_name: value,
      page: 1, // Reset to first page when filtering
    }))
    setPage(0) // Reset page to 0 (display page 1)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    setLoading(true)
    e.preventDefault()

    try {
      const dataToSubmit = {
        set_asses_list_id: Number(FormData.set_asses_list_id),
        ex_u_id: FormData.ex_u_id,
      }

      if (!dataToSubmit.ex_u_id || dataToSubmit.ex_u_id.length === 0) {
        alert('กรุณาเลือกผู้ประเมิน')
        setLoading(false)
        return
      }

      // เพิ่มผู้ประเมินแบบ multiple
      await SetAssessorServices.createSetAssessorInfoMultiple(
        dataToSubmit
      )

      setFormData({
        set_asses_list_id: set_asses_list_id,
        ex_u_id: [],
      })

      // Refresh data
      fetchAssessorData(
        params.search || '',
        params.limit,
        params.page,
        params.sort || '',
        params.order || '',
        params.ex_position_name || ''
      )

      // SweetAlert will be shown in onSuccess callback after modal closes
    } catch (error) {
      setLoading(false)
      console.error('Error in handleSubmit:', error)

      Swal.fire({
        position: 'center',
        icon: 'error',
        title: 'เกิดข้อผิดพลาด!',
        text: 'เกิดข้อผิดพลาดในการเพิ่มผู้ประเมิน',
        showConfirmButton: false,
        timer: 1500,
      })
    }
  }

  const handleDelete = async (
    e: React.FormEvent<HTMLFormElement> | React.MouseEvent,
    set_asses_info_id: number
  ) => {
    e.preventDefault()
    setLoading(true)
    try {
      await SetAssessorServices.deleteSetAssessorInfo(
        set_asses_info_id
      )

      // Refresh data
      fetchAssessorData(
        params.search || '',
        params.limit,
        params.page,
        params.sort || '',
        params.order || '',
        params.ex_position_name || ''
      )

      // Check available examiners after successful deletion with a slight delay
      setTimeout(() => {
        checkAvailableExaminers()
      }, 500)

      Swal.fire({
        icon: 'success',
        title: 'ลบสำเร็จ!',
        text: `ลบสาขาผู้ประเมินสำเร็จ!`,
        showConfirmButton: false,
        timer: 1500,
      })
    } catch (error) {
      console.error('Error deleting assessor:', error)
      Swal.fire({
        icon: 'error',
        title: 'เกิดข้อผิดพลาด!',
        text: 'เกิดข้อผิดพลาดในการลบผู้ประเมิน',
        showConfirmButton: false,
        timer: 1500,
      })
    } finally {
      setLoading(false)
    }
  }

  return {
    round_list_id,
    set_asses_list_id,
    assessors,
    expositons,
    loading,
    error,
    searchName,
    selectedAssessor,
    total,
    rowsPerPage,
    page,
    selectedSetAssesInfoId,
    setSelectedSetAssesInfoId,
    FormData,
    setFormData,
    sortState,
    hasAvailableExaminers,
    isCheckingExaminers,
    assesseeInfo,
    params,
    searchInput,
    setSearchInput,
    fetchAssessorData,
    checkAvailableExaminers,
    clearSearch,
    handlePageChange,
    handleSort,
    handleRowsPerPageChange,
    handleAssessorSelect,
    handleSubmit,
    handleDelete,
  }
}
