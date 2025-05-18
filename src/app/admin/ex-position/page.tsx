"use client"
import type React from "react"
import { useEffect, useState } from "react"
import { Edit2, Loader, Plus, Trash2 } from "lucide-react"
import type { ExPosition } from "@/Types"
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

interface FormDataExPosition {
  ex_position_name: string
}

const FormDataExPosition: FormDataExPosition = {
  ex_position_name: "",
}

function PositionTable() {
  const [FormData, setFormData] = useState<FormDataExPosition>(FormDataExPosition)
  const [currentPage, setCurrentPage] = useState(1)
  const [searchName, setSearchName] = useState<string>("")
  const [selectedExPosition, setSelectedExPosition] = useState<string>("")
  const [expositions, setExPositions] = useState<ExPosition[]>([])
  const [expositionLoading, setExPositionLoading] = useState(false)
  const [expositionError, setExPositionError] = useState<string | null>(null)
  const [selectedExPositionId, setSelectedExPositionId] = useState<number>(0)
  const [selectedExPositionName, setSelectedExPositionName] = useState<string>("")

  useEffect(() => {
    fetchExPositions()
  }, [])

  const fetchExPositions = async () => {
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        setExPositionError("ไม่พบ token กรุณาลงชื่อเข้าใช้งาน")
        setExPositionLoading(false)
        return
      }

      const response = await axios.get(process.env.NEXT_PUBLIC_API + "/ex_position", {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })

      console.log("API Response:", response.data)

      if (response.data && Array.isArray(response.data)) {
        setExPositions(response.data)
      } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
        setExPositions(response.data.data)
      } else {
        setExPositionError("ข้อมูลที่ได้รับไม่ใช่รูปแบบที่คาดหวัง")
      }

      setExPositionLoading(false)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err)
      setExPositionError(`ไม่สามารถดึงข้อมูลได้: ${errorMessage}`)
      setExPositionLoading(false)
    }
  }

  const clearSearch = () => {
    setSearchName("")
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handleExPositionSelect = (value: string) => {
    setSelectedExPosition(value)
  }

  const filteredExPosition = expositions.filter((exposition) => {
    const fullName = `${exposition.ex_position_name}`.toLowerCase()
    return (
      fullName.includes(searchName.toLowerCase()) && (selectedExPosition ? exposition.ex_position_name === selectedExPosition : true)
    )
  })

  const totalPages = Math.ceil(filteredExPosition.length / ITEMS_PER_PAGE)
  const currentData = filteredExPosition.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)
  const selectedLabel = expositions.find((pos) => pos.ex_position_name === selectedExPosition)?.ex_position_name || "เลือกตำแหน่งบริหาร"

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement> | React.MouseEvent, ex_position_name: string) => {
    setExPositionLoading(true)
    e.preventDefault()
    try {
      await axios.post(
        process.env.NEXT_PUBLIC_API + `/ex_position/add`, { ex_position_name },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      )
      setFormData(FormDataExPosition)
      fetchExPositions()
      setExPositionLoading(false)
      Swal.fire({
        position: "center",
        icon: "success",
        title: "สำเร็จ!",
        text: `เพิ่มตำแหน่งบริหาร ${ex_position_name} สำเร็จ!`,
        showConfirmButton: false,
        timer: 1500
      });
    } catch (error) {
      console.error("Error adding prefix:", error)
      setExPositionLoading(false)
      Swal.fire({
        position: "center",
        icon: "error",
        title: "เกิดข้อผิดพลาด!",
        text: "เกิดข้อผิดพลาดในการเพิ่มตำแหน่งบริหาร",
        showConfirmButton: false,
        timer: 1500
      });
    }
  }

  const handleDelete = async (e: React.FormEvent<HTMLFormElement> | React.MouseEvent, ex_position_id: number, ex_position_name: string) => {
    e.preventDefault()
    setExPositionLoading(true)
    try {
      await axios.delete(`${process.env.NEXT_PUBLIC_API}/ex_position/delete/${ex_position_id}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      fetchExPositions()
      setExPositionLoading(false)

      Swal.fire({
        icon: "success",
        title: "ลบสำเร็จ!",
        text: `ลบตำแหน่งบริหาร ${ex_position_name} สำเร็จ!`,
        showConfirmButton: false,
        timer: 1500
      })
    } catch (error) {
      console.error("Error deleting prefix:", error)
      setExPositionLoading(false)

      Swal.fire({
        icon: "error",
        title: "เกิดข้อผิดพลาด!",
        text: "เกิดข้อผิดพลาดในการลบตำแหน่งบริหาร",
        showConfirmButton: false,
        timer: 1500
      })
    }
  }

  const handleEdit = async (e: React.FormEvent<HTMLFormElement> | React.MouseEvent, ex_position_id: number, ex_position_name: string) => {
    e.preventDefault()
    setExPositionLoading(true)
    try {
      await axios.put(`${process.env.NEXT_PUBLIC_API}/ex_position/update/${ex_position_id}`, { ex_position_name }, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      fetchExPositions()
      setExPositionLoading(false)

      Swal.fire({
        icon: "success",
        title: "แก้ไขสำเร็จ!",
        text: `แก้ไขตำแหน่งวิชาการ ${ex_position_name} สำเร็จ!`,
        showConfirmButton: false,
        timer: 1500
      })
    } catch (error) {
      console.error("Error deleting prefix:", error)
      setExPositionLoading(false)

      Swal.fire({
        icon: "error",
        title: "เกิดข้อผิดพลาด!",
        text: "เกิดข้อผิดพลาดในการแก้ไขตำแหน่งวิชาการ",
        showConfirmButton: false,
        timer: 1500
      })
    }
  }

  if (expositionLoading) {
    return <SkeletonTable />
  }

  if (expositionError) {
    return <div>เกิดข้อผิดพลาดในการเชื่อมต่อข้อมูล: {expositionError}</div>
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
          <SearchFilter<ExPosition, "ex_position_name">
            selectedLabel={selectedLabel}
            handleSelect={handleExPositionSelect}
            objects={Array.isArray(expositions) ? expositions : []}
            valueKey="ex_position_name"
            labelKey="ex_position_name"
            placeholder="ค้นหาตำแหน่งบริหาร"
          />
        </div>
        <div className="w-full md:w-auto pt-4 md:pt-0">
          <label
            htmlFor={`modal-create`}
            className="w-full md:w-52 bg-success text-sm font-light text-white rounded-md py-2.5 px-4 hover:bg-success/80 transition ease-in-out duration-300 flex items-center gap-2 justify-between cursor-pointer"
          >
            เพิ่มตำแหน่งบริหาร
            <Plus className="w-4 h-4" />
          </label>
        </div>
      </div>{" "}
      <div className="border rounded-md dark:border-zinc-600 transition-all duration-300 ease-in-out">
        <div className="">
          {expositionLoading && (
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
                    ตำแหน่งบริหาร
                  </td>
                  <td className="p-4 text-sm text-gray-600 text-center py-4 dark:text-gray-300 text-nowrap sticky right-0 bg-gray-100 dark:bg-zinc-800 transition-all duration-300 ease-in-out border border-gray-300 dark:border-zinc-600 border-opacity-40">
                    จัดการ
                  </td>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-zinc-900 divide-y divide-gray-200 dark:divide-zinc-600 transition-all duration-300 ease-in-out ">
                {currentData.map((item: ExPosition, index) => (
                  <tr key={item.ex_position_id} className="hover:bg-gray-50 dark:hover:bg-zinc-800">
                    <td className="p-4 whitespace-nowrap text-center text-md font-regular text-gray-600 dark:text-gray-300 border border-gray-300 dark:border-zinc-600 border-opacity-40">
                      {(currentPage - 1) * ITEMS_PER_PAGE + index + 1}
                    </td>
                    <td className="p-4 whitespace-nowrap text-start text-md font-light text-gray-500 dark:text-gray-400 border border-gray-300 dark:border-zinc-600 border-opacity-40">
                      {item?.ex_position_name || "-"}
                    </td>
                    <td className="p-4 whitespace-nowrap text-center text-md font-light flex justify-center gap-2 sticky right-0 bg-white dark:bg-zinc-900 transition-all duration-300 ease-in-out border border-gray-300 dark:border-zinc-600 border-opacity-40">
                      <label
                        htmlFor={`modal-edit${item.ex_position_id}`}
                        className="text-yellow-500 border-none border-yellow-500 rounded-md p-1 hover:bg-yellow-500 hover:text-white transition ease-in-out duration-300 cursor-pointer"
                        onClick={() => {
                          setSelectedExPositionId(item.ex_position_id)
                          setSelectedExPositionName(item.ex_position_name)
                        }}
                      >
                        <Edit2 className="w-4 h-4" />
                      </label>
                      <label
                        htmlFor={`modal-delete${item.ex_position_id}`}
                        className="text-red-500 border-none border-red-500 rounded-md p-1 hover:bg-red-500 hover:text-white transition ease-in-out duration-300 cursor-pointer"
                        onClick={() => {
                          setSelectedExPositionId(item.ex_position_id)
                          setSelectedExPositionName(item.ex_position_name)
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
            data={filteredExPosition}
            currentData={currentData}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      </div>
      <CreateModal
        isLoading={expositionLoading}
        handleSubmit={handleSubmit}
        formData={FormData}
        handleInputChange={handleInputChange}
      />
      <DeleteModal
        isLoading={expositionLoading}
        ex_position_id={selectedExPositionId}
        ex_position_name={selectedExPositionName}
        handleDelete={handleDelete}
      />
      <EditModal
        isLoading={expositionLoading}
        ex_position_id={selectedExPositionId}
        ex_position_name={selectedExPositionName}
        handleEdit={handleEdit}
      />
    </div>
  )
}

export default PositionTable

