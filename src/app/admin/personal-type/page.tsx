'use client'
import type React from 'react'
import { useEffect, useState } from 'react'
import { Edit2, Plus, Trash2 } from 'lucide-react'
import type { PersonalType, PersonalTypeSearchParams, ResponsePayload } from '@/Types'
import CreateModal from './createModal'
import DeleteModal from './deleteModal'
import { FiX } from 'react-icons/fi'
import Swal from 'sweetalert2'
import EditModal from './editModal'
import PersonalTypeServices from '@/services/personaltypeServices'
import { useSession } from 'next-auth/react'
import Table, { TableColumn, SortState, SortOrder } from '@/components/Table'

const ITEMS_PER_PAGE = 10

interface FormDataPersonalType {
  type_p_name: string
}

const FormDataPersonalType: FormDataPersonalType = {
  type_p_name: '',
}

type Order = 'asc' | 'desc'

function PersonalTypeTable() {
  const { data: session } = useSession()
  const [FormData, setFormData] = useState<FormDataPersonalType>(FormDataPersonalType)
  const [loading, setLoading] = useState<boolean>(false)
  const [order, setOrder] = useState<Order>('asc')
  const [orderBy, setOrderBy] = useState<string>('')
  const [page, setPage] = useState<number>(0)
  const [rowsPerPage, setRowsPerPage] = useState<number>(10)
  const [total, setTotal] = useState<number>(0)
  const [data, setData] = useState<PersonalType[]>([])
  const [params, setParams] = useState<PersonalTypeSearchParams>({
    search: '',
    page: 1,
    limit: 10,
    sort: '',
    order: '',
  })
  const [searchInput, setSearchInput] = useState<string>('')
  const [selectedPersonalType, setSelectedPersonalType] = useState<string>('')
  const [selectedPersonalTypeId, setSelectedPersonalTypeId] = useState<number>(0)
  const [selectedPersonalTypeName, setSelectedPersonalTypeName] = useState<string>('')
  const [sortState, setSortState] = useState<SortState>({
    column: null,
    order: null,
  })

  // Define table columns
  const columns: TableColumn<PersonalType>[] = [
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
      key: 'type_p_name',
      label: 'ประเภทบุคลากร',
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
      render: (_, record) => (
        <div className="w-full flex justify-center gap-2 p-0">
          <button
            type="button"
            className="cursor-pointer rounded-md p-1 text-yellow-500 transition duration-300 ease-in-out hover:bg-yellow-500 hover:text-white"
            onClick={() => {
              setSelectedPersonalTypeId(record.type_p_id)
              setSelectedPersonalTypeName(record.type_p_name)
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
              setSelectedPersonalTypeId(record.type_p_id)
              setSelectedPersonalTypeName(record.type_p_name)
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

  const getPersonalTypes = async (
    search: string = '',
    limit: number = 10,
    page: number = 1,
    sort: string = '',
    order: string = '',
    afterSuccess?: () => void
  ) => {
    setLoading(true)
    setData([])
    try {
      if (!session?.accessToken) {
        throw new Error('No access token')
      }

      const response = await PersonalTypeServices.getAllPersonalTypes(session.accessToken, {
        search,
        page,
        limit,
        sort,
        order,
      })

      if (response.success) {
        const responseData = response.payload || []
        const responseMeta = response.meta


        setTotal(responseMeta?.total_rows || 0)
        if (responseMeta) {
          setPage(responseMeta.page - 1)
          setRowsPerPage(responseMeta.limit)
        }
        setData(responseData)
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
      getPersonalTypes(
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



  const updateUrlParams = (newParams: any) => {
    const url = new URL(window.location.href)
    Object.keys(newParams).forEach((key) => {
      if (newParams[key]) {
        url.searchParams.set(key, newParams[key])
      } else {
        url.searchParams.delete(key)
      }
    })
    window.history.replaceState({}, '', url.toString())
  }

  const handleSort = (column: string) => {
    const newOrder = sortState.column === column && sortState.order === 'asc' ? 'desc' : 'asc'
    setSortState({ column, order: newOrder })
    setParams((prev) => ({
      ...prev,
      sort: column,
      order: newOrder,
      page: 1,
    }))
  }

  const handlePageChange = (newPage: number) => {
    setParams((prev) => ({
      ...prev,
      page: newPage + 1,
    }))
  }

  const handleRowsPerPageChange = (newRowsPerPage: number) => {
    setParams((prev) => ({
      ...prev,
      limit: newRowsPerPage,
      page: 1,
    }))
  }

  const clearSearch = () => {
    setSearchInput('')
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement> | React.MouseEvent,
    type_p_name: string
  ) => {
    e.preventDefault()
    setLoading(true)
    try {
      if (!session?.accessToken) throw new Error('No access token')
      const response = await PersonalTypeServices.createPersonalType(
        { type_p_name },
        session.accessToken
      )

      if (response && (response as any).status === true) {
        setFormData(FormDataPersonalType)
        getPersonalTypes(
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
          text: `เพิ่มประเภทบุคลากร ${type_p_name} สำเร็จ!`,
          showConfirmButton: false,
          timer: 1500,
        })
      } else {
        throw new Error('ไม่สามารถสร้างประเภทบุคลากรได้')
      }
    } catch (error) {
      console.error('Error adding personal type:', error)
      setLoading(false)
      Swal.fire({
        position: 'center',
        icon: 'error',
        title: 'เกิดข้อผิดพลาด!',
        text: 'เกิดข้อผิดพลาดในการเพิ่มประเภทบุคลากร',
        showConfirmButton: false,
        timer: 1500,
      })
    }
  }

  const handleDelete = async (
    e: React.FormEvent<HTMLFormElement> | React.MouseEvent,
    type_p_id: number,
    type_p_name: string
  ) => {
    e.preventDefault()
    setLoading(true)
    try {
      if (!session?.accessToken) throw new Error('No access token')
      await PersonalTypeServices.deletePersonalType(type_p_id, session.accessToken)

      // Reset to page 1 and fetch new data
      setPage(0)
      setParams((prev) => ({
        ...prev,
        page: 1,
      }))
      
      getPersonalTypes(
        params.search || '',
        params.limit,
        1, // Reset to page 1
        params.sort || '',
        params.order || ''
      )

      Swal.fire({
        icon: 'success',
        title: 'ลบสำเร็จ!',
        text: `ลบประเภทบุคลากร ${type_p_name} สำเร็จ!`,
        showConfirmButton: false,
        timer: 1500,
      })
    } catch (error) {
      console.error('Error deleting personal type:', error)
      setLoading(false)

      Swal.fire({
        icon: 'error',
        title: 'เกิดข้อผิดพลาด!',
        text: 'เกิดข้อผิดพลาดในการลบประเภทบุคลากร',
        showConfirmButton: false,
        timer: 1500,
      })
    }
  }

  const handleEdit = async (
    e: React.FormEvent<HTMLFormElement> | React.MouseEvent,
    type_p_id: number,
    updatedTypePName: string
  ) => {
    e.preventDefault()
    setLoading(true)
    try {
      if (!session?.accessToken) throw new Error('No access token')
      const response = await PersonalTypeServices.updatePersonalType(
        type_p_id,
        { type_p_name: updatedTypePName },
        session.accessToken
      )

      if (response && (response as any).status === true) {
        getPersonalTypes(
          params.search || '',
          params.limit,
          params.page,
          params.sort || '',
          params.order || ''
        )

        Swal.fire({
          icon: 'success',
          title: 'แก้ไขสำเร็จ!',
          text: `แก้ไขประเภทบุคลากร ${updatedTypePName} สำเร็จ!`,
          showConfirmButton: false,
          timer: 1500,
        })
      } else {
        throw new Error('ไม่สามารถแก้ไขประเภทบุคลากรได้')
      }
    } catch (error) {
      console.error('Error updating personal type:', error)
      setLoading(false)

      Swal.fire({
        icon: 'error',
        title: 'เกิดข้อผิดพลาด!',
        text: 'เกิดข้อผิดพลาดในการแก้ไขประเภทบุคลากร',
        showConfirmButton: false,
        timer: 1500,
      })
    }
  }

  const totalPages = Math.ceil(total / rowsPerPage)
  const selectedLabel =
    data.find((pos) => pos.type_p_name === selectedPersonalType)?.type_p_name ||
    'เลือกประเภทบุคลากร'

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
              placeholder="ค้นหาด้วยชื่อประเภทบุคลากร"
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
              เพิ่มประเภทบุคลากร
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
        type_p_id={selectedPersonalTypeId}
        type_p_name={selectedPersonalTypeName}
        handleDelete={handleDelete}
      />
      <EditModal
        type_p_id={selectedPersonalTypeId}
        type_p_name={selectedPersonalTypeName}
        handleEdit={handleEdit}
      />
    </div>
  )
}

export default PersonalTypeTable