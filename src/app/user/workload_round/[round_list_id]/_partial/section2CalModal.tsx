'use client'

import type { ReactNode } from 'react'

interface Section2CalModalProps {
  isOpen: boolean
  onClose: () => void
  children: ReactNode
  title?: string
}

export default function Section2CalModal({
  isOpen,
  onClose,
  title,
  children,
}: Section2CalModalProps) {
  if (!isOpen) return null

  return (
    <div className="relative z-[100]">
      <input
        type="checkbox"
        id="section2-cal-modal"
        className="modal-toggle"
        checked={isOpen}
        readOnly
      />
      <div className="modal" role="dialog" aria-labelledby="section2-cal-modal-title">
        <div className="modal-box rounded-md dark:bg-zinc-800 p-0">
          <div className="flex items-center p-4">
            <h3
              id="section2-cal-modal-title"
              className="font-regular w-full text-start text-2xl text-gray-600 dark:text-gray-300"
            >
              {title ?? 'รายละเอียด'}
            </h3>
          </div>
          <div className="p-4 text-gray-600 dark:text-gray-300">{children}</div>
          <div className="flex justify-end p-4">
            <button
              type="button"
              onClick={onClose}
              className="text-md flex h-10 w-20 items-center justify-center rounded-md border border-gray-200 bg-gray-200 px-4 py-2 text-gray-600 transition duration-300 ease-in-out hover:border-gray-300 hover:bg-gray-300 dark:border-zinc-700 dark:bg-zinc-700 dark:text-gray-300 dark:hover:border-zinc-600 dark:hover:bg-zinc-600"
            >
              ปิด
            </button>
          </div>
        </div>
        <label className="modal-backdrop" htmlFor="section2-cal-modal" onClick={onClose}>
          Close
        </label>
      </div>
    </div>
  )
}