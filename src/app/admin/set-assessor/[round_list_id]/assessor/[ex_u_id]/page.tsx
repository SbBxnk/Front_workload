'use client'

import type React from 'react'
import { useEffect, useState } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import axios from 'axios'
import { Loader, Trash2, Plus, Eye } from 'lucide-react'
import { FiX } from 'react-icons/fi'
import SearchFilter from '@/components/SearchFilter'
import Table, { TableColumn, SortState } from '@/components/Table'
import type { ExPosition } from '@/Types'
import DeleteModal from './deleteModal'
import CreateModal from './createModal'
import Swal from 'sweetalert2'
import useAuthHeaders from '@/hooks/Header'
import Image from 'next/image'
import useUtility from '@/hooks/useUtility'
import SetAssessorServices from '@/services/setAssessorServices'
import ExpositionServices from '@/services/exPositionServices'

const positionStyles: { [key: string]: string } = {
  อาจารย์: 'text-white bg-blue-500',
  รองศาสตราจารย์: 'text-white bg-green-500',
  ศาสตราจารย์: 'text-white bg-purple-500',
  ผู้ช่วยศาสตราจารย์: 'text-white bg-amber-500',
  ผู้ช่วยอาจารย์: 'text-white bg-purple-500',
}

interface Assessor {
  set_asses_list_id: number
  set_asses_info_id: number
  ex_u_id: number
  prefix_name: string
  u_fname: string
  u_img: string
  u_lname: string
  u_id_card: string
  ex_position_name: string
  date_save: string
}

const ITEMS_PER_PAGE = 10

