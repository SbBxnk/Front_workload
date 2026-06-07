'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import Swal from 'sweetalert2'
import CourseServices from '@/services/courseServices'
import type { CreateCourseRequest, UpdateCourseRequest } from '@/Types'

// แจ้งผลแบบสั้น ใช้ซ้ำทุก mutation
const notifySuccess = (text: string) =>
  Swal.fire({
    icon: 'success',
    title: 'สำเร็จ!',
    text,
    showConfirmButton: false,
    timer: 1500,
  })

const notifyError = (text: string) =>
  Swal.fire({
    icon: 'error',
    title: 'เกิดข้อผิดพลาด!',
    text,
    showConfirmButton: false,
    timer: 1500,
  })

/**
 * mutation สำหรับ เพิ่ม/แก้ไข/ลบ หลักสูตร
 * หลังสำเร็จจะ invalidate query 'courses' ให้ตารางรีเฟรชเอง
 */
export function useCourseMutations() {
  const queryClient = useQueryClient()
  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ['courses'] })

  const createCourse = useMutation({
    mutationFn: (data: CreateCourseRequest) => CourseServices.createCourse(data),
    onSuccess: (_, data) => {
      invalidate()
      notifySuccess(`เพิ่มหลักสูตร ${data.course_name} สำเร็จ!`)
    },
    onError: () => notifyError('เกิดข้อผิดพลาดในการเพิ่มหลักสูตร'),
  })

  const updateCourse = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateCourseRequest }) =>
      CourseServices.updateCourse(id, data),
    onSuccess: (_, { data }) => {
      invalidate()
      notifySuccess(`แก้ไขหลักสูตร ${data.course_name} สำเร็จ!`)
    },
    onError: () => notifyError('เกิดข้อผิดพลาดในการแก้ไขหลักสูตร'),
  })

  const deleteCourse = useMutation({
    mutationFn: ({ id }: { id: number; name: string }) =>
      CourseServices.deleteCourse(id),
    onSuccess: (_, { name }) => {
      invalidate()
      notifySuccess(`ลบหลักสูตร ${name} สำเร็จ!`)
    },
    onError: () => notifyError('เกิดข้อผิดพลาดในการลบหลักสูตร'),
  })

  return { createCourse, updateCourse, deleteCourse }
}
