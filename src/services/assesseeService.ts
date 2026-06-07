import http from '@/utils/http'
import type { AssesseeResponse } from '@/Types/assessee'

const AssesseeService = {
  /**
   * ดึงรายการผู้ใช้ที่ต้องตรวจในรอบการประเมินเฉพาะ
   * token แนบโดย interceptor (utils/http) อัตโนมัติ
   */
  getAssesseesByRound: async (
    ex_u_id: number,
    round_list_id: number,
    params?: {
      page?: number
      limit?: number
      sort?: string
      order?: 'asc' | 'desc'
    }
  ): Promise<AssesseeResponse> => {
    try {
      const data: AssesseeResponse = await http.get(
        `/assessees_by_round/${ex_u_id}/round/${round_list_id}`,
        { params }
      )

      if (data.success) {
        return data
      }

      console.warn('No assessees found:', data.message)
      return {
        ...data,
        meta: data.meta ?? {
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
  },
}

export default AssesseeService
