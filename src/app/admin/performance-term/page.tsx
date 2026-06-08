'use client'

import { useEffect, useState } from 'react'
import type { PerformanceMatrixDataState } from '@/Types'
import useUtility from '@/hooks/useUtility'
import StickyFooter from '@/components/StickyFooter'
import { usePerformanceTermList } from './_partial/usePerformanceTermList'
import { usePerformanceTermMutations } from './_partial/usePerformanceTermMutations'
import PerformanceTermMatrixTable from './_partial/PerformanceTermMatrixTable'

const cloneMatrix = (matrix: PerformanceMatrixDataState): PerformanceMatrixDataState =>
  JSON.parse(JSON.stringify(matrix)) as PerformanceMatrixDataState

export default function PerformanceTermPage() {
  const { setBreadcrumbs } = useUtility()
  const { sortedCompetencies, sortedPositions, initialMatrix, isLoading } =
    usePerformanceTermList()
  const { saveAll } = usePerformanceTermMutations()

  const [isEditing, setIsEditing] = useState(false)
  const [matrixData, setMatrixData] = useState<PerformanceMatrixDataState>({})

  const loading = isLoading || saveAll.isPending

  useEffect(() => {
    setBreadcrumbs([{ text: 'เกณฑ์สมรรถนะ', path: '/admin/performance-term' }])
  }, [setBreadcrumbs])

  // seed state ที่แก้ไขได้จาก matrix ของ server เมื่อไม่ได้อยู่ในโหมดแก้ไข
  useEffect(() => {
    if (!isEditing) setMatrixData(cloneMatrix(initialMatrix))
  }, [initialMatrix, isEditing])

  const handleCellChange = (
    competencyId: number,
    positionId: number,
    value: string
  ) => {
    if (!isEditing) return

    const numValue = value === '' ? null : Number(value)
    if (numValue !== null && (Number.isNaN(numValue) || numValue < 0)) return

    setMatrixData((prev) => {
      const newData = { ...prev }
      if (!newData[competencyId]) newData[competencyId] = {}
      newData[competencyId][positionId] = {
        ...newData[competencyId][positionId],
        expected_level: numValue,
        isNew: newData[competencyId][positionId]?.expected_level_id === undefined,
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
            เกณฑ์สมรรถนะ (ตามตำแหน่ง)
          </h2>
        </div>

        <PerformanceTermMatrixTable
          competencies={sortedCompetencies}
          positions={sortedPositions}
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
