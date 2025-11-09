'use client'

import React from 'react'
import { AlertCircle } from 'lucide-react'
import type { PerformanceSnapshot } from '@/services/performanceService'

interface PositionInfo {
  position_id: number
  position_name: string
  short_name: string
}

interface CompetencyScoreRow {
  id: string
  multiplier: number
  count: number
  score: number
}

interface CompetencyScoreSummary {
  rows: CompetencyScoreRow[]
  totalScore: number
  totalCount: number
}

interface Section2Props {
  isPreview?: boolean
  competencies: any[]
  expectedLevels: any[]
  performanceEvaluations: any[]
  performanceSnapshot: PerformanceSnapshot | null
  userPositionName: string
  userPositionId?: number | null
  positions: PositionInfo[]
  competencyScoreSummary: CompetencyScoreSummary
  competencyTotalScoreCalc: number
  onOpenCompetencyModal: () => void
}

const Section2: React.FC<Section2Props> = ({
  isPreview = false,
  competencies,
  expectedLevels,
  performanceEvaluations,
  performanceSnapshot,
  userPositionName,
  userPositionId,
  positions,
  competencyScoreSummary,
  competencyTotalScoreCalc,
  onOpenCompetencyModal,
}) => {
  return (
    <div>
      <p className="text-md font-normal text-gray-800 dark:text-gray-200 mb-2">
        ส่วนที่ 2 องค์ประกอบที่ 2 พฤติกรรมการปฏิบัติงาน (สมรรถนะ)
      </p>
      <p className="text-md font-light text-gray-800 dark:text-gray-200 mb-4">
        ระดับตำแหน่งผู้รับการประเมิน :{' '}
        <span className="font-normal text-business1 underline underline-offset-2">{userPositionName}</span>
      </p>

      {isPreview && competencies.length > 0 && (
        <div className="overflow-x-auto mt-4">
          <table className="w-full min-w-[1100px] border-collapse border border-gray-300 dark:border-gray-600">
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
                  สมรรถนะหลัก (ที่สภามหาวิทยาลัยกำหนด)
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
                {positions.map((position) => {
                  const isHighlighted = userPositionId === position.position_id
                  return (
                    <th
                      key={position.position_id}
                      className={`border border-gray-300 px-1 py-1 text-center text-md font-normal ${isHighlighted ? ' dark:bg-green-900/30' : 'bg-gray-50 dark:bg-gray-800'
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
                    <td className="border border-gray-300 px-2 py-2 text-center text-md font-light text-gray-800 dark:text-gray-200">
                      {index + 1}
                    </td>
                    <td className="border border-gray-300 px-3 py-2 text-md font-light text-gray-800 dark:text-gray-200">
                      {competency.competency_name || '-'}
                    </td>
                    {positions.map((position) => {
                      const expectedLevel =
                        expectedLevelsMap[competency.competency_id]?.[position.position_id] ?? '-'
                      const isHighlighted = userPositionId === position.position_id

                      return (
                        <td
                          key={position.position_id}
                          className={`font-light border border-gray-300 px-1 py-2 text-center text-md text-gray-700 dark:text-gray-300 ${isHighlighted ? '!bg-green-100 dark:!bg-green-700/50' : ''
                            }`}
                        >
                          {expectedLevel}
                        </td>
                      )
                    })}
                    <td className="font-light border border-gray-300 px-4 py-2 text-center text-md text-blue-600 dark:text-blue-400">
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
      )}

      {!isPreview && !performanceSnapshot && (
        <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-md border border-gray-300 dark:border-gray-600">
          <p className="text-center text-gray-600 dark:text-gray-400">
            ยังไม่มีข้อมูล snapshot กรุณาส่งฟอร์มเพื่อสร้าง snapshot
          </p>
        </div>
      )}

      {!isPreview &&
        performanceSnapshot &&
        performanceSnapshot.evaluations &&
        performanceSnapshot.evaluations.length > 0 &&
        (() => {
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
              <table className="w-full min-w-[900px] border-collapse border border-gray-300 dark:border-gray-600">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th
                      rowSpan={2}
                      className="border border-gray-300 px-2 py-2 text-center text-sm font-normal text-gray-700 dark:text-gray-300 w-12"
                    >
                      ลำดับ
                    </th>
                    <th
                      rowSpan={2}
                      className="border border-gray-300 px-3 py-2 text-center text-sm font-normal text-gray-700 dark:text-gray-300 w-2/3"
                    >
                      สมรรถนะหลัก (ที่สภามหาวิทยาลัยกำหนด)
                    </th>
                    <th
                      colSpan={1}
                      className="border border-gray-300 px-2 py-2 text-center text-sm font-normal text-gray-700 dark:text-gray-300"
                    >
                      ระดับสมรรถนะที่คาดหวัง
                    </th>
                    <th
                      rowSpan={2}
                      className="border border-gray-300 px-1 py-2 text-center text-sm font-normal text-gray-700 dark:text-gray-300 w-32"
                    >
                      ระดับสมรรถนะที่แสดงออก
                    </th>
                  </tr>
                  <tr>
                    <th className="border border-gray-300 px-1 py-1 text-center text-sm font-normal dark:bg-green-900/30 text-gray-700 dark:text-gray-300">
                      {snapshotPositionShortName || snapshotPositionName || '-'}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-zinc-900">
                  {compsToShow.map((competency, index) => (
                    <tr key={`${competency.competency_name}-${index}`}>
                      <td className="border border-gray-300 px-2 py-2 text-center text-sm font-light text-gray-800 dark:text-gray-200">
                        {index + 1}
                      </td>
                      <td className="border border-gray-300 px-3 py-2 text-sm font-light text-gray-800 dark:text-gray-200">
                        {competency.competency_name || '-'}
                      </td>
                      <td className="font-light border border-gray-300 px-1 py-2 text-center text-sm text-gray-700 dark:text-gray-300 !bg-green-100 dark:!bg-green-700/50">
                        {competency.expected_level !== null && competency.expected_level !== undefined
                          ? competency.expected_level
                          : '-'}
                      </td>
                      <td className="font-normal border border-gray-300 px-4 py-2 text-center text-sm text-blue-600 dark:text-blue-400">
                        {competency.demonstrated_level !== null && competency.demonstrated_level !== undefined
                          ? competency.demonstrated_level
                          : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        })()}
      <div className="mt-6 flex flex-col gap-4">
        <div className="flex flex-col gap-4 md:flex-row">
          <div className="w-full overflow-x-auto md:w-1/2">
            <table className="w-full min-w-[640px] border-collapse border border-gray-300 dark:border-gray-600">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="border border-gray-300 px-3 py-2 text-center text-sm font-normal text-gray-700 dark:text-gray-300">
                    สมรรถนะทางการบริหาร (ที่สภามหาวิทยาลัยกำหนด)
                  </th>
                  <th className="border border-gray-300 px-2 py-2 text-center text-sm font-normal text-gray-700 dark:text-gray-300">
                    ระดับสมรรถนะที่คาดหวัง
                  </th>
                  <th className="border border-gray-300 px-1 py-2 text-center text-sm font-normal text-gray-700 dark:text-gray-300">
                    ระดับสมรรถนะที่แสดงออก
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-zinc-900">
                {['สภาวะผู้นำ', 'วิสัยทัศน์', 'การวางแผนกลยุทธ์ภาครัฐ', 'ศักยภาพเพื่อนำการปรับเปลี่ยน', 'การควบคุมตนเอง', 'การสอนงานและการมอบหมายงาน'].map(
                  (title) => (
                    <tr key={title}>
                      <td className="border border-gray-300 px-3 py-2 text-start text-sm font-light text-gray-800 dark:text-gray-200">
                        {title}
                      </td>
                      <td className="border border-gray-300 px-2 py-2 text-start text-sm font-light text-gray-800 dark:text-gray-200" />
                      <td className="border border-gray-300 px-1 py-2 text-start text-sm font-light text-gray-800 dark:text-gray-200" />
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
          <div className="w-full overflow-x-auto md:w-1/2">
            <table className="w-full min-w-[480px] border-collapse border border-gray-300 dark:border-gray-600">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="border border-gray-300 px-2 py-2 text-center text-sm font-normal text-gray-700 dark:text-gray-300">
                    จำนวนสมรรถนะ
                  </th>
                  <th className="border border-gray-300 px-2 py-2 text-center text-sm font-normal text-gray-700 dark:text-gray-300">
                    คูณ (X)
                  </th>
                  <th className="border border-gray-300 px-2 py-2 text-center text-sm font-normal text-gray-700 dark:text-gray-300">
                    คะแนน
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-zinc-900">
                {competencyScoreSummary.rows
                  .filter((row) => row.count > 0)
                  .map((row) => (
                    <tr key={row.id}>
                      <td className="border border-gray-300 px-2 py-2 text-center text-sm font-light text-blue-500 dark:text-gray-200">
                        {row.count}
                      </td>
                      <td className="border border-gray-300 px-2 py-2 text-center text-sm font-light text-red-500 dark:text-gray-200">
                        {row.multiplier}
                      </td>
                      <td className="border border-gray-300 px-2 py-2 text-center text-sm font-normal text-blue-500 dark:text-gray-200">
                        {row.score}
                      </td>
                    </tr>
                  ))}
                {competencyScoreSummary.totalCount > 0 ? (
                  <tr className="bg-gray-50 dark:bg-gray-800 font-normal text-gray-800 dark:text-gray-100">
                    <td className="border border-gray-300 px-3 py-2 text-end text-sm" colSpan={2}>
                      ผลรวมคะแนน
                    </td>
                    <td className="border border-gray-300 px-2 py-2 text-center text-sm font-bold text-blue-500">
                      {competencyScoreSummary.totalScore}
                    </td>
                  </tr>
                ) : (
                  <tr>
                    <td
                      colSpan={3}
                      className="border border-gray-300 px-3 py-4 text-center text-sm text-gray-500 dark:text-gray-300"
                    >
                      ยังไม่มีข้อมูลสมรรถนะที่แสดงออก
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <table className="w-full border-collapse border border-gray-300 dark:border-gray-600">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="border border-gray-300 px-3 py-2 text-center text-sm font-normal text-gray-700 dark:text-gray-300">
                  หลักเกณฑ์การประเมิน
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-zinc-900">
              {[
                'จำนวนสมรรถนะหลัก/สมรรถนะเฉพาะ/สมรรถนะทางการบริหาร ที่มีระดับสมรรถนะที่แสดงออก สูงกว่าหรือเท่ากับ ระดับสมรรถนะที่คาดหวัง x 3 คะแนน',
                'จำนวนสมรรถนะหลัก/สมรรถนะเฉพาะ/สมรรถนะทางการบริหาร ที่มีระดับสมรรถนะที่แสดงออก ต่ำกว่า ระดับสมรรถนะที่คาดหวัง 1 ระดับ x 2 คะแนน',
                'จำนวนสมรรถนะหลัก/สมรรถนะเฉพาะ/สมรรถนะทางการบริหาร ที่มีระดับสมรรถนะที่แสดงออก ต่ำกว่า ระดับสมรรถนะที่คาดหวัง 2 ระดับ x 1 คะแนน',
                'จำนวนสมรรถนะหลัก/สมรรถนะเฉพาะ/สมรรถนะทางการบริหาร ที่มีระดับสมรรถนะที่แสดงออก ต่ำกว่า ระดับสมรรถนะที่คาดหวัง 3 ระดับ x 0 คะแนน',
              ].map((text) => (
                <tr key={text}>
                  <td className="border border-gray-300 px-3 py-2 text-start text-sm font-light text-gray-800 dark:text-gray-200">
                    {text}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="mt-4 flex flex-col gap-2 text-md font-light text-gray-500 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-wrap items-center gap-2">
              <span className="">
                สรุปคะแนนส่วนพฤติกรรมการปฏิบัติงาน (สมรรถนะ)
                <span className="text-md font-light text-red-500"> คะแนนเต็ม 30 คะแนน </span>
                <button
                  type="button"
                  onClick={onOpenCompetencyModal}
                  className="inline-flex items-center justify-center text-gray-400 transition hover:text-gray-600 focus:outline-none ml-1"
                  aria-label="วิธีคำนวณคะแนนสมรรถนะ"
                  style={{ verticalAlign: 'middle', display: 'inline-flex' }}
                >
                  <AlertCircle className="h-4 w-4" />
                </button>
              </span>

            </div>
            <p className="hidden md:block m-0 text-md font-semibold">
              <span className="text-sm font-light text-gray-500">เท่ากับ</span>{' '}
              <span className="text-blue-600"> {competencyScoreSummary.totalScore}</span> <span className="text-red-500">/ 30</span>
            </p>
            <div className="flex justify-between">
              <p className="block md:hidden m-0 text-md font-semibold">
                <span className="text-sm font-light text-gray-500">เท่ากับ</span>{' '}
                <span className="text-blue-600"> {competencyScoreSummary.totalScore}</span> <span className="text-red-500">/ 30</span>
              </p>
              <div className="flex flex-col items-start text-blue-600 md:flex-row md:items-center md:gap-4">
                <p className="m-0 text-md font-semibold"> 
                <span className="text-md font-light text-gray-500">(8) คะแนนที่ได้ {" "}</span>
                   {competencyTotalScoreCalc}{' '}
                   <span className="text-md font-light text-gray-500">คะแนน</span>
               
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Section2


