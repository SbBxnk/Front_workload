'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import Swal from 'sweetalert2'
import PositionServices from '@/services/positionServices'

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

interface PositionInput {
  positionName: string
  positionShortName: string
}

/**
 * mutation สำหรับ เพิ่ม/แก้ไข/ลบ ตำแหน่งวิชาการ
 * หลังสำเร็จจะ invalidate query 'positions' ให้ตารางรีเฟรชเอง
 */
export function usePositionMutations() {
  const queryClient = useQueryClient()
  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ['positions'] })

  const createPosition = useMutation({
    mutationFn: ({ positionName, positionShortName }: PositionInput) =>
      PositionServices.createPosition({
        position_name: positionName,
        position_short_name: positionShortName || undefined,
      }),
    onSuccess: (_, { positionName }) => {
      invalidate()
      notifySuccess(`เพิ่มตำแหน่งวิชาการ ${positionName} สำเร็จ!`)
    },
    onError: () => notifyError('เกิดข้อผิดพลาดในการเพิ่มตำแหน่งวิชาการ'),
  })

  const updatePosition = useMutation({
    mutationFn: ({
      id,
      positionName,
      positionShortName,
    }: PositionInput & { id: number }) =>
      PositionServices.updatePosition(id, {
        position_name: positionName,
        position_short_name: positionShortName || undefined,
      }),
    onSuccess: (_, { positionName }) => {
      invalidate()
      notifySuccess(`แก้ไขตำแหน่งวิชาการ ${positionName} สำเร็จ!`)
    },
    onError: () => notifyError('เกิดข้อผิดพลาดในการแก้ไขตำแหน่งวิชาการ'),
  })

  const deletePosition = useMutation({
    mutationFn: (id: number) => PositionServices.deletePosition(id),
    onSuccess: () => {
      invalidate()
      notifySuccess('ลบตำแหน่งวิชาการสำเร็จ!')
    },
    onError: () => notifyError('เกิดข้อผิดพลาดในการลบตำแหน่งวิชาการ'),
  })

  return { createPosition, updatePosition, deletePosition }
}
