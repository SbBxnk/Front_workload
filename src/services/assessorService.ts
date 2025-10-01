import { ResponsePayload } from '@/Types'
import http from '@/utils/http'

export interface AssessorData {
  isAssessor: boolean
  assessorId?: number
  roundListId?: number
  lastChecked: number
}
export interface Params {
  page: string,
  limit: string,
  search: string,
  year: string,
  sort: string,
  order: string,
}

export interface RoundList {
  round_list_id: number
  round_list_name: string
  year: number
  round: number
  date_start: string
  date_end: string
  form_count: number
}
      
export interface CheckAssessorResponse {
  assessor_id: number
  round_list_id: number
}

const AssessorServices = {
  
  checkRound: (queryParams: Params, accessToken: string): Promise<ResponsePayload<RoundList>> => {
    const params = new URLSearchParams({
      page: queryParams.page,
      limit: queryParams.limit,
      search: queryParams.search,
      year: queryParams.year,
      sort: queryParams.sort,
      order: queryParams.order,
    }).toString()

    // ใช้ endpoint ใหม่สำหรับ user API
    return http.get(`/check_round?${params}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    })
  },

  checkAssessor: (userId: number, accessToken: string): Promise<AssessorData> => {
    return http.get(`/check_assessor/${userId}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    }).then((response) => {
      const isAssessor = response.data && response.data.assessor_id
      
      const assessorData: AssessorData = {
        isAssessor: !!isAssessor,
        assessorId: response.data?.assessor_id,
        roundListId: response.data?.round_list_id,
        lastChecked: Date.now(),
      }
      
      return assessorData
    }).catch((error) => {
      console.error('❌ AssessorService - Error checking assessor status:', error)
      const defaultData: AssessorData = {
        isAssessor: false,
        lastChecked: Date.now(),
      }
      return defaultData
    })
  },

  isUserAssessor: (userId: number, accessToken: string): Promise<boolean> => {
    return AssessorServices.checkAssessor(userId, accessToken).then(data => data.isAssessor)
  }
}

export default AssessorServices