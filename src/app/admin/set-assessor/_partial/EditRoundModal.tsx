'use client'

import { useEffect, useState } from 'react'
import SelectDropdown, { type SelectOption } from '@/components/SelectValue'
import SetAssessorServices from '@/services/setAssessorServices'
import type { RoundList, UpdateRoundListRequest } from '@/Types/setAssessor'

interface EditRoundModalProps {
  roundListId: number
  onSubmit: (roundListId: number, data: UpdateRoundListRequest) => void
}

const EMPTY_ROUND: RoundList = {
  round_list_id: 0,
  year: '',
  round_list_name: '',
  round: 0,
  date_start: '',
  date_end: '',
}

const roundOptions: SelectOption[] = [
  { value: 1, label: '1' },
  { value: 2, label: '2' },
]

const toDateInput = (value: string) =>
  value ? new Date(value).toISOString().split('T')[0] : ''

export default function EditRoundModal({
  roundListId,
  onSubmit,
}: EditRoundModalProps) {
  const [editRound, setEditRound] = useState<RoundList | null>(null)
  const [loading, setLoading] = useState(true)

  // ดึงข้อมูลเมื่อ round_list_id เปลี่ยน (เปิด modal)
  useEffect(() => {
    const fetchData = async () => {
      if (!roundListId) {
        setLoading(false)
        return
      }
      setLoading(true)
      try {
        const response = await SetAssessorServices.getRoundListById(roundListId)
        if (response.success && response.payload) {
          const data = Array.isArray(response.payload)
            ? response.payload[0]
            : response.payload
          setEditRound({
            round_list_id: data.round_list_id || 0,
            year: data.year || '',
            round_list_name: data.round_list_name || '',
            round: data.round || 0,
            date_start: toDateInput(data.date_start),
            date_end: toDateInput(data.date_end),
          })
        }
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [roundListId])

  const closeModal = () => {
    const el = document.getElementById('modal-edit') as HTMLInputElement | null
    if (el) el.checked = false
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!editRound) return
    onSubmit(roundListId, {
      round_list_name: `รอบการประเมินภาระงานที่ ${editRound.round}/${editRound.year}`,
      year: editRound.year,
      round: editRound.round,
      date_start: editRound.date_start,
      date_end: editRound.date_end,
    })
    closeModal()
  }

  return (
    <div className="relative z-[100]">
      <input type="checkbox" id="modal-edit" className="modal-toggle" />
      <div className="modal" role="dialog">
        <div className="modal-box rounded-md p-0 dark:bg-zinc-800">
          {loading ? (
            <div className="p-4">
              <div className="mb-4 flex items-center border-b border-gray-200 pb-4">
                <div className="h-8 w-64 animate-pulse rounded bg-gray-200 dark:bg-zinc-700"></div>
              </div>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="w-full">
                    <div className="mb-2 h-4 w-24 animate-pulse rounded bg-gray-200 dark:bg-zinc-700"></div>
                    <div className="h-10 animate-pulse rounded bg-gray-200 dark:bg-zinc-700"></div>
                  </div>
                  <div className="w-full">
                    <div className="mb-2 h-4 w-20 animate-pulse rounded bg-gray-200 dark:bg-zinc-700"></div>
                    <div className="h-10 animate-pulse rounded bg-gray-200 dark:bg-zinc-700"></div>
                  </div>
                </div>
                <div className="w-full">
                  <div className="mb-2 h-4 w-24 animate-pulse rounded bg-gray-200 dark:bg-zinc-700"></div>
                  <div className="h-10 animate-pulse rounded bg-gray-200 dark:bg-zinc-700"></div>
                </div>
                <div className="w-full">
                  <div className="mb-2 h-4 w-20 animate-pulse rounded bg-gray-200 dark:bg-zinc-700"></div>
                  <div className="h-10 animate-pulse rounded bg-gray-200 dark:bg-zinc-700"></div>
                </div>
              </div>
              <div className="mt-4 flex justify-end gap-4 border-t border-gray-200 pt-4">
                <div className="h-10 w-20 animate-pulse rounded bg-gray-200 dark:bg-zinc-700"></div>
                <div className="h-10 w-20 animate-pulse rounded bg-gray-200 dark:bg-zinc-700"></div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="flex items-center border-b border-gray-200 p-4">
                <h3 className="font-regular flex truncate text-start text-2xl text-gray-600 dark:text-gray-400">
                  แก้ไขรอบการประเมิน&nbsp;
                  <span className="truncate font-semibold text-business1 dark:text-blue-500/80">
                    {editRound?.round_list_name || ''}
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
                        value={
                          roundOptions.find(
                            (o) => o.value === editRound?.round
                          ) || null
                        }
                        onChange={(selected) =>
                          setEditRound((prev) =>
                            selected
                              ? { ...(prev ?? EMPTY_ROUND), round: selected.value as number }
                              : EMPTY_ROUND
                          )
                        }
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
                        value={editRound?.year || ''}
                        onChange={(e) =>
                          setEditRound((prev) => ({
                            ...(prev ?? EMPTY_ROUND),
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
                      value={editRound?.date_start || ''}
                      onChange={(e) =>
                        setEditRound((prev) => ({
                          ...(prev ?? EMPTY_ROUND),
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
                      value={editRound?.date_end || ''}
                      onChange={(e) =>
                        setEditRound((prev) => ({
                          ...(prev ?? EMPTY_ROUND),
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
                  htmlFor="modal-edit"
                  className="text-md z-50 flex h-10 w-20 cursor-pointer items-center justify-center rounded-md border-2 border-gray-200 bg-gray-200 px-4 py-2 text-gray-600 transition duration-300 ease-in-out hover:border-gray-300 hover:bg-gray-300 dark:border-zinc-700 dark:bg-zinc-700 dark:text-gray-400 dark:hover:border-zinc-600 dark:hover:bg-zinc-600"
                >
                  ยกเลิก
                </label>
                <button
                  type="submit"
                  className="text-md flex h-10 w-20 items-center justify-center text-nowrap rounded-md bg-success px-4 py-2 text-white transition duration-300 ease-in-out hover:bg-success/80"
                >
                  บันทึก
                </button>
              </div>
            </form>
          )}
        </div>
        <label className="modal-backdrop" htmlFor="modal-edit">
          Close
        </label>
      </div>
    </div>
  )
}
