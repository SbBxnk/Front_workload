import type React from 'react'

import type { EditFormFileData, EditFormLinkData } from './editFormModalTypes'

// เพิ่มฟังก์ชันสำหรับตรวจสอบประเภทไฟล์
export const isImageFile = (fileName: string): boolean => {
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp']
  const ext = fileName.substring(fileName.lastIndexOf('.')).toLowerCase()
  return imageExtensions.includes(ext)
}

interface SubmitEditFormParams {
  event: React.FormEvent<HTMLFormElement>
  form_id: number
  evidenceType: 'link' | 'external file' | 'file in system'
  uploadedFiles: File[]
  existingFiles: EditFormFileData[]
  links: EditFormLinkData[]
  filesToDelete: number[]
  linksToDelete: number[]
  fileInSystem: string
  fileName: string
  onSubmit: (
    form_id: number,
    event: React.FormEvent<HTMLFormElement>,
    uploadedFiles: File[],
    links?: { link_path: string; link_name: string; link_id?: number }[],
    fileInSystem?: string,
    fileName?: string,
    existingFiles?: EditFormFileData[],
    filesToDelete?: number[]
  ) => void
}

// แก้ไขฟังก์ชัน handleFormSubmit เพื่อส่ง links ไปให้ onSubmit
export const submitEditForm = ({
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
}: SubmitEditFormParams): boolean => {
  // ตรวจสอบว่ามีไฟล์อย่างน้อย 1 ไฟล์หรือไม่ (เฉพาะกรณี file_type เป็น "external file")
  if (evidenceType === 'external file' && uploadedFiles.length < 1) {
    // ตรวจสอบว่ามีไฟล์เก่าหรือไม่
    if (existingFiles.length === 0) {
      alert('กรุณาอัปโหลดไฟล์อย่างน้อย 1 ไฟล์')
      return false
    }
  }

  // กรองลิงก์ที่ว่างออกก่อนส่งข้อมูล
  const nonEmptyLinks = links.filter((link) => link.link_path.trim() !== '')

  // Log files that will be deleted from the database
  if (filesToDelete.length > 0) {
    console.log('Files to be deleted from database:', filesToDelete)
  }

  // Log links that will be deleted from the database
  if (linksToDelete.length > 0) {
    console.log('Links to be deleted from database:', linksToDelete)
  }

  // Log existing files that will be kept
  console.log('Existing files to keep:', existingFiles)

  // แปลง existingFiles เป็น array ของ IDs
  const existingFileIds = existingFiles
    .map((file) => file.fileinfo_id)
    .filter(Boolean)
  console.log('Existing file IDs to keep:', existingFileIds)

  // Log links that will be kept or added
  console.log('Links to keep or add:', nonEmptyLinks)

  // เพิ่ม field linksToDelete ใน FormData ที่ส่งไปยัง API
  const formData = new FormData(event.currentTarget)

  // เพิ่ม links_to_delete เข้าไปใน formData
  if (linksToDelete.length > 0) {
    linksToDelete.forEach((linkId) => {
      formData.append('links_to_delete', String(linkId))
    })
  }

  // เพิ่ม existing_links เข้าไปใน formData สำหรับลิงก์ที่มีอยู่แล้ว
  if (evidenceType === 'link') {
    const existingLinkIds = nonEmptyLinks
      .filter((link) => link.link_id)
      .map((link) => link.link_id)
      .filter(Boolean)

    console.log('Existing link IDs to keep:', existingLinkIds)

    if (existingLinkIds.length > 0) {
      existingLinkIds.forEach((linkId) => {
        formData.append('existing_links', String(linkId))
      })
    }
  }

  // เพิ่ม hidden input fields สำหรับ IDs ของไฟล์ที่ต้องการเก็บไว้
  if (evidenceType === 'external file' && existingFiles.length > 0) {
    existingFiles.forEach((file) => {
      if (file.fileinfo_id) {
        formData.append('existing_files', String(file.fileinfo_id))
      }
    })
  }

  // เพิ่ม files_to_delete เข้าไปใน formData
  if (filesToDelete.length > 0) {
    filesToDelete.forEach((fileId) => {
      formData.append('files_to_delete', String(fileId))
    })
  }

  // แสดงข้อมูลที่จะส่งไปยัง backend
  console.log('Sending to backend:', {
    form_id,
    uploadedFiles: uploadedFiles.map((f) => f.name),
    links: evidenceType === 'link' ? nonEmptyLinks : undefined,
    fileInSystem: evidenceType === 'file in system' ? fileInSystem : undefined,
    fileName: evidenceType === 'file in system' ? fileName : undefined,
    existingFiles: evidenceType === 'external file' ? existingFiles : [],
    filesToDelete,
    linksToDelete,
    formDataEntries: Array.from(formData.entries()),
  })

  onSubmit(
    form_id,
    event,
    uploadedFiles,
    evidenceType === 'link' ? nonEmptyLinks : undefined,
    evidenceType === 'file in system' ? fileInSystem : undefined,
    evidenceType === 'file in system' ? fileName : undefined,
    evidenceType === 'external file' ? existingFiles : [],
    filesToDelete
  )

  return true
}
