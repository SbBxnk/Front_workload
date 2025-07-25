"use client"
import type React from "react"
import { Edit2, Plus, Trash2, Eye, Loader } from "lucide-react"
import { FiX } from "react-icons/fi"
import { useEffect, useState } from "react"
import axios from "axios"
import CreateModal from "./createModal"
import DeleteModal from "./deleteModal"
import EditModal from "./editModal"
import Swal from "sweetalert2"
import Pagination from "@/components/Pagination"
import SearchFilter from "@/components/SearchFilter"
import { useRouter } from "next/navigation"
import useAuthHeaders from "@/hooks/Header"

const ITEMS_PER_PAGE = 10

interface Roundlist {
  round_list_id: number
  round_list_name: string
  date_start: string
  date_end: string
  year: string
  round: number
}

const FormRoundList = {
  round_list_name: "",
  round_list_id: 0,
  date_start: "",
  date_end: "",
  year: "",
  round: 0,
}

const formatThaiDate = (dateString: string) => {
  if (!dateString) return "-"

  const date = new Date(dateString)
  if (isNaN(date.getTime())) return dateString

  const day = date.getDate()
  const year = date.getFullYear() + 543

  const thaiMonths = [
    "มกราคม",
    "กุมภาพันธ์",
    "มีนาคม",
    "เมษายน",
    "พฤษภาคม",
    "มิถุนายน",
    "กรกฎาคม",
    "สิงหาคม",
    "กันยายน",
    "ตุลาคม",
    "พฤศจิกายน",
    "ธันวาคม",
  ]

  const month = thaiMonths[date.getMonth()]

  return `${day} ${month} ${year}`
}

const isDateInRange = (startDate: string, endDate: string): boolean => {
  if (!startDate || !endDate) return false

  const currentDate = new Date()
  const end = new Date(endDate)

  // Allow editing if current date is before or within the date range (not after end date)
  return currentDate <= end
}

