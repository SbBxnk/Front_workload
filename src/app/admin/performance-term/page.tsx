'use client'
import type React from 'react'
import { useEffect, useState, useMemo } from 'react'
import type { PerformanceTerm, Competency, Position, PerformanceTermMatrix } from '@/Types'
import PerformanceTermServices from '@/services/performanceTermService'
import CompetencyServices from '@/services/competencyService'
import PositionServices from '@/services/positionServices'
import { useSession } from 'next-auth/react'
import Swal from 'sweetalert2'
import StickyFooter from '@/components/StickyFooter'
import useUtility from '@/hooks/useUtility'

type PerformanceMatrixDataState = {
  [competency_id: number]: {
    [position_id: number]: {
      expected_level_id?: number
      expected_level: number | null
      isNew?: boolean
    }
  }
}

function PerformanceTermMatrixTable() {
  const { data: session } = useSession()
  const { setBreadcrumbs } = useUtility()
  const [loading, setLoading] = useState<boolean>(true)
  const [competencies, setCompetencies] = useState<Competency[]>([])
  const [positions, setPositions] = useState<Position[]>([])
  const [performanceTerms, setPerformanceTerms] = useState<PerformanceTerm[]>([])
  const [refreshKey, setRefreshKey] = useState(0)
  const [isEditing, setIsEditing] = useState<boolean>(false)

  const [matrixData, setMatrixData] = useState<PerformanceMatrixDataState>({})
  const [initialMatrixData, setInitialMatrixData] = useState<PerformanceMatrixDataState>({})

  useEffect(() => {
    setBreadcrumbs(
      [{ text: 'เกณฑ์สมรรถนะ', path: '/admin/performance-term' },
    ])
  }, [setBreadcrumbs])

  useEffect(() => {
    const fetchCompetencies = async () => {
      if (!session?.accessToken) return
      try {
        const response = await CompetencyServices.getAllCompetencies(session.accessToken, {
          limit: 1000,
          sort: 'competency_order',
          order: 'asc'
        })
        if (response.success) {
          setCompetencies(response.payload || [])
        }
      } catch (error) {
        console.error('Error fetching competencies:', error)
      }
    }
    fetchCompetencies()
  }, [session?.accessToken])

  useEffect(() => {
    const fetchPositions = async () => {
      if (!session?.accessToken) return
      try {
        const response = await PositionServices.getAllPositions(session.accessToken, {
          limit: 1000,
          sort: 'position_id',
          order: 'asc'
        })
        if (response.success) {
          setPositions(response.payload || [])
        }
      } catch (error) {
        console.error('Error fetching positions:', error)
      }
    }
    fetchPositions()
  }, [session?.accessToken])

  useEffect(() => {
    const fetchPerformanceTerms = async () => {
      if (!session?.accessToken) return
      setLoading(true)
      try {
        const response = await PerformanceTermServices.getAllPerformanceTerms(session.accessToken, {
          limit: 10000,
          sort: 'competency_order',
          order: 'asc'
        })
        if (response.success) {
          setPerformanceTerms(response.payload || [])
          const matrix: PerformanceMatrixDataState = {}
          response.payload?.forEach((term: PerformanceTerm) => {
            if (!matrix[term.competency_id]) {
              matrix[term.competency_id] = {}
            }
            matrix[term.competency_id][term.position_id] = {
              expected_level_id: term.expected_level_id,
              expected_level: term.expected_level,
              isNew: false
            }
          })
          setMatrixData(matrix)
          setInitialMatrixData(JSON.parse(JSON.stringify(matrix)) as PerformanceMatrixDataState)
        }
      } catch (error) {
        console.error('Error fetching performance terms:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchPerformanceTerms()
  }, [session?.accessToken, refreshKey])

  const handleCellChange = (competencyId: number, positionId: number, value: string) => {
    if (!isEditing) {
      return
    }

    const numValue = value === '' ? null : Number(value)

    if (numValue !== null && (Number.isNaN(numValue) || numValue < 0)) {
      return
    }

    setMatrixData((prev) => {
      const newData = { ...prev }
      if (!newData[competencyId]) {
        newData[competencyId] = {}
      }
      newData[competencyId][positionId] = {
        ...newData[competencyId][positionId],
        expected_level: numValue,
        isNew: newData[competencyId][positionId]?.expected_level_id === undefined
      }
      return newData
    })
  }

  const handleSaveAll = async () => {
    if (!isEditing) {
      return
    }

    if (!session?.accessToken) return
    
    setLoading(true)
    const accessToken = session.accessToken
    const updates: Array<{
      competency_id: number
      position_id: number
      expected_level: number
      expected_level_id?: number
      isNew: boolean
    }> = []

    const deletions: Array<{ expected_level_id: number }> = []
    
    Object.keys(matrixData).forEach((compIdStr) => {
      const competencyId = parseInt(compIdStr)
      Object.keys(matrixData[competencyId]).forEach((posIdStr) => {
        const positionId = parseInt(posIdStr)
        const cell = matrixData[competencyId][positionId]
        
        if (cell.expected_level_id && (cell.expected_level === null || cell.expected_level === undefined)) {
          deletions.push({ expected_level_id: cell.expected_level_id })
        }
        else if (cell.expected_level !== null && cell.expected_level !== undefined) {
          updates.push({
            competency_id: competencyId,
            position_id: positionId,
            expected_level: cell.expected_level,
            expected_level_id: cell.expected_level_id,
            isNew: cell.isNew || false
          })
        }
      })
    })

    try {
      const deletePromises = deletions.map((del) =>
        PerformanceTermServices.deletePerformanceTerm(del.expected_level_id, accessToken)
      )
      
      const savePromises = updates.map((update) => {
        if (update.isNew || !update.expected_level_id) {
          return PerformanceTermServices.createPerformanceTerm(
            {
              competency_id: update.competency_id,
              position_id: update.position_id,
              expected_level: update.expected_level
            },
            accessToken
          )
        } else {
          return PerformanceTermServices.updatePerformanceTerm(
            update.expected_level_id,
            {
              competency_id: update.competency_id,
              position_id: update.position_id,
              expected_level: update.expected_level
            },
            accessToken
          )
        }
      })

      await Promise.all([...deletePromises, ...savePromises])
      
      const totalChanges = updates.length + deletions.length
      Swal.fire({
        icon: 'success',
        title: 'บันทึกสำเร็จ!',
        text: `บันทึกข้อมูล ${totalChanges} รายการสำเร็จ!`,
        showConfirmButton: false,
        timer: 1500,
      })
      
      setRefreshKey((prev) => prev + 1)
      setIsEditing(false)
    } catch (error) {
      console.error('Error saving performance terms:', error)
      Swal.fire({
        icon: 'error',
        title: 'เกิดข้อผิดพลาด!',
        text: 'เกิดข้อผิดพลาดในการบันทึกข้อมูล',
        showConfirmButton: false,
        timer: 1500,
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCancelEdit = () => {
    setMatrixData(JSON.parse(JSON.stringify(initialMatrixData)) as PerformanceMatrixDataState)
    setIsEditing(false)
  }

  const handleStartEditing = () => {
    if (!loading) {
      setIsEditing(true)
    }
  }


  const sortedPositions = useMemo(() => {
    return [...positions].sort((a, b) => a.position_id - b.position_id)
  }, [positions])

  const sortedCompetencies = useMemo(() => {
    return [...competencies].sort((a, b) => 
      a.competency_order - b.competency_order
    )
  }, [competencies])

  return (
    <>
      <div className="rounded-md bg-white p-4 shadow transition-all duration-300 ease-in-out dark:bg-zinc-900 dark:text-gray-400 pb-24">
        <div className="mb-4">
          <h2 className="text-xl font-normal text-gray-700 dark:text-gray-300">
            เกณฑ์สมรรถนะ (ตามตำแหน่ง)
          </h2>
        </div>

      {loading || competencies.length === 0 ? (
        <div className="flex items-center justify-center py-8">
          <div className="text-gray-500">กำลังโหลดข้อมูล...</div>
        </div>
      ) : (
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
                  {sortedPositions.map((position) => (
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
                {sortedCompetencies.map((competency, index) => (
                  <tr key={competency.competency_id} className="even:bg-gray-50 dark:even:bg-zinc-800">
                    <td className={`sticky left-0 z-10 w-16 whitespace-nowrap p-4 text-center ${
                      index % 2 === 0 ? 'bg-white dark:bg-zinc-900' : 'bg-gray-50 dark:bg-zinc-800'
                    }`}>
                      <span className="text-md font-light text-gray-500 dark:text-gray-400">
                        {index + 1}
                      </span>
                    </td>
                    <td className={`sticky left-16 z-10 min-w-[200px] max-w-[700px] p-4 text-left ${
                      index % 2 === 0 ? 'bg-white dark:bg-zinc-900' : 'bg-gray-50 dark:bg-zinc-800'
                    }`}>
                      <span className="text-md font-light text-gray-500 dark:text-gray-400 line-clamp-2">
                        {competency.competency_name}
                      </span>
                    </td>
                    {sortedPositions.map((position) => {
                      const cellValue = matrixData[competency.competency_id]?.[position.position_id]?.expected_level ?? null
                      const hasValue = cellValue !== null && cellValue !== undefined
                      
                      return (
                        <td
                          key={position.position_id}
                          className="whitespace-nowrap p-4 text-center"
                        >
                          <input
                            type="number"
                            min="0"
                            value={cellValue ?? ''}
                            onChange={(e) => handleCellChange(competency.competency_id, position.position_id, e.target.value)}
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
      )}
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

export default PerformanceTermMatrixTable

