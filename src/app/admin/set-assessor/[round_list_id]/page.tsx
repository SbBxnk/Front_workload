'use client'

import type React from 'react'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import axios from 'axios'
import { Loader, Trash2, Eye, Plus } from 'lucide-react'
import { FiX } from 'react-icons/fi'
import Pagination from '@/components/Pagination'
import SearchFilter from '@/components/SearchFilter'
import Table, { TableColumn, SortState } from '@/components/Table'
import CreateModal from './createModal'
import DeleteModal from './deleteModal'
import useAuthHeaders from '@/hooks/Header'
import type { ExPosition, User } from '@/Types'
import Swal from 'sweetalert2'
import Image from 'next/image'
import SetAssessorServices, { SetAssessorList, CreateSetAssessorListRequest } from '@/services/setAssessorServices'
import ExpositionServices from '@/services/exPositionServices'
import { ResponsePayload } from '@/Types'
import useUtility from '@/hooks/useUtility'

interface Assessor {
  set_asses_list_id: number
  round_list_id: number
  as_u_id: number
  prefix_name: string
  u_fname: string
  u_lname: string
  ex_position_name: string
  u_id_card: string
  u_img: string
  workload_group_id: number
  workload_group_name: string
  date_save: string
}

interface Round {
  round_list_id: number
  round_list_name: string
  round: number
  year: string
}

interface Delete {
  set_asses_list_id: number[]
}

interface WorkloadFormList {
  set_asses_list_id: number
  status_id: number
}

const ITEMS_PER_PAGE = 10

