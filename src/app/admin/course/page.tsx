'use client'
import type React from 'react'
import { useEffect, useState } from 'react'
import { Edit2, Loader, Plus, Trash2 } from 'lucide-react'
import type { Course, Branch } from '@/Types'
import SkeletonTable from '../personal-list/Personal-listComponents/SkeletonTable'
import axios from 'axios'
import CreateModal from './createModal'
import DeleteModal from './deleteModal'
import Pagination from '@/components/Pagination'
import { FiX } from 'react-icons/fi'
import SearchFilter from '@/components/SearchFilter'
import Swal from 'sweetalert2'
import EditModal from './editModal'

const ITEMS_PER_PAGE = 10

interface FormDataCourse {
  course_name: string
  branch_id: number
}

const FormDataCourse: FormDataCourse = {
  course_name: '',
  branch_id: 0,
}

function PositionTable() {
  const [FormData, setFormData] = useState<FormDataCourse>(FormDataCourse)
  const [currentPage, setCurrentPage] = useState(1)
  const [searchName, setSearchName] = useState<string>('')
  const [selectedCourse, setSelectedCourse] = useState<string>('')
  const [selectedBranch, setSelectedBranch] = useState<string>('')
  const [courses, setCourse] = useState<Course[]>([])
  const [branchs, setBranchs] = useState<Branch[]>([])
  const [courseLoading, setCourseLoading] = useState(false)
  const [branchLoading, setBranchLoading] = useState(false)
  const [courseError, setCourseError] = useState<string | null>(null)
  const [branchError, setBranchError] = useState<string | null>(null)
  const [selectedCourseId, setSelectedCourseId] = useState<number>(0)
  const [selectedCourseName, setSelectedCourseName] = useState<string>('')
  const [selectedBranchId, setSelectedBranchId] = useState<number>(0)
  const [selectedBranchName, setSelectedBranchName] = useState<string>('')

  useEffect(() => {
    fetchCourse()
    fetchBranch()
  }, [])

  const fetchCourse = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        setCourseError('ไม่พบ token กรุณาลงชื่อเข้าใช้งาน')
        setCourseLoading(false)
        return
      }

      const response = await axios.get(
        process.env.NEXT_PUBLIC_API + '/course',
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      )

      console.log('API Response:', response.data)

      if (response.data && Array.isArray(response.data)) {
        setCourse(response.data)
      } else if (
        response.data &&
        response.data.data &&
        Array.isArray(response.data.data)
      ) {
        setCourse(response.data.data)
      } else {
        setCourseError('ข้อมูลที่ได้รับไม่ใช่รูปแบบที่คาดหวัง')
      }

      setCourseLoading(false)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err)
      setCourseError(`ไม่สามารถดึงข้อมูลได้: ${errorMessage}`)
      setCourseLoading(false)
    }
  }
  const fetchBranch = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        setBranchError('ไม่พบ token กรุณาลงชื่อเข้าใช้งาน')
        setBranchLoading(false)
        return
      }

      const response = await axios.get(
        process.env.NEXT_PUBLIC_API + '/branch',
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      )

      console.log('API Response:', response.data)

      if (response.data && Array.isArray(response.data)) {
        setBranchs(response.data)
      } else if (
        response.data &&
        response.data.data &&
        Array.isArray(response.data.data)
      ) {
        setBranchs(response.data.data)
      } else {
        setBranchError('ข้อมูลที่ได้รับไม่ใช่รูปแบบที่คาดหวัง')
      }

      setBranchLoading(false)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err)
      setBranchError(`ไม่สามารถดึงข้อมูลได้: ${errorMessage}`)
      setBranchLoading(false)
    }
  }

  const clearSearch = () => {
    setSearchName('')
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handleCourseSelect = (value: string) => {
    setSelectedCourse(value)
  }
  const handleBranchSelect = (value: string) => {
    setSelectedBranch(value)
  }

  const filteredCourse =
    branchs &&
    courses.filter((course) => {
      const fullName = `${course.course_name}`.toLowerCase()
      return (
        fullName.includes(searchName.toLowerCase()) &&
        (selectedCourse ? course.course_name === selectedCourse : true) &&
        (selectedBranch ? String(course.branch_name) === selectedBranch : true)
      )
    })

  const totalPages = Math.ceil(filteredCourse.length / ITEMS_PER_PAGE)
  const currentData = filteredCourse.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )
  const selectedLabel =
    courses.find((pos) => pos.course_name === selectedCourse)?.course_name ||
    'เลือกหลักสูตร'

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleBranchChange = (branch_id: number) => {
    setFormData((prev) => ({ ...prev, branch_id }))
  }

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement> | React.MouseEvent,
    course_name: string,
    branch_id: number
  ) => {
    setCourseLoading(true)
    e.preventDefault()
    try {
      await axios.post(
        process.env.NEXT_PUBLIC_API + `/course/add`,
        { course_name, branch_id },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      )
      setFormData(FormDataCourse)
      fetchCourse()
      setCourseLoading(false)
      Swal.fire({
        position: 'center',
        icon: 'success',
        title: 'สำเร็จ!',
        text: `เพิ่มหลักสูตร ${course_name} สำเร็จ!`,
        showConfirmButton: false,
        timer: 1500,
      })
    } catch (error) {
      console.error('Error adding courses:', error)
      setCourseLoading(false)
      Swal.fire({
        position: 'center',
        icon: 'error',
        title: 'เกิดข้อผิดพลาด!',
        text: 'เกิดข้อผิดพลาดในการเพิ่มหลักสูตร',
        showConfirmButton: false,
        timer: 1500,
      })
    }
  }

  const handleDelete = async (
    e: React.FormEvent<HTMLFormElement> | React.MouseEvent,
    course_id: number,
    course_name: string
  ) => {
    e.preventDefault()
    setCourseLoading(true)
    try {
      await axios.delete(
        `${process.env.NEXT_PUBLIC_API}/course/delete/${course_id}`,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      )
      fetchCourse()
      setCourseLoading(false)

      Swal.fire({
        icon: 'success',
        title: 'ลบสำเร็จ!',
        text: `ลบสาขา ${course_name} สำเร็จ!`,
        showConfirmButton: false,
        timer: 1500,
      })
    } catch (error) {
      console.error('Error deleting course:', error)
      setCourseLoading(false)

      Swal.fire({
        icon: 'error',
        title: 'เกิดข้อผิดพลาด!',
        text: 'เกิดข้อผิดพลาดในการลบสาขา',
        showConfirmButton: false,
        timer: 1500,
      })
    }
  }

  const handleEdit = async (
    e: React.FormEvent<HTMLFormElement> | React.MouseEvent,
    course_id: number,
    course_name: string,
    branch_id: number
  ) => {
    e.preventDefault()
    setCourseLoading(true)
    try {
      await axios.put(
        `${process.env.NEXT_PUBLIC_API}/course/update/${course_id}`,
        { course_name, branch_id },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      )
      fetchCourse()
      setCourseLoading(false)

      Swal.fire({
        icon: 'success',
        title: 'แก้ไขสำเร็จ!',
        text: `แก้ไขหลักสูตร ${course_name} สำเร็จ!`,
        showConfirmButton: false,
        timer: 1500,
      })
    } catch (error) {
      console.error('Error deleting prefix:', error)
      setCourseLoading(false)

      Swal.fire({
        icon: 'error',
        title: 'เกิดข้อผิดพลาด!',
        text: 'เกิดข้อผิดพลาดในการแก้ไขหลักสูตร',
        showConfirmButton: false,
        timer: 1500,
      })
    }
  }

  if (courseLoading || branchLoading) {
    return <SkeletonTable />
  }

  if (courseError || branchError) {
    return (
      <div>
        เกิดข้อผิดพลาดในการเชื่อมต่อข้อมูล: {courseError || branchError}
      </div>
    )
  }

  return (
    <div className="rounded-md bg-white p-4 shadow transition-all duration-300 ease-in-out dark:bg-zinc-900 dark:text-gray-400">
      <div className="py-4 md:flex">
        <div className="flex w-full flex-wrap gap-4 md:w-full">
          <div className="relative flex w-full items-center md:w-52">
            <input
              className="w-full rounded-md border-2 border-gray-300 px-4 py-2 text-sm font-light text-gray-600 transition-all transition-colors duration-300 ease-in-out focus:border-blue-500 focus:outline-none dark:border-zinc-600 dark:bg-zinc-800 dark:text-gray-400"
              placeholder="ค้นหาด้วยชื่อบุคคล"
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
            />
            {searchName && (
              <button
                onClick={clearSearch}
                className="absolute right-3 text-gray-400 transition duration-200 hover:text-red-500"
              >
                <FiX className="h-4 w-4" />
              </button>
            )}
          </div>
          <SearchFilter<Course, 'course_name'>
            selectedLabel={selectedLabel}
            handleSelect={handleCourseSelect}
            objects={Array.isArray(courses) ? courses : []}
            valueKey="course_name"
            labelKey="course_name"
            placeholder="ค้นหาหลักสูตร"
          />
          <SearchFilter<Branch, 'branch_name'>
            selectedLabel={selectedBranch || 'เลือกสาขา'}
            handleSelect={handleBranchSelect}
            objects={Array.isArray(branchs) ? branchs : []}
            valueKey="branch_name"
            labelKey="branch_name"
            placeholder="ค้นหาสาขา"
          />
        </div>
        <div className="w-full pt-4 md:w-auto md:pt-0">
          <label
            htmlFor={`modal-create`}
            className="flex w-full cursor-pointer items-center justify-between gap-2 rounded-md bg-success px-4 py-2.5 text-sm font-light text-white transition duration-300 ease-in-out hover:bg-success/80 md:w-52"
          >
            เพิ่มสาขา
            <Plus className="h-4 w-4" />
          </label>
        </div>
      </div>{' '}
      <div className="rounded-md border transition-all duration-300 ease-in-out dark:border-zinc-600">
        <div className="">
          {courseLoading && (
            <div className="absolute inset-0 z-50 flex items-center justify-center bg-gray-100 bg-opacity-80">
              <Loader className="h-12 w-12 animate-spin text-gray-600" />
            </div>
          )}
          <div className="overflow-x-auto">
            <table className="w-full overflow-x-auto md:table-auto">
              <thead className="bg-gray-100 transition-all duration-300 ease-in-out dark:bg-zinc-800">
                <tr>
                  <td className="text-nowrap border border-gray-300 border-opacity-40 p-4 py-4 text-center text-sm text-gray-600 dark:border-zinc-600 dark:text-gray-300">
                    #
                  </td>
                  <td className="text-nowrap border border-gray-300 border-opacity-40 p-4 py-4 text-center text-sm text-gray-600 dark:border-zinc-600 dark:text-gray-300">
                    หลักสูตร
                  </td>
                  <td className="text-nowrap border border-gray-300 border-opacity-40 p-4 py-4 text-center text-sm text-gray-600 dark:border-zinc-600 dark:text-gray-300">
                    สาขา
                  </td>
                  <td className="sticky right-0 text-nowrap border border-gray-300 border-opacity-40 bg-gray-100 p-4 py-4 text-center text-sm text-gray-600 transition-all duration-300 ease-in-out dark:border-zinc-600 dark:bg-zinc-800 dark:text-gray-300">
                    จัดการ
                  </td>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white transition-all duration-300 ease-in-out dark:divide-zinc-600 dark:bg-zinc-900">
                {currentData.map((item: Course, index) => (
                  <tr
                    key={item.course_id}
                    className="hover:bg-gray-50 dark:hover:bg-zinc-800"
                  >
                    <td className="text-md font-regular whitespace-nowrap border border-gray-300 border-opacity-40 p-4 text-center text-gray-600 dark:border-zinc-600 dark:text-gray-300">
                      {(currentPage - 1) * ITEMS_PER_PAGE + index + 1}
                    </td>
                    <td className="text-md whitespace-nowrap border border-gray-300 border-opacity-40 p-4 text-start font-light text-gray-500 dark:border-zinc-600 dark:text-gray-400">
                      {item?.course_name || '-'}
                    </td>
                    <td className="text-md whitespace-nowrap border border-gray-300 border-opacity-40 p-4 text-start font-light text-gray-500 dark:border-zinc-600 dark:text-gray-400">
                      {item?.branch_name || '-'}
                    </td>
                    <td className="text-md sticky right-0 flex justify-center gap-2 whitespace-nowrap border border-gray-300 border-opacity-40 bg-white p-4 text-center font-light transition-all duration-300 ease-in-out dark:border-zinc-600 dark:bg-zinc-900">
                      <label
                        htmlFor={`modal-edit${item.course_id}`}
                        className="cursor-pointer rounded-md border-none border-yellow-500 p-1 text-yellow-500 transition duration-300 ease-in-out hover:bg-yellow-500 hover:text-white"
                        onClick={() => {
                          setSelectedCourseId(item.course_id)
                          setSelectedCourseName(item.course_name)
                          setSelectedBranchId(item.branch_id)
                          setSelectedBranchName(String(item.branch_name))
                        }}
                      >
                        <Edit2 className="h-4 w-4" />
                      </label>
                      <label
                        htmlFor={`modal-delete${item.course_id}`}
                        className="cursor-pointer rounded-md border-none border-red-500 p-1 text-red-500 transition duration-300 ease-in-out hover:bg-red-500 hover:text-white"
                        onClick={() => {
                          setSelectedCourseId(item.course_id)
                          setSelectedCourseName(item.course_name)
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </label>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="px-4">
          <Pagination
            ITEMS_PER_PAGE={ITEMS_PER_PAGE}
            data={filteredCourse}
            currentData={currentData}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      </div>
      <CreateModal
        isLoading={courseLoading || branchLoading}
        handleSubmit={handleSubmit}
        formData={FormData}
        handleInputChange={handleInputChange}
        handleBranchChange={handleBranchChange}
        setFormData={setFormData}
      />
      <DeleteModal
        isLoading={courseLoading || branchLoading}
        course_id={selectedCourseId}
        course_name={selectedCourseName}
        handleDelete={handleDelete}
      />
      <EditModal
        isLoading={courseLoading || branchLoading}
        course_id={selectedCourseId}
        course_name={selectedCourseName}
        branch_id={selectedBranchId}
        handleEdit={handleEdit}
        branch_name={selectedBranchName}
      />
    </div>
  )
}

export default PositionTable
