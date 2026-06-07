'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import Swal from 'sweetalert2'
import MainTaskServices from '@/services/mainTaskServices'

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
 * mutation สำหรับ เพิ่ม/แก้ไข/ลบ ภาระงานหลัก
 * หลังสำเร็จจะ invalidate query 'mainTasks' ให้ตารางรีเฟรชเอง
 */
export function useMainTaskMutations() {
  const queryClient = useQueryClient()
  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ['mainTasks'] })

  const createMainTask = useMutation({
    mutationFn: (name: string) =>
      MainTaskServices.createMainTask({ task_name: name }),
    onSuccess: (_, name) => {
      invalidate()
      notifySuccess(`เพิ่มภาระงานหลัก ${name} สำเร็จ!`)
    },
    onError: () => notifyError('เกิดข้อผิดพลาดในการเพิ่มภาระงานหลัก'),
  })

  const updateMainTask = useMutation({
    mutationFn: ({ id, name }: { id: number; name: string }) =>
      MainTaskServices.updateMainTask(id, { task_name: name }),
    onSuccess: (_, { name }) => {
      invalidate()
      notifySuccess(`แก้ไขภาระงานหลัก ${name} สำเร็จ!`)
    },
    onError: () => notifyError('เกิดข้อผิดพลาดในการแก้ไขภาระงานหลัก'),
  })

  const deleteMainTask = useMutation({
    mutationFn: (id: number) => MainTaskServices.deleteMainTask(id),
    onSuccess: () => {
      invalidate()
      notifySuccess('ลบภาระงานหลักสำเร็จ!')
    },
    onError: () => notifyError('เกิดข้อผิดพลาดในการลบภาระงานหลัก'),
  })

  return { createMainTask, updateMainTask, deleteMainTask }
}
