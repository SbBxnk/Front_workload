'use client'
import type React from 'react'
import { Edit2, Plus, Trash2, Eye, Loader } from 'lucide-react'
import { FiX } from 'react-icons/fi'
import { useEffect, useState } from 'react'
import CreateModal from './createModal'
import DeleteModal from './deleteModal'
import EditModal from './editModal'
import Swal from 'sweetalert2'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Table, { TableColumn, SortState } from '@/components/Table'
import SearchFilter from '@/components/SearchFilter'
import SetAssessorServices, { RoundList, CreateRoundListRequest, UpdateRoundListRequest } from '@/services/setAssessorServices'
import useUtility from '@/hooks/useUtility'

const ITEMS_PER_PAGE = 10

interface FormDataRoundList {
  round_list_id: number
  round_list_name: string
  date_start: string
  date_end: string
  year: string
  round: number
}

const FormRoundList: FormDataRoundList = {
  round_list_id: 0,
  round_list_name: '',
  date_start: '',
  date_end: '',
  year: '',
  round: 0,
}

type Order = 'asc' | 'desc'

const formatThaiDate = (dateString: string) => {
  if (!dateString) return '-'

  const date = new Date(dateString)
  if (isNaN(date.getTime())) return dateString

  const day = date.getDate()
  const year = date.getFullYear() + 543

  const thaiMonths = [
    'มกราคม',
    'กุมภาพันธ์',
    'มีนาคม',
    'เมษายน',
    'พฤษภาคม',
    'มิถุนายน',
    'กรกฎาคม',
    'สิงหาคม',
    'กันยายน',
    'ตุลาคม',
    'พฤศจิกายน',
    'ธันวาคม',
  ]

  const month = thaiMonths[date.getMonth()]

  return `${day} ${month} ${year}`
}

const isDateInRange = (startDate: string, endDate: string): boolean => {
  if (!startDate || !endDate) return false

  const currentDate = new Date()
  const end = new Date(endDate)

  // Allow editing if current date is before or within the date range (not after end date)
  return currentDate <= end
}

