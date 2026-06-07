'use client'
import React, { useEffect, useState, useMemo } from 'react'
import { useSession } from 'next-auth/react'
import { jwtDecode } from 'jwt-decode'
import PerformanceService from '@/services/performanceService'
import type {
  PerformanceEvaluationFormData,
  PerformanceEvaluationRequest,
} from '@/Types/performance'
import SnapshotService from '@/services/snapshotService'
import { AlertCircle, Save } from 'lucide-react'

interface PerformanceFormProps {
  userId?: number
  roundId?: number
  formlist_id?: number
}

interface Position {
  position_id: number
  position_name: string
  short_name: string // อ., ผศ., รศ., ศ.
}

// ตำแหน่งที่ใช้ในระบบ
const POSITIONS: Position[] = [
  { position_id: 1, position_name: 'อาจารย์', short_name: 'อ.' },
  { position_id: 2, position_name: 'ผู้ช่วยศาสตราจารย์', short_name: 'ผศ.' },
  { position_id: 3, position_name: 'รองศาสตราจารย์', short_name: 'รศ.' },
  { position_id: 4, position_name: 'ศาสตราจารย์', short_name: 'ศ.' },
]

export default function PerformanceForm({
  userId,
  roundId,
  formlist_id: propFormlistId,
}: PerformanceFormProps) {
  const { data: session } = useSession()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState<PerformanceEvaluationFormData | null>(null)
  const [formlist_id, setFormlistId] = useState<number | null>(propFormlistId || null)
  const [user, setUser] = useState<any>(null)
  const [demonstratedLevels, setDemonstratedLevels] = useState<Record<number, number | null>>({})
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // ดึงข้อมูล user จาก session
  useEffect(() => {
    if (session?.accessToken) {
      try {
        const decoded = jwtDecode(session.accessToken) as any
        setUser(decoded)
      } catch (error) {
        console.error('Error decoding token:', error)
      }
    }
  }, [session?.accessToken])

  // ดึง formlist_id ถ้ายังไม่มี
  useEffect(() => {
    const fetchFormlistId = async () => {
      if (formlist_id || !userId || !roundId) return

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
  }, [userId, roundId, formlist_id])

  // ดึงข้อมูลฟอร์ม
  useEffect(() => {
    const fetchFormData = async () => {
      if (!formlist_id || !userId || !session?.accessToken) return

      try {
        setLoading(true)
        const response = await PerformanceService.getPerformanceEvaluationForm(
          formlist_id,
          userId
        )

        if (response.success && response.payload) {
          // Handle both array and single object response
          const payload = Array.isArray(response.payload)
            ? response.payload[0]
            : response.payload as PerformanceEvaluationFormData

          setFormData(payload)

          // เตรียมข้อมูล demonstrated_levels จากข้อมูลที่มีอยู่
          const levels: Record<number, number | null> = {}
          if (payload.evaluations && Array.isArray(payload.evaluations)) {
            payload.evaluations.forEach((evaluation) => {
              levels[evaluation.competency_id] = evaluation.demonstrated_level
            })
          }
          setDemonstratedLevels(levels)
        }
      } catch (error) {
        console.error('Error fetching performance form data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchFormData()
  }, [formlist_id, userId, session?.accessToken])

  // จัดกลุ่ม expected levels ตาม competency และ position
  const expectedLevelsMap = useMemo(() => {
    if (!formData) return {}

    const map: Record<number, Record<number, number>> = {} // competency_id -> position_id -> expected_level

    formData.expectedLevels.forEach((level) => {
      if (!map[level.competency_id]) {
        map[level.competency_id] = {}
      }
      map[level.competency_id][level.position_id] = level.expected_level
    })

    return map
  }, [formData])

  // จัดเรียงตำแหน่งตาม order
  const sortedPositions = useMemo(() => {
    return POSITIONS.sort((a, b) => a.position_id - b.position_id)
  }, [])

  // หา position name จาก position_id
  const getPositionName = (positionId: number): string => {
    const position = POSITIONS.find((p) => p.position_id === positionId)
    return position?.position_name || ''
  }

  // หา short name จาก position_id
  const getPositionShortName = (positionId: number): string => {
    const position = POSITIONS.find((p) => p.position_id === positionId)
    return position?.short_name || ''
  }

  // ตรวจสอบว่าตำแหน่งนี้ถูก highlight หรือไม่
  const isPositionHighlighted = (positionId: number): boolean => {
    // ใช้ position_id จาก token (user.position_id) เป็นหลัก
    // ถ้าไม่มีใช้จาก formData.userPositionId เป็น fallback
    const userPositionId = user?.position_id || formData?.userPositionId
    return userPositionId === positionId
  }

  // จัดการการเปลี่ยนแปลงค่า demonstrated_level
  const handleDemonstratedLevelChange = (competencyId: number, value: string) => {
    // ถ้าค่าว่าง ให้ตั้งเป็น null
    if (value === '') {
      setDemonstratedLevels((prev) => ({
        ...prev,
        [competencyId]: null,
      }))
      return
    }

    const numValue = parseInt(value)
    
    // ตรวจสอบว่าเป็นตัวเลขหรือไม่
    if (isNaN(numValue)) {
      return // ไม่บันทึกถ้าไม่ใช่ตัวเลข
    }

    // บันทึกค่าได้ทุกตัวเลข ไม่จำกัด
    setDemonstratedLevels((prev) => ({
      ...prev,
      [competencyId]: numValue,
    }))
  }

  // บันทึกข้อมูล
  const handleSave = async () => {
    if (!formlist_id || !userId || !roundId || !formData) {
      setSaveMessage({ type: 'error', text: 'ข้อมูลไม่ครบถ้วน: กรุณาตรวจสอบ formlist_id, userId, roundId' })
      return
    }

    // ใช้ position_id จาก token เป็นหลัก
    const userPositionId = user?.position_id || formData?.userPositionId
    
    if (!userPositionId) {
      setSaveMessage({ type: 'error', text: 'ไม่พบ position_id กรุณาตรวจสอบข้อมูลผู้ใช้' })
      return
    }

    try {
      setSaving(true)
      setSaveMessage(null)

      const evaluations: PerformanceEvaluationRequest[] = formData.competencies.map((competency) => ({
        formlist_id: formlist_id,
        u_id: userId,
        round_list_id: roundId,
        position_id: userPositionId,
        competency_id: competency.competency_id,
        demonstrated_level: demonstratedLevels[competency.competency_id] ?? null,
      }))

      // ตรวจสอบว่ามี evaluation อย่างน้อย 1 รายการ
      if (evaluations.length === 0) {
        setSaveMessage({ type: 'error', text: 'ไม่พบข้อมูลสมรรถนะสำหรับบันทึก' })
        setSaving(false)
        return
      }

      const response = await PerformanceService.addOrUpdatePerformanceEvaluationBulk(
        evaluations
      )

      if (response.success) {
        setSaveMessage({ type: 'success', text: 'บันทึกข้อมูลสำเร็จ' })
        // อัปเดตข้อมูล formData
        const updatedFormData = { ...formData }
        const userPositionId = user?.position_id || formData?.userPositionId
        updatedFormData.evaluations = evaluations.map((evaluation, index) => ({
          ...evaluation,
          evaluation_id: formData.evaluations[index]?.evaluation_id || 0,
          competency_name: formData.competencies[index].competency_name,
          competency_order: formData.competencies[index].competency_order,
          position_name: getPositionName(userPositionId),
        }))
        setFormData(updatedFormData)
      } else {
        const errorMsg = response.message || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล'
        setSaveMessage({ type: 'error', text: errorMsg })
      }
    } catch (error: any) {
      console.error('Error saving performance evaluation:', error)
      // แสดง error message จาก backend ถ้ามี
      const errorMessage = 
        error?.response?.data?.message || 
        error?.response?.data?.error ||
        error?.message ||
        'เกิดข้อผิดพลาดในการบันทึกข้อมูล'
      console.error('Error details:', {
        message: errorMessage,
        response: error?.response?.data,
        evaluations: formData.competencies.map((competency) => ({
          formlist_id: formlist_id,
          u_id: userId,
          round_list_id: roundId,
          position_id: user?.position_id || formData?.userPositionId,
          competency_id: competency.competency_id,
          demonstrated_level: demonstratedLevels[competency.competency_id] || null,
        }))
      })
      setSaveMessage({ type: 'error', text: errorMessage })
    } finally {
      setSaving(false)
      // ลบ message หลังจาก 3 วินาที
      setTimeout(() => {
        setSaveMessage(null)
      }, 3000)
    }
  }

  if (loading) {
    return (
      <div className="rounded-md bg-white p-4 shadow dark:bg-zinc-900">
        <div className="flex items-center justify-center py-16">
          <div className="text-gray-600 dark:text-gray-400">กำลังโหลดข้อมูล...</div>
        </div>
      </div>
    )
  }

  if (!formData) {
    return (
      <div className="rounded-md bg-white p-4 shadow dark:bg-zinc-900">
        <div className="flex items-center justify-center py-16">
          <div className="text-red-600 dark:text-red-400">ไม่พบข้อมูลฟอร์ม</div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md bg-white p-4 shadow dark:bg-zinc-900">
        <p className="text-lg font-light text-center text-gray-800 dark:text-gray-200">ข้อตกลงและแบบประเมินผลการปฏิบัติงานของบุคลากรสายวิชาการ</p>
        <p className="text-lg font-light text-center text-gray-800 dark:text-gray-200 mb-8">มหาวิทยาลัยเทคโนโลยีราชมงคลล้านนา</p>
        <p className="text-md font-normal text-gray-800 dark:text-gray-200 mb-4">ส่วนที่ 2 องค์ประกอบที่ 2 พฤติกรรมการปฏิบัติงาน (สมรรถนะ)</p>
        {/* ตารางสมรรถนะ - แสดงทั้ง 10 ข้อ */}
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

        {/* ปุ่มบันทึก */}
        <div className="mt-6 flex items-center justify-between">
          {saveMessage && (
            <div
              className={`flex items-center gap-2 text-md ${saveMessage.type === 'success'
                  ? 'text-green-600 dark:text-green-400'
                  : 'text-red-600 dark:text-red-400'
                }`}
            >
              <AlertCircle className="h-4 w-4" />
              {saveMessage.text}
            </div>
          )}
          <button
            onClick={handleSave}
            disabled={saving}
            className="ml-auto flex items-center gap-2 rounded-md bg-business1 px-4 py-2 text-white transition-colors hover:bg-business1/90 disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {saving ? 'กำลังบันทึก...' : 'บันทึกข้อมูล'}
          </button>
        </div>
      </div>
    </div>
  )
}

