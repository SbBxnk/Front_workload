'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import Swal from 'sweetalert2'
import QuantityWorkloadServices from '@/services/quantityWorkloadServices'
import type { QuantityMatrixDataState } from '@/Types'

interface SaveItem {
  task_id: number
  workload_group_id: number
  quantity_workload_hours: number
  quantity_workload_id?: number
  isNew: boolean
}

// แยกข้อมูล matrix ออกเป็นรายการที่ต้อง "บันทึก" และ "ลบ"
function collectChanges(matrix: QuantityMatrixDataState): {
  updates: SaveItem[]
  deletions: number[]
} {
  const updates: SaveItem[] = []
  const deletions: number[] = []

  Object.keys(matrix).forEach((taskIdStr) => {
    const taskId = Number(taskIdStr)
    Object.keys(matrix[taskId]).forEach((groupIdStr) => {
      const groupId = Number(groupIdStr)
      const cell = matrix[taskId][groupId]

      if (
        cell.quantity_workload_id &&
        (cell.quantity_workload_hours === null ||
          cell.quantity_workload_hours === undefined)
      ) {
        deletions.push(cell.quantity_workload_id)
      } else if (
        cell.quantity_workload_hours !== null &&
        cell.quantity_workload_hours !== undefined
      ) {
        updates.push({
          task_id: taskId,
          workload_group_id: groupId,
          quantity_workload_hours: cell.quantity_workload_hours,
          quantity_workload_id: cell.quantity_workload_id,
          isNew: cell.isNew || false,
        })
      }
    })
  })

  return { updates, deletions }
}

/**
 * mutation บันทึกรวมของตารางเกณฑ์จำนวนภาระงาน
 * รวม create/update/delete ในครั้งเดียว แล้ว invalidate 'quantityWorkloads'
 */
export function useQuantityWorkloadSave() {
  const queryClient = useQueryClient()

  const saveAll = useMutation({
    mutationFn: async (matrix: QuantityMatrixDataState) => {
      const { updates, deletions } = collectChanges(matrix)

      const deletePromises = deletions.map((id) =>
        QuantityWorkloadServices.deleteQuantityWorkload(id)
      )

      const savePromises = updates.map((update) =>
        update.isNew || !update.quantity_workload_id
          ? QuantityWorkloadServices.createQuantityWorkload({
              task_id: update.task_id,
              workload_group_id: update.workload_group_id,
              quantity_workload_hours: update.quantity_workload_hours,
            })
          : QuantityWorkloadServices.updateQuantityWorkload(
              update.quantity_workload_id,
              {
                task_id: update.task_id,
                workload_group_id: update.workload_group_id,
                quantity_workload_hours: update.quantity_workload_hours,
              }
            )
      )

      await Promise.all([...deletePromises, ...savePromises])
      return updates.length + deletions.length
    },
    onSuccess: (totalChanges) => {
      queryClient.invalidateQueries({ queryKey: ['quantityWorkloads'] })
      Swal.fire({
        icon: 'success',
        title: 'บันทึกสำเร็จ!',
        text: `บันทึกข้อมูล ${totalChanges} รายการสำเร็จ!`,
        showConfirmButton: false,
        timer: 1500,
      })
    },
    onError: () => {
      Swal.fire({
        icon: 'error',
        title: 'เกิดข้อผิดพลาด!',
        text: 'เกิดข้อผิดพลาดในการบันทึกข้อมูล',
        showConfirmButton: false,
        timer: 1500,
      })
    },
  })

  return { saveAll }
}
