import { ResponsePayload } from '@/Types'
import http from '@/utils/http'

// Types for Performance Evaluation
export interface Competency {
  competency_id: number
  competency_name: string
  competency_order: number
}

export interface ExpectedLevel {
  expected_level_id: number
  competency_id: number
  position_id: number
  expected_level: number
  competency_name: string
  competency_order: number
  position_name: string
}

export interface PerformanceEvaluation {
  evaluation_id: number
  formlist_id: number
  u_id: number
  round_list_id: number
  position_id: number
  competency_id: number
  demonstrated_level: number | null
  competency_name: string
  competency_order: number
  position_name: string
}

export interface PerformanceEvaluationFormData {
  competencies: Competency[]
  expectedLevels: ExpectedLevel[]
  evaluations: PerformanceEvaluation[]
  userPositionId: number
}

export interface PerformanceEvaluationRequest {
  formlist_id: number
  u_id: number
  round_list_id: number
  position_id: number
  competency_id: number
  demonstrated_level: number | null
}

export interface PerformanceSnapshotEvaluation {
  snapshot_perf_detail_id: number
  // เก็บข้อมูลเป็น text เพื่อป้องกันการเปลี่ยนแปลงหลังจากส่งฟอร์ม
  position_name: string | null // เก็บชื่อตำแหน่งเป็น text
  position_short_name: string | null // เก็บชื่อย่อตำแหน่งเป็น text
  competency_name: string | null // เก็บชื่อสมรรถนะเป็น text
  competency_order: number | null
  demonstrated_level: number | null
  expected_level: number | null // เก็บ expected_level ที่ตรงกับ position ของ user จาก snapshot
}

export interface PerformanceSnapshot {
  snapshot_perf_id: number
  formlist_id: number
  u_id: number
  round_list_id: number
  snapshot_date: string
  status: number
  date_save: string
  updated_at: string
  evaluations: PerformanceSnapshotEvaluation[]
}

const PerformanceService = {
  // ดึงรายการสมรรถนะทั้งหมด
  getAllCompetencies: (accessToken: string): Promise<ResponsePayload<Competency>> => {
    return http.get('/performance/competencies', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })
  },

  // ดึงรายการสมรรถนะเดียว
  getOneCompetency: (competency_id: number, accessToken: string): Promise<ResponsePayload<Competency>> => {
    return http.get(`/performance/competencies/${competency_id}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })
  },

  // ดึงระดับสมรรถนะที่คาดหวังทั้งหมด
  getAllExpectedLevels: (accessToken: string): Promise<ResponsePayload<ExpectedLevel>> => {
    return http.get('/performance/expected-levels', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })
  },

  // ดึงระดับสมรรถนะที่คาดหวังตามตำแหน่ง
  getExpectedLevelsByPosition: (
    position_id: number,
    accessToken: string
  ): Promise<ResponsePayload<ExpectedLevel>> => {
    return http.get(`/performance/expected-levels/position/${position_id}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })
  },

  // ดึงข้อมูลฟอร์มการประเมินสมรรถนะ (พร้อมข้อมูลที่คาดหวัง)
  getPerformanceEvaluationForm: (
    formlist_id: number,
    u_id: number,
    accessToken: string
  ): Promise<ResponsePayload<PerformanceEvaluationFormData>> => {
    return http.get(`/performance/evaluation/formlist/${formlist_id}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      params: {
        u_id,
      },
    })
  },

  // ดึงข้อมูลการประเมินสมรรถนะตาม formlist_id
  getPerformanceEvaluation: (
    formlist_id: number,
    accessToken: string
  ): Promise<ResponsePayload<PerformanceEvaluation>> => {
    return http.get(`/performance/evaluation/formlist/${formlist_id}/data`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })
  },

  // ดึงข้อมูลการประเมินสมรรถนะตาม user และ round
  getPerformanceEvaluationByUserAndRound: (
    u_id: number,
    round_list_id: number,
    accessToken: string
  ): Promise<ResponsePayload<PerformanceEvaluation>> => {
    return http.get(`/performance/evaluation/user/${u_id}/round/${round_list_id}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })
  },

  // เพิ่มหรืออัปเดตข้อมูลการประเมินสมรรถนะ (รายการเดียว)
  addOrUpdatePerformanceEvaluation: (
    data: PerformanceEvaluationRequest,
    accessToken: string
  ): Promise<ResponsePayload<any>> => {
    return http.post('/performance/evaluation', data, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })
  },

  // เพิ่มหรืออัปเดตข้อมูลการประเมินสมรรถนะ (หลายรายการ)
  addOrUpdatePerformanceEvaluationBulk: (
    evaluations: PerformanceEvaluationRequest[],
    accessToken: string
  ): Promise<ResponsePayload<any>> => {
    return http.post(
      '/performance/evaluation/bulk',
      { evaluations },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    )
  },

  // เพิ่มข้อมูลระดับสมรรถนะที่คาดหวัง (สำหรับ admin)
  addExpectedLevel: (
    data: {
      competency_id: number
      position_id: number
      expected_level: number
    },
    accessToken: string
  ): Promise<ResponsePayload<any>> => {
    return http.post('/performance/expected-level', data, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })
  },

  // ดึงข้อมูล snapshot performance evaluation
  getPerformanceSnapshot: (
    formlist_id: number,
    u_id: number,
    round_list_id: number,
    accessToken: string
  ): Promise<ResponsePayload<PerformanceSnapshot | null>> => {
    return http.get('/performance/snapshot', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      params: {
        formlist_id,
        u_id,
        round_list_id,
      },
    })
  },
}

export default PerformanceService

