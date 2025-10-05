'use client'

import type React from 'react'
import { useState, useEffect } from 'react'
import { useDropzone } from 'react-dropzone'
import { X, Link, Upload, CalendarClock, Plus } from 'lucide-react'

interface CreateModalProps {
  onSubmit: (
    event: React.FormEvent<HTMLFormElement>,
    uploadedFiles: File[],
    links?: { link_path: string; link_name: string }[],
    fileInSystem?: string,
    fileName?: string
  ) => void
}

export default function CreateModal({ onSubmit }: CreateModalProps) {
  const [evidenceType, setEvidenceType] = useState<
    'link' | 'external file' | 'file in system'
  >('link')
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  // เริ่มต้นด้วยลิงก์เปล่า 3 ลิงก์
  const [links, setLinks] = useState<
    { link_path: string; link_name: string }[]
  >([
    { link_path: '', link_name: '' },
    { link_path: '', link_name: '' },
    { link_path: '', link_name: '' },
  ])
  const [fileInSystem, setFileInSystem] = useState<string>('')
  const [fileName, setFileName] = useState<string>('')

  // เพิ่ม useEffect เพื่อรีเซ็ตลิงก์เมื่อปิด modal
  useEffect(() => {
    const modalCheckbox = document.getElementById(
      'modal-forminfo'
    ) as HTMLInputElement

    const handleModalChange = () => {
      if (modalCheckbox && !modalCheckbox.checked) {
        // เมื่อ modal ถูกปิด ให้รีเซ็ต state ทั้งหมด
        setTimeout(() => {
          setUploadedFiles([])
          setLinks([
            { link_path: '', link_name: '' },
            { link_path: '', link_name: '' },
            { link_path: '', link_name: '' },
          ])
          setFileInSystem('')
          setFileName('')
          setEvidenceType('link')
        }, 300) // รอให้ animation ของ modal จบก่อน
      }
    }

    if (modalCheckbox) {
      modalCheckbox.addEventListener('change', handleModalChange)
      return () => {
        modalCheckbox.removeEventListener('change', handleModalChange)
      }
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles) => {
      setUploadedFiles((prevFiles) => [...prevFiles, ...acceptedFiles])
    },
    multiple: true,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
        ['.docx'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': [
        '.xlsx',
      ],
      'text/plain': ['.txt'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/gif': ['.gif'],
      'image/bmp': ['.bmp'],
      'image/webp': ['.webp'],
    },
  })

  const handleRemoveFile = (fileToRemove: File) => {
    setUploadedFiles((prevFiles) =>
      prevFiles.filter((file) => file !== fileToRemove)
    )
  }

  const handleFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    // กรองลิงก์ที่ว่างออกก่อนส่งข้อมูล
    const nonEmptyLinks = links.filter((link) => link.link_path.trim() !== '')

    onSubmit(
      event,
      uploadedFiles,
      evidenceType === 'link' ? nonEmptyLinks : undefined,
      evidenceType === 'file in system' ? fileInSystem : undefined,
      evidenceType === 'file in system' ? fileName : undefined
    )
  }

  const handleAddLink = () => {
    setLinks([...links, { link_path: '', link_name: '' }])
  }

  const handleRemoveLink = (index: number) => {
    // ลบลิงก์ได้เสมอ ไม่ว่าจะเหลือกี่ลิงก์
    setLinks(links.filter((_, i) => i !== index))
  }

  const handleLinkChange = (
    index: number,
    field: 'link_path' | 'link_name',
    value: string
  ) => {
    const newLinks = [...links]
    newLinks[index][field] = value
    setLinks(newLinks)
  }

  const handleEvidenceTypeChange = (
    type: 'link' | 'external file' | 'file in system'
  ) => {
    setEvidenceType(type)
    setUploadedFiles([])

    // ถ้าเปลี่ยนกลับมาเป็นประเภทลิงก์ ให้รีเซ็ตลิงก์เป็น 3 ลิงก์เปล่า
    if (type === 'link') {
      setLinks([
        { link_path: '', link_name: '' },
        { link_path: '', link_name: '' },
        { link_path: '', link_name: '' },
      ])
    }

    setFileInSystem('')
  }

  return (
    <>
      <div className="relative z-[100]">
        <input type="checkbox" id={`modal-forminfo`} className="modal-toggle" />
        <div className="modal" role={`modal-forminfo`}>
          <div className="modal-box rounded-md dark:bg-zinc-800">
            <div className="mb-4 flex items-center">
              <CalendarClock className="mr-2 h-7 w-7 text-blue-500 dark:text-blue-400" />
              <h3 className="truncate text-xl font-medium text-gray-700 dark:text-gray-300">
                เพิ่มรายละเอียดภาระงาน
              </h3>
            </div>
            <form onSubmit={handleFormSubmit}>
              <div className="no-scrollbar max-h-[calc(70vh-150px)] overflow-y-auto pb-2">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
                      คำอธิบาย
                    </label>
                    <textarea
                      name="description"
                      placeholder="คำอธิบาย"
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
                          onChange={() =>
                            handleEvidenceTypeChange('external file')
                          }
                          className="hidden"
                        />
                        <Upload className="mr-2 h-4 w-4" />
                        อัปโหลดไฟล์จากเครื่อง
                      </label>
                    </div>
                    <input
                      type="hidden"
                      name="file_type"
                      value={evidenceType}
                    />
                  </div>

                  <div className="col-span-1 md:col-span-2">
                    <label className="font-regular mb-2 block text-sm text-gray-600 dark:text-gray-400">
                      ไฟล์หลักฐาน
                    </label>
                    {evidenceType === 'link' && (
                      <div className="space-y-4">
                        <div className="space-y-4">
                          {links.map((link, index) => (
                            <div
                              key={index}
                              className="flex flex-col space-y-2 rounded-md border border-gray-200 p-3 dark:border-zinc-700"
                            >
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                  ลิงก์ #{index + 1}
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
                                  handleLinkChange(
                                    index,
                                    'link_name',
                                    e.target.value
                                  )
                                }
                                className="w-full rounded-md border-2 border-gray-300 px-4 py-2 text-sm font-light text-gray-600 transition-all duration-300 ease-in-out focus:border-blue-500 focus:outline-none dark:border-zinc-600 dark:bg-zinc-800 dark:text-gray-400"
                              />
                              <input
                                type="url"
                                placeholder="https://example.com"
                                value={link.link_path}
                                onChange={(e) =>
                                  handleLinkChange(
                                    index,
                                    'link_path',
                                    e.target.value
                                  )
                                }
                                className="w-full rounded-md border-2 border-gray-300 px-4 py-2 text-sm font-light text-gray-600 transition-all duration-300 ease-in-out focus:border-blue-500 focus:outline-none dark:border-zinc-600 dark:bg-zinc-800 dark:text-gray-400"
                              />
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
                    )}
                    {evidenceType === 'external file' && (
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
                                    {file.name} ({(file.size / 1024).toFixed(2)}{' '}
                                    KB)
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
                    )}
                    {evidenceType === 'file in system' && (
                      <>
                        <div className="mb-4">
                          <input
                            type="text"
                            placeholder="ชื่อที่ต้องการแสดง"
                            value={fileName}
                            onChange={(e) => setFileName(e.target.value)}
                            className="w-full rounded-md border-2 border-gray-300 px-4 py-2 text-sm font-light text-gray-600 transition-all duration-300 ease-in-out focus:border-blue-500 focus:outline-none dark:border-zinc-600 dark:bg-zinc-800 dark:text-gray-400"
                          />
                        </div>
                        <input
                          name="workload_file"
                          type="text"
                          placeholder="Enter file path or ID"
                          value={fileInSystem}
                          onChange={(e) => setFileInSystem(e.target.value)}
                          className="w-full rounded-md border-2 border-gray-300 px-4 py-2 text-sm font-light text-gray-600 transition-all duration-300 ease-in-out focus:border-blue-500 focus:outline-none dark:border-zinc-600 dark:bg-zinc-800 dark:text-gray-400"
                        />
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* แยกส่วนปุ่มออกมาให้ติดด้านล่าง */}
              <div className="sticky bottom-0 mt-4 flex justify-end gap-4 border-t border-gray-200 bg-white pt-4 dark:border-zinc-700 dark:bg-zinc-800">
                <button
                  type="submit"
                  className="text-md flex w-20 items-center justify-center rounded-md bg-success px-4 py-2 text-white transition duration-300 ease-in-out hover:bg-success hover:bg-success/80 hover:text-white"
                >
                  ยืนยัน
                </button>
                <label
                  htmlFor={`modal-forminfo`}
                  className="text-md z-50 flex w-20 cursor-pointer items-center justify-center rounded-md border border-gray-200 bg-gray-200 px-4 py-2 text-gray-600 transition duration-300 ease-in-out hover:border-gray-300 hover:bg-gray-300 dark:border-zinc-700 dark:bg-zinc-700 dark:text-gray-400 dark:hover:border-zinc-600 dark:hover:bg-zinc-600"
                >
                  ยกเลิก
                </label>
              </div>
            </form>
          </div>
          <label className="modal-backdrop" htmlFor={`modal-forminfo`}>
            Close
          </label>
        </div>
      </div>
    </>
  )
}
