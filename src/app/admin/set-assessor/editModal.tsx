"use client"

import { CalendarClock} from "lucide-react"
import { useState, useEffect } from "react"
import type React from "react"

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
    },
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
      if (!dateString) return ""
  
      try {
        const date = new Date(dateString)
        if (isNaN(date.getTime())) return dateString
  
        // แปลงวันที่ให้อยู่ในโซนเวลาไทย
        const thailandOffset = 7 * 60 // UTC+7 เป็นนาที
        const localDate = new Date(date.getTime() + thailandOffset * 60000)
  
        return localDate.toISOString().split("T")[0]
      } catch (error) {
        console.error("Error formatting date:", error)
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
      <input type="checkbox" id={`modal-edit${round_list_id}`} className="modal-toggle" />
      <div className="modal" role={`modal-edit${round_list_id}`}>
        <div className="modal-box rounded-md dark:bg-zinc-800">
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
            <div className="flex items-center">
              <CalendarClock className="text-business1 dark:text-blue-500/80 mr-2 w-7 h-7" />
              <h3 className="flex text-2xl font-regular truncate text-start text-gray-600 dark:text-gray-400">
                แก้ไข&nbsp;
                <span className="font-semibold text-business1 truncate dark:text-blue-500/80">{round_list_name}</span>
              </h3>
            </div>
            <div className="flex-col justify-between space-y-4 py-4">
              <div className="w-full flex justify-between items-center gap-4">
                <div className="w-full">
                  <label className="block text-sm font-regular text-gray-600 dark:text-gray-400 mb-2">
                    รอบการประเมิน
                  </label>
                  <select
                    name="round"
                    value={editRoundList.round.toString()}
                    onChange={(e) =>
                      setEditRoundList((editRoundList) => ({ ...editRoundList, round: Number(e.target.value) }))
                    }
                    className="w-full px-4 py-2 font-light rounded-md text-sm border-2 border-gray-300 dark:border-zinc-600 text-gray-600 dark:bg-zinc-800 dark:text-gray-400 focus:outline-none focus:border-blue-500 transition-colors transition-all duration-300 ease-in-out"
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
                  <label className="block text-sm font-regular text-gray-600 dark:text-gray-400 mb-2">ปีการประเมิน</label>
                  <input
                    name="year"
                    value={editRoundList.year}
                    onChange={(e) => setEditRoundList((editRoundList) => ({ ...editRoundList, year: e.target.value }))}
                    type="number"
                    placeholder="ป้อนปีการประเมิน"
                    className="w-full h-full px-4 py-2 font-light rounded-md text-sm border-2 border-gray-300 dark:border-zinc-600 text-gray-600 dark:bg-zinc-800 dark:text-gray-400 focus:outline-none focus:border-blue-500 transition-colors transition-all duration-300 ease-in-out"
                    required
                  />
                </div>
              </div>
              <div className="w-full">
                <label className="block text-sm font-regular text-gray-600 dark:text-gray-400 mb-2">วันที่เริ่มต้น</label>
                <input
                  name="date_start"
                  value={editRoundList.date_start}
                  onChange={(e) =>
                    setEditRoundList((editRoundList) => ({ ...editRoundList, date_start: e.target.value }))
                  }
                  type="date"
                  className="w-full px-4 py-2 font-light rounded-md text-sm border-2 border-gray-300 dark:border-zinc-600 text-gray-600 dark:bg-zinc-800 dark:text-gray-400 focus:outline-none focus:border-blue-500 transition-colors transition-all duration-300 ease-in-out"
                  required
                />
              </div>
              <div className="w-full">
                <label className="block text-sm font-regular text-gray-600 dark:text-gray-400 mb-2">วันที่สิ้นสุด</label>
                <input
                  name="date_end"
                  value={editRoundList.date_end}
                  onChange={(e) =>
                    setEditRoundList((editRoundList) => ({ ...editRoundList, date_end: e.target.value }))
                  }
                  type="date"
                  className="w-full px-4 py-2 font-light rounded-md text-sm border-2 border-gray-300 dark:border-zinc-600 text-gray-600 dark:bg-zinc-800 dark:text-gray-400 focus:outline-none focus:border-blue-500 transition-colors transition-all duration-300 ease-in-out"
                  required
                />
              </div>
            </div>
            <div className="flex justify-end gap-4 mt-6">
              <button
                type="submit"
                className="w-20 bg-yellow-500 flex items-center justify-center text-md text-white rounded-md py-2 px-4 hover:bg-yellow-500/80 transition ease-in-out duration-300 text-nowrap"
              >
                บันทึก
              </button>
              <label
                htmlFor={`modal-edit${round_list_id}`}
                className="z-50 w-20 border border-2 border-gray-200 flex items-center justify-center bg-gray-200 text-md text-gray-600 rounded-md py-2 px-4 hover:bg-gray-300 hover:border-gray-300 dark:bg-zinc-700 dark:text-gray-400 dark:hover:bg-zinc-600 dark:hover:border-zinc-600 dark:border-zinc-700 transition ease-in-out duration-300 cursor-pointer"
              >
                ยกเลิก
              </label>
            </div>
          </form>
        </div>
        <label className="modal-backdrop" htmlFor={`modal-edit${round_list_id}`}>
          Close
        </label>
      </div>
    </div>
  )
}

