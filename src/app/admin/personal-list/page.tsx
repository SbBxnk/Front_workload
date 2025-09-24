'use client'
import type React from 'react'
import { useEffect, useState } from 'react'
import { Edit2, Plus, Trash2 } from 'lucide-react'
import type { Personal, Position, Branch, Course, UserLevel, ExPosition } from '@/Types'
import { UserSearchParams } from '@/services/userServices'
import { FiFilter  } from 'react-icons/fi'
import { LuDelete } from "react-icons/lu";
import SearchFilter from '@/components/SearchFilter'
import Swal from 'sweetalert2'
import UserServices from '@/services/userServices'
import { useSession } from 'next-auth/react'
import Table, { TableColumn, SortState, SortOrder } from '@/components/Table'
import { useRouter } from 'next/navigation'
import useFetchData from '@/hooks/FetchAPI'
import DeleteModal from './Personal-listComponents/DeletePersonalModal'
import UpdatePersonalModal from './Personal-listComponents/UpdatePersonalModal'
import FilterDialog from './Personal-listComponents/FilterDialog'
import useUtility from '@/hooks/useUtility'

const positionStyles: { [key: string]: string } = {
  อาจารย์: 'text-white bg-blue-500',
  รองศาสตราจารย์: 'text-white bg-green-500',
  ศาสตราจารย์: 'text-white bg-purple-500',
  ผู้ช่วยศาสตราจารย์: 'text-white bg-amber-500',
  ผู้ช่วยอาจารย์: 'text-white bg-purple-500',
}

const ITEMS_PER_PAGE = 10

type Order = 'asc' | 'desc'

