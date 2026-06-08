'use client'

import React from 'react'
import type { PerformanceSnapshot } from '@/Types/performance'
import type { Section2PositionInfo } from './sectionTypes'
import { formatAverageLevel } from './sectionHelpers'

// ===== ตารางพรีวิว: สมรรถนะหลัก x ทุกตำแหน่ง =====
interface Section2PreviewTableProps {
  competencies: any[]
  expectedLevels: any[]
  performanceEvaluations: any[]
  positions: Section2PositionInfo[]
  userPositionId?: number | null
}

export const Section2PreviewTable: React.FC<Section2PreviewTableProps> = ({
  competencies,
  expectedLevels,
  performanceEvaluations,
  positions,
  userPositionId,
}) => {
  return (
    <div className="overflow-x-auto mt-4">
      <table className="w-full min-w-[1100px] border-collapse border border-gray-300 dark:border-gray-700">
        <thead className="bg-gray-50 dark:bg-gray-800">
          <tr>
            <th
              rowSpan={2}
              className="border border-gray-300 dark:border-gray-700 px-2 py-2 text-center text-md font-normal text-gray-700 dark:text-gray-300 w-12"
            >
              ลำดับ
            </th>
            <th
              rowSpan={2}
              className="border border-gray-300 dark:border-gray-700 px-3 py-2 text-center text-md font-normal text-gray-700 dark:text-gray-300"
            >
              สมรรถนะหลัก (ที่สภามหาวิทยาลัยกำหนด)
            </th>
            <th
              colSpan={4}
              className="border border-gray-300 dark:border-gray-700 px-2 py-2 text-center text-md font-normal text-gray-700 dark:text-gray-300"
            >
              ระดับสมรรถนะที่คาดหวัง
            </th>
            <th
              rowSpan={2}
              className="border border-gray-300 dark:border-gray-700 px-1 py-2 text-center text-md font-normal text-gray-700 dark:text-gray-300 w-32"
            >
              ระดับสมรรถนะที่แสดงออก
            </th>
          </tr>
          <tr>
            {positions.map((position) => {
              const isHighlighted = userPositionId === position.position_id
              return (
                <th
                  key={position.position_id}
                  className={`border border-gray-300 dark:border-gray-700 px-1 py-1 text-center text-md font-normal ${isHighlighted ? ' dark:bg-green-900/30' : 'bg-gray-50 dark:bg-gray-800'
                    } text-gray-700 dark:text-gray-300`}
                >
                  {position.short_name}
                </th>
              )
            })}
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-zinc-900">
          {(() => {
            const expectedLevelsMap: Record<number, Record<number, number>> = {}
            expectedLevels.forEach((level: any) => {
              if (!expectedLevelsMap[level.competency_id]) {
                expectedLevelsMap[level.competency_id] = {}
              }
              expectedLevelsMap[level.competency_id][level.position_id] = level.expected_level
            })

            const evaluationsMap: Record<number, number | null> = {}
            performanceEvaluations.forEach((evaluation: any) => {
              evaluationsMap[evaluation.competency_id] = evaluation.demonstrated_level
            })

            const sortedCompetencies = [...competencies].sort(
              (a, b) => (a.competency_order || 0) - (b.competency_order || 0)
            )

            return sortedCompetencies.map((competency: any, index: number) => (
              <tr key={competency.competency_id}>
                <td className="border border-gray-300 dark:border-gray-700 px-2 py-2 text-center text-md font-light text-gray-800 dark:text-gray-200">
                  {index + 1}
                </td>
                <td className="border border-gray-300 dark:border-gray-700 px-3 py-2 text-md font-light text-gray-800 dark:text-gray-200">
                  {competency.competency_name || '-'}
                </td>
                {positions.map((position) => {
                  const expectedLevel =
                    expectedLevelsMap[competency.competency_id]?.[position.position_id] ?? '-'
                  const isHighlighted = userPositionId === position.position_id

                  return (
                    <td
                      key={position.position_id}
                      className={`font-light border border-gray-300 dark:border-gray-700 px-1 py-2 text-center text-md text-gray-700 dark:text-gray-300 ${isHighlighted ? '!bg-green-100 dark:!bg-green-700/50' : ''
                        }`}
                    >
                      {expectedLevel}
                    </td>
                  )
                })}
                <td className="font-light border border-gray-300 dark:border-gray-700 px-4 py-2 text-center text-md text-blue-600 dark:text-blue-400">
                  {evaluationsMap[competency.competency_id] !== null &&
                    evaluationsMap[competency.competency_id] !== undefined
                    ? evaluationsMap[competency.competency_id]
                    : '-'}
                </td>
              </tr>
            ))
          })()}
        </tbody>
      </table>
    </div>
  )
}

