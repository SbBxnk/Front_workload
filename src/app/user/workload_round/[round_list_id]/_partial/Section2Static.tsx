'use client'

import React from 'react'
import { AlertCircle } from 'lucide-react'
import type { Section2CompetencyScoreSummary } from './sectionTypes'

// ===== ตารางสมรรถนะทางการบริหาร (รายการคงที่) =====
export const Section2AdminCompetencyTable: React.FC = () => {
  return (
    <div className="w-full overflow-x-auto md:w-2/3">
      <table className="w-full min-w-[640px] border-collapse border border-gray-300 dark:border-gray-700">
        <thead className="bg-gray-50 dark:bg-gray-800">
          <tr>
            <th className="border border-gray-300 dark:border-gray-700 px-3 py-2 text-center text-sm font-normal text-gray-700 dark:text-gray-300">
              สมรรถนะทางการบริหาร (ที่สภามหาวิทยาลัยกำหนด)
            </th>
            <th className="border border-gray-300 dark:border-gray-700 px-2 py-2 text-center text-sm font-normal text-gray-700 dark:text-gray-300">
              ระดับสมรรถนะที่คาดหวัง
            </th>
            <th className="border border-gray-300 dark:border-gray-700 px-1 py-2 text-center text-sm font-normal text-gray-700 dark:text-gray-300">
              ระดับสมรรถนะที่แสดงออก
            </th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-zinc-900">
          {['สภาวะผู้นำ', 'วิสัยทัศน์', 'การวางแผนกลยุทธ์ภาครัฐ', 'ศักยภาพเพื่อนำการปรับเปลี่ยน', 'การควบคุมตนเอง', 'การสอนงานและการมอบหมายงาน'].map(
            (title) => (
              <tr key={title}>
                <td className="border border-gray-300 dark:border-gray-700 px-3 py-2 text-start text-sm font-light text-gray-800 dark:text-gray-200">
                  {title}
                </td>
                <td className="border border-gray-300 dark:border-gray-700 px-2 py-2 text-start text-sm font-light text-gray-800 dark:text-gray-200" />
                <td className="border border-gray-300 dark:border-gray-700 px-1 py-2 text-start text-sm font-light text-gray-800 dark:text-gray-200" />
              </tr>
            )
          )}
        </tbody>
      </table>
    </div>
  )
}

// ===== ตารางหลักเกณฑ์การประเมิน + สรุปคะแนน (footer) =====
interface Section2CriteriaSummaryProps {
  competencyScoreSummary: Section2CompetencyScoreSummary
  evaluatedCompetencyScoreSummary: Section2CompetencyScoreSummary | null
  competencyTotalScoreCalc: number
  isFinalized: boolean
  onOpenCompetencyModal: () => void
}

export const Section2CriteriaSummary: React.FC<Section2CriteriaSummaryProps> = ({
  competencyScoreSummary,
  evaluatedCompetencyScoreSummary,
  competencyTotalScoreCalc,
  isFinalized,
  onOpenCompetencyModal,
}) => {
  return (
    <div>
      <table className="w-full border-collapse border border-gray-300 dark:border-gray-700">
        <thead className="bg-gray-50 dark:bg-gray-800">
          <tr>
            <th className="border border-gray-300 dark:border-gray-700 px-3 py-2 text-center text-sm font-normal text-gray-700 dark:text-gray-300">
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
              <td className="border border-gray-300 dark:border-gray-700 px-3 py-2 text-start text-sm font-light text-gray-800 dark:text-gray-200">
                {text}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-4 flex flex-col gap-2 text-md font-light text-gray-500 md:flex-row items-start md:justify-between">
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
        <div className="hidden md:block text-left">
          <p className="m-0 text-md font-semibold">
            <span className="text-sm font-light text-gray-500">เท่ากับ</span>{' '}
            <span className="text-blue-600"> {competencyScoreSummary.totalScore}</span> <span className="text-red-500">/ 30</span>
          </p>
          {isFinalized && evaluatedCompetencyScoreSummary && (
            <p className="m-0 text-md font-semibold mt-1">
              <span className="text-sm font-light text-gray-500">ประเมิน</span>{' '}
              <span className="text-green-600"> {evaluatedCompetencyScoreSummary.totalScore}</span> <span className="text-red-500">/ 30</span>
            </p>
          )}
        </div>
        <div className="flex justify-between">
          <div className="block md:hidden">
            <p className="m-0 text-md font-semibold">
              <span className="text-sm font-light text-gray-500">เท่ากับ</span>{' '}
              <span className="text-blue-600"> {competencyScoreSummary.totalScore}</span> <span className="text-red-500">/ 30</span>
            </p>
            {isFinalized && evaluatedCompetencyScoreSummary && (
              <p className="m-0 text-md font-semibold mt-1">
                <span className="text-sm font-light text-gray-500">ประเมิน</span>{' '}
                <span className="text-green-600"> {evaluatedCompetencyScoreSummary.totalScore}</span> <span className="text-red-500">/ 30</span>
              </p>
            )}
          </div>
          <div className="flex flex-col items-end text-blue-600 md:flex-row md:items-center md:gap-4">
            <div className="text-right">
              <p className="m-0 text-md font-semibold">
                <span className="text-md font-light text-gray-500">(8) คะแนนที่ได้ {" "}</span>
                {competencyTotalScoreCalc.toFixed(2)}{' '}
                <span className="text-md font-light text-gray-500">คะแนน</span>
              </p>
              {isFinalized && evaluatedCompetencyScoreSummary && (
                <p className="m-0 text-md font-semibold mt-1">
                  <span className="text-md font-light text-gray-500">(8) คะแนนที่ได้ (ประเมิน) {" "}</span>
                  {(evaluatedCompetencyScoreSummary.totalScore / 30).toFixed(2)}{' '}
                  <span className="text-md font-light text-gray-500">คะแนน</span>
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
