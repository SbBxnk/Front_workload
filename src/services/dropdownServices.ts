import { ResponsePayload } from "@/Types"
import type { DropdownPrefix, DropdownPosition, DropdownExPosition, DropdownBranch, DropdownCourse, DropdownPersonalType, DropdownUserLevel } from "@/Types/dropdown"
import http from "@/utils/http"

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