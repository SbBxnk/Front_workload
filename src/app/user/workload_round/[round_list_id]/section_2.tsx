'use client'

import React, { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import PerformanceEvaluationAssessmentService from '@/services/performanceEvaluationAssessmentService'
import type { AverageAssessedLevel } from '@/Types/performanceEvaluationAssessment'
import SnapshotService from '@/services/snapshotService'
import type { Section2Props } from './_partial/sectionTypes'
import { Section2PreviewTable, Section2SnapshotTable } from './_partial/Section2Rows'
import { Section2ScoreTable } from './_partial/Section2ScoreTable'
import { Section2AdminCompetencyTable, Section2CriteriaSummary } from './_partial/Section2Static'

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
  formlistStatus = null,
  userId,
  roundId,
  onEvaluatedCompetencyScoreSummaryChange,
}) => {
  const { data: session } = useSession()
  const isFinalized = formlistStatus === 2
  const [averageAssessedLevels, setAverageAssessedLevels] = useState<AverageAssessedLevel[]>([])
  const [formlistId, setFormlistId] = useState<number | null>(null)

  // ดึง formlist_id
  useEffect(() => {
    const fetchFormlistId = async () => {
      if (!userId || !roundId) return
      try {
        const response = await SnapshotService.getFormlistId(userId, roundId)
        if (response.success && response.payload && response.payload.length > 0) {
          setFormlistId(response.payload[0].formlist_id)
        }
      } catch (error) {
        console.error('Error fetching formlist_id:', error)
      }
    }
    fetchFormlistId()
  }, [userId, roundId])

  // ดึงข้อมูล average assessed_levels เมื่อ isFinalized
  useEffect(() => {
    const fetchAverageAssessedLevels = async () => {
      if (!isFinalized || !formlistId || !session?.accessToken) {
        setAverageAssessedLevels([])
        return
      }

      try {
        const data = await PerformanceEvaluationAssessmentService.getAverageAssessedLevels(
          formlistId
        )
        setAverageAssessedLevels(data)
      } catch (error: any) {
        console.error('Error fetching average assessed levels:', error)
        setAverageAssessedLevels([])
      }
    }

    fetchAverageAssessedLevels()
  }, [isFinalized, formlistId, session?.accessToken])

  // สร้าง map ของ average assessed_levels โดยใช้ competency_name เป็น key
  const averageAssessedLevelsMap = React.useMemo(() => {
    const map = new Map<string, number>()

    averageAssessedLevels.forEach((item) => {
      if (item.competency_id && item.average_assessed_level != null) {
        // หา competency_name จาก competencies array
        const competency = competencies.find((comp: any) => comp.competency_id === item.competency_id)
        if (competency?.competency_name) {
          map.set(competency.competency_name, Number(item.average_assessed_level))
        }
      }
    })

    return map
  }, [averageAssessedLevels, competencies])

  // สร้าง competency score summary จาก average assessed levels เมื่อ isFinalized
  const evaluatedCompetencyScoreSummary = React.useMemo(() => {
    if (!isFinalized || !performanceSnapshot?.evaluations || averageAssessedLevelsMap.size === 0) {
      return null
    }

    const evaluations = Array.isArray(performanceSnapshot.evaluations) ? performanceSnapshot.evaluations : []
    const expectedLevelsMap: Record<number, number> = {}
    expectedLevels.forEach((level: any) => {
      if (level.competency_id && level.position_id === userPositionId) {
        expectedLevelsMap[level.competency_id] = level.expected_level
      }
    })

    const categories = [
      {
        id: 'gte',
        multiplier: 3,
        count: 0,
        score: 0,
      },
      {
        id: 'minus1',
        multiplier: 2,
        count: 0,
        score: 0,
      },
      {
        id: 'minus2',
        multiplier: 1,
        count: 0,
        score: 0,
      },
      {
        id: 'minus3',
        multiplier: 0,
        count: 0,
        score: 0,
      },
    ] as Array<{ id: string; multiplier: number; count: number; score: number }>

    evaluations.forEach((evaluation: any) => {
      const competencyName = evaluation?.competency_name
      if (!competencyName) return

      // ใช้ average assessed level จากผู้ตรวจ
      const avgAssessedLevel = averageAssessedLevelsMap.get(competencyName)
      if (avgAssessedLevel == null) return

      // ปัดเศษตามกฎที่กำหนด
      const secondDecimal = Math.floor((avgAssessedLevel * 100) % 10)
      const assessedLevel = secondDecimal >= 5 ? Math.ceil(avgAssessedLevel) : Math.floor(avgAssessedLevel)

      // หา expected level
      const competency = competencies.find((comp: any) => comp.competency_name === competencyName)
      if (!competency?.competency_id) return

      const expected = expectedLevelsMap[competency.competency_id] ?? evaluation?.expected_level
      if (!Number.isFinite(expected)) return

      const diff = assessedLevel - expected

      let category = categories[3]
      if (diff >= 0) {
        category = categories[0]
      } else if (diff === -1) {
        category = categories[1]
      } else if (diff === -2) {
        category = categories[2]
      }

      category.count += 1
    })

    categories.forEach(category => {
      category.score = category.count * category.multiplier
    })

    const totalScore = categories.reduce((sum, category) => sum + category.score, 0)
    const totalCount = categories.reduce((sum, category) => sum + category.count, 0)

    return { rows: categories, totalScore, totalCount }
  }, [isFinalized, performanceSnapshot?.evaluations, averageAssessedLevelsMap, expectedLevels, userPositionId, competencies])

  // ส่ง evaluatedCompetencyScoreSummary ไปยัง parent component
  React.useEffect(() => {
    if (onEvaluatedCompetencyScoreSummaryChange) {
      onEvaluatedCompetencyScoreSummaryChange(evaluatedCompetencyScoreSummary)
    }
  }, [evaluatedCompetencyScoreSummary, onEvaluatedCompetencyScoreSummaryChange])

  // ตารางซ้ายใช้ competencyScoreSummary เสมอ (นับจาก demonstrated_level)
  // ตารางขวาใช้ evaluatedCompetencyScoreSummary เมื่อ isFinalized (นับจาก average assessed level)

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
        <Section2PreviewTable
          competencies={competencies}
          expectedLevels={expectedLevels}
          performanceEvaluations={performanceEvaluations}
          positions={positions}
          userPositionId={userPositionId}
        />
      )}

      {!isPreview && !performanceSnapshot && (
        <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-md border border-gray-300 dark:border-gray-700">
          <p className="text-center text-gray-600 dark:text-gray-400">
            ยังไม่มีข้อมูล snapshot กรุณาส่งฟอร์มเพื่อสร้าง snapshot
          </p>
        </div>
      )}

      {!isPreview &&
        performanceSnapshot &&
        performanceSnapshot.evaluations &&
        performanceSnapshot.evaluations.length > 0 && (
          <Section2SnapshotTable
            performanceSnapshot={performanceSnapshot}
            isFinalized={isFinalized}
            averageAssessedLevelsMap={averageAssessedLevelsMap}
          />
        )}
      <div className="mt-6 flex flex-col gap-4">
        <div className="flex flex-col gap-4 ">
          <Section2AdminCompetencyTable />
          <div className={`flex flex-col gap-4 ${isFinalized ? 'md:flex-row' : ''}`}>
            <div className="w-full overflow-x-auto md:w-1/2">
              {isFinalized && (
                <p className="text-sm font-normal text-gray-700 dark:text-gray-300 mb-2">
                  จากระดับสมรรถนะที่แสดงออก
                </p>
              )}
              <Section2ScoreTable
                summary={competencyScoreSummary}
                variant="blue"
                emptyText="ยังไม่มีข้อมูลสมรรถนะที่แสดงออก"
                emptyTdClassName="border border-gray-300 px-3 py-4 text-center text-sm text-gray-500 dark:text-gray-300"
              />
            </div>
            {isFinalized && evaluatedCompetencyScoreSummary && (
              <div className="w-full overflow-x-auto md:w-1/2">
                <p className="text-sm font-normal text-gray-700 dark:text-gray-300 mb-2">
                  จากระดับสมรรถนะจากผู้ตรวจ
                </p>
                <Section2ScoreTable
                  summary={evaluatedCompetencyScoreSummary}
                  variant="green"
                  emptyText="ยังไม่มีข้อมูลสมรรถนะจากผู้ตรวจ"
                  emptyTdClassName="border border-gray-300 dark:border-gray-700 px-3 py-4 text-center text-sm text-gray-500 dark:text-gray-300"
                />
              </div>
            )}
          </div>
        </div>

        <Section2CriteriaSummary
          competencyScoreSummary={competencyScoreSummary}
          evaluatedCompetencyScoreSummary={evaluatedCompetencyScoreSummary}
          competencyTotalScoreCalc={competencyTotalScoreCalc}
          isFinalized={isFinalized}
          onOpenCompetencyModal={onOpenCompetencyModal}
        />
      </div>
    </div>
  )
}

export default Section2