function SetAssessor() {
  const { setBreadcrumbs } = useUtility()
  const { data: session } = useSession()
  const router = useRouter()
  const [FormData, setFormData] = useState<FormDataRoundList>(FormRoundList)
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string>('')
  const [order, setOrder] = useState<Order>('asc')
  const [orderBy, setOrderBy] = useState<string>('')
  const [page, setPage] = useState<number>(0)
  const [rowsPerPage, setRowsPerPage] = useState<number>(10)
  const [total, setTotal] = useState<number>(0)
  const [data, setData] = useState<RoundList[]>([])
  const [searchInput, setSearchInput] = useState<string>('')
  const [params, setParams] = useState({
    search: '',
    page: 1,
    limit: 10,
    sort: '',
    order: '',
    year: '',
  })
  const [selectedRoundList, setSelectedRoundList] = useState<string>('')
  const [selectedRoundListId, setSelectedRoundListId] = useState<number>(0)
  const [selectedRoundListName, setSelectedRoundListName] = useState<string>('')
  const [roundsWithAssessorData, setRoundsWithAssessorData] = useState<number[]>([])
  const [sortState, setSortState] = useState<SortState>({
    column: null,
    order: null,
  })

  useEffect(() => {
    setBreadcrumbs(
      [{ text: 'รอบประเมินภาระงาน', path: '/admin/set-assessor' },
    ])
  }, [setBreadcrumbs])

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const searchFromUrl = urlParams.get('search') || ''
    const pageFromUrl = parseInt(urlParams.get('page') || '1', 10)
    const limitFromUrl = parseInt(urlParams.get('limit') || '10', 10)
    const sortFromUrl = urlParams.get('sort') || ''
    const orderFromUrl = urlParams.get('order') || ''
    const yearFromUrl = urlParams.get('year') || ''

    setSearchInput(searchFromUrl)
    setParams({
      search: searchFromUrl,
      page: pageFromUrl,
      limit: limitFromUrl,
      sort: sortFromUrl,
      order: orderFromUrl,
      year: yearFromUrl,
    })
    if (sortFromUrl && orderFromUrl) {
      setOrderBy(sortFromUrl)
      setOrder(orderFromUrl as Order)
    }
  }, [])

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
    if (session?.accessToken) {
      fetchRoundListData()
    }
  }, [
    params.search,
    params.page,
    params.limit,
    params.sort,
    params.order,
    params.year,
    session?.accessToken,
  ])

  const checkRoundHasAssessorData = async (round_list_id: number) => {
    try {
      if (!session?.accessToken) return false
      
      const response = await SetAssessorServices.getSetAssessorListByRound(
        round_list_id,
        session.accessToken
      )
      
      if (response.payload && Array.isArray(response.payload) && response.payload.length > 0) {
        return true
      }
      return false
    } catch (error) {
      console.error(
        `Error checking assessor data for round ${round_list_id}:`,
        error
      )
      return false
    }
  }

  const fetchRoundListData = async () => {
    try {
      if (!session?.accessToken) {
        setLoading(false)
        setError('กรุณาเข้าสู่ระบบก่อน')
        return
      }
      
      setLoading(true)
      setError('')

      const response = await SetAssessorServices.getAllRoundLists(session.accessToken, {
        search: params.search,
        page: params.page,
        limit: params.limit,
        sort: params.sort || 'date_save',
        order: params.order,
        year: params.year,
      })
      
      let roundsData: RoundList[] = []
      if (response.payload && Array.isArray(response.payload)) {
        roundsData = response.payload
      } else {
        console.error('ข้อมูลที่ได้รับไม่ใช่รูปแบบที่คาดหวัง')
        setError('ไม่สามารถโหลดข้อมูลได้')
        setLoading(false)
        return
      }

      setData(roundsData)
      
      // ใช้ meta ข้อมูลจาก API
      if (response.meta) {
        setTotal(response.meta.total_rows)
      } else {
        setTotal(roundsData.length)
      }

      // Check which rounds have assessor data (ทำแบบ parallel เพื่อความเร็ว)
      const assessorDataPromises = roundsData.map(round => 
        checkRoundHasAssessorData(round.round_list_id)
      )

      const assessorResults = await Promise.all(assessorDataPromises)
      const roundsWithData: number[] = []
      
      roundsData.forEach((round, index) => {
        if (assessorResults[index]) {
          roundsWithData.push(round.round_list_id)
        }
      })
      
      setRoundsWithAssessorData(roundsWithData)
      setLoading(false)
      
      // Update URL parameters
      updateUrlParams({
        search: params.search,
        page: params.page,
        limit: params.limit,
        sort: params.sort,
        order: params.order,
        year: params.year,
      })
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err)
      console.error(`ไม่สามารถดึงข้อมูลได้: ${errorMessage}`)
      setError('เกิดข้อผิดพลาดในการโหลดข้อมูล')
      setLoading(false)
    }
  }

  const updateUrlParams = (newParams: {
    search?: string
    page?: number
    limit?: number
    sort?: string
    order?: string
    year?: string
  }) => {
    const searchParams = new URLSearchParams()
    if (newParams.search) searchParams.set('search', newParams.search)
    if (newParams.page) searchParams.set('page', newParams.page.toString())
    if (newParams.limit) searchParams.set('limit', newParams.limit.toString())
    if (newParams.sort) {
      searchParams.set('sort', newParams.sort)
    }
    if (newParams.order) {
      searchParams.set('order', newParams.order)
    }
    if (newParams.year) {
      searchParams.set('year', newParams.year)
    }
    window.history.replaceState({}, '', `?${searchParams.toString()}`)
  }

  const clearSearch = () => {
    setSearchInput('')
    setParams((prev) => ({
      ...prev,
      search: '',
      page: 1,
    }))
  }


  const handlePageChange = (newPage: number) => {
    setPage(newPage)
    setParams((prev) => ({
      ...prev,
      page: newPage + 1,
    }))
  }

  const handleRowsPerPageChange = (newRowsPerPage: number) => {
    setRowsPerPage(newRowsPerPage)
    setPage(0)
    setParams((prev) => ({
      ...prev,
      limit: newRowsPerPage,
      page: 1,
    }))
  }

  const handleRoundListSelect = (value: string) => {
    setSelectedRoundList(value)
    setParams((prev) => ({
      ...prev,
      year: value,
      page: 1,
    }))
    setPage(0)
  }

  // ใช้ข้อมูลจาก API โดยตรง ไม่ต้อง filter อีก
  const currentData = data
  const totalPages = Math.ceil(total / rowsPerPage)
  const selectedLabel =
    data.find((pos) => pos.year === selectedRoundList)?.year ||
    'เลือกรอบการประเมิน'

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target

    if (name === 'date_start' || name === 'date_end') {
      setFormData((prev) => ({ ...prev, [name]: value }))
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }))
    }
  }

  const handleRoundChange = (round: number) => {
    if (round === 0) {
      // เมื่อกด X หรือล้างข้อมูล ให้ล้างข้อมูลทั้งหมด
      setFormData({
        round_list_id: 0,
        round_list_name: '',
        date_start: '',
        date_end: '',
        year: '',
        round: 0,
      })
    } else {
      setFormData((prev) => ({ ...prev, round }))
    }
  }

  

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement> | React.MouseEvent
  ) => {
    if (!session?.accessToken) return
    
    setLoading(true)
    e.preventDefault()
    try {
      const formattedData: CreateRoundListRequest = {
        ...FormData,
        round_list_name: FormData.round_list_name.startsWith(
          'รอบการประเมินภาระงาน'
        )
          ? FormData.round_list_name
          : `รอบการประเมินภาระงานที่ ${FormData.round}/${FormData.year}`,
      }

      await SetAssessorServices.createRoundList(formattedData, session.accessToken)
      setFormData(FormRoundList)
      await fetchRoundListData()

      setLoading(false)
      Swal.fire({
        position: 'center',
        icon: 'success',
        title: 'สำเร็จ!',
        text: `เพิ่มรอบการประเมิน ${formattedData.round_list_name} สำเร็จ!`,
        showConfirmButton: false,
        timer: 1500,
      })
    } catch (error) {
      console.error('Error adding round list:', error)
      setLoading(false)
      Swal.fire({
        position: 'center',
        icon: 'error',
        title: 'เกิดข้อผิดพลาด!',
        text: 'เกิดข้อผิดพลาดในการเพิ่มรอบการประเมิน',
        showConfirmButton: false,
        timer: 1500,
      })
    }
  }

  const handleDelete = async (
    e: React.FormEvent<HTMLFormElement> | React.MouseEvent,
    round_list_id: number,
    round_list_name: string
  ) => {
    if (!session?.accessToken) return
    
    e.preventDefault()
    setLoading(true)
    try {
      await SetAssessorServices.deleteRoundList(round_list_id, session.accessToken)
      await fetchRoundListData()
      setLoading(false)

      Swal.fire({
        icon: 'success',
        title: 'ลบสำเร็จ!',
        text: `ลบรอบการประเมิน ${round_list_name} สำเร็จ!`,
        showConfirmButton: false,
        timer: 1500,
      })
    } catch {
      await fetchRoundListData()
      setLoading(false)
      Swal.fire({
        icon: 'error',
        title: 'เกิดข้อผิดพลาด!',
        text: 'เกิดข้อผิดพลาดในการลบรอบการประเมิน',
        showConfirmButton: false,
        timer: 1500,
      })
    }
  }

  const handleEdit = async (
    e: React.FormEvent<HTMLFormElement> | React.MouseEvent,
    round_list_id: number,
    updateRoundList: RoundList
  ) => {
    if (!session?.accessToken) return
    
    e.preventDefault()
    setLoading(true)
    try {
      // Use the updateRoundList data passed from the EditModal component
      const formattedData: UpdateRoundListRequest = {
        ...updateRoundList,
        round_list_name: `รอบการประเมินภาระงานที่ ${updateRoundList.round}/${updateRoundList.year}`,
      }

      await SetAssessorServices.updateRoundList(round_list_id, formattedData, session.accessToken)
      await fetchRoundListData()
      setLoading(false)

      Swal.fire({
        icon: 'success',
        title: 'แก้ไขสำเร็จ!',
        text: `แก้ไข ${formattedData.round_list_name} สำเร็จ!`,
        showConfirmButton: false,
        timer: 1500,
      })
    } catch (error) {
      console.error('Error edit round list:', error)
      await fetchRoundListData()
      setLoading(false)

      Swal.fire({
        icon: 'error',
        title: 'เกิดข้อผิดพลาด!',
        text: 'เกิดข้อผิดพลาดในการแก้ไขรอบการประเมิน',
        showConfirmButton: false,
        timer: 1500,
      })
    }
  }

  const handleSetAssessorInfo = (round_list_id: number) => {
    router.push(`/admin/set-assessor/${round_list_id}`)
  }

  const uniqueYears = Array.from(new Set(data.map((item) => item.year)))

  // Define table columns
  const columns: TableColumn<RoundList>[] = [
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
      key: 'round_list_name',
      label: 'รอบการประเมิน',
      align: 'left',
      sortable: true,
      render: (value) => (
        <span className="text-sm font-light text-gray-500 dark:text-gray-400">
          {value || '-'}
        </span>
      ),
    },
    {
      key: 'date_start',
      label: 'วันที่เริ่มต้น',
      align: 'left',
      sortable: true,
      render: (value) => (
        <span className="text-sm font-light text-gray-500 dark:text-gray-400">
          {formatThaiDate(value) || '-'}
        </span>
      ),
    },
    {
      key: 'date_end',
      label: 'วันที่สิ้นสุด',
      align: 'left',
      sortable: true,
      render: (value) => (
        <span className="text-sm font-light text-gray-500 dark:text-gray-400">
          {formatThaiDate(value) || '-'}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'จัดการ',
      width: '200px',
      align: 'center',
      render: (_, record) => (
        <div className="w-full flex justify-center gap-2 p-0">
              <button
            type="button"
            className="cursor-pointer rounded-md p-1 text-blue-500 transition duration-300 ease-in-out hover:bg-blue-500 hover:text-white"
            onClick={() => handleSetAssessorInfo(record.round_list_id)}
                      >
                        <Eye className="h-4 w-4" />
                      </button>
          {isDateInRange(record.date_start, record.date_end) ? (
            <>
              <button
                type="button"
                className="cursor-pointer rounded-md p-1 text-yellow-500 transition duration-300 ease-in-out hover:bg-yellow-500 hover:text-white"
                            onClick={() => {
                  console.log('Edit button clicked for round_list_id:', record.round_list_id)
                  setSelectedRoundListId(record.round_list_id)
                  // Use setTimeout to ensure state is updated before opening modal
                  setTimeout(() => {
                    const modal = document.getElementById(
                      `modal-edit`
                    ) as HTMLInputElement
                    if (modal) {
                      console.log('Opening edit modal')
                      modal.checked = true
                    } else {
                      console.log('Modal element not found')
                    }
                  }, 0)
                            }}
                          >
                            <Edit2 className="h-4 w-4" />
              </button>
              {!roundsWithAssessorData.includes(record.round_list_id) ? (
                <button
                  type="button"
                  className="cursor-pointer rounded-md p-1 text-red-500 transition duration-300 ease-in-out hover:bg-red-500 hover:text-white"
                              onClick={() => {
                    setSelectedRoundListId(record.round_list_id)
                    setSelectedRoundListName(record.round_list_name)
                    // Trigger modal
                    const modal = document.getElementById(
                      `modal-delete`
                    ) as HTMLInputElement
                    if (modal) modal.checked = true
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                </button>
                          ) : (
                            <button
                              disabled
                              className="cursor-not-allowed rounded-md border-none border-gray-400 p-1 text-gray-300"
                              title="ไม่สามารถลบได้เนื่องจากมีข้อมูลผู้ประเมินในรอบนี้"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </>
                      ) : (
                        <>
                          <button
                            disabled
                            className="cursor-not-allowed rounded-md border-none border-gray-400 p-1 text-gray-300"
                            title="ไม่สามารถแก้ไขได้เนื่องจากอยู่นอกช่วงเวลาที่กำหนด"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            disabled
                            className="cursor-not-allowed rounded-md border-none border-gray-400 p-1 text-gray-300"
                            title="ไม่สามารถลบได้เนื่องจากอยู่นอกช่วงเวลาที่กำหนด"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </>
                      )}
        </div>
      ),
    },
  ]

  return (
    <div className="rounded-md bg-white p-4 shadow transition-all duration-300 ease-in-out dark:bg-zinc-900 dark:text-gray-400">
      <div className="mb-4 flex items-end justify-between">
        <div className="flex w-full flex-wrap items-end gap-4 md:w-auto">
          {loading ? (
            <div className="skeleton h-7 w-16 rounded-md"></div>
          ) : (
            <div className="w-auto rounded-md bg-gray-200 px-2 py-1 text-sm font-normal text-business1 dark:text-gray-400">
              {total} รายการ
            </div>
          )}
        </div>
        <div className="flex items-center justify-end gap-4">
          <div className="relative flex w-full items-center md:w-52">
            <input
              className="w-full rounded-md border border-gray-300 px-4 py-2 text-sm font-light text-gray-600 transition-all duration-300 ease-in-out focus:border-blue-500 focus:outline-none dark:border-zinc-600 dark:bg-zinc-800 dark:text-gray-400"
              placeholder="ค้นหารอบการประเมินภาระงาน"
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
          <SearchFilter<RoundList, 'year'>
            selectedLabel={selectedLabel}
            handleSelect={handleRoundListSelect}
            objects={uniqueYears.map((year) => ({
              year,
              round_list_id: 0,
              round_list_name: '',
              date_start: '',
              date_end: '',
              round: 0,
            }))}
            valueKey="year"
            labelKey="year"
            placeholder="ค้นหาปีรอบการประเมิน"
          />
          <div className="w-full pt-4 md:w-auto md:pt-0">
            <label
              htmlFor={`modal-create`}
              className="flex w-full cursor-pointer items-center justify-between gap-2 rounded-md bg-success px-4 py-2.5 text-sm font-light text-white transition duration-300 ease-in-out hover:bg-success/80 md:w-52"
            >
              เพิ่มรอบการประเมิน
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
                  onClick={() => fetchRoundListData()}
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
          data={currentData}
          columns={columns}
          loading={loading}
          sortState={sortState}
          onSort={(column, order) => {
            setSortState({ column, order })
            setOrderBy(column)
            setOrder(order || 'asc')
            setParams((prev) => ({
              ...prev,
              sort: order ? column : '',
              order: order || '',
              page: 1,
            }))
            setPage(0)
          }}
          currentPage={page}
          rowsPerPage={rowsPerPage}
          total={total}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          onRowsPerPageChange={handleRowsPerPageChange}
          emptyMessage="ไม่พบข้อมูลรอบการประเมิน"
          skeletonRows={rowsPerPage}
          />
      )}

          <CreateModal
            isLoading={loading}
            handleSubmit={handleSubmit}
            formData={FormData}
            handleInputChange={handleInputChange}
            handleRoundChange={handleRoundChange}
          />
          <DeleteModal
            isLoading={loading}
            round_list_id={selectedRoundListId}
            round_list_name={selectedRoundListName}
            handleDelete={handleDelete}
          />
          <EditModal
            isLoading={loading}
            handleEdit={handleEdit}
            round_list_id={selectedRoundListId}
          />
    </div>
  )
}

export default SetAssessor