export default function ExDetailsPage() {
  const { data: session } = useSession()
  const { setBreadcrumbs } = useUtility()
  const headers = useAuthHeaders()
  const routeParams = useParams()
  const router = useRouter()
  const round_list_id = routeParams.round_list_id
  const [FormData, setFormData] = useState({ round_list_id: 0, as_u_id: 0 })
  const [rounds, setRound] = useState<Round>()
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

  useEffect(() => {
    setBreadcrumbs(
      [{ text: 'รอบประเมินภาระงาน', path: '/admin/set-assessor' },
      { text: 'ผู้ถูกประเมินภาระงาน', path: `/admin/set-assessor/${round_list_id}` }
      ])
  }, [setBreadcrumbs, round_list_id])


  const fetchAllData = async (
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
        ExpositionServices.getAllExpositions(session.accessToken),
        SetAssessorServices.getRoundListById(Number(Array.isArray(round_list_id) ? round_list_id[0] : round_list_id), session.accessToken),
        axios.get(`${process.env.NEXT_PUBLIC_API}/as_user/${Array.isArray(round_list_id) ? round_list_id[0] : round_list_id}`, { headers }),
        SetAssessorServices.getSetAssessorListByRound(
          Number(Array.isArray(round_list_id) ? round_list_id[0] : round_list_id),
          session.accessToken,
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
        console.log('Exposition data loaded:', resExposition.payload)
        setExPosition(resExposition.payload)
      } else {
        console.log('Exposition data failed to load:', resExposition)
      }

      // Set round title data
      if (resRoundTitle.success && resRoundTitle.payload) {
        setRound(resRoundTitle.payload as unknown as Round)
      }

      // Set users data
      if (resUsers.data.data) {
        const processedUsers = resUsers.data.data
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

        // Check which assessors have related data
        const idsWithData: number[] = []
        for (const assessor of assessorsData) {
          try {
            const assessorInfoResponse = await SetAssessorServices.getSetAssessorInfo(
              assessor.set_asses_list_id,
              session.accessToken
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
  }

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const searchFromUrl = urlParams.get('search') || ''
    const pageFromUrl = parseInt(urlParams.get('page') || '1', 10)
    const limitFromUrl = parseInt(urlParams.get('limit') || '10', 10)
    const sortFromUrl = urlParams.get('sort') || ''
    const orderFromUrl = urlParams.get('order') || ''
    const exPositionFromUrl = urlParams.get('ex_position_name') || ''

    setSearchInput(searchFromUrl)
    setSelectedExPosition(exPositionFromUrl)
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
    if (round_list_id && session?.accessToken) {
      fetchAllData(
        params.search || '',
        params.limit,
        params.page,
        params.sort || '',
        params.order || '',
        params.ex_position_name || ''
      )
    }
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

  // Server-side filtering is now handled by the API
  const filteredAssessors = assessors

  // Pagination is now handled by the API

  const assessorOptions = expositons.map((expositon) => ({
    ex_position_name: expositon.ex_position_name,
    label: `${expositon.ex_position_name}`,
  }))

  const selectedLabel = selectedAssessor
    ? `ผู้ถูกประเมิน ${selectedAssessor}`
    : 'เลือกผู้ถูกประเมิน'

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
      label: 'ชื่อผู้ถูกประเมิน',
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
      label: 'รหัสผู้ถูกประเมิน',
      align: 'left',
      render: (_, record) => (
        <span className="text-sm font-light text-gray-500 dark:text-gray-400">
          {record.u_id_card}
        </span>
      ),
    },
    {
      key: 'workload_group_name',
      label: 'กลุ่มภาระงาน',
      align: 'left',
      sortable: true,
      render: (_, record) => (
        <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
          {record.workload_group_name ? (
            <span className="text-green-500 dark:text-gray-400">
              {record.workload_group_name}
            </span>
          ) : (
            <span className="text-red-500 dark:text-gray-400">
              ยังไม่ได้เลือกกลุ่มภาระงาน
            </span>
          )}
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
          <button
            className="cursor-pointer rounded-md border-none border-blue-500 p-1 text-blue-500 transition duration-300 ease-in-out hover:bg-blue-500 hover:text-white"
            onClick={() =>
              handleSetExUser(
                record.set_asses_list_id,
                record
              )
            }
          >
            <Eye className="h-4 w-4" />
          </button>
          {!checkDelete.set_asses_list_id.includes(
            record.set_asses_list_id
          ) ? (
            <label
              htmlFor={`modal-delete${record.set_asses_list_id}`}
              className="cursor-pointer rounded-md border-none border-red-500 p-1 text-red-500 transition duration-300 ease-in-out hover:bg-red-500 hover:text-white"
              onClick={() => {
                setSelectedSetAssesListId(record.set_asses_list_id)
                setSelectedSetAsFname(record.u_fname)
                setSelectedSetAsLname(record.u_lname)
                setSelectedSetAsPrefixname(record.prefix_name)
              }}
            >
              <Trash2 className="h-4 w-4" />
            </label>
          ) : (
            <button
              disabled
              className="cursor-not-allowed rounded-md border-none border-gray-400 p-1 text-gray-300"
              title="ไม่สามารถลบได้เนื่องจากมีข้อมูลที่เกี่ยวข้อง"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      ),
    },
  ]

  const handleSetExUser = (set_asses_list_id: number, assessor: Assessor) => {
    router.push(
      `/admin/set-assessor/${round_list_id}/${set_asses_list_id}?prefix=${encodeURIComponent(assessor.prefix_name)}&fname=${encodeURIComponent(assessor.u_fname)}&lname=${encodeURIComponent(assessor.u_lname)}`
    )
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    if (!session?.accessToken) return

    setLoading(true)
    e.preventDefault()

    try {
      const dataToSubmit: CreateSetAssessorListRequest = {
        round_list_id: Number(FormData.round_list_id),
        as_u_id: Number(FormData.as_u_id),
      }

      if (!dataToSubmit.as_u_id) {
        alert('กรุณาเลือกผู้ถูกประเมิน')
        setLoading(false)
        return
      }

      await SetAssessorServices.createSetAssessorList(dataToSubmit, session.accessToken)

      // Get the latest assessor list to find the maximum set_asses_list_id
      const response = await SetAssessorServices.getSetAssessorListByRound(
        Number(Array.isArray(round_list_id) ? round_list_id[0] : round_list_id),
        session.accessToken
      )

      if (response.success && response.payload && Array.isArray(response.payload)) {
        const dataAssesDetail = response.payload as Assessor[]
        setAssessors(dataAssesDetail)

        // Find the maximum set_asses_list_id
        const maxIdAssessor = dataAssesDetail.reduce(
          (max: number, assessor: Assessor) =>
            assessor.set_asses_list_id > max ? assessor.set_asses_list_id : max,
          0
        )

        // Add to workload form with the maximum set_asses_list_id
        if (maxIdAssessor > 0) {
          const workloadFormData: WorkloadFormList = {
            set_asses_list_id: maxIdAssessor,
            status_id: 0,
          }

          await axios.post(
            `${process.env.NEXT_PUBLIC_API}/workload_form/add`,
            workloadFormData,
            { headers }
          )
        }
      }

      setFormData({
        round_list_id: Number(round_list_id),
        as_u_id: 0,
      })

      // อัปเดตรายชื่อผู้ใช้ที่สามารถเลือกได้
      try {
        const resUsers = await axios.get(
          `${process.env.NEXT_PUBLIC_API}/as_user/${round_list_id}`,
          { headers }
        )
        if (resUsers.data.status) {
          const processedUsers = resUsers.data.data || []
          setUsers(processedUsers)
        }
      } catch (error) {
        console.error('Error fetching updated users:', error)
        setUsers([])
      }

      setLoading(false)

      Swal.fire({
        position: 'center',
        icon: 'success',
        title: 'สำเร็จ!',
        text: `เพิ่มผู้ถูกประเมิน สำเร็จ!`,
        showConfirmButton: false,
        timer: 1500,
      })
    } catch (error) {
      setLoading(false)

      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          Swal.fire({
            position: 'center',
            icon: 'warning',
            title: 'ผู้ถูกประเมินนี้ถูกเพิ่มแล้ว!',
            text: 'ผู้ถูกประเมินนี้ถูกเพิ่มในรอบการประเมินแล้ว',
            showConfirmButton: false,
            timer: 1500,
          })
        } else {
          Swal.fire({
            position: 'center',
            icon: 'error',
            title: 'เกิดข้อผิดพลาด!',
            text: 'เกิดข้อผิดพลาดในการเพิ่มผู้ถูกประเมิน',
            showConfirmButton: false,
            timer: 1500,
          })
        }
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
      await SetAssessorServices.deleteSetAssessorList(set_asses_list_id, session.accessToken)
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
        text: `ลบสาขาผู้ถูกประเมินสำเร็จ!`,
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
        text: 'เกิดข้อผิดพลาดในการลบผู้ถูกประเมิน',
        showConfirmButton: false,
        timer: 1500,
      })
    }
  }

  return (
    <div className="rounded-md bg-white p-4 shadow transition-all duration-300 ease-in-out dark:bg-zinc-900 dark:text-gray-400">
      <div className="pb-4">
        <h1 className="text-xl text-gray-500">
          ผู้ถูกประเมิน{' '}
          <span className="text-business1">{rounds?.round_list_name}</span>
        </h1>
      </div>
      <div className="mb-4 flex items-end justify-between">
        <div className="flex w-full flex-wrap items-end gap-4 md:w-auto">
          {loading ? (
            <div className="skeleton h-7 w-16 rounded-md"></div>
          ) : (
            <div className="w-auto rounded-md bg-gray-200 px-2 py-1 text-sm font-normal text-business1 dark:text-gray-400">
              {assessors.length} รายการ
            </div>
          )}
        </div>
        <div className="flex items-center justify-end gap-4">
          <div className="relative flex w-full items-center md:w-52">
            <input
              className="w-full rounded-md border border-gray-300 px-4 py-2 text-sm font-light text-gray-600 transition-all duration-300 ease-in-out focus:border-blue-500 focus:outline-none dark:border-zinc-600 dark:bg-zinc-800 dark:text-gray-400"
              placeholder="ค้นหาชื่อผู้ถูกประเมิน"
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
          <SearchFilter<ExPosition, 'ex_position_name'>
            key={`exposition-${selectedExPosition}`}
            selectedLabel={selectedExPosition}
            handleSelect={handleExPositionSelect}
            objects={expositons || []}
            valueKey="ex_position_name"
            labelKey="ex_position_name"
            placeholder={expositons && expositons.length > 0 ? "เลือกตำแหน่งบริหาร" : "กำลังโหลด..."}
          />
          <div className="w-full pt-4 md:w-auto md:pt-0">
            <label
              htmlFor={users.length === 0 ? "" : "modal-create"}
              className={`flex w-full items-center justify-between gap-2 rounded-md px-4 py-2.5 text-sm font-light transition duration-300 ease-in-out md:w-52 ${
                users.length === 0
                  ? "cursor-default bg-gray-200 text-gray-400"
                  : "cursor-pointer bg-success text-white hover:bg-success/80"
              }`}
            >
              {users.length === 0 ? "เพิ่มผู้ถูกประเมิน" : "เพิ่มผู้ถูกประเมิน"}
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
                  onClick={() => fetchAllData(
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
          emptyMessage={'ไม่พบข้อมูล'}
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
        refreshTrigger={refreshTrigger}
      />

      <DeleteModal
        prefix_name={selectedSetAsPrefixname}
        u_fname={selectedSetAsFname}
        u_lname={selectedSetAsLname}
        isLoading={loading}
        set_asses_list_id={selectedSetAssesListId}
        handleDelete={handleDelete}
      />
    </div>
  )
}

