import axios from 'axios'

export interface Assessee {
  set_asses_info_id: number
  set_asses_list_id: number
  ex_u_id: number
  as_u_id: number
  round_list_id: number
  round_list_name: string
  round: number
  year: number
  date_start: string
  date_end: string
  prefix_name: string
  u_fname: string
  u_lname: string
  u_img: string
  u_id_card: string
  position_name: string
  ex_position_name: string
  workload_group_name: string
  date_save: string
  form_status?: number | null
  evaluation_status?: 'not_started' | 'in_progress' | 'completed'
}

export interface AssesseeMeta {
  limit: number
  page: number
  sort: string
  total_rows: number
  total_pages: number
}

export interface AssesseeResponse {
  code: number
  timestamp: string
  transactionCode: string
  success: boolean
  titleMessage: string
  message: string
  errorCode: string
  meta: AssesseeMeta | null
  payload: Assessee[]
}

class AssesseeService {
  /**
   * ดึงรายการผู้ใช้ที่ต้องตรวจในรอบการประเมินเฉพาะ
   * @param ex_u_id - ID ของผู้ประเมิน
   * @param round_list_id - ID ของรอบการประเมิน
   * @param accessToken - Access token สำหรับ authentication
   * @returns Promise<Assessee[]>
   */
  static async getAssesseesByRound(
    ex_u_id: number,
    round_list_id: number,
    accessToken: string,
    params?: {
      page?: number
      limit?: number
      sort?: string
      order?: 'asc' | 'desc'
    }
  ): Promise<AssesseeResponse> {
    try {
      const headers = {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      }

      const queryParams: Record<string, string | number> = {}

      if (params?.page) queryParams.page = params.page
      if (params?.limit) queryParams.limit = params.limit
      if (params?.sort) queryParams.sort = params.sort
      if (params?.order) queryParams.order = params.order

      const response = await axios.get<AssesseeResponse>(
        `${process.env.NEXT_PUBLIC_API}/assessees_by_round/${ex_u_id}/round/${round_list_id}`,
        {
          headers,
          params: queryParams,
        }
      )

      if (response.data.success) {
        return response.data
      }

      console.warn('No assessees found:', response.data.message)
      return {
        ...response.data,
        meta: response.data.meta ?? {
          limit: params?.limit ?? 10,
          page: params?.page ?? 1,
          sort: params?.sort ?? 'date_save',
          total_rows: 0,
          total_pages: 0,
        },
        payload: [],
      }
    } catch (error) {
      console.error('Error fetching assessees by round:', error)
      return {
        code: 500,
        timestamp: new Date().toISOString(),
        transactionCode: '',
        success: false,
        titleMessage: 'error',
        message: 'Error fetching assessees by round',
        errorCode: 'API_ERROR',
        meta: {
          limit: params?.limit ?? 10,
          page: params?.page ?? 1,
          sort: params?.sort ?? 'date_save',
          total_rows: 0,
          total_pages: 0,
        },
        payload: [],
      }
    }
  }
}

export default AssesseeService
