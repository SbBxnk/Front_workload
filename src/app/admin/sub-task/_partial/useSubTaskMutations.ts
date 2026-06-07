'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import Swal from 'sweetalert2'
import SubTaskServices from '@/services/subTaskServices'
import type { CreateSubTaskRequest, UpdateSubTaskRequest } from '@/Types'

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
 * mutation สำหรับ เพิ่ม/แก้ไข/ลบ ภาระงานย่อย
 * หลังสำเร็จจะ invalidate query 'subtasks' ให้ตารางรีเฟรชเอง
 */
export function useSubTaskMutations() {
  const queryClient = useQueryClient()
  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ['subtasks'] })

  const createSubTask = useMutation({
    mutationFn: (data: CreateSubTaskRequest) =>
      SubTaskServices.createSubTask(data),
    onSuccess: (_, data) => {
      invalidate()
      notifySuccess(`เพิ่มภาระงานย่อย ${data.subtask_name} สำเร็จ!`)
    },
    onError: () => notifyError('เกิดข้อผิดพลาดในการเพิ่มภาระงานย่อย'),
  })

  const updateSubTask = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateSubTaskRequest }) =>
      SubTaskServices.updateSubTask(id, data),
    onSuccess: (_, { data }) => {
      invalidate()
      notifySuccess(`แก้ไขภาระงานย่อย ${data.subtask_name} สำเร็จ!`)
    },
    onError: () => notifyError('เกิดข้อผิดพลาดในการแก้ไขภาระงานย่อย'),
  })

  const deleteSubTask = useMutation({
    mutationFn: ({ id }: { id: number; name: string }) =>
      SubTaskServices.deleteSubTask(id),
    onSuccess: (_, { name }) => {
      invalidate()
      notifySuccess(`ลบภาระงานย่อย ${name} สำเร็จ!`)
    },
    onError: () => notifyError('เกิดข้อผิดพลาดในการลบภาระงานย่อย'),
  })

  return { createSubTask, updateSubTask, deleteSubTask }
}
