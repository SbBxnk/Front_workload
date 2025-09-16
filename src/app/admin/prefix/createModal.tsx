import type React from 'react'
import { CircleHelp } from 'lucide-react'

interface FormDataPrefix {
  prefix_name: string
}

interface CreateModalProps {
  isLoading: boolean
  handleSubmit: (
    e: React.FormEvent<HTMLFormElement> | React.MouseEvent,
    prefix_name: string
  ) => void
  formData: FormDataPrefix
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
            <div className="modal-box rounded-md dark:bg-zinc-800">
              <form onSubmit={(e) => handleSubmit(e, formData.prefix_name)}>
                <div className="flex items-center">
                  <CircleHelp className="mr-2 h-7 w-7 text-business1 dark:text-blue-500/80" />
                  <h3 className="font-regular flex truncate text-start text-2xl text-gray-600 dark:text-gray-400">
                    เพิ่มคำนำหน้า&nbsp;
                  </h3>
                </div>
                <div className="py-4">
                  <label className="font-regular mb-2 block text-sm text-gray-600 dark:text-gray-400">
                    คำนำหน้า
                  </label>
                  <input
                    name="prefix_name"
                    value={formData.prefix_name}
                    onChange={handleInputChange}
                    type="text"
                    className="w-full rounded-md border-2 border-gray-300 px-4 py-2 text-sm font-light text-gray-600 transition-all transition-colors duration-300 ease-in-out focus:border-blue-500 focus:outline-none dark:border-zinc-600 dark:bg-zinc-800 dark:text-gray-400"
                    placeholder="กรุณากรอกคำนำหน้า"
                  />
                </div>
                <div className="flex justify-end gap-4">
                  <button
                    type="submit"
                    className="text-md flex w-20 items-center justify-center rounded-md bg-success px-4 py-2 text-white transition duration-300 ease-in-out hover:bg-success hover:bg-success/80 hover:text-white"
                  >
                    ยืนยัน
                  </button>
                  <label
                    htmlFor={`modal-create`}
                    className="text-md z-50 flex w-20 cursor-pointer items-center justify-center rounded-md border border-2 border-gray-200 bg-gray-200 px-4 py-2 text-gray-600 transition duration-300 ease-in-out hover:border-gray-300 hover:bg-gray-300 dark:border-zinc-700 dark:bg-zinc-700 dark:text-gray-400 dark:hover:border-zinc-600 dark:hover:bg-zinc-600"
                  >
                    ยกเลิก
                  </label>
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
