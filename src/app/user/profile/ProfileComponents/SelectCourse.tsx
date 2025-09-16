import React, { useState, useEffect } from 'react'
import { ChevronDown } from 'lucide-react'
import axios from 'axios'
import { jwtDecode } from 'jwt-decode'
import { useSession } from 'next-auth/react'

interface UserLoginData {
  course_name: string
}

interface Course {
  course_id: number
  course_name: string
}

interface SelectCourseProps {
  openDropdown: string | null
  setOpenDropdown: React.Dispatch<React.SetStateAction<string | null>>
  courseDropdownRef: React.RefObject<HTMLDivElement>
  selectCourse: string | null
  setSelectedCourse: React.Dispatch<React.SetStateAction<string | null>>
  handleOnChangeCourse: (course_id: number, course_name: string) => void
}

function SelectCourse({
  openDropdown,
  setOpenDropdown,
  courseDropdownRef,
  selectCourse,
  setSelectedCourse,
  handleOnChangeCourse,
}: SelectCourseProps) {
  const [courses, setCourses] = useState<Course[]>([])
  const [error, setError] = useState<string | null>(null)
  const { data: session } = useSession()

  useEffect(() => {
    // Decode token and set the default course
    if (session?.accessToken) {
      const decoded: UserLoginData = jwtDecode(session.accessToken)
      setSelectedCourse(decoded.course_name) // Set default course based on token
    }
  }, [session?.accessToken, setSelectedCourse])

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        if (!session?.accessToken) {
          throw new Error('No token found. Please log in.')
        }

        const response = await axios.get(
          process.env.NEXT_PUBLIC_API + '/course',
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${session.accessToken}`,
            },
          }
        )

        if (response.status === 200) {
          if (response.data.status) {
            setCourses(response.data.data)
          } else {
            throw new Error('No data found')
          }
        } else {
          throw new Error('Failed to fetch data')
        }
      } catch (error) {
        if (axios.isAxiosError(error)) {
          setError(error.response?.data?.message || 'Error fetching courses')
          console.error('Axios error:', error.response || error.message)
        } else {
          setError('An unknown error occurred')
          console.error('Unknown error:', error)
        }
      }
    }

    if (session?.accessToken) {
      fetchCourses()
    }
  }, [session?.accessToken])

  const handleSelectCourse = (course_name: string, course_id: number) => {
    setSelectedCourse(course_name)
    handleOnChangeCourse(course_id, course_name)
    setOpenDropdown(null)
  }

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
          className="flex w-full items-center justify-between rounded-md border-2 border-gray-300 bg-white px-4 py-2 text-sm font-light text-gray-600 transition-all transition-colors duration-300 ease-in-out focus:border-blue-500 focus:outline-none dark:border-zinc-600 dark:bg-zinc-800 dark:text-gray-400"
        >
          {selectCourse || 'เลือกหลักสูตร'}
          <ChevronDown
            className={`h-4 w-4 text-gray-600 transition-transform duration-200 dark:text-zinc-600 ${
              openDropdown === 'course' ? 'rotate-180' : ''
            }`}
          />
        </button>
        {openDropdown === 'course' && (
          <div className="absolute z-10 mt-2 max-h-36 w-full overflow-y-auto rounded-md border-2 border-gray-300 bg-white shadow-lg dark:border-zinc-600 dark:bg-zinc-900">
            {courses.map((course) => (
              <div
                key={course.course_id}
                className="cursor-pointer px-4 py-2 text-sm font-light text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-zinc-800"
                onClick={() =>
                  handleSelectCourse(course.course_name, course.course_id)
                }
              >
                {course.course_name}
              </div>
            ))}
          </div>
        )}
      </div>
      {error && <div className="mt-2 text-red-500">{error}</div>}
    </div>
  )
}

export default SelectCourse
