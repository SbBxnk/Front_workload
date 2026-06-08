'use client'

import type { MainTask, QuantityMatrixDataState, WorkloadGroup } from '@/Types'

interface QuantityWorkloadMatrixTableProps {
  mainTasks: MainTask[]
  workloadGroups: WorkloadGroup[]
  matrixData: QuantityMatrixDataState
  isEditing: boolean
  loading: boolean
  onCellChange: (
    taskId: number,
    workloadGroupId: number,
    value: string
  ) => void
}

export default function QuantityWorkloadMatrixTable({
  mainTasks,
  workloadGroups,
  matrixData,
  isEditing,
  loading,
  onCellChange,
}: QuantityWorkloadMatrixTableProps) {
  if (loading && mainTasks.length === 0) {
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
              <th className="sticky left-16 z-10 min-w-[200px] max-w-[700px] border border-business1 bg-business1 px-4 py-3 text-center text-sm font-normal text-white">
                งานหลัก
              </th>
              {workloadGroups.map((group) => (
                <th
                  key={group.workload_group_id}
                  className="text-nowrap border border-business1 px-4 py-3 text-center text-sm font-normal text-white"
                >
                  {group.workload_group_name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white transition-all duration-300 ease-in-out dark:divide-zinc-600 dark:bg-zinc-900">
            {mainTasks.map((task, index) => (
              <tr
                key={task.task_id}
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
                    {task.task_name}
                  </span>
                </td>
                {workloadGroups.map((group) => {
                  const cellValue =
                    matrixData[task.task_id]?.[group.workload_group_id]
                      ?.quantity_workload_hours ?? null

                  return (
                    <td
                      key={group.workload_group_id}
                      className="whitespace-nowrap p-4 text-center"
                    >
                      <div className="flex items-center justify-center gap-1">
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={cellValue ?? ''}
                          onChange={(e) =>
                            onCellChange(
                              task.task_id,
                              group.workload_group_id,
                              e.target.value
                            )
                          }
                          disabled={!isEditing || loading}
                          className={`w-20 rounded border border-gray-300 px-2 py-1 text-center text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-zinc-800 ${
                            !isEditing || loading
                              ? 'cursor-default opacity-70 text-gray-500 dark:text-gray-400'
                              : 'text-gray-600 dark:text-gray-300'
                          }`}
                          placeholder="0"
                        />
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          ชม.
                        </span>
                      </div>
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
