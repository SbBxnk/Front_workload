'use client'

import { useState } from 'react'
import SelectDropdown, { type SelectOption } from '@/components/SelectValue'
import type { CreateRoundListRequest } from '@/Types/setAssessor'

interface CreateRoundModalProps {
  onSubmit: (data: CreateRoundListRequest) => void
}

interface FormState {
  date_start: string
  date_end: string
  year: string
  round: number
}

const EMPTY_FORM: FormState = {
  date_start: '',
  date_end: '',
  year: '',
  round: 0,
}

const roundOptions: SelectOption[] = [
  { value: 1, label: '1' },
  { value: 2, label: '2' },
]

export default function CreateRoundModal({ onSubmit }: CreateRoundModalProps) {
  const [form, setForm] = useState<FormState>(EMPTY_FORM)

  const closeModal = () => {
    const el = document.getElementById('modal-create') as HTMLInputElement | null
    if (el) el.checked = false
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    onSubmit({
      ...form,
      round_list_name: `รอบการประเมินภาระงานที่ ${form.round}/${form.year}`,
    })
    setForm(EMPTY_FORM)
    closeModal()
  }

  return (
    <div className="relative z-[100]">
      <input type="checkbox" id="modal-create" className="modal-toggle" />
      <div className="modal" role="dialog">
        <div className="modal-box rounded-md p-0 dark:bg-zinc-800">
          <form onSubmit={handleSubmit}>
            <div className="flex items-center border-b border-gray-200 p-4">
              <h3 className="font-regular flex truncate text-start text-2xl text-gray-600 dark:text-gray-400">
                เพิ่มรอบการประเมิน&nbsp;
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
                        roundOptions.find((o) => o.value === form.round) || null
                      }
                      onChange={(selected) =>
                        setForm((prev) => ({
                          ...prev,
                          round: selected ? (selected.value as number) : 0,
                        }))
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
                      value={form.year}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, year: e.target.value }))
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
                    value={form.date_start}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
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
                    value={form.date_end}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, date_end: e.target.value }))
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
                htmlFor="modal-create"
                className="text-md z-50 flex h-10 w-20 cursor-pointer items-center justify-center rounded-md border-2 border-gray-200 bg-gray-200 px-4 py-2 text-gray-600 transition duration-300 ease-in-out hover:border-gray-300 hover:bg-gray-300 dark:border-zinc-700 dark:bg-zinc-700 dark:text-gray-400 dark:hover:border-zinc-600 dark:hover:bg-zinc-600"
              >
                ยกเลิก
              </label>
              <button
                type="submit"
                className="text-md flex h-10 w-20 items-center justify-center rounded-md bg-success px-4 py-2 text-white transition duration-300 ease-in-out hover:bg-success/80 hover:text-white"
              >
                ยืนยัน
              </button>
            </div>
          </form>
        </div>
        <label className="modal-backdrop" htmlFor="modal-create">
          Close
        </label>
      </div>
    </div>
  )
}