// ===== ตาราง snapshot: สมรรถนะหลักของตำแหน่งผู้รับการประเมิน =====
interface Section2SnapshotTableProps {
  performanceSnapshot: PerformanceSnapshot
  isFinalized: boolean
  averageAssessedLevelsMap: Map<string, number>
}

export const Section2SnapshotTable: React.FC<Section2SnapshotTableProps> = ({
  performanceSnapshot,
  isFinalized,
  averageAssessedLevelsMap,
}) => {
  const sortedEvaluations = [...performanceSnapshot.evaluations].sort(
    (a, b) => (a.competency_order || 0) - (b.competency_order || 0)
  )

  const snapshotPositionName = sortedEvaluations[0]?.position_name || null
  const snapshotPositionShortName = sortedEvaluations[0]?.position_short_name || null

  const compsToShow = sortedEvaluations.map((evaluation) => ({
    competency_name: evaluation.competency_name || '-',
    competency_order: evaluation.competency_order || 0,
    demonstrated_level: evaluation.demonstrated_level,
    expected_level: evaluation.expected_level ?? null,
  }))

  return (
    <div className="overflow-x-auto mt-4">
      <table className="w-full min-w-[900px] border-collapse border border-gray-300 dark:border-gray-700">
        <thead className="bg-gray-50 dark:bg-gray-800">
          <tr>
            <th
              rowSpan={2}
              className="border border-gray-300 dark:border-gray-700 px-2 py-2 text-center text-sm font-normal text-gray-700 dark:text-gray-300 w-12"
            >
              ลำดับ
            </th>
            <th
              rowSpan={2}
              className={`border border-gray-300 dark:border-gray-700 px-3 py-2 text-center text-sm font-normal text-gray-700 dark:text-gray-300 ${isFinalized ? 'w-3/6' : 'w-2/3'}`}
            >
              สมรรถนะหลัก (ที่สภามหาวิทยาลัยกำหนด)
            </th>
            <th
              colSpan={1}
              className="border border-gray-300 dark:border-gray-700 px-2 py-2 text-center text-sm font-normal text-gray-700 dark:text-gray-300"
            >
              ระดับสมรรถนะที่คาดหวัง
            </th>
            <th
              rowSpan={2}
              className="border border-gray-300 px-1 py-2 text-center text-sm font-normal text-gray-700 dark:text-gray-300 w-32"
            >
              ระดับสมรรถนะที่แสดงออก
            </th>
            {isFinalized && (
              <th
                rowSpan={2}
                className="border border-gray-300 dark:border-gray-700 px-1 py-2 text-center text-sm font-normal text-gray-700 dark:text-gray-300 w-32"
              >
                ระดับสมรรถนะจากผู้ตรวจ
              </th>
            )}
          </tr>
          <tr>
            <th className="border border-gray-300 dark:border-gray-700 px-1 py-1 text-center text-sm font-normal dark:bg-green-900/30 text-gray-700 dark:text-gray-300">
              {snapshotPositionShortName || snapshotPositionName || '-'}
            </th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-zinc-900">
          {compsToShow.map((competency, index) => (
            <tr key={`${competency.competency_name}-${index}`}>
              <td className="border border-gray-300 dark:border-gray-700 px-2 py-2 text-center text-sm font-light text-gray-800 dark:text-gray-200">
                {index + 1}
              </td>
              <td className="border border-gray-300 dark:border-gray-700 px-3 py-2 text-sm font-light text-gray-800 dark:text-gray-200">
                {competency.competency_name || '-'}
              </td>
              <td className="font-light border border-gray-300 dark:border-gray-700 px-1 py-2 text-center text-sm text-gray-700 dark:text-gray-300 !bg-green-100 dark:!bg-green-700/50">
                {competency.expected_level !== null && competency.expected_level !== undefined
                  ? competency.expected_level
                  : '-'}
              </td>
              <td className="font-normal border border-gray-300 dark:border-gray-700 px-4 py-2 text-center text-sm text-blue-600 dark:text-blue-400">
                {competency.demonstrated_level !== null && competency.demonstrated_level !== undefined
                  ? competency.demonstrated_level
                  : '-'}
              </td>
              {isFinalized && (
                <td className="font-semibold border border-gray-300 dark:border-gray-700 px-4 py-2 text-center text-sm text-green-600 dark:text-green-400">
                  {(() => {
                    // ใช้ competency_name เป็น key ในการหา average assessed level
                    const competencyName = competency.competency_name
                    if (!competencyName) return '-'

                    const avgLevel = averageAssessedLevelsMap.get(competencyName)
                    return avgLevel != null ? formatAverageLevel(avgLevel) : '-'
                  })()}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
