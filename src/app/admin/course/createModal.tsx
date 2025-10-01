import type React from 'react'
import SelectBranch from './courseComponents/SelectBranch'
import { useEffect, useRef, useState } from 'react'

interface FormDataCourse {
  course_name: string
  branch_id: number
}

interface CreateModalProps {
  isLoading: boolean
  handleSubmit: (
    e: React.FormEvent<HTMLFormElement> | React.MouseEvent,
    course_name: string,
    branch_id: number
  ) => void
  formData: FormDataCourse
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  handleBranchChange: (branch_id: number) => void
  setFormData: React.Dispatch<React.SetStateAction<FormDataCourse>>
}

export default function CreateModal({
  isLoading,
  handleSubmit,
  formData,
  handleInputChange,
  setFormData,
}: CreateModalProps) {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const branchDropdownRef = useRef<HTMLDivElement>(null)
  const [selectBranch, setSelectedBranch] = useState<string | null>(null)
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        branchDropdownRef.current &&
        !branchDropdownRef.current.contains(event.target as Node)
      ) {
        setOpenDropdown(null)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handleOnChangeBranch = (branch_id: number) => {
    setFormData((prevData: FormDataCourse) => ({
      ...prevData,
      branch_id: branch_id,
    }))
  }

  return (
    <>
      {isLoading ? null : (
        <div className="relative z-[100]">
          <input type="checkbox" id={`modal-create`} className="modal-toggle" />
          <div className="modal" role={`modal-create`}>
            <div className="no-scrollbar modal-box rounded-md dark:bg-zinc-800 p-0">
              <form
                onSubmit={(e) =>
                  handleSubmit(e, formData.course_name, formData.branch_id)
                }
              >
                <div className="flex items-center border-b border-gray-200 p-4">
                  <h3 className="font-regular flex truncate text-start text-2xl text-gray-600 dark:text-gray-400">
                    เพิ่มหลักสูตร
                  </h3>
                </div>
                <div className="flex-col justify-between space-y-4 p-4">
                  <div className="w-full">
                    <SelectBranch
                      openDropdown={openDropdown}
                      setOpenDropdown={setOpenDropdown}
                      branchDropdownRef={branchDropdownRef}
                      handleOnChangeBranch={handleOnChangeBranch}
                      selectBranch={selectBranch}
                      setSelectedBranch={setSelectedBranch}
                    />
                  </div>
                  <div className="w-full">
                    <label className="font-regular mb-2 block text-sm text-gray-600 dark:text-gray-400">
                      หลักสูตร
                    </label>
                    <input
                      name="course_name"
                      value={formData.course_name}
                      onChange={handleInputChange}
                      type="text"
                      className="w-full rounded-md border border-gray-300 px-4 py-2 text-sm font-light text-gray-600 transition-all duration-300 ease-in-out focus:border-blue-500 focus:outline-none dark:border-zinc-600 dark:bg-zinc-800 dark:text-gray-400"
                      placeholder="กรุณากรอกสาขา"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-4 border-t border-gray-200 p-4">
                <label
                    htmlFor={`modal-create`}
                    className="text-md h-10 flex w-20 cursor-pointer items-center justify-center rounded-md border-2 border-gray-200 bg-gray-200 px-4 py-2 text-gray-600 transition duration-300 ease-in-out hover:border-gray-300 hover:bg-gray-300 dark:border-zinc-700 dark:bg-zinc-700 dark:text-gray-400 dark:hover:border-zinc-600 dark:hover:bg-zinc-600"
                  >
                    ยกเลิก
                  </label>
                  <button
                    type="submit"
                    className="text-md h-10 flex w-20 items-center justify-center rounded-md bg-success px-4 py-2 text-white transition duration-300 ease-in-out hover:bg-success hover:bg-success/80 hover:text-white"
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