function PersonalListTable() {
  const { data: session } = useSession()
  const { setBreadcrumbs } = useUtility()
  const router = useRouter()
  const [loading, setLoading] = useState<boolean>(false)
  const [order, setOrder] = useState<Order>('asc')
  const [orderBy, setOrderBy] = useState<string>('')
  const [page, setPage] = useState<number>(0)
  const [rowsPerPage, setRowsPerPage] = useState<number>(10)
  const [total, setTotal] = useState<number>(0)
  const [data, setData] = useState<Personal[]>([])
  const [params, setParams] = useState<UserSearchParams>({
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
  })
  const [searchInput, setSearchInput] = useState<string>('')
  const [selectedPosition, setSelectedPosition] = useState<string>('')
  const [selectedBranch, setSelectedBranch] = useState<string>('')
  const [selectedCourse, setSelectedCourse] = useState<string>('')
  const [selectedExPosition, setSelectedExPosition] = useState<string>('')
  const [selectedGender, setSelectedGender] = useState<string>('')
  const [selectedLevel, setSelectedLevel] = useState<string>('')
  const [selectedUserId, setSelectedUserId] = useState<number>(0)
  const [selectedUserName, setSelectedUserName] = useState<string>('')
  const [selectedUserData, setSelectedUserData] = useState<Personal | null>(
    null
  )
  const [sortState, setSortState] = useState<SortState>({
    column: null,
    order: null,
  })
  const [isFilterDialogOpen, setIsFilterDialogOpen] = useState<boolean>(false)
  
  // Temporary filter state for dialog (not applied until search is clicked)
  const [tempFilters, setTempFilters] = useState({
    position_name: '',
    branch_name: '',
    course_name: '',
    ex_position_name: '',
    gender: '',
  })

  // Fetching data using custom hook for dropdowns
  const {
    data: positions,
    loading: positionLoading,
    error: positionError,
  } = useFetchData<Position[]>('/position')
  const {
    data: branchs,
    loading: branchLoading,
    error: branchError,
  } = useFetchData<Branch[]>('/branch')
  const {
    data: courses,
    loading: courseLoading,
    error: courseError,
  } = useFetchData<Course[]>('/course')
  const {
    data: exPositions,
    loading: exPositionLoading,
    error: exPositionError,
  } = useFetchData<ExPosition[]>('/ex_position')

  const {
    data: levels,
    loading: levelLoading,
    error: levelError,
  } = useFetchData<UserLevel[]>('/level')

  // Define table columns
  const columns: TableColumn<Personal>[] = [
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
      render: (value, row) => (
        <div className="flex justify-center">
          <img
            src={`/images/${row?.u_img || 'default.png'}`}
            alt="User Image"
            className="h-10 w-10 rounded-full border-2 object-cover"
          />
        </div>
      ),
    },
    {
      key: 'name',
      label: 'ชื่อ',
      align: 'left',
      sortable: false,
      render: (_, row) => (
        <span className="text-sm font-light text-gray-500 dark:text-gray-400">
          {row?.prefix_name || ''}
          {row?.u_fname || ''} {row?.u_lname || ''}
        </span>
      ),
    },
    {
      key: 'position_name',
      label: 'ตำแหน่งวิชาการ',
      align: 'left',
      sortable: true,
      render: (value) => (
        <span
          className={`inline-block rounded-md ${positionStyles[value as string] || 'bg-gray-600 text-white'} px-2 py-0.5 text-sm font-light`}
        >
          {value || '-'}
        </span>
      ),
    },
    {
      key: 'ex_position_name',
      label: 'ตำแหน่งบริหาร',
      align: 'left',
      sortable: true,
      render: (value) => (
        <span className="text-sm font-light text-gray-500 dark:text-gray-400">
          {value || '-'}
        </span>
      ),
    },
    {
      key: 'u_id_card',
      label: 'เลขประจำตัวประชาชน',
      align: 'center',
      sortable: false,
      render: (value) => (
        <span className="text-sm font-light text-gray-500 dark:text-gray-400">
          {value || '-'}
        </span>
      ),
    },
    {
      key: 'u_email',
      label: 'อีเมล',
      align: 'left',
      sortable: false,
      render: (value) => (
        <span className="text-sm font-light text-gray-500 dark:text-gray-400">
          {value || '-'}
        </span>
      ),
    },
    {
      key: 'u_tel',
      label: 'เบอร์ติดต่อ',
      align: 'center',
      sortable: false,
      render: (value) => (
        <span className="text-sm font-light text-gray-500 dark:text-gray-400">
          {value || '-'}
        </span>
      ),
    },
    {
      key: 'age',
      label: 'อายุ',
      align: 'center',
      sortable: true,
      render: (value) => (
        <span className="text-sm font-light text-gray-500 dark:text-gray-400">
          {value || '-'}
        </span>
      ),
    },
    {
      key: 'gender',
      label: 'เพศ',
      align: 'left',
      sortable: false,
      render: (value) => (
        <span className="text-sm font-light text-gray-500 dark:text-gray-400">
          {value || '-'}
        </span>
      ),
    },
    {
      key: 'salary',
      label: 'เงินเดือน',
      align: 'center',
      sortable: false,
      render: (value) => (
        <span className="text-sm font-light text-gray-500 dark:text-gray-400">
          {value || '-'}
        </span>
      ),
    },
    {
      key: 'branch_name',
      label: 'สาขา',
      align: 'left',
      sortable: true,
      render: (value) => (
        <span className="text-sm font-light text-gray-500 dark:text-gray-400">
          {value || '-'}
        </span>
      ),
    },
    {
      key: 'course_name',
      label: 'หลักสูตร',
      align: 'left',
      sortable: true,
      render: (value) => (
        <span className="text-sm font-light text-gray-500 dark:text-gray-400">
          {value || '-'}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'จัดการ',
      width: '120px',
      align: 'center',
      render: (_, row, index) => (
        <div className="flex w-full justify-center gap-2 p-0">
          <button
            type="button"
            className="cursor-pointer rounded-md p-1 text-yellow-500 transition duration-300 ease-in-out hover:bg-yellow-500 hover:text-white"
            onClick={() => {
              setSelectedUserId(row.u_id)
              setSelectedUserName(
                `${row.prefix_name}${row.u_fname} ${row.u_lname}`
              )
              setSelectedUserData(row)
              // Trigger modal
              const modal = document.getElementById(
                `modal-edit${row.u_id}`
              ) as HTMLInputElement
              if (modal) modal.checked = true
            }}
          >
            <Edit2 className="h-4 w-4" />
          </button>
          <button
            type="button"
            className="cursor-pointer rounded-md p-1 text-red-500 transition duration-300 ease-in-out hover:bg-red-500 hover:text-white"
            onClick={() => {
              setSelectedUserId(row.u_id)
              setSelectedUserName(
                `${row.prefix_name}${row.u_fname} ${row.u_lname}`
              )
              // Trigger modal
              const modal = document.getElementById(
                `modal-delete${row.u_id}`
              ) as HTMLInputElement
              if (modal) modal.checked = true
            }}
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ]

  useEffect(() => {
    setBreadcrumbs([{ text: 'รายชื่อบุคลากร', path: '/admin/personal-list' }])

    const urlParams = new URLSearchParams(window.location.search)
    const searchFromUrl = urlParams.get('search') || ''
    const pageFromUrl = parseInt(urlParams.get('page') || '1', 10)
    const limitFromUrl = parseInt(urlParams.get('limit') || '10', 10)
    const sortFromUrl = urlParams.get('sort') || ''
    const orderFromUrl = urlParams.get('order') || ''
    const positionFromUrl = urlParams.get('position_name') || ''
    const branchFromUrl = urlParams.get('branch_name') || ''
    const courseFromUrl = urlParams.get('course_name') || ''
    const exPositionFromUrl = urlParams.get('ex_position_name') || ''
    const genderFromUrl = urlParams.get('gender') || ''

    setSearchInput(searchFromUrl)
    setSelectedPosition(positionFromUrl)
    setSelectedBranch(branchFromUrl)
    setSelectedCourse(courseFromUrl)
    setSelectedExPosition(exPositionFromUrl)
    setSelectedGender(genderFromUrl)
    setParams({
      search: searchFromUrl,
      page: pageFromUrl,
      limit: limitFromUrl,
      sort: sortFromUrl,
      order: orderFromUrl,
      position_name: positionFromUrl,
      branch_name: branchFromUrl,
      course_name: courseFromUrl,
      ex_position_name: exPositionFromUrl,
      gender: genderFromUrl,
    })
    if (sortFromUrl && orderFromUrl) {
      setOrderBy(sortFromUrl)
      setOrder(orderFromUrl as Order)
    }
  }, [])

  const updateUrlParams = (params: {
    search?: string
    page?: number
    limit?: number
    sort?: string
    order?: string
    position_name?: string
    branch_name?: string
    course_name?: string
    ex_position_name?: string
    gender?: string
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
    if (params.position_name) {
      searchParams.set('position_name', params.position_name)
    }
    if (params.branch_name) {
      searchParams.set('branch_name', params.branch_name)
    }
    if (params.course_name) {
      searchParams.set('course_name', params.course_name)
    }
    if (params.ex_position_name) {
      searchParams.set('ex_position_name', params.ex_position_name)
    }
    if (params.gender) {
      searchParams.set('gender', params.gender)
    }
    window.history.replaceState({}, '', `?${searchParams.toString()}`)
  }

  const getUsers = async (
    search: string,
    limit: number | undefined,
    page: number | undefined,
    sort: string,
    order: string,
    afterSuccess?: () => void
  ) => {
    setLoading(true)
    setData([])
    try {
      if (!session?.accessToken) {
        throw new Error('No access token')
      }

      const response = await UserServices.getAllUsers(session.accessToken, {
        search,
        page: page ?? 1,
        limit: limit ?? 10,
        sort,
        order,
        position_name: params.position_name || '',
        branch_name: params.branch_name || '',
        course_name: params.course_name || '',
        ex_position_name: params.ex_position_name || '',
        gender: params.gender || '',
      })

      if (response && response.status) {
        const responseMeta = response.meta
        if (responseMeta) {
          setTotal(responseMeta.total_rows)
          setPage(responseMeta.page - 1)
          setRowsPerPage(responseMeta.limit)
        }
        setData(response.payload || [])
      } else {
        setData([])
        setTotal(0)
        setPage(0)
      }
      if (afterSuccess) {
        afterSuccess()
      }
    } catch (error) {
      console.error('Error fetching data:', error)
      setData([])
      setTotal(0)
      setPage(0)
    } finally {
      setLoading(false)
      updateUrlParams({
        search,
        page,
        limit,
        sort,
        order,
        position_name: params.position_name,
        branch_name: params.branch_name,
        course_name: params.course_name,
        ex_position_name: params.ex_position_name,
        gender: params.gender,
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

  useEffect(() => {
    if (session?.accessToken) {
      getUsers(
        params.search || '',
        params.limit,
        params.page,
        params.sort || '',
        params.order || ''
      )
    } else {
      console.log('No access token found')
    }
  }, [
    params.search,
    params.page,
    params.limit,
    params.sort,
    params.order,
    params.position_name,
    params.branch_name,
    params.course_name,
    params.ex_position_name,
    params.gender,
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

  const handleSort = (column: string, order: SortOrder) => {
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

  const handlePositionSelect = (value: string) => {
    setTempFilters(prev => ({ ...prev, position_name: value }))
  }

  const handleBranchSelect = (value: string) => {
    setTempFilters(prev => ({ ...prev, branch_name: value }))
  }

  const handleCourseSelect = (value: string) => {
    setTempFilters(prev => ({ ...prev, course_name: value }))
  }

  const handleExPositionSelect = (value: string) => {
    setTempFilters(prev => ({ ...prev, ex_position_name: value }))
  }

  const handleGenderSelect = (value: string) => {
    setTempFilters(prev => ({ ...prev, gender: value }))
  }

  const handleLevelSelect = (value: string) => {
    setSelectedLevel(value)
  }

  const createPersonal = () => {
    router.push('/admin/personal-list/create-personal')
  }

  // Filter dialog handlers
  const openFilterDialog = () => {
    // Initialize temp filters with current applied filters
    setTempFilters({
      position_name: selectedPosition,
      branch_name: selectedBranch,
      course_name: selectedCourse,
      ex_position_name: selectedExPosition,
      gender: selectedGender,
    })
    setIsFilterDialogOpen(true)
  }

  const closeFilterDialog = () => {
    setIsFilterDialogOpen(false)
  }

  const applyFilters = () => {
    // Apply temp filters to actual state and params
    setSelectedPosition(tempFilters.position_name)
    setSelectedBranch(tempFilters.branch_name)
    setSelectedCourse(tempFilters.course_name)
    setSelectedExPosition(tempFilters.ex_position_name)
    setSelectedGender(tempFilters.gender)
    
    setParams((prev) => ({
      ...prev,
      position_name: tempFilters.position_name,
      branch_name: tempFilters.branch_name,
      course_name: tempFilters.course_name,
      ex_position_name: tempFilters.ex_position_name,
      gender: tempFilters.gender,
      page: 1, // Reset to first page when applying filters
    }))
    
    setIsFilterDialogOpen(false)
  }

  const clearAllFilters = () => {
    // Clear search input
    setSearchInput('')
    
    // Clear temp filters
    setTempFilters({
      position_name: '',
      branch_name: '',
      course_name: '',
      ex_position_name: '',
      gender: '',
    })
    
    // Apply cleared filters immediately
    setSelectedPosition('')
    setSelectedBranch('')
    setSelectedCourse('')
    setSelectedExPosition('')
    setSelectedGender('')
    
    setParams((prev) => ({
      ...prev,
      search: '', // Clear search parameter
      position_name: '',
      branch_name: '',
      course_name: '',
      ex_position_name: '',
      gender: '',
      page: 1,
    }))
    
    // Close filter dialog if it's open
    setIsFilterDialogOpen(false)
  }

  const handleDelete = async (
    e: React.FormEvent<HTMLFormElement> | React.MouseEvent,
    userId: number,
    userName: string
  ) => {
    e.preventDefault()
    setLoading(true)
    try {
      if (!session?.accessToken) throw new Error('No access token')
      await UserServices.deleteUser(userId, session.accessToken)

      getUsers(
        params.search || '',
        params.limit,
        params.page,
        params.sort || '',
        params.order || ''
      )

      Swal.fire({
        icon: 'success',
        title: 'ลบสำเร็จ!',
        text: `ลบบุคลากร ${userName} สำเร็จ!`,
        showConfirmButton: false,
        timer: 1500,
      })
    } catch (error) {
      console.error('Error deleting user:', error)
      setLoading(false)

      Swal.fire({
        icon: 'error',
        title: 'เกิดข้อผิดพลาด!',
        text: 'เกิดข้อผิดพลาดในการลบบุคลากร',
        showConfirmButton: false,
        timer: 1500,
      })
    }
  }

  const handleEdit = async (
    e: React.FormEvent<HTMLFormElement> | React.MouseEvent,
    userId: number,
    userData: Partial<Personal>
  ) => {
    e.preventDefault()
    setLoading(true)
    try {
      if (!session?.accessToken) throw new Error('No access token')
      const response = await UserServices.updateUser(
        userId,
        userData as any,
        session.accessToken
      )

      if (response && (response as any).status === true) {
        getUsers(
          params.search || '',
          params.limit,
          params.page,
          params.sort || '',
          params.order || ''
        )

        Swal.fire({
          icon: 'success',
          title: 'แก้ไขสำเร็จ!',
          text: `แก้ไขข้อมูลบุคลากรสำเร็จ!`,
          showConfirmButton: false,
          timer: 1500,
        })
      } else {
        throw new Error('ไม่สามารถแก้ไขข้อมูลได้')
      }
    } catch (error) {
      console.error('Error updating user:', error)
      setLoading(false)

      Swal.fire({
        icon: 'error',
        title: 'เกิดข้อผิดพลาด!',
        text: 'เกิดข้อผิดพลาดในการแก้ไขข้อมูล',
        showConfirmButton: false,
        timer: 1500,
      })
    }
  }

  const totalPages = Math.ceil(total / rowsPerPage)

  // Default labels for selects (using temp filters for dialog display)
  const tempPositionLabel =
    positions?.find((pos) => pos.position_name === tempFilters.position_name)
      ?.position_name || 'เลือกตำแหน่งวิชาการ'
  const tempBranchLabel =
    branchs?.find((branch) => branch.branch_name === tempFilters.branch_name)
      ?.branch_name || 'เลือกสาขา'
  const tempCourseLabel =
    courses?.find((course) => course.course_name === tempFilters.course_name)
      ?.course_name || 'เลือกหลักสูตร'
  const tempExPositionLabel =
    exPositions?.find((exPos) => exPos.ex_position_name === tempFilters.ex_position_name)
      ?.ex_position_name || 'เลือกตำแหน่งบริหาร'
  const tempGenderLabel = tempFilters.gender || 'เลือกเพศ'

  // Gender options
  interface GenderOption {
    value: string
    label: string
  }
  
  const genderOptions: GenderOption[] = [
    { value: 'ชาย', label: 'ชาย' },
    { value: 'หญิง', label: 'หญิง' },
  ]


  return (
    <div className="rounded-md bg-white p-4 shadow transition-all duration-300 ease-in-out dark:bg-zinc-900 dark:text-gray-400">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-4">
        {/* Total count */}
        {loading ? (
          <div className="skeleton h-7 w-16 rounded-md"></div>
        ) : (
          <div className="w-auto rounded-md bg-gray-200 px-2 py-1 text-sm font-normal text-business1 dark:text-gray-400">
            {total} รายการ
          </div>
        )}

        <div className="flex flex-wrap items-center justify-end gap-4">
          {/* Search and Filter */}
          <div className="flex items-center gap-4">
            <div className="relative flex w-full items-center sm:w-52">
              <input
                className="w-full rounded-md border border-gray-300 px-4 py-2 text-sm font-light text-gray-600 transition-all duration-300 ease-in-out focus:border-blue-500 focus:outline-none dark:border-zinc-600 dark:bg-zinc-800 dark:text-gray-400"
                placeholder="ค้นหาชื่อ, สาขา, หลักสูตร, เลขบัตร, อีเมล"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
              {searchInput && (
                <button
                  onClick={clearSearch}
                  className="absolute right-3 text-gray-400 transition duration-200 hover:text-red-500"
                >
                  <LuDelete className="h-4 w-4" />
                </button>
              )}
            </div>

            <button
              onClick={openFilterDialog}
              className="relative flex items-center gap-2 rounded-md border border-business1 px-4 py-2 text-sm font-light text-business1 transition duration-300 ease-in-out hover:bg-business1 hover:text-white dark:border-blue-400 dark:text-blue-400 dark:hover:bg-blue-400"
            >
              <FiFilter className="h-4 w-4" />
              ตัวกรอง
              {(() => {
                const activeFiltersCount = [
                  selectedPosition,
                  selectedBranch,
                  selectedCourse,
                  selectedExPosition,
                  selectedGender,
                ].filter(Boolean).length;
                
                return activeFiltersCount > 0 ? (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {activeFiltersCount}
                  </span>
                ) : null;
              })()}
            </button>

            <button
              onClick={clearAllFilters}
              className="flex items-center gap-2 rounded-md border border-red-500 px-4 py-2 text-sm font-light text-red-500 transition duration-300 ease-in-out hover:bg-red-500 hover:text-white dark:border-red-400 dark:text-red-400 dark:hover:bg-red-400"
            >
              <LuDelete className="h-4 w-4" />
              ล้างตัวกรอง
            </button>
          </div>

          <button
            onClick={createPersonal}
            className="flex w-full items-center justify-between gap-2 rounded-md bg-success px-4 py-2.5 text-sm font-light text-white transition duration-300 ease-in-out hover:bg-success/80 sm:w-52"
          >
            เพิ่มบุคลากร
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </div>

      <Table
        data={data}
        columns={columns}
        loading={loading}
        total={total}
        currentPage={page + 1}
        totalPages={totalPages}
        rowsPerPage={rowsPerPage}
        onPageChange={(newPage) => handlePageChange(newPage - 1)}
        onRowsPerPageChange={handleRowsPerPageChange}
        emptyMessage={'ไม่พบข้อมูลบุคลากร'}
        skeletonRows={rowsPerPage}
        stickyColumns={1}
        sortable={true}
        sortState={sortState}
        onSort={handleSort}
        rowsPerPageOptions={[10, 20, 50, 100, 200]}
      />

      <DeleteModal
        currentData={data}
        handleDeletePost={(e, prefix, fname, lname, id) =>
          handleDelete(e, id, `${prefix}${fname} ${lname}`)
        }
        isLoading={loading}
      />
      <UpdatePersonalModal
        currentData={data}
        handleUpdatePost={(e, prefix, fname, lname, id) => {
          const userData = data.find((user) => user.u_id === id)
          if (userData) {
            handleEdit(e, id, userData)
          }
        }}
        isLoading={loading}
      />

      {/* Filter Dialog */}
      <FilterDialog
        isOpen={isFilterDialogOpen}
        onClose={closeFilterDialog}
        positions={positions || []}
        branchs={branchs || []}
        courses={courses || []}
        exPositions={exPositions || []}
        selectedPositionLabel={tempPositionLabel}
        selectedBranchLabel={tempBranchLabel}
        selectedCourseLabel={tempCourseLabel}
        selectedExPositionLabel={tempExPositionLabel}
        selectedGenderLabel={tempGenderLabel}
        onPositionSelect={handlePositionSelect}
        onBranchSelect={handleBranchSelect}
        onCourseSelect={handleCourseSelect}
        onExPositionSelect={handleExPositionSelect}
        onGenderSelect={handleGenderSelect}
        onApplyFilters={applyFilters}
      />
    </div>
  )
}

export default PersonalListTable
