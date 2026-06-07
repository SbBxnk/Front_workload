'use client'
import type React from 'react'
import { useEffect, useState } from 'react'
import { Edit2, Plus, Trash2 } from 'lucide-react'
import type { WorkloadGroup, WorkloadGroupSearchParams } from '@/Types'
import CreateModal from './createModal'
import DeleteModal from './deleteModal'
import { FiX } from 'react-icons/fi'
import Swal from 'sweetalert2'
import EditModal from './editModal'
import WorkloadGroupServices from '@/services/workloadGroupServices'
import { useSession } from 'next-auth/react'
import Table, { TableColumn, SortState, SortOrder } from '@/components/Table'
import Tooltip from '@/components/Tooltip'
import useUtility from '@/hooks/useUtility'
const ITEMS_PER_PAGE = 10

interface FormDataWorkloadGroup {
  workload_group_name: string
}

const FormDataWorkloadGroup: FormDataWorkloadGroup = {
  workload_group_name: '',
}

type Order = 'asc' | 'desc'

function WorkloadGroupTable() {
  const { data: session } = useSession()
  const { setBreadcrumbs } = useUtility()
  const [FormData, setFormData] = useState<FormDataWorkloadGroup>(FormDataWorkloadGroup)
  const [loading, setLoading] = useState<boolean>(false)
  const [order, setOrder] = useState<Order>('asc')
  const [orderBy, setOrderBy] = useState<string>('')
  const [page, setPage] = useState<number>(0)
  const [rowsPerPage, setRowsPerPage] = useState<number>(10)
  const [total, setTotal] = useState<number>(0)
  const [data, setData] = useState<WorkloadGroup[]>([])
  const [params, setParams] = useState<WorkloadGroupSearchParams>({
    search: '',
    page: 1,
    limit: 10,
    sort: '',
    order: '',
  })
  const [searchInput, setSearchInput] = useState<string>('')
  const [selectedWorkloadGroup, setSelectedWorkloadGroup] = useState<string>('')
  const [selectedWorkloadGroupId, setSelectedWorkloadGroupId] = useState<number>(0)
  const [selectedWorkloadGroupName, setSelectedWorkloadGroupName] = useState<string>('')
  const [sortState, setSortState] = useState<SortState>({
    column: null,
    order: null,
  })

  useEffect(() => {
    setBreadcrumbs(
      [{ text: 'กลุ่มภาระงาน', path: '/admin/workload-group' },
    ])
  }, [setBreadcrumbs])

  // Define table columns
  const columns: TableColumn<WorkloadGroup>[] = [
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
      key: 'workload_group_name',
      label: 'กลุ่มภาระงาน',
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
      render: (_, row , index) => (
        <div className="w-full flex justify-center gap-2 p-0">
          <button
            type="button"
            className="cursor-pointer rounded-md p-1 text-yellow-500 "
            onClick={() => {
              setSelectedWorkloadGroupId(row.workload_group_id)
              setSelectedWorkloadGroupName(row.workload_group_name)
              // Trigger modal
              const modal = document.getElementById(
                `modal-edit`
              ) as HTMLInputElement
              if (modal) modal.checked = true
            }}
          >
            <Edit2 className="h-4 w-4" />
          </button>
          <button
            type="button"
            className="cursor-pointer rounded-md p-1 text-red-500 "
            onClick={() => {
              setSelectedWorkloadGroupId(row.workload_group_id)
              setSelectedWorkloadGroupName(row.workload_group_name)
              // Trigger modal
              const modal = document.getElementById(
                `modal-delete`
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
    const urlParams = new URLSearchParams(window.location.search)
    const searchFromUrl = urlParams.get('search') || ''
    const pageFromUrl = parseInt(urlParams.get('page') || '1', 10)
    const limitFromUrl = parseInt(urlParams.get('limit') || '10', 10)
    const sortFromUrl = urlParams.get('sort') || ''
    const orderFromUrl = urlParams.get('order') || ''

    setSearchInput(searchFromUrl)
    setParams({
      search: searchFromUrl,
      page: pageFromUrl,
      limit: limitFromUrl,
      sort: sortFromUrl,
      order: orderFromUrl,
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

  const getWorkloadGroups = async () => {
    setLoading(true)
    setData([])
    try {
      if (!session?.accessToken) {
        throw new Error('No access token')
      }

      const response = await WorkloadGroupServices.getAllWorkloadGroups(
        {
          search: params.search || '',
          page: params.page ?? 1,
          limit: params.limit ?? 10,
          sort: params.sort || '',
          order: params.order || '',
        }
      )

      if (response.success) {
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
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
      updateUrlParams({
        search: params.search,
        page: params.page,
        limit: params.limit,
        sort: params.sort,
        order: params.order,
      })
    }
  }

  // Fetch data when params change
  useEffect(() => {
    if (session?.accessToken) {
      getWorkloadGroups()
    }
  }, [
    params.search,
    params.page,
    params.limit,
    params.sort,
    params.order,
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

  const handleWorkloadGroupSelect = (value: string) => {
    setSelectedWorkloadGroup(value)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement> | React.MouseEvent,
    workload_group_name: string
  ) => {
    setLoading(true)
    try {
      if (!session?.accessToken) throw new Error('No access token')
      const response = await WorkloadGroupServices.createWorkloadGroup(
        { workload_group_name }
      )

      if (response && (response as any).status === true) {
        // ปิด modal ก่อน
        const modal = document.getElementById('modal-create') as HTMLInputElement
        if (modal) modal.checked = false

        setFormData(FormDataWorkloadGroup)
        setParams((prev) => ({
          ...prev,
          page: 1,
        }))
        // อัปเดตข้อมูลทันที
        await getWorkloadGroups()
        Swal.fire({
          position: 'center',
          icon: 'success',
          title: 'สำเร็จ!',
          text: `เพิ่มกลุ่มภาระงาน ${workload_group_name} สำเร็จ!`,
          showConfirmButton: false,
          timer: 1500,
        })
      } else {
        throw new Error('ไม่สามารถสร้างกลุ่มภาระงานได้')
      }
    } catch (error) {
      console.error('Error adding workload group:', error)
      setLoading(false)
      Swal.fire({
        position: 'center',
        icon: 'error',
        title: 'เกิดข้อผิดพลาด!',
        text: 'เกิดข้อผิดพลาดในการเพิ่มกลุ่มภาระงาน',
        showConfirmButton: false,
        timer: 1500,
      })
    }
  }

  const handleDelete = async (
    e: React.FormEvent<HTMLFormElement> | React.MouseEvent,
    workload_group_id: number,
    workload_group_name: string
  ) => {
    e.preventDefault()
    setLoading(true)
    try {
      if (!session?.accessToken) throw new Error('No access token')
      await WorkloadGroupServices.deleteWorkloadGroup(workload_group_id)

      // Reset to page 1 and fetch new data
      setPage(0)
      setParams((prev) => ({
        ...prev,
        page: 1,
      }))
      // อัปเดตข้อมูลทันที
      await getWorkloadGroups()

      Swal.fire({
        icon: 'success',
        title: 'ลบสำเร็จ!',
        text: `ลบกลุ่มภาระงาน ${workload_group_name} สำเร็จ!`,
        showConfirmButton: false,
        timer: 1500,
      })
    } catch (error) {
      console.error('Error deleting workload group:', error)
      setLoading(false)

      Swal.fire({
        icon: 'error',
        title: 'เกิดข้อผิดพลาด!',
        text: 'เกิดข้อผิดพลาดในการลบกลุ่มภาระงาน',
        showConfirmButton: false,
        timer: 1500,
      })
    }
  }

  const handleEdit = async (
    e: React.FormEvent<HTMLFormElement> | React.MouseEvent,
    workload_group_id: number,
    workload_group_name: string
  ) => {
    e.preventDefault()
    setLoading(true)
    try {
      if (!session?.accessToken) throw new Error('No access token')
      const response = await WorkloadGroupServices.updateWorkloadGroup(
        workload_group_id,
        { workload_group_name }
      )

      if (response && (response as any).status === true) {
        // ปิด modal ก่อน
        const modal = document.getElementById('modal-edit') as HTMLInputElement
        if (modal) modal.checked = false

        // อัปเดตข้อมูลทันที
        await getWorkloadGroups()

        Swal.fire({
          icon: 'success',
          title: 'แก้ไขสำเร็จ!',
          text: `แก้ไขกลุ่มภาระงาน ${workload_group_name} สำเร็จ!`,
          showConfirmButton: false,
          timer: 1500,
        })
      } else {
        throw new Error('ไม่สามารถแก้ไขกลุ่มภาระงานได้')
      }
    } catch (error) {
      console.error('Error updating workload group:', error)
      setLoading(false)

      Swal.fire({
        icon: 'error',
        title: 'เกิดข้อผิดพลาด!',
        text: 'เกิดข้อผิดพลาดในการแก้ไขกลุ่มภาระงาน',
        showConfirmButton: false,
        timer: 1500,
      })
    }
  }

  const totalPages = Math.ceil(total / rowsPerPage)
  const selectedLabel =
    data.find((pos) => pos.workload_group_name === selectedWorkloadGroup)?.workload_group_name ||
    'เลือกกลุ่มภาระงาน'

  return (
    <div className="rounded-md bg-white p-4 shadow ">
      <div className="mb-4 flex items-end justify-between">
        <div className="flex w-full flex-wrap items-end gap-4 md:w-auto">
          {loading ? (
            <div className="skeleton h-7 w-16 rounded-md"></div>
          ) : (
            <div className="w-auto rounded-md bg-gray-200 px-2 py-1 text-sm font-normal text-business1 dark:text-blue-500 dark:bg-zinc-800">
              {total} รายการ
            </div>
          )}
        </div>
        <div className="flex items-center justify-end gap-4">
          <div className="relative flex w-full items-center md:w-52">
            <input
              className="w-full rounded-md border border-gray-300 px-4 py-2 text-sm font-light text-gray-600 "
              placeholder="ค้นหาด้วยชื่อกลุ่มภาระงาน"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
            {searchInput && (
              <button
                onClick={clearSearch}
                className="absolute right-3 text-gray-400  hover:text-red-500"
              >
                <FiX className="h-4 w-4" />
              </button>
            )}
          </div>
          <div className="w-full pt-4 md:w-auto md:pt-0">
            <label
              htmlFor={`modal-create`}
              className="flex w-full cursor-pointer items-center justify-between gap-2 rounded-md bg-success px-4 py-2.5 text-sm font-light text-white "
            >
              เพิ่มกลุ่มภาระงาน
              <Plus className="h-4 w-4" />
            </label>
          </div>
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
        emptyMessage={'ไม่พบข้อมูล'}
        skeletonRows={rowsPerPage}
        stickyColumns={1}
        sortable={true}
        sortState={sortState}
        onSort={handleSort}
        rowsPerPageOptions={[10, 20, 50, 100, 200]}
      />

      <CreateModal
        isLoading={loading}
        handleSubmit={handleSubmit}
        formData={FormData}
        handleInputChange={handleInputChange}
      />
      <DeleteModal
        isLoading={loading}
        workload_group_id={selectedWorkloadGroupId}
        workload_group_name={selectedWorkloadGroupName}
        handleDelete={handleDelete}
      />
      <EditModal
        isLoading={loading}
        workload_group_id={selectedWorkloadGroupId}
        workload_group_name={selectedWorkloadGroupName}
        handleEdit={handleEdit}
      />
    </div>
  )
}

export default WorkloadGroupTable
