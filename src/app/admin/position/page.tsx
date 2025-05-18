"use client"
import type React from "react"
import { useEffect, useState } from "react"
import { Edit2, Loader, Plus, Trash2 } from "lucide-react"
import type { Position } from "@/Types"
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

interface FormDataPosition {
  position_name: string
}

const FormDataPosition: FormDataPosition = {
  position_name: "",
}

function PositionTable() {
  const [FormData, setFormData] = useState<FormDataPosition>(FormDataPosition)
  const [currentPage, setCurrentPage] = useState(1)
  const [searchName, setSearchName] = useState<string>("")
  const [selectedPosition, setSelectedPosition] = useState<string>("")
  const [positions, setPositions] = useState<Position[]>([])
  const [positionLoading, setPositionLoading] = useState(false)
  const [positionError, setPositionError] = useState<string | null>(null)
  const [selectedPositionId, setSelectedPositionId] = useState<number>(0)
  const [selectedPositionName, setSelectedPositionName] = useState<string>("")

  useEffect(() => {
    fetchPositions()
  }, [])

  const fetchPositions = async () => {
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        setPositionError("ไม่พบ token กรุณาลงชื่อเข้าใช้งาน")
        setPositionLoading(false)
        return
      }

      const response = await axios.get(process.env.NEXT_PUBLIC_API + "/position", {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })

      console.log("API Response:", response.data)

      if (response.data && Array.isArray(response.data)) {
        setPositions(response.data)
      } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
        setPositions(response.data.data)
      } else {
        setPositionError("ข้อมูลที่ได้รับไม่ใช่รูปแบบที่คาดหวัง")
      }

      setPositionLoading(false)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err)
      setPositionError(`ไม่สามารถดึงข้อมูลได้: ${errorMessage}`)
      setPositionLoading(false)
    }
  }

  const clearSearch = () => {
    setSearchName("")
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handlePositionSelect = (value: string) => {
    setSelectedPosition(value)
  }

  const filteredPosition = positions.filter((position) => {
    const fullName = `${position.position_name}`.toLowerCase()
    return (
      fullName.includes(searchName.toLowerCase()) && (selectedPosition ? position.position_name === selectedPosition : true)
    )
  })

  const totalPages = Math.ceil(filteredPosition.length / ITEMS_PER_PAGE)
  const currentData = filteredPosition.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)
  const selectedLabel = positions.find((pos) => pos.position_name === selectedPosition)?.position_name || "เลือกตำแหน่งวิชาการ"

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement> | React.MouseEvent, position_name: string) => {
    setPositionLoading(true)
    e.preventDefault()
    try {
      await axios.post(
        process.env.NEXT_PUBLIC_API + `/position/add`, { position_name },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      )
      setFormData(FormDataPosition)
      fetchPositions()
      setPositionLoading(false)
      Swal.fire({
        position: "center",
        icon: "success",
        title: "สำเร็จ!",
        text: `เพิ่มตำแหน่งวิชาการ ${position_name} สำเร็จ!`,
        showConfirmButton: false,
        timer: 1500
      });
    } catch (error) {
      console.error("Error adding prefix:", error)
      setPositionLoading(false)
      Swal.fire({
        position: "center",
        icon: "error",
        title: "เกิดข้อผิดพลาด!",
        text: "เกิดข้อผิดพลาดในการเพิ่มตำแหน่งวิชาการ",
        showConfirmButton: false,
        timer: 1500
      });
    }
  }

  const handleDelete = async (e: React.FormEvent<HTMLFormElement> | React.MouseEvent, position_id: number, position_name: string) => {
    e.preventDefault()
    setPositionLoading(true)
    try {
      await axios.delete(`${process.env.NEXT_PUBLIC_API}/position/delete/${position_id}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      fetchPositions()
      setPositionLoading(false)

      Swal.fire({
        icon: "success",
        title: "ลบสำเร็จ!",
        text: `ลบตำแหน่งวิชาการ ${position_name} สำเร็จ!`,
        showConfirmButton: false,
        timer: 1500
      })
    } catch (error) {
      console.error("Error deleting prefix:", error)
      setPositionLoading(false)

      Swal.fire({
        icon: "error",
        title: "เกิดข้อผิดพลาด!",
        text: "เกิดข้อผิดพลาดในการลบตำแหน่งวิชาการ",
        showConfirmButton: false,
        timer: 1500
      })
    }
  }

  const handleEdit = async (e: React.FormEvent<HTMLFormElement> | React.MouseEvent, position_id: number, position_name: string) => {
    e.preventDefault()
    setPositionLoading(true)
    try {
      await axios.put(`${process.env.NEXT_PUBLIC_API}/position/update/${position_id}`, { position_name }, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      fetchPositions()
      setPositionLoading(false)

      Swal.fire({
        icon: "success",
        title: "แก้ไขสำเร็จ!",
        text: `แก้ไขตำแหน่งวิชาการ ${position_name} สำเร็จ!`,
        showConfirmButton: false,
        timer: 1500
      })
    } catch (error) {
      console.error("Error deleting prefix:", error)
      setPositionLoading(false)

      Swal.fire({
        icon: "error",
        title: "เกิดข้อผิดพลาด!",
        text: "เกิดข้อผิดพลาดในการแก้ไขตำแหน่งวิชาการ",
        showConfirmButton: false,
        timer: 1500
      })
    }
  }

  if (positionLoading) {
    return <SkeletonTable />
  }

  if (positionError) {
    return <div>เกิดข้อผิดพลาดในการเชื่อมต่อข้อมูล: {positionError}</div>
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
            objects={Array.isArray(positions) ? positions : []}
            valueKey="position_name"
            labelKey="position_name"
            placeholder="ค้นหาตำแหน่งวิชาการ"
          />
        </div>
        <div className="w-full md:w-auto pt-4 md:pt-0">
          <label
            htmlFor={`modal-create`}
            className="w-full md:w-52 bg-success text-sm font-light text-white rounded-md py-2.5 px-4 hover:bg-success/80 transition ease-in-out duration-300 flex items-center gap-2 justify-between cursor-pointer"
          >
            เพิ่มตำแหน่งวิชาการ
            <Plus className="w-4 h-4" />
          </label>
        </div>
      </div>{" "}
      <div className="border rounded-md dark:border-zinc-600 transition-all duration-300 ease-in-out">
        <div className="">
          {positionLoading && (
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
                    ตำแหน่งวิชาการ
                  </td>
                  <td className="p-4 text-sm text-gray-600 text-center py-4 dark:text-gray-300 text-nowrap sticky right-0 bg-gray-100 dark:bg-zinc-800 transition-all duration-300 ease-in-out border border-gray-300 dark:border-zinc-600 border-opacity-40">
                    จัดการ
                  </td>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-zinc-900 divide-y divide-gray-200 dark:divide-zinc-600 transition-all duration-300 ease-in-out ">
                {currentData.map((item: Position, index) => (
                  <tr key={item.position_id} className="hover:bg-gray-50 dark:hover:bg-zinc-800">
                    <td className="p-4 whitespace-nowrap text-center text-md font-regular text-gray-600 dark:text-gray-300 border border-gray-300 dark:border-zinc-600 border-opacity-40">
                      {(currentPage - 1) * ITEMS_PER_PAGE + index + 1}
                    </td>
                    <td className="p-4 whitespace-nowrap text-start text-md font-light text-gray-500 dark:text-gray-400 border border-gray-300 dark:border-zinc-600 border-opacity-40">
                      {item?.position_name || "-"}
                    </td>
                    <td className="p-4 whitespace-nowrap text-center text-md font-light flex justify-center gap-2 sticky right-0 bg-white dark:bg-zinc-900 transition-all duration-300 ease-in-out border border-gray-300 dark:border-zinc-600 border-opacity-40">
                      <label
                        htmlFor={`modal-edit${item.position_id}`}
                        className="text-yellow-500 border-none border-yellow-500 rounded-md p-1 hover:bg-yellow-500 hover:text-white transition ease-in-out duration-300 cursor-pointer"
                        onClick={() => {
                          setSelectedPositionId(item.position_id)
                          setSelectedPositionName(item.position_name)
                        }}
                      >
                        <Edit2 className="w-4 h-4" />
                      </label>
                      <label
                        htmlFor={`modal-delete${item.position_id}`}
                        className="text-red-500 border-none border-red-500 rounded-md p-1 hover:bg-red-500 hover:text-white transition ease-in-out duration-300 cursor-pointer"
                        onClick={() => {
                          setSelectedPositionId(item.position_id)
                          setSelectedPositionName(item.position_name)
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
            data={filteredPosition}
            currentData={currentData}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      </div>
      <CreateModal
        isLoading={positionLoading}
        handleSubmit={handleSubmit}
        formData={FormData}
        handleInputChange={handleInputChange}
      />
      <DeleteModal
        isLoading={positionLoading}
        position_id={selectedPositionId}
        position_name={selectedPositionName}
        handleDelete={handleDelete}
      />
      <EditModal
        isLoading={positionLoading}
        position_id={selectedPositionId}
        position_name={selectedPositionName}
        handleEdit={handleEdit}
      />
    </div>
  )
}

export default PositionTable

