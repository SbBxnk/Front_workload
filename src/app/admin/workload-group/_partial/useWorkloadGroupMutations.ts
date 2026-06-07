'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import Swal from 'sweetalert2'
import WorkloadGroupServices from '@/services/workloadGroupServices'

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
 * mutation สำหรับ เพิ่ม/แก้ไข/ลบ กลุ่มภาระงาน
 * หลังสำเร็จจะ invalidate query 'workloadGroups' ให้ตารางรีเฟรชเอง
 */
export function useWorkloadGroupMutations() {
  const queryClient = useQueryClient()
  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ['workloadGroups'] })

  const createWorkloadGroup = useMutation({
    mutationFn: (name: string) =>
      WorkloadGroupServices.createWorkloadGroup({ workload_group_name: name }),
    onSuccess: (_, name) => {
      invalidate()
      notifySuccess(`เพิ่มกลุ่มภาระงาน ${name} สำเร็จ!`)
    },
    onError: () => notifyError('เกิดข้อผิดพลาดในการเพิ่มกลุ่มภาระงาน'),
  })

  const updateWorkloadGroup = useMutation({
    mutationFn: ({ id, name }: { id: number; name: string }) =>
      WorkloadGroupServices.updateWorkloadGroup(id, {
        workload_group_name: name,
      }),
    onSuccess: (_, { name }) => {
      invalidate()
      notifySuccess(`แก้ไขกลุ่มภาระงาน ${name} สำเร็จ!`)
    },
    onError: () => notifyError('เกิดข้อผิดพลาดในการแก้ไขกลุ่มภาระงาน'),
  })

  const deleteWorkloadGroup = useMutation({
    mutationFn: (id: number) => WorkloadGroupServices.deleteWorkloadGroup(id),
    onSuccess: () => {
      invalidate()
      notifySuccess('ลบกลุ่มภาระงานสำเร็จ!')
    },
    onError: () => notifyError('เกิดข้อผิดพลาดในการลบกลุ่มภาระงาน'),
  })

  return { createWorkloadGroup, updateWorkloadGroup, deleteWorkloadGroup }
}
