'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import Swal from 'sweetalert2'
import PerformanceTermServices from '@/services/performanceTermService'
import type { PerformanceMatrixDataState } from '@/Types'

interface SaveItem {
  competency_id: number
  position_id: number
  expected_level: number
  expected_level_id?: number
  isNew: boolean
}

// แยกข้อมูล matrix ออกเป็นรายการที่ต้อง "บันทึก" และ "ลบ"
function collectChanges(matrix: PerformanceMatrixDataState): {
  updates: SaveItem[]
  deletions: number[]
} {
  const updates: SaveItem[] = []
  const deletions: number[] = []

  Object.keys(matrix).forEach((compIdStr) => {
    const competencyId = Number(compIdStr)
    Object.keys(matrix[competencyId]).forEach((posIdStr) => {
      const positionId = Number(posIdStr)
      const cell = matrix[competencyId][positionId]

      if (
        cell.expected_level_id &&
        (cell.expected_level === null || cell.expected_level === undefined)
      ) {
        deletions.push(cell.expected_level_id)
      } else if (
        cell.expected_level !== null &&
        cell.expected_level !== undefined
      ) {
        updates.push({
          competency_id: competencyId,
          position_id: positionId,
          expected_level: cell.expected_level,
          expected_level_id: cell.expected_level_id,
          isNew: cell.isNew || false,
        })
      }
    })
  })

  return { updates, deletions }
}

/**
 * mutation บันทึกรวมของตารางเกณฑ์สมรรถนะ
 * รวม create/update/delete ในครั้งเดียว แล้ว invalidate 'performanceTerms'
 */
export function usePerformanceTermMutations() {
  const queryClient = useQueryClient()

  const saveAll = useMutation({
    mutationFn: async (matrix: PerformanceMatrixDataState) => {
      const { updates, deletions } = collectChanges(matrix)

      const deletePromises = deletions.map((id) =>
        PerformanceTermServices.deletePerformanceTerm(id)
      )

      const savePromises = updates.map((update) =>
        update.isNew || !update.expected_level_id
          ? PerformanceTermServices.createPerformanceTerm({
              competency_id: update.competency_id,
              position_id: update.position_id,
              expected_level: update.expected_level,
            })
          : PerformanceTermServices.updatePerformanceTerm(
              update.expected_level_id,
              {
                competency_id: update.competency_id,
                position_id: update.position_id,
                expected_level: update.expected_level,
              }
            )
      )

      await Promise.all([...deletePromises, ...savePromises])
      return updates.length + deletions.length
    },
    onSuccess: (totalChanges) => {
      queryClient.invalidateQueries({ queryKey: ['performanceTerms'] })
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
