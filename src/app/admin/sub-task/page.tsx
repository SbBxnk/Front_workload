'use client'

import { useEffect, useState } from 'react'
import { Edit2, Plus, Trash2 } from 'lucide-react'
import { FiX } from 'react-icons/fi'
import type { SubTask } from '@/Types'
import Table, { type TableColumn } from '@/components/Table'
import Tooltip from '@/components/Tooltip'
import useUtility from '@/hooks/useUtility'
import { useSubTaskList } from './_partial/useSubTaskList'
import { useSubTaskMutations } from './_partial/useSubTaskMutations'
import CreateSubTaskModal from './_partial/CreateSubTaskModal'
import EditSubTaskModal from './_partial/EditSubTaskModal'
import DeleteSubTaskModal from './_partial/DeleteSubTaskModal'

const ROWS_PER_PAGE_OPTIONS = [10, 20, 50, 100, 200]

// เปิด daisyui modal ผ่าน checkbox id
const openModal = (id: string) => {
  const el = document.getElementById(id) as HTMLInputElement | null
  if (el) el.checked = true
}

export default function SubTaskPage() {
  const { setBreadcrumbs } = useUtility()
  const list = useSubTaskList()
  const { createSubTask, updateSubTask, deleteSubTask } = useSubTaskMutations()
  const [selected, setSelected] = useState<SubTask | null>(null)

  useEffect(() => {
    setBreadcrumbs([{ text: 'ภาระงานย่อย', path: '/admin/sub-task' }])
  }, [setBreadcrumbs])

  const columns: TableColumn<SubTask>[] = [
    {
      key: 'index',
      label: '#',
      width: '80px',
      align: 'center',
      render: (_, __, index) => (
        <span className="font-regular text-sm text-gray-600 dark:text-gray-300">
          {(list.params.page - 1) * list.params.limit + index + 1}
        </span>
      ),
    },
    {
      key: 'subtask_name',
      label: 'ภาระงานย่อย',
      align: 'left',
      sortable: true,
      width: '40%',
      render: (value) => {
        const displayValue = value || '-'
        return (
          <Tooltip content={displayValue}>
            <div className="w-full cursor-default text-sm font-light text-gray-500 dark:text-gray-400">
              <div className="line-clamp-2 whitespace-normal">{displayValue}</div>
            </div>
          </Tooltip>
        )
      },
    },
    {
      key: 'task_name',
      label: 'ภาระงานหลัก',
      align: 'left',
      sortable: true,
      width: '30%',
      render: (value) => {
        const displayValue = value || '-'
        return (
          <Tooltip content={displayValue}>
            <div className="w-full cursor-default text-sm font-light text-gray-500 dark:text-gray-400">
              <div className="line-clamp-2 whitespace-normal">{displayValue}</div>
            </div>
          </Tooltip>
        )
      },
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
            onClick={() => {
              setSelected(row)
              openModal('modal-edit')
            }}
          >
            <Edit2 className="h-4 w-4" />
          </button>
          <button
            type="button"
            className="cursor-pointer rounded-md p-1 text-red-500 transition duration-300 ease-in-out hover:bg-red-500 hover:text-white"
            onClick={() => {
              setSelected(row)
              openModal('modal-delete')
            }}
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ]

  return (
    <div className="rounded-md bg-white p-4 shadow transition-all duration-300 ease-in-out dark:bg-zinc-900 dark:text-gray-400">
      <div className="mb-4 flex items-end justify-between">
        <div className="flex w-full flex-wrap items-end gap-4 md:w-auto">
          {list.isLoading ? (
            <div className="skeleton h-7 w-16 rounded-md" />
          ) : (
            <div className="w-auto rounded-md bg-gray-200 px-2 py-1 text-sm font-normal text-business1 dark:bg-zinc-800 dark:text-blue-500">
              {list.total} รายการ
            </div>
          )}
        </div>
        <div className="flex items-center justify-end gap-4">
          <div className="relative flex w-full items-center md:w-52">
            <input
              className="w-full rounded-md border border-gray-300 px-4 py-2 text-sm font-light text-gray-600 transition-all duration-300 ease-in-out focus:border-blue-500 focus:outline-none dark:border-zinc-600 dark:bg-zinc-800 dark:text-gray-400"
              placeholder="ค้นหาด้วยชื่อภาระงานย่อยหรือภาระงานหลัก"
              value={list.searchInput}
              onChange={(e) => list.handleSearchChange(e.target.value)}
            />
            {list.searchInput && (
              <button
                onClick={list.clearSearch}
                className="absolute right-3 text-gray-400 transition duration-200 hover:text-red-500"
              >
                <FiX className="h-4 w-4" />
              </button>
            )}
          </div>
          <div className="w-full pt-4 md:w-auto md:pt-0">
            <label
              htmlFor="modal-create"
              className="flex w-full cursor-pointer items-center justify-between gap-2 rounded-md bg-success px-4 py-2.5 text-sm font-light text-white transition duration-300 ease-in-out hover:bg-success/80 md:w-52"
            >
              เพิ่มภาระงานย่อย
              <Plus className="h-4 w-4" />
            </label>
          </div>
        </div>
      </div>

      <Table
        data={list.subtasks}
        columns={columns}
        loading={list.isLoading}
        total={list.total}
        currentPage={list.params.page}
        totalPages={list.totalPages}
        rowsPerPage={list.params.limit}
        onPageChange={list.handlePageChange}
        onRowsPerPageChange={list.handleRowsPerPageChange}
        emptyMessage="ไม่พบข้อมูล"
        skeletonRows={list.params.limit}
        stickyColumns={1}
        sortable
        sortState={list.sortState}
        onSort={list.handleSort}
        rowsPerPageOptions={ROWS_PER_PAGE_OPTIONS}
      />

      <CreateSubTaskModal onSubmit={(data) => createSubTask.mutate(data)} />
      <EditSubTaskModal
        subtask={selected}
        onSubmit={(id, data) => updateSubTask.mutate({ id, data })}
      />
      <DeleteSubTaskModal
        subtask={selected}
        onConfirm={(id, name) => deleteSubTask.mutate({ id, name })}
      />
    </div>
  )
}
