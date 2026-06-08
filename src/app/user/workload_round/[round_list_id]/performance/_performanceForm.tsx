'use client'
import { AlertCircle, Save } from 'lucide-react'
import type { PerformanceFormProps } from './_partial/performanceFormTypes'
import { usePerformanceForm } from './_partial/usePerformanceForm'
import PerformanceTable from './_partial/PerformanceTable'

export default function PerformanceForm({
  userId,
  roundId,
  formlist_id,
}: PerformanceFormProps) {
  const {
    loading,
    saving,
    formData,
    demonstratedLevels,
    saveMessage,
    expectedLevelsMap,
    sortedPositions,
    isPositionHighlighted,
    handleDemonstratedLevelChange,
    handleSave,
  } = usePerformanceForm({ userId, roundId, formlist_id })

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
        <PerformanceTable
          formData={formData}
          sortedPositions={sortedPositions}
          expectedLevelsMap={expectedLevelsMap}
          demonstratedLevels={demonstratedLevels}
          isPositionHighlighted={isPositionHighlighted}
          handleDemonstratedLevelChange={handleDemonstratedLevelChange}
        />

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
