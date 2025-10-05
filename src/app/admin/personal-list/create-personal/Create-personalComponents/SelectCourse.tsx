import type React from 'react'
import { ChevronDown } from 'lucide-react'
import type { Course } from '@/Types'
import { useEffect, useState } from 'react'
import axios from 'axios'
import { useSession } from 'next-auth/react'

interface SelectCourseProps {
  openDropdown: string | null
  setOpenDropdown: React.Dispatch<React.SetStateAction<string | null>>
  courseDropdownRef: React.RefObject<HTMLDivElement>
  handleOnChangeCourse: (course_id: number, course_name: string) => void
  setSelectedCourse: React.Dispatch<React.SetStateAction<string | null>>
  selectCourse: string | null
  branch_id: number | null
}

function SelectCourse({
  openDropdown,
  setOpenDropdown,
  courseDropdownRef,
  handleOnChangeCourse,
  selectCourse,
  setSelectedCourse,
  branch_id,
}: SelectCourseProps) {
  const [courses, setCourses] = useState<Course[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const { data: session } = useSession()

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        if (!branch_id) return
        setIsLoading(true)
        setError(null)

        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API}/course/branch/${branch_id}`,
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${session?.accessToken}`,
            },
          }
        )

        if (response.status === 200 && response.data.status) {
          setIsLoading(false)
          setCourses(response.data.data || [])
        } else {
          throw new Error('No data found')
        }
      } catch (error) {
        setIsLoading(false)
        console.error('Axios error:', error)
        setError('เกิดข้อผิดพลาดในการเชื่อมต่อข้อมูล')
      }
    }

    if (session?.accessToken && branch_id) {
      fetchCourses()
    }
  }, [branch_id, session?.accessToken])

  const handleSelectCourse = (course_id: number, course_name: string) => {
    handleOnChangeCourse(course_id, course_name)
    setSelectedCourse(course_name)
    setOpenDropdown(null)
  }

  if (isLoading) return <div>Loading...</div>
  if (error) return <div>{error}</div>

  return (
    <div>
      <label className="font-regular mb-2 block text-sm text-gray-600 dark:text-gray-400">
        หลักสูตร
      </label>
      <div className="z-5 relative" ref={courseDropdownRef}>
        <button
          type="button"
          onClick={() =>
            setOpenDropdown(openDropdown === 'course' ? null : 'course')
          }
          disabled={!branch_id}
          className={`flex w-full items-center justify-between rounded-md border-2 border-gray-300 bg-white px-4 py-2 text-sm font-light text-gray-600 transition-all transition-colors duration-300 ease-in-out focus:border-blue-500 focus:outline-none dark:border-zinc-600 dark:bg-zinc-800 dark:text-gray-400 ${
            !branch_id ? 'cursor-not-allowed opacity-50' : ''
          }`}
        >
          {selectCourse
            ? courses?.find((course) => course.course_name === selectCourse)
                ?.course_name || 'หลักสูตรไม่พบ'
            : 'เลือกหลักสูตร'}
          <ChevronDown
            className={`h-4 w-4 text-gray-600 transition-transform duration-200 dark:text-zinc-600 ${
              openDropdown === 'course' ? 'rotate-180' : ''
            }`}
          />
        </button>
        {openDropdown === 'course' && courses && courses.length > 0 && (
          <div className="absolute z-10 mt-2 max-h-36 w-full overflow-y-auto rounded-md border-2 border-gray-300 bg-white shadow-lg dark:border-zinc-600 dark:bg-zinc-900">
            {courses.map((course) => (
              <div
                key={course.course_id}
                className="cursor-pointer px-4 py-2 text-sm font-light text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-zinc-800"
                onClick={() =>
                  handleSelectCourse(course.course_id, course.course_name)
                }
              >
                {course.course_name}
              </div>
            ))}
          </div>
        )}
      </div>
      {error && <div className="mt-2 text-red-500">{error}</div>}
      {courses && courses.length === 0 && (
        <div className="mt-2 text-yellow-500">ไม่พบข้อมูลหลักสูตร</div>
      )}
    </div>
  )
}

export default SelectCourse
