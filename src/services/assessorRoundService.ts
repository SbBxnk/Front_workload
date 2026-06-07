import http from '@/utils/http'
import type { AssessorRound, AssessorRoundResponse } from '@/Types/assessorRound'

const AssessorRoundService = {
  /**
   * ดึงรอบการประเมินสำหรับผู้ประเมิน
   * token แนบโดย interceptor (utils/http) อัตโนมัติ
   */
  getAssessorRounds: async (ex_u_id: number): Promise<AssessorRound[]> => {
    try {
      const data: AssessorRoundResponse = await http.get(
        `/assessor_rounds/${ex_u_id}`
      )

      if (data.success) {
        return data.payload || []
      }

      console.warn('No rounds found:', data.message)
      return []
    } catch (error) {
      console.error('Error fetching assessor rounds:', error)
      return []
    }
  },
}

export default AssessorRoundService
