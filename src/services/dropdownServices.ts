import { ResponsePayload } from "@/Types"
import http from "@/utils/http"

export interface DropdownPrefix {
  prefix_id: number
  prefix_name: string
}

export interface DropdownPosition {
  position_id: number
  position_name: string
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
  getPrefixes: (accessToken: string): Promise<ResponsePayload<DropdownPrefix>> => {
    return http.get('/prefix', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      }
    })
  },

  // Position dropdown
  getPositions: (accessToken: string): Promise<{ status: boolean; data: DropdownPosition[] }> => {
    return http.get('/position', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      }
    })
  },

  // Ex-Position dropdown
  getExPositions: (accessToken: string): Promise<{ status: boolean; data: DropdownExPosition[] }> => {
    return http.get('/ex_position', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      }
    })
  },

  // Branch dropdown
  getBranches: (accessToken: string): Promise<ResponsePayload<DropdownBranch>> => {
    return http.get('/branch', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      }
    })
  },

  // Course dropdown
  getCourses: (accessToken: string): Promise<ResponsePayload<DropdownCourse>> => {
    return http.get('/course', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      }
    })
  },

  // Personal Type dropdown
  getPersonalTypes: (accessToken: string): Promise<ResponsePayload<DropdownPersonalType>> => {
    return http.get('/personalType', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      }
    })
  },

  // User Level dropdown
  getUserLevels: (accessToken: string): Promise<ResponsePayload<DropdownUserLevel>> => {
    return http.get('/level', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      }
    })
  },
}

export default DropdownService