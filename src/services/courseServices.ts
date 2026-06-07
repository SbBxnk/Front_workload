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
  getAllCourses: (param?: CourseSearchParams): Promise<ResponsePayload<Course>> => {
    return http.get('/course', {
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
    data: CreateCourseRequest
  ): Promise<Course> => {
    return http.post('/course/add', data)
  },

  updateCourse: (
    courseId: number,
    data: UpdateCourseRequest
  ): Promise<Course> => {
    return http.put(`/course/update/${courseId}`, data)
  },

  deleteCourse: (courseId: number): Promise<void> => {
    return http.delete(`/course/delete/${courseId}`)
  },

  getCourseById: (courseId: number): Promise<Course> => {
    return http.get(`/course/${courseId}`)
  },

  getCoursesByBranch: (branchId: number): Promise<ResponsePayload<Course>> => {
    return http.get(`/course/branch/${branchId}`)
  },

  getAllCoursesSimple: (): Promise<ResponsePayload<Course>> => {
    return http.get('/course/simple')
  }
}

export default CourseServices