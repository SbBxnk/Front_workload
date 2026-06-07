'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import Swal from 'sweetalert2'
import BranchServices from '@/services/branchServices'

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
 * mutation สำหรับ เพิ่ม/แก้ไข/ลบ สาขา
 * หลังสำเร็จจะ invalidate query 'branches' ให้ตารางรีเฟรชเอง
 */
export function useBranchMutations() {
  const queryClient = useQueryClient()
  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ['branches'] })

  const createBranch = useMutation({
    mutationFn: (branchName: string) =>
      BranchServices.createBranch({ branch_name: branchName }),
    onSuccess: (_, branchName) => {
      invalidate()
      notifySuccess(`เพิ่มสาขา ${branchName} สำเร็จ!`)
    },
    onError: () => notifyError('เกิดข้อผิดพลาดในการเพิ่มสาขา'),
  })

  const updateBranch = useMutation({
    mutationFn: ({ id, branchName }: { id: number; branchName: string }) =>
      BranchServices.updateBranch(id, { branch_name: branchName }),
    onSuccess: (_, { branchName }) => {
      invalidate()
      notifySuccess(`แก้ไขสาขา ${branchName} สำเร็จ!`)
    },
    onError: () => notifyError('เกิดข้อผิดพลาดในการแก้ไขสาขา'),
  })

  const deleteBranch = useMutation({
    mutationFn: (id: number) => BranchServices.deleteBranch(id),
    onSuccess: () => {
      invalidate()
      notifySuccess('ลบสาขาสำเร็จ!')
    },
    onError: () => notifyError('เกิดข้อผิดพลาดในการลบสาขา'),
  })

  return { createBranch, updateBranch, deleteBranch }
}
