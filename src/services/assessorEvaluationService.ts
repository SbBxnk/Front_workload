import axios from 'axios'

export interface AssessorEvaluation {
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
  ex_position_name: string
  workload_group_name: string
  date_save: string
}

export interface AssessorEvaluationResponse {
  code: number
  timestamp: string
  transactionCode: string
  success: boolean
  titleMessage: string
  message: string
  errorCode: string
  meta: any
  payload: AssessorEvaluation[]
}

class AssessorEvaluationService {
  /**
   * ดึงรายการการประเมินสำหรับผู้ตรวจประเมิน
   * @param ex_u_id - ID ของผู้ตรวจประเมิน
   * @param accessToken - Access token สำหรับ authentication
   * @returns Promise<AssessorEvaluation[]>
   */
  static async getAssessorEvaluations(
    ex_u_id: number, 
    accessToken: string
  ): Promise<AssessorEvaluation[]> {
    try {
      const headers = {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      }

      const response = await axios.get<AssessorEvaluationResponse>(
        `${process.env.NEXT_PUBLIC_API}/assessor_evaluations/${ex_u_id}`,
        { headers }
      )

      if (response.data.success) {
        return response.data.payload || []
      } else {
        console.warn('No evaluations found:', response.data.message)
        return []
      }
    } catch (error) {
      console.error('Error fetching assessor evaluations:', error)
      return []
    }
  }
}

export default AssessorEvaluationService
