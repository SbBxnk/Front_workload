import type React from 'react'

interface DeleteModalProps {
  isLoading: boolean
  quantity_workload_id: number
  quantity_workload_hours: number
  handleDelete: (
    e: React.FormEvent<HTMLFormElement> | React.MouseEvent,
    quantity_workload_id: number,
    quantity_workload_hours: number
  ) => void
}

export default function DeleteModal({
  isLoading,
  quantity_workload_id,
  quantity_workload_hours,
  handleDelete,
}: DeleteModalProps) {
  return (
    <>
      {isLoading ? null : (
        <div className="relative z-[100]">
          <input type="checkbox" id={`modal-delete`} className="modal-toggle" />
          <div className="modal" role={`modal-delete`}>
            <div className="modal-box rounded-md dark:bg-zinc-800 p-0">
              <form onSubmit={(e) => handleDelete(e, quantity_workload_id, quantity_workload_hours)}>
                <div className="flex items-center border-b border-gray-200 p-4">
                  <h3 className="font-regular flex truncate text-start text-2xl text-gray-600 dark:text-gray-400">
                    ลบปริมาณงาน&nbsp;
                  </h3>
                </div>
                <div className="p-4">
                  <p className="font-regular text-sm text-gray-600 dark:text-gray-400">
                    คุณต้องการลบปริมาณงาน <span className="font-semibold">{quantity_workload_hours} ชั่วโมง</span> หรือไม่?
                  </p>
                  <p className="font-regular text-xs text-red-500 mt-2">
                    การดำเนินการนี้ไม่สามารถยกเลิกได้
                  </p>
                </div>
                <div className="flex justify-end gap-4 border-t border-gray-200 p-4">
                  <label
                    htmlFor={`modal-delete`}
                    className="text-md flex h-10 w-20 cursor-pointer items-center justify-center rounded-md border-2 border-gray-200 bg-gray-200 px-4 font-light text-gray-600 transition duration-300 ease-in-out hover:border-gray-300 hover:bg-gray-300 dark:border-zinc-700 dark:bg-zinc-700 dark:text-gray-400 dark:hover:border-zinc-600 dark:hover:bg-zinc-600"
                  >
                    ยกเลิก
                  </label>
                  <button
                    type="submit"
                    className="text-md flex h-10 w-20 items-center justify-center rounded-md bg-red-500 px-4 font-light text-white transition duration-300 ease-in-out hover:bg-red-600"
                  >
                    ลบ
                  </button>
                </div>
              </form>
            </div>
            <label className="modal-backdrop" htmlFor={`modal-delete`}>
              Close
            </label>
          </div>
        </div>
      )}
    </>
  )
}
