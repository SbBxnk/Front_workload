"use client"
import type React from "react"
import { useEffect, useState } from "react"
import { Plus, Loader, Trash2, Edit2 } from "lucide-react"
import { useRouter } from "next/navigation"
import useFetchData from "@/hooks/FetchAPI"
// components
import Pagination from "@/components/Pagination"
import SkeletonTable from "./Personal-listComponents/SkeletonTable"
import DeleteModal from "./Personal-listComponents/DeletePersonalModal"
import SearchFilter from "@/components/SearchFilter"
import { FiX } from "react-icons/fi"
import type { Position, Branch, Personal, Course, UserLevel } from "@/Types"
import Image from "next/image"
import Swal from "sweetalert2"

const positionStyles: { [key: string]: string } = {
  อาจารย์: "text-blue-500 bg-blue-500/15",
  รองศาสตราจารย์: "text-green-500 bg-green-500/15",
  ศาสตราจารย์: "text-purple-500 bg-purple-500/15",
  ผู้ช่วยศาสตราจารย์: "text-amber-500 bg-amber-500/15",
  ผู้ช่วยอาจารย์: "text-purple-500 bg-purple-500/15",
}

const ITEMS_PER_PAGE = 10

export default function PersonalList() {
  // State declarations
  const [isLoading, setIsLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [searchName, setSearchName] = useState<string>("")
  const [selectedPosition, setSelectedPosition] = useState<string>("")
  const [selectedBranch, setSelectedBranch] = useState<string>("")
  const [selectedCourse, setSelectedCourse] = useState<string>("")
  const [selectedLevel, setSelectedLevel] = useState<string>("")

  // Fetching data using custom hook
  const {
    data: personals,
    loading: personalLoading,
    error: personalError,
    setData: setPersonals,
  } = useFetchData<Personal[]>("/user")
  const { data: positions, loading: positionLoading, error: positionError } = useFetchData<Position[]>("/position")
  const { data: branchs, loading: branchLoading, error: branchError } = useFetchData<Branch[]>("/branch")
  const { data: courses, loading: courseLoading, error: courseError } = useFetchData<Course[]>("/course")
  const { data: levels, loading: levelLoading, error: levelError } = useFetchData<UserLevel[]>("/level")

  // Router
  const router = useRouter()

  useEffect(() => {
    if (personals) {
      personals.filter((personal) => {
        const fullName = `${personal.prefix_name}${personal.u_fname} ${personal.u_lname}`.toLowerCase()
        return (
          fullName.includes(searchName.toLowerCase()) &&
          (selectedPosition ? personal.position_name === selectedPosition : true) &&
          (selectedBranch ? personal.branch_name === selectedBranch : true) &&
          (selectedCourse ? personal.course_name === selectedCourse : true)
        )
      })
      setCurrentPage(1)
    }
  }, [personals, searchName, selectedPosition, selectedBranch, selectedCourse])

  // Loading and Error Handling
  if (personalLoading || positionLoading || branchLoading || courseLoading || levelLoading) {
    return <SkeletonTable />
  }

  const createPersonal = () => {
    router.push("/admin/personal-list/create-personal")
  }

  if (
    personalError ||
    !personals ||
    positionError ||
    !positions ||
    branchError ||
    !branchs ||
    courseError ||
    !courses ||
    levelError ||
    !levels
  ) {
    return (
      <div className="bg-white p-4 rounded-md shadow dark:bg-zinc-900 dark:text-gray-400 transition-all duration-300 ease-in-out">
        <div className="py-4 md:flex">
          <div className="flex flex-wrap gap-4 w-full md:w-full">
            <div className="relative flex items-center w-full md:w-52">
              <input
                className="w-full px-4 py-2 font-light rounded-md text-sm border-2 border-gray-300 dark:border-zinc-600 text-gray-600 dark:bg-zinc-800 dark:text-gray-400 focus:outline-none focus:border-blue-500 focus:border-blue-500 transition-colors transition-all duration-300 ease-in-out"
                placeholder="ค้นหาด้วยชื่อบุคคล"
                disabled
              />
            </div>
            <button
              disabled
              className="w-full md:w-52 bg-gray-300 dark:bg-zinc-700 text-sm font-light text-gray-500 dark:text-gray-400 rounded-md py-2.5 px-4 transition ease-in-out duration-300 flex items-center gap-2 justify-between"
            >
              ค้นหาตำแหน่ง
            </button>
            <button
              disabled
              className="w-full md:w-52 bg-gray-300 dark:bg-zinc-700 text-sm font-light text-gray-500 dark:text-gray-400 rounded-md py-2.5 px-4 transition ease-in-out duration-300 flex items-center gap-2 justify-between"
            >
              ค้นหาสาขา
            </button>
            <button
              disabled
              className="w-full md:w-52 bg-gray-300 dark:bg-zinc-700 text-sm font-light text-gray-500 dark:text-gray-400 rounded-md py-2.5 px-4 transition ease-in-out duration-300 flex items-center gap-2 justify-between"
            >
              ค้นหาหลักสูตร
            </button>
          </div>
          <div className="w-full md:w-auto pt-4 md:pt-0">
            <button
              onClick={createPersonal}
              className="w-full md:w-52 bg-success text-sm font-light text-white rounded-md py-2.5 px-4 hover:bg-success/80 transition ease-in-out duration-300 flex items-center gap-2 justify-between"
            >
              เพิ่มบุคลากร
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>
        <div className="border rounded-md dark:border-zinc-600 transition-all duration-300 ease-in-out">
          <div className="overflow-x-auto">
            <table className="w-full overflow-x-auto md:table-auto">
              <thead className="bg-gray-100 dark:bg-zinc-800 transition-all duration-300 ease-in-out">
                <tr>
                  <td className="p-4 text-sm text-gray-600 text-center py-4 dark:text-gray-300 text-nowrap border border-gray-300 dark:border-zinc-600 border-opacity-40">
                    #
                  </td>
                  <td className="p-4 text-sm text-gray-600 text-center py-4 dark:text-gray-300 text-nowrap border border-gray-300 dark:border-zinc-600 border-opacity-40">
                    รูปภาพ
                  </td>
                  <td className="p-4 text-sm text-gray-600 text-center py-4 dark:text-gray-300 text-nowrap border border-gray-300 dark:border-zinc-600 border-opacity-40">
                    ชื่อ
                  </td>
                  <td className="p-4 text-sm text-gray-600 text-center py-4 dark:text-gray-300 text-nowrap border border-gray-300 dark:border-zinc-600 border-opacity-40">
                    ตำแหน่งวิชาการ
                  </td>
                  <td className="p-4 text-sm text-gray-600 text-center py-4 dark:text-gray-300 text-nowrap border border-gray-300 dark:border-zinc-600 border-opacity-40">
                    ตำแหน่งบริหาร
                  </td>
                  <td className="p-4 text-sm text-gray-600 text-center py-4 dark:text-gray-300 text-nowrap border border-gray-300 dark:border-zinc-600 border-opacity-40">
                    เลขประจำตำแหน่ง
                  </td>
                  <td className="p-4 text-sm text-gray-600 text-center py-4 dark:text-gray-300 text-nowrap border border-gray-300 dark:border-zinc-600 border-opacity-40">
                    จัดการ
                  </td>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-zinc-900 divide-y divide-gray-200 dark:divide-zinc-600 transition-all duration-300 ease-in-out">
                <tr>
                  <td colSpan={7} className="p-4 text-center text-md font-light text-gray-500 dark:text-gray-400">
                    ไม่พบข้อมูลผู้ถูกประเมิน
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    )
  }

  // Handling Page Change
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  // Filter personals based on selected values
  const filteredPersonals = personals.filter((personal) => {
    const fullName = `${personal.prefix_name}${personal.u_fname} ${personal.u_lname}`.toLowerCase()
    return (
      fullName.includes(searchName.toLowerCase()) &&
      (selectedPosition ? personal.position_name === selectedPosition : true) &&
      (selectedBranch ? personal.branch_name === selectedBranch : true) &&
      (selectedCourse ? personal.course_name === selectedCourse : true) &&
      (selectedLevel ? personal.level_name === selectedLevel : true)
    )
  })

  // Pagination logic
  const totalPages = Math.ceil(filteredPersonals.length / ITEMS_PER_PAGE)
  const currentData = filteredPersonals.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)

  // Default label for position select
  const selectedLabel =
    positions.find((pos) => pos.position_name === selectedPosition)?.position_name || "เลือกตำแหน่งวิชาการ"

  // Clear search input
  const clearSearch = () => {
    setSearchName("")
  }

  // Select handlers
  const handlePositionSelect = (value: string) => {
    setSelectedPosition(value)
  }

  const handleBranchSelect = (value: string) => {
    setSelectedBranch(value)
  }

  const handleCourseSelect = (value: string) => {
    setSelectedCourse(value)
  }

  const handleLevelSelect = (value: string) => {
    setSelectedLevel(value)
  }


  // Delete personal
  const handleDeletePost = (e: React.MouseEvent, prefix: string, u_fname: string, u_lname: string, u_id: number) => {
    const filteredPosts = personals.filter((post) => post.u_id !== u_id)
    e.preventDefault()
    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
      setPersonals(filteredPosts)
      setCurrentPage(1)
      Swal.fire({
        icon: "success",
        title: "ลบสำเร็จ!",
        text: `ลบบุคคล ${u_fname} ${u_lname} สำเร็จ!`,
        showConfirmButton: false,
        timer: 1500,
      })
    }, 1000)
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
          <SearchFilter<Position, "position_name">
            selectedLabel={selectedLabel}
            handleSelect={handlePositionSelect}
            objects={positions}
            valueKey="position_name"
            labelKey="position_name"
            placeholder="ค้นหาตำแหน่ง"
          />
          <SearchFilter<Branch, "branch_name">
            selectedLabel={selectedBranch}
            handleSelect={handleBranchSelect}
            objects={branchs}
            valueKey="branch_name"
            labelKey="branch_name"
            placeholder="ค้นหาสาขา"
          />
          <SearchFilter<Course, "course_name">
            selectedLabel={selectedCourse}
            handleSelect={handleCourseSelect}
            objects={courses}
            valueKey="course_name"
            labelKey="course_name"
            placeholder="ค้นหาหลักสูตร"
          />
          <SearchFilter<UserLevel, "level_name">
            selectedLabel={selectedLevel}
            handleSelect={handleLevelSelect}
            objects={levels}
            valueKey="level_name"
            labelKey="level_name"
            placeholder="ค้นหาระดับผู้ใช้งาน"
          />
        </div>
        <div className="w-full md:w-auto pt-4 md:pt-0">
          <button
            onClick={createPersonal}
            className="w-full md:w-52 bg-success text-sm font-light text-white rounded-md py-2.5 px-4 hover:bg-success/80 transition ease-in-out duration-300 flex items-center gap-2 justify-between"
          >
            เพิ่มบุคลากร
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>
      <div className="border rounded-md dark:border-zinc-600 transition-all duration-300 ease-in-out">
        <div className="">
          {isLoading && (
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
                    รูปภาพ
                  </td>
                  <td className="p-4 text-sm text-gray-600 text-center py-4 dark:text-gray-300 text-nowrap border border-gray-300 dark:border-zinc-600 border-opacity-40">
                    ชื่อ
                  </td>
                  <td className="p-4 text-sm text-gray-600 text-center py-4 dark:text-gray-300 text-nowrap border border-gray-300 dark:border-zinc-600 border-opacity-40">
                    ตำแหน่งวิชาการ
                  </td>
                  <td className="p-4 text-sm text-gray-600 text-center py-4 dark:text-gray-300 text-nowrap border border-gray-300 dark:border-zinc-600 border-opacity-40">
                    ตำแหน่งบริหาร
                  </td>
                  <td className="p-4 text-sm text-gray-600 text-center py-4 dark:text-gray-300 text-nowrap border border-gray-300 dark:border-zinc-600 border-opacity-40">
                    เลขประจำตำแหน่ง
                  </td>
                  <td className="p-4 text-sm text-gray-600 text-center py-4 dark:text-gray-300 text-nowrap border border-gray-300 dark:border-zinc-600 border-opacity-40">
                    อีเมล
                  </td>
                  <td className="p-4 text-sm text-gray-600 text-center py-4 dark:text-gray-300 text-nowrap border border-gray-300 dark:border-zinc-600 border-opacity-40">
                    เบอร์ติดต่อ
                  </td>
                  <td className="p-4 text-sm text-gray-600 text-center py-4 dark:text-gray-300 text-nowrap border border-gray-300 dark:border-zinc-600 border-opacity-40">
                    อายุ
                  </td>
                  <td className="p-4 text-sm text-gray-600 text-center py-4 dark:text-gray-300 text-nowrap border border-gray-300 dark:border-zinc-600 border-opacity-40">
                    เพศ
                  </td>
                  <td className="p-4 text-sm text-gray-600 text-center py-4 dark:text-gray-300 text-nowrap border border-gray-300 dark:border-zinc-600 border-opacity-40">
                    เงินเดือน
                  </td>
                  <td className="p-4 text-sm text-gray-600 text-center py-4 dark:text-gray-300 text-nowrap border border-gray-300 dark:border-zinc-600 border-opacity-40">
                    สาขา
                  </td>
                  <td className="p-4 text-sm text-gray-600 text-center py-4 dark:text-gray-300 text-nowrap border border-gray-300 dark:border-zinc-600 border-opacity-40">
                    หลักสูตร
                  </td>
                  <td className="p-4 text-sm text-gray-600 text-center py-4 dark:text-gray-300 text-nowrap sticky right-0 bg-gray-100 dark:bg-zinc-800 transition-all duration-300 ease-in-out border border-gray-300 dark:border-zinc-600 border-opacity-40">
                    จัดการ
                  </td>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-zinc-900 divide-y divide-gray-200 dark:divide-zinc-600 transition-all duration-300 ease-in-out ">
                {currentData.length > 0 ? (
                  currentData.map((item, index) => (
                    <tr key={index} className="hover:bg-gray-50 dark:hover:bg-zinc-800">
                      <td className="p-4 whitespace-nowrap text-center text-md font-regular text-gray-600 dark:text-gray-300 border border-gray-300 dark:border-zinc-600 border-opacity-40">
                        {index + 1 + (currentPage - 1) * ITEMS_PER_PAGE}
                      </td>
                      <td>
                        <div className="flex justify-center">
                          <Image
                            src={`/images/${item?.u_img || "default.png"}`}
                            alt="User Image"
                            width={40}
                            height={40}
                            className="rounded-full object-cover border-2"
                            style={{ width: "40px", height: "40px", objectFit: "cover", borderRadius: "50%" }}
                          />
                        </div>
                      </td>
                      <td className="p-4 whitespace-nowrap text-start text-md font-light text-gray-500 dark:text-gray-400 border border-gray-300 dark:border-zinc-600 border-opacity-40">
                        {item?.prefix_name || "-"}
                        {item?.u_fname || "-"} {item?.u_lname || "-"}
                      </td>
                      <td className="p-4 whitespace-nowrap text-start text-md font-light text-gray-500 dark:text-gray-400 border border-gray-300 dark:border-zinc-600 border-opacity-40">
                        <p
                          className={`inline-block rounded-md ${positionStyles[item.position_name] || "text-white bg-gray-600"} px-2 py-0.5 font-light text-sm`}
                        >
                          {item?.position_name || "-"}
                        </p>
                      </td>

                      <td className="p-4 whitespace-nowrap text-start text-md font-light text-gray-500 dark:text-gray-400 border border-gray-300 dark:border-zinc-600 border-opacity-40">
                        {item?.ex_position_name || "-"}
                      </td>
                      <td className="p-4 whitespace-nowrap text-center text-md font-light text-gray-500 dark:text-gray-400 border border-gray-300 dark:border-zinc-600 border-opacity-40">
                        {item?.u_id_card || "-"}
                      </td>
                      <td className="p-4 whitespace-nowrap text-start text-md font-light text-gray-500 dark:text-gray-400 border border-gray-300 dark:border-zinc-600 border-opacity-40">
                        {item?.u_email || "-"}
                      </td>
                      <td className="p-4 whitespace-nowrap text-center text-md font-light text-gray-500 dark:text-gray-400 border border-gray-300 dark:border-zinc-600 border-opacity-40">
                        {item?.u_tel || "-"}
                      </td>
                      <td className="p-4 whitespace-nowrap text-center text-md font-light text-gray-500 dark:text-gray-400 border border-gray-300 dark:border-zinc-600 border-opacity-40">
                        {item?.age || "-"}
                      </td>
                      <td className="p-4 whitespace-nowrap text-start text-md font-light text-gray-500 dark:text-gray-400 border border-gray-300 dark:border-zinc-600 border-opacity-40">
                        {item?.gender || "-"}
                      </td>
                      <td className="p-4 whitespace-nowrap text-center text-md font-light text-gray-500 dark:text-gray-400 border border-gray-300 dark:border-zinc-600 border-opacity-40">
                        {item?.salary || "-"}
                      </td>
                      <td className="p-4 whitespace-nowrap text-start text-md font-light text-gray-500 dark:text-gray-400 border border-gray-300 dark:border-zinc-600 border-opacity-40">
                        {item?.branch_name || "-"}
                      </td>
                      <td className="p-4 whitespace-nowrap text-start text-md font-light text-gray-500 dark:text-gray-400 border border-gray-300 dark:border-zinc-600 border-opacity-40">
                        {item?.course_name || "-"}
                      </td>
                      <td className="p-4 whitespace-nowrap text-center text-md font-light flex justify-center gap-2 sticky right-0 bg-white dark:bg-zinc-900 transition-all duration-300 ease-in-out">
                        <button className="text-yellow-500 border-none border-yellow-500 rounded-md p-1 hover:bg-yellow-500 hover:text-white transition ease-in-out duration-300">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <label
                          htmlFor={`modal-delete${item.u_id}`}
                          className="text-red-500 border-none border-red-500 rounded-md p-1 hover:bg-red-500 hover:text-white transition ease-in-out duration-300 cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </label>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={14} className="p-4 text-center text-md font-light text-gray-500 dark:text-gray-400">
                      ไม่พบข้อมูลผู้ถูกประเมิน
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="px-4">
          <Pagination
            ITEMS_PER_PAGE={ITEMS_PER_PAGE}
            data={filteredPersonals}
            currentData={currentData}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      </div>
      <DeleteModal currentData={currentData} handleDeletePost={handleDeletePost} isLoading={isLoading} />
    </div>
  )
}
