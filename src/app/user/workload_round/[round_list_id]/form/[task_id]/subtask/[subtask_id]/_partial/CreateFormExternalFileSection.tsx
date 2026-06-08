'use client'

import type { DropzoneInputProps, DropzoneRootProps } from 'react-dropzone'
import { X } from 'lucide-react'

interface CreateFormExternalFileSectionProps {
  uploadedFiles: File[]
  handleRemoveFile: (file: File) => void
  getRootProps: () => DropzoneRootProps
  getInputProps: () => DropzoneInputProps
  isDragActive: boolean
}

export default function CreateFormExternalFileSection({
  uploadedFiles,
  handleRemoveFile,
  getRootProps,
  getInputProps,
  isDragActive,
}: CreateFormExternalFileSectionProps) {
  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`flex w-full flex-col items-center justify-center rounded-md border-2 border-dashed py-2 transition-all duration-300 ease-in-out ${
          isDragActive
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30'
            : 'border-gray-300 dark:border-zinc-600 dark:bg-zinc-800'
        } cursor-pointer hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30`}
      >
        <input {...getInputProps()} name="workload_file" />
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {isDragActive
            ? 'วางไฟล์ที่นี่ ...'
            : 'ลากและวางไฟล์ที่นี่ หรือคลิกเพื่อเลือกไฟล์'}
        </p>
        <p className="text-xs text-gray-400 dark:text-gray-400">
          (ขนาดไฟล์ไม่เกิน 10 MB รองรับไฟล์)
        </p>
      </div>
      {uploadedFiles.length > 0 && (
        <div className="mt-2">
          <p className="mb-2 text-sm text-gray-600 dark:text-gray-400">
            ไฟล์ที่เพิ่ม:
          </p>
          <ul className="space-y-2">
            {uploadedFiles.map((file, index) => (
              <li
                key={index}
                className="flex items-center justify-between rounded-md bg-gray-100 p-2 text-sm text-gray-600 dark:bg-zinc-700 dark:text-gray-400"
              >
                <span>
                  {file.name} ({(file.size / 1024).toFixed(2)} KB)
                </span>
                <button
                  type="button"
                  onClick={() => handleRemoveFile(file)}
                  className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                >
                  <X className="h-5 w-5" />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
