'use client'

import React from 'react'
import type { Section2CompetencyScoreSummary } from './sectionTypes'

// ===== ตารางสรุปคะแนนสมรรถนะ (ใช้ทั้งฝั่งแสดงออก และฝั่งผู้ตรวจ) =====
interface Section2ScoreTableProps {
  summary: Section2CompetencyScoreSummary
  // สี token ของตัวเลขจำนวน/คะแนน: 'blue' = ฝั่งแสดงออก, 'green' = ฝั่งผู้ตรวจ
  variant: 'blue' | 'green'
  emptyText: string
  // คง class ของช่อง empty ตามต้นฉบับ (ฝั่งซ้ายไม่มี dark:border-gray-700)
  emptyTdClassName: string
}

export const Section2ScoreTable: React.FC<Section2ScoreTableProps> = ({
  summary,
  variant,
  emptyText,
  emptyTdClassName,
}) => {
  const valueColor = variant === 'green' ? 'text-green-500' : 'text-blue-500'

  return (
    <table className="w-full min-w-[480px] border-collapse border border-gray-300 dark:border-gray-700">
      <thead className="bg-gray-50 dark:bg-gray-800">
        <tr>
          <th className="border border-gray-300 dark:border-gray-700 px-2 py-2 text-center text-sm font-normal text-gray-700 dark:text-gray-300">
            จำนวนสมรรถนะ
          </th>
          <th className="border border-gray-300 dark:border-gray-700 px-2 py-2 text-center text-sm font-normal text-gray-700 dark:text-gray-300">
            คูณ (X)
          </th>
          <th className="border border-gray-300 dark:border-gray-700 px-2 py-2 text-center text-sm font-normal text-gray-700 dark:text-gray-300">
            คะแนน
          </th>
        </tr>
      </thead>
      <tbody className="bg-white dark:bg-zinc-900">
        {summary.rows
          .filter((row) => row.count > 0)
          .map((row) => (
            <tr key={row.id}>
              <td className={`border border-gray-300 dark:border-gray-700 px-2 py-2 text-center text-sm font-light ${valueColor} dark:text-gray-200`}>
                {row.count}
              </td>
              <td className="border border-gray-300 dark:border-gray-700 px-2 py-2 text-center text-sm font-light text-red-500 dark:text-gray-200">
                {row.multiplier}
              </td>
              <td className={`border border-gray-300 dark:border-gray-700 px-2 py-2 text-center text-sm font-normal ${valueColor} dark:text-gray-200`}>
                {row.score}
              </td>
            </tr>
          ))}
        {summary.totalCount > 0 ? (
          <tr className="bg-gray-50 dark:bg-gray-800 font-normal text-gray-800 dark:text-gray-100">
            <td className="border border-gray-300 dark:border-gray-700 px-3 py-2 text-end text-sm" colSpan={2}>
              ผลรวมคะแนน
            </td>
            <td className={`border border-gray-300 dark:border-gray-700 px-2 py-2 text-center text-sm font-bold ${valueColor}`}>
              {summary.totalScore}
            </td>
          </tr>
        ) : (
          <tr>
            <td colSpan={3} className={emptyTdClassName}>
              {emptyText}
            </td>
          </tr>
        )}
      </tbody>
    </table>
  )
}
