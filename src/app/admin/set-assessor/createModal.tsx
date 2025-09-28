'use client'

import type React from 'react'
import { CalendarClock } from 'lucide-react'

interface FormDataRoundList {
  round_list_name: string
  round_list_id: number
  date_start: string
  date_end: string
  year?: string
  round: number
}

interface CreateModalProps {
  isLoading: boolean
  handleSubmit: (e: React.FormEvent<HTMLFormElement> | React.MouseEvent) => void
  formData: FormDataRoundList
  handleInputChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => void
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
              <form onSubmit={(e) => handleSubmit(e)}>
                <div className="flex items-center border-b border-gray-200 p-4">
                  <h3 className="font-regular flex truncate text-start text-2xl text-gray-600 dark:text-gray-400">
                    เพิ่มรอบการประเมิน&nbsp;
                  </h3>
                </div>
                <div className="p-4">
                  <div className="flex-col justify-between space-y-4">
                  <div className="flex w-full items-center justify-between gap-4">
                    <div className="w-full">
                      <label className="font-regular mb-2 block text-sm text-gray-600 dark:text-gray-400">
                        รอบการประเมิน
                      </label>
                      <select
                        name="round"
                        value={formData.round === 0 ? '' : formData.round}
                        onChange={handleInputChange}
                        className="w-full rounded-md border-2 border-gray-300 px-4 py-2 text-sm font-light text-gray-600 transition-colors duration-300 ease-in-out focus:border-blue-500 focus:outline-none dark:border-zinc-600 dark:bg-zinc-800 dark:text-gray-400"
                        required
                      >
                        <option value="" disabled>
                          {' '}
                          เลือกรอบการประเมิน
                        </option>
                        <option value="1">1</option>
                        <option value="2">2</option>
                      </select>
                    </div>
                    <div className="w-full">
                      <label className="font-regular mb-2 block text-sm text-gray-600 dark:text-gray-400">
                        ปีการประเมิน
                      </label>
                      <input
                        name="year"
                        value={formData.year}
                        onChange={handleInputChange}
                        type="number"
                        placeholder="ป้อนปีการประเมิน"
                        className="h-full w-full rounded-md border-2 border-gray-300 px-4 py-2 text-sm font-light text-gray-600 transition-colors duration-300 ease-in-out focus:border-blue-500 focus:outline-none dark:border-zinc-600 dark:bg-zinc-800 dark:text-gray-400"
                        required
                      />
                    </div>
                  </div>
                  <div className="w-full">
                    <label className="font-regular mb-2 block text-sm text-gray-600 dark:text-gray-400">
                      วันที่เริ่มต้น
                    </label>
                    <input
                      name="date_start"
                      value={formData.date_start}
                      onChange={handleInputChange}
                      type="date"
                      className="w-full rounded-md border-2 border-gray-300 px-4 py-2 text-sm font-light text-gray-600 transition-colors duration-300 ease-in-out focus:border-blue-500 focus:outline-none dark:border-zinc-600 dark:bg-zinc-800 dark:text-gray-400"
                      required
                    />
                  </div>
                  <div className="w-full">
                    <label className="font-regular mb-2 block text-sm text-gray-600 dark:text-gray-400">
                      วันที่สิ้นสุด
                    </label>
                    <input
                      name="date_end"
                      value={formData.date_end}
                      onChange={handleInputChange}
                      type="date"
                      className="w-full rounded-md border-2 border-gray-300 px-4 py-2 text-sm font-light text-gray-600 transition-colors duration-300 ease-in-out focus:border-blue-500 focus:outline-none dark:border-zinc-600 dark:bg-zinc-800 dark:text-gray-400"
                      required
                    />
                  </div>
                  </div>
                </div>
                <div className="flex justify-end gap-4 border-t border-gray-200 p-4">
                <label
                    htmlFor={`modal-create`}
                    className="text-md z-50 flex w-20 cursor-pointer items-center justify-center rounded-md border-2 border-gray-200 bg-gray-200 px-4 py-2 text-gray-600 transition duration-300 ease-in-out hover:border-gray-300 hover:bg-gray-300 dark:border-zinc-700 dark:bg-zinc-700 dark:text-gray-400 dark:hover:border-zinc-600 dark:hover:bg-zinc-600"
                  >
                    ยกเลิก
                  </label>
                  <button
                    type="submit"
                    className="text-md flex w-20 items-center justify-center rounded-md bg-success px-4 py-2 text-white transition duration-300 ease-in-out hover:bg-success hover:bg-success/80 hover:text-white"
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
