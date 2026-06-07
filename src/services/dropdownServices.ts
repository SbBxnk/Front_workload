import { ResponsePayload } from "@/Types"
import http from "@/utils/http"

export interface DropdownPrefix {
  prefix_id: number
  prefix_name: string
}

export interface DropdownPosition {
  position_id: number
  position_name: string
  position_short_name?: string
}

export interface DropdownExPosition {
  ex_position_id: number
  ex_position_name: string
}

export interface DropdownBranch {
  branch_id: number
  branch_name: string
}

export interface DropdownCourse {
  course_id: number
  course_name: string
}

export interface DropdownPersonalType {
  type_p_id: number
  type_p_name: string
}

export interface DropdownUserLevel {
  level_id: number
  level_name: string
}

const DropdownService = {
  // Prefix dropdown
  getPrefixes: (): Promise<ResponsePayload<DropdownPrefix>> => {
    return http.get('/prefix')
  },

  // Position dropdown
  getPositions: (): Promise<{ status: boolean; data: DropdownPosition[] }> => {
    return http.get('/position', {
      params: {
        limit: 100, // ดึงข้อมูลทั้งหมด
        page: 1,
      }
    }).then((response: any) => {
      // Handle response format: { success, payload } or { status, data }
      if (response.success && response.payload) {
        return { status: true, data: response.payload }
      } else if (response.status && response.data) {
        return response
      } else {
        return { status: false, data: [] }
      }
    })
  },

  // Ex-Position dropdown
  getExPositions: (): Promise<{ status: boolean; data: DropdownExPosition[] }> => {
    return http.get('/ex_position')
  },

  // Branch dropdown
  getBranches: (): Promise<ResponsePayload<DropdownBranch>> => {
    return http.get('/branch')
  },

  // Course dropdown
  getCourses: (): Promise<ResponsePayload<DropdownCourse>> => {
    return http.get('/course')
  },

  // Personal Type dropdown
  getPersonalTypes: (): Promise<ResponsePayload<DropdownPersonalType>> => {
    return http.get('/personalType')
  },

  // User Level dropdown
  getUserLevels: (): Promise<ResponsePayload<DropdownUserLevel>> => {
    return http.get('/level')
  },
}

export default DropdownService