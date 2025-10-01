import type React from 'react'

interface DeleteModalProps {
  isLoading: boolean
  branch_id: number
  branch_name: string
  handleDelete: (
    e: React.FormEvent<HTMLFormElement> | React.MouseEvent,
    branch_id: number,
    branch_name: string
  ) => void
}

export default function DeleteModal({
  isLoading,
  branch_id,
  branch_name,
  handleDelete,
}: DeleteModalProps) {
  if (isLoading) return null
  return (
    <div className="relative z-[100]">
      <input
        type="checkbox"
        id={`modal-delete`}
        className="modal-toggle"
      />
      <div className="modal" role={`modal-delete${branch_id}`}>
        <div className="modal-box rounded-md dark:bg-zinc-800 p-0">
          <form
            onSubmit={(e) => {
              e.preventDefault()
              handleDelete(e, branch_id, branch_name)
            }}
          >
            <div className="flex items-center border-b border-gray-200 p-4">
              <h3 className="font-regular flex truncate text-start text-2xl text-gray-600 dark:text-gray-400">
                ลบสาขา&nbsp;
                <span className="truncate font-semibold text-business1 dark:text-blue-500/80">
                  {branch_name}
                </span>
              </h3>
            </div>
            <p className="font-regular text-wrap p-4 text-start text-lg text-gray-500">
              เมื่อยืนยันการลบข้อมูลนี้ ข้อมูลจะไม่สามารถกลับมาแก้ไขได้
              คุณแน่ใจหรือไม่?
            </p>
            <div className="flex justify-end gap-4 border-t border-gray-200 p-4">
              <label
                htmlFor={`modal-delete`}
                className="text-md z-50 flex h-10 w-20 cursor-pointer items-center justify-center rounded-md border-2 border-gray-200 bg-gray-200 px-4 text-gray-600 transition duration-300 ease-in-out hover:border-gray-300 hover:bg-gray-300 dark:border-zinc-700 dark:bg-zinc-700 dark:text-gray-400 dark:hover:border-zinc-600 dark:hover:bg-zinc-600"
              >
                ยกเลิก
              </label>
              <button
                onClick={(e) => handleDelete(e, branch_id, branch_name)}
                className="text-md flex h-10 w-20 items-center justify-center text-nowrap rounded-md bg-red-500 px-4 text-white transition duration-300 ease-in-out hover:bg-red-500/80"
              >
                ยืนยัน
              </button>
            </div>
          </form>
        </div>
        <label className="modal-backdrop" htmlFor={`modal-delete`}>
          Close
        </label>
      </div>
    </div>
  )
}