function SetAssessor() {
  const headers = useAuthHeaders()
  const router = useRouter()
  const [FormData, setFormData] = useState<Roundlist>(FormRoundList)
  const [roundlists, setRoundList] = useState<Roundlist[]>([])
  const [loading, setLoading] = useState(false)
  const [, setError] = useState("")
  const [searchName, setSearchName] = useState<string>("")
  const [selectedRoundList, setSelectedRoundList] = useState<string>("")
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedRoundListId, setSelectedRoundListId] = useState<number>(0)
  const [selectedRoundListName, setSelectedRoundListName] = useState<string>("")
  const [selectedRoundListYear, setSelectedRoundListYear] = useState<string>("")
  const [selectedRoundListRound, setSelectedRoundListRound] = useState<number>(0)
  const [selectedRoundListDateStart, setSelectedRoundListDateStart] = useState<string>("")
  const [selectedRoundListDateEnd, setSelectedRoundListDateEnd] = useState<string>("")
  const [roundsWithAssessorData, setRoundsWithAssessorData] = useState<number[]>([])

  useEffect(() => {
    fetchRoundListData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const checkRoundHasAssessorData = async (round_list_id: number) => {
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API}/set_assessor_list/${round_list_id}`, { headers })
      if (response.data.status && response.data.data && response.data.data.length > 0) {
        return true
      }
      return false
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return false
      }
      console.error(`Error checking assessor data for round ${round_list_id}:`, error)
      return false
    }
  }

  const fetchRoundListData = async () => {
    try {
      setLoading(true)

      const response = await axios.get(process.env.NEXT_PUBLIC_API + "/set_assessor_round", { headers })

      let roundsData: Roundlist[] = []
      if (response.data && Array.isArray(response.data)) {
        roundsData = response.data
      } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
        roundsData = response.data.data
      } else {
        setError("ข้อมูลที่ได้รับไม่ใช่รูปแบบที่คาดหวัง")
      }

      setRoundList(roundsData)

      // Check which rounds have assessor data
      const roundsWithData: number[] = []
      for (const round of roundsData) {
        const hasData = await checkRoundHasAssessorData(round.round_list_id)
        if (hasData) {
          roundsWithData.push(round.round_list_id)
        }
      }
      setRoundsWithAssessorData(roundsWithData)

      setLoading(false)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err)
      setError(`ไม่สามารถดึงข้อมูลได้: ${errorMessage}`)
      setLoading(false)
    }
  }

  const clearSearch = () => {
    setSearchName("")
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handleRoundListSelect = (value: string) => {
    setSelectedRoundList(value)
  }

  const filteredRoundList = roundlists.filter((roundlist) => {
    const fullName = `${roundlist.year}`.toLowerCase()
    return (
      fullName.includes(searchName.toLowerCase()) && (selectedRoundList ? roundlist.year === selectedRoundList : true)
    )
  })

  const totalPages = Math.ceil(filteredRoundList.length / ITEMS_PER_PAGE)
  const currentData = filteredRoundList.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)
  const selectedLabel = roundlists.find((pos) => pos.year === selectedRoundList)?.year || "เลือกรอบการประเมิน"

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target

    if (name === "date_start" || name === "date_end") {
      setFormData((prev) => ({ ...prev, [name]: value }))
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }))
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement> | React.MouseEvent) => {
    setLoading(true)
    e.preventDefault()
    try {
      const formattedData = {
        ...FormData,
        round_list_name: FormData.round_list_name.startsWith("รอบการประเมินภาระงาน")
          ? FormData.round_list_name
          : `รอบการประเมินภาระงานที่ ${FormData.round}/${FormData.year}`,
      }

      await axios.post(process.env.NEXT_PUBLIC_API + `/set_assessor_round/add`, formattedData, { headers })
      setFormData(FormRoundList)

      const responseRoundList = await axios.get(`${process.env.NEXT_PUBLIC_API}/set_assessor_round`, { headers })
      const dataRoundList = responseRoundList.data.data
      setRoundList(dataRoundList)

      setLoading(false)
      Swal.fire({
        position: "center",
        icon: "success",
        title: "สำเร็จ!",
        text: `เพิ่มรอบการประเมิน ${formattedData.round_list_name} สำเร็จ!`,
        showConfirmButton: false,
        timer: 1500,
      })
    } catch (error) {
      console.error("Error adding round list:", error)
      setLoading(false)
      Swal.fire({
        position: "center",
        icon: "error",
        title: "เกิดข้อผิดพลาด!",
        text: "เกิดข้อผิดพลาดในการเพิ่มรอบการประเมิน",
        showConfirmButton: false,
        timer: 1500,
      })
    }
  }

  const handleDelete = async (
    e: React.FormEvent<HTMLFormElement> | React.MouseEvent,
    round_list_id: number,
    round_list_name: string,
  ) => {
    e.preventDefault()
    setLoading(true)
    try {
      await axios.delete(`${process.env.NEXT_PUBLIC_API}/set_assessor_round/delete/${round_list_id}`, { headers })
      fetchRoundListData()
      setLoading(false)

      Swal.fire({
        icon: "success",
        title: "ลบสำเร็จ!",
        text: `ลบสาขา ${round_list_name} สำเร็จ!`,
        showConfirmButton: false,
        timer: 1500,
      })
    } catch {
      fetchRoundListData()
      Swal.fire({
        icon: "error",
        title: "เกิดข้อผิดพลาด!",
        text: "เกิดข้อผิดพลาดในการลบรอบการประเมิน",
        showConfirmButton: false,
        timer: 1500,
      })
    }
  }

  const handleEdit = async (
    e: React.FormEvent<HTMLFormElement> | React.MouseEvent,
    round_list_id: number,
    updateRoundList: Roundlist,
  ) => {
    e.preventDefault()
    setLoading(true)
    try {
      // Use the updateRoundList data passed from the EditModal component
      const formattedData = {
        ...updateRoundList,
        round_list_name: `รอบการประเมินภาระงานที่ ${updateRoundList.round}/${updateRoundList.year}`,
      }

      await axios.put(`${process.env.NEXT_PUBLIC_API}/set_assessor_round/update/${round_list_id}`, formattedData, {
        headers,
      })
      fetchRoundListData()
      setLoading(false)

      Swal.fire({
        icon: "success",
        title: "แก้ไขสำเร็จ!",
        text: `แก้ไข ${formattedData.round_list_name} สำเร็จ!`,
        showConfirmButton: false,
        timer: 1500,
      })
    } catch (error) {
      console.error("Error edit round list:", error)
      fetchRoundListData()

      Swal.fire({
        icon: "error",
        title: "เกิดข้อผิดพลาด!",
        text: "เกิดข้อผิดพลาดในการแก้ไขรอบการประเมิน",
        showConfirmButton: false,
        timer: 1500,
      })
    }
  }

  const handleSetAssessorInfo = (round_list_id: number) => {
    router.push(`/admin/set-assessor/${round_list_id}`)
  }

  const uniqueYears = Array.from(new Set(roundlists.map((item) => item.year)))

  return (
    <div className="bg-white p-4 rounded-md shadow dark:bg-zinc-900 dark:text-gray-400 transition-all duration-300 ease-in-out ">
      <div className="py-4 md:flex">
        <div className="flex flex-wrap gap-4 w-full md:w-full">
          <div className="relative flex items-center w-full md:w-52">
            <input
              className="w-full px-4 py-2 font-light rounded-md text-sm border-2 border-gray-300 dark:border-zinc-600 text-gray-600 dark:bg-zinc-800 dark:text-gray-400 focus:outline-none focus:border-blue-500 focus:border-blue-500 transition-colors transition-all duration-300 ease-in-out"
              placeholder="ค้นหารอบการประเมินภาระงาน"
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
          <SearchFilter<Roundlist, "year">
            selectedLabel={selectedLabel}
            handleSelect={handleRoundListSelect}
            objects={uniqueYears.map((year) => ({
              year,
              round_list_id: 0,
              round_list_name: "",
              date_start: "",
              date_end: "",
              round: 0,
            }))}
            valueKey="year"
            labelKey="year"
            placeholder="ค้นหาปีรอบการประเมิน"
          />
        </div>
        <div className="w-full md:w-auto pt-4 md:pt-0">
          <label
            htmlFor={`modal-create`}
            className="w-full md:w-52 bg-success text-sm font-light text-white rounded-md py-2.5 px-4 hover:bg-success/80 transition ease-in-out duration-300 flex items-center gap-2 justify-between cursor-pointer"
          >
            เพิ่มรอบการประเมิน
            <Plus className="w-4 h-4" />
          </label>
        </div>
      </div>
      <div className="pb-4">
        <h1 className="text-xl text-gray-500">รอบการประเมินภาระงาน</h1>
      </div>
      <div className="border rounded-md dark:border-zinc-600 transition-all duration-300 ease-in-out">
        <div className="">
          {loading && (
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
                    รอบการประเมิน
                  </td>
                  <td
                    colSpan={3}
                    className="p-4 text-sm text-gray-600 text-center py-4 dark:text-gray-300 text-nowrap border border-gray-300 dark:border-zinc-600 border-opacity-40"
                  >
                    ระยะเวลาการประเมิน
                  </td>
                  <td className="p-4 text-sm text-gray-600 text-center py-4 dark:text-gray-300 text-nowrap sticky right-0 bg-gray-100 dark:bg-zinc-800 transition-all duration-300 ease-in-out border border-gray-300 dark:border-zinc-600 border-opacity-40">
                    จัดการ
                  </td>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-zinc-900 divide-y divide-gray-200 dark:divide-zinc-600 transition-all duration-300 ease-in-out ">
                {currentData.map((item: Roundlist, index) => (
                  <tr key={item.round_list_id} className="hover:bg-gray-50 dark:hover:bg-zinc-800">
                    <td className="p-4 whitespace-nowrap text-center text-md font-regular text-gray-600 dark:text-gray-300 border border-gray-300 dark:border-zinc-600 border-opacity-40">
                      {index + 1}
                    </td>
                    <td className="p-4 whitespace-nowrap text-start text-md font-light text-gray-500 dark:text-gray-400 border border-gray-300 dark:border-zinc-600 border-opacity-40">
                      {item?.round_list_name || "-"}
                    </td>
                    <td className="p-4 whitespace-nowrap text-start text-md font-light text-gray-500 dark:text-gray-400 border border-gray-300 dark:border-zinc-600 border-opacity-40">
                      {`${formatThaiDate(item.date_start)}` || "-"}
                    </td>
                    <td className="p-4 whitespace-nowrap text-center text-md font-light text-gray-500 dark:text-gray-400 border border-gray-300 dark:border-zinc-600 border-opacity-40">
                      ถึง
                    </td>
                    <td className="p-4 whitespace-nowrap text-start text-md font-light text-gray-500 dark:text-gray-400 border border-gray-300 dark:border-zinc-600 border-opacity-40">
                      {`${formatThaiDate(item.date_end)}` || "-"}
                    </td>
                    <td className="p-4 whitespace-nowrap text-center text-md font-light flex justify-center gap-2 sticky right-0 bg-white dark:bg-zinc-900 transition-all duration-300 ease-in-out border border-gray-300 dark:border-zinc-600 border-opacity-40">
                      <button
                        onClick={() => handleSetAssessorInfo(item.round_list_id)}
                        className="text-blue-500 border-none border-blue-500 rounded-md p-1 hover:bg-blue-500 hover:text-white transition ease-in-out duration-300 cursor-pointer"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      {isDateInRange(item.date_start, item.date_end) ? (
                        <>
                          <label
                            htmlFor={`modal-edit${item.round_list_id}`}
                            className="text-yellow-500 border-none border-yellow-500 rounded-md p-1 hover:bg-yellow-500 hover:text-white transition ease-in-out duration-300 cursor-pointer"
                            onClick={() => {
                              setSelectedRoundListId(item.round_list_id)
                              setSelectedRoundListName(item.round_list_name)
                              setSelectedRoundListYear(item.year)
                              setSelectedRoundListRound(item.round)
                              setSelectedRoundListDateStart(item.date_start)
                              setSelectedRoundListDateEnd(item.date_end)
                            }}
                          >
                            <Edit2 className="w-4 h-4" />
                          </label>
                          {!roundsWithAssessorData.includes(item.round_list_id) ? (
                            <label
                              htmlFor={`modal-delete${item.round_list_id}`}
                              className="text-red-500 border-none border-red-500 rounded-md p-1 hover:bg-red-500 hover:text-white transition ease-in-out duration-300 cursor-pointer"
                              onClick={() => {
                                setSelectedRoundListId(item.round_list_id)
                                setSelectedRoundListName(item.round_list_name)
                              }}
                            >
                              <Trash2 className="w-4 h-4" />
                            </label>
                          ) : (
                            <button
                              disabled
                              className="text-gray-300 border-none border-gray-400 rounded-md p-1 cursor-not-allowed"
                              title="ไม่สามารถลบได้เนื่องจากมีข้อมูลผู้ประเมินในรอบนี้"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </>
                      ) : (
                        <>
                          <button
                            disabled
                            className="text-gray-300 border-none border-gray-400 rounded-md p-1 cursor-not-allowed"
                            title="ไม่สามารถแก้ไขได้เนื่องจากอยู่นอกช่วงเวลาที่กำหนด"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            disabled
                            className="text-gray-300 border-none border-gray-400 rounded-md p-1 cursor-not-allowed"
                            title="ไม่สามารถลบได้เนื่องจากอยู่นอกช่วงเวลาที่กำหนด"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
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
            data={filteredRoundList}
            currentData={currentData}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
          <CreateModal
            isLoading={loading}
            handleSubmit={handleSubmit}
            formData={FormData}
            handleInputChange={handleInputChange}
            // setFormData={setFormData}
          />
          <DeleteModal
            isLoading={loading}
            round_list_id={selectedRoundListId}
            round_list_name={selectedRoundListName}
            handleDelete={handleDelete}
          />
          <EditModal
            isLoading={loading}
            handleEdit={handleEdit}
            round_list_id={selectedRoundListId}
            round_list_name={selectedRoundListName}
            year={selectedRoundListYear}
            round={selectedRoundListRound}
            date_start={selectedRoundListDateStart}
            date_end={selectedRoundListDateEnd}
          />
        </div>
      </div>
    </div>
  )
}

export default SetAssessor
