'use client'
import type React from 'react'
import { Edit2, Plus, Trash2, Eye, Loader } from 'lucide-react'
import { FiX } from 'react-icons/fi'
import { useEffect, useState, useRef, useCallback } from 'react'
import Swal from 'sweetalert2'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Table, { TableColumn, SortState } from '@/components/Table'
import SearchFilter from '@/components/SearchFilter'
import AssessorServices, { Params, RoundList } from '@/services/assessorService'
import useUtility from '@/hooks/useUtility'
import { useAssessorContext } from '@/provider/AssessorProvider'
import AssesseeService from '@/services/assesseeService'
import { jwtDecode } from 'jwt-decode'
import { DecodedToken } from '@/Types/decodetoken'


interface FormDataRoundList {
  round_list_id: number
  round_list_name: string
  date_start: string
  date_end: string
  year: string
  round: number
  form_count: number
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

const isCurrentRound = (startDate: string, endDate: string) => {
  const now = new Date()
  const start = new Date(startDate)
  const end = new Date(endDate)

  return now >= start && now <= end
}

function SetAssessor() {
  const { setBreadcrumbs } = useUtility()
  const { data: session } = useSession()
  const router = useRouter()
  const { isAssessor, assessorId, roundListId } = useAssessorContext()
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string>('')
  const [order, setOrder] = useState<Order>('asc')
  const [orderBy, setOrderBy] = useState<string>('')
  const [page, setPage] = useState<number>(0)
  const [rowsPerPage, setRowsPerPage] = useState<number>(10)
  const [total, setTotal] = useState<number>(0)
  const [data, setData] = useState<RoundList[]>([])
  const [searchInput, setSearchInput] = useState<string>('')
  const [count, setCount] = useState<number>(0)
  const [roundId, setRoundId] = useState<string>('')
  const [params, setParams] = useState({
    search: '',
    page: 1,
    limit: 10,
    sort: '',
    order: '',
    year: '',
  })
  const [selectedRoundList, setSelectedRoundList] = useState<string>('')
  const [sortState, setSortState] = useState<SortState>({
    column: null,
    order: null,
  })
  
  const isInitialized = useRef(false)
  const hasFetchedInitial = useRef(false)
  const isFirstRender = useRef(true)
  const prevParamsRef = useRef<string>('')

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

  const fetchRoundListData = useCallback(async (queryParams: Params) => {
    try {
      if (!session?.accessToken) {
        setLoading(false)
        setError('กรุณาเข้าสู่ระบบก่อน')
        return
      }

      setLoading(true)
      setError('')

      const decoded: DecodedToken = jwtDecode(session.accessToken)
      
      const response = await AssessorServices.checkRound(queryParams, session.accessToken)

      let roundsData: RoundList[] = []
      if (response.payload && Array.isArray(response.payload)) {
        roundsData = response.payload
        
        // ดึงจำนวนผู้ถูกประเมินสำหรับแต่ละ round
        const roundsWithCount = await Promise.all(
          roundsData.map(async (round) => {
            try {
              const assesseesData = await AssesseeService.getAssesseesByRound(
                decoded.id,
                round.round_list_id,
                session.accessToken as string
              )
              return {
                ...round,
                form_count: assesseesData.length
              }
            } catch (error) {
              console.error(`Error fetching assessees for round ${round.round_list_id}:`, error)
              return {
                ...round,
                form_count: 0
              }
            }
          })
        )
        
        roundsData = roundsWithCount
        
        if (roundsData.length > 0) {
          setRoundId(roundsData[0].round_list_id.toString())
          setCount(roundsData[0].form_count)
        }
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

      setLoading(false)

      // Update URL parameters
      updateUrlParams({
        search: queryParams.search,
        page: Number(queryParams.page),
        limit: Number(queryParams.limit),
        sort: queryParams.sort,
        order: queryParams.order,
        year: queryParams.year,
      })
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err)
      console.error(`ไม่สามารถดึงข้อมูลได้: ${errorMessage}`)
      setError('เกิดข้อผิดพลาดในการโหลดข้อมูล')
      setLoading(false)
    }
  }, [session?.accessToken])

  useEffect(() => {
    setBreadcrumbs(
      [{ text: 'ตรวจประเมินภาระงาน', path: '/admin/assessment' },
      ])
  }, [setBreadcrumbs])

  // Initialize params from URL and fetch data immediately
  useEffect(() => {
    if (!session?.accessToken) return
    
    const urlParams = new URLSearchParams(window.location.search)
    const searchFromUrl = urlParams.get('search') || ''
    const pageFromUrl = parseInt(urlParams.get('page') || '1', 10)
    const limitFromUrl = parseInt(urlParams.get('limit') || '10', 10)
    const sortFromUrl = urlParams.get('sort') || ''
    const orderFromUrl = urlParams.get('order') || ''
    const yearFromUrl = urlParams.get('year') || ''

    setSearchInput(searchFromUrl)
    
    const initialParams = {
      search: searchFromUrl,
      page: pageFromUrl,
      limit: limitFromUrl,
      sort: sortFromUrl,
      order: orderFromUrl,
      year: yearFromUrl,
    }
    
    if (sortFromUrl && orderFromUrl) {
      setOrderBy(sortFromUrl)
      setOrder(orderFromUrl as Order)
    }

    // Fetch data immediately with initial params (only once)
    if (!hasFetchedInitial.current) {
      hasFetchedInitial.current = true
      
      // Set initial params ref to prevent duplicate fetch
      prevParamsRef.current = JSON.stringify({
        search: initialParams.search,
        page: initialParams.page,
        limit: initialParams.limit,
        sort: initialParams.sort,
        order: initialParams.order,
        year: initialParams.year,
      })
      
      fetchRoundListData({
        ...initialParams,
        page: initialParams.page.toString(),
        limit: initialParams.limit.toString()
      })
    }
    
    // Set params AFTER fetch to prevent triggering the params change useEffect
    setParams(initialParams)
    isInitialized.current = true
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.accessToken])

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

  // Fetch data when params change (excluding initial load)
  useEffect(() => {
    if (!session?.accessToken || !isInitialized.current || !hasFetchedInitial.current) {
      return
    }
    
    // Create a string representation of current params to compare
    const currentParamsString = JSON.stringify({
      search: params.search,
      page: params.page,
      limit: params.limit,
      sort: params.sort,
      order: params.order,
      year: params.year,
    })
    
    // Only fetch if params actually changed
    if (currentParamsString !== prevParamsRef.current) {
      prevParamsRef.current = currentParamsString
      fetchRoundListData({
        ...params,
        page: params.page.toString(),
        limit: params.limit.toString()
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    session?.accessToken,
    params.search,
    params.page,
    params.limit,
    params.sort,
    params.order,
    params.year,
  ])






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
    data.find((pos) => pos.year.toString() === selectedRoundList)?.year?.toString() ||
    'เลือกรอบการประเมิน'

  const handleSetAssessorInfo = (round_list_id: number) => {
    router.push(`/user/assessment/${round_list_id}/form-list`)
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
      key: 'form_count',
      label: 'จำนวนผู้ถูกประเมิน',
      align: 'left',
      sortable: true,
      render: (value) => (
        <span className="text-sm font-light text-gray-500 dark:text-gray-400">
          {value || 0}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'สถานะ',
      align: 'left',
      sortable: true,
        render: (_, record) => (
          <span className={`inline-flex px-2 py-1 text-xs font-normal rounded-md ${
            isCurrentRound(record.date_start, record.date_end)
              ? 'bg-amber-500 text-white'
              : 'bg-gray-300 text-gray-500'
          }`}>
            {isCurrentRound(record.date_start, record.date_end)
              ? 'กำลังดำเนินการ'
              : 'สิ้นสุดการประเมิน'
          }</span>
        ),
    },
    {
      key: 'actions',
      label: 'จัดการ',
      width: 'auto',
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
              form_count: 0,
            }))}
            valueKey="year"
            labelKey="year"
            placeholder="ค้นหาปีรอบการประเมิน"
          />
        </div>
      </div>



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
    </div>
  )
}

export default SetAssessor
