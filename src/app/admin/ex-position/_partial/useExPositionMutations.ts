'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import Swal from 'sweetalert2'
import ExpositionServices from '@/services/exPositionServices'

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
 * mutation สำหรับ เพิ่ม/แก้ไข/ลบ ตำแหน่งบริหาร
 * หลังสำเร็จจะ invalidate query 'exPositions' ให้ตารางรีเฟรชเอง
 */
export function useExPositionMutations() {
  const queryClient = useQueryClient()
  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ['exPositions'] })

  const createExPosition = useMutation({
    mutationFn: (name: string) =>
      ExpositionServices.createExposition({ ex_position_name: name }),
    onSuccess: (_, name) => {
      invalidate()
      notifySuccess(`เพิ่มตำแหน่งบริหาร ${name} สำเร็จ!`)
    },
    onError: () => notifyError('เกิดข้อผิดพลาดในการเพิ่มตำแหน่งบริหาร'),
  })

  const updateExPosition = useMutation({
    mutationFn: ({ id, name }: { id: number; name: string }) =>
      ExpositionServices.updateExposition(id, { ex_position_name: name }),
    onSuccess: (_, { name }) => {
      invalidate()
      notifySuccess(`แก้ไขตำแหน่งบริหาร ${name} สำเร็จ!`)
    },
    onError: () => notifyError('เกิดข้อผิดพลาดในการแก้ไขตำแหน่งบริหาร'),
  })

  const deleteExPosition = useMutation({
    mutationFn: (id: number) => ExpositionServices.deleteExposition(id),
    onSuccess: () => {
      invalidate()
      notifySuccess('ลบตำแหน่งบริหารสำเร็จ!')
    },
    onError: () => notifyError('เกิดข้อผิดพลาดในการลบตำแหน่งบริหาร'),
  })

  return { createExPosition, updateExPosition, deleteExPosition }
}
