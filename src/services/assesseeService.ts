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
  ex_position_name: string
  workload_group_name: string
  date_save: string
}

export interface AssesseeResponse {
  code: number
  timestamp: string
  transactionCode: string
  success: boolean
  titleMessage: string
  message: string
  errorCode: string
  meta: any
  payload: Assessee[]
}

class AssesseeService {
  /**
   * ดึงรายการผู้ใช้ที่ต้องตรวจในรอบการประเมินเฉพาะ
   * @param ex_u_id - ID ของผู้ตรวจประเมิน
   * @param round_list_id - ID ของรอบการประเมิน
   * @param accessToken - Access token สำหรับ authentication
   * @returns Promise<Assessee[]>
   */
  static async getAssesseesByRound(
    ex_u_id: number,
    round_list_id: number,
    accessToken: string
  ): Promise<Assessee[]> {
    try {
      const headers = {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      }

      const response = await axios.get<AssesseeResponse>(
        `${process.env.NEXT_PUBLIC_API}/assessees_by_round/${ex_u_id}/round/${round_list_id}`,
        { headers }
      )

      if (response.data.success) {
        return response.data.payload || []
      } else {
        console.warn('No assessees found:', response.data.message)
        return []
      }
    } catch (error) {
      console.error('Error fetching assessees by round:', error)
      return []
    }
  }
}

export default AssesseeService
