"use client"
import type React from "react"
import { useEffect, useState } from "react"
import { Edit2, Loader, Plus, Trash2 } from "lucide-react"
import type { Course, Branch } from "@/Types"
import SkeletonTable from "../personal-list/Personal-listComponents/SkeletonTable"
import axios from "axios"
import CreateModal from "./createModal"
import DeleteModal from "./deleteModal"
import Pagination from "@/components/Pagination"
import { FiX } from "react-icons/fi"
import SearchFilter from "@/components/SearchFilter"
import Swal from "sweetalert2"
import EditModal from "./editModal"

const ITEMS_PER_PAGE = 10

interface FormDataCourse {
  course_name: string
  branch_id: number
}

const FormDataCourse: FormDataCourse = {
  course_name: "",
  branch_id: 0,
}

function PositionTable() {
  const [FormData, setFormData] = useState<FormDataCourse>(FormDataCourse)
  const [currentPage, setCurrentPage] = useState(1)
  const [searchName, setSearchName] = useState<string>("")
  const [selectedCourse, setSelectedCourse] = useState<string>("")
  const [selectedBranch, setSelectedBranch] = useState<string>("")
  const [courses, setCourse] = useState<Course[]>([])
  const [branchs, setBranchs] = useState<Branch[]>([])
  const [courseLoading, setCourseLoading] = useState(false)
  const [branchLoading, setBranchLoading] = useState(false)
  const [courseError, setCourseError] = useState<string | null>(null)
  const [branchError, setBranchError] = useState<string | null>(null)
  const [selectedCourseId, setSelectedCourseId] = useState<number>(0)
  const [selectedCourseName, setSelectedCourseName] = useState<string>("")
  const [selectedBranchId, setSelectedBranchId] = useState<number>(0)
  const [selectedBranchName, setSelectedBranchName] = useState<string>("")

  useEffect(() => {
    fetchCourse()
    fetchBranch()
  }, [])

  const fetchCourse = async () => {
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        setCourseError("ไม่พบ token กรุณาลงชื่อเข้าใช้งาน")
        setCourseLoading(false)
        return
      }

      const response = await axios.get(process.env.NEXT_PUBLIC_API + "/course", {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })

      console.log("API Response:", response.data)

      if (response.data && Array.isArray(response.data)) {
        setCourse(response.data)
      } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
        setCourse(response.data.data)
      } else {
        setCourseError("ข้อมูลที่ได้รับไม่ใช่รูปแบบที่คาดหวัง")
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
      const token = localStorage.getItem("token")
      if (!token) {
        setBranchError("ไม่พบ token กรุณาลงชื่อเข้าใช้งาน")
        setBranchLoading(false)
        return
      }

      const response = await axios.get(process.env.NEXT_PUBLIC_API + "/branch", {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })

      console.log("API Response:", response.data)

      if (response.data && Array.isArray(response.data)) {
        setBranchs(response.data)
      } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
        setBranchs(response.data.data)
      } else {
        setBranchError("ข้อมูลที่ได้รับไม่ใช่รูปแบบที่คาดหวัง")
      }

      setBranchLoading(false)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err)
      setBranchError(`ไม่สามารถดึงข้อมูลได้: ${errorMessage}`)
      setBranchLoading(false)
    }
  }

  const clearSearch = () => {
    setSearchName("")
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
  const currentData = filteredCourse.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)
  const selectedLabel = courses.find((pos) => pos.course_name === selectedCourse)?.course_name || "เลือกหลักสูตร"

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleBranchChange = (branch_id: number) => {
    setFormData((prev) => ({ ...prev, branch_id }))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement> | React.MouseEvent, course_name: string, branch_id: number,
  ) => {
    setCourseLoading(true)
    e.preventDefault()
    try {
      await axios.post(
        process.env.NEXT_PUBLIC_API + `/course/add`,
        { course_name, branch_id },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      )
      setFormData(FormDataCourse)
      fetchCourse()
      setCourseLoading(false)
      Swal.fire({
        position: "center",
        icon: "success",
        title: "สำเร็จ!",
        text: `เพิ่มหลักสูตร ${course_name} สำเร็จ!`,
        showConfirmButton: false,
        timer: 1500,
      })
    } catch (error) {
      console.error("Error adding courses:", error)
      setCourseLoading(false)
      Swal.fire({
        position: "center",
        icon: "error",
        title: "เกิดข้อผิดพลาด!",
        text: "เกิดข้อผิดพลาดในการเพิ่มหลักสูตร",
        showConfirmButton: false,
        timer: 1500,
      })
    }
  }

  const handleDelete = async (
    e: React.FormEvent<HTMLFormElement> | React.MouseEvent,
    course_id: number,
    course_name: string,
  ) => {
    e.preventDefault()
    setCourseLoading(true)
    try {
      await axios.delete(`${process.env.NEXT_PUBLIC_API}/course/delete/${course_id}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      fetchCourse()
      setCourseLoading(false)

      Swal.fire({
        icon: "success",
        title: "ลบสำเร็จ!",
        text: `ลบสาขา ${course_name} สำเร็จ!`,
        showConfirmButton: false,
        timer: 1500,
      })
    } catch (error) {
      console.error("Error deleting course:", error)
      setCourseLoading(false)

      Swal.fire({
        icon: "error",
        title: "เกิดข้อผิดพลาด!",
        text: "เกิดข้อผิดพลาดในการลบสาขา",
        showConfirmButton: false,
        timer: 1500,
      })
    }
  }

  const handleEdit = async (
    e: React.FormEvent<HTMLFormElement> | React.MouseEvent,
    course_id: number,
    course_name: string,
    branch_id: number,
  ) => {
    e.preventDefault()
    setCourseLoading(true)
    try {
      await axios.put(
        `${process.env.NEXT_PUBLIC_API}/course/update/${course_id}`,
        { course_name, branch_id },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      )
      fetchCourse()
      setCourseLoading(false)

      Swal.fire({
        icon: "success",
        title: "แก้ไขสำเร็จ!",
        text: `แก้ไขหลักสูตร ${course_name} สำเร็จ!`,
        showConfirmButton: false,
        timer: 1500,
      })
    } catch (error) {
      console.error("Error deleting prefix:", error)
      setCourseLoading(false)

      Swal.fire({
        icon: "error",
        title: "เกิดข้อผิดพลาด!",
        text: "เกิดข้อผิดพลาดในการแก้ไขหลักสูตร",
        showConfirmButton: false,
        timer: 1500,
      })
    }
  }

  if (courseLoading || branchLoading) {
    return <SkeletonTable />
  }

  if (courseError || branchError) {
    return <div>เกิดข้อผิดพลาดในการเชื่อมต่อข้อมูล: {courseError || branchError}</div>
  }

  return (
    <div className="bg-white p-4 rounded-md shadow dark:bg-zinc-900 dark:text-gray-400 transition-all duration-300 ease-in-out ">
      <div className="py-4 md:flex">
        <div className="flex flex-wrap gap-4 w-full md:w-full">
          <div className="relative flex items-center w-full md:w-52">
            <input
              className="w-full px-4 py-2 font-light rounded-md text-sm border-2 border-gray-300 dark:border-zinc-600 text-gray-600 dark:bg-zinc-800 dark:text-gray-400 focus:outline-none focus:border-blue-500 focus:border-blue-500 transition-colors transition-all duration-300 ease-in-out"
              placeholder="ค้นหาด้วยชื่อบุคคล"
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
            />
            {searchName && (
              <button
                onClick={clearSearch}
                className="absolute right-3 text-gray-400 hover:text-red-500 transition duration-200"
              >
                <FiX className="w-4 h-4" />
              </button>
            )}
          </div>
          <SearchFilter<Course, "course_name">
            selectedLabel={selectedLabel}
            handleSelect={handleCourseSelect}
            objects={Array.isArray(courses) ? courses : []}
            valueKey="course_name"
            labelKey="course_name"
            placeholder="ค้นหาหลักสูตร"
          />
          <SearchFilter<Branch, "branch_name">
            selectedLabel={selectedBranch || "เลือกสาขา"}
            handleSelect={handleBranchSelect}
            objects={Array.isArray(branchs) ? branchs : []}
            valueKey="branch_name"
            labelKey="branch_name"
            placeholder="ค้นหาสาขา"
          />
        </div>
        <div className="w-full md:w-auto pt-4 md:pt-0">
          <label
            htmlFor={`modal-create`}
            className="w-full md:w-52 bg-success text-sm font-light text-white rounded-md py-2.5 px-4 hover:bg-success/80 transition ease-in-out duration-300 flex items-center gap-2 justify-between cursor-pointer"
          >
            เพิ่มสาขา
            <Plus className="w-4 h-4" />
          </label>
        </div>
      </div>{" "}
      <div className="border rounded-md dark:border-zinc-600 transition-all duration-300 ease-in-out">
        <div className="">
          {courseLoading && (
            <div className="absolute inset-0 bg-gray-100 bg-opacity-80 flex items-center justify-center z-50">
              <Loader className="animate-spin text-gray-600 w-12 h-12" />
            </div>
          )}
          <div className="overflow-x-auto">
            <table className="w-full overflow-x-auto md:table-auto ">
              <thead className="bg-gray-100 dark:bg-zinc-800 transition-all duration-300 ease-in-out">
                <tr>
                  <td className="p-4 text-sm text-gray-600 text-center py-4 dark:text-gray-300 text-nowrap border border-gray-300 dark:border-zinc-600 border-opacity-40">
                    #
                  </td>
                  <td className="p-4 text-sm text-gray-600 text-center py-4 dark:text-gray-300 text-nowrap border border-gray-300 dark:border-zinc-600 border-opacity-40">
                    หลักสูตร
                  </td>
                  <td className="p-4 text-sm text-gray-600 text-center py-4 dark:text-gray-300 text-nowrap border border-gray-300 dark:border-zinc-600 border-opacity-40">
                    สาขา
                  </td>
                  <td className="p-4 text-sm text-gray-600 text-center py-4 dark:text-gray-300 text-nowrap sticky right-0 bg-gray-100 dark:bg-zinc-800 transition-all duration-300 ease-in-out border border-gray-300 dark:border-zinc-600 border-opacity-40">
                    จัดการ
                  </td>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-zinc-900 divide-y divide-gray-200 dark:divide-zinc-600 transition-all duration-300 ease-in-out ">
                {currentData.map((item: Course, index) => (
                  <tr key={item.course_id} className="hover:bg-gray-50 dark:hover:bg-zinc-800">
                    <td className="p-4 whitespace-nowrap text-center text-md font-regular text-gray-600 dark:text-gray-300 border border-gray-300 dark:border-zinc-600 border-opacity-40">
                      {(currentPage - 1) * ITEMS_PER_PAGE + index + 1}
                    </td>
                    <td className="p-4 whitespace-nowrap text-start text-md font-light text-gray-500 dark:text-gray-400 border border-gray-300 dark:border-zinc-600 border-opacity-40">
                      {item?.course_name || "-"}
                    </td>
                    <td className="p-4 whitespace-nowrap text-start text-md font-light text-gray-500 dark:text-gray-400 border border-gray-300 dark:border-zinc-600 border-opacity-40">
                      {item?.branch_name || "-"}
                    </td>
                    <td className="p-4 whitespace-nowrap text-center text-md font-light flex justify-center gap-2 sticky right-0 bg-white dark:bg-zinc-900 transition-all duration-300 ease-in-out border border-gray-300 dark:border-zinc-600 border-opacity-40">
                      <label
                        htmlFor={`modal-edit${item.course_id}`}
                        className="text-yellow-500 border-none border-yellow-500 rounded-md p-1 hover:bg-yellow-500 hover:text-white transition ease-in-out duration-300 cursor-pointer"
                        onClick={() => {
                          setSelectedCourseId(item.course_id)
                          setSelectedCourseName(item.course_name)
                          setSelectedBranchId(item.branch_id)
                          setSelectedBranchName(String(item.branch_name))
                        }}
                      >
                        <Edit2 className="w-4 h-4" />
                      </label>
                      <label
                        htmlFor={`modal-delete${item.course_id}`}
                        className="text-red-500 border-none border-red-500 rounded-md p-1 hover:bg-red-500 hover:text-white transition ease-in-out duration-300 cursor-pointer"
                        onClick={() => {
                          setSelectedCourseId(item.course_id)
                          setSelectedCourseName(item.course_name)
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
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

