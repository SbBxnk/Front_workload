'use client'

import type React from 'react'
import { useState, useEffect, useRef } from 'react'
import { useDropzone } from 'react-dropzone'
import { CalendarClock } from 'lucide-react'

import type { CreateModalProps } from './createFormModalTypes'
import CreateFormFields from './CreateFormFields'
import CreateFormLinkSection from './CreateFormLinkSection'
import CreateFormExternalFileSection from './CreateFormExternalFileSection'
import EditFormFileInSystemSection from './EditFormFileInSystemSection'

export default function CreateFormModal({ onSubmit }: CreateModalProps) {
  const formRef = useRef<HTMLFormElement | null>(null)
  const [evidenceType, setEvidenceType] = useState<
    'link' | 'external file' | 'file in system'
  >('link')
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  // เริ่มต้นด้วยลิงก์เปล่า 3 ลิงก์
  const [links, setLinks] = useState<
    { link_path: string; link_name: string }[]
  >([
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
          ])
          setFileInSystem('')
          setFileName('')
          setEvidenceType('link')
          // รีเซ็ตค่า input ภายในฟอร์ม
          if (formRef.current) {
            formRef.current.reset()
          }
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

    // รีเซ็ตฟอร์มและสถานะหลังจากส่งข้อมูล
    if (formRef.current) {
      formRef.current.reset()
    }
    setUploadedFiles([])
    setLinks([
      { link_path: '', link_name: '' },
    ])
    setFileInSystem('')
    setFileName('')
    setEvidenceType('link')
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

    // ถ้าเปลี่ยนกลับมาเป็นประเภทลิงก์ ให้รีเซ็ตลิงก์เป็น 1 ลิงก์เปล่า
    if (type === 'link') {
      setLinks([
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
            <form ref={formRef} onSubmit={handleFormSubmit}>
              <div className="no-scrollbar max-h-[calc(70vh-150px)] overflow-y-auto pb-2">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <CreateFormFields
                    evidenceType={evidenceType}
                    handleEvidenceTypeChange={handleEvidenceTypeChange}
                  />

                  <div className="col-span-1 md:col-span-2">
                    <label className="font-regular mb-2 block text-sm text-gray-600 dark:text-gray-400">
                      ไฟล์หลักฐาน
                    </label>
                    {evidenceType === 'link' && (
                      <CreateFormLinkSection
                        links={links}
                        handleRemoveLink={handleRemoveLink}
                        handleLinkChange={handleLinkChange}
                        handleAddLink={handleAddLink}
                      />
                    )}
                    {evidenceType === 'external file' && (
                      <CreateFormExternalFileSection
                        uploadedFiles={uploadedFiles}
                        handleRemoveFile={handleRemoveFile}
                        getRootProps={getRootProps}
                        getInputProps={getInputProps}
                        isDragActive={isDragActive}
                      />
                    )}
                    {evidenceType === 'file in system' && (
                      <EditFormFileInSystemSection
                        fileName={fileName}
                        setFileName={setFileName}
                        fileInSystem={fileInSystem}
                        setFileInSystem={setFileInSystem}
                      />
                    )}
                  </div>

                  <div className="col-span-1">
                    <label className="font-regular mb-2 block text-sm text-gray-600 dark:text-gray-400">
                      จำนวน
                    </label>
                    <input
                      name="quality"
                      type="number"
                      step="any"
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
                      step="any"
                      placeholder="ภาระงาน"
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
