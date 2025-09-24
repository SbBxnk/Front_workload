'use client'
import React from 'react'
import { FiFilter } from 'react-icons/fi'
import SearchFilter from '@/components/SearchFilter'
import type { Position, Branch, Course, ExPosition } from '@/Types'

interface GenderOption {
  value: string
  label: string
}

interface FilterDialogProps {
  isOpen: boolean
  onClose: () => void
  positions: Position[]
  branchs: Branch[]
  courses: Course[]
  exPositions: ExPosition[]
  selectedPositionLabel: string
  selectedBranchLabel: string
  selectedCourseLabel: string
  selectedExPositionLabel: string
  selectedGenderLabel: string
  onPositionSelect: (value: string) => void
  onBranchSelect: (value: string) => void
  onCourseSelect: (value: string) => void
  onExPositionSelect: (value: string) => void
  onGenderSelect: (value: string) => void
  onApplyFilters: () => void
}

export default function FilterDialog({
  isOpen,
  onClose,
  positions,
  branchs,
  courses,
  exPositions,
  selectedPositionLabel,
  selectedBranchLabel,
  selectedCourseLabel,
  selectedExPositionLabel,
  selectedGenderLabel,
  onPositionSelect,
  onBranchSelect,
  onCourseSelect,
  onExPositionSelect,
  onGenderSelect,
  onApplyFilters,
}: FilterDialogProps) {
  // Gender options
  const genderOptions: GenderOption[] = [
    { value: 'ชาย', label: 'ชาย' },
    { value: 'หญิง', label: 'หญิง' },
  ]

  return (
    <>
      <div className="relative z-[100]">
        <input 
          type="checkbox" 
          id="modal-filter" 
          className="modal-toggle" 
          checked={isOpen}
          onChange={() => {}} 
        />
        <div className="modal" role="modal-filter">
          <div className="modal-box max-w-xl w-full rounded-md dark:bg-zinc-800 p-0">
              <form onSubmit={(e) => { e.preventDefault(); onApplyFilters(); }}>
                <div className="flex items-center p-4 border-b border-gray-200 dark:border-zinc-600">
                  <FiFilter className="mr-2 h-7 w-7 text-business1 dark:text-blue-500/80" />
                  <h3 className="font-regular flex truncate text-start text-2xl text-gray-600 dark:text-gray-400">
                    ค้นหาขั้นสูง
                  </h3>
                </div>

                <div className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="w-full">
                        <label className="font-regular mb-2 block text-sm text-gray-600 dark:text-gray-400">
                          ตำแหน่งวิชาการ
                        </label>
                        <SearchFilter<Position, 'position_name'>
                          key={`position-${selectedPositionLabel}`}
                          selectedLabel={selectedPositionLabel}
                          handleSelect={onPositionSelect}
                          objects={positions || []}
                          valueKey="position_name"
                          labelKey="position_name"
                          placeholder="เลือกตำแหน่งวิชาการ"
                          className="w-full"
                        />
                      </div>

                      {/* Branch Filter */}
                      <div className="w-full">
                        <label className="font-regular mb-2 block text-sm text-gray-600 dark:text-gray-400">
                          สาขา
                        </label>
                        <SearchFilter<Branch, 'branch_name'>
                          key={`branch-${selectedBranchLabel}`}
                          selectedLabel={selectedBranchLabel}
                          handleSelect={onBranchSelect}
                          objects={branchs || []}
                          valueKey="branch_name"
                          labelKey="branch_name"
                          placeholder="เลือกสาขา"
                          className="w-full"
                        />
                      </div>

                      {/* Course Filter */}
                      <div className="w-full">
                        <label className="font-regular mb-2 block text-sm text-gray-600 dark:text-gray-400">
                          หลักสูตร
                        </label>
                        <SearchFilter<Course, 'course_name'>
                          key={`course-${selectedCourseLabel}`}
                          selectedLabel={selectedCourseLabel}
                          handleSelect={onCourseSelect}
                          objects={courses || []}
                          valueKey="course_name"
                          labelKey="course_name"
                          placeholder="เลือกหลักสูตร"
                          className="w-full"
                        />
                      </div>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-4">
                      {/* Ex-Position Filter */}
                      <div className="w-full">
                        <label className="font-regular mb-2 block text-sm text-gray-600 dark:text-gray-400">
                          ตำแหน่งบริหาร
                        </label>
                        <SearchFilter<ExPosition, 'ex_position_name'>
                          key={`exposition-${selectedExPositionLabel}`}
                          selectedLabel={selectedExPositionLabel}
                          handleSelect={onExPositionSelect}
                          objects={exPositions || []}
                          valueKey="ex_position_name"
                          labelKey="ex_position_name"
                          placeholder="เลือกตำแหน่งบริหาร"
                          className="w-full"
                        />
                      </div>

                      {/* Gender Filter */}
                      <div className="w-full">
                        <label className="font-regular mb-2 block text-sm text-gray-600 dark:text-gray-400">
                          เพศ
                        </label>
                        <SearchFilter<GenderOption, 'value' | 'label'>
                          key={`gender-${selectedGenderLabel}`}
                          selectedLabel={selectedGenderLabel}
                          handleSelect={onGenderSelect}
                          objects={genderOptions}
                          valueKey="value"
                          labelKey="label"
                          placeholder="เลือกเพศ"
                          className="w-full"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-4 p-4 border-t border-gray-200 dark:border-zinc-600">
                  <label
                    htmlFor="modal-filter"
                    className="text-md flex h-10 w-20 cursor-pointer items-center justify-center rounded-md border-2 border-gray-200 bg-gray-200 px-4 py-2 font-light text-gray-600 transition duration-300 ease-in-out hover:border-gray-300 hover:bg-gray-300 dark:border-zinc-700 dark:bg-zinc-700 dark:text-gray-400 dark:hover:border-zinc-600 dark:hover:bg-zinc-600"
                    onClick={onClose}
                  >
                    ยกเลิก
                  </label>
                  <button
                    type="submit"
                    className="text-md flex h-10 w-20 items-center justify-center rounded-md bg-success px-4 py-2 font-light text-white transition duration-300 ease-in-out hover:bg-success hover:bg-success/80 hover:text-white"
                  >
                    ค้นหา
                  </button>
                </div>
              </form>
            </div>
            <label className="modal-backdrop" htmlFor="modal-filter" onClick={onClose}>
              Close
            </label>
          </div>
        </div>
      </>
    )
  }
