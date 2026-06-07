'use client'

import type { RoundList } from '@/Types/setAssessor'

interface DeleteRoundModalProps {
  round: RoundList | null
  onConfirm: (roundListId: number, roundName: string) => void
}

export default function DeleteRoundModal({
  round,
  onConfirm,
}: DeleteRoundModalProps) {
  const closeModal = () => {
    const el = document.getElementById(
      'modal-delete'
    ) as HTMLInputElement | null
    if (el) el.checked = false
  }

  const handleConfirm = (e: React.MouseEvent) => {
    e.preventDefault()
    if (!round) return
    onConfirm(round.round_list_id, round.round_list_name)
    closeModal()
  }

  return (
    <div className="relative z-[100]">
      <input type="checkbox" id="modal-delete" className="modal-toggle" />
      <div className="modal" role="dialog">
        <div className="modal-box rounded-md p-0 dark:bg-zinc-800">
          <div className="flex items-center border-b border-gray-200 p-4">
            <h3 className="font-regular flex truncate text-start text-2xl text-gray-600 dark:text-gray-400">
              ลบรอบการประเมิน&nbsp;
              <span className="truncate font-semibold text-business1 dark:text-blue-500/80">
                {round?.round_list_name}
              </span>
            </h3>
          </div>
          <div className="p-4">
            <p className="font-regular text-wrap py-8 text-start text-lg text-gray-500">
              เมื่อยืนยันการลบข้อมูลนี้ ข้อมูลจะไม่สามารถกลับมาแก้ไขได้
              คุณแน่ใจหรือไม่?
            </p>
          </div>
          <div className="flex justify-end gap-4 border-t border-gray-200 p-4">
            <label
              htmlFor="modal-delete"
              className="text-md z-50 flex h-10 w-20 cursor-pointer items-center justify-center rounded-md border-2 border-gray-200 bg-gray-200 px-4 py-2 text-gray-600 transition duration-300 ease-in-out hover:border-gray-300 hover:bg-gray-300 dark:border-zinc-700 dark:bg-zinc-700 dark:text-gray-400 dark:hover:border-zinc-600 dark:hover:bg-zinc-600"
            >
              ยกเลิก
            </label>
            <button
              onClick={handleConfirm}
              className="text-md flex h-10 w-20 items-center justify-center text-nowrap rounded-md bg-red-500 px-4 text-white transition duration-300 ease-in-out hover:bg-red-500/80"
            >
              ยืนยัน
            </button>
          </div>
        </div>
        <label className="modal-backdrop" htmlFor="modal-delete">
          Close
        </label>
      </div>
    </div>
  )
}
