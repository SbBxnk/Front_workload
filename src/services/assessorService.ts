import { ResponsePayload } from '@/Types'
import type { AssessorData, Params, RoundList } from '@/Types/assessor'
import http from '@/utils/http'

const AssessorServices = {
  
  checkRound: (queryParams: Params): Promise<ResponsePayload<RoundList>> => {
    const params = new URLSearchParams({
      page: queryParams.page,
      limit: queryParams.limit,
      search: queryParams.search,
      year: queryParams.year,
      sort: queryParams.sort,
      order: queryParams.order,
    }).toString()

    // ใช้ endpoint ใหม่สำหรับ user API
    return http.get(`/check_round?${params}`)
  },

  checkAssessor: (userId: number): Promise<AssessorData> => {
    return http.get(`/check_assessor/${userId}`).then((response) => {
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

  isUserAssessor: (userId: number): Promise<boolean> => {
    return AssessorServices.checkAssessor(userId).then(data => data.isAssessor)
  }
}

export default AssessorServices