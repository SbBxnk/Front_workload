'use client'
import type React from 'react'

interface FormDataMainTask {
  task_name: string
}

interface CreateModalProps {
  isLoading: boolean
  handleSubmit: (
    e: React.FormEvent<HTMLFormElement> | React.MouseEvent,
    task_name: string
  ) => void
  formData: FormDataMainTask
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}

export default function CreateModal({
  isLoading,
  handleSubmit,
  formData,
  handleInputChange,
}: CreateModalProps) {
  return (
    <>
      {isLoading ? null : (
        <div className="relative z-[100]">
          <input type="checkbox" id={`modal-create`} className="modal-toggle" />
          <div className="modal" role={`modal-create`}>
            <div className="modal-box rounded-md dark:bg-zinc-800 p-0">
              <form onSubmit={(e) => handleSubmit(e, formData.task_name)}>
                <div className="flex items-center border-b border-gray-200 p-4">
                  <h3 className="font-regular flex truncate text-start text-2xl text-gray-600 dark:text-gray-400">
                    เพิ่มภาระงานหลัก&nbsp;
                  </h3>
                </div>
                <div className="p-4">
                  <label className="font-regular mb-2 block text-sm text-gray-600 dark:text-gray-400">
                    ชื่อภาระงานหลัก
                  </label>
                  <input
                    name="task_name"
                    value={formData.task_name}
                    onChange={handleInputChange}
                    type="text"
                    className="w-full rounded-md border border-gray-300 px-4 py-2 text-sm font-light text-gray-600 "
                    placeholder="กรุณากรอกชื่อภาระงานหลัก"
                  />
                </div>
                <div className="flex justify-end gap-4 border-t border-gray-200 p-4">
                  <label
                    htmlFor={`modal-create`}
                    className="text-md flex h-10 w-20 cursor-pointer items-center justify-center rounded-md border-2 border-gray-200 bg-gray-200 px-4 font-light text-gray-600 "
                  >
                    ยกเลิก
                  </label>
                  <button
                    type="submit"
                    className="text-md flex h-10 w-20 items-center justify-center rounded-md bg-success px-4 font-light text-white "
                  >
                    ยืนยัน
                  </button>
                </div>
              </form>
            </div>
            <label className="modal-backdrop" htmlFor={`modal-create`}>
              Close
            </label>
          </div>
        </div>
      )}
    </>
  )
}
