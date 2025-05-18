import { CircleHelp } from "lucide-react"
import type React from "react"

interface DeleteModalProps {
  isLoading: boolean
  prefix_id: number
  prefix_name: string
  handleDelete: (
    e: React.FormEvent<HTMLFormElement> | React.MouseEvent,
    prefix_id: number,
    prefix_name: string
  ) => void
}

export default function DeleteModal({
  isLoading,
  prefix_id,
  prefix_name,
  handleDelete,
}: DeleteModalProps) {
  if (isLoading) return null
  return (
    <div className="relative z-[100]">
      <input type="checkbox" id={`modal-delete${prefix_id}`} className="modal-toggle" />
      <div className="modal" role={`modal-delete${prefix_id}`}>
        <div className="modal-box rounded-md dark:bg-zinc-800">
          <form
            onSubmit={(e) => {
              e.preventDefault()
              handleDelete(e, prefix_id, prefix_name)
            }}
          >

            <div className="flex items-center">
              <CircleHelp className="text-business1 dark:text-blue-500/80 mr-2 w-7 h-7" />
              <h3 className="flex text-2xl font-regular truncate text-start text-gray-600 dark:text-gray-400">
                ลบคำนำหน้า&nbsp;
                <span className="font-semibold text-business1 truncate dark:text-blue-500/80">
                  {prefix_name}
                </span>
              </h3>
            </div>
            <p className="py-8 text-wrap text-gray-500 text-start text-lg font-regular">
              เมื่อยืนยันการลบข้อมูลนี้ ข้อมูลจะไม่สามารถกลับมาแก้ไขได้ คุณแน่ใจหรือไม่?
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={(e) => handleDelete(e, prefix_id, prefix_name)}
               className="w-20 bg-red-500 flex items-center justify-center text-md text-white rounded-md py-2 px-4 hover:bg-red-500/80 transition ease-in-out duration-300 text-nowrap"
              >
                ยืนยัน
              </button>
              <label
                htmlFor={`modal-delete${prefix_id}`}
                className="z-50 w-20 border border-2 border-gray-200 flex items-center justify-center bg-gray-200 text-md text-gray-600 rounded-md py-2 px-4 hover:bg-gray-300 hover:border-gray-300 dark:bg-zinc-700 dark:text-gray-400 dark:hover:bg-zinc-600 dark:hover:border-zinc-600 dark:border-zinc-700 transition ease-in-out duration-300 cursor-pointer"
              >
                ยกเลิก
              </label>

            </div>

          </form>
        </div>
        <label className="modal-backdrop" htmlFor={`modal-delete${prefix_id}`}>
          Close
        </label>
      </div>
    </div>

  )
}
