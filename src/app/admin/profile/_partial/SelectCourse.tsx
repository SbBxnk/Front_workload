import type React from 'react'
import { useQuery } from '@tanstack/react-query'
import { ChevronDown } from 'lucide-react'
import DropdownService from '@/services/dropdownServices'
import type { DropdownCourse } from '@/Types'

interface SelectCourseProps {
  openDropdown: string | null
  setOpenDropdown: React.Dispatch<React.SetStateAction<string | null>>
  courseDropdownRef: React.RefObject<HTMLDivElement>
  setSelectCourse: React.Dispatch<React.SetStateAction<number | null>>
  handleOnChangeCourse: (course_id: number) => void
  initialCourseName: string
  disabled?: boolean
}

function SelectCourse({
  openDropdown,
  setOpenDropdown,
  courseDropdownRef,
  setSelectCourse,
  handleOnChangeCourse,
  initialCourseName,
  disabled = false,
}: SelectCourseProps) {
  const {
    data: courses = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['dropdown', 'courses'],
    queryFn: async () => {
      const response = await DropdownService.getCourses()
      if (response.success && response.payload) return response.payload
      throw new Error('Failed to fetch courses')
    },
  })

  const handleSelectCourse = (course_id: number) => {
    setSelectCourse(course_id)
    handleOnChangeCourse(course_id)
    setOpenDropdown(null)
  }

  const displayCourse = initialCourseName || 'เลือกหลักสูตร'

  if (isLoading) {
    return (
      <div className="space-y-2">
        <label className="font-regular mb-2 block text-sm text-gray-600 dark:text-gray-400">
          หลักสูตร
        </label>
        <div className="flex h-10 w-full items-center justify-center rounded-md border-2 border-gray-300 bg-gray-100 dark:border-zinc-600 dark:bg-zinc-700">
          <span className="text-sm text-gray-500">กำลังโหลด...</span>
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="space-y-2">
        <label className="font-regular mb-2 block text-sm text-gray-600 dark:text-gray-400">
          หลักสูตร
        </label>
        <div className="flex h-10 w-full items-center justify-center rounded-md border-2 border-red-300 bg-red-50 dark:border-red-600 dark:bg-red-900/20">
          <span className="text-sm text-red-500">Error fetching courses</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <label className="font-regular mb-2 block text-sm text-gray-600 dark:text-gray-400">
        หลักสูตร
      </label>
      <div className="relative" ref={courseDropdownRef}>
        <button
          type="button"
          onClick={() =>
            !disabled && setOpenDropdown(openDropdown === 'course' ? null : 'course')
          }
          aria-expanded={openDropdown === 'course'}
          disabled={disabled}
          className={`flex w-full items-center justify-between rounded-md border-2 border-gray-300 bg-white px-4 py-2 text-sm font-light text-gray-600 transition-colors duration-300 ease-in-out focus:border-blue-500 focus:outline-none disabled:cursor-not-allowed disabled:bg-gray-100 disabled:opacity-50 dark:border-zinc-600 dark:bg-zinc-800 dark:text-gray-400 dark:disabled:bg-zinc-700`}
        >
          {displayCourse}
          <ChevronDown
            className={`h-4 w-4 text-gray-600 transition-transform duration-200 dark:text-zinc-600 ${
              openDropdown === 'course' ? 'rotate-180' : ''
            }`}
          />
        </button>
        {openDropdown === 'course' && !disabled && (
          <div className="absolute z-10 mt-2 max-h-36 w-full overflow-y-auto rounded-md border-2 border-gray-300 bg-white shadow-lg dark:border-zinc-600 dark:bg-zinc-900">
            {courses.map((course: DropdownCourse) => (
              <div
                key={course.course_id}
                className="cursor-pointer px-4 py-2 text-sm font-light text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-zinc-800"
                onClick={() => handleSelectCourse(course.course_id)}
              >
                {course.course_name}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default SelectCourse
