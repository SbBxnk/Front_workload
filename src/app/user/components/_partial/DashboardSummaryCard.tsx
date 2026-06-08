import dynamic from 'next/dynamic'
import { FileDown, Info } from 'lucide-react'
import type { RefObject } from 'react'
import type { EvaluationDashboard } from './types'
import { formatStatus, statusBadgeColor } from './dashboardHelpers'
import { GradeDisplay } from './GradeDisplay'

const ReactApexChart = dynamic(() => import('react-apexcharts'), {
  ssr: false,
})

interface DashboardSummaryCardProps {
  dashboardData: EvaluationDashboard
  showGradeInfo: boolean
  setShowGradeInfo: (open: boolean) => void
  gradeInfoRef: RefObject<HTMLDivElement>
  exporting: boolean
  onExportPDF: (evaluated: boolean) => void
}

export function DashboardSummaryCard({
  dashboardData,
  showGradeInfo,
  setShowGradeInfo,
  gradeInfoRef,
  exporting,
  onExportPDF,
}: DashboardSummaryCardProps) {
  return (
    <div className="rounded-md border border-gray-100 p-4 flex flex-col justify-between">
      <div className="mb-4">
        <div className="text-md font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
          {/* รอบประเมิน {dashboardData.roundName} */}
          การทำฟอร์มประเมินภาระงาน
        </div>
      </div>

      <div className="flex flex-col items-center justify-center">
        <div className="relative h-40 w-40">
          <ReactApexChart
            options={{
              chart: {
                type: 'radialBar',
                animations: { enabled: false },
                sparkline: { enabled: true },
              },
              labels: ['ความคืบหน้า'],
              tooltip: { enabled: false },
              plotOptions: {
                radialBar: {
                  hollow: { size: '65%' },
                  track: { background: '#e5e7eb', strokeWidth: '100%' },
                  dataLabels: {
                    name: { show: false },
                    value: {
                      show: true,
                      fontSize: '20px',
                      fontWeight: 700,
                      color: '#1e293b',
                      offsetY: 5,
                      formatter: (val: number) => `${val.toFixed(0)}%`,
                    },
                  },
                },
              },
              colors: [
                dashboardData.status === 'COMPLETED'
                  ? '#10b981'
                  : dashboardData.status === 'PENDING_REVIEW'
                    ? '#f59e0b'
                    : dashboardData.status === 'IN_PROGRESS'
                      ? '#3b82f6'
                      : '#94a3b8',
              ],
              stroke: { lineCap: 'round' },
            }}
            series={[dashboardData.progressPercent]}
            type="radialBar"
            height={180}
          />
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`inline-flex items-center rounded-md px-2 py-0.5 mt-10 text-[10px] font-normal uppercase tracking-tight ${statusBadgeColor(dashboardData.status)}`}>
              {formatStatus(dashboardData.status)}
            </span>
          </div>
        </div>
        <div className="w-full flex flex-row items-center gap-2">
          <p className="text-xs font-normal text-gray-400 dark:text-zinc-500 m-0">เกณฑ์ประเมินฟอร์มภาระงาน</p>
          <div className="relative inline-block" ref={gradeInfoRef}>
            <button
              onClick={() => setShowGradeInfo(!showGradeInfo)}
              className="flex items-center text-gray-400 hover:text-blue-500 transition-colors"
            >
              <Info className="h-4 w-4" />
            </button>

            {showGradeInfo && (
              <div className="absolute left-0 top-6 z-50 w-64 rounded-md border border-gray-100 bg-white p-4 shadow-md dark:border-zinc-800 dark:bg-zinc-900 ">
                <h4 className="mb-3 text-sm font-normal text-gray-700 dark:text-gray-200">เกณฑ์การวัดระดับคะแนน</h4>
                <div className="flex flex-col gap-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-normal text-emerald-600 dark:text-emerald-400">ดีเด่น</span>
                    <span className="text-xs text-gray-500">(90 - 100)</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-normal text-blue-600 dark:text-blue-400">ดีมาก</span>
                    <span className="text-xs text-gray-500">(80 - 89.99)</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-normal text-sky-600 dark:text-sky-400">ดี</span>
                    <span className="text-xs text-gray-500">(70 - 79.99)</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-normal text-amber-600 dark:text-amber-400">พอใช้</span>
                    <span className="text-xs text-gray-500">(60 - 69.99)</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-normal text-red-600 dark:text-red-400">ต้องปรับปรุง</span>
                    <span className="text-xs text-gray-500">(ต่ำกว่า 60)</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="flex flex-col lg:flex-row w-full gap-4 mt-4">
          <GradeDisplay
            label="เกณฑ์ที่คาดหวัง"
            score={dashboardData.workloadScore.expected + dashboardData.performanceScore.expected}
            title="ผลรวมคะแนนคาดหวัง"
            colorClass="text-blue-700 bg-blue-50 dark:bg-blue-900/30 dark:text-blue-300"
            borderClass="border-blue-100 dark:border-blue-800 w-full"
            disabled={dashboardData.status === 'NOT_STARTED' || dashboardData.status === 'IN_PROGRESS'}
          />
          <GradeDisplay
            label="เกณฑ์ที่ได้"
            score={
              dashboardData.workloadScore.actual !== null && dashboardData.performanceScore.assessed !== null
                ? dashboardData.workloadScore.actual + dashboardData.performanceScore.assessed
                : null
            }
            title="ผลรวมคะแนนที่ได้"
            colorClass="text-emerald-700 bg-emerald-50 dark:bg-emerald-900/30 dark:text-emerald-300"
            borderClass="border-emerald-100 dark:border-emerald-800 w-full"
            disabled={dashboardData.status !== 'COMPLETED'}
          />
        </div>
      </div>


      <div className="mt-4 flex flex-col gap-2">
        {(dashboardData.status === 'IN_PROGRESS' || dashboardData.status === 'PENDING_REVIEW' || dashboardData.status === 'COMPLETED') && (
          <>
            <button
              onClick={() => onExportPDF(false)}
              disabled={exporting}
              className="w-full inline-flex h-9 items-center justify-start gap-2 rounded-lg bg-red-500 px-4 text-xs font-medium text-white shadow-sm hover:bg-red-600 transition-colors duration-200 disabled:opacity-50"
            >
              <FileDown className="h-4 w-4" />
              {exporting ? 'กำลังประมวลผล...' : 'ผลการประเมินภาระงาน'}
            </button>

            {dashboardData.status === 'COMPLETED' && (
              <button
                onClick={() => onExportPDF(true)}
                disabled={exporting}
                className="w-full inline-flex h-9 items-center justify-start gap-2 rounded-lg border border-red-500 bg-white px-4 text-xs font-medium text-red-500 shadow-sm hover:bg-red-600 hover:text-white transition-colors duration-200 disabled:opacity-50"
              >
                <FileDown className="h-4 w-4" />
                {exporting ? 'กำลังประมวลผล...' : 'คะแนนจากผู้ตรวจ'}
              </button>
            )}
          </>
        )}
      </div>
    </div>
  )
}
