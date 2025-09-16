'use client'

import type React from 'react'
import { CalendarClock } from 'lucide-react'
import { useEffect, useState } from 'react'
import axios from 'axios'
import useAuthHeaders from '@/hooks/Header'
import type { ExPosition, User } from '@/Types'
import SelectDropdown, { type SelectOption } from '@/components/SelectValue'

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
        const resPrefix = await axios.get(
          `${process.env.NEXT_PUBLIC_API}/prefix`,
          { headers }
        )
        if (resPrefix.data && resPrefix.data.data) {
          setPrefixes(resPrefix.data.data)
        }
      } catch (error) {
        console.error('Error fetching prefixes:', error)
      }
    }

    const fetchUsers = async () => {
      try {
        const resUsers = await axios.get(
          `${process.env.NEXT_PUBLIC_API}/as_user/${formData.round_list_id}`,
          {
            headers,
          }
        )
        if (resUsers.data.data) {
          const processedUsers = resUsers.data.data
          setUsers(processedUsers)
        }
      } catch (error) {
        console.error('Error fetching users:', error)
      }
    }

    const fetchExistingAssessors = async (round_list_id: number) => {
      try {
        const resAssesDetail = await axios.get(
          `${process.env.NEXT_PUBLIC_API}/set_assessor_list/${round_list_id}`,
          {
            headers,
          }
        )
        if (resAssesDetail.data && resAssesDetail.data.data) {
          const existingIds = resAssesDetail.data.data
            .filter(
              (item: AssessorData) => item.round_list_id === round_list_id
            )
            .map((item: AssessorData) => item.as_u_id)

          setExistingAssessors(existingIds)
        }
      } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 404) {
          setExistingAssessors([])
        } else {
          console.error('Error fetching existing assessors:', error)
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
    const filteredUsers = users.filter(
      (user) => !existingAssessors.includes(user.u_id)
    )
    const options = filteredUsers.map((user) => ({
      value: user.u_id,
      label: `${user.prefix_name || ''}${user.u_fname || ''} ${user.u_lname || ''} ${user.ex_position_id ? `(${user.ex_position_id})` : ''}`,
    }))
    setUserOptions(options)
  }, [users, existingAssessors])

  const handleSelectChange = (selectedOption: SelectOption | null) => {
    if (selectedOption) {
      setFormData((prev) => ({
        ...prev,
        as_u_id: Number(selectedOption.value),
      }))
    } else {
      setFormData((prev) => ({ ...prev, as_u_id: 0 }))
    }
  }

  const selectedOption =
    userOptions.find((option) => option.value === formData.as_u_id) || null

  useEffect(() => {
    const modalCheckbox = document.getElementById(
      'modal-create'
    ) as HTMLInputElement

    const handleModalChange = () => {
      if (modalCheckbox && modalCheckbox.checked) {
        document.body.style.overflow = 'hidden'
      } else {
        document.body.style.overflow = ''
      }
    }

    if (modalCheckbox) {
      modalCheckbox.addEventListener('change', handleModalChange)
      handleModalChange()
    }

    return () => {
      if (modalCheckbox) {
        modalCheckbox.removeEventListener('change', handleModalChange)
        document.body.style.overflow = ''
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
                  <CalendarClock className="mr-2 h-7 w-7 text-business1 dark:text-blue-500/80" />
                  <h3 className="font-regular flex truncate text-start text-2xl text-gray-600 dark:text-gray-400">
                    เพิ่มผู้ประเมิน&nbsp;
                  </h3>
                </div>
                <div className="flex-col justify-between space-y-4 py-4">
                  <div className="flex w-full flex-col justify-between gap-4">
                    <div className="w-full">
                      <label className="font-regular mb-2 block text-sm text-gray-600 dark:text-gray-400">
                        เลือกผู้ประเมิน
                      </label>

                      <SelectDropdown
                        options={userOptions}
                        value={selectedOption}
                        onChange={handleSelectChange}
                        placeholder="เลือกผู้ประเมิน"
                        noOptionsMessage={() => 'ไม่พบข้อมูลผู้ประเมิน'}
                      />
                      <input
                        name="round_list_id"
                        value={formData.round_list_id}
                        type="hidden"
                        placeholder="ป้อนรอบการประเมิน"
                        className="h-full w-full rounded-md border-2 border-gray-300 px-4 py-2 text-sm font-light text-gray-600 transition-all transition-colors duration-300 ease-in-out focus:border-blue-500 focus:outline-none dark:border-zinc-600 dark:bg-zinc-800 dark:text-gray-400"
                        required
                        readOnly
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex justify-end gap-4">
                  <button
                    type="submit"
                    className="text-md flex w-20 items-center justify-center rounded-md bg-success px-4 py-2 text-white transition duration-300 ease-in-out hover:bg-success hover:bg-success/80 hover:text-white"
                    disabled={isLoading || !formData.as_u_id}
                  >
                    {isLoading ? 'กำลังบันทึก...' : 'ยืนยัน'}
                  </button>
                  <label
                    htmlFor={`modal-create`}
                    className="text-md z-50 flex w-20 cursor-pointer items-center justify-center rounded-md border border-2 border-gray-200 bg-gray-200 px-4 py-2 text-gray-600 transition duration-300 ease-in-out hover:border-gray-300 hover:bg-gray-300 dark:border-zinc-700 dark:bg-zinc-700 dark:text-gray-400 dark:hover:border-zinc-600 dark:hover:bg-zinc-600"
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
