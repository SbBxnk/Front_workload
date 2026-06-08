import type React from 'react'

export interface EditFormFileData {
  file_name: string
  size: number
  form_id: number
  fileinfo_id?: number // แก้ไขชื่อฟิลด์ให้ตรงกับฐานข้อมูล
}

export interface EditFormLinkData {
  link_id?: number
  link_path: string
  link_name: string
  form_id?: number
}

export interface EditFormFormData {
  form_id: number
  form_title: string
  description: string
  quality: number
  workload: number
  file_type: 'link' | 'external file' | 'file in system'
  link?: string
  link_name?: string
  links?: EditFormLinkData[]
  files?: EditFormFileData[]
}

export interface EditModalProps {
  form_id: number | null
  formDetail: EditFormFormData | null
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

// เพิ่ม interface สำหรับ file preview
export interface EditFormFilePreview {
  file: File
  preview: string
}
