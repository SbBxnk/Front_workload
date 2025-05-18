"use client"
import type React from "react"
import { useEffect, useState } from "react"
import { Edit2, Loader, Plus, Trash2 } from "lucide-react"
import type { Branch } from "@/Types"
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

interface FormDataBranch {
  branch_name: string
}

const FormDataBranch: FormDataBranch = {
  branch_name: "",
}

function PositionTable() {
  const [FormData, setFormData] = useState<FormDataBranch>(FormDataBranch)
  const [currentPage, setCurrentPage] = useState(1)
  const [searchName, setSearchName] = useState<string>("")
  const [selectedBranch, setSelectedBranch] = useState<string>("")
  const [branchs, setBranchs] = useState<Branch[]>([])
  const [branchLoading, setBranchLoading] = useState(false)
  const [branchError, setBranchError] = useState<string | null>(null)
  const [selectedBranchId, setSelectedBranchId] = useState<number>(0)
  const [selectedBranchName, setSelectedBranchName] = useState<string>("")

  useEffect(() => {
    fetchBranch()
  }, [])

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

  const handleBranchSelect = (value: string) => {
    setSelectedBranch(value)
  }

  const filteredBranch = branchs.filter((branch) => {
    const fullName = `${branch.branch_name}`.toLowerCase()
    return (
      fullName.includes(searchName.toLowerCase()) && (selectedBranch ? branch.branch_name === selectedBranch : true)
    )
  })

  const totalPages = Math.ceil(filteredBranch.length / ITEMS_PER_PAGE)
  const currentData = filteredBranch.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)
  const selectedLabel = branchs.find((pos) => pos.branch_name === selectedBranch)?.branch_name || "เลือกสาขา"

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement> | React.MouseEvent, branch_name: string) => {
    setBranchLoading(true)
    e.preventDefault()
    try {
      await axios.post(
        process.env.NEXT_PUBLIC_API + `/branch/add`, { branch_name },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      )
      setFormData(FormDataBranch)
      fetchBranch()
      setBranchLoading(false)
      Swal.fire({
        position: "center",
        icon: "success",
        title: "สำเร็จ!",
        text: `เพิ่มสาขา ${branch_name} สำเร็จ!`,
        showConfirmButton: false,
        timer: 1500
      });
    } catch (error) {
      console.error("Error adding branchs:", error)
      setBranchLoading(false)
      Swal.fire({
        position: "center",
        icon: "error",
        title: "เกิดข้อผิดพลาด!",
        text: "เกิดข้อผิดพลาดในการเพิ่มสาขา",
        showConfirmButton: false,
        timer: 1500
      });
    }
  }

  const handleDelete = async (e: React.FormEvent<HTMLFormElement> | React.MouseEvent, branch_id: number, branch_name: string) => {
    e.preventDefault()
    setBranchLoading(true)
    try {
      await axios.delete(`${process.env.NEXT_PUBLIC_API}/branch/delete/${branch_id}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      fetchBranch()
      setBranchLoading(false)

      Swal.fire({
        icon: "success",
        title: "ลบสำเร็จ!",
        text: `ลบสาขา ${branch_name} สำเร็จ!`,
        showConfirmButton: false,
        timer: 1500
      })
    } catch (error) {
      console.error("Error deleting prefix:", error)
      setBranchLoading(false)

      Swal.fire({
        icon: "error",
        title: "เกิดข้อผิดพลาด!",
        text: "เกิดข้อผิดพลาดในการลบสาขา",
        showConfirmButton: false,
        timer: 1500
      })
    }
  }

  const handleEdit = async (e: React.FormEvent<HTMLFormElement> | React.MouseEvent, branch_id: number, branch_name: string) => {
    e.preventDefault()
    setBranchLoading(true)
    try {
      await axios.put(`${process.env.NEXT_PUBLIC_API}/branch/update/${branch_id}`, { branch_name }, {
      })
      fetchBranch()
      setBranchLoading(false)

      Swal.fire({
        icon: "success",
        title: "แก้ไขสำเร็จ!",
        text: `แก้ไขตำแหน่งวิชาการ ${branch_name} สำเร็จ!`,
        showConfirmButton: false,
        timer: 1500
      })
    } catch (error) {
      console.error("Error deleting prefix:", error)
      setBranchLoading(false)

      Swal.fire({
        icon: "error",
        title: "เกิดข้อผิดพลาด!",
        text: "เกิดข้อผิดพลาดในการแก้ไขตำแหน่งวิชาการ",
        showConfirmButton: false,
        timer: 1500
      })
    }
  }

  if (branchLoading) {
    return <SkeletonTable />
  }

  if (branchError) {
    return <div>เกิดข้อผิดพลาดในการเชื่อมต่อข้อมูล: {branchError}</div>
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
          <SearchFilter<Branch, "branch_name">
            selectedLabel={selectedLabel}
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
          {branchLoading && (
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
                    สาขา
                  </td>
                  <td className="p-4 text-sm text-gray-600 text-center py-4 dark:text-gray-300 text-nowrap sticky right-0 bg-gray-100 dark:bg-zinc-800 transition-all duration-300 ease-in-out border border-gray-300 dark:border-zinc-600 border-opacity-40">
                    จัดการ
                  </td>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-zinc-900 divide-y divide-gray-200 dark:divide-zinc-600 transition-all duration-300 ease-in-out ">
                {currentData.map((item: Branch, index) => (
                  <tr key={item.branch_id} className="hover:bg-gray-50 dark:hover:bg-zinc-800">
                    <td className="p-4 whitespace-nowrap text-center text-md font-regular text-gray-600 dark:text-gray-300 border border-gray-300 dark:border-zinc-600 border-opacity-40">
                      {(currentPage - 1) * ITEMS_PER_PAGE + index + 1}
                    </td>
                    <td className="p-4 whitespace-nowrap text-start text-md font-light text-gray-500 dark:text-gray-400 border border-gray-300 dark:border-zinc-600 border-opacity-40">
                      {item?.branch_name || "-"}
                    </td>
                    <td className="p-4 whitespace-nowrap text-center text-md font-light flex justify-center gap-2 sticky right-0 bg-white dark:bg-zinc-900 transition-all duration-300 ease-in-out border border-gray-300 dark:border-zinc-600 border-opacity-40">
                      <label
                        htmlFor={`modal-edit${item.branch_id}`}
                        className="text-yellow-500 border-none border-yellow-500 rounded-md p-1 hover:bg-yellow-500 hover:text-white transition ease-in-out duration-300 cursor-pointer"
                        onClick={() => {
                          setSelectedBranchId(item.branch_id)
                          setSelectedBranchName(item.branch_name)
                        }}
                      >
                        <Edit2 className="w-4 h-4" />
                      </label>
                      <label
                        htmlFor={`modal-delete${item.branch_id}`}
                        className="text-red-500 border-none border-red-500 rounded-md p-1 hover:bg-red-500 hover:text-white transition ease-in-out duration-300 cursor-pointer"
                        onClick={() => {
                          setSelectedBranchId(item.branch_id)
                          setSelectedBranchName(item.branch_name)
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
          data={filteredBranch}
          currentData={currentData}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          />
          </div>
      </div>
      <CreateModal
        isLoading={branchLoading}
        handleSubmit={handleSubmit}
        formData={FormData}
        handleInputChange={handleInputChange}
      />
      <DeleteModal
        isLoading={branchLoading}
        branch_id={selectedBranchId}
        branch_name={selectedBranchName}
        handleDelete={handleDelete}
      />
      <EditModal
        isLoading={branchLoading}
        branch_id={selectedBranchId}
        branch_name={selectedBranchName}
        handleEdit={handleEdit}
      />
    </div>
  )
}

export default PositionTable

