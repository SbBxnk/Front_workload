'use client'

import { X, Plus } from 'lucide-react'

import type { EditFormLinkData } from './editFormModalTypes'

interface EditFormLinkSectionProps {
  links: EditFormLinkData[]
  handleRemoveLink: (index: number) => void
  handleLinkChange: (
    index: number,
    field: 'link_path' | 'link_name',
    value: string
  ) => void
  handleAddLink: () => void
}

export default function EditFormLinkSection({
  links,
  handleRemoveLink,
  handleLinkChange,
  handleAddLink,
}: EditFormLinkSectionProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-4">
        {links.map((link, index) => (
          <div
            key={link.link_id || `new-link-${index}`}
            className="flex flex-col space-y-2 rounded-md border border-gray-200 p-3 dark:border-zinc-700"
          >
            <div className="flex items-center justify-between">
              <span
                className={`text-sm font-medium ${link.link_id ? 'text-gray-600' : 'text-green-500'} dark:text-gray-400`}
              >
                ลิงก์ #{index + 1} {link.link_id ? `` : '(ใหม่)'}
              </span>
              <button
                type="button"
                onClick={() => handleRemoveLink(index)}
                className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <input
              type="text"
              placeholder="ชื่อที่ต้องการแสดง"
              value={link.link_name}
              onChange={(e) =>
                handleLinkChange(index, 'link_name', e.target.value)
              }
              className="w-full rounded-md border-2 border-gray-300 px-4 py-2 text-sm font-light text-gray-600 transition-all duration-300 ease-in-out focus:border-blue-500 focus:outline-none dark:border-zinc-600 dark:bg-zinc-800 dark:text-gray-400"
            />
            <input
              type="url"
              placeholder="https://example.com"
              value={link.link_path}
              onChange={(e) =>
                handleLinkChange(index, 'link_path', e.target.value)
              }
              className="w-full rounded-md border-2 border-gray-300 px-4 py-2 text-sm font-light text-gray-600 transition-all duration-300 ease-in-out focus:border-blue-500 focus:outline-none dark:border-zinc-600 dark:bg-zinc-800 dark:text-gray-400"
            />
            {link.link_id && (
              <input type="hidden" name={`link_ids[]`} value={link.link_id} />
            )}
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={handleAddLink}
        className="flex w-full cursor-pointer items-center justify-center rounded-lg border border-blue-300 py-2 text-sm font-medium text-blue-600 duration-150 hover:border-blue-400 hover:text-blue-700 dark:border-blue-800 dark:text-blue-400 dark:hover:border-blue-700"
      >
        <Plus className="mr-2 h-4 w-4" />
        เพิ่มลิงก์
      </button>
    </div>
  )
}
