"use client"

import { CalendarClock } from 'lucide-react'

interface ConfirmDeleteModalProps {
  comfirmDelete: (form_id: number) => void
  form_id: number
}

export default function ConfirmModal({ comfirmDelete, form_id }: ConfirmDeleteModalProps) {
  return (
    <div className="relative z-[100]">
      <input type="checkbox" id={`confirm-modal-${form_id}`} className="modal-toggle" />
      <div className="modal" role="dialog" aria-labelledby="modal-title">
        <div className="modal-box rounded-md dark:bg-zinc-800">
          <div className="flex items-center">
            <CalendarClock className="text-business1 dark:text-blue-500/80 mr-2 w-7 h-7" />
            <h3 className="flex text-2xl font-regular truncate text-start text-gray-600 dark:text-gray-400">
              คุณต้องการลบรายการนี้&nbsp;
              <span className="font-semibold text-business1 truncate dark:text-blue-500/80">
                #{form_id}
              </span>
            </h3>
          </div>
          <p className="py-8 text-wrap text-gray-500 text-start text-lg font-regular">
            เมื่อกดยืนยันการเลือกกลุ่มภาระงานนี้ ข้อมูลจะไม่สามารถกลับมาแก้ไขได้ คุณแน่ใจหรือไม่?
          </p>
          <div className="flex justify-end gap-4 mt-6">
            <button
              type="submit"
              onClick={() => comfirmDelete(form_id)}
              className="w-20 bg-success flex items-center justify-center text-md text-white rounded-md py-2 px-4 hover:bg-success/80 transition ease-in-out duration-300"
            >
              ยืนยัน
            </button>
            <label
              htmlFor={`confirm-modal-${form_id}`}
              className="z-50 w-20 border border-2 border-gray-200 flex items-center justify-center bg-gray-200 text-md text-gray-600 rounded-md py-2 px-4 hover:bg-gray-300 hover:border-gray-300 dark:bg-zinc-700 dark:text-gray-400 dark:hover:bg-zinc-600 dark:hover:border-zinc-600 dark:border-zinc-700 transition ease-in-out duration-300 cursor-pointer"
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
  );
}
