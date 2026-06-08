'use client'
import type { PerformanceEvaluationFormData } from '@/Types/performance'
import type { Position } from './performanceFormTypes'

interface PerformanceTableProps {
  formData: PerformanceEvaluationFormData
  sortedPositions: Position[]
  expectedLevelsMap: Record<number, Record<number, number>>
  demonstratedLevels: Record<number, number | null>
  isPositionHighlighted: (positionId: number) => boolean
  handleDemonstratedLevelChange: (competencyId: number, value: string) => void
}

export default function PerformanceTable({
  formData,
  sortedPositions,
  expectedLevelsMap,
  demonstratedLevels,
  isPositionHighlighted,
  handleDemonstratedLevelChange,
}: PerformanceTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse border border-gray-300 dark:border-gray-600">
        <thead className="bg-gray-50 dark:bg-gray-800">
          <tr>
            <th
              rowSpan={2}
              className="border border-gray-300 px-2 py-2 text-center text-md font-normal text-gray-700 dark:text-gray-300 w-12"
            >
              ลำดับ
            </th>
            <th
              rowSpan={2}
              className="border border-gray-300 px-3 py-2 text-center text-md font-normal text-gray-700 dark:text-gray-300"
            >
              สมรรถนะหลัก
            </th>
            <th
              colSpan={4}
              className="border border-gray-300 px-2 py-2 text-center text-md font-normal text-gray-700 dark:text-gray-300"
            >
              ระดับสมรรถนะที่คาดหวัง
            </th>
            <th
              rowSpan={2}
              className="border border-gray-300 px-1 py-2 text-center text-md font-normal text-gray-700 dark:text-gray-300 w-32"
            >
              ระดับสมรรถนะที่แสดงออก
            </th>
          </tr>
          <tr>
            {sortedPositions.map((position) => (
              <th
                key={position.position_id}
                className={`border border-gray-300 px-1 py-1 text-center text-md font-normal ${isPositionHighlighted(position.position_id)
                    ? 'bg-green-100 dark:bg-green-900/30'
                    : 'bg-gray-50 dark:bg-gray-800'
                  } text-gray-700 dark:text-gray-300`}
              >
                {position.short_name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-zinc-900">
          {formData.competencies.map((competency, index) => {
            return (
              <tr key={competency.competency_id}>
                <td className="border border-gray-300 px-2 py-2 text-center text-md font-light text-gray-800 dark:text-gray-200">
                  {index + 1}
                </td>
                <td className="border border-gray-300 px-3 py-2 text-md font-light text-gray-800 dark:text-gray-200">
                  {competency.competency_name}
                </td>
                {sortedPositions.map((position) => {
                  const expectedLevel =
                    expectedLevelsMap[competency.competency_id]?.[position.position_id] || '-'
                  const isHighlighted = isPositionHighlighted(position.position_id)

                  return (
                    <td
                      key={position.position_id}
                      className={`font-light border border-gray-300 px-1 py-2 text-center text-md text-gray-700 dark:text-gray-300 ${isHighlighted
                          ? '!bg-green-200 dark:!bg-green-700/50'
                          : ''
                        }`}
                    >
                      {expectedLevel}
                    </td>
                  )
                })}
                <td className="font-light border border-gray-300 px-4 py-2">
                  <input
                    type="number"
                    value={demonstratedLevels[competency.competency_id] || ''}
                    onChange={(e) =>
                      handleDemonstratedLevelChange(competency.competency_id, e.target.value)
                    }
                    className="font-normal w-full rounded border border-gray-300 px-1 py-1 text-center text-md text-blue-600 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-zinc-800 dark:text-blue-400"
                    placeholder="0"
                  />
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