export default function AsDetailsPage() {
  const { setBreadcrumbs } = useUtility()
  const routeParams = useParams()
  const headers = useAuthHeaders()
  const searchParams = useSearchParams()

  // Function to check if there are available examiners
  const checkAvailableExaminers = async () => {
    try {
      const response = await SetAssessorServices.getAllExUsers(
        set_asses_list_id,
        headers.Authorization?.replace('Bearer ', '') || ''
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
    }
  }
  const round_list_id = Number(Array.isArray(routeParams.round_list_id) ? routeParams.round_list_id[0] : routeParams.round_list_id)
  const set_asses_list_id = routeParams.set_asses_list_id
    ? Number(Array.isArray(routeParams.set_asses_list_id) ? routeParams.set_asses_list_id[0] : routeParams.set_asses_list_id)
    : routeParams.ex_u_id
      ? Number(Array.isArray(routeParams.ex_u_id) ? routeParams.ex_u_id[0] : routeParams.ex_u_id)
      : 0

  const [assessors, setAssessors] = useState<Assessor[]>([])
  const [expositons, setExPosition] = useState<ExPosition[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchName, setSearchName] = useState<string>('')
  const [selectedAssessor, setSelectedAssessor] = useState<string>('')
  const [currentPage, setCurrentPage] = useState(1)
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
  const [hasAvailableExaminers, setHasAvailableExaminers] = useState<boolean>(true)
  
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
      { text: 'ผู้ถูกประเมินภาระงาน', path: `/admin/set-assessor/${round_list_id}` },
      { text: 'ผู้ตรวจประเมินภาระงาน', path: `/admin/set-assessor/${round_list_id}/assessor/${set_asses_list_id}` }
      ])
  }, [setBreadcrumbs, round_list_id])

  useEffect(() => {
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
    setParams({
      search: searchFromUrl,
      page: pageFromUrl,
      limit: limitFromUrl,
      sort: sortFromUrl,
      order: orderFromUrl,
      ex_position_name: exPositionFromUrl,
    })
    if (sortFromUrl && orderFromUrl) {
      setSortState({ column: sortFromUrl, order: orderFromUrl as any })
    }
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

  const fetchAssessorData = async (
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

      const accessToken = headers.Authorization?.replace('Bearer ', '') || ''

      // ดึงข้อมูล exposition, assessee info และ assessor info พร้อมกัน
      const [resExposition, resAssesseeInfo, resAssesDetail] = await Promise.all([
        ExpositionServices.getAllExpositions(accessToken),
        SetAssessorServices.getAssesseeBySetAssesListId(set_asses_list_id, accessToken),
        SetAssessorServices.getSetAssessorInfo(set_asses_list_id, accessToken, {
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
  }

  // Auto search with debounce
  useEffect(() => {
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
    if (set_asses_list_id) {
      fetchAssessorData(
        params.search || '',
        params.limit,
        params.page,
        params.sort || '',
        params.order || '',
        params.ex_position_name || ''
      )
      // Check available examiners
      checkAvailableExaminers()
    }
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

  // Server-side filtering is now handled by the API
  const filteredAssessors = assessors

  const assessorOptions = expositons.map((expositon) => ({
    ex_position_name: expositon.ex_position_name,
    label: `${expositon.ex_position_name}`,
  }))

  const selectedLabel = selectedAssessor
    ? `ผู้ตรวจประเมิน ${selectedAssessor}`
    : 'เลือกผู้ตรวจประเมิน'

  // Define table columns
  const columns: TableColumn<Assessor>[] = [
    {
      key: 'index',
      label: '#',
      width: '80px',
      align: 'center',
      render: (_, __, index) => (
        <span className="font-regular text-sm text-gray-600 dark:text-gray-300">
          {page * rowsPerPage + index + 1}
        </span>
      ),
    },
    {
      key: 'u_img',
      label: 'รูปภาพ',
      width: '100px',
      align: 'center',
      render: (_, record) => (
        <div className="flex justify-center">
          <Image
            src={`/images/${record?.u_img || 'default.png'}`}
            alt="User Image"
            width={40}
            height={40}
            className="rounded-full border-2 object-cover"
            style={{
              width: '40px',
              height: '40px',
              objectFit: 'cover',
              borderRadius: '50%',
            }}
          />
        </div>
      ),
    },
    {
      key: 'u_fname',
      label: 'ชื่อผู้ตรวจประเมิน',
      align: 'left',
      sortable: true,
      render: (_, record) => (
        <span className="text-sm font-light text-gray-500 dark:text-gray-400">
          {record.prefix_name}{record.u_fname} {record.u_lname}
        </span>
      ),
    },
    {
      key: 'ex_position_name',
      label: 'ตำแหน่งบริหาร',
      align: 'left',
      sortable: true,
      render: (_, record) => (
        <span className="text-sm font-light text-gray-500 dark:text-gray-400">
          {record.ex_position_name}
        </span>
      ),
    },
    {
      key: 'u_id_card',
      label: 'รหัสผู้ตรวจประเมิน',
      align: 'left',
      render: (_, record) => (
        <span className="text-sm font-light text-gray-500 dark:text-gray-400">
          {record.u_id_card}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'จัดการ',
      width: '120px',
      align: 'center',
      render: (_, record) => (
        <div className="flex justify-center gap-2">
          <label
            htmlFor={`modal-delete${record.set_asses_info_id}`}
            className="cursor-pointer rounded-md border-none border-red-500 p-1 text-red-500 transition duration-300 ease-in-out hover:bg-red-500 hover:text-white"
            onClick={() => {
              setSelectedSetAssesInfoId(record.set_asses_info_id)
            }}
          >
            <Trash2 className="h-4 w-4" />
          </label>
        </div>
      ),
    },
  ]

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    setLoading(true)
    e.preventDefault()

    try {
      const dataToSubmit = {
        set_asses_list_id: Number(FormData.set_asses_list_id),
        ex_u_id: FormData.ex_u_id,
      }

      if (!dataToSubmit.ex_u_id || dataToSubmit.ex_u_id.length === 0) {
        alert('กรุณาเลือกผู้ตรวจประเมิน')
        setLoading(false)
        return
      }

      // เพิ่มผู้ตรวจประเมินแบบ multiple
      await SetAssessorServices.createSetAssessorInfoMultiple(
        dataToSubmit,
        headers.Authorization?.replace('Bearer ', '') || ''
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
        text: 'เกิดข้อผิดพลาดในการเพิ่มผู้ตรวจประเมิน',
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
      await axios.delete(
        `${process.env.NEXT_PUBLIC_API}/set_assessor_info/delete/${set_asses_info_id}`,
        { headers }
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
        text: `ลบสาขาผู้ตรวจประเมินสำเร็จ!`,
        showConfirmButton: false,
        timer: 1500,
      })
    } catch (error) {
      console.error('Error deleting assessor:', error)
      Swal.fire({
        icon: 'error',
        title: 'เกิดข้อผิดพลาด!',
        text: 'เกิดข้อผิดพลาดในการลบผู้ตรวจประเมิน',
        showConfirmButton: false,
        timer: 1500,
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="rounded-md bg-white p-4 shadow transition-all duration-300 ease-in-out dark:bg-zinc-900 dark:text-gray-400">
      <div className="pb-4">
        <h1 className="text-xl text-gray-500">
          รายชื่อผู้ตรวจประเมินภาระงานของ{' '}
          <span className="text-business1">
            {assesseeInfo ? `${assesseeInfo.prefix_name}${assesseeInfo.u_fname} ${assesseeInfo.u_lname}` : '-'}
          </span>
        </h1>
      </div>
      <div className="mb-4 flex items-end justify-between">
        <div className="flex w-full flex-wrap items-end gap-4 md:w-auto">
          {loading ? (
            <div className="skeleton h-7 w-16 rounded-md"></div>
          ) : (
            <div className="w-auto rounded-md bg-gray-200 px-2 py-1 text-sm font-normal text-business1 dark:text-gray-400">
              {filteredAssessors.length} รายการ
            </div>
          )}
        </div>
        <div className="flex items-center justify-end gap-4">
          <div className="relative flex w-full items-center md:w-52">
            <input
              className="w-full rounded-md border border-gray-300 px-4 py-2 text-sm font-light text-gray-600 transition-all duration-300 ease-in-out focus:border-blue-500 focus:outline-none dark:border-zinc-600 dark:bg-zinc-800 dark:text-gray-400"
              placeholder="ค้นหาชื่อผู้ตรวจประเมิน"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
            {searchInput && (
              <button
                onClick={clearSearch}
                className="absolute right-3 text-gray-400 transition duration-200 hover:text-red-500"
              >
                <FiX className="h-4 w-4" />
              </button>
            )}
          </div>
          <SearchFilter
            key={`exposition-${selectedAssessor}`}
            selectedLabel={selectedAssessor}
            handleSelect={handleAssessorSelect}
            objects={assessorOptions || []}
            valueKey="ex_position_name"
            labelKey="label"
            placeholder={assessorOptions && assessorOptions.length > 0 ? "เลือกตำแหน่งบริหาร" : "กำลังโหลด..."}
          />
          <div className="w-full pt-4 md:w-auto md:pt-0">
            <label
              htmlFor={hasAvailableExaminers ? "modal-create" : undefined}
              className={`flex w-full items-center justify-between gap-2 rounded-md px-4 py-2.5 text-sm font-light text-white transition duration-300 ease-in-out md:w-52 ${
                hasAvailableExaminers 
                  ? "cursor-pointer bg-success hover:bg-success/80" 
                  : "cursor-not-allowed bg-gray-400 opacity-50"
              }`}
            >
              {hasAvailableExaminers ? "เพิ่มผู้ตรวจประเมิน" : "เพิ่มผู้ตรวจประเมิน"}
              <Plus className="h-4 w-4" />
            </label>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-md bg-red-50 p-4 text-red-700 dark:bg-red-900/20 dark:text-red-400">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium">เกิดข้อผิดพลาด</h3>
              <div className="mt-2 text-sm">{error}</div>
              <div className="mt-4">
                <button
                  onClick={() => fetchAssessorData(
                    params.search || '',
                    params.limit,
                    params.page,
                    params.sort || '',
                    params.order || '',
                    params.ex_position_name || ''
                  )}
                  className="rounded-md bg-red-100 px-3 py-2 text-sm font-medium text-red-800 hover:bg-red-200 dark:bg-red-800 dark:text-red-200 dark:hover:bg-red-700"
                >
                  ลองใหม่
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {!error && (
        <Table
          data={filteredAssessors}
          columns={columns}
          loading={loading}
          total={total}
          currentPage={page + 1}
          totalPages={Math.ceil(total / rowsPerPage)}
          rowsPerPage={rowsPerPage}
          onPageChange={(newPage) => handlePageChange(newPage - 1)}
          onRowsPerPageChange={handleRowsPerPageChange}
          emptyMessage={'ไม่พบข้อมูลผู้ตรวจประเมิน'}
          skeletonRows={rowsPerPage}
          stickyColumns={1}
          sortable={true}
          sortState={sortState}
          onSort={handleSort}
          rowsPerPageOptions={[10, 20, 50, 100, 200]}
        />
      )}

      <CreateModal
        isLoading={loading}
        handleSubmit={handleSubmit}
        formData={FormData}
        setFormData={setFormData}
        expositons={expositons}
        round_list_id={round_list_id}
        onSuccess={() => {
          // Refresh the assessors list after successful addition
          fetchAssessorData(
            searchName,
            rowsPerPage,
            page,
            sortState.column || 'date_save',
            sortState.order || 'desc',
            ''
          )
          
          // Check available examiners after successful addition
          checkAvailableExaminers()
          
          // Show success SweetAlert after modal closes
          Swal.fire({
            position: 'center',
            icon: 'success',
            title: 'สำเร็จ!',
            text: `เพิ่มผู้ตรวจประเมิน สำเร็จ!`,
            showConfirmButton: false,
            timer: 1500,
          })
        }}
      />

      <DeleteModal
        isLoading={loading}
        set_asses_info_id={selectedSetAssesInfoId}
        handleDelete={handleDelete}
      />
    </div>
  )
}
