import { ResponsePayload } from '@/Types'
import type {
  Competency,
  ExpectedLevel,
  PerformanceEvaluation,
  PerformanceEvaluationFormData,
  PerformanceEvaluationRequest,
  PerformanceSnapshot,
} from '@/Types/performance'
import http from '@/utils/http'

const PerformanceService = {
  // ดึงรายการสมรรถนะทั้งหมด
  getAllCompetencies: (): Promise<ResponsePayload<Competency>> => {
    return http.get('/performance/competencies')
  },

  // ดึงรายการสมรรถนะเดียว
  getOneCompetency: (competency_id: number): Promise<ResponsePayload<Competency>> => {
    return http.get(`/performance/competencies/${competency_id}`)
  },

  // ดึงระดับสมรรถนะที่คาดหวังทั้งหมด
  getAllExpectedLevels: (): Promise<ResponsePayload<ExpectedLevel>> => {
    return http.get('/performance/expected-levels')
  },

  // ดึงระดับสมรรถนะที่คาดหวังตามตำแหน่ง
  getExpectedLevelsByPosition: (
    position_id: number
  ): Promise<ResponsePayload<ExpectedLevel>> => {
    return http.get(`/performance/expected-levels/position/${position_id}`)
  },

  // ดึงข้อมูลฟอร์มการประเมินสมรรถนะ (พร้อมข้อมูลที่คาดหวัง)
  getPerformanceEvaluationForm: (
    formlist_id: number,
    u_id: number
  ): Promise<ResponsePayload<PerformanceEvaluationFormData>> => {
    return http.get(`/performance/evaluation/formlist/${formlist_id}`, {
      params: {
        u_id,
      },
    })
  },

  // ดึงข้อมูลการประเมินสมรรถนะตาม formlist_id
  getPerformanceEvaluation: (
    formlist_id: number
  ): Promise<ResponsePayload<PerformanceEvaluation>> => {
    return http.get(`/performance/evaluation/formlist/${formlist_id}/data`)
  },

  // ดึงข้อมูลการประเมินสมรรถนะตาม user และ round
  getPerformanceEvaluationByUserAndRound: (
    u_id: number,
    round_list_id: number
  ): Promise<ResponsePayload<PerformanceEvaluation>> => {
    return http.get(`/performance/evaluation/user/${u_id}/round/${round_list_id}`)
  },

  // เพิ่มหรืออัปเดตข้อมูลการประเมินสมรรถนะ (รายการเดียว)
  addOrUpdatePerformanceEvaluation: (
    data: PerformanceEvaluationRequest
  ): Promise<ResponsePayload<any>> => {
    return http.post('/performance/evaluation', data)
  },

  // เพิ่มหรืออัปเดตข้อมูลการประเมินสมรรถนะ (หลายรายการ)
  addOrUpdatePerformanceEvaluationBulk: (
    evaluations: PerformanceEvaluationRequest[]
  ): Promise<ResponsePayload<any>> => {
    return http.post(
      '/performance/evaluation/bulk',
      { evaluations }
    )
  },

  // เพิ่มข้อมูลระดับสมรรถนะที่คาดหวัง (สำหรับ admin)
  addExpectedLevel: (
    data: {
      competency_id: number
      position_id: number
      expected_level: number
    }
  ): Promise<ResponsePayload<any>> => {
    return http.post('/performance/expected-level', data)
  },

  // ดึงข้อมูล snapshot performance evaluation
  getPerformanceSnapshot: (
    formlist_id: number,
    u_id: number,
    round_list_id: number
  ): Promise<ResponsePayload<PerformanceSnapshot | null>> => {
    return http.get('/performance/snapshot', {
      params: {
        formlist_id,
        u_id,
        round_list_id,
      },
    })
  },
}

export default PerformanceService

