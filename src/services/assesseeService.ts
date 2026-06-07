import axios from 'axios'
import type { Assessee, AssesseeMeta, AssesseeResponse } from '@/Types/assessee'

class AssesseeService {
  /**
   * ดึงรายการผู้ใช้ที่ต้องตรวจในรอบการประเมินเฉพาะ
   * @param ex_u_id - ID ของผู้ประเมิน
   * @param round_list_id - ID ของรอบการประเมิน
   * @returns Promise<Assessee[]>
   */
  static async getAssesseesByRound(
    ex_u_id: number,
    round_list_id: number,
    params?: {
      page?: number
      limit?: number
      sort?: string
      order?: 'asc' | 'desc'
    }
  ): Promise<AssesseeResponse> {
    try {
      const headers = {
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
