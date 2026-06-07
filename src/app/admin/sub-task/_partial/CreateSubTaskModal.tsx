'use client'

import { useEffect, useRef, useState } from 'react'
import type React from 'react'
import type { CreateSubTaskRequest } from '@/Types'
import SelectMainTask from './SelectMainTask'

interface CreateSubTaskModalProps {
  onSubmit: (data: CreateSubTaskRequest) => void
}

// daisyui modal เปิด/ปิดด้วย checkbox id="modal-create"
export default function CreateSubTaskModal({
  onSubmit,
}: CreateSubTaskModalProps) {
  const [subtaskName, setSubtaskName] = useState('')
  const [taskId, setTaskId] = useState(0)
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const mainTaskDropdownRef = useRef<HTMLDivElement>(null)
  const [selectMainTask, setSelectedMainTask] = useState<string | null>(null)

  // ปิด dropdown เมื่อคลิกนอกพื้นที่
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        mainTaskDropdownRef.current &&
        !mainTaskDropdownRef.current.contains(event.target as Node)
      ) {
        setOpenDropdown(null)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleOnChangeMainTask = (task_id: number) => setTaskId(task_id)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({ subtask_name: subtaskName, task_id: taskId })
    setSubtaskName('')
    setTaskId(0)
    setSelectedMainTask(null)
    const modal = document.getElementById('modal-create') as HTMLInputElement | null
    if (modal) modal.checked = false
  }

  return (
    <div className="relative z-[100]">
      <input type="checkbox" id="modal-create" className="modal-toggle" />
      <div className="modal" role="dialog">
        <div className="modal-box rounded-md p-0 dark:bg-zinc-800">
          <form onSubmit={handleSubmit}>
            <div className="flex items-center border-b border-gray-200 p-4">
              <h3 className="font-regular flex truncate text-start text-2xl text-gray-600 dark:text-gray-400">
                เพิ่มภาระงานย่อย&nbsp;
              </h3>
            </div>
            <div className="flex-col justify-between space-y-4 p-4">
              <div className="w-full">
                <SelectMainTask
                  openDropdown={openDropdown}
                  setOpenDropdown={setOpenDropdown}
                  mainTaskDropdownRef={mainTaskDropdownRef}
                  handleOnChangeMainTask={handleOnChangeMainTask}
                  selectMainTask={selectMainTask}
                  setSelectedMainTask={setSelectedMainTask}
                />
              </div>
              <div className="w-full">
                <label className="font-regular mb-2 block text-sm text-gray-600 dark:text-gray-400">
                  ชื่อภาระงานย่อย
                </label>
                <input
                  name="subtask_name"
                  value={subtaskName}
                  onChange={(e) => setSubtaskName(e.target.value)}
                  type="text"
                  className="w-full rounded-md border border-gray-300 px-4 py-2 text-sm font-light text-gray-600 transition-all duration-300 ease-in-out focus:border-blue-500 focus:outline-none dark:border-zinc-600 dark:bg-zinc-800 dark:text-gray-400"
                  placeholder="กรุณากรอกชื่อภาระงานย่อย"
                />
              </div>
            </div>
            <div className="flex justify-end gap-4 border-t border-gray-200 p-4">
              <label
                htmlFor="modal-create"
                className="text-md flex h-10 w-20 cursor-pointer items-center justify-center rounded-md border-2 border-gray-200 bg-gray-200 px-4 py-2 text-gray-600 transition duration-300 ease-in-out hover:border-gray-300 hover:bg-gray-300 dark:border-zinc-700 dark:bg-zinc-700 dark:text-gray-400 dark:hover:border-zinc-600 dark:hover:bg-zinc-600"
              >
                ยกเลิก
              </label>
              <button
                type="submit"
                className="text-md flex h-10 w-20 items-center justify-center rounded-md bg-success px-4 py-2 text-white transition duration-300 ease-in-out hover:bg-success/80"
              >
                ยืนยัน
              </button>
            </div>
          </form>
        </div>
        <label className="modal-backdrop" htmlFor="modal-create">
          Close
        </label>
      </div>
    </div>
  )
}
