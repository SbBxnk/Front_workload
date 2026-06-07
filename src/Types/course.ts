export interface Course {
  course_id: number
  course_name: string
  branch_id: number
  branch_name: string
}

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
