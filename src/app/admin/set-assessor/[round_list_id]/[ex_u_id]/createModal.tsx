"use client"

import type React from "react"
import { CalendarClock } from "lucide-react"
import { useEffect, useState } from "react"
import axios from "axios"
import useAuthHeaders from "@/hooks/Header"
import type { ExPosition, User } from "@/Types"
import SelectDropdown, { type SelectOption } from "@/components/SelectValue"

interface FormDataFormList {
  ex_u_id: number
  set_asses_list_id: number
}

interface CreateModalProps {
  isLoading: boolean
  formData: FormDataFormList
  setFormData: React.Dispatch<React.SetStateAction<FormDataFormList>>
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void
  expositons: ExPosition[]
  round_list_id: number
}

export default function CreateModal({
  isLoading,
  handleSubmit,
  formData,
  setFormData,
  round_list_id,
}: CreateModalProps) {
  const [users, setUsers] = useState<User[]>([])
  const [isLoadingUsers, setIsLoadingUsers] = useState<boolean>(false)
  const [noUsersAvailable, setNoUsersAvailable] = useState<boolean>(false)
  const [userOptions, setUserOptions] = useState<SelectOption[]>([])
  const [selectedUser, setSelectedUser] = useState<SelectOption | null>(null)
  const headers = useAuthHeaders()

  useEffect(() => {
    const fetchFilteredUsers = async () => {
      if (!round_list_id || !formData.set_asses_list_id) {
        setUsers([])
        setNoUsersAvailable(true)
        return
      }

      setIsLoadingUsers(true)
      setNoUsersAvailable(false)

      try {
        // Pass the set_asses_list_id as a query parameter
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API}/ex_user/?set_asses_list_id=${formData.set_asses_list_id}`,
          { headers },
        )

        if (response.data.status && response.data.data) {
          setUsers(response.data.data)
          if (response.data.data.length === 0) {
            setNoUsersAvailable(true)
          }
        } else {
          setUsers([])
          setNoUsersAvailable(true)
        }
      } catch (error) {
        if (axios.isAxiosError(error)) {
          if (error.response?.status === 404) {
            console.log("No available users found - all users have been assigned as assessors for this round")
            setUsers([])
            setNoUsersAvailable(true)
          } else {
            console.error("Error fetching filtered users:", error.message)
          }
        } else {
          console.error("Unexpected error:", error)
        }

        setUsers([])
        setNoUsersAvailable(true)
      } finally {
        setIsLoadingUsers(false)
      }
    }

    fetchFilteredUsers()

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [round_list_id, formData.set_asses_list_id])

  // Create options for react-select when users change
  useEffect(() => {
    if (users.length > 0) {
      const options = users.map((user) => ({
        value: user.u_id,
        label: `${user.prefix_name || ""}${user.u_fname || ""} ${user.u_lname || ""} ${user.u_id} ${user.ex_position_name ? `(${user.ex_position_name})` : ""
        }`,
      }))
      setUserOptions(options)
    } else {
      setUserOptions([])
    }
  }, [users])

  // Update selectedUser when formData.ex_u_id changes
  useEffect(() => {
    if (formData.ex_u_id && userOptions.length > 0) {
      const option = userOptions.find((opt) => opt.value === formData.ex_u_id) || null
      setSelectedUser(option)
    } else {
      setSelectedUser(null)
    }
  }, [formData.ex_u_id, userOptions])

  // Handle react-select change
  const handleSelectChange = (selectedOption: SelectOption | null) => {
    setSelectedUser(selectedOption)
    if (selectedOption) {
      setFormData((prev) => ({ ...prev, ex_u_id: Number(selectedOption.value) }))
    } else {
      setFormData((prev) => ({ ...prev, ex_u_id: 0 }))
    }
  }

  return (
    <>
      <div className="relative z-[100]">
        <input type="checkbox" id="modal-create" className="modal-toggle" />
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

                    {isLoadingUsers ? (
                      <div className="text-sm text-gray-600 dark:text-gray-400 py-2">กำลังโหลดข้อมูล...</div>
                    ) : noUsersAvailable ? (
                      <div className="text-sm text-amber-500 font-light py-2 border border-gray-300 bg-gray-50 rounded-md px-3">
                        ผู้ใช้ทั้งหมดถูกกำหนดเป็นผู้ประเมินในรอบนี้แล้ว ไม่มีผู้ใช้ที่สามารถเลือกได้
                      </div>
                    ) : (
                      <SelectDropdown
                        options={userOptions}
                        value={selectedUser}
                        onChange={handleSelectChange}
                        placeholder="เลือกผู้ประเมิน"
                        isLoading={isLoadingUsers}
                        noOptionsMessage={() => "ไม่พบผู้ประเมินที่สามารถเลือกได้"}
                      />
                    )}

                    <input
                      name="set_asses_list_id"
                      value={formData.set_asses_list_id}
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
                {noUsersAvailable ? null : (
                  <button
                    type="submit"
                    className="w-20 bg-success flex items-center justify-center text-md text-white rounded-md py-2 px-4 hover:bg-success hover:text-white hover:bg-success/80 transition ease-in-out duration-300"
                    disabled={isLoading || userOptions.length === 0 || noUsersAvailable || !formData.ex_u_id}
                  >
                    {isLoading ? "กำลังบันทึก..." : "ยืนยัน"}
                  </button>
                )}
                <label
                  htmlFor="modal-create"
                  className="z-50 w-20 border border-2 border-gray-200 flex items-center justify-center bg-gray-200 text-md text-gray-600 rounded-md py-2 px-4 hover:bg-gray-300 hover:border-gray-300 dark:bg-zinc-700 dark:text-gray-400 dark:hover:bg-zinc-600 dark:hover:border-zinc-600 dark:border-zinc-700 transition ease-in-out duration-300 cursor-pointer"
                >
                  ยกเลิก
                </label>
              </div>
            </form>
          </div>
          <label className="modal-backdrop" htmlFor="modal-create">
            Close
          </label>
        </div>
      </div>
    </>
  )
}
