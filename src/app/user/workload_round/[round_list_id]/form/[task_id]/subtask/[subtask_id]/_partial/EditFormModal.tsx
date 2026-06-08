'use client'

import type React from 'react'
import { useState, useEffect, useRef } from 'react'
import { useDropzone } from 'react-dropzone'
import { CalendarClock } from 'lucide-react'

import { isImageFile, submitEditForm } from './editFormModalHelpers'
import type {
  EditFormFileData,
  EditFormFilePreview,
  EditFormLinkData,
  EditModalProps,
} from './editFormModalTypes'
import EditFormFields from './EditFormFields'
import EditFormLinkSection from './EditFormLinkSection'
import EditFormExternalFileSection from './EditFormExternalFileSection'
import EditFormFileInSystemSection from './EditFormFileInSystemSection'

export default function EditFormModal({
  form_id,
  formDetail,
  onSubmit,
}: EditModalProps) {
  const [evidenceType, setEvidenceType] = useState<
    'link' | 'external file' | 'file in system'
  >('link')
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [filePreviews, setFilePreviews] = useState<EditFormFilePreview[]>([])
  const [existingFiles, setExistingFiles] = useState<EditFormFileData[]>([])
  const [filesToDelete, setFilesToDelete] = useState<number[]>([])
  // เปลี่ยนจาก string เป็น array ของ links
  const [links, setLinks] = useState<EditFormLinkData[]>([])
  // เพิ่ม state สำหรับเก็บลิงก์ที่ต้องการลบ
  const [linksToDelete, setLinksToDelete] = useState<number[]>([])
  const [fileInSystem, setFileInSystem] = useState<string>('')
  const [fileName, setFileName] = useState<string>('')
  const modalCheckboxRef = useRef<HTMLInputElement | null>(null)

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles) => {
      setUploadedFiles((prevFiles) => [...prevFiles, ...acceptedFiles])

      // สร้าง previews สำหรับไฟล์รูปภาพ
      const newPreviews = acceptedFiles.map((file) => ({
        file,
        preview: isImageFile(file.name) ? URL.createObjectURL(file) : '',
      }))

      setFilePreviews((prev) => [...prev, ...newPreviews])
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

  // ตรวจสอบการเปลี่ยนแปลงของ modal checkbox
  useEffect(() => {
    if (!form_id) return

    const modalCheckbox = document.getElementById(
      `edit-modal-${form_id}`
    ) as HTMLInputElement
    if (modalCheckbox) {
      modalCheckboxRef.current = modalCheckbox

      // ฟังก์ชันที่จะทำงานเมื่อ checkbox เปลี่ยนสถานะ
      const handleModalChange = () => {
        // ถ้า modal ถูกปิด (checkbox ไม่ถูกเลือก)
        if (!modalCheckbox.checked && form_id) {
          // No need to fetch data here anymore
        }
      }

      // เพิ่ม event listener
      modalCheckbox.addEventListener('change', handleModalChange)

      // ทำความสะอาด event listener เมื่อ component unmount
      return () => {
        modalCheckbox.removeEventListener('change', handleModalChange)
      }
    }
  }, [form_id])

  const resetForm = () => {
    setUploadedFiles([])
    setFilePreviews([])
    setExistingFiles([])
    setFilesToDelete([])
    setLinks([])
    setLinksToDelete([])
    setFileInSystem('')
    setFileName('')
    setEvidenceType('link')
  }

  // แก้ไขฟังก์ชัน handleRemoveExistingFile เพื่อตรวจสอบจำนวนไฟล์ก่อนลบ
  const handleRemoveExistingFile = (fileId: number) => {
    // Make sure fileId has a value
    if (!fileId) return

    // Check if there will be at least one file left (either existing or newly uploaded)
    const totalFiles = existingFiles.length + uploadedFiles.length
    if (totalFiles <= 1 && evidenceType === 'external file') {
      console.log('Cannot delete file: at least one file is required')
      return
    }

    console.log(`Removing file with ID: ${fileId}`)

    // Update existingFiles state by removing the file with matching fileinfo_id
    setExistingFiles((prevFiles) => {
      const newFiles = prevFiles.filter((file) => {
        // Check for fileinfo_id (the correct property name from your database)
        return file.fileinfo_id !== fileId
      })
      console.log('Files after removal:', newFiles)
      return newFiles
    })

    // Add the file ID to filesToDelete
    setFilesToDelete((prev) => [...prev, fileId])
  }

  // Fix the handleRemoveUploadedFile function to check file requirements
  const handleRemoveUploadedFile = (index: number) => {
    // Check if there will be at least one file left (either existing or newly uploaded)
    const totalFiles = existingFiles.length + uploadedFiles.length
    if (totalFiles <= 1 && evidenceType === 'external file') {
      console.log('Cannot delete file: at least one file is required')
      return
    }

    // Store the file information before removing it for logging purposes
    const fileToRemove = uploadedFiles[index]
    console.log(`Marking file for deletion: ${fileToRemove.name}`)

    // Revoke object URL if it's an image preview
    if (filePreviews[index]?.preview) {
      URL.revokeObjectURL(filePreviews[index].preview)
    }

    setUploadedFiles((prevFiles) => {
      const newFiles = [...prevFiles]
      newFiles.splice(index, 1)
      return newFiles
    })

    setFilePreviews((prevPreviews) => {
      const newPreviews = [...prevPreviews]
      newPreviews.splice(index, 1)
      return newPreviews
    })
  }

  // เพิ่มฟังก์ชันสำหรับจัดการลิงก์
  const handleAddLink = () => {
    setLinks([...links, { link_path: '', link_name: '' }])
  }

  const handleRemoveLink = (index: number) => {
    const linkToRemove = links[index]

    // ถ้าลิงก์มี link_id (เป็นลิงก์ที่มีอยู่ในฐานข้อมูล) ให้เพิ่มเข้าไปใน linksToDelete
    if (linkToRemove.link_id) {
      setLinksToDelete((prev) => [...prev, linkToRemove.link_id as number])
      console.log(`Marking link with ID ${linkToRemove.link_id} for deletion`)
    }

    // ลบลิงก์ออกจาก state
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

  // แก้ไขฟังก์ชัน handleFormSubmit เพื่อส่ง links ไปให้ onSubmit
  const handleFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!form_id || !formDetail) return

    const submitted = submitEditForm({
      event,
      form_id,
      evidenceType,
      uploadedFiles,
      existingFiles,
      links,
      filesToDelete,
      linksToDelete,
      fileInSystem,
      fileName,
      onSubmit,
    })

    if (!submitted) return

    // Close modal immediately
    const modal = document.getElementById(
      `edit-modal-${form_id}`
    ) as HTMLInputElement
    if (modal) modal.checked = false
  }

  // ฟังก์ชันสำหรับการยกเลิกการแก้ไข
  const handleCancel = () => {
    if (form_id) {
      // ไม่ต้องทำอะไรเพิ่มเติม
    }
  }

  useEffect(() => {
    if (formDetail) {
      setEvidenceType(formDetail.file_type)

      if (formDetail.file_type === 'link') {
        // ตรวจสอบว่ามี links array หรือไม่
        if (formDetail.links && formDetail.links.length > 0) {
          console.log('Loading existing links:', formDetail.links)
          setLinks(formDetail.links)
        }
        // ถ้าไม่มี links array แต่มี link เดี่ยว (รูปแบบเก่า)
        else if (formDetail.link && formDetail.link !== '-') {
          console.log('Loading single link:', formDetail.link)
          setLinks([
            {
              link_path: formDetail.link,
              link_name: formDetail.link_name || formDetail.link,
            },
          ])
        }
        // ถ้าไม่มีลิงก์เลย ให้เริ่มต้นด้วยลิงก์เปล่า 3 ลิงก์
        else {
          console.log('No links found, initializing with empty links')
          setLinks([
            { link_path: '', link_name: '' },
            { link_path: '', link_name: '' },
            { link_path: '', link_name: '' },
          ])
        }
      } else if (formDetail.files && formDetail.files.length > 0) {
        setExistingFiles(formDetail.files)
        console.log('existingFiles loaded:', formDetail.files)
      }

      setUploadedFiles([])
      setFilePreviews([])
      setFilesToDelete([])
      setLinksToDelete([])
    } else {
      resetForm()
    }
  }, [formDetail])

  useEffect(() => {
    // Cleanup function to revoke object URLs when component unmounts
    return () => {
      filePreviews.forEach((preview) => {
        if (preview.preview) URL.revokeObjectURL(preview.preview)
      })
    }
  }, [filePreviews])

  if (!form_id) return null

  return (
    <>
      <div className="relative z-[100]">
        <input
          type="checkbox"
          id={`edit-modal-${form_id}`}
          className="modal-toggle"
        />
        <div className="modal" role="dialog">
          <div className="modal-box rounded-md dark:bg-zinc-800">
            <div className="mb-4 flex items-center">
              <CalendarClock className="mr-2 h-7 w-7 text-amber-500 dark:text-amber-400" />
              <h3 className="truncate text-xl font-medium text-gray-700 dark:text-gray-300">
                แก้ไขรายละเอียดภาระงาน
              </h3>
            </div>

            {formDetail ? (
              <form onSubmit={handleFormSubmit}>
                <div className="no-scrollbar max-h-[calc(90vh-150px)] overflow-y-auto">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <EditFormFields
                      formDetail={formDetail}
                      evidenceType={evidenceType}
                    />

                    <div className="col-span-1 md:col-span-2">
                      <label className="font-regular mb-2 block text-sm text-gray-600 dark:text-gray-400">
                        ไฟล์หลักฐาน
                      </label>
                      {/* แสดงส่วนของลิงก์หลายลิงก์ */}
                      {evidenceType === 'link' && (
                        <EditFormLinkSection
                          links={links}
                          handleRemoveLink={handleRemoveLink}
                          handleLinkChange={handleLinkChange}
                          handleAddLink={handleAddLink}
                        />
                      )}
                      {evidenceType === 'external file' && (
                        <EditFormExternalFileSection
                          existingFiles={existingFiles}
                          uploadedFiles={uploadedFiles}
                          handleRemoveExistingFile={handleRemoveExistingFile}
                          handleRemoveUploadedFile={handleRemoveUploadedFile}
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
                  </div>
                  <div className="mt-4 flex justify-end gap-4">
                    <button
                      type="submit"
                      className="text-md flex w-20 items-center justify-center rounded-md bg-amber-500 px-4 py-2 text-white transition duration-300 ease-in-out hover:bg-amber-600"
                    >
                      บันทึก
                    </button>
                    <label
                      htmlFor={`edit-modal-${form_id}`}
                      onClick={handleCancel}
                      className="text-md z-50 flex w-20 cursor-pointer items-center justify-center rounded-md border-2 border-gray-200 bg-gray-200 px-4 py-2 text-gray-600 transition duration-300 ease-in-out hover:border-gray-300 hover:bg-gray-300 dark:border-zinc-700 dark:bg-zinc-700 dark:text-gray-400 dark:hover:border-zinc-600 dark:hover:bg-zinc-600"
                    >
                      ยกเลิก
                    </label>
                  </div>
                </div>
              </form>
            ) : null}
          </div>
          <label className="modal-backdrop" htmlFor={`edit-modal-${form_id}`}>
            Close
          </label>
        </div>
      </div>
    </>
  )
}
