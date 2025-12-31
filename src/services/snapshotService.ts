import { ResponsePayload } from '@/Types'
import http from '@/utils/http'

// Type สำหรับ response ที่ส่งข้อมูลเดียว
type SingleResponsePayload<T> = {
  code: number
  timestamp: string
  transactionCode: string
  success: boolean
  titleMessage: string
  message: string
  errorCode: string
  payload: T
  meta: {
    limit: number
    page: number
    sort: string
    total_pages: number
    total_rows: number
  }
}

export interface SnapshotFormData {
  form_id: number
  subtask_id: number
  task_id?: number
  task_name?: string
  subtask_name?: string
  workload_group_id?: number
  workload_group_name?: string
  quantity_workload_hours?: number
  form_title: string
  description: string
  workload: number
  quality: number
  file_type: string
  ex_score: number
  evidence?: string
  evaluation_score?: number | null
  snapshot_form_id?: number
  files?:
    | string
    | Array<{
        fileinfo_id?: number
        file_name: string
        file_path?: string
        file_size?: number
        file_type?: string
      }>
  links?:
    | string
    | Array<{
        link_id?: number
        link_name: string
        link_path: string
      }>
}

export interface SubmitFormRequest {
  formlist_id: number
  as_u_id: number
  round_list_id: number
}

export interface FormlistIdResponse {
  formlist_id: number
  set_asses_list_id: number
  status: number
}

const SnapshotService = {
  // ส่งฟอร์มและสร้าง snapshot
  submitFormWithSnapshot: async (
    data: SubmitFormRequest
  ): Promise<SingleResponsePayload<{
    snapshot_id: number
    formlist_id: number
    status: number
  }>> => {
    return http.post('/workload_form/submit_with_snapshot', data, {
      headers: {
        'Content-Type': 'application/json'
      }
    })
  },

  // ดึงข้อมูลฟอร์มจาก snapshot หรือตารางหลัก
  getFormInfoWithSnapshot: async (
    formlist_id: number,
    subtask_id: number,
    as_u_id: number,
    round_list_id: number
  ): Promise<SingleResponsePayload<SnapshotFormData[]>> => {
    return http.get(`/workload_form/form_info_with_snapshot/${formlist_id}/${subtask_id}`, {
        params: {
          as_u_id,
          round_list_id
        }
      });
  },

  // ดึงข้อมูลภาระงานทั้งหมด (ใช้ API เดิมแต่ปรับปรุงให้รองรับ snapshot)
  getWorkloadItems: async (
    userId: number,
    roundId: number
  ): Promise<ResponsePayload<any[]>> => {
    return http.get(`/workload_form/items/${userId}/${roundId}`)
  },

  // ดึง formlist_id จาก as_u_id และ round_list_id
  getFormlistId: async (
    as_u_id: number,
    round_list_id: number
  ): Promise<ResponsePayload<FormlistIdResponse>> => {
    return http.get(`/workload_form/get_formlist_id/${as_u_id}/${round_list_id}`)
  }
}

export default SnapshotService
