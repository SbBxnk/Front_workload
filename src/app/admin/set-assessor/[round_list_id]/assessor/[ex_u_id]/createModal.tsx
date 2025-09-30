'use client'

import type React from 'react'
import { CalendarClock } from 'lucide-react'
import { useEffect, useState } from 'react'
import useAuthHeaders from '@/hooks/Header'
import type { ExPosition, User } from '@/Types'
import SelectDropdown, { type SelectOption } from '@/components/SelectValue'
import SetAssessorServices from '@/services/setAssessorServices'
import Select, { MultiValue } from 'react-select'

interface FormDataFormList {
  ex_u_id: number[]
  set_asses_list_id: number
}

interface CreateModalProps {
  isLoading: boolean
  formData: FormDataFormList
  setFormData: React.Dispatch<React.SetStateAction<FormDataFormList>>
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void
  expositons: ExPosition[]
  round_list_id: number
  onSuccess?: () => void
  onDeleteSuccess?: () => void
}

export default function CreateModal({
  isLoading,
  handleSubmit,
  formData,
  setFormData,
  round_list_id,
  onSuccess,
  onDeleteSuccess,
}: CreateModalProps) {
  const [users, setUsers] = useState<User[]>([])
  const [isLoadingUsers, setIsLoadingUsers] = useState<boolean>(false)
  const [noUsersAvailable, setNoUsersAvailable] = useState<boolean>(false)
  const [userOptions, setUserOptions] = useState<SelectOption[]>([])
  const [selectedInputValue, setSelectedInputValue] = useState<SelectOption | null>(null)
  const headers = useAuthHeaders()

  // Function to refresh users list
  const refreshUsers = async () => {
    if (!round_list_id || !formData.set_asses_list_id) {
      setUsers([])
      setNoUsersAvailable(true)
      return
    }

    setIsLoadingUsers(true)
    setNoUsersAvailable(false)

    try {
      const response = await SetAssessorServices.getAllExUsers(
        formData.set_asses_list_id,
        headers.Authorization?.replace('Bearer ', '') || ''
      )

      // Backend returns { status: true, data: result }
      const userData = (response as any).data || []
      
      if (userData && userData.length > 0) {
        setUsers(userData)
        setNoUsersAvailable(false)
      } else {
        setUsers([])
        setNoUsersAvailable(true)
      }
    } catch (error) {
      console.error('Error fetching filtered users:', error)
      setUsers([])
      setNoUsersAvailable(true)
    } finally {
      setIsLoadingUsers(false)
    }
  }

  useEffect(() => {
    refreshUsers()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [round_list_id, formData.set_asses_list_id])

  // Listen for delete success to refresh users
  useEffect(() => {
    if (onDeleteSuccess) {
      refreshUsers()
    }
  }, [onDeleteSuccess])

  // Create options for react-select when users change
  useEffect(() => {
    if (users.length > 0) {
      const options = users.map((user) => ({
        value: user.u_id,
        label: `${user.prefix_name || ''}${user.u_fname || ''} ${user.u_lname || ''}${
          user.ex_position_name ? ` (${user.ex_position_name})` : ''
        }`,
      }))
      setUserOptions(options)
    } else {
      setUserOptions([])
    }
  }, [users])

  // Handle react-select change
  const handleSelectChange = (selectedOption: SelectOption | null) => {
    if (selectedOption) {
      const userId = Number(selectedOption.value)

      // ตรวจสอบว่าผู้ใช้นี้ยังไม่เคยถูกเลือก
      if (!formData.ex_u_id.includes(userId)) {
        // เพิ่มรายการใหม่
      setFormData((prev) => ({
        ...prev,
          ex_u_id: [...prev.ex_u_id, userId],
      }))

        // Clear input หลังจากเลือก
        setSelectedInputValue(null)
    } else {
        // Clear input แม้ว่าจะเลือกซ้ำ
        setSelectedInputValue(null)
      }
    }
  }

  const handleRemoveUser = (userIdToRemove: number) => {
    setFormData((prev) => ({
      ...prev,
      ex_u_id: prev.ex_u_id.filter(id => id !== userIdToRemove),
    }))
  }

  // สร้าง selectedOptions จาก users data
  const selectedOptions = users
    .filter((user) => formData.ex_u_id.includes(user.u_id))
    .map((user) => ({
      value: user.u_id,
      label: `${user.prefix_name || ''}${user.u_fname || ''} ${user.u_lname || ''}${
        user.ex_position_name ? ` (${user.ex_position_name})` : ''
      }`,
    }))

  // Custom handle submit that refreshes the list after success
  const handleCustomSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    try {
      // Call the original handleSubmit
      await handleSubmit(e)
      
      // Close modal first
      const modalCheckbox = document.getElementById('modal-create') as HTMLInputElement
      if (modalCheckbox) {
        modalCheckbox.checked = false
      }
      
      // Refresh the users list after successful submission
      await refreshUsers()
      
      // Reset form
      setFormData(prev => ({ ...prev, ex_u_id: [] }))
      setSelectedInputValue(null)
      
      // Call onSuccess callback if provided
      if (onSuccess) {
        onSuccess()
      }
    } catch (error) {
      console.error('Error submitting form:', error)
    }
  }

  return (
    <>
      <div className="relative z-[100]">
        <input type="checkbox" id="modal-create" className="modal-toggle" />
        <div className="modal" role={`modal-create`}>
          <div className="modal-box rounded-md dark:bg-zinc-800 p-0">
            <form onSubmit={handleCustomSubmit}>
              <div className="flex items-center border-b border-gray-200 p-4">
                <h3 className="font-regular flex truncate text-start text-2xl text-gray-600 dark:text-gray-400">
                  เพิ่มผู้ประเมิน&nbsp;
                </h3>
              </div>
              <div className="p-4">
                  <div className="flex flex-row">
                    <div className="flex w-full flex-col">
                <label className="font-regular mb-2 block text-sm text-gray-600 dark:text-gray-400">
                        เลือกผู้ตรวจประเมิน (สามารถเลือกได้หลายคน)
                </label>
                      <div className="flex w-full flex-row gap-4">
                {isLoadingUsers ? (
                  <div className="py-2 text-sm text-gray-600 dark:text-gray-400">
                    กำลังโหลดข้อมูล...
                  </div>
                ) : noUsersAvailable ? (
                  <div className="rounded-md border border-gray-300 bg-gray-50 px-3 py-2 text-sm font-light text-amber-500">
                            ผู้ใช้ทั้งหมดถูกกำหนดเป็นผู้ตรวจประเมินในรอบนี้แล้ว
                    ไม่มีผู้ใช้ที่สามารถเลือกได้
                  </div>
                ) : (
                          <Select
                    options={userOptions}
                            value={selectedInputValue}
                    onChange={handleSelectChange}
                            placeholder="เลือกผู้ตรวจประเมิน"
                            noOptionsMessage={() => 'ไม่พบข้อมูลผู้ตรวจประเมิน'}
                            isMulti={false}
                            isClearable
                            isSearchable
                            className="react-select-container w-full"
                            classNamePrefix="react-select"
                            styles={{
                              control: (base, state) => ({
                                ...base,
                                borderColor: state.isFocused ? '#3b82f6' : '#d1d5db',
                                borderWidth: '1px',
                                borderRadius: '6px',
                                padding: '2px',
                                backgroundColor: 'transparent',
                                minHeight: '40px',
                                height: '40px',
                                boxShadow: state.isFocused ? '0 0 0 1px #3b82f6' : 'none',
                                fontSize: '14px',
                                fontWeight: '300',
                              }),
                              valueContainer: (base) => ({
                                ...base,
                                fontSize: '14px',
                                fontWeight: '300',
                                padding: '0 8px',
                              }),
                              input: (base) => ({
                                ...base,
                                fontSize: '14px',
                                fontWeight: '300',
                                margin: '0',
                                padding: '0',
                              }),
                              placeholder: (base) => ({
                                ...base,
                                fontSize: '14px',
                                fontWeight: '300',
                                color: '#6b7280',
                              }),
                              singleValue: (base) => ({
                                ...base,
                                fontSize: '14px',
                                fontWeight: '300',
                                color: '#374151',
                              }),
                              menu: (base) => ({
                                ...base,
                                zIndex: 9999,
                              }),
                              menuPortal: (base) => ({
                                ...base,
                                zIndex: 9999,
                              }),
                              option: (base) => ({
                                ...base,
                                fontSize: '16px',
                                fontWeight: '300',
                              }),
                            }}
                            menuPortalTarget={document.body}
                            menuPosition="fixed"
                          />
                        )}
                        <button
                          type="button"
                          onClick={() => {
                            // เพิ่มทุกคนที่ยังไม่ได้เลือก
                            const allAvailableIds = users
                              .filter((user) => {
                                const isNotSelected = !formData.ex_u_id.includes(user.u_id)
                                return isNotSelected
                              })
                              .map((user) => user.u_id)

                            if (allAvailableIds.length > 0) {
                              setFormData((prev) => ({
                                ...prev,
                                ex_u_id: [...prev.ex_u_id, ...allAvailableIds],
                              }))
                            }
                          }}
                          disabled={users.filter((user) => {
                            const isNotSelected = !formData.ex_u_id.includes(user.u_id)
                            return isNotSelected
                          }).length === 0}
                          className="px-3 w-fit py-1 text-md font-light bg-blue-500 text-white text-nowrap rounded-md hover:bg-blue-600 disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed transition-colors"
                        >
                          เลือกทั้งหมด
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="mt-3">
                    <div className="flex flex-row items-end justify-between mb-4">
                      <p className="text-md text-gray-500 font-light dark:text-gray-400 m-0">
                        รายชื่อที่เลือกไว้
                      </p>
                      <div className="flex items-center gap-2">
                        <label className="w-fit px-2 py-1 rounded-md font-regular block text-sm text-business1 bg-gray-200 dark:text-gray-400">
                          {selectedOptions.length} รายการ
                        </label>
                      </div>
                    </div>
                    <div className="max-h-32 overflow-y-auto rounded-md border border-gray-200 bg-gray-50 p-3 dark:border-zinc-600 dark:bg-zinc-700">
                      {selectedOptions.length > 0 ? (
                        selectedOptions.map((option, index) => (
                          <div key={option.value} className="flex items-center justify-between py-2 px-3 mb-2 bg-white dark:bg-zinc-800 rounded-md border border-gray-200 dark:border-zinc-600">
                            <span className="text-sm text-gray-700 dark:text-gray-300 flex-1">
                              {index + 1}. {option.label}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleRemoveUser(Number(option.value))}
                              className="ml-3 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                              title="ลบรายการนี้"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8">
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            ยังไม่ได้เลือกผู้ตรวจประเมิน
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                <input
                  name="set_asses_list_id"
                  value={formData.set_asses_list_id}
                  type="hidden"
                  placeholder="ป้อนรอบการประเมิน"
                  className="h-full w-full rounded-md border-2 border-gray-300 px-4 py-2 text-sm font-light text-gray-600 transition-all duration-300 ease-in-out focus:border-blue-500 focus:outline-none dark:border-zinc-600 dark:bg-zinc-800 dark:text-gray-400"
                  required
                  readOnly
                />
              </div>
              <div className="flex justify-end gap-4 border-t border-gray-200 p-4">
                <label
                  htmlFor="modal-create"
                  className="text-md flex h-10 w-20 cursor-pointer items-center justify-center rounded-md border-2 border-gray-200 bg-gray-200 px-4 font-light text-gray-600 transition duration-300 ease-in-out hover:border-gray-300 hover:bg-gray-300 dark:border-zinc-700 dark:bg-zinc-700 dark:text-gray-400 dark:hover:border-zinc-600 dark:hover:bg-zinc-600"
                >
                  ยกเลิก
                </label>
                {noUsersAvailable ? null : (
                  <button
                    type="submit"
                    className="text-md flex h-10 w-20 items-center justify-center rounded-md bg-success px-4 font-light text-white transition duration-300 ease-in-out hover:bg-success/80"
                    disabled={
                      isLoading ||
                      userOptions.length === 0 ||
                      noUsersAvailable ||
                      formData.ex_u_id.length === 0
                    }
                  >
                    {isLoading ? 'กำลังบันทึก...' : 'ยืนยัน'}
                  </button>
                )}
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
