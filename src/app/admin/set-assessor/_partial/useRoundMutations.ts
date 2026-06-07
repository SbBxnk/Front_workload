'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import Swal from 'sweetalert2'
import SetAssessorServices from '@/services/setAssessorServices'
import type {
  CreateRoundListRequest,
  UpdateRoundListRequest,
} from '@/Types/setAssessor'

// แจ้งผลแบบสั้น ใช้ซ้ำทุก mutation
const notifySuccess = (title: string, text: string) =>
  Swal.fire({
    position: 'center',
    icon: 'success',
    title,
    text,
    showConfirmButton: false,
    timer: 1500,
  })

const notifyError = (text: string) =>
  Swal.fire({
    position: 'center',
    icon: 'error',
    title: 'เกิดข้อผิดพลาด!',
    text,
    showConfirmButton: false,
    timer: 1500,
  })

/**
 * mutation สำหรับ เพิ่ม/แก้ไข/ลบ รอบการประเมิน
 * หลังสำเร็จจะ invalidate query 'roundLists' ให้ตารางรีเฟรชเอง
 */
export function useRoundMutations() {
  const queryClient = useQueryClient()
  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ['roundLists'] })

  const createRound = useMutation({
    mutationFn: (data: CreateRoundListRequest) =>
      SetAssessorServices.createRoundList(data),
    onSuccess: (_, data) => {
      invalidate()
      notifySuccess('สำเร็จ!', `เพิ่มรอบการประเมิน ${data.round_list_name} สำเร็จ!`)
    },
    onError: (error) => {
      console.error('Error adding round list:', error)
      notifyError('เกิดข้อผิดพลาดในการเพิ่มรอบการประเมิน')
    },
  })

  const updateRound = useMutation({
    mutationFn: ({
      roundListId,
      data,
    }: {
      roundListId: number
      data: UpdateRoundListRequest
    }) => SetAssessorServices.updateRoundList(roundListId, data),
    onSuccess: (_, { data }) => {
      invalidate()
      notifySuccess('แก้ไขสำเร็จ!', `แก้ไข ${data.round_list_name} สำเร็จ!`)
    },
    onError: (error) => {
      console.error('Error edit round list:', error)
      notifyError('เกิดข้อผิดพลาดในการแก้ไขรอบการประเมิน')
    },
  })

  const deleteRound = useMutation({
    mutationFn: ({ roundListId }: { roundListId: number; roundName: string }) =>
      SetAssessorServices.deleteRoundList(roundListId),
    onSuccess: (_, { roundName }) => {
      invalidate()
      notifySuccess('ลบสำเร็จ!', `ลบรอบการประเมิน ${roundName} สำเร็จ!`)
    },
    onError: () => notifyError('เกิดข้อผิดพลาดในการลบรอบการประเมิน'),
  })

  return { createRound, updateRound, deleteRound }
}
