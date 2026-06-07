import { Edit, Eye } from 'lucide-react'
import type { TableColumn } from '@/components/Table'
import type { RoundList } from '@/Types/setAssessor'
import type { RoundAccessInfo } from './useWorkloadRounds'
import { formatThaiDate, getRoundStatusColor, getRoundStatusLabel } from './roundStatus'

interface BuildColumnsArgs {
  page: number
  rowsPerPage: number
  roundAccessInfo: Record<number, RoundAccessInfo>
  onView: (roundListId: number) => void
}

const textCellClass = 'text-sm font-light text-gray-500 dark:text-gray-400'

export function buildRoundColumns({
  page,
  rowsPerPage,
  roundAccessInfo,
  onView,
}: BuildColumnsArgs): TableColumn<RoundList>[] {
  return [
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
      render: (value) => <span className={textCellClass}>{value || '-'}</span>,
    },
    {
      key: 'date_start',
      label: 'วันที่เริ่มต้น',
      align: 'left',
      sortable: true,
      render: (value) => <span className={textCellClass}>{formatThaiDate(value) || '-'}</span>,
    },
    {
      key: 'date_end',
      label: 'วันที่สิ้นสุด',
      align: 'left',
      sortable: true,
      render: (value) => <span className={textCellClass}>{formatThaiDate(value) || '-'}</span>,
    },
    {
      key: 'status',
      label: 'สถานะ',
      align: 'left',
      sortable: true,
      render: (_, record) => {
        const accessInfo = roundAccessInfo[record.round_list_id]
        const statusLabel = getRoundStatusLabel(
          record.date_start,
          record.date_end,
          record.has_completed_forms,
          accessInfo
        )
        return (
          <span
            className={`text-xs font-normal rounded-md px-2 py-1 ${getRoundStatusColor(
              record.date_start,
              record.date_end,
              record.has_completed_forms,
              accessInfo
            )}`}
          >
            {statusLabel}
          </span>
        )
      },
    },
    {
      key: 'actions',
      label: 'จัดการ',
      width: '200px',
      align: 'center',
      render: (_, record) => {
        const currentDate = new Date()
        const start = new Date(record.date_start)
        const accessInfo = roundAccessInfo[record.round_list_id]
        const canEdit = Boolean(accessInfo?.hasUserAssignment && accessInfo?.hasAssignedAssessor)
        const isBeforeStart = currentDate < start
        const statusLabel = getRoundStatusLabel(
          record.date_start,
          record.date_end,
          record.has_completed_forms,
          accessInfo
        )
        const shouldDisableEdit = statusLabel === 'รอดำเนินการ'
        const isCompleted = record.has_completed_forms === 1 || record.has_completed_forms === 2

        if (isCompleted) {
          return (
            <ActionButtons>
              <ViewButton onClick={() => onView(record.round_list_id)} />
            </ActionButtons>
          )
        }

        if (isBeforeStart) {
          return (
            <ActionButtons>
              <DisabledEditButton />
            </ActionButtons>
          )
        }

        if (canEdit) {
          return (
            <ActionButtons>
              <EditButton onClick={() => onView(record.round_list_id)} />
            </ActionButtons>
          )
        }

        if (shouldDisableEdit) {
          return (
            <ActionButtons>
              <DisabledEditButton />
            </ActionButtons>
          )
        }

        return (
          <ActionButtons>
            <ViewButton onClick={() => onView(record.round_list_id)} />
          </ActionButtons>
        )
      },
    },
  ]
}

function ActionButtons({ children }: { children: React.ReactNode }) {
  return <div className="w-full flex justify-center gap-2 p-0">{children}</div>
}

function ViewButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      className="cursor-pointer rounded-md p-1 text-blue-500 transition duration-300 ease-in-out hover:bg-blue-500 hover:text-white"
      onClick={onClick}
    >
      <Eye className="h-4 w-4" />
    </button>
  )
}

function EditButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      className="cursor-pointer rounded-md p-1 text-amber-500 transition duration-300 ease-in-out hover:bg-amber-500 hover:text-white"
      onClick={onClick}
    >
      <Edit className="h-4 w-4" />
    </button>
  )
}

function DisabledEditButton() {
  return (
    <button
      type="button"
      className="cursor-default rounded-md p-1 text-gray-300"
      disabled
      aria-disabled="true"
    >
      <Edit className="h-4 w-4" />
    </button>
  )
}
