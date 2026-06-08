'use client'

import type { Competency, PerformanceMatrixDataState, Position } from '@/Types'

interface PerformanceTermMatrixTableProps {
  competencies: Competency[]
  positions: Position[]
  matrixData: PerformanceMatrixDataState
  isEditing: boolean
  loading: boolean
  onCellChange: (competencyId: number, positionId: number, value: string) => void
}

export default function PerformanceTermMatrixTable({
  competencies,
  positions,
  matrixData,
  isEditing,
  loading,
  onCellChange,
}: PerformanceTermMatrixTableProps) {
  if (loading || competencies.length === 0) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-gray-500">กำลังโหลดข้อมูล...</div>
      </div>
    )
  }

  return (
    <div className="border transition-all duration-300 ease-in-out dark:border-zinc-600">
      <div className="overflow-x-auto">
        <table className="w-full overflow-x-auto md:table-auto">
          <thead className="bg-business1">
            <tr>
              <th className="sticky left-0 z-10 w-16 text-nowrap border border-business1 bg-business1 px-4 py-3 text-center text-sm font-normal text-white">
                #
              </th>
              <th className="sticky left-16 z-10 min-w-[400px] max-w-[700px] border border-business1 bg-business1 px-4 py-3 text-center text-sm font-normal text-white">
                สมรรถนะ
              </th>
              {positions.map((position) => (
                <th
                  key={position.position_id}
                  className="text-nowrap border border-business1 px-4 py-3 text-center text-sm font-normal text-white"
                >
                  {position.position_short_name || position.position_name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white transition-all duration-300 ease-in-out dark:divide-zinc-600 dark:bg-zinc-900">
            {competencies.map((competency, index) => (
              <tr
                key={competency.competency_id}
                className="even:bg-gray-50 dark:even:bg-zinc-800"
              >
                <td
                  className={`sticky left-0 z-10 w-16 whitespace-nowrap p-4 text-center ${
                    index % 2 === 0
                      ? 'bg-white dark:bg-zinc-900'
                      : 'bg-gray-50 dark:bg-zinc-800'
                  }`}
                >
                  <span className="text-md font-light text-gray-500 dark:text-gray-400">
                    {index + 1}
                  </span>
                </td>
                <td
                  className={`sticky left-16 z-10 min-w-[200px] max-w-[700px] p-4 text-left ${
                    index % 2 === 0
                      ? 'bg-white dark:bg-zinc-900'
                      : 'bg-gray-50 dark:bg-zinc-800'
                  }`}
                >
                  <span className="text-md font-light text-gray-500 dark:text-gray-400 line-clamp-2">
                    {competency.competency_name}
                  </span>
                </td>
                {positions.map((position) => {
                  const cellValue =
                    matrixData[competency.competency_id]?.[position.position_id]
                      ?.expected_level ?? null

                  return (
                    <td
                      key={position.position_id}
                      className="whitespace-nowrap p-4 text-center"
                    >
                      <input
                        type="number"
                        min="0"
                        value={cellValue ?? ''}
                        onChange={(e) =>
                          onCellChange(
                            competency.competency_id,
                            position.position_id,
                            e.target.value
                          )
                        }
                        disabled={!isEditing || loading}
                        className={`w-16 rounded border border-gray-300 px-2 py-1 text-center text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-zinc-800 ${
                          !isEditing || loading
                            ? 'cursor-default opacity-70 text-gray-500 dark:text-gray-400'
                            : 'text-gray-600 dark:text-gray-300'
                        }`}
                        placeholder="0"
                      />
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
