'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import Swal from 'sweetalert2'
import CompetencyServices from '@/services/competencyService'
import type {
  CreateCompetencyRequest,
  UpdateCompetencyRequest,
} from '@/Types'

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
 * mutation สำหรับ เพิ่ม/แก้ไข/ลบ สมรรถนะ
 * หลังสำเร็จจะ invalidate query 'competencies' ให้ตารางรีเฟรชเอง
 */
export function useCompetencyMutations() {
  const queryClient = useQueryClient()
  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ['competencies'] })

  const createCompetency = useMutation({
    mutationFn: (data: CreateCompetencyRequest) =>
      CompetencyServices.createCompetency(data),
    onSuccess: (_, data) => {
      invalidate()
      notifySuccess(`เพิ่มสมรรถนะ ${data.competency_name} สำเร็จ!`)
    },
    onError: () => notifyError('เกิดข้อผิดพลาดในการเพิ่มสมรรถนะ'),
  })

  const updateCompetency = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateCompetencyRequest }) =>
      CompetencyServices.updateCompetency(id, data),
    onSuccess: (_, { data }) => {
      invalidate()
      notifySuccess(`แก้ไขสมรรถนะ ${data.competency_name} สำเร็จ!`)
    },
    onError: () => notifyError('เกิดข้อผิดพลาดในการแก้ไขสมรรถนะ'),
  })

  const deleteCompetency = useMutation({
    mutationFn: (id: number) => CompetencyServices.deleteCompetency(id),
    onSuccess: () => {
      invalidate()
      notifySuccess('ลบสมรรถนะสำเร็จ!')
    },
    onError: () => notifyError('เกิดข้อผิดพลาดในการลบสมรรถนะ'),
  })

  return { createCompetency, updateCompetency, deleteCompetency }
}
