import { ResponsePayload, BackendResponse } from '@/Types'
import type {
  WorkloadFormData,
  WorkloadFormDetail,
  WorkloadFormFileInfo,
  WorkloadFormGroup,
  WorkloadFormTerms,
} from '@/Types/workloadForm'
import http from '@/utils/http'

const WorkloadFormServices = {
  // Get workload form terms
  getTerms: (): Promise<ResponsePayload<WorkloadFormTerms>> => {
    return http.get('/workload_form/terms')
  },

  // Get all workload form lists
  getAllFormList: (): Promise<ResponsePayload<WorkloadFormData>> => {
    return http.get('/workload_form/form')
  },

  // Check workload group for user
  checkWorkloadGroup: (userId: number, roundId: number): Promise<{ status: boolean; data: WorkloadFormGroup[] }> => {
    return http.get(`/workload_form/check_workload_group/${userId}/${roundId}`)
  },

  // Get workload form info by formlist_id and subtask_id
  getFormInfo: (
    formlistId: number,
    subtaskId: number,
    userId: number
  ): Promise<{ status: boolean; data: WorkloadFormData[] }> => {
    return http.get(`/workload_form/form_info/${formlistId}/${subtaskId}?as_u_id=${userId}`)
  },

  // Get workload form detail by form_id
  getFormDetail: (formId: number, userId: number): Promise<{ status: boolean; data: WorkloadFormDetail[] }> => {
    return http.get(`/workload_form/form_info_detail/${formId}?as_u_id=${userId}`)
  },

  // Get file info for workload form
  getFileInfo: (formlistId: number): Promise<{ status: boolean; data: WorkloadFormFileInfo[] }> => {
    return http.get(`/workload_form/file_info/${formlistId}`)
  },

  // Add new workload form
  addFormInfo: (formData: FormData): Promise<{ status: boolean; data: WorkloadFormData[] }> => {
    return http.post('/workload_form/form_info/add', formData)
  },

  // Update workload form
  updateFormInfo: (formData: FormData): Promise<{ status: boolean; data: WorkloadFormData[] }> => {
    return http.put('/workload_form/form_info/update', formData)
  },

  // Delete workload form
  deleteFormInfo: (formId: number): Promise<{ status: boolean; message?: string }> => {
    return http.delete(`/workload_form/form_info/${formId}`)
  },

  // Select workload form group
  selectWorkloadFormGroup: (
    userId: number,
    workloadGroupId: number,
    roundId: number
  ): Promise<BackendResponse<void>> => {
    return http.patch(`/workload_form/update/${userId}`, {
      workload_group_id: workloadGroupId,
      round_id: roundId
    })
  },

  // Check workload form status
  checkWorkloadFormStatus: (
    userId: number,
    roundId: number
  ): Promise<ResponsePayload<{ status: number; formlist_id: number }>> => {
    return http.get(`/workload_form/status/${userId}/${roundId}`)
  },

  // Get workload items by user and round
  getWorkloadItems: (
    userId: number,
    roundId: number
  ): Promise<ResponsePayload<any>> => {
    return http.get(`/workload_form/items/${userId}/${roundId}`)
  },

  // Update workload form status by set_asses_list_id
  updateWorkloadFormStatus: (
    setAssesListId: number,
    status: number
  ): Promise<ResponsePayload<{ set_asses_list_id: number; status: number }>> => {
    return http.patch(`/workload_form/status/${setAssesListId}`, { status })
  },

  // Update workload form status bulk
  updateWorkloadFormStatusBulk: (
    setAssesListIds: number[],
    status: number
  ): Promise<ResponsePayload<{
    set_asses_list_ids: number[];
    status: number;
    affected_rows: number;
  }>> => {
    return http.patch('/workload_form/status_bulk', {
      set_asses_list_ids: setAssesListIds,
      status
    })
  },

  // Get assessor evaluation status (ตาม set_asses_info_id เพื่อตรวจสอบเฉพาะ assessor คนนั้น)
  getAssessorEvaluationStatus: (
    setAssesInfoId: number
  ): Promise<ResponsePayload<{
    set_asses_info_id: number;
    workload_group_id: number | null;
    form_status: number;
    evaluation_status: 'not_started' | 'in_progress' | 'completed';
  }>> => {
    return http.get(`/workload_form/evaluation_status/${setAssesInfoId}`)
  },

  // Get assessor form status (ตาม set_asses_list_id สำหรับ admin page)
  getAssessorFormStatus: (
    setAssesListId: number
  ): Promise<ResponsePayload<{
    set_asses_list_id: number;
    workload_group_id: number | null;
    form_status: number;
    evaluation_status: 'not_started' | 'in_progress' | 'completed';
  }>> => {
    return http.get(`/workload_form/form_status/${setAssesListId}`)
  },

  // Get formlist info by user and round
  getFormlistByUserAndRound: (
    userId: number,
    roundId: number
  ): Promise<ResponsePayload<{ formlist_id: number; set_asses_list_id: number; status: number }>> => {
    return http.get(`/workload_form/get_formlist_id/${userId}/${roundId}`)
  },

  // Submit workload form
  submitWorkloadForm: (
    userId: number,
    roundId: number
  ): Promise<ResponsePayload<{
    user_id: number;
    round_list_id: number;
    set_asses_list_id: number;
    status: number;
  }>> => {
    return http.patch(`/workload_form/submit/${userId}/${roundId}`, {})
  },
}

export default WorkloadFormServices
