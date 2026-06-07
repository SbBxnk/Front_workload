'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import Swal from 'sweetalert2'
import UserServices from '@/services/userServices'
import type { Personal, UpdateUserRequest, UserSearchParams } from '@/Types'

const notifySuccess = (title: string, text: string) =>
  Swal.fire({
    icon: 'success',
    title,
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
 * mutation สำหรับ ลบ/แก้ไข บุคลากร + ฟังก์ชันส่งออก Excel
 * หลังสำเร็จจะ invalidate query 'users' ให้ตารางรีเฟรชเอง
 */
export function useUserMutations() {
  const queryClient = useQueryClient()
  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ['users'] })

  const deleteUser = useMutation({
    mutationFn: ({ userId }: { userId: number; userName: string }) =>
      UserServices.deleteUser(userId),
    onSuccess: (_, { userName }) => {
      invalidate()
      notifySuccess('ลบสำเร็จ!', `ลบบุคลากร ${userName} สำเร็จ!`)
    },
    onError: () => notifyError('เกิดข้อผิดพลาดในการลบบุคลากร'),
  })

  const updateUser = useMutation({
    mutationFn: ({
      userId,
      data,
    }: {
      userId: number
      data: UpdateUserRequest | Partial<Personal>
    }) => UserServices.updateUser(userId, data as UpdateUserRequest),
    onSuccess: () => {
      invalidate()
      notifySuccess('แก้ไขสำเร็จ!', 'แก้ไขข้อมูลบุคลากรสำเร็จ!')
    },
    onError: () => notifyError('เกิดข้อผิดพลาดในการแก้ไขข้อมูล'),
  })

  // ส่งออกข้อมูลบุคลากรเป็นไฟล์ Excel แล้วดาวน์โหลด blob
  const exportUsersToExcel = async (params: UserSearchParams) => {
    try {
      Swal.fire({
        title: 'กำลังส่งออกข้อมูล...',
        text: 'กรุณารอสักครู่',
        allowOutsideClick: false,
        showConfirmButton: false,
      })

      await new Promise((resolve) => setTimeout(resolve, 3000))

      const blob = await UserServices.exportUsersToExcel(params)

      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `users_export_${new Date().toISOString().split('T')[0]}.xlsx`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

      Swal.fire({
        icon: 'success',
        title: 'ส่งออกข้อมูลสำเร็จ',
        text: 'ไฟล์ Excel ได้ถูกดาวน์โหลดแล้ว',
        timer: 2000,
        showConfirmButton: false,
      })
    } catch (error) {
      console.error('Export error:', error)
      Swal.fire({
        icon: 'error',
        title: 'เกิดข้อผิดพลาด',
        text: 'ไม่สามารถส่งออกข้อมูลได้ กรุณาลองใหม่อีกครั้ง',
      })
    }
  }

  return { deleteUser, updateUser, exportUsersToExcel }
}
