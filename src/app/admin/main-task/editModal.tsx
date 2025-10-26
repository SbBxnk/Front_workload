'use client'
import { useState, useEffect } from 'react'
import type React from 'react'

interface EditModalProps {
  isLoading: boolean
  task_id: number
  task_name: string
  handleEdit: (
    e: React.FormEvent<HTMLFormElement> | React.MouseEvent,
    task_id: number,
    updatedTask: string
  ) => void
}

export default function EditModal({
  isLoading,
  task_id,
  task_name,
  handleEdit,
}: EditModalProps) {
  const [editTask, setEditTask] = useState(task_name)
  useEffect(() => {
    setEditTask(task_name)
  }, [task_name])

  if (isLoading) return null

  return (
    <div className="relative z-[100]">
      <input
        type="checkbox"
        id={`modal-edit`}
        className="modal-toggle"
      />
      <div className="modal" role={`modal-edit${task_id}`}>
        <div className="modal-box rounded-md dark:bg-zinc-800 p-0">
          <form
            onSubmit={(e) => {
              e.preventDefault()
              handleEdit(e, task_id, editTask)
            }}
          >
            <div className="flex items-center border-b border-gray-200 p-4">
              <h3 className="font-regular flex truncate text-start text-2xl text-gray-600 dark:text-gray-400">
                แก้ไขภาระงานหลัก&nbsp;
                <span className="truncate font-semibold text-business1 dark:text-blue-500/80">
                  {task_name}
                </span>
              </h3>
            </div>
            <div className="p-4">
              <label className="font-regular mb-2 block text-sm text-gray-600 dark:text-gray-400">
                ชื่อภาระงานหลัก
              </label>
              <input
                name="task_name"
                value={editTask}
                onChange={(e) => setEditTask(e.target.value)}
                type="text"
                className="w-full rounded-md border border-gray-300 px-4 py-2 text-sm font-light text-gray-600 "
                placeholder="กรุณากรอกชื่อภาระงานหลัก"
              />
            </div>
            <div className="flex justify-end gap-4 border-t border-gray-200 p-4">
              <label
                htmlFor={`modal-edit`}
                className="text-md z-50 flex h-10 w-20 cursor-pointer items-center justify-center rounded-md border-2 border-gray-200 bg-gray-200 px-4 text-gray-600 "
              >
                ยกเลิก
              </label>
              <button
                type="submit"
                className="text-md flex h-10 w-20 items-center justify-center text-nowrap rounded-md bg-success px-4 text-white "
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