'use client'

import type { WorkloadGroup } from '@/Types'
import { CalendarClock } from 'lucide-react'

interface ConfirmSubmitFormModalProps {
  handleSelectWorkloadGroup: (workload_group: WorkloadGroup) => void
  workload_group: WorkloadGroup | null
  onClose?: () => void
  isOpen: boolean
}

export default function ConfirmSubmitFormModal({
  handleSelectWorkloadGroup,
  workload_group,
  onClose,
  isOpen,
}: ConfirmSubmitFormModalProps) {
  console.log('ConfirmSubmitFormModal render:', { isOpen, workload_group })

  if (!isOpen) return null

  return (
    <div className="relative z-[100]">
      <input type="checkbox" id={`confirm-modal`} className="modal-toggle" checked={isOpen} readOnly />
      <div className="modal" role="dialog" aria-labelledby="modal-title">
        <div className="modal-box rounded-md dark:bg-zinc-800 p-0">
          <div className="flex items-center">
            <h3 className="font-regular w-full flex border-b border-gray-200 p-4 truncate text-start text-2xl text-gray-600 dark:text-gray-400">
              ส่งฟอร์มการประเมินภาระงาน
            </h3>
          </div>
          <p className="font-light text-wrap p-4 text-start text-lg text-gray-500">
            เมื่อกดยืนยัน ระบบจะส่งข้อมูลฟอร์มการประเมินภาระงานนี้ ในรอบนี้ ผู้ประเมินจะไม่สามารถกลับมาแก้ไขได้
            คุณแน่ใจหรือไม่?
          </p>
          <div className="flex justify-end gap-4 border-t border-gray-200 p-4">
            <button
              onClick={() => {
                if (onClose) {
                  onClose()
                }
              }}
              className="text-md z-50 flex h-10 w-20 cursor-pointer items-center justify-center rounded-md border border-gray-200 bg-gray-200 px-4 py-2 text-gray-600 transition duration-300 ease-in-out hover:border-gray-300 hover:bg-gray-300 dark:border-zinc-700 dark:bg-zinc-700 dark:text-gray-400 dark:hover:border-zinc-600 dark:hover:bg-zinc-600"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              onClick={() => {
                if (workload_group) {
                  handleSelectWorkloadGroup(workload_group)
                }
                if (onClose) {
                  onClose()
                }
              }}
              className="text-md flex h-10 w-20 items-center justify-center rounded-md bg-success px-4 py-2 text-white transition duration-300 ease-in-out hover:bg-success/80"
            >
              ยืนยัน
            </button>

          </div>
        </div>
        <label
          className="modal-backdrop"
          htmlFor="confirm-modal"
          onClick={() => {
            if (onClose) {
              onClose()
            }
          }}
        >
          Close
        </label>
      </div>
    </div>
  )
}
