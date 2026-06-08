'use client'

import { Link, Upload } from 'lucide-react'

interface CreateFormFieldsProps {
  evidenceType: 'link' | 'external file' | 'file in system'
  handleEvidenceTypeChange: (
    type: 'link' | 'external file' | 'file in system'
  ) => void
}

export default function CreateFormFields({
  evidenceType,
  handleEvidenceTypeChange,
}: CreateFormFieldsProps) {
  return (
    <>
      <div className="col-span-1 md:col-span-2">
        <label className="font-regular mb-2 block text-sm text-gray-600 dark:text-gray-400">
          ภาระงาน/กิจกรรม/โครงการ/งาน
        </label>
        <input
          name="form_title"
          type="text"
          placeholder="ภาระงาน/กิจกรรม/โครงการ/งาน"
          className="w-full rounded-md border-2 border-gray-300 px-4 py-2 text-sm font-light text-gray-600 transition-all duration-300 ease-in-out focus:border-blue-500 focus:outline-none dark:border-zinc-600 dark:bg-zinc-800 dark:text-gray-400"
          required
        />
      </div>

      <div className="col-span-1 md:col-span-2">
        <label className="font-regular mb-2 block text-sm text-gray-600 dark:text-gray-400">
          ประเภทไฟล์หลักฐาน
        </label>
        <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
          <label
            className={`flex cursor-pointer items-center justify-center rounded-md border-2 px-4 py-2 text-sm font-light text-gray-600 transition-all duration-300 ease-in-out dark:bg-zinc-800 dark:text-gray-400 ${
              evidenceType === 'link'
                ? 'border-blue-500 bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                : 'border-gray-300 hover:border-blue-500 hover:bg-blue-50 dark:border-zinc-600 dark:hover:bg-blue-900/30'
            }`}
          >
            <input
              type="checkbox"
              name="file_type"
              value="link"
              checked={evidenceType === 'link'}
              onChange={() => handleEvidenceTypeChange('link')}
              className="hidden"
            />
            <Link className="mr-2 h-4 w-4" />
            ลิ้งก์
          </label>
          <label
            className={`flex cursor-pointer items-center justify-center rounded-md border-2 px-4 py-2 text-sm font-light text-gray-600 transition-all duration-300 ease-in-out dark:bg-zinc-800 dark:text-gray-400 ${
              evidenceType === 'external file'
                ? 'border-blue-500 bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                : 'border-gray-300 hover:border-blue-500 hover:bg-blue-50 dark:border-zinc-600 dark:hover:bg-blue-900/30'
            }`}
          >
            <input
              type="checkbox"
              name="file_type"
              value="external file"
              checked={evidenceType === 'external file'}
              onChange={() => handleEvidenceTypeChange('external file')}
              className="hidden"
            />
            <Upload className="mr-2 h-4 w-4" />
            อัปโหลดไฟล์จากเครื่อง
          </label>
        </div>
        <input type="hidden" name="file_type" value={evidenceType} />
      </div>
    </>
  )
}
