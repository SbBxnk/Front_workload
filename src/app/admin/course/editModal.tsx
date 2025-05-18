"use client"

import { LibraryBigIcon } from "lucide-react"
import { useState, useEffect, useRef } from "react"
import type React from "react"
import SelectBranch from "./courseComponents/SelectBranch"

interface EditModalProps {
  isLoading: boolean
  course_id: number
  course_name: string
  branch_id: number
  branch_name: string
  handleEdit: (
    e: React.FormEvent<HTMLFormElement> | React.MouseEvent,
    course_id: number,
    updatedCourse: string,
    branch_id: number,
  ) => void
}

export default function EditModal({
  isLoading,
  course_id,
  course_name,
  branch_id,
  branch_name,
  handleEdit,
}: EditModalProps) {
  const [editCourse, setEditCourse] = useState(course_name)
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const branchDropdownRef = useRef<HTMLDivElement>(null)
  const [selectedBranch, setSelectedBranch] = useState<string | null>(branch_name)
  const [selectedBranchId, setSelectedBranchId] = useState<number>(branch_id)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (branchDropdownRef.current && !branchDropdownRef.current.contains(event.target as Node)) {
        setOpenDropdown(null)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const handleOnChangeBranch = (branch_id: number, branch_name: string) => {
    setSelectedBranchId(branch_id)
    setSelectedBranch(branch_name)
  }

  useEffect(() => {
    setEditCourse(course_name)
    setSelectedBranch(branch_name)
    setSelectedBranchId(branch_id)
  }, [course_name, branch_name, branch_id])

  if (isLoading) return null

  return (
    <div className="relative z-[100]">
      <input type="checkbox" id={`modal-edit${course_id}`} className="modal-toggle" />
      <div className="modal" role={`modal-edit${course_id}`}>
        <div className="modal-box rounded-md dark:bg-zinc-800">
          <form
            onSubmit={(e) => {
              e.preventDefault()
              handleEdit(e, course_id, editCourse, selectedBranchId)
            }}
          >
            <div className="flex items-center">
              <LibraryBigIcon className="text-business1 dark:text-blue-500/80 mr-2 w-7 h-7" />
              <h3 className="flex text-2xl font-regular truncate text-start text-gray-600 dark:text-gray-400">
                แก้ไขหลักสูตร&nbsp;
                <span className="font-semibold text-business1 truncate dark:text-blue-500/80">{course_name}</span>
              </h3>
            </div>
            <div className="flex-col justify-between space-y-4 py-4">
              <div className="w-full">
                <SelectBranch
                  openDropdown={openDropdown}
                  setOpenDropdown={setOpenDropdown}
                  branchDropdownRef={branchDropdownRef}
                  handleOnChangeBranch={handleOnChangeBranch}
                  selectBranch={selectedBranch}
                  setSelectedBranch={setSelectedBranch}
                />
              </div>
              <div className="w-full">
                <label className="block text-sm font-regular text-gray-600 dark:text-gray-400 mb-2">หลักสูตร</label>
                <input
                  name="course_name"
                  value={editCourse}
                  onChange={(e) => setEditCourse(e.target.value)}
                  type="text"
                  className="w-full px-4 py-2 font-light rounded-md text-sm border-2 border-gray-300 dark:border-zinc-600 text-gray-600 dark:bg-zinc-800 dark:text-gray-400 focus:outline-none focus:border-blue-500 transition-colors transition-all duration-300 ease-in-out"
                  placeholder="กรุณากรอกหลักสูตร"
                />
              </div>
            </div>
            <div className="flex justify-end gap-4">
              <button
                type="submit"
                className="w-20 bg-yellow-500 flex items-center justify-center text-md text-white rounded-md py-2 px-4 hover:bg-yellow-500/80 transition ease-in-out duration-300 text-nowrap"
              >
                บันทึก
              </button>
              <label
                htmlFor={`modal-edit${course_id}`}
                className="w-20 border border-2 border-gray-200 flex items-center justify-center bg-gray-200 text-md text-gray-600 rounded-md py-2 px-4 hover:bg-gray-300 hover:border-gray-300 dark:bg-zinc-700 dark:text-gray-400 dark:hover:bg-zinc-600 dark:hover:border-zinc-600 dark:border-zinc-700 transition ease-in-out duration-300 cursor-pointer"
              >
                ยกเลิก
              </label>
            </div>
          </form>
        </div>
        <label className="modal-backdrop" htmlFor={`modal-edit${course_id}`}>
          Close
        </label>
      </div>
    </div>
  )
}

