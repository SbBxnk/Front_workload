"use client"

import type React from "react"
import { CalendarClock } from "lucide-react"
import { useEffect, useState } from "react"
import axios from "axios"
import useAuthHeaders from "@/hooks/Header"
import type { ExPosition, User } from "@/Types"
import SelectDropdown, { type SelectOption } from "@/components/SelectValue"

interface FormDataFormList {
  as_u_id: number
  round_list_id: number
}

interface CreateModalProps {
  isLoading: boolean
  formData: FormDataFormList
  setFormData: React.Dispatch<React.SetStateAction<FormDataFormList>>
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void
  expositons: ExPosition[]
  refreshTrigger: number
}

interface AssessorData {
  round_list_id: number
  as_u_id: number
  date_save: string
}

interface Prefix {
  prefix_id: number
  prefix_name: string
}

export default function CreateModal({
  isLoading,
  handleSubmit,
  formData,
  setFormData,
  refreshTrigger,
}: CreateModalProps) {
  const [users, setUsers] = useState<User[]>([])
  const [, setPrefixes] = useState<Prefix[]>([])
  const [existingAssessors, setExistingAssessors] = useState<number[]>([])
  const [userOptions, setUserOptions] = useState<SelectOption[]>([])
  const headers = useAuthHeaders()

  useEffect(() => {
    const fetchPrefixes = async () => {
      try {
        const resPrefix = await axios.get(`${process.env.NEXT_PUBLIC_API}/prefix`, { headers })
        if (resPrefix.data && resPrefix.data.data) {
          setPrefixes(resPrefix.data.data)
        }
      } catch (error) {
        console.error("Error fetching prefixes:", error)
      }
    }

    const fetchUsers = async () => {
      try {
        const resUsers = await axios.get(`${process.env.NEXT_PUBLIC_API}/as_user/${formData.round_list_id}`, {
          headers,
        })
        if (resUsers.data.data) {
          const processedUsers = resUsers.data.data
          setUsers(processedUsers)
        }
      } catch (error) {
        console.error("Error fetching users:", error)
      }
    }

    const fetchExistingAssessors = async (round_list_id: number) => {
      try {
        const resAssesDetail = await axios.get(`${process.env.NEXT_PUBLIC_API}/set_assessor_list/${round_list_id}`, {
          headers,
        })
        if (resAssesDetail.data && resAssesDetail.data.data) {
          const existingIds = resAssesDetail.data.data
            .filter((item: AssessorData) => item.round_list_id === round_list_id)
            .map((item: AssessorData) => item.as_u_id)

          setExistingAssessors(existingIds)
        }
      } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 404) {
          setExistingAssessors([])
        } else {
          console.error("Error fetching existing assessors:", error)
          setExistingAssessors([])
        }
      }
    }

    fetchPrefixes()
    fetchUsers()

    if (formData.round_list_id) {
      fetchExistingAssessors(formData.round_list_id)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.round_list_id, formData.as_u_id, refreshTrigger])

  useEffect(() => {
    const filteredUsers = users.filter((user) => !existingAssessors.includes(user.u_id))
    const options = filteredUsers.map((user) => ({
      value: user.u_id,
      label: `${user.prefix_name || ""}${user.u_fname || ""} ${user.u_lname || ""} ${user.ex_position_id ? `(${user.ex_position_id})` : ""}`,
    }))
    setUserOptions(options)
  }, [users, existingAssessors])
  

  const handleSelectChange = (selectedOption: SelectOption | null) => {
    if (selectedOption) {
      setFormData((prev) => ({ ...prev, as_u_id: Number(selectedOption.value) }))
    } else {
      setFormData((prev) => ({ ...prev, as_u_id: 0 }))
    }
  }

  const selectedOption = userOptions.find((option) => option.value === formData.as_u_id) || null

  useEffect(() => {
    const modalCheckbox = document.getElementById("modal-create") as HTMLInputElement

    const handleModalChange = () => {
      if (modalCheckbox && modalCheckbox.checked) {
        document.body.style.overflow = "hidden"
      } else {
        document.body.style.overflow = ""
      }
    }

    if (modalCheckbox) {
      modalCheckbox.addEventListener("change", handleModalChange)
      handleModalChange()
    }

    return () => {
      if (modalCheckbox) {
        modalCheckbox.removeEventListener("change", handleModalChange)
        document.body.style.overflow = ""
      }
    }
  }, [])

  return (
    <>
      {isLoading ? null : (
        <div className="relative z-[100]">
          <input type="checkbox" id={`modal-create`} className="modal-toggle" />
          <div className="modal" role={`modal-create`}>
            <div className="modal-box rounded-md dark:bg-zinc-800">
              <form onSubmit={(e) => handleSubmit(e)}>
                <div className="flex items-center">
                  <CalendarClock className="text-business1 dark:text-blue-500/80 mr-2 w-7 h-7" />
                  <h3 className="flex text-2xl font-regular truncate text-start text-gray-600 dark:text-gray-400">
                    เพิ่มผู้ประเมิน&nbsp;
                  </h3>
                </div>
                <div className="flex-col justify-between space-y-4 py-4">
                  <div className="w-full flex flex-col justify-between gap-4">
                    <div className="w-full">
                      <label className="block text-sm font-regular text-gray-600 dark:text-gray-400 mb-2">
                        เลือกผู้ประเมิน
                      </label>


                      <SelectDropdown
                        options={userOptions}
                        value={selectedOption}
                        onChange={handleSelectChange}
                        placeholder="เลือกผู้ประเมิน"
                        noOptionsMessage={() => "ไม่พบข้อมูลผู้ประเมิน"}
                      />
                      <input
                        name="round_list_id"
                        value={formData.round_list_id}
                        type="hidden"
                        placeholder="ป้อนรอบการประเมิน"
                        className="w-full h-full px-4 py-2 font-light rounded-md text-sm border-2 border-gray-300 dark:border-zinc-600 text-gray-600 dark:bg-zinc-800 dark:text-gray-400 focus:outline-none focus:border-blue-500 transition-colors transition-all duration-300 ease-in-out"
                        required
                        readOnly
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-4 mt-6">
                  <button
                    type="submit"
                    className="w-20 bg-success flex items-center justify-center text-md text-white rounded-md py-2 px-4 hover:bg-success hover:text-white hover:bg-success/80 transition ease-in-out duration-300"
                    disabled={isLoading || !formData.as_u_id}
                  >
                    {isLoading ? "กำลังบันทึก..." : "ยืนยัน"}
                  </button>
                  <label
                    htmlFor={`modal-create`}
                    className="z-50 w-20 border border-2 border-gray-200 flex items-center justify-center bg-gray-200 text-md text-gray-600 rounded-md py-2 px-4 hover:bg-gray-300 hover:border-gray-300 dark:bg-zinc-700 dark:text-gray-400 dark:hover:bg-zinc-600 dark:hover:border-zinc-600 dark:border-zinc-700 transition ease-in-out duration-300 cursor-pointer"
                  >
                    ยกเลิก
                  </label>
                </div>
              </form>
            </div>
            <label className="modal-backdrop" htmlFor={`modal-create`}>
              Close
            </label>
          </div>
        </div>
      )}
    </>
  )
}
