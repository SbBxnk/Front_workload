'use client'
import { useState, useEffect, useRef } from 'react'
import type React from 'react'
import type { MainTask } from '@/Types'
import SelectMainTask from './subTaskComponents/SelectMainTask'

interface EditModalProps {
  isLoading: boolean
  subtask_id: number
  subtask_name: string
  task_id: number
  handleEdit: (
    e: React.FormEvent<HTMLFormElement> | React.MouseEvent,
    subtask_id: number,
    subtask_name: string,
    task_id: number
  ) => void
  task_name: string
  mainTasks: MainTask[]
}

export default function EditModal({
  isLoading,
  subtask_id,
  subtask_name,
  task_id,
  handleEdit,
  task_name,
  mainTasks,
}: EditModalProps) {
  const [editName, setEditName] = useState(subtask_name)
  const [editTaskId, setEditTaskId] = useState(task_id)
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const mainTaskDropdownRef = useRef<HTMLDivElement>(null)
  const [selectMainTask, setSelectedMainTask] = useState<string | null>(null)

  useEffect(() => {
    setEditName(subtask_name)
    setEditTaskId(task_id)
    // Set selected main task name based on task_id
    const selectedTask = mainTasks.find(task => task.task_id === task_id)
    setSelectedMainTask(selectedTask ? selectedTask.task_name : null)
  }, [subtask_name, task_id, mainTasks])

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
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handleOnChangeMainTask = (task_id: number, task_name: string) => {
    setEditTaskId(task_id)
  }

  if (isLoading) return null

  return (
    <div className="relative z-[100]">
      <input
        type="checkbox"
        id={`modal-edit`}
        className="modal-toggle"
      />
      <div className="modal" role={`modal-edit${subtask_id}`}>
        <div className="modal-box rounded-md dark:bg-zinc-800 p-0">
          <form
            onSubmit={(e) => {
              e.preventDefault()
              handleEdit(e, subtask_id, editName, editTaskId)
            }}
          >
            <div className="flex items-center border-b border-gray-200 p-4">
              <h3 className="font-regular flex truncate text-start text-2xl text-gray-600 dark:text-gray-400">
                แก้ไขภาระงานย่อย&nbsp;
                <span className="truncate font-semibold text-business1 dark:text-blue-500/80">
                  {subtask_name}
                </span>
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
                  mainTasks={mainTasks}
                />
              </div>
              <div className="w-full">
                <label className="font-regular mb-2 block text-sm text-gray-600 dark:text-gray-400">
                  ชื่อภาระงานย่อย
                </label>
                <input
                  name="subtask_name"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  type="text"
                  className="w-full rounded-md border border-gray-300 px-4 py-2 text-sm font-light text-gray-600 transition-all duration-300 ease-in-out focus:border-blue-500 focus:outline-none dark:border-zinc-600 dark:bg-zinc-800 dark:text-gray-400"
                  placeholder="กรุณากรอกชื่อภาระงานย่อย"
                />
              </div>
            </div>
            <div className="flex justify-end gap-4 border-t border-gray-200 p-4">
              <label
                htmlFor={`modal-edit`}
                className="text-md h-10 flex w-20 cursor-pointer items-center justify-center rounded-md border-2 border-gray-200 bg-gray-200 px-4 py-2 text-gray-600 transition duration-300 ease-in-out hover:border-gray-300 hover:bg-gray-300 dark:border-zinc-700 dark:bg-zinc-700 dark:text-gray-400 dark:hover:border-zinc-600 dark:hover:bg-zinc-600"
              >
                ยกเลิก
              </label>
              <button
                type="submit"
                className="text-md h-10 flex w-20 items-center justify-center text-nowrap rounded-md bg-success px-4 py-2 text-white transition duration-300 ease-in-out hover:bg-success hover:bg-success/80 hover:text-white"
              >
                บันทึก
              </button>
            </div>
          </form>
        </div>
        <label className="modal-backdrop" htmlFor={`modal-edit`}>
          Close
        </label>
      </div>
    </div>
  )
}
