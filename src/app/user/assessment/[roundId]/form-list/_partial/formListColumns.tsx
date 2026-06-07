'use client'

import { Eye, NotebookText } from 'lucide-react'
import type { TableColumn } from '@/components/Table'
import type { AssesseeWithProgress, EvaluationStatus } from './useFormList'

function renderFormStatusBadge(status: number | null | undefined) {
  if (!status || status <= 0) {
    return (
      <span className="inline-flex px-2 py-1 text-xs font-normal rounded-md bg-gray-200 text-gray-500">
        ยังไม่ได้เริ่ม
      </span>
    )
  }

  return (
    <span className="inline-flex px-2 py-1 text-xs font-normal rounded-md bg-success text-white">
      ส่งแล้ว
    </span>
  )
}

function renderEvaluationStatusBadge(status: EvaluationStatus | undefined) {
  switch (status) {
    case 'completed':
      return (
        <span className="inline-flex px-2 py-1 text-xs font-normal rounded-md bg-success text-white">
          เสร็จสิ้น
        </span>
      )
    case 'in_progress':
      return (
        <span className="inline-flex px-2 py-1 text-xs font-normal rounded-md bg-blue-500 text-white">
          กำลังตรวจ
        </span>
      )
    default:
      return (
        <span className="inline-flex px-2 py-1 text-xs font-normal rounded-md bg-gray-200 text-gray-500">
          ยังไม่ตรวจ
        </span>
      )
  }
}

interface BuildColumnsArgs {
  page: number
  rowsPerPage: number
  onNavigateToForm: (row: AssesseeWithProgress) => void
}

export function buildFormListColumns({
  page,
  rowsPerPage,
  onNavigateToForm,
}: BuildColumnsArgs): TableColumn<AssesseeWithProgress>[] {
  return [
    {
      key: 'index',
      label: '#',
      width: '60px',
      align: 'center',
      render: (_value, _row, index) => (
        <span className="font-regular text-sm text-gray-600 dark:text-gray-300">
          {(page - 1) * rowsPerPage + index + 1}
        </span>
      ),
    },
    {
      key: 'assessee',
      label: 'ผู้รับการประเมิน',
      render: (_value, row) => (
        <div className="space-y-1 text-left">
          <div className="text-sm font-light text-gray-500 dark:text-gray-300">
            {row.prefix_name} {row.u_fname} {row.u_lname}
          </div>
        </div>
      ),
    },
    {
      key: 'position_name',
      label: 'ตำแหน่งวิชาการ',
      render: (value) => (
        <span className="text-sm font-light text-gray-500 dark:text-gray-400">{value || '-'}</span>
      ),
    },
    {
      key: 'ex_position_name',
      label: 'ตำแหน่งบริหาร',
      render: (value) => (
        <span className="text-sm font-light text-gray-500 dark:text-gray-400">{value || '-'}</span>
      ),
    },
    {
      key: 'workload_group_name',
      label: 'กลุ่มภาระงาน',
      render: (value) => (
        <span className="text-sm font-light text-gray-500 dark:text-gray-400">{value || '-'}</span>
      ),
    },
    {
      key: 'form_status',
      label: 'สถานะผู้รับการประเมิน',
      align: 'left',
      render: (_value, row) => (
        <span className="text-left text-sm font-light text-gray-500 dark:text-gray-400">
          {renderFormStatusBadge(row.form_status)}
        </span>
      ),
    },
    {
      key: 'evaluation_status',
      label: 'สถานะตรวจประเมิน',
      align: 'left',
      render: (_value, row) => (
        <span className="text-left text-sm font-light text-gray-500 dark:text-gray-400">
          {renderEvaluationStatusBadge(row.evaluation_status)}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'จัดการ',
      align: 'center',
      render: (_value, row) => {
        const formStatus = row.form_status ?? null
        const canAccess = formStatus !== null && formStatus >= 1 && row.formlist_id

        if (!canAccess) {
          return (
            <div className="flex w-full justify-center gap-2 p-0">
              <button
                type="button"
                disabled
                className="cursor-default rounded-md p-1 text-gray-300 transition-colors dark:text-gray-600"
                title="รอผู้รับการประเมินส่งแบบฟอร์ม"
              >
                <NotebookText className="h-4 w-4" />
              </button>
            </div>
          )
        }

        if (row.evaluation_status === 'completed') {
          return (
            <div className="flex w-full justify-center gap-2 p-0">
              <button
                type="button"
                onClick={() => onNavigateToForm(row)}
                className="cursor-pointer rounded-md p-1 text-blue-500 transition-colors hover:bg-blue-500 hover:text-white"
                title="ดูผลการประเมิน"
              >
                <Eye className="h-4 w-4" />
              </button>
            </div>
          )
        }

        return (
          <div className="flex w-full justify-center gap-2 p-0">
            <button
              type="button"
              onClick={() => onNavigateToForm(row)}
              className="cursor-pointer rounded-md p-1 text-emerald-500 transition-colors hover:bg-emerald-500 hover:text-white"
              title="เริ่มประเมิน"
            >
              <NotebookText className="h-4 w-4" />
            </button>
          </div>
        )
      },
    },
  ]
}
