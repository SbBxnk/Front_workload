'use client'
import {
  Trash2,
  FileText,
  LinkIcon,
  ChevronDown,
  MoreVertical,
  PenSquare,
  ImageIcon,
} from 'lucide-react'
import { BASE_URL_FILE } from '@/provider/config'
import {
  isImageFile,
  type FileData,
  type FileInfo,
  type FormInfo,
  type LinkData,
} from './types'

interface FormItemCardProps {
  form: FormInfo & { total_score: number }
  index: number
  subtaskIndex: string
  isOpen: boolean
  dropdownOpen: boolean
  formFiles: { [form_id: number]: FileData[] }
  formLinks: { [form_id: number]: LinkData[] }
  formSystemFiles: { [form_id: number]: FileData }
  fileInfos: { [form_id: number]: FileInfo[] }
  toggleForm: (index: number) => void
  toggleDropdown: (index: number) => void
  closeDropdown: (index: number) => void
  handleEdit: (form_id: number) => void
  handleDelete: (form_id: number) => void
  handleViewEvidence: (fileInfo: FileInfo) => void
}

export default function FormItemCard({
  form,
  index,
  subtaskIndex,
  isOpen,
  dropdownOpen,
  formFiles,
  formLinks,
  formSystemFiles,
  fileInfos,
  toggleForm,
  toggleDropdown,
  closeDropdown,
  handleEdit,
  handleDelete,
  handleViewEvidence,
}: FormItemCardProps) {
  return (
    <div
      className={`border-l-4 border-business1/50 bg-gray-50 p-4 shadow-sm dark:border dark:border-zinc-700 dark:bg-zinc-800`}
    >
      <div
        className={`flex items-center justify-between ${isOpen ? 'mb-2' : 'mb-0'} `}
      >
        <button
          onClick={() => toggleForm(index)}
          className="flex max-w-[90%] items-center text-left break-words whitespace-normal text-[16px] font-normal text-business1/80 hover:text-business1 dark:text-gray-200 dark:hover:text-gray-100 md:max-w-full md:text-lg"
        >
          <ChevronDown
            className={`mr-2 h-10 w-10 transform transition-transform duration-300 md:h-5 md:w-5${
              isOpen ? 'rotate-180' : ''
            }`}
          />
          {subtaskIndex}.{index + 1} {form.form_title}
        </button>
        <div className="dropdown-container relative">
          <button
            onClick={() => toggleDropdown(index)}
            className="text-gray-500 transition-colors duration-150 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-300"
            title="ตัวเลือกเพิ่มเติม"
          >
            <MoreVertical className="h-5 w-5" />
          </button>
          {dropdownOpen && (
            <div className="absolute right-0 z-10 mt-2 w-48 rounded-md border border-gray-200 bg-white shadow-lg dark:border-zinc-700 dark:bg-zinc-800">
              <button
                onClick={() => {
                  handleEdit(form.form_id)
                  closeDropdown(index)
                }}
                className="flex w-full items-center px-4 py-2 text-sm transition-colors duration-150 hover:bg-gray-100 dark:hover:bg-zinc-700"
              >
                <PenSquare className="mr-2 h-4 w-4 text-amber-500" />
                <p className="m-0 text-gray-600 dark:text-gray-400">
                  แก้ไขรายละเอียด
                </p>
              </button>
              <button
                onClick={() => {
                  handleDelete(form.form_id)
                  closeDropdown(index)
                }}
                className="flex w-full items-center px-4 py-2 text-sm transition-colors duration-150 hover:bg-gray-100 dark:hover:bg-zinc-700"
              >
                <Trash2 className="mr-2 h-4 w-4 text-red-500" />
                <p className="m-0 text-gray-600 dark:text-gray-400">
                  ลบรายการ
                </p>
              </button>
            </div>
          )}
        </div>
      </div>

      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          isOpen
            ? 'max-h-[1000px] translate-y-0 opacity-100'
            : 'max-h-0 translate-y-2 opacity-0'
        }`}
      >
        <div className="ml-4 grid grid-cols-1 gap-2 rounded-xl bg-gray-50 dark:bg-gray-800 md:grid-cols-3">
          <div className="grid gap-2 md:col-span-2">
            <div className="rounded-lg bg-white p-4 transition-all duration-200 dark:bg-gray-900">
              <p className="text-sm font-light text-gray-500 dark:text-gray-400">
                คำอธิบาย:
              </p>
              <p className="mt-1 text-left break-words whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-300">
                {form.description}
              </p>
            </div>
            <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
              <div className="rounded-lg bg-white p-4 transition-all duration-200 dark:bg-gray-900">
                <p className="text-sm font-light text-gray-500 dark:text-gray-400">
                  ภาระงาน:
                </p>
                <p className="mt-1 text-left break-words text-sm text-gray-700 dark:text-gray-300">
                  {form.workload}
                </p>
              </div>
              <div className="rounded-lg bg-white p-4 transition-all duration-200 dark:bg-gray-900">
                <p className="text-sm font-light text-gray-500 dark:text-gray-400">
                  จำนวน:
                </p>
                <p className="mt-1 text-left break-words text-sm text-gray-700 dark:text-gray-300">
                  {form.quality}
                </p>
              </div>
            </div>
            <div className="rounded-lg bg-white p-4 transition-all duration-200 dark:bg-gray-900">
              <p className="text-sm font-light text-gray-500 dark:text-gray-400">
                รวมภาระงาน:
              </p>
              <p className="mt-1 text-left break-words text-base font-semibold text-gray-800 dark:text-gray-200">
                {form.total_score}
              </p>
            </div>
          </div>
          {/* แก้ไขส่วนการแสดงผลไฟล์หลักฐาน */}
          <div className="h-full">
            {(formFiles[form.form_id]?.length > 0 ||
              formLinks[form.form_id]?.length > 0 ||
              formSystemFiles[form.form_id] ||
              fileInfos[form.form_id]?.length > 0) && (
              <div className="h-full rounded-lg bg-white p-4 transition-all duration-200 dark:bg-gray-900">
                <p className="text-sm font-light text-gray-500 dark:text-gray-400">
                  ไฟล์หลักฐาน:
                </p>
                <ul className="mt-2 space-y-2">
                  {/* ตรวจสอบประเภทของฟอร์มและแสดงผลตามประเภท */}
                  {form.file_type === 'link' &&
                  formLinks[form.form_id]?.length > 0 ? (
                    // แสดงลิงก์ก่อน (สลับลำดับการตรวจสอบ)
                    formLinks[form.form_id].filter(link => link && link.link_path).map(
                      (link: LinkData, index: number) => (
                        <li key={form.form_id ? `link-${form.form_id}-${index}` : `link-temp-${index}`}>
                          <button
                            onClick={() =>
                              window.open(link.link_path, '_blank')
                            }
                            className="flex items-start w-full text-left text-sm text-blue-600 transition-colors duration-150 hover:text-blue-700 hover:underline dark:text-blue-400 dark:hover:text-blue-300"
                          >
                            <LinkIcon className="mr-2 h-5 w-5 flex-shrink-0 text-blue-500 dark:text-blue-400" />
                            <span className="flex-1 break-words whitespace-normal">
                              {link.link_name}
                            </span>
                          </button>
                        </li>
                      )
                    )
                  ) : form.file_type === 'external file' &&
                    formFiles[form.form_id]?.length > 0 ? (
                    // แสดงไฟล์
                    formFiles[form.form_id].filter(file => file && file.file_name).map(
                      (file: FileData, index: number) => (
                        <li key={form.form_id ? `file-${form.form_id}-${index}` : `file-temp-${index}`}>
                          <button
                            onClick={() => {
                              const baseUrl = BASE_URL_FILE
                              const url = `${baseUrl}/files/${file.file_name}`
                              window.open(url, '_blank')
                            }}
                            className="flex items-start w-full text-left text-sm text-blue-600 transition-colors duration-150 hover:text-blue-700 hover:underline dark:text-blue-400 dark:hover:text-blue-300"
                          >
                            {isImageFile(file.file_name) ? (
                              <ImageIcon className="mr-2 h-5 w-5 flex-shrink-0 text-blue-500 dark:text-blue-400" />
                            ) : (
                              <FileText className="mr-2 h-5 w-5 flex-shrink-0 text-blue-500 dark:text-blue-400" />
                            )}
                            <span className="flex-1 break-words whitespace-normal">
                              {file.file_name}
                            </span>
                          </button>
                        </li>
                      )
                    )
                  ) : form.file_type === 'file in system' &&
                    formSystemFiles[form.form_id] ? (
                    <li>
                      <button
                        onClick={() => {
                          const baseUrl = BASE_URL_FILE
                          window.open(
                            `${baseUrl}/files/${formSystemFiles[form.form_id].file_name}`,
                            '_blank'
                          )
                        }}
                        className="flex items-start w-full text-left text-sm text-blue-600 transition-colors duration-150 hover:text-blue-700 hover:underline dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        {isImageFile(
                          formSystemFiles[form.form_id].file_name
                        ) ? (
                          <ImageIcon className="mr-2 h-5 w-5 flex-shrink-0 text-blue-500 dark:text-blue-400" />
                        ) : (
                          <FileText className="mr-2 h-5 w-5 flex-shrink-0 text-blue-500 dark:text-blue-400" />
                        )}
                        <span className="flex-1 break-words whitespace-normal">
                          {formSystemFiles[form.form_id].file_name}
                        </span>
                      </button>
                    </li>
                  ) : fileInfos[form.form_id]?.length > 0 ? (
                    fileInfos[form.form_id].filter(fileInfo => fileInfo && fileInfo.file_name).map((fileInfo, index) => (
                      <li key={fileInfo.fileinfo_id ? `fileinfo-${fileInfo.fileinfo_id}` : `fileinfo-${form.form_id || 'temp'}-${index}`}>
                        <button
                          onClick={() => handleViewEvidence(fileInfo)}
                          className="flex items-start w-full text-left text-sm text-blue-600 transition-colors duration-150 hover:text-blue-700 hover:underline dark:text-blue-400 dark:hover:text-blue-300"
                        >
                          {isImageFile(fileInfo.file_name) ? (
                            <ImageIcon className="mr-2 h-5 w-5 flex-shrink-0 text-blue-500 dark:text-blue-400" />
                          ) : (
                            <FileText className="mr-2 h-5 w-5 flex-shrink-0 text-blue-500 dark:text-blue-400" />
                          )}
                          <span className="flex-1 break-words whitespace-normal">
                            {fileInfo.file_name}
                          </span>
                        </button>
                      </li>
                    ))
                  ) : null}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
