'use client'

import { useState, useEffect } from 'react'
import type React from 'react'
import SelectDropdown, { type SelectOption } from '@/components/SelectValue'
import SetAssessorServices from '@/services/setAssessorServices'
import { useSession } from 'next-auth/react'
import { RoundList } from '@/services/setAssessorServices'
interface EditModalProps {
  isLoading: boolean
  round_list_id: number
  handleEdit: (
    e: React.FormEvent<HTMLFormElement> | React.MouseEvent,
    round_list_id: number,
    updateRoundList: {
      round_list_id: number
      year: string
      round_list_name: string
      round: number
      date_start: string
      date_end: string
    }
  ) => void
}

export default function EditModal({
  isLoading,
  round_list_id,
  handleEdit,
}: EditModalProps) {
  const [editRoundList, setEditRoundList] = useState<RoundList | null>(null)
  const [loading, setLoading] = useState(true)
  const { data: session } = useSession()

  // ดึงข้อมูลเมื่อ modal เปิด
  useEffect(() => {
    const fetchData = async () => {
      console.log('EditModal useEffect triggered:', { round_list_id, hasToken: !!session?.accessToken })
      
      if (round_list_id && session?.accessToken) {
        setLoading(true)
        try {
          console.log('Calling getRoundListById with ID:', round_list_id)
          const response = await SetAssessorServices.getRoundListById(round_list_id, session.accessToken)
          console.log('getRoundListById response:', response)
          
          if (response.success && response.payload) {
            const data = Array.isArray(response.payload) ? response.payload[0] : response.payload
            console.log('Setting editRoundList with data:', data)
            setEditRoundList({
              round_list_id: data.round_list_id || 0,
              year: data.year || '',
              round_list_name: data.round_list_name || '',
              round: data.round || 0,
              date_start: data.date_start 
                ? new Date(data.date_start).toISOString().split('T')[0]
                : '',
              date_end: data.date_end 
                ? new Date(data.date_end).toISOString().split('T')[0]
                : '',
            })
          }
        } catch (error) {
          console.error('Error fetching data:', error)
        } finally {
          setLoading(false)
        }
      } else {
        console.log('Not fetching data because:', { round_list_id, hasToken: !!session?.accessToken })
        // ไม่ต้อง reset state เมื่อ round_list_id เป็น 0 เพราะจะทำให้แสดง skeleton loading
        setLoading(false)
      }
    }

    fetchData()
  }, [round_list_id, session?.accessToken])

  

  // Options for round selection
  const roundOptions: SelectOption[] = [
    { value: 1, label: '1' },
    { value: 2, label: '2' },
  ]


  // Handle modal close to reset state
  const handleModalClose = () => {
    // ไม่ต้อง reset editRoundList เพราะจะทำให้แสดง skeleton loading
    // setEditRoundList(null)
    setLoading(false) // ไม่ต้องแสดง loading เมื่อปิด modal
  }

  if (isLoading) return null

  return (
    <div className="relative z-[100]">
      <input
        type="checkbox"
        id={`modal-edit`}
        className="modal-toggle"
        onChange={(e) => {
          if (!e.target.checked) {
            handleModalClose()
          }
        }}
      />
      <div className="modal" role={`modal-edit`}>
        <div className="modal-box rounded-md dark:bg-zinc-800 p-0">
          {loading ? (
            // Skeleton Loading
            <div className="p-4">
              <div className="flex items-center border-b border-gray-200 pb-4 mb-4">
                <div className="h-8 bg-gray-200 dark:bg-zinc-700 rounded animate-pulse w-64"></div>
              </div>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="w-full">
                    <div className="h-4 bg-gray-200 dark:bg-zinc-700 rounded animate-pulse mb-2 w-24"></div>
                    <div className="h-10 bg-gray-200 dark:bg-zinc-700 rounded animate-pulse"></div>
                  </div>
                  <div className="w-full">
                    <div className="h-4 bg-gray-200 dark:bg-zinc-700 rounded animate-pulse mb-2 w-20"></div>
                    <div className="h-10 bg-gray-200 dark:bg-zinc-700 rounded animate-pulse"></div>
                  </div>
                </div>
                <div className="w-full">
                  <div className="h-4 bg-gray-200 dark:bg-zinc-700 rounded animate-pulse mb-2 w-24"></div>
                  <div className="h-10 bg-gray-200 dark:bg-zinc-700 rounded animate-pulse"></div>
                </div>
                <div className="w-full">
                  <div className="h-4 bg-gray-200 dark:bg-zinc-700 rounded animate-pulse mb-2 w-20"></div>
                  <div className="h-10 bg-gray-200 dark:bg-zinc-700 rounded animate-pulse"></div>
                </div>
              </div>
              <div className="flex justify-end gap-4 border-t border-gray-200 pt-4 mt-4">
                <div className="h-10 w-20 bg-gray-200 dark:bg-zinc-700 rounded animate-pulse"></div>
                <div className="h-10 w-20 bg-gray-200 dark:bg-zinc-700 rounded animate-pulse"></div>
              </div>
            </div>
          ) : (
            // Form Content
            <form
              onSubmit={(e) => {
                e.preventDefault()
                if (editRoundList) {
                  handleEdit(e, round_list_id, {
                    round_list_id: round_list_id,
                    year: editRoundList.year,
                    round_list_name: editRoundList.round_list_name,
                    round: editRoundList.round,
                    date_start: editRoundList.date_start,
                    date_end: editRoundList.date_end,
                  })
                }
              }}
            >
              <div className="flex items-center border-b border-gray-200 p-4">
                <h3 className="font-regular flex truncate text-start text-2xl text-gray-600 dark:text-gray-400">
                  แก้ไขรอบการประเมิน&nbsp;
                  <span className="truncate font-semibold text-business1 dark:text-blue-500/80">
                    {editRoundList?.round_list_name || ''}
                  </span>
                </h3>
              </div>
              <div className="p-4">
                <div className="flex-col justify-between space-y-4">
                <div className="flex w-full items-center justify-between gap-4">
                  <div className="w-full">
                    <label className="font-regular mb-2 block text-sm text-gray-600 dark:text-gray-400">
                      รอบการประเมิน
                    </label>
                    <SelectDropdown
                      options={roundOptions}
                      value={roundOptions.find(option => option.value === editRoundList?.round) || null}
                      onChange={(selectedOption) => {
                        if (selectedOption && editRoundList) {
                          setEditRoundList((prev) => ({
                            ...prev!,
                            round: selectedOption.value as number,
                          }))
                        } else {
                          // เมื่อกด X หรือล้างข้อมูล ให้ล้างข้อมูลทั้งหมด
                          setEditRoundList({
                            round_list_id: 0,
                            year: '',
                            round_list_name: '',
                            round: 0,
                            date_start: '',
                            date_end: '',
                          })
                        }
                      }}
                      placeholder="เลือกรอบการประเมิน"
                      noOptionsMessage={() => 'ไม่พบข้อมูลรอบการประเมิน'}
                    />
                  </div>

                  <div className="w-full">
                    <label className="font-regular mb-2 block text-sm text-gray-600 dark:text-gray-400">
                      ปีการประเมิน
                    </label>
                    <input
                      name="year"
                      value={editRoundList?.year || ''}
                      onChange={(e) =>
                        setEditRoundList((prev) => ({
                          ...prev!,
                          year: e.target.value,
                        }))
                      }
                      type="number"
                      placeholder="ปีการประเมิน"
                      className="h-full w-full rounded-md border border-gray-300 px-4 py-2 text-sm font-light text-gray-600 transition-colors duration-300 ease-in-out focus:border-blue-500 focus:outline-none dark:border-zinc-600 dark:bg-zinc-800 dark:text-gray-400"
                      required
                    />
                  </div>
                </div>
                <div className="w-full">
                  <label className="font-regular mb-2 block text-sm text-gray-600 dark:text-gray-400">
                    วันที่เริ่มต้น
                  </label>
                  <input
                    name="date_start"
                    value={editRoundList?.date_start || ''}
                    onChange={(e) =>
                      setEditRoundList((prev) => ({
                        ...prev!,
                        date_start: e.target.value,
                      }))
                    }
                    type="date"
                    className="w-full rounded-md border border-gray-300 px-4 py-2 text-sm font-light text-gray-600 transition-colors duration-300 ease-in-out focus:border-blue-500 focus:outline-none dark:border-zinc-600 dark:bg-zinc-800 dark:text-gray-400"
                    required
                  />
                </div>
                <div className="w-full">
                  <label className="font-regular mb-2 block text-sm text-gray-600 dark:text-gray-400">
                    วันที่สิ้นสุด
                  </label>
                  <input
                    name="date_end"
                    value={editRoundList?.date_end || ''}
                    onChange={(e) =>
                      setEditRoundList((prev) => ({
                        ...prev!,
                        date_end: e.target.value,
                      }))
                    }
                    type="date"
                    className="w-full rounded-md border border-gray-300 px-4 py-2 text-sm font-light text-gray-600 transition-colors duration-300 ease-in-out focus:border-blue-500 focus:outline-none dark:border-zinc-600 dark:bg-zinc-800 dark:text-gray-400"
                    required
                  />
                </div>
                </div>
              </div>
              <div className="flex justify-end gap-4 border-t border-gray-200 p-4">
              <label
                  htmlFor={`modal-edit`}
                  className="text-md z-50 h-10 flex w-20 cursor-pointer items-center justify-center rounded-md border-2 border-gray-200 bg-gray-200 px-4 py-2 text-gray-600 transition duration-300 ease-in-out hover:border-gray-300 hover:bg-gray-300 dark:border-zinc-700 dark:bg-zinc-700 dark:text-gray-400 dark:hover:border-zinc-600 dark:hover:bg-zinc-600"
                  onClick={handleModalClose}
                >
                  ยกเลิก
                </label>
                
                <button
                  type="submit"
                  className="text-md  h-10 flex w-20 items-center justify-center text-nowrap rounded-md bg-success px-4 py-2 text-white transition duration-300 ease-in-out hover:bg-success/80"
                >
                  บันทึก
                </button>
              </div>
            </form>
          )}
        </div>
        <label
          className="modal-backdrop"
          htmlFor={`modal-edit`}
          onClick={handleModalClose}
        >
          Close
        </label>
      </div>
    </div>
  )
}
