'use client'

import { CalendarClock } from 'lucide-react'
import { useState, useEffect } from 'react'
import type React from 'react'

interface EditModalProps {
  isLoading: boolean
  round_list_id: number
  round_list_name: string
  year: string
  round: number
  date_start: string
  date_end: string
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
  round_list_name,
  year,
  date_end,
  date_start,
  round,
  handleEdit,
}: EditModalProps) {
  const [editRoundList, setEditRoundList] = useState({
    year: year,
    round_list_name: round_list_name,
    round: round,
    date_start: date_start,
    date_end: date_end,
  })

  useEffect(() => {
    const formatDateForInput = (dateString: string) => {
      if (!dateString) return ''

      try {
        const date = new Date(dateString)
        if (isNaN(date.getTime())) return dateString

        // แปลงวันที่ให้อยู่ในโซนเวลาไทย
        const thailandOffset = 7 * 60 // UTC+7 เป็นนาที
        const localDate = new Date(date.getTime() + thailandOffset * 60000)

        return localDate.toISOString().split('T')[0]
      } catch (error) {
        console.error('Error formatting date:', error)
        return dateString
      }
    }

    setEditRoundList({
      year: year,
      round_list_name: round_list_name,
      round: round,
      date_start: formatDateForInput(date_start),
      date_end: formatDateForInput(date_end),
    })
  }, [year, round_list_name, round, date_start, date_end])

  if (isLoading) return null

  return (
    <div className="relative z-[100]">
      <input
        type="checkbox"
        id={`modal-edit`}
        className="modal-toggle"
      />
      <div className="modal" role={`modal-edit`}>
        <div className="modal-box rounded-md dark:bg-zinc-800 p-0">
          <form
            onSubmit={(e) => {
              e.preventDefault()
              handleEdit(e, round_list_id, {
                round_list_id: round_list_id,
                year: editRoundList.year,
                round_list_name: editRoundList.round_list_name,
                round: editRoundList.round,
                date_start: editRoundList.date_start,
                date_end: editRoundList.date_end,
              })
            }}
          >
            <div className="flex items-center border-b border-gray-200 p-4">
              <h3 className="font-regular flex truncate text-start text-2xl text-gray-600 dark:text-gray-400">
                แก้ไขรอบการประเมิน&nbsp;
                <span className="truncate font-semibold text-business1 dark:text-blue-500/80">
                  {round_list_name}
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
                  <select
                    name="round"
                    value={editRoundList.round.toString()}
                    onChange={(e) =>
                      setEditRoundList((editRoundList) => ({
                        ...editRoundList,
                        round: Number(e.target.value),
                      }))
                    }
                    className="w-full rounded-md border border-gray-300 px-4 py-2 text-sm font-light text-gray-600 transition-colors duration-300 ease-in-out focus:border-blue-500 focus:outline-none dark:border-zinc-600 dark:bg-zinc-800 dark:text-gray-400"
                    required
                  >
                    <option value="" disabled>
                      เลือกรอบการประเมิน
                    </option>
                    <option value="1">1</option>
                    <option value="2">2</option>
                  </select>
                </div>

                <div className="w-full">
                  <label className="font-regular mb-2 block text-sm text-gray-600 dark:text-gray-400">
                    ปีการประเมิน
                  </label>
                  <input
                    name="year"
                    value={editRoundList.year}
                    onChange={(e) =>
                      setEditRoundList((editRoundList) => ({
                        ...editRoundList,
                        year: e.target.value,
                      }))
                    }
                    type="number"
                    placeholder="ป้อนปีการประเมิน"
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
                  value={editRoundList.date_start}
                  onChange={(e) =>
                    setEditRoundList((editRoundList) => ({
                      ...editRoundList,
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
                  value={editRoundList.date_end}
                  onChange={(e) =>
                    setEditRoundList((editRoundList) => ({
                      ...editRoundList,
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
                className="text-md z-50 flex w-20 cursor-pointer items-center justify-center rounded-md border-2 border-gray-200 bg-gray-200 px-4 py-2 text-gray-600 transition duration-300 ease-in-out hover:border-gray-300 hover:bg-gray-300 dark:border-zinc-700 dark:bg-zinc-700 dark:text-gray-400 dark:hover:border-zinc-600 dark:hover:bg-zinc-600"
              >
                ยกเลิก
              </label>
              
              <button
                type="submit"
                className="text-md flex w-20 items-center justify-center text-nowrap rounded-md bg-success px-4 py-2 text-white transition duration-300 ease-in-out hover:bg-success/80"
              >
                บันทึก
              </button>
            </div>
          </form>
        </div>
        <label
          className="modal-backdrop"
          htmlFor={`modal-edit`}
        >
          Close
        </label>
      </div>
    </div>
  )
}
