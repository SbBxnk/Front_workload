import { CalendarClock} from "lucide-react"
import type React from "react"

interface DeleteModalProps {
  isLoading: boolean
  set_asses_info_id: number
  handleDelete: (
    e: React.FormEvent<HTMLFormElement> | React.MouseEvent,
    set_asses_info_id: number,
  ) => void
}

export default function DeleteModal({
  isLoading,
  set_asses_info_id,
  handleDelete,
}: DeleteModalProps) {
  if (isLoading) return null
  return (
    <div className="relative z-[100]">
      <input type="checkbox" id={`modal-delete${set_asses_info_id}`} className="modal-toggle" />
      <div className="modal" role={`modal-delete${set_asses_info_id}`}>
        <div className="modal-box rounded-md dark:bg-zinc-800">
          <form
            onSubmit={(e) => {
              e.preventDefault()
              handleDelete(e, set_asses_info_id)
            }}
          >

            <div className="flex items-center">
              <CalendarClock className="text-business1 dark:text-blue-500/80 mr-2 w-7 h-7" />
              <h3 className="flex text-2xl font-regular truncate text-start text-gray-600 dark:text-gray-400">
                ลบ&nbsp;
                <span className="font-semibold text-business1 truncate dark:text-blue-500/80">
                  ผู้ตรวจประเมิน{set_asses_info_id}
                </span>
              </h3>
            </div>
            <p className="py-8 text-wrap text-gray-500 text-start text-lg font-regular">
              เมื่อยืนยันการลบข้อมูลนี้ ข้อมูลจะไม่สามารถกลับมาแก้ไขได้ คุณแน่ใจหรือไม่?
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={(e) => {handleDelete(e, set_asses_info_id)
                 
                }
                  
                }
                className="w-20 border border-2 border-red-500 flex items-center justify-center bg-transparent text-md text-red-500 rounded-md py-2 px-4 hover:bg-red-500 hover:text-white hover:border-red-500 transition ease-in-out duration-300"
              >
                ยืนยัน
              </button>
              <label
                htmlFor={`modal-delete${set_asses_info_id}`}
                className="z-50 w-20 border border-2 border-gray-200 flex items-center justify-center bg-gray-200 text-md text-gray-600 rounded-md py-2 px-4 hover:bg-gray-300 hover:border-gray-300 dark:bg-zinc-700 dark:text-gray-400 dark:hover:bg-zinc-600 dark:hover:border-zinc-600 dark:border-zinc-700 transition ease-in-out duration-300 cursor-pointer"
              >
                ยกเลิก
              </label>

            </div>

          </form>
        </div>
        <label className="modal-backdrop" htmlFor={`modal-delete${set_asses_info_id}`}>
          Close
        </label>
      </div>
    </div>

  )
}
