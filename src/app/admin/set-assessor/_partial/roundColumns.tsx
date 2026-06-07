import { Edit2, Eye, Trash2 } from 'lucide-react'
import type { RoundList } from '@/Types/setAssessor'
import type { TableColumn } from '@/components/Table'

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

// แปลงวันที่เป็นรูปแบบไทย (พ.ศ.)
const formatThaiDate = (dateString: string) => {
  if (!dateString) return '-'
  const date = new Date(dateString)
  if (isNaN(date.getTime())) return dateString
  const day = date.getDate()
  const year = date.getFullYear() + 543
  const month = thaiMonths[date.getMonth()]
  return `${day} ${month} ${year}`
}

// อนุญาตให้แก้ไข/ลบได้เมื่อยังไม่เลยวันสิ้นสุดของรอบ
const isDateInRange = (startDate: string, endDate: string): boolean => {
  if (!startDate || !endDate) return false
  return new Date() <= new Date(endDate)
}

interface GetRoundColumnsArgs {
  // หน้าปัจจุบัน (เริ่มที่ 1) ใช้คำนวณลำดับแถว
  page: number
  rowsPerPage: number
  onEdit: (row: RoundList) => void
  onDelete: (row: RoundList) => void
  onView: (roundListId: number) => void
  // รอบที่มีผู้ประเมินแล้ว (ห้ามลบ)
  roundsWithAssessorData: number[]
}

export function getRoundColumns({
  page,
  rowsPerPage,
  onEdit,
  onDelete,
  onView,
  roundsWithAssessorData,
}: GetRoundColumnsArgs): TableColumn<RoundList>[] {
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
      render: (_, record) => {
        const editable = isDateInRange(record.date_start, record.date_end)
        const hasAssessor = roundsWithAssessorData.includes(
          record.round_list_id
        )
        return (
          <div className="flex w-full justify-center gap-2 p-0">
            <button
              type="button"
              className="cursor-pointer rounded-md p-1 text-blue-500 transition duration-300 ease-in-out hover:bg-blue-500 hover:text-white"
              onClick={() => onView(record.round_list_id)}
            >
              <Eye className="h-4 w-4" />
            </button>
            {editable ? (
              <>
                <button
                  type="button"
                  className="cursor-pointer rounded-md p-1 text-yellow-500 transition duration-300 ease-in-out hover:bg-yellow-500 hover:text-white"
                  onClick={() => onEdit(record)}
                >
                  <Edit2 className="h-4 w-4" />
                </button>
                {!hasAssessor ? (
                  <button
                    type="button"
                    className="cursor-pointer rounded-md p-1 text-red-500 transition duration-300 ease-in-out hover:bg-red-500 hover:text-white"
                    onClick={() => onDelete(record)}
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
        )
      },
    },
  ]
}
