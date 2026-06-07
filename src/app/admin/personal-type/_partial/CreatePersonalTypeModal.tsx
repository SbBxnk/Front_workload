'use client'

import { useState } from 'react'
import type React from 'react'

interface CreatePersonalTypeModalProps {
  onSubmit: (typePName: string) => void
}

// daisyui modal เปิด/ปิดด้วย checkbox id="modal-create"
export default function CreatePersonalTypeModal({ onSubmit }: CreatePersonalTypeModalProps) {
  const [typePName, setTypePName] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(typePName)
    setTypePName('')
    const modal = document.getElementById('modal-create') as HTMLInputElement | null
    if (modal) modal.checked = false
  }

  return (
    <div className="relative z-[100]">
      <input type="checkbox" id="modal-create" className="modal-toggle" />
      <div className="modal" role="dialog">
        <div className="modal-box rounded-md p-0 dark:bg-zinc-800">
          <form onSubmit={handleSubmit}>
            <div className="flex items-center border-b border-gray-200 p-4">
              <h3 className="font-regular flex truncate text-start text-2xl text-gray-600 dark:text-gray-400">
                เพิ่มประเภทบุคลากร&nbsp;
              </h3>
            </div>
            <div className="p-4">
              <label className="font-regular mb-2 block text-sm text-gray-600 dark:text-gray-400">
                ประเภทบุคลากร
              </label>
              <input
                name="type_p_name"
                value={typePName}
                onChange={(e) => setTypePName(e.target.value)}
                type="text"
                className="w-full rounded-md border border-gray-300 px-4 py-2 text-sm font-light text-gray-600 transition-all duration-300 ease-in-out focus:border-blue-500 focus:outline-none dark:border-zinc-600 dark:bg-zinc-800 dark:text-gray-400"
                placeholder="กรุณากรอกประเภทบุคลากร"
              />
            </div>
            <div className="flex justify-end gap-4 border-t border-gray-200 p-4">
              <label
                htmlFor="modal-create"
                className="text-md flex h-10 w-20 cursor-pointer items-center justify-center rounded-md border-2 border-gray-200 bg-gray-200 px-4 font-light text-gray-600 transition duration-300 ease-in-out hover:border-gray-300 hover:bg-gray-300 dark:border-zinc-700 dark:bg-zinc-700 dark:text-gray-400 dark:hover:border-zinc-600 dark:hover:bg-zinc-600"
              >
                ยกเลิก
              </label>
              <button
                type="submit"
                className="text-md flex h-10 w-20 items-center justify-center rounded-md bg-success px-4 font-light text-white transition duration-300 ease-in-out hover:bg-success/80"
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
