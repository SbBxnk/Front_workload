'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import Swal from 'sweetalert2'
import PersonalTypeServices from '@/services/personaltypeServices'

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
 * mutation สำหรับ เพิ่ม/แก้ไข/ลบ ประเภทบุคลากร
 * หลังสำเร็จจะ invalidate query 'personalTypes' ให้ตารางรีเฟรชเอง
 */
export function usePersonalTypeMutations() {
  const queryClient = useQueryClient()
  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ['personalTypes'] })

  const createPersonalType = useMutation({
    mutationFn: (typePName: string) =>
      PersonalTypeServices.createPersonalType({ type_p_name: typePName }),
    onSuccess: (_, typePName) => {
      invalidate()
      notifySuccess(`เพิ่มประเภทบุคลากร ${typePName} สำเร็จ!`)
    },
    onError: () => notifyError('เกิดข้อผิดพลาดในการเพิ่มประเภทบุคลากร'),
  })

  const updatePersonalType = useMutation({
    mutationFn: ({ id, typePName }: { id: number; typePName: string }) =>
      PersonalTypeServices.updatePersonalType(id, { type_p_name: typePName }),
    onSuccess: (_, { typePName }) => {
      invalidate()
      notifySuccess(`แก้ไขประเภทบุคลากร ${typePName} สำเร็จ!`)
    },
    onError: () => notifyError('เกิดข้อผิดพลาดในการแก้ไขประเภทบุคลากร'),
  })

  const deletePersonalType = useMutation({
    mutationFn: (id: number) => PersonalTypeServices.deletePersonalType(id),
    onSuccess: () => {
      invalidate()
      notifySuccess('ลบประเภทบุคลากรสำเร็จ!')
    },
    onError: () => notifyError('เกิดข้อผิดพลาดในการลบประเภทบุคลากร'),
  })

  return { createPersonalType, updatePersonalType, deletePersonalType }
}
