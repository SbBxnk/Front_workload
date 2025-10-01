'use client'
import type React from 'react'
import { useEffect, useState } from 'react'
import { Edit2, Plus, Trash2 } from 'lucide-react'
import type { Prefix, PrefixSearchParams } from '@/Types'
import CreateModal from './createModal'
import DeleteModal from './deleteModal'
import { FiX } from 'react-icons/fi'
import Swal from 'sweetalert2'
import EditModal from './editModal'
import PrefixServices from '@/services/prefixServices'
import { useSession } from 'next-auth/react'
import Table, { TableColumn, SortState, SortOrder } from '@/components/Table'

const ITEMS_PER_PAGE = 10

interface FormDataPrefix {
  prefix_name: string
}

const FormDataPrefix: FormDataPrefix = {
  prefix_name: '',
}

type Order = 'asc' | 'desc'

function PrefixTable() {
  const { data: session } = useSession()
  const [FormData, setFormData] = useState<FormDataPrefix>(FormDataPrefix)
  const [loading, setLoading] = useState<boolean>(false)
  const [order, setOrder] = useState<Order>('asc')
  const [orderBy, setOrderBy] = useState<string>('')
  const [page, setPage] = useState<number>(0)
  const [rowsPerPage, setRowsPerPage] = useState<number>(10)
  const [total, setTotal] = useState<number>(0)
  const [data, setData] = useState<Prefix[]>([])
  const [params, setParams] = useState<PrefixSearchParams>({
    search: '',
    page: 1,
    limit: 10,
    sort: '',
    order: '',
  })
  const [searchInput, setSearchInput] = useState<string>('')
  const [selectedPrefix, setSelectedPrefix] = useState<string>('')
  const [selectedPrefixId, setSelectedPrefixId] = useState<number>(0)
  const [selectedPrefixName, setSelectedPrefixName] = useState<string>('')
  const [sortState, setSortState] = useState<SortState>({
    column: null,
    order: null,
  })

  // Define table columns
  const columns: TableColumn<Prefix>[] = [
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
      key: 'prefix_name',
      label: 'คำนำหน้า',
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
            className="cursor-pointer rounded-md p-1 text-yellow-500 transition duration-300 ease-in-out hover:bg-yellow-500 hover:text-white"
            onClick={() => {
              setSelectedPrefixId(row.prefix_id)
              setSelectedPrefixName(row.prefix_name)
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
              setSelectedPrefixId(row.prefix_id)
              setSelectedPrefixName(row.prefix_name)
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

  const getPrefixes = async (
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

      const response = await PrefixServices.getAllPrefixes(
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
      getPrefixes(
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
    getPrefixes,
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

  const handlePrefixSelect = (value: string) => {
    setSelectedPrefix(value)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement> | React.MouseEvent,
    prefix_name: string
  ) => {
    setLoading(true)
    try {
      if (!session?.accessToken) throw new Error('No access token')
      const response = await PrefixServices.createPrefix(
        { prefix_name },
        session.accessToken
      )

      if (response && (response as any).status === true) {
        setFormData(FormDataPrefix)
        getPrefixes(
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
          text: `เพิ่มคำนำหน้า ${prefix_name} สำเร็จ!`,
          showConfirmButton: false,
          timer: 1500,
        })
      } else {
        throw new Error('ไม่สามารถสร้างคำนำหน้าได้')
      }
    } catch (error) {
      console.error('Error adding prefix:', error)
      setLoading(false)
      Swal.fire({
        position: 'center',
        icon: 'error',
        title: 'เกิดข้อผิดพลาด!',
        text: 'เกิดข้อผิดพลาดในการเพิ่มคำนำหน้า',
        showConfirmButton: false,
        timer: 1500,
      })
    }
  }

  const handleDelete = async (
    e: React.FormEvent<HTMLFormElement> | React.MouseEvent,
    prefix_id: number,
    prefix_name: string
  ) => {
    e.preventDefault()
    setLoading(true)
    try {
      if (!session?.accessToken) throw new Error('No access token')
      await PrefixServices.deletePrefix(prefix_id, session.accessToken)

      getPrefixes(
        params.search || '',
        params.limit,
        params.page,
        params.sort || '',
        params.order || ''
      )

      Swal.fire({
        icon: 'success',
        title: 'ลบสำเร็จ!',
        text: `ลบคำนำหน้า ${prefix_name} สำเร็จ!`,
        showConfirmButton: false,
        timer: 1500,
      })
    } catch (error) {
      console.error('Error deleting prefix:', error)
      setLoading(false)

      Swal.fire({
        icon: 'error',
        title: 'เกิดข้อผิดพลาด!',
        text: 'เกิดข้อผิดพลาดในการลบคำนำหน้า',
        showConfirmButton: false,
        timer: 1500,
      })
    }
  }

  const handleEdit = async (
    e: React.FormEvent<HTMLFormElement> | React.MouseEvent,
    prefix_id: number,
    prefix_name: string
  ) => {
    e.preventDefault()
    setLoading(true)
    try {
      if (!session?.accessToken) throw new Error('No access token')
      const response = await PrefixServices.updatePrefix(
        prefix_id,
        { prefix_name },
        session.accessToken
      )

      if (response && (response as any).status === true) {
        getPrefixes(
          params.search || '',
          params.limit,
          params.page,
          params.sort || '',
          params.order || ''
        )

        Swal.fire({
          icon: 'success',
          title: 'แก้ไขสำเร็จ!',
          text: `แก้ไขคำนำหน้า ${prefix_name} สำเร็จ!`,
          showConfirmButton: false,
          timer: 1500,
        })
      } else {
        throw new Error('ไม่สามารถแก้ไขคำนำหน้าได้')
      }
    } catch (error) {
      console.error('Error updating prefix:', error)
      setLoading(false)

      Swal.fire({
        icon: 'error',
        title: 'เกิดข้อผิดพลาด!',
        text: 'เกิดข้อผิดพลาดในการแก้ไขคำนำหน้า',
        showConfirmButton: false,
        timer: 1500,
      })
    }
  }

  const totalPages = Math.ceil(total / rowsPerPage)
  const selectedLabel =
    data.find((pos) => pos.prefix_name === selectedPrefix)?.prefix_name ||
    'เลือกคำนำหน้า'

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
              placeholder="ค้นหาด้วยชื่อคำนำหน้า"
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
              เพิ่มคำนำหน้า
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
        prefix_id={selectedPrefixId}
        prefix_name={selectedPrefixName}
        handleDelete={handleDelete}
      />
      <EditModal
        isLoading={loading}
        prefix_id={selectedPrefixId}
        prefix_name={selectedPrefixName}
        handleEdit={handleEdit}
      />
    </div>
  )
}

export default PrefixTable