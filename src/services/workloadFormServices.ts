import { ResponsePayload } from '@/Types'
import http from '@/utils/http'

// Types for Workload Form
export interface WorkloadFormFile {
  fileinfo_id: number
  file_name: string
  size: number
  form_id: number
}

export interface WorkloadFormLink {
  link_id: number
  link_path: string
  link_name: string
  form_id: number
}

export interface WorkloadFormData {
  form_id: number
  as_u_id: number
  formlist_id: number
  form_title: string
  description: string
  workload: number
  quality: number
  file_type: 'link' | 'external file' | 'file in system'
  ex_score: number
  files: WorkloadFormFile[]
  links: WorkloadFormLink[]
}

export interface WorkloadFormDetail {
  form_id: number
  as_u_id: number
  formlist_id: number
  form_title: string
  description: string
  workload: number
  quality: number
  file_type: 'link' | 'external file' | 'file in system'
  ex_score: number
  subtask_id: number
  files?: WorkloadFormFile[]
  links?: WorkloadFormLink[]
  link?: string
  link_name?: string
}

export interface WorkloadFormTerms {
  task_name: string
  workload_group_name: string
  quantity_workload_hours: number
}

export interface WorkloadFormGroup {
  workload_group_id: number
  workload_group_name: string
  round: number
  year: string
  round_list_id: number
  set_asses_list_id: number
  u_id: number
  status_id: number | null
  status_name: string | null
  formlist_id: number
  u_fname: string
  u_lname: string
}

export interface WorkloadFormFileInfo {
  fileinfo_id: number
  file_name: string
  file_path: string
  form_id: number
  size: number
}

const WorkloadFormServices = {
  // Get workload form terms
  getTerms: (accessToken: string): Promise<ResponsePayload<WorkloadFormTerms>> => {
    return http.get('/workload_form/terms', {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
  },

  // Get all workload form lists
  getAllFormList: (accessToken: string): Promise<ResponsePayload<WorkloadFormData>> => {
    return http.get('/workload_form/form', {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
  },

  // Check workload group for user
  checkWorkloadGroup: (userId: number, accessToken: string): Promise<{ status: boolean; data: WorkloadFormGroup[] }> => {
    return http.get(`/workload_form/check_workload_group/${userId}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
  },

  // Get workload form info by formlist_id and subtask_id
  getFormInfo: (
    formlistId: number,
    subtaskId: number,
    userId: number,
    accessToken: string
  ): Promise<{ status: boolean; data: WorkloadFormData[] }> => {
    return http.get(`/workload_form/form_info/${formlistId}/${subtaskId}?as_u_id=${userId}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
  },

  // Get workload form detail by form_id
  getFormDetail: (formId: number, userId: number, accessToken: string): Promise<{ status: boolean; data: WorkloadFormDetail[] }> => {
    return http.get(`/workload_form/form_info_detail/${formId}?as_u_id=${userId}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
  },

  // Get file info for workload form
  getFileInfo: (formlistId: number, accessToken: string): Promise<{ status: boolean; data: WorkloadFormFileInfo[] }> => {
    return http.get(`/workload_form/file_info/${formlistId}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
  },

  // Add new workload form
  addFormInfo: (formData: FormData, accessToken: string): Promise<{ status: boolean; data: WorkloadFormData[] }> => {
    return http.post('/workload_form/form_info/add', formData, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
  },

  // Update workload form
  updateFormInfo: (formData: FormData, accessToken: string): Promise<{ status: boolean; data: WorkloadFormData[] }> => {
    return http.put('/workload_form/form_info/update', formData, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
  },

  // Delete workload form
  deleteFormInfo: (formId: number, accessToken: string): Promise<{ status: boolean; message?: string }> => {
    return http.delete(`/workload_form/form_info/${formId}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
  },

  // Select workload form group
  selectWorkloadFormGroup: (
    userId: number,
    workloadGroupId: number,
    accessToken: string
  ): Promise<ResponsePayload<void>> => {
    return http.put(`/workload_form/update/${userId}`, 
      { workload_group_id: workloadGroupId },
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    )
  },

  // Add bulk workload forms
  addBulkForms: (formData: any[], accessToken: string): Promise<ResponsePayload<void>> => {
    return http.post('/workload_form/add_bulk', formData, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
  },
}

export default WorkloadFormServices
