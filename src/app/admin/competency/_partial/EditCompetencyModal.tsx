'use client'

import { useEffect, useState } from 'react'
import type React from 'react'
import type { Competency, UpdateCompetencyRequest } from '@/Types'

interface EditCompetencyModalProps {
  competency: Competency | null
  onSubmit: (id: number, data: UpdateCompetencyRequest) => void
}

// daisyui modal เปิด/ปิดด้วย checkbox id="modal-edit"
export default function EditCompetencyModal({
  competency,
  onSubmit,
}: EditCompetencyModalProps) {
  const [name, setName] = useState('')
  const [order, setOrder] = useState(0)

  // sync ค่าเมื่อเลือกสมรรถนะที่จะแก้ไข
  useEffect(() => {
    setName(competency?.competency_name ?? '')
    setOrder(competency?.competency_order ?? 0)
  }, [competency])

  if (!competency) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(competency.competency_id, {
      competency_name: name,
      competency_order: order,
    })
    const modal = document.getElementById('modal-edit') as HTMLInputElement | null
    if (modal) modal.checked = false
  }

  return (
    <div className="relative z-[100]">
      <input type="checkbox" id="modal-edit" className="modal-toggle" />
      <div className="modal" role="dialog">
        <div className="modal-box rounded-md p-0 dark:bg-zinc-800">
          <form onSubmit={handleSubmit}>
            <div className="flex items-center border-b border-gray-200 p-4">
              <h3 className="font-regular flex truncate text-start text-2xl text-gray-600 dark:text-gray-400">
                แก้ไขสมรรถนะ&nbsp;
                <span className="truncate font-semibold text-business1 dark:text-blue-500/80">
                  {competency.competency_name}
                </span>
              </h3>
            </div>
            <div className="space-y-4 p-4">
              <div>
                <label className="font-regular mb-2 block text-sm text-gray-600 dark:text-gray-400">
                  ชื่อสมรรถนะ
                </label>
                <input
                  name="competency_name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  type="text"
                  className="w-full rounded-md border border-gray-300 px-4 py-2 text-sm font-light text-gray-600 transition-all duration-300 ease-in-out focus:border-blue-500 focus:outline-none dark:border-zinc-600 dark:bg-zinc-800 dark:text-gray-400"
                  placeholder="กรุณากรอกชื่อสมรรถนะ"
                  required
                />
              </div>
              <div>
                <label className="font-regular mb-2 block text-sm text-gray-600 dark:text-gray-400">
                  ลำดับ
                </label>
                <input
                  name="competency_order"
                  value={order || ''}
                  onChange={(e) => setOrder(parseInt(e.target.value) || 0)}
                  type="number"
                  min="1"
                  className="w-full rounded-md border border-gray-300 px-4 py-2 text-sm font-light text-gray-600 transition-all duration-300 ease-in-out focus:border-blue-500 focus:outline-none dark:border-zinc-600 dark:bg-zinc-800 dark:text-gray-400"
                  placeholder="กรุณากรอกลำดับ"
                  required
                />
              </div>
            </div>
            <div className="flex justify-end gap-4 border-t border-gray-200 p-4">
              <label
                htmlFor="modal-edit"
                className="text-md z-50 flex h-10 w-20 cursor-pointer items-center justify-center rounded-md border-2 border-gray-200 bg-gray-200 px-4 text-gray-600 transition duration-300 ease-in-out hover:border-gray-300 hover:bg-gray-300 dark:border-zinc-700 dark:bg-zinc-700 dark:text-gray-400 dark:hover:border-zinc-600 dark:hover:bg-zinc-600"
              >
                ยกเลิก
              </label>
              <button
                type="submit"
                className="text-md flex h-10 w-20 items-center justify-center text-nowrap rounded-md bg-success px-4 text-white transition duration-300 ease-in-out hover:bg-success/80"
              >
                บันทึก
              </button>
            </div>
          </form>
        </div>
        <label className="modal-backdrop" htmlFor="modal-edit">
          Close
        </label>
      </div>
    </div>
  )
}
