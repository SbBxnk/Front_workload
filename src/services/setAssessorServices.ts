import { ResponsePayload } from '@/Types'
import type {
  RoundList,
  CreateRoundListRequest,
  UpdateRoundListRequest,
  SetAssessorList,
  CreateSetAssessorListRequest,
  CreateSetAssessorListMultipleRequest,
  SetAssessorInfo,
  AssesseeSummary,
  CreateSetAssessorInfoRequest,
  CreateSetAssessorInfoMultipleRequest,
} from '@/Types/setAssessor'
import http from '@/utils/http'

const SetAssessorServices = {
  // Round List APIs
  getAllRoundLists: (
    params?: {
      search?: string
      page?: number
      limit?: number
      sort?: string
      order?: string
      year?: string
    }
  ): Promise<ResponsePayload<RoundList>> => {
    return http.get('/set_assessor_round', {
      params: {
        search: params?.search || '',
        page: params?.page || 1,
        limit: params?.limit || 10,
        sort: params?.sort || 'date_save',
        order: params?.order || 'desc',
        year: params?.year || '',
      },
    })
  },

  getRoundListById: (roundListId: number): Promise<ResponsePayload<RoundList>> => {
    return http.get(`/set_assessor_round/${roundListId}`)
  },

  createRoundList: (
    data: CreateRoundListRequest
  ): Promise<ResponsePayload<RoundList>> => {
    return http.post('/set_assessor_round/add', data)
  },

  updateRoundList: (
    roundListId: number,
    data: UpdateRoundListRequest
  ): Promise<ResponsePayload<RoundList>> => {
    return http.put(`/set_assessor_round/update/${roundListId}`, data)
  },

  deleteRoundList: (roundListId: number): Promise<ResponsePayload<any>> => {
    return http.delete(`/set_assessor_round/delete/${roundListId}`)
  },

  // Set Assessor List APIs
  getAllSetAssessorLists: (): Promise<ResponsePayload<SetAssessorList>> => {
    return http.get('/set_assessor_list')
  },

  getSetAssessorListByRound: (
    roundListId: number,
    params?: {
      search?: string
      page?: number
      limit?: number
      sort?: string
      order?: string
      ex_position_name?: string
    }
  ): Promise<ResponsePayload<SetAssessorList>> => {
    return http.get(`/set_assessor_list/${roundListId}`, {
      params: {
        search: params?.search || '',
        page: params?.page || 1,
        limit: params?.limit || 10,
        sort: params?.sort || 'date_save',
        order: params?.order || 'desc',
        ex_position_name: params?.ex_position_name || '',
      },
    })
  },

  createSetAssessorList: (
    data: CreateSetAssessorListRequest
  ): Promise<ResponsePayload<SetAssessorList>> => {
    return http.post('/set_assessor_list/add', data)
  },

  createSetAssessorListMultiple: (
    data: CreateSetAssessorListMultipleRequest
  ): Promise<ResponsePayload<SetAssessorList>> => {
    return http.post('/set_assessor_list/add_multiple', data)
  },

  deleteSetAssessorList: (setAssesListId: number): Promise<ResponsePayload<any>> => {
    return http.delete(`/set_assessor_list/delete/${setAssesListId}`)
  },

  // Set Assessor Info APIs
  getSetAssessorInfo: (
    setAssesListId: number,
    params?: {
      search?: string
      page?: number
      limit?: number
      sort?: string
      order?: string
      ex_position_name?: string
    }
  ): Promise<ResponsePayload<SetAssessorInfo>> => {
    return http.get(`/set_assessor_info/${setAssesListId}`, {
      params: {
        search: params?.search || '',
        page: params?.page || 1,
        limit: params?.limit || 10,
        sort: params?.sort || 'date_save',
        order: params?.order || 'desc',
        ex_position_name: params?.ex_position_name || '',
      },
    })
  },

  getAssesseeBySetAssesListId: (
    setAssesListId: number
  ): Promise<ResponsePayload<AssesseeSummary>> => {
    return http.get(`/assessee/${setAssesListId}`)
  },

  createSetAssessorInfo: (
    data: CreateSetAssessorInfoRequest
  ): Promise<ResponsePayload<SetAssessorInfo>> => {
    return http.post('/set_assessor_info/add', data)
  },

  createSetAssessorInfoMultiple: (
    data: CreateSetAssessorInfoMultipleRequest
  ): Promise<ResponsePayload<SetAssessorInfo>> => {
    return http.post('/set_assessor_info/add_multiple', data)
  },

  deleteSetAssessorInfo: (setAssesInfoId: number): Promise<ResponsePayload<any>> => {
    return http.delete(`/set_assessor_info/delete/${setAssesInfoId}`)
  },

  // รายชื่อผู้ใช้ที่เลือกเป็นผู้รับการประเมินได้ในรอบนี้ (backend ตอบ { status, data })
  getAssessUsers: (
    roundListId: number
  ): Promise<{ status: boolean; data: any[] }> => {
    return http.get(`/as_user/${roundListId}`)
  },

  // เพิ่ม workload form แบบ bulk หลังกำหนดผู้รับการประเมิน
  addBulkWorkloadForm: (
    data: { set_asses_list_id: number; status_id: number }[]
  ): Promise<any> => {
    return http.post('/workload_form/add_bulk', data)
  },

  // Other APIs
  getAssessorOfCurrentYear: (roundListId: number): Promise<ResponsePayload<any>> => {
    return http.get(`/set_assessor/${roundListId}`)
  },

  // checkIsAssessor function removed - use AssessorService.checkAssessor instead

  getAssignedExaminees: (roundListId: number, exUserId: number): Promise<ResponsePayload<any>> => {
    return http.get(`/set_assessor/assigned_examinees/${roundListId}/${exUserId}`)
  },

  // ดึงข้อมูลผู้รับการประเมินจาก set_asses_list_id
  // getAssesseeBySetAssesListId: (setAssesListId: number): Promise<ResponsePayload<any>> => {
  //   return http.get(`/assessee/${setAssesListId}`)
  // },

  // ดึงรายชื่อผู้ใช้ที่มีตำแหน่งบริหาร (สำหรับแต่งตั้งผู้ประเมิน)
  getAllExUsers: (setAssesListId: number): Promise<ResponsePayload<any>> => {
    return http.get(`/ex_user/?set_asses_list_id=${setAssesListId}`)
  },

  // ดึงข้อมูลรอบการประเมินทั้งหมด
  getAllRounds: (): Promise<ResponsePayload<RoundList>> => {
    return http.get('/set_assessor_round')
  },

  // ตรวจสอบว่าผู้ใช้มีสิทธิ์เข้าถึงรอบนี้หรือไม่
  checkUserAccessToRound: (
    as_u_id: number,
    round_list_id: number
  ): Promise<ResponsePayload<any>> => {
    return http.get(`/check_user_access/${as_u_id}/${round_list_id}`)
  },

}

export default SetAssessorServices
