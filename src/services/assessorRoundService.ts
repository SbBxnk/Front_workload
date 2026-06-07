import axios from 'axios'

export interface AssessorRound {
  round_list_id: number
  round_list_name: string
  round: number
  year: number
  date_start: string
  date_end: string
  total_assessees: number
}

export interface AssessorRoundResponse {
  code: number
  timestamp: string
  transactionCode: string
  success: boolean
  titleMessage: string
  message: string
  errorCode: string
  meta: any
  payload: AssessorRound[]
}

class AssessorRoundService {
  /**
   * ดึงรอบการประเมินสำหรับผู้ประเมิน
   * @param ex_u_id - ID ของผู้ประเมิน
   * @returns Promise<AssessorRound[]>
   */
  static async getAssessorRounds(
    ex_u_id: number
  ): Promise<AssessorRound[]> {
    try {
      const headers = {
        'Content-Type': 'application/json',
      }

      const response = await axios.get<AssessorRoundResponse>(
        `${process.env.NEXT_PUBLIC_API}/assessor_rounds/${ex_u_id}`,
        { headers }
      )

      if (response.data.success) {
        return response.data.payload || []
      } else {
        console.warn('No rounds found:', response.data.message)
        return []
      }
    } catch (error) {
      console.error('Error fetching assessor rounds:', error)
      return []
    }
  }
}

export default AssessorRoundService
