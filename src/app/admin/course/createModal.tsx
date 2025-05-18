import type React from "react";
import { LibraryBigIcon } from "lucide-react";
import SelectBranch from "./courseComponents/SelectBranch";
import { useEffect, useRef, useState } from "react";

interface FormDataCourse {
  course_name: string;
  branch_id: number;
}

interface CreateModalProps {
  isLoading: boolean;
  handleSubmit: (e: React.FormEvent<HTMLFormElement> | React.MouseEvent, course_name: string, branch_id: number) => void;
  formData: FormDataCourse;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleBranchChange: (branch_id: number) => void;
  setFormData: React.Dispatch<React.SetStateAction<FormDataCourse>>
}

export default function CreateModal({ isLoading, handleSubmit, formData, handleInputChange, setFormData }: CreateModalProps) {
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
    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
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
            <div className="modal-box rounded-md dark:bg-zinc-800 no-scrollbar">
              <form onSubmit={(e) => handleSubmit(e, formData.course_name, formData.branch_id)}>
                <div className="flex items-center">
                  <LibraryBigIcon className="text-business1 dark:text-blue-500/80 mr-2 w-7 h-7" />
                  <h3 className="flex text-2xl font-regular truncate text-start text-gray-600 dark:text-gray-400">
                    เพิ่มหลักสูตร
                  </h3>
                </div>
                <div className="flex-col justify-between space-y-4 py-4">
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
                    <label className="block text-sm font-regular text-gray-600 dark:text-gray-400 mb-2">
                      หลักสูตร
                    </label>
                    <input
                      name="course_name"
                      value={formData.course_name}
                      onChange={handleInputChange}
                      type="text"
                      className="w-full px-4 py-2 font-light rounded-md text-sm border-2 border-gray-300 dark:border-zinc-600 text-gray-600 dark:bg-zinc-800 dark:text-gray-400 focus:outline-none focus:border-blue-500 transition-colors transition-all duration-300 ease-in-out"
                      placeholder="กรุณากรอกสาขา"
                    />
                  </div>

                </div>
                <div className="flex justify-end gap-4">
                  <button
                    type="submit"
                    className="w-20 bg-success flex items-center justify-center text-md text-white rounded-md py-2 px-4 hover:bg-success hover:text-white hover:bg-success/80 transition ease-in-out duration-300"
                  >
                    ยืนยัน
                  </button>
                  <label
                    htmlFor={`modal-create`}
                    className=" w-20 border border-2 border-gray-200 flex items-center justify-center bg-gray-200 text-md text-gray-600 rounded-md py-2 px-4 hover:bg-gray-300 hover:border-gray-300 dark:bg-zinc-700 dark:text-gray-400 dark:hover:bg-zinc-600 dark:hover:border-zinc-600 dark:border-zinc-700 transition ease-in-out duration-300 cursor-pointer"
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
  );
}
