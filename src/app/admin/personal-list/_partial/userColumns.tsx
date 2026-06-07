import { Edit2, Trash2 } from 'lucide-react'
import type { Personal } from '@/Types'
import type { TableColumn } from '@/components/Table'

const positionStyles: { [key: string]: string } = {
  อาจารย์: 'text-white bg-blue-500',
  รองศาสตราจารย์: 'text-white bg-green-500',
  ศาสตราจารย์: 'text-white bg-purple-500',
  ผู้ช่วยศาสตราจารย์: 'text-white bg-amber-500',
  ผู้ช่วยอาจารย์: 'text-white bg-purple-500',
}

interface GetUserColumnsArgs {
  // หน้าปัจจุบัน (เริ่มที่ 1) ใช้คำนวณลำดับแถว
  page: number
  rowsPerPage: number
  onEdit: (row: Personal) => void
  onDelete: (row: Personal) => void
}

export function getUserColumns({
  page,
  rowsPerPage,
  onEdit,
  onDelete,
}: GetUserColumnsArgs): TableColumn<Personal>[] {
  return [
    {
      key: 'index',
      label: '#',
      width: '80px',
      align: 'center',
      render: (_, __, index) => (
        <span className="font-regular text-sm text-gray-600 dark:text-gray-300">
          {(page - 1) * rowsPerPage + index + 1}
        </span>
      ),
    },
    {
      key: 'u_img',
      label: 'รูปภาพ',
      width: '100px',
      align: 'center',
      render: (_, row) => (
        <div className="flex justify-center">
          <img
            src={`/profile/${row?.u_img || 'default.png'}`}
            alt="User Image"
            className="h-10 w-10 rounded-md border-2 object-cover"
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
      render: (_, row) => (
        <div className="flex w-full justify-center gap-2 p-0">
          <button
            type="button"
            className="cursor-pointer rounded-md p-1 text-yellow-500 transition duration-300 ease-in-out hover:bg-yellow-500 hover:text-white"
            onClick={() => onEdit(row)}
          >
            <Edit2 className="h-4 w-4" />
          </button>
          <button
            type="button"
            className="cursor-pointer rounded-md p-1 text-red-500 transition duration-300 ease-in-out hover:bg-red-500 hover:text-white"
            onClick={() => onDelete(row)}
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ]
}
