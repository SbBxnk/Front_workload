import type {
  EvaluationAssessmentResponse,
  SaveDraftRequest,
  AverageAssessedLevel,
} from '@/Types/performanceEvaluationAssessment'
import http from '@/utils/http'

const PerformanceEvaluationAssessmentService = {
  getEvaluationAssessment: (
    formlistId: number,
    setAssesInfoId: number
  ): Promise<EvaluationAssessmentResponse> => {
    return http
      .get(`/performance_evaluation_assessment/${formlistId}/${setAssesInfoId}`)
      .then((res: any) => {
        // res คือ ResponsePayload object ที่มี payload field
        // payload อาจเป็น array หรือ object
        const payload = res?.payload
        if (!payload) {
          throw new Error('No payload in response')
        }
        
        // ถ้า payload เป็น array ให้เอา element แรก
        if (Array.isArray(payload)) {
          return payload[0] as EvaluationAssessmentResponse
        }
        
        // ถ้า payload เป็น object โดยตรง ให้ return เลย
        return payload as EvaluationAssessmentResponse
      })
      .catch((error) => {
        console.error('Error in getEvaluationAssessment:', error)
        throw error
      })
  },

  saveDraft: (
    evaluationAssessmentId: number,
    body: SaveDraftRequest
  ): Promise<void> => {
    return http.put(`/performance_evaluation_assessment/${evaluationAssessmentId}`, body)
  },

  submitEvaluationAssessment: (
    evaluationAssessmentId: number
  ): Promise<{
    evaluation_assessment_id: number
    submitted: boolean
  }> => {
    return http
      .post(`/performance_evaluation_assessment/${evaluationAssessmentId}/submit`, {})
      .then((res: any) => res.payload?.[0] ?? res.payload)
  },

  getAverageAssessedLevels: (
    formlistId: number
  ): Promise<AverageAssessedLevel[]> => {
    return http
      .get(`/performance_evaluation_assessment/average/${formlistId}`)
      .then((res: any) => {
        const payload = res?.payload
        if (!payload) {
          return []
        }
        return Array.isArray(payload) ? payload : [payload]
      })
      .catch((error) => {
        console.error('Error in getAverageAssessedLevels:', error)
        return []
      })
  },
}

export default PerformanceEvaluationAssessmentService

