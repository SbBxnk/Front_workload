import { CircleHelp } from 'lucide-react'
import type React from 'react'

interface DeleteModalProps {
  isLoading: boolean
  ex_position_id: number
  ex_position_name: string
  handleDelete: (
    e: React.FormEvent<HTMLFormElement> | React.MouseEvent,
    ex_position_id: number,
    ex_position_name: string
  ) => void
}

export default function DeleteModal({
  isLoading,
  ex_position_id,
  ex_position_name,
  handleDelete,
}: DeleteModalProps) {
  if (isLoading) return null
  return (
    <div className="relative z-[100]">
      <input
        type="checkbox"
        id={`modal-delete${ex_position_id}`}
        className="modal-toggle"
      />
      <div className="modal" role={`modal-delete${ex_position_id}`}>
        <div className="modal-box rounded-md dark:bg-zinc-800">
          <form
            onSubmit={(e) => {
              e.preventDefault()
              handleDelete(e, ex_position_id, ex_position_name)
            }}
          >
            <div className="flex items-center">
              <CircleHelp className="mr-2 h-7 w-7 text-business1 dark:text-blue-500/80" />
              <h3 className="font-regular flex truncate text-start text-2xl text-gray-600 dark:text-gray-400">
                ลบตำแหน่งบริหาร&nbsp;
                <span className="truncate font-semibold text-business1 dark:text-blue-500/80">
                  {ex_position_name}
                </span>
              </h3>
            </div>
            <p className="font-regular text-wrap py-8 text-start text-lg text-gray-500">
              เมื่อยืนยันการลบข้อมูลนี้ ข้อมูลจะไม่สามารถกลับมาแก้ไขได้
              คุณแน่ใจหรือไม่?
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={(e) =>
                  handleDelete(e, ex_position_id, ex_position_name)
                }
                className="text-md flex w-20 items-center justify-center text-nowrap rounded-md bg-red-500 px-4 py-2 text-white transition duration-300 ease-in-out hover:bg-red-500/80"
              >
                ยืนยัน
              </button>
              <label
                htmlFor={`modal-delete${ex_position_id}`}
                className="text-md z-50 flex w-20 cursor-pointer items-center justify-center rounded-md border border-2 border-gray-200 bg-gray-200 px-4 py-2 text-gray-600 transition duration-300 ease-in-out hover:border-gray-300 hover:bg-gray-300 dark:border-zinc-700 dark:bg-zinc-700 dark:text-gray-400 dark:hover:border-zinc-600 dark:hover:bg-zinc-600"
              >
                ยกเลิก
              </label>
            </div>
          </form>
        </div>
        <label
          className="modal-backdrop"
          htmlFor={`modal-delete${ex_position_id}`}
        >
          Close
        </label>
      </div>
    </div>
  )
}
