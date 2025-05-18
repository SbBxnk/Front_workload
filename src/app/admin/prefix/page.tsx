"use client"
import type React from "react"
import { useEffect, useState } from "react"
import { Edit2, Loader, Plus, Trash2 } from "lucide-react"
import type { Prefix } from "@/Types"
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

interface FormDataPrefix {
  prefix_name: string
}

const FormDataPrefix: FormDataPrefix = {
  prefix_name: "",
}

function PrefixTable() {
  const [FormData, setFormData] = useState<FormDataPrefix>(FormDataPrefix)
  const [currentPage, setCurrentPage] = useState(1)
  const [searchName, setSearchName] = useState<string>("")
  const [selectedPrefix, setSelectedPrefix] = useState<string>("")
  const [prefixes, setPrefixes] = useState<Prefix[]>([])
  const [prefixLoading, setPrefixLoading] = useState(false)
  const [prefixError, setPrefixError] = useState<string | null>(null)
  const [selectedPrefixId, setSelectedPrefixId] = useState<number>(0)
  const [selectedPrefixName, setSelectedPrefixName] = useState<string>("")

  useEffect(() => {
    fetchPrefixes()
  }, [])

  const fetchPrefixes = async () => {
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        setPrefixError("ไม่พบ token กรุณาลงชื่อเข้าใช้งาน")
        setPrefixLoading(false)
        return
      }

      const response = await axios.get(process.env.NEXT_PUBLIC_API + "/prefix", {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })

      console.log("API Response:", response.data)

      if (response.data && Array.isArray(response.data)) {
        setPrefixes(response.data)
      } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
        setPrefixes(response.data.data)
      } else {
        setPrefixError("ข้อมูลที่ได้รับไม่ใช่รูปแบบที่คาดหวัง")
      }

      setPrefixLoading(false)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err)
      setPrefixError(`ไม่สามารถดึงข้อมูลได้: ${errorMessage}`)
      setPrefixLoading(false)
    }
  }

  const clearSearch = () => {
    setSearchName("")
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handlePrefixSelect = (value: string) => {
    setSelectedPrefix(value)
  }

  const filteredPrefixs = prefixes.filter((prefix) => {
    const fullName = `${prefix.prefix_name}`.toLowerCase()
    return (
      fullName.includes(searchName.toLowerCase()) && (selectedPrefix ? prefix.prefix_name === selectedPrefix : true)
    )
  })

  const totalPages = Math.ceil(filteredPrefixs.length / ITEMS_PER_PAGE)
  const currentData = filteredPrefixs.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)
  const selectedLabel = prefixes.find((pos) => pos.prefix_name === selectedPrefix)?.prefix_name || "เลือกคำนำหน้า"

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement> | React.MouseEvent, prefix_name: string) => {
    setPrefixLoading(true)
    e.preventDefault()
    try {
      await axios.post(
        process.env.NEXT_PUBLIC_API + `/prefix/add`,{ prefix_name },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      )
      setFormData(FormDataPrefix)
      fetchPrefixes()
      setPrefixLoading(false)
      Swal.fire({
        position: "center",
        icon: "success",
        title: "สำเร็จ!",
        text: `เพิ่มคำนำหน้า ${prefix_name} สำเร็จ!`,
        showConfirmButton: false,
        timer: 1500
      });
    } catch (error) {
      console.error("Error adding prefix:", error)
      setPrefixLoading(false)
      Swal.fire({
        position: "center",
        icon: "error",
        title: "เกิดข้อผิดพลาด!",
        text: "เกิดข้อผิดพลาดในการเพิ่มคำนำหน้า",
        showConfirmButton: false,
        timer: 1500
      });
    }
  }

  const handleDelete = async (e: React.FormEvent<HTMLFormElement> | React.MouseEvent, prefix_id: number, prefix_name: string) => {
    e.preventDefault()
    setPrefixLoading(true)
    try {
      await axios.delete(`${process.env.NEXT_PUBLIC_API}/prefix/delete/${prefix_id}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      fetchPrefixes()
      setPrefixLoading(false)

      Swal.fire({
        icon: "success",
        title: "ลบสำเร็จ!",
        text: `ลบคำนำหน้า ${prefix_name} สำเร็จ!`,
        showConfirmButton: false,
        timer: 1500
      })
    } catch (error) {
      console.error("Error deleting prefix:", error)
      setPrefixLoading(false)

      Swal.fire({
        icon: "error",
        title: "เกิดข้อผิดพลาด!",
        text: "เกิดข้อผิดพลาดในการลบคำนำหน้า",
        showConfirmButton: false,
        timer: 1500
      })
    }
  }

  const handleEdit = async (e: React.FormEvent<HTMLFormElement> | React.MouseEvent, prefix_id: number, prefix_name: string) => {
    e.preventDefault()
    setPrefixLoading(true)
    try {
      await axios.put(`${process.env.NEXT_PUBLIC_API}/prefix/update/${prefix_id}`,{ prefix_name }, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      fetchPrefixes()
      setPrefixLoading(false)

      Swal.fire({
        icon: "success",
        title: "แก้ไขสำเร็จ!",
        text: `แก้ไขคำนำหน้า ${prefix_name} สำเร็จ!`,
        showConfirmButton: false,
        timer: 1500
      })
    } catch (error) {
      console.error("Error deleting prefix:", error)
      setPrefixLoading(false)

      Swal.fire({
        icon: "error",
        title: "เกิดข้อผิดพลาด!",
        text: "เกิดข้อผิดพลาดในการแก้ไขคำนำหน้า",
        showConfirmButton: false,
        timer: 1500
      })
    }
  }

  if (prefixLoading) {
    return <SkeletonTable />
  }

  if (prefixError) {
    return <div>เกิดข้อผิดพลาดในการเชื่อมต่อข้อมูล: {prefixError}</div>
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
          <SearchFilter<Prefix, "prefix_name">
            selectedLabel={selectedLabel}
            handleSelect={handlePrefixSelect}
            objects={Array.isArray(prefixes) ? prefixes : []}
            valueKey="prefix_name"
            labelKey="prefix_name"
            placeholder="ค้นหาคำนำหน้า"
          />
        </div>
        <div className="w-full md:w-auto pt-4 md:pt-0">
          <label
            htmlFor={`modal-create`}
            className="w-full md:w-52 bg-success text-sm font-light text-white rounded-md py-2.5 px-4 hover:bg-success/80 transition ease-in-out duration-300 flex items-center gap-2 justify-between cursor-pointer"
          >
            เพิ่มคำนำหน้า
            <Plus className="w-4 h-4" />
          </label>
        </div>
      </div>{" "}
      <div className="border rounded-md dark:border-zinc-600 transition-all duration-300 ease-in-out">
        <div className="">
          {prefixLoading && (
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
                    คำนำหน้า
                  </td>
                  <td className="p-4 text-sm text-gray-600 text-center py-4 dark:text-gray-300 text-nowrap sticky right-0 bg-gray-100 dark:bg-zinc-800 transition-all duration-300 ease-in-out border border-gray-300 dark:border-zinc-600 border-opacity-40">
                    จัดการ
                  </td>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-zinc-900 divide-y divide-gray-200 dark:divide-zinc-600 transition-all duration-300 ease-in-out ">
                {currentData.map((item: Prefix, index) => (
                  <tr key={item.prefix_id} className="hover:bg-gray-50 dark:hover:bg-zinc-800">
                    <td className="p-4 whitespace-nowrap text-center text-md font-regular text-gray-600 dark:text-gray-300 border border-gray-300 dark:border-zinc-600 border-opacity-40">
                      {(currentPage - 1) * ITEMS_PER_PAGE + index + 1}
                    </td>
                    <td className="p-4 whitespace-nowrap text-start text-md font-light text-gray-500 dark:text-gray-400 border border-gray-300 dark:border-zinc-600 border-opacity-40">
                      {item?.prefix_name || "-"}
                    </td>
                    <td className="p-4 whitespace-nowrap text-center text-md font-light flex justify-center gap-2 sticky right-0 bg-white dark:bg-zinc-900 transition-all duration-300 ease-in-out border border-gray-300 dark:border-zinc-600 border-opacity-40">
                      <label
                        htmlFor={`modal-edit${item.prefix_id}`}
                        className="text-yellow-500 border-none border-yellow-500 rounded-md p-1 hover:bg-yellow-500 hover:text-white transition ease-in-out duration-300 cursor-pointer"
                        onClick={() => {
                          setSelectedPrefixId(item.prefix_id)
                          setSelectedPrefixName(item.prefix_name)
                        }}
                      >
                        <Edit2 className="w-4 h-4" />
                      </label>
                      <label
                        htmlFor={`modal-delete${item.prefix_id}`}
                        className="text-red-500 border-none border-red-500 rounded-md p-1 hover:bg-red-500 hover:text-white transition ease-in-out duration-300 cursor-pointer"
                        onClick={() => {
                          setSelectedPrefixId(item.prefix_id)
                          setSelectedPrefixName(item.prefix_name)
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
          data={filteredPrefixs}
          currentData={currentData}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          />
          </div>
      </div>
      <CreateModal
        isLoading={prefixLoading}
        handleSubmit={handleSubmit}
        formData={FormData}
        handleInputChange={handleInputChange}
      />
      <DeleteModal
        isLoading={prefixLoading}
        prefix_id={selectedPrefixId}
        prefix_name={selectedPrefixName}
        handleDelete={handleDelete}
      />
      <EditModal
        isLoading={prefixLoading}
        prefix_id={selectedPrefixId}
        prefix_name={selectedPrefixName}
        handleEdit={handleEdit}
      />
    </div>
  )
}

export default PrefixTable

