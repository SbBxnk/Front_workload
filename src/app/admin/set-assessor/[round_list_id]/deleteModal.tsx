import { CalendarClock } from 'lucide-react'
import type React from 'react'

interface DeleteModalProps {
  isLoading: boolean
  set_asses_list_id: number
  u_fname: string
  u_lname: string
  prefix_name: string
  handleDelete: (
    e: React.FormEvent<HTMLFormElement> | React.MouseEvent,
    set_asses_list_id: number
  ) => void
}

export default function DeleteModal({
  isLoading,
  set_asses_list_id,
  u_fname,
  u_lname,
  prefix_name,
  handleDelete,
}: DeleteModalProps) {
  if (isLoading) return null
  return (
    <div className="relative z-[100]">
      <input
        type="checkbox"
        id={`modal-delete${set_asses_list_id}`}
        className="modal-toggle"
      />
      <div className="modal" role={`modal-delete${set_asses_list_id}`}>
        <div className="modal-box rounded-md dark:bg-zinc-800">
          <form
            onSubmit={(e) => {
              e.preventDefault()
              handleDelete(e, set_asses_list_id)
            }}
          >
            <div className="flex items-center">
              <CalendarClock className="mr-2 h-7 w-7 text-business1 dark:text-blue-500/80" />
              <h3 className="font-regular flex truncate text-start text-2xl text-gray-600 dark:text-gray-400">
                ลบผู้ประเมิน&nbsp;
                <span className="truncate font-semibold text-business1 dark:text-blue-500/80">
                  {prefix_name}
                  {u_fname} {u_lname}
                </span>
              </h3>
            </div>
            <p className="font-regular text-wrap py-8 text-start text-lg text-gray-500">
              เมื่อยืนยันการลบข้อมูลนี้ ข้อมูลจะไม่สามารถกลับมาแก้ไขได้
              คุณแน่ใจหรือไม่?
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={(e) => handleDelete(e, set_asses_list_id)}
                className="text-md flex w-20 items-center justify-center rounded-md border border-2 border-red-500 bg-transparent px-4 py-2 text-red-500 transition duration-300 ease-in-out hover:border-red-500 hover:bg-red-500 hover:text-white"
              >
                ยืนยัน
              </button>
              <label
                htmlFor={`modal-delete${set_asses_list_id}`}
                className="text-md z-50 flex w-20 cursor-pointer items-center justify-center rounded-md border border-2 border-gray-200 bg-gray-200 px-4 py-2 text-gray-600 transition duration-300 ease-in-out hover:border-gray-300 hover:bg-gray-300 dark:border-zinc-700 dark:bg-zinc-700 dark:text-gray-400 dark:hover:border-zinc-600 dark:hover:bg-zinc-600"
              >
                ยกเลิก
              </label>
            </div>
          </form>
        </div>
        <label
          className="modal-backdrop"
          htmlFor={`modal-delete${set_asses_list_id}`}
        >
          Close
        </label>
      </div>
    </div>
  )
}
