'use client'

import type { DropzoneInputProps, DropzoneRootProps } from 'react-dropzone'
import { X, ImageIcon, FileText } from 'lucide-react'

import { isImageFile } from './editFormModalHelpers'
import type { EditFormFileData } from './editFormModalTypes'

interface EditFormExternalFileSectionProps {
  existingFiles: EditFormFileData[]
  uploadedFiles: File[]
  handleRemoveExistingFile: (fileId: number) => void
  handleRemoveUploadedFile: (index: number) => void
  getRootProps: () => DropzoneRootProps
  getInputProps: () => DropzoneInputProps
  isDragActive: boolean
}

export default function EditFormExternalFileSection({
  existingFiles,
  uploadedFiles,
  handleRemoveExistingFile,
  handleRemoveUploadedFile,
  getRootProps,
  getInputProps,
  isDragActive,
}: EditFormExternalFileSectionProps) {
  return (
    <div className="space-y-4">
      {/* Existing files section */}
      {existingFiles.length > 0 && (
        <div className="mt-2">
          <p className="mb-2 text-sm text-gray-600 dark:text-gray-400">
            ไฟล์ที่มีอยู่:
          </p>
          <ul className="space-y-2">
            {existingFiles.map((file) => (
              <li
                key={
                  file.fileinfo_id ||
                  `file-${file.form_id}-${file.file_name}`
                }
                className="flex items-center justify-between rounded-md bg-gray-100 p-2 text-sm text-gray-600 dark:bg-zinc-700 dark:text-gray-400"
              >
                <div className="flex items-center">
                  {isImageFile(file.file_name) ? (
                    <ImageIcon className="mr-2 h-5 w-5 text-blue-500" />
                  ) : (
                    <FileText className="mr-2 h-5 w-5 text-blue-500" />
                  )}
                  <span>
                    {file.file_name} ({(file.size / 1024).toFixed(2)} KB)
                  </span>
                </div>
                {/* แสดงปุ่มลบเฉพาะเมื่อมีไฟล์มากกว่า 1 ไฟล์ หรือมีไฟล์ที่อัปโหลดใหม่ */}
                {existingFiles.length + uploadedFiles.length > 1 && (
                  <button
                    type="button"
                    onClick={() => {
                      if (file.fileinfo_id) {
                        console.log(
                          `Attempting to remove file: ${file.file_name} with ID: ${file.fileinfo_id}`
                        )
                        handleRemoveExistingFile(file.fileinfo_id)
                      }
                    }}
                    className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                  >
                    <X className="h-5 w-5" />
                  </button>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Upload new files section */}
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

      {/* Newly uploaded files section */}
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
                <div className="flex items-center">
                  {isImageFile(file.name) ? (
                    <ImageIcon className="mr-2 h-5 w-5 text-blue-500" />
                  ) : (
                    <FileText className="mr-2 h-5 w-5 text-blue-500" />
                  )}
                  <span>
                    {file.name} ({(file.size / 1024).toFixed(2)} KB)
                  </span>
                </div>
                {/* แสดงปุ่มลบเฉพาะเมื่อมีไฟล์มากกว่า 1 ไฟล์ */}
                {existingFiles.length + uploadedFiles.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveUploadedFile(index)}
                    className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                  >
                    <X className="h-5 w-5" />
                  </button>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
