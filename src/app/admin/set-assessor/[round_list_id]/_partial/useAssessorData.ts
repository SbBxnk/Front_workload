'use client'

import type React from 'react'
import { useEffect, useState, useRef, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { SortState } from '@/components/Table'
import type { ExPosition, User } from '@/Types'
import Swal from 'sweetalert2'
import SetAssessorServices from '@/services/setAssessorServices'
import ExpositionServices from '@/services/exPositionServices'
import WorkloadFormServices from '@/services/workloadFormServices'
import useUtility from '@/hooks/useUtility'
import type { Assessor, Round, Delete, WorkloadFormList, EvaluationStatus } from './types'

export function useAssessorData() {
  const { data: session } = useSession()
  const { setBreadcrumbs } = useUtility()
  const routeParams = useParams()
  const router = useRouter()
  const round_list_id = routeParams.round_list_id
  const [FormData, setFormData] = useState({ round_list_id: 0, as_u_id: [] as number[] })
  const [rounds, setRound] = useState<Round>()
  const [assessors, setAssessors] = useState<Assessor[]>([])
  const [expositons, setExPosition] = useState<ExPosition[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedAssessor, setSelectedAssessor] = useState<string>('')
  const [total, setTotal] = useState<number>(0)
  const [rowsPerPage, setRowsPerPage] = useState<number>(10)
  const [page, setPage] = useState<number>(0)
  const [params, setParams] = useState({
    search: '',
    page: 1,
    limit: 10,
    sort: '',
    order: '',
    ex_position_name: '',
  })
  const [searchInput, setSearchInput] = useState<string>('')
  const [selectedExPosition, setSelectedExPosition] = useState<string>('')
  const [selectedSetAssesListId, setSelectedSetAssesListId] =
    useState<number>(0)
  const [selectedSetAsFname, setSelectedSetAsFname] = useState<string>('')
  const [selectedSetAsLname, setSelectedSetAsLname] = useState<string>('')
  const [selectedSetAsPrefixname, setSelectedSetAsPrefixname] =
    useState<string>('')
  const [checkDelete, setCheckDelete] = useState<Delete>({
    set_asses_list_id: [],
  })
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0)
  const [users, setUsers] = useState<User[]>([])
  const [allUsersAdded, setAllUsersAdded] = useState<boolean>(false)
  const [sortState, setSortState] = useState<SortState>({
    column: null,
    order: null,
  })

  // State สำหรับเก็บสถานะ checkbox ของแต่ละ row
  const [checkboxStates, setCheckboxStates] = useState<Record<number, boolean>>({})

  // State สำหรับเก็บสถานะการประเมินของแต่ละ row
  const [evaluationStatuses, setEvaluationStatuses] = useState<Record<number, EvaluationStatus>>({})

  // State สำหรับ Select All checkbox
  const [selectAllChecked, setSelectAllChecked] = useState<boolean>(false)

  // State สำหรับ confirm modal
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false)
  const [pendingAction, setPendingAction] = useState<{
    checked: boolean
    actionText: string
    count: number
  } | null>(null)

  const hasFetchedInitial = useRef(false)
  const isFirstRender = useRef(true)
  const prevParamsRef = useRef<string>('')

  useEffect(() => {
    setBreadcrumbs(
      [{ text: 'รอบประเมินภาระงาน', path: '/admin/set-assessor' },
      { text: 'ผู้รับการประเมินภาระงาน', path: `/admin/set-assessor/${round_list_id}` }
      ])
  }, [setBreadcrumbs, round_list_id])

  // ฟังก์ชันสำหรับดึงสถานะปัจจุบันของแต่ละ assessor
  const fetchCheckboxStates = async (assessors: Assessor[]) => {
    if (!session?.accessToken) return

    const states: Record<number, boolean> = {}

    for (const assessor of assessors) {
      try {
        const response = await WorkloadFormServices.getAssessorFormStatus(
          assessor.set_asses_list_id
        )

        if (response.success && response.payload && response.payload.length > 0) {
          states[assessor.set_asses_list_id] = response.payload[0].form_status === 1
        } else {
          states[assessor.set_asses_list_id] = false
        }
      } catch (error) {
        console.error(`Error fetching status for assessor ${assessor.set_asses_list_id}:`, error)
        states[assessor.set_asses_list_id] = false
      }
    }

    setCheckboxStates(states)

    // อัปเดต Select All checkbox
    const allChecked = Object.values(states).every(Boolean)
    setSelectAllChecked(allChecked)
  }

  // ฟังก์ชันสำหรับดึงสถานะการประเมินของแต่ละ assessor
  const fetchEvaluationStatuses = async (assessors: Assessor[]) => {
    if (!session?.accessToken) return

    const statuses: Record<number, EvaluationStatus> = {}

    for (const assessor of assessors) {
      try {
        const response = await WorkloadFormServices.getAssessorFormStatus(
          assessor.set_asses_list_id
        )

        if (response.success && response.payload && response.payload.length > 0) {
          statuses[assessor.set_asses_list_id] = response.payload[0]
        } else {
          statuses[assessor.set_asses_list_id] = {
            set_asses_list_id: assessor.set_asses_list_id,
            workload_group_id: null,
            form_status: 0,
            evaluation_status: 'not_started'
          }
        }
      } catch (error) {
        console.error(`Error fetching evaluation status for assessor ${assessor.set_asses_list_id}:`, error)
        statuses[assessor.set_asses_list_id] = {
          set_asses_list_id: assessor.set_asses_list_id,
          workload_group_id: null,
          form_status: 0,
          evaluation_status: 'not_started'
        }
      }
    }

    setEvaluationStatuses(statuses)
  }

  const fetchAllData = useCallback(async (
    search: string,
    limit: number | undefined,
    page: number | undefined,
    sort: string,
    order: string,
    ex_position_name: string,
    afterSuccess?: () => void
  ) => {
    try {
      if (!session?.accessToken) {
        setLoading(false)
        setError('กรุณาเข้าสู่ระบบก่อน')
        return
      }

      setLoading(true)
      setError(null)
      setAssessors([])

      setFormData((prev) => ({ ...prev, round_list_id: Number(Array.isArray(round_list_id) ? round_list_id[0] : round_list_id) }))

      // Fetch all data in parallel
      const [resExposition, resRoundTitle, resUsers, resAssessors] = await Promise.all([
        ExpositionServices.getAllExpositions(),
        SetAssessorServices.getRoundListById(Number(Array.isArray(round_list_id) ? round_list_id[0] : round_list_id)),
        SetAssessorServices.getAssessUsers(Number(Array.isArray(round_list_id) ? round_list_id[0] : round_list_id)),
        SetAssessorServices.getSetAssessorListByRound(
          Number(Array.isArray(round_list_id) ? round_list_id[0] : round_list_id),
          {
            search,
            page: page ?? 1,
            limit: limit ?? 10,
            sort,
            order,
            ex_position_name,
          }
        )
      ])

      // Set exposition data
      if (resExposition.success && resExposition.payload) {
        setExPosition(resExposition.payload)
      } else {
        console.log('Exposition data failed to load:', resExposition)
      }

      // Set round title data
      if (resRoundTitle.success && resRoundTitle.payload) {
        setRound(resRoundTitle.payload as unknown as Round)
      }

      // Set users data
      if (resUsers.data) {
        const processedUsers = resUsers.data
        setUsers(processedUsers)
      }

      // Set assessors data
      if (resAssessors.success) {
        const responseMeta = resAssessors.meta

        if (responseMeta) {
          setTotal(responseMeta.total_rows)
          setPage(responseMeta.page - 1)
          setRowsPerPage(responseMeta.limit)
        }

        const assessorsData = resAssessors.payload || []
        setAssessors(assessorsData)

        // ดึงสถานะ checkbox และสถานะการประเมินของแต่ละ assessor
        await Promise.all([
          fetchCheckboxStates(assessorsData),
          fetchEvaluationStatuses(assessorsData)
        ])

        // Check which assessors have related data
        const idsWithData: number[] = []
        for (const assessor of assessorsData) {
          try {
            const assessorInfoResponse = await SetAssessorServices.getSetAssessorInfo(
              assessor.set_asses_list_id
            )
            if (
              assessorInfoResponse.payload &&
              Array.isArray(assessorInfoResponse.payload) &&
              assessorInfoResponse.payload.length > 0
            ) {
              idsWithData.push(assessor.set_asses_list_id)
            }
          } catch (error) {
            console.error(
              `Error checking data for assessor ${assessor.set_asses_list_id}:`,
              error
            )
          }
        }
        setCheckDelete({ set_asses_list_id: idsWithData })

        // Update allUsersAdded status
        const assessorUserIds = assessorsData.map((assessor) => assessor.as_u_id)
        const allAdded = users.every((user: User) =>
          assessorUserIds.includes(user.u_id)
        )
        setAllUsersAdded(allAdded)
      } else {
        setAssessors([])
        setTotal(0)
        setPage(0)
      }

      if (afterSuccess) {
        afterSuccess()
      }
    } catch (error) {
      console.error('เกิดข้อผิดพลาดในการดึงข้อมูล:', error)
      setError('เกิดข้อผิดพลาดในการดึงข้อมูล')
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
  }, [session?.accessToken, round_list_id])

  useEffect(() => {
    if (!session?.accessToken || !round_list_id) return

    const urlParams = new URLSearchParams(window.location.search)
    const searchFromUrl = urlParams.get('search') || ''
    const pageFromUrl = parseInt(urlParams.get('page') || '1', 10)
    const limitFromUrl = parseInt(urlParams.get('limit') || '10', 10)
    const sortFromUrl = urlParams.get('sort') || ''
    const orderFromUrl = urlParams.get('order') || ''
    const exPositionFromUrl = urlParams.get('ex_position_name') || ''

    setSearchInput(searchFromUrl)
    setSelectedExPosition(exPositionFromUrl)

    const initialParams = {
      search: searchFromUrl,
      page: pageFromUrl,
      limit: limitFromUrl,
      sort: sortFromUrl,
      order: orderFromUrl,
      ex_position_name: exPositionFromUrl,
    }

    if (sortFromUrl && orderFromUrl) {
      setSortState({ column: sortFromUrl, order: orderFromUrl as any })
    }

    // Mark as initialized and set params
    if (!hasFetchedInitial.current) {
      hasFetchedInitial.current = true
    }

    setParams(initialParams)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.accessToken, round_list_id])

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

  // Fetch data when params change
  useEffect(() => {
    if (!round_list_id || !session?.accessToken || !hasFetchedInitial.current) {
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
      fetchAllData(
        params.search || '',
        params.limit,
        params.page,
        params.sort || '',
        params.order || '',
        params.ex_position_name || ''
      )
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    params.search,
    params.page,
    params.limit,
    params.sort,
    params.order,
    params.ex_position_name,
    round_list_id,
    session?.accessToken,
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
  }

  const handleExPositionSelect = (value: string) => {
    setSelectedExPosition(value)
    setParams((prev) => ({
      ...prev,
      ex_position_name: value,
      page: 1, // Reset to first page when filtering
    }))
    setPage(0) // Reset page to 0 (display page 1)
  }

  const handleSetExUser = (set_asses_list_id: number, assessor: Assessor) => {
    router.push(
      `/admin/set-assessor/${round_list_id}/assessor/${set_asses_list_id}`
    )
  }

  // ฟังก์ชันสำหรับจัดการ checkbox และอัปเดต status
  const handleCheckboxChange = async (set_asses_list_id: number, checked: boolean) => {
    if (!session?.accessToken) return

    try {
      const newStatus = checked ? 1 : 0

      // อัปเดต status ในฐานข้อมูล
      await WorkloadFormServices.updateWorkloadFormStatus(
        set_asses_list_id,
        newStatus
      )

      // อัปเดต state ของ checkbox
      setCheckboxStates(prev => ({
        ...prev,
        [set_asses_list_id]: checked
      }))

      // อัปเดต Select All checkbox
      const allChecked = Object.values({...checkboxStates, [set_asses_list_id]: checked}).every(Boolean)
      setSelectAllChecked(allChecked)

      // อัปเดต evaluation status ทันที
      setEvaluationStatuses(prev => ({
        ...prev,
        [set_asses_list_id]: {
          ...prev[set_asses_list_id],
          form_status: newStatus,
          evaluation_status: newStatus === 1 ? 'completed' :
            prev[set_asses_list_id]?.workload_group_id ? 'in_progress' : 'not_started'
        }
      }))

      // แสดงข้อความแจ้งเตือน
      Swal.fire({
        position: 'center',
        icon: 'success',
        title: 'สำเร็จ!',
        text: checked ? 'ปิดการประเมินสำเร็จ' : 'เปิดการประเมินสำเร็จ',
        showConfirmButton: false,
        timer: 1500,
      })
    } catch (error) {
      console.error('Error updating status:', error)
      Swal.fire({
        position: 'center',
        icon: 'error',
        title: 'เกิดข้อผิดพลาด!',
        text: 'ไม่สามารถอัปเดตสถานะได้',
        showConfirmButton: false,
        timer: 1500,
      })
    }
  }

  // ฟังก์ชันสำหรับจัดการ Select All checkbox
  const handleSelectAllChange = async (checked: boolean) => {
    if (!session?.accessToken) return

    const allAssessorIds = assessors.map(assessor => assessor.set_asses_list_id)
    const actionText = "ยืนยัน"

    // เก็บข้อมูลการดำเนินการที่รอการยืนยัน
    setPendingAction({
      checked,
      actionText,
      count: allAssessorIds.length
    })

    // แสดง confirm modal
    setShowConfirmModal(true)
  }

  // ฟังก์ชันสำหรับยืนยันการดำเนินการ
  const handleConfirmAction = async () => {
    if (!session?.accessToken || !pendingAction) return

    try {
      const allAssessorIds = assessors.map(assessor => assessor.set_asses_list_id)
      const newStatus = pendingAction.checked ? 1 : 0

      // แสดง loading
      Swal.fire({
        title: 'กำลังดำเนินการ...',
        text: `กำลัง${pendingAction.actionText}ทั้งหมด ${pendingAction.count} รายการ`,
        allowOutsideClick: false,
        showConfirmButton: false,
        didOpen: () => {
          Swal.showLoading()
        }
      })

      // อัปเดต status แบบ bulk ในฐานข้อมูล
      await WorkloadFormServices.updateWorkloadFormStatusBulk(
        allAssessorIds,
        newStatus
      )

      // อัปเดต state ของ checkbox ทั้งหมด
      const newCheckboxStates: Record<number, boolean> = {}
      allAssessorIds.forEach(id => {
        newCheckboxStates[id] = pendingAction.checked
      })
      setCheckboxStates(newCheckboxStates)
      setSelectAllChecked(pendingAction.checked)

      // อัปเดต evaluation status ทั้งหมดทันที
      setEvaluationStatuses(prev => {
        const newStatuses = { ...prev }
        allAssessorIds.forEach(id => {
          newStatuses[id] = {
            ...newStatuses[id],
            form_status: newStatus,
            evaluation_status: newStatus === 1 ? 'completed' :
              newStatuses[id]?.workload_group_id ? 'in_progress' : 'not_started'
          }
        })
        return newStatuses
      })

      // ปิด loading modal
      Swal.close()

      // แสดงข้อความแจ้งเตือนสำเร็จ
      Swal.fire({
        position: 'center',
        icon: 'success',
        title: 'สำเร็จ!',
        text: `${pendingAction.actionText}ทั้งหมด ${pendingAction.count} รายการสำเร็จ`,
        showConfirmButton: false,
        timer: 2000,
      })
    } catch (error) {
      console.error('Error updating status bulk:', error)

      // ปิด loading modal
      Swal.close()

      Swal.fire({
        position: 'center',
        icon: 'error',
        title: 'เกิดข้อผิดพลาด!',
        text: 'ไม่สามารถอัปเดตสถานะได้',
        showConfirmButton: false,
        timer: 1500,
      })
    } finally {
      // ปิด confirm modal และล้างข้อมูล pending
      setShowConfirmModal(false)
      setPendingAction(null)
    }
  }

  // ฟังก์ชันสำหรับยกเลิกการดำเนินการ
  const handleCancelAction = () => {
    setShowConfirmModal(false)
    setPendingAction(null)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    if (!session?.accessToken) return

    setLoading(true)
    e.preventDefault()

    try {
      if (!FormData.as_u_id || FormData.as_u_id.length === 0) {
        alert('กรุณาเลือกผู้รับการประเมิน')
        setLoading(false)
        return
      }

      // ส่งข้อมูลแบบ array ไปยัง backend
      const dataToSubmit = {
        round_list_id: Number(FormData.round_list_id),
        as_u_id: FormData.as_u_id,
      }

      const createResponse = await SetAssessorServices.createSetAssessorListMultiple(dataToSubmit)

      // Get the latest assessor list to find the maximum set_asses_list_id
      const response = await SetAssessorServices.getSetAssessorListByRound(
        Number(Array.isArray(round_list_id) ? round_list_id[0] : round_list_id)
      )

      if (response.success && response.payload && Array.isArray(response.payload)) {
        const dataAssesDetail = response.payload as Assessor[]
        setAssessors(dataAssesDetail)

        // ดึงสถานะ checkbox และสถานะการประเมินของแต่ละ assessor ใหม่
        await Promise.all([
          fetchCheckboxStates(dataAssesDetail),
          fetchEvaluationStatuses(dataAssesDetail)
        ])

        // Check which assessors have related data
        const idsWithData: number[] = []
        for (const assessor of dataAssesDetail) {
          try {
            const assessorInfoResponse = await SetAssessorServices.getSetAssessorInfo(
              assessor.set_asses_list_id
            )
            if (
              assessorInfoResponse.payload &&
              Array.isArray(assessorInfoResponse.payload) &&
              assessorInfoResponse.payload.length > 0
            ) {
              idsWithData.push(assessor.set_asses_list_id)
            }
          } catch (error) {
            console.error(
              `Error checking data for assessor ${assessor.set_asses_list_id}:`,
              error
            )
          }
        }
        setCheckDelete({ set_asses_list_id: idsWithData })

        // Update allUsersAdded status
        const assessorUserIds = dataAssesDetail.map((assessor) => assessor.as_u_id)
        const allAdded = users.every((user: User) =>
          assessorUserIds.includes(user.u_id)
        )
        setAllUsersAdded(allAdded)

        // Find the newly created assessors and add them to workload form
        if (createResponse.payload && Array.isArray(createResponse.payload)) {
          const successfulInserts = createResponse.payload.filter((item: any) => item.success)

          if (successfulInserts.length > 0) {
            // สร้าง array ของ workload form data
            const workloadFormDataArray: WorkloadFormList[] = successfulInserts.map((insert: any) => ({
              set_asses_list_id: insert.result.insertId || insert.result.set_asses_list_id,
              status_id: 0,
            }))

            // ส่งข้อมูลแบบ bulk
            try {
              await SetAssessorServices.addBulkWorkloadForm(
                workloadFormDataArray
              )
            } catch (error) {
              console.error('❌ Workload form bulk insert failed:', error)
            }
          }
        }
      }

      setFormData({
        round_list_id: Number(round_list_id),
        as_u_id: [],
      })

      // อัปเดตรายชื่อผู้ใช้ที่สามารถเลือกได้
      try {
        const resUsers = await SetAssessorServices.getAssessUsers(
          Number(round_list_id)
        )
        if (resUsers.status) {
          const processedUsers = resUsers.data || []
          setUsers(processedUsers)
        }
      } catch (error) {
        console.error('Error fetching updated users:', error)
        setUsers([])
      }

      setLoading(false)

      // แสดงผลลัพธ์การเพิ่มข้อมูล
      const successCount = (createResponse.meta as any)?.success || 0
      const duplicateCount = (createResponse.meta as any)?.duplicate || 0
      const errorCount = (createResponse.meta as any)?.error || 0

      let message = `เพิ่มผู้รับการประเมินเสร็จสิ้น: สำเร็จ ${successCount} รายการ`
      if (duplicateCount > 0) {
        message += `, ซ้ำ ${duplicateCount} รายการ`
      }
      if (errorCount > 0) {
        message += `, ผิดพลาด ${errorCount} รายการ`
      }

      Swal.fire({
        position: 'center',
        icon: successCount > 0 ? 'success' : 'warning',
        title: successCount > 0 ? 'สำเร็จ!' : 'คำเตือน',
        text: message,
        showConfirmButton: false,
        timer: 2000,
      })
    } catch (error) {
      setLoading(false)

      const status = (error as { response?: { status?: number } })?.response
        ?.status
      if (status === 401) {
        Swal.fire({
          position: 'center',
          icon: 'warning',
          title: 'ผู้รับการประเมินนี้ถูกเพิ่มแล้ว!',
          text: 'ผู้รับการประเมินนี้ถูกเพิ่มในรอบการประเมินแล้ว',
          showConfirmButton: false,
          timer: 1500,
        })
      } else {
        Swal.fire({
          position: 'center',
          icon: 'error',
          title: 'เกิดข้อผิดพลาด!',
          text: 'เกิดข้อผิดพลาดในการเพิ่มผู้รับการประเมิน',
          showConfirmButton: false,
          timer: 1500,
        })
      }
    }
  }

  const handleDelete = async (
    e: React.FormEvent<HTMLFormElement> | React.MouseEvent,
    set_asses_list_id: number
  ) => {
    if (!session?.accessToken) return

    e.preventDefault()
    setLoading(true)
    try {
      await SetAssessorServices.deleteSetAssessorList(set_asses_list_id)
      await fetchAllData(
        params.search || '',
        params.limit,
        params.page,
        params.sort || '',
        params.order || '',
        params.ex_position_name || ''
      )
      setRefreshTrigger((prev) => prev + 1)
      setLoading(false)

      Swal.fire({
        icon: 'success',
        title: 'ลบสำเร็จ!',
        text: `ลบสาขาผู้รับการประเมินสำเร็จ!`,
        showConfirmButton: false,
        timer: 1500,
      })
    } catch {
      await fetchAllData(
        params.search || '',
        params.limit,
        params.page,
        params.sort || '',
        params.order || '',
        params.ex_position_name || ''
      )
      setLoading(false)
      Swal.fire({
        icon: 'error',
        title: 'เกิดข้อผิดพลาด!',
        text: 'เกิดข้อผิดพลาดในการลบผู้รับการประเมิน',
        showConfirmButton: false,
        timer: 1500,
      })
    }
  }

  return {
    // route / session
    round_list_id,
    // form / list data
    FormData,
    setFormData,
    rounds,
    assessors,
    expositons,
    loading,
    error,
    users,
    allUsersAdded,
    // pagination / params
    total,
    rowsPerPage,
    page,
    params,
    searchInput,
    setSearchInput,
    selectedAssessor,
    selectedExPosition,
    sortState,
    refreshTrigger,
    // delete selection
    checkDelete,
    selectedSetAssesListId,
    setSelectedSetAssesListId,
    selectedSetAsFname,
    setSelectedSetAsFname,
    selectedSetAsLname,
    setSelectedSetAsLname,
    selectedSetAsPrefixname,
    setSelectedSetAsPrefixname,
    // checkbox / evaluation status
    checkboxStates,
    evaluationStatuses,
    selectAllChecked,
    // confirm modal
    showConfirmModal,
    pendingAction,
    // actions
    fetchAllData,
    clearSearch,
    handlePageChange,
    handleSort,
    handleRowsPerPageChange,
    handleAssessorSelect,
    handleExPositionSelect,
    handleSetExUser,
    handleCheckboxChange,
    handleSelectAllChange,
    handleConfirmAction,
    handleCancelAction,
    handleSubmit,
    handleDelete,
  }
}
