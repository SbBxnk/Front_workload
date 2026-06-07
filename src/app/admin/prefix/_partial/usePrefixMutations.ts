'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import Swal from 'sweetalert2'
import PrefixServices from '@/services/prefixServices'

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
 * mutation สำหรับ เพิ่ม/แก้ไข/ลบ คำนำหน้า
 * หลังสำเร็จจะ invalidate query 'prefixes' ให้ตารางรีเฟรชเอง
 */
export function usePrefixMutations() {
  const queryClient = useQueryClient()
  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ['prefixes'] })

  const createPrefix = useMutation({
    mutationFn: (prefixName: string) =>
      PrefixServices.createPrefix({ prefix_name: prefixName }),
    onSuccess: (_, prefixName) => {
      invalidate()
      notifySuccess(`เพิ่มคำนำหน้า ${prefixName} สำเร็จ!`)
    },
    onError: () => notifyError('เกิดข้อผิดพลาดในการเพิ่มคำนำหน้า'),
  })

  const updatePrefix = useMutation({
    mutationFn: ({ id, prefixName }: { id: number; prefixName: string }) =>
      PrefixServices.updatePrefix(id, { prefix_name: prefixName }),
    onSuccess: (_, { prefixName }) => {
      invalidate()
      notifySuccess(`แก้ไขคำนำหน้า ${prefixName} สำเร็จ!`)
    },
    onError: () => notifyError('เกิดข้อผิดพลาดในการแก้ไขคำนำหน้า'),
  })

  const deletePrefix = useMutation({
    mutationFn: (id: number) => PrefixServices.deletePrefix(id),
    onSuccess: () => {
      invalidate()
      notifySuccess('ลบคำนำหน้าสำเร็จ!')
    },
    onError: () => notifyError('เกิดข้อผิดพลาดในการลบคำนำหน้า'),
  })

  return { createPrefix, updatePrefix, deletePrefix }
}
