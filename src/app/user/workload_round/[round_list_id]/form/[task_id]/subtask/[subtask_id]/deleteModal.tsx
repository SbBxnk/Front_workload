'use client'

import { CalendarClock } from 'lucide-react'

interface ConfirmDeleteModalProps {
  comfirmDelete: (form_id: number) => void
  form_id: number
}

export default function ConfirmModal({
  comfirmDelete,
  form_id,
}: ConfirmDeleteModalProps) {
  return (
    <div className="relative z-[100]">
      <input
        type="checkbox"
        id={`confirm-modal-${form_id}`}
        className="modal-toggle"
      />
      <div className="modal" role="dialog" aria-labelledby="modal-title">
        <div className="modal-box rounded-md dark:bg-zinc-800">
          <div className="flex items-center">
            <CalendarClock className="mr-2 h-7 w-7 text-business1 dark:text-blue-500/80" />
            <h3 className="font-regular flex truncate text-start text-2xl text-gray-600 dark:text-gray-400">
              คุณต้องการลบรายการนี้&nbsp;
              <span className="truncate font-semibold text-business1 dark:text-blue-500/80">
                #{form_id}
              </span>
            </h3>
          </div>
          <p className="font-regular text-wrap py-8 text-start text-lg text-gray-500">
            เมื่อกดยืนยันการเลือกกลุ่มภาระงานนี้ ข้อมูลจะไม่สามารถกลับมาแก้ไขได้
            คุณแน่ใจหรือไม่?
          </p>
          <div className="mt-6 flex justify-end gap-4">
            <button
              type="submit"
              onClick={() => comfirmDelete(form_id)}
              className="text-md flex w-20 items-center justify-center rounded-md bg-success px-4 py-2 text-white transition duration-300 ease-in-out hover:bg-success/80"
            >
              ยืนยัน
            </button>
            <label
              htmlFor={`confirm-modal-${form_id}`}
              className="text-md z-50 flex w-20 cursor-pointer items-center justify-center rounded-md border border-gray-200 bg-gray-200 px-4 py-2 text-gray-600 transition duration-300 ease-in-out hover:border-gray-300 hover:bg-gray-300 dark:border-zinc-700 dark:bg-zinc-700 dark:text-gray-400 dark:hover:border-zinc-600 dark:hover:bg-zinc-600"
            >
              ยกเลิก
            </label>
          </div>
        </div>
        <label className="modal-backdrop" htmlFor={`confirm-modal-${form_id}`}>
          Close
        </label>
      </div>
    </div>
  )
}
