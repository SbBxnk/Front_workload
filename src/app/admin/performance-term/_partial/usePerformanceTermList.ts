'use client'

import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import PerformanceTermServices from '@/services/performanceTermService'
import CompetencyServices from '@/services/competencyService'
import PositionServices from '@/services/positionServices'
import type {
  Competency,
  PerformanceTerm,
  PerformanceMatrixDataState,
  Position,
} from '@/Types'

// แปลงรายการ performance terms เป็นโครงสร้าง matrix (competency → position → ค่า)
function buildMatrix(terms: PerformanceTerm[]): PerformanceMatrixDataState {
  const matrix: PerformanceMatrixDataState = {}
  terms.forEach((term) => {
    if (!matrix[term.competency_id]) matrix[term.competency_id] = {}
    matrix[term.competency_id][term.position_id] = {
      expected_level_id: term.expected_level_id,
      expected_level: term.expected_level,
      isNew: false,
    }
  })
  return matrix
}

/**
 * ดึงข้อมูลสำหรับตารางเกณฑ์สมรรถนะ (สมรรถนะ × ตำแหน่ง) ผ่าน React Query
 * คืนรายการที่เรียงแล้ว + matrix เริ่มต้นสำหรับ seed state ฝั่งหน้า
 */
export function usePerformanceTermList() {
  const competenciesQuery = useQuery({
    queryKey: ['competencies', { for: 'performance-term' }],
    queryFn: () =>
      CompetencyServices.getAllCompetencies({
        limit: 1000,
        sort: 'competency_order',
        order: 'asc',
      }),
  })

  const positionsQuery = useQuery({
    queryKey: ['positions', { for: 'performance-term' }],
    queryFn: () =>
      PositionServices.getAllPositions({
        limit: 1000,
        sort: 'position_id',
        order: 'asc',
      }),
  })

  const performanceTermsQuery = useQuery({
    queryKey: ['performanceTerms'],
    queryFn: () =>
      PerformanceTermServices.getAllPerformanceTerms({
        limit: 10000,
        sort: 'competency_order',
        order: 'asc',
      }),
  })

  const competencies: Competency[] = competenciesQuery.data?.payload ?? []
  const positions: Position[] = positionsQuery.data?.payload ?? []
  const performanceTerms: PerformanceTerm[] =
    performanceTermsQuery.data?.payload ?? []

  const sortedCompetencies = useMemo(
    () =>
      [...competencies].sort(
        (a, b) => a.competency_order - b.competency_order
      ),
    [competencies]
  )

  const sortedPositions = useMemo(
    () => [...positions].sort((a, b) => a.position_id - b.position_id),
    [positions]
  )

  const initialMatrix = useMemo(
    () => buildMatrix(performanceTerms),
    [performanceTerms]
  )

  const isLoading =
    competenciesQuery.isLoading ||
    positionsQuery.isLoading ||
    performanceTermsQuery.isLoading

  return {
    sortedCompetencies,
    sortedPositions,
    initialMatrix,
    isLoading,
  }
}
