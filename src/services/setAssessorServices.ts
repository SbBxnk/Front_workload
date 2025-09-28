import { ResponsePayload } from '@/Types'
import http from '@/utils/http'

export interface RoundList {
  round_list_id: number
  round_list_name: string
  date_start: string
  date_end: string
  year: string
  round: number
}

export interface CreateRoundListRequest {
  round_list_name: string
  date_start: string
  date_end: string
  year: string
  round: number
}

export interface UpdateRoundListRequest {
  round_list_name: string
  date_start: string
  date_end: string
  year: string
  round: number
}

export interface SetAssessorList {
  set_asses_list_id: number
  as_u_id: number
  round_list_id: number
  prefix_name: string
  u_fname: string
  u_lname: string
  u_img: string
  u_id_card: string
  ex_position_name: string
  workload_group_id: number
  workload_group_name: string
  date_save: string
  as_user_name?: string
  as_user_email?: string
}

export interface CreateSetAssessorListRequest {
  as_u_id: number
  round_list_id: number
}

export interface SetAssessorInfo {
  set_asses_info_id: number
  ex_u_id: number
  set_asses_list_id: number
  ex_user_name?: string
  ex_user_email?: string
}

export interface CreateSetAssessorInfoRequest {
  ex_u_id: number
  set_asses_list_id: number
}

const SetAssessorServices = {
  // Round List APIs
  getAllRoundLists: (
    accessToken: string, 
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
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
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

  getRoundListById: (roundListId: number, accessToken: string): Promise<ResponsePayload<RoundList>> => {
    return http.get(`/set_assessor_round/${roundListId}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
  },

  createRoundList: (
    data: CreateRoundListRequest,
    accessToken: string
  ): Promise<ResponsePayload<RoundList>> => {
    return http.post('/set_assessor_round/add', data, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
  },

  updateRoundList: (
    roundListId: number,
    data: UpdateRoundListRequest,
    accessToken: string
  ): Promise<ResponsePayload<RoundList>> => {
    return http.put(`/set_assessor_round/update/${roundListId}`, data, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
  },

  deleteRoundList: (roundListId: number, accessToken: string): Promise<ResponsePayload<any>> => {
    return http.delete(`/set_assessor_round/delete/${roundListId}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
  },

  // Set Assessor List APIs
  getAllSetAssessorLists: (accessToken: string): Promise<ResponsePayload<SetAssessorList>> => {
    return http.get('/set_assessor_list', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })
  },

  getSetAssessorListByRound: (
    roundListId: number, 
    accessToken: string,
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
      headers: { Authorization: `Bearer ${accessToken}` },
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
    data: CreateSetAssessorListRequest,
    accessToken: string
  ): Promise<ResponsePayload<SetAssessorList>> => {
    return http.post('/set_assessor_list/add', data, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
  },

  deleteSetAssessorList: (setAssesListId: number, accessToken: string): Promise<ResponsePayload<any>> => {
    return http.delete(`/set_assessor_list/delete/${setAssesListId}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
  },

  // Set Assessor Info APIs
  getSetAssessorInfo: (
    setAssesListId: number, 
    accessToken: string,
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
      headers: { Authorization: `Bearer ${accessToken}` },
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

  createSetAssessorInfo: (
    data: CreateSetAssessorInfoRequest,
    accessToken: string
  ): Promise<ResponsePayload<SetAssessorInfo>> => {
    return http.post('/set_assessor_info/add', data, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
  },

  deleteSetAssessorInfo: (setAssesInfoId: number, accessToken: string): Promise<ResponsePayload<any>> => {
    return http.delete(`/set_assessor_info/delete/${setAssesInfoId}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
  },

  // Other APIs
  getAssessorOfCurrentYear: (roundListId: number, accessToken: string): Promise<ResponsePayload<any>> => {
    return http.get(`/set_assessor/${roundListId}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
  },

  // checkIsAssessor function removed - use AssessorService.checkAssessor instead

  getAssignedExaminees: (roundListId: number, exUserId: number, accessToken: string): Promise<ResponsePayload<any>> => {
    return http.get(`/set_assessor/assigned_examinees/${roundListId}/${exUserId}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
  },

  // ดึงข้อมูลผู้ถูกประเมินจาก set_asses_list_id
  getAssesseeBySetAssesListId: (setAssesListId: number, accessToken: string): Promise<ResponsePayload<any>> => {
    return http.get(`/assessee/${setAssesListId}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
  },

  // ดึงรายชื่อผู้ใช้ที่มีตำแหน่งบริหาร (สำหรับแต่งตั้งผู้ตรวจประเมิน)
  getAllExUsers: (setAssesListId: number, accessToken: string): Promise<ResponsePayload<any>> => {
    return http.get(`/ex_user/?set_asses_list_id=${setAssesListId}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
  },
}

export default SetAssessorServices
