'use client'

import { Link, Upload } from 'lucide-react'

import type { EditFormFormData } from './editFormModalTypes'

interface EditFormFieldsProps {
  formDetail: EditFormFormData
  evidenceType: 'link' | 'external file' | 'file in system'
}

export default function EditFormFields({
  formDetail,
  evidenceType,
}: EditFormFieldsProps) {
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
          defaultValue={formDetail.form_title}
          className="w-full rounded-md border-2 border-gray-300 px-4 py-2 text-sm font-light text-gray-600 transition-all duration-300 ease-in-out focus:border-blue-500 focus:outline-none dark:border-zinc-600 dark:bg-zinc-800 dark:text-gray-400"
          required
        />
      </div>

      <div className="col-span-1 md:col-span-2">
        <label className="font-regular mb-2 block text-sm text-gray-600 dark:text-gray-400">
          คำอธิบาย
        </label>
        <textarea
          name="description"
          placeholder="คำอธิบาย"
          defaultValue={formDetail.description}
          className="w-full rounded-md border-2 border-gray-300 px-4 py-2 text-sm font-light text-gray-600 transition-all duration-300 ease-in-out focus:border-blue-500 focus:outline-none dark:border-zinc-600 dark:bg-zinc-800 dark:text-gray-400"
        />
      </div>

      <div className="col-span-1">
        <label className="font-regular mb-2 block text-sm text-gray-600 dark:text-gray-400">
          จำนวน
        </label>
        <input
          name="quality"
          type="number"
          placeholder="จำนวน"
          defaultValue={formDetail.quality}
          className="w-full rounded-md border-2 border-gray-300 px-4 py-2 text-sm font-light text-gray-600 transition-all duration-300 ease-in-out focus:border-blue-500 focus:outline-none dark:border-zinc-600 dark:bg-zinc-800 dark:text-gray-400"
          required
        />
      </div>

      <div className="col-span-1">
        <label className="font-regular mb-2 block text-sm text-gray-600 dark:text-gray-400">
          ภาระงาน
        </label>
        <input
          name="workload"
          type="number"
          placeholder="ภาระงาน"
          defaultValue={formDetail.workload}
          className="w-full rounded-md border-2 border-gray-300 px-4 py-2 text-sm font-light text-gray-600 transition-all duration-300 ease-in-out focus:border-blue-500 focus:outline-none dark:border-zinc-600 dark:bg-zinc-800 dark:text-gray-400"
          required
        />
      </div>

      <div className="col-span-1 md:col-span-2">
        <label className="font-regular mb-2 block text-sm text-gray-600 dark:text-gray-400">
          ประเภทไฟล์หลักฐาน
        </label>
        <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
          <div
            className={`flex items-center justify-center rounded-md border-2 px-4 py-2 text-sm font-light ${
              evidenceType === 'link'
                ? 'border-blue-500 bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                : 'border-gray-300 bg-gray-100 text-gray-400 dark:border-zinc-600 dark:bg-zinc-700 dark:text-gray-500'
            } dark:bg-zinc-800`}
          >
            <Link
              className={`mr-2 h-4 w-4 ${evidenceType !== 'link' ? 'text-gray-400 dark:text-gray-500' : ''}`}
            />
            ลิ้งก์
          </div>
          <div
            className={`flex items-center justify-center rounded-md border-2 px-4 py-2 text-sm font-light ${
              evidenceType === 'external file'
                ? 'border-blue-500 bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                : 'border-gray-300 bg-gray-100 text-gray-400 dark:border-zinc-600 dark:bg-zinc-700 dark:text-gray-500'
            } dark:bg-zinc-800`}
          >
            <Upload
              className={`mr-2 h-4 w-4 ${evidenceType !== 'external file' ? 'text-gray-400 dark:text-gray-500' : ''}`}
            />
            อัปโหลดไฟล์จากเครื่อง
          </div>
        </div>
        <input type="hidden" name="file_type" value={evidenceType} />
      </div>
    </>
  )
}
