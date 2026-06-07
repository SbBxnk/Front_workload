import type {
  EvaluationResponse,
  SaveDraftRequest,
} from '@/Types/workloadEvaluation'
import http from '@/utils/http'

const WorkloadEvaluationService = {
  getEvaluation: (
    formlistId: number,
    setAssesInfoId: number
  ): Promise<EvaluationResponse> => {
    return http
      .get(`/workload_evaluation/${formlistId}/${setAssesInfoId}`)
      .then((res: any) => {
        const payload = res?.payload
        if (Array.isArray(payload)) {
          return payload[0] as EvaluationResponse
        }
        return payload as EvaluationResponse
      })
  },

  saveDraft: (
    evaluationId: number,
    body: SaveDraftRequest
  ): Promise<void> => {
    return http.put(`/workload_evaluation/${evaluationId}`, body)
  },

  submitEvaluation: (
    evaluationId: number
  ): Promise<{
    evaluation_id: number
    submitted: boolean
    submitted_count: number
    total_assignments: number
    form_finalized: boolean
  }> => {
    return http
      .post(`/workload_evaluation/${evaluationId}/submit`, {})
      .then((res: any) => res.payload?.[0] ?? res.payload)
  },

  getAssignedWorkloadGroup: (
    asUserId: number,
    roundListId: number
  ): Promise<{ workload_group_id: number; workload_group_name: string } | null> => {
    return http
      .get(`/workload_evaluation/assigned_group/${asUserId}/${roundListId}`)
      .then((res: any) => {
        const payload = res?.payload
        if (Array.isArray(payload)) {
          return (payload[0] as { workload_group_id: number; workload_group_name: string }) || null
        }
        return (payload as { workload_group_id: number; workload_group_name: string }) || null
      })
  },
}

export default WorkloadEvaluationService

