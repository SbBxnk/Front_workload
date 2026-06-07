import type { WorkloadFormData } from '@/Types/workloadForm'

export interface ApiFormData extends WorkloadFormData {
  subtask_name: string
  task_name: string
  u_fname: string
  u_lname: string
  prefix_name: string
  link: string
  link_name: string
}

export interface FileData {
  file_name: string
  size: number
  form_id: number
  fileinfo_id?: number
}

export interface LinkData {
  link_id?: number
  link_path: string
  link_name: string
  form_id: number
}

export interface Subtask {
  subtask_id: number
  subtask_name: string
}

export interface DecodedToken {
  id: number
}

export interface WorkloadGroup {
  workload_group_id: number | null
  workload_group_name: string | null
  formlist_id: number | null
}

export interface FileInfo {
  fileinfo_id: number
  file_name: string
  file_path: string
  form_id: number
  size: number
}

export interface FormInfo {
  form_id: number
  as_u_id: number
  formlist_id: number
  form_title: string
  description: string
  quality: number
  workload: number
  file_type: 'link' | 'external file' | 'file in system'
  ex_score: number
  subtask_id: number
}

// เพิ่มฟังก์ชันสำหรับตรวจสอบประเภทไฟล์
export const isImageFile = (fileName: string | null | undefined): boolean => {
  if (!fileName) return false // ถ้า fileName เป็น null หรือ undefined ให้คืนค่า false

  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp']
  const ext = fileName.substring(fileName.lastIndexOf('.')).toLowerCase()
  return imageExtensions.includes(ext)
}
