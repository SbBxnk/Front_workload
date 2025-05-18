import type React from "react"
import { ChevronDown } from "lucide-react"
import type { Course } from "@/Types"
import { useEffect, useState } from "react"
import axios from "axios"

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

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        if (!branch_id) return
        setIsLoading(true)
        setError(null) 

        const response = await axios.get(`${process.env.NEXT_PUBLIC_API}/course/branch/${branch_id}`, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        })

        if (response.status === 200 && response.data.status) {
          setIsLoading(false)
          setCourses(response.data.data || [])
        } else {
          throw new Error("No data found")
        }
      } catch (error) {
        setIsLoading(false)
        console.error("Axios error:", error)
        setError("เกิดข้อผิดพลาดในการเชื่อมต่อข้อมูล")
      }
    }

    fetchCourses()
  }, [branch_id]) 

  const handleSelectCourse = (course_id: number, course_name: string) => {
    handleOnChangeCourse(course_id, course_name)
    setSelectedCourse(course_name)
    setOpenDropdown(null)
  }

  if(isLoading) return <div>Loading...</div>
  if(error) return <div>{error}</div>

  return (
    <div>
      <label className="block text-sm font-regular text-gray-600 dark:text-gray-400 mb-2">หลักสูตร</label>
      <div className="relative z-5" ref={courseDropdownRef}>
        <button
          type="button"
          onClick={() => setOpenDropdown(openDropdown === "course" ? null : "course")}
          disabled={!branch_id}
          className={`w-full px-4 py-2 font-light rounded-md text-sm border-2 border-gray-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-gray-600 dark:text-gray-400 focus:outline-none focus:border-blue-500 transition-colors flex items-center justify-between transition-all duration-300 ease-in-out ${
            !branch_id ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {selectCourse
            ? courses?.find((course) => course.course_name === selectCourse)?.course_name || "หลักสูตรไม่พบ"
            : "เลือกหลักสูตร"}
          <ChevronDown
            className={`w-4 h-4 text-gray-600 dark:text-zinc-600 transition-transform duration-200 ${
              openDropdown === "course" ? "rotate-180" : ""
            }`}
          />
        </button>
        {openDropdown === "course" && courses && courses.length > 0 && (
          <div className="absolute z-10 overflow-y-auto max-h-36 w-full mt-2 bg-white dark:bg-zinc-900 border-2 border-gray-300 dark:border-zinc-600 rounded-md shadow-lg">
            {courses.map((course) => (
              <div
                key={course.course_id}
                className="px-4 py-2 text-sm font-light text-gray-600 hover:bg-gray-100 dark:hover:bg-zinc-800 cursor-pointer dark:text-gray-400"
                onClick={() => handleSelectCourse(course.course_id, course.course_name)}
              >
                {course.course_name}
              </div>
            ))}
          </div>
        )}
      </div>
      {error && <div className="text-red-500 mt-2">{error}</div>}
      {courses && courses.length === 0 && <div className="text-yellow-500 mt-2">ไม่พบข้อมูลหลักสูตร</div>}
    </div>
  )
}

export default SelectCourse
