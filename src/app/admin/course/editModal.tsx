'use client'

import { LibraryBigIcon } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import type React from 'react'
import SelectBranch from './courseComponents/SelectBranch'

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
    branch_id: number
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
  const [selectedBranch, setSelectedBranch] = useState<string | null>(
    branch_name
  )
  const [selectedBranchId, setSelectedBranchId] = useState<number>(branch_id)

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
      <input
        type="checkbox"
        id={`modal-edit`}
        className="modal-toggle"
      />
      <div className="modal" role={`modal-edit${course_id}`}>
        <div className="modal-box rounded-md dark:bg-zinc-800">
          <form
            onSubmit={(e) => {
              e.preventDefault()
              handleEdit(e, course_id, editCourse, selectedBranchId)
            }}
          >
            <div className="flex items-center">
              <LibraryBigIcon className="mr-2 h-7 w-7 text-business1 dark:text-blue-500/80" />
              <h3 className="font-regular flex truncate text-start text-2xl text-gray-600 dark:text-gray-400">
                แก้ไขหลักสูตร&nbsp;
                <span className="truncate font-semibold text-business1 dark:text-blue-500/80">
                  {course_name}
                </span>
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
                <label className="font-regular mb-2 block text-sm text-gray-600 dark:text-gray-400">
                  หลักสูตร
                </label>
                <input
                  name="course_name"
                  value={editCourse}
                  onChange={(e) => setEditCourse(e.target.value)}
                  type="text"
                  className="w-full rounded-md border-2 border-gray-300 px-4 py-2 text-sm font-light text-gray-600 transition-colors duration-300 ease-in-out focus:border-blue-500 focus:outline-none dark:border-zinc-600 dark:bg-zinc-800 dark:text-gray-400"
                  placeholder="กรุณากรอกหลักสูตร"
                />
              </div>
            </div>
            <div className="flex justify-end gap-4">
              <button
                type="submit"
                className="text-md flex w-20 items-center justify-center text-nowrap rounded-md bg-yellow-500 px-4 py-2 text-white transition duration-300 ease-in-out hover:bg-yellow-500/80"
              >
                บันทึก
              </button>
              <label
                htmlFor={`modal-edit`}
                className="text-md flex w-20 cursor-pointer items-center justify-center rounded-md border-2 border-gray-200 bg-gray-200 px-4 py-2 text-gray-600 transition duration-300 ease-in-out hover:border-gray-300 hover:bg-gray-300 dark:border-zinc-700 dark:bg-zinc-700 dark:text-gray-400 dark:hover:border-zinc-600 dark:hover:bg-zinc-600"
              >
                ยกเลิก
              </label>
            </div>
          </form>
        </div>
        <label className="modal-backdrop" htmlFor={`modal-edit`}>
          Close
        </label>
      </div>
    </div>
  )
}
