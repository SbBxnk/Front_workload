'use client'
import type React from 'react'
import { useEffect, useState } from 'react'
import { Edit2, Plus, Trash2 } from 'lucide-react'
import type { QuantityWorkload, QuantityWorkloadSearchParams } from '@/Types'
import CreateModal from './createModal'
import DeleteModal from './deleteModal'
import { FiX } from 'react-icons/fi'
import Swal from 'sweetalert2'
import EditModal from './editModal'
import QuantityWorkloadServices from '@/services/quantityWorkloadServices'
import { useSession } from 'next-auth/react'
import Table, { TableColumn, SortState, SortOrder } from '@/components/Table'

const ITEMS_PER_PAGE = 10

interface FormDataQuantityWorkload {
  quantity_workload_hours: number
  workload_group_id: number
  task_id: number
}

const FormDataQuantityWorkload: FormDataQuantityWorkload = {
  quantity_workload_hours: 0,
  workload_group_id: 0,
  task_id: 0,
}

type Order = 'asc' | 'desc'

function QuantityWorkloadTable() {
  const { data: session } = useSession()
  const [FormData, setFormData] = useState<FormDataQuantityWorkload>(FormDataQuantityWorkload)
  const [loading, setLoading] = useState<boolean>(false)
  const [order, setOrder] = useState<Order>('asc')
  const [orderBy, setOrderBy] = useState<string>('')
  const [page, setPage] = useState<number>(0)
  const [rowsPerPage, setRowsPerPage] = useState<number>(10)
  const [total, setTotal] = useState<number>(0)
  const [data, setData] = useState<QuantityWorkload[]>([])
  const [params, setParams] = useState<QuantityWorkloadSearchParams>({
    search: '',
    page: 1,
    limit: 10,
    sort: '',
    order: '',
  })
  const [searchInput, setSearchInput] = useState<string>('')
  const [selectedQuantityWorkload, setSelectedQuantityWorkload] = useState<string>('')
  const [selectedQuantityWorkloadId, setSelectedQuantityWorkloadId] = useState<number>(0)
  const [selectedQuantityWorkloadHours, setSelectedQuantityWorkloadHours] = useState<number>(0)
  const [selectedWorkloadGroupId, setSelectedWorkloadGroupId] = useState<number>(0)
  const [selectedTaskId, setSelectedTaskId] = useState<number>(0)
  const [sortState, setSortState] = useState<SortState>({
    column: null,
    order: null,
  })

  // Define table columns
  const columns: TableColumn<QuantityWorkload>[] = [
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
      label: 'กลุ่มงาน',
      align: 'left',
      sortable: true,
      render: (value) => (
        <span className="text-sm font-light text-gray-500 dark:text-gray-400">
          {value || '-'}
        </span>
      ),
    },
    {
      key: 'task_name',
      label: 'งานหลัก',
      align: 'left',
      sortable: true,
      render: (value) => (
        <span className="text-sm font-light text-gray-500 dark:text-gray-400">
          {value || '-'}
        </span>
      ),
    },
    {
      key: 'quantity_workload_hours',
      label: 'จำนวนชั่วโมง',
      align: 'center',
      sortable: true,
      render: (value) => (
        <span className="text-sm font-light text-gray-500 dark:text-gray-400">
          {value || 0} ชั่วโมง
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
            className="cursor-pointer rounded-md p-1 text-yellow-500 transition duration-300 ease-in-out hover:bg-yellow-500 hover:text-white"
            onClick={() => {
              setSelectedQuantityWorkloadId(row.quantity_workload_id)
              setSelectedQuantityWorkloadHours(row.quantity_workload_hours)
              setSelectedWorkloadGroupId(row.workload_group_id)
              setSelectedTaskId(row.task_id)
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
            className="cursor-pointer rounded-md p-1 text-red-500 transition duration-300 ease-in-out hover:bg-red-500 hover:text-white"
            onClick={() => {
              setSelectedQuantityWorkloadId(row.quantity_workload_id)
              setSelectedQuantityWorkloadHours(row.quantity_workload_hours)
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

  const getQuantityWorkloads = async (
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

      const response = await QuantityWorkloadServices.getAllQuantityWorkloads(
        session.accessToken,
        {
          search,
          page: page ?? 1,
          limit: limit ?? 10,
          sort,
          order,
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
      if (afterSuccess) {
        afterSuccess()
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
      updateUrlParams({
        search,
        page,
        limit,
        sort,
        order,
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
    if (session?.accessToken) {
      getQuantityWorkloads(
        params.search || '',
        params.limit,
        params.page,
        params.sort || '',
        params.order || ''
      )
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

  const handleQuantityWorkloadSelect = (value: string) => {
    setSelectedQuantityWorkload(value)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: parseFloat(value) || 0 }))
  }

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement> | React.MouseEvent,
    quantity_workload_hours: number,
    workload_group_id: number,
    task_id: number
  ) => {
    setLoading(true)
    try {
      if (!session?.accessToken) throw new Error('No access token')
      const response = await QuantityWorkloadServices.createQuantityWorkload(
        { quantity_workload_hours, workload_group_id, task_id },
        session.accessToken
      )

      if (response && (response as any).status === true) {
        setFormData(FormDataQuantityWorkload)
        getQuantityWorkloads(
          params.search || '',
          params.limit,
          1, // Reset to first page
          params.sort || '',
          params.order || ''
        )
        Swal.fire({
          position: 'center',
          icon: 'success',
          title: 'สำเร็จ!',
          text: `เพิ่มปริมาณงาน ${quantity_workload_hours} ชั่วโมง สำเร็จ!`,
          showConfirmButton: false,
          timer: 1500,
        })
      } else {
        throw new Error('ไม่สามารถสร้างปริมาณงานได้')
      }
    } catch (error) {
      console.error('Error adding quantity workload:', error)
      setLoading(false)
      Swal.fire({
        position: 'center',
        icon: 'error',
        title: 'เกิดข้อผิดพลาด!',
        text: 'เกิดข้อผิดพลาดในการเพิ่มปริมาณงาน',
        showConfirmButton: false,
        timer: 1500,
      })
    }
  }

  const handleDelete = async (
    e: React.FormEvent<HTMLFormElement> | React.MouseEvent,
    quantity_workload_id: number,
    quantity_workload_hours: number
  ) => {
    e.preventDefault()
    setLoading(true)
    try {
      if (!session?.accessToken) throw new Error('No access token')
      await QuantityWorkloadServices.deleteQuantityWorkload(quantity_workload_id, session.accessToken)

      // Reset to page 1 and fetch new data
      setPage(0)
      setParams((prev) => ({
        ...prev,
        page: 1,
      }))
      
      getQuantityWorkloads(
        params.search || '',
        params.limit,
        1, // Reset to page 1
        params.sort || '',
        params.order || ''
      )

      Swal.fire({
        icon: 'success',
        title: 'ลบสำเร็จ!',
        text: `ลบปริมาณงาน ${quantity_workload_hours} ชั่วโมง สำเร็จ!`,
        showConfirmButton: false,
        timer: 1500,
      })
    } catch (error) {
      console.error('Error deleting quantity workload:', error)
      setLoading(false)

      Swal.fire({
        icon: 'error',
        title: 'เกิดข้อผิดพลาด!',
        text: 'เกิดข้อผิดพลาดในการลบปริมาณงาน',
        showConfirmButton: false,
        timer: 1500,
      })
    }
  }

  const handleEdit = async (
    e: React.FormEvent<HTMLFormElement> | React.MouseEvent,
    quantity_workload_id: number,
    quantity_workload_hours: number,
    workload_group_id: number,
    task_id: number
  ) => {
    e.preventDefault()
    setLoading(true)
    try {
      if (!session?.accessToken) throw new Error('No access token')
      const response = await QuantityWorkloadServices.updateQuantityWorkload(
        quantity_workload_id,
        { quantity_workload_hours, workload_group_id, task_id },
        session.accessToken
      )

      if (response && (response as any).status === true) {
        // ปิด modal ก่อน
        const modal = document.getElementById('modal-edit') as HTMLInputElement
        if (modal) modal.checked = false

        getQuantityWorkloads(
          params.search || '',
          params.limit,
          params.page,
          params.sort || '',
          params.order || ''
        )

        Swal.fire({
          icon: 'success',
          title: 'แก้ไขสำเร็จ!',
          text: `แก้ไขปริมาณงาน ${quantity_workload_hours} ชั่วโมง สำเร็จ!`,
          showConfirmButton: false,
          timer: 1500,
        })
      } else {
        throw new Error('ไม่สามารถแก้ไขปริมาณงานได้')
      }
    } catch (error) {
      console.error('Error updating quantity workload:', error)
      setLoading(false)

      Swal.fire({
        icon: 'error',
        title: 'เกิดข้อผิดพลาด!',
        text: 'เกิดข้อผิดพลาดในการแก้ไขปริมาณงาน',
        showConfirmButton: false,
        timer: 1500,
      })
    }
  }

  const totalPages = Math.ceil(total / rowsPerPage)
  const selectedLabel =
    data.find((pos) => pos.quantity_workload_hours === selectedQuantityWorkload)?.quantity_workload_hours ||
    'เลือกปริมาณงาน'

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
              placeholder="ค้นหาด้วยชื่อกลุ่มงาน, งานหลัก หรือจำนวนชั่วโมง"
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
          <div className="w-full pt-4 md:w-auto md:pt-0">
            <label
              htmlFor={`modal-create`}
              className="flex w-full cursor-pointer items-center justify-between gap-2 rounded-md bg-success px-4 py-2.5 text-sm font-light text-white transition duration-300 ease-in-out hover:bg-success/80 md:w-52"
            >
              เพิ่มปริมาณงาน
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
        setFormData={setFormData}
      />
      <DeleteModal
        isLoading={loading}
        quantity_workload_id={selectedQuantityWorkloadId}
        quantity_workload_hours={selectedQuantityWorkloadHours}
        handleDelete={handleDelete}
      />
      <EditModal
        isLoading={loading}
        quantity_workload_id={selectedQuantityWorkloadId}
        quantity_workload_hours={selectedQuantityWorkloadHours}
        workload_group_id={selectedWorkloadGroupId}
        task_id={selectedTaskId}
        handleEdit={handleEdit}
      />
    </div>
  )
}

export default QuantityWorkloadTable
