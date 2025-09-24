import { CircleHelp } from 'lucide-react'
import { useState, useEffect } from 'react'
import type React from 'react'

interface EditModalProps {
  isLoading: boolean
  position_id: number
  position_name: string
  handleEdit: (
    e: React.FormEvent<HTMLFormElement> | React.MouseEvent,
    position_id: number,
    updatedPrefixName: string
  ) => void
}

export default function EditModal({
  isLoading,
  position_id,
  position_name,
  handleEdit,
}: EditModalProps) {
  const [editedPosition, setEditedPosition] = useState(position_name)
  useEffect(() => {
    setEditedPosition(position_name)
  }, [position_name])

  if (isLoading) return null

  return (
    <div className="relative z-[100]">
      <input
        type="checkbox"
        id="modal-edit"
        className="modal-toggle"
      />
      <div className="modal" role="modal-edit">
        <div className="modal-box rounded-md dark:bg-zinc-800 p-0">
          <form
            onSubmit={(e) => {
              e.preventDefault()
              handleEdit(e, position_id, editedPosition)
            }}
          >
            <div className="flex items-center border-b border-gray-200 p-4">
              <h3 className="font-regular flex truncate text-start text-2xl text-gray-600 dark:text-gray-400">
                แก้ไขตำแหน่งวิชาการ&nbsp;
                <span className="truncate font-semibold text-business1 dark:text-blue-500/80">
                  {position_name}
                </span>
              </h3>
            </div>
            <div className="p-4">
              <label className="font-regular mb-2 block text-sm text-gray-600 dark:text-gray-400">
                ตำแหน่งวิชาการ
              </label>
              <input
                name="position_name"
                value={editedPosition}
                onChange={(e) => setEditedPosition(e.target.value)}
                type="text"
                className="w-full rounded-md border border-gray-300 px-4 py-2 text-sm font-light text-gray-600 transition-all duration-300 ease-in-out focus:border-blue-500 focus:outline-none dark:border-zinc-600 dark:bg-zinc-800 dark:text-gray-400"
                placeholder="กรุณากรอกตำแหน่งวิชาการ"
              />
            </div>
            <div className="flex justify-end gap-4 border-t border-gray-200 p-4">
              <label
                htmlFor="modal-edit"
                className="text-md z-50 flex h-10 w-20 cursor-pointer items-center justify-center rounded-md border-2 border-gray-200 bg-gray-200 px-4 text-gray-600 transition duration-300 ease-in-out hover:border-gray-300 hover:bg-gray-300 dark:border-zinc-700 dark:bg-zinc-700 dark:text-gray-400 dark:hover:border-zinc-600 dark:hover:bg-zinc-600"
              >
                ยกเลิก
              </label>
              <button
                type="submit"
                className="text-md flex h-10 w-20 items-center justify-center text-nowrap rounded-md bg-success px-4 text-white transition duration-300 ease-in-out hover:bg-success/80"
              >
                บันทึก
              </button>
            </div>
          </form>
        </div>
        <label className="modal-backdrop" htmlFor="modal-edit">
          Close
        </label>
      </div>
    </div>
  )
}
