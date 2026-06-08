'use client'

import { useEffect, useState } from 'react'
import type { QuantityMatrixDataState } from '@/Types'
import useUtility from '@/hooks/useUtility'
import StickyFooter from '@/components/StickyFooter'
import { useQuantityWorkloadMatrix } from './_partial/useQuantityWorkloadMatrix'
import { useQuantityWorkloadSave } from './_partial/useQuantityWorkloadSave'
import QuantityWorkloadMatrixTable from './_partial/QuantityWorkloadMatrixTable'

const cloneMatrix = (
  matrix: QuantityMatrixDataState
): QuantityMatrixDataState =>
  JSON.parse(JSON.stringify(matrix)) as QuantityMatrixDataState

export default function WorkloadQuantityPage() {
  const { setBreadcrumbs } = useUtility()
  const { sortedMainTasks, sortedWorkloadGroups, initialMatrix, isLoading } =
    useQuantityWorkloadMatrix()
  const { saveAll } = useQuantityWorkloadSave()

  const [isEditing, setIsEditing] = useState(false)
  const [matrixData, setMatrixData] = useState<QuantityMatrixDataState>({})

  const loading = isLoading || saveAll.isPending

  useEffect(() => {
    setBreadcrumbs([
      { text: 'เกณฑ์จำนวนภาระงาน', path: '/admin/workload-quantity' },
    ])
  }, [setBreadcrumbs])

  // seed state ที่แก้ไขได้จาก matrix ของ server เมื่อไม่ได้อยู่ในโหมดแก้ไข
  useEffect(() => {
    if (!isEditing) setMatrixData(cloneMatrix(initialMatrix))
  }, [initialMatrix, isEditing])

  const handleCellChange = (
    taskId: number,
    workloadGroupId: number,
    value: string
  ) => {
    if (!isEditing) return

    const numValue = value === '' ? null : parseFloat(value)
    if (numValue !== null && (numValue < 0 || isNaN(numValue))) return

    setMatrixData((prev) => {
      const newData = { ...prev }
      if (!newData[taskId]) newData[taskId] = {}
      newData[taskId][workloadGroupId] = {
        ...newData[taskId][workloadGroupId],
        quantity_workload_hours: numValue,
        isNew:
          newData[taskId][workloadGroupId]?.quantity_workload_id === undefined,
      }
      return newData
    })
  }

  const handleStartEditing = () => {
    if (!loading) setIsEditing(true)
  }

  const handleCancelEdit = () => {
    setMatrixData(cloneMatrix(initialMatrix))
    setIsEditing(false)
  }

  const handleSaveAll = () => {
    if (!isEditing) return
    saveAll.mutate(matrixData, { onSuccess: () => setIsEditing(false) })
  }

  return (
    <>
      <div className="rounded-md bg-white p-4 pb-24 shadow transition-all duration-300 ease-in-out dark:bg-zinc-900 dark:text-gray-400">
        <div className="mb-4">
          <h2 className="text-xl font-normal text-gray-700 dark:text-gray-300">
            เกณฑ์จำนวนชั่วโมงภาระงานต่อสัปดาห์ (ตามกลุ่มภาระงาน)
          </h2>
        </div>

        <QuantityWorkloadMatrixTable
          mainTasks={sortedMainTasks}
          workloadGroups={sortedWorkloadGroups}
          matrixData={matrixData}
          isEditing={isEditing}
          loading={loading}
          onCellChange={handleCellChange}
        />
      </div>

      <StickyFooter
        isEditing={isEditing}
        onEditToggle={handleStartEditing}
        onCancel={handleCancelEdit}
        onSave={handleSaveAll}
        editText="แก้ไข"
        cancelText="ยกเลิก"
        saveText="บันทึก"
        disabled={loading}
      />
    </>
  )
}
