import type React from 'react'
import { CircleHelp } from 'lucide-react'

interface FormDataExPosition {
  ex_position_name: string
}

interface CreateModalProps {
  isLoading: boolean
  handleSubmit: (
    e: React.FormEvent<HTMLFormElement> | React.MouseEvent,
    ex_position_name: string
  ) => void
  formData: FormDataExPosition
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
              <form
                onSubmit={(e) => handleSubmit(e, formData.ex_position_name)}
              >
                <div className="flex items-center border-b border-gray-200 p-4">
                  <h3 className="font-regular flex truncate text-start text-2xl text-gray-600 dark:text-gray-400">
                    เพิ่มตำแหน่งบริหาร&nbsp;
                  </h3>
                </div>
                <div className="p-4">
                  <label className="font-regular mb-2 block text-sm text-gray-600 dark:text-gray-400">
                    ตำแหน่งบริหาร
                  </label>
                  <input
                    name="ex_position_name"
                    value={formData.ex_position_name}
                    onChange={handleInputChange}
                    type="text"
                    className="w-full rounded-md border border-gray-300 px-4 py-2 text-sm font-light text-gray-600 transition-all duration-300 ease-in-out focus:border-blue-500 focus:outline-none dark:border-zinc-600 dark:bg-zinc-800 dark:text-gray-400"
                    placeholder="กรุณากรอกตำแหน่งบริหาร"
                  />
                </div>
                <div className="flex justify-end gap-4 border-t border-gray-200 p-4">
                  <label
                    htmlFor={`modal-create`}
                    className="text-md z-50 flex h-10 w-20 cursor-pointer items-center justify-center rounded-md border-2 border-gray-200 bg-gray-200 px-4 text-gray-600 transition duration-300 ease-in-out hover:border-gray-300 hover:bg-gray-300 dark:border-zinc-700 dark:bg-zinc-700 dark:text-gray-400 dark:hover:border-zinc-600 dark:hover:bg-zinc-600"
                  >
                    ยกเลิก
                  </label>
                  <button
                    type="submit"
                    className="text-md flex h-10 w-20 items-center justify-center rounded-md bg-success px-4 text-white transition duration-300 ease-in-out hover:bg-success/80"
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
