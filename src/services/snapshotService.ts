import { ResponsePayload } from '@/Types'
import type {
  SnapshotFormData,
  SubmitFormRequest,
  FormlistIdResponse,
} from '@/Types/snapshot'
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
