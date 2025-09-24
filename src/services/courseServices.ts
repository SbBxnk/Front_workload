import { Course, ResponsePayload } from '@/Types'
import http from '@/utils/http'

export interface CourseSearchParams {
  search?: string
  page?: number
  limit?: number
  sort?: string
  order?: string
}

export interface CreateCourseRequest {
  course_name: string
  branch_id: number
}

export interface UpdateCourseRequest {
  course_name: string
  branch_id: number
}

const CourseServices = {
  getAllCourses: (accessToken: string, param?: CourseSearchParams): Promise<ResponsePayload<Course>> => {
    return http.get('/course', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      params: {
        search: param?.search,
        page: param?.page,
        limit: param?.limit,
        sort: param?.sort,
        order: param?.order,
      },
    })
  },

  createCourse: (
    data: CreateCourseRequest,
    accessToken: string
  ): Promise<Course> => {
    return http.post('/course/add', data, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
  },

  updateCourse: (
    courseId: number,
    data: UpdateCourseRequest,
    accessToken: string
  ): Promise<Course> => {
    return http.put(`/course/update/${courseId}`, data, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
  },

  deleteCourse: (courseId: number, accessToken: string): Promise<void> => {
    return http.delete(`/course/delete/${courseId}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
  },

  getCourseById: (courseId: number, accessToken: string): Promise<Course> => {
    return http.get(`/course/${courseId}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
  },

  getCoursesByBranch: (branchId: number, accessToken: string): Promise<Course[]> => {
    return http.get(`/course/branch/${branchId}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
  },
}

export default CourseServices