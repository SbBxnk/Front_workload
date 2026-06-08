import dynamic from 'next/dynamic'
import type { EvaluationDashboard } from './types'

const ReactApexChart = dynamic(() => import('react-apexcharts'), {
  ssr: false,
})

interface DashboardChartsProps {
  dashboardData: EvaluationDashboard
  totalChartOptions: any
  totalChartSeries: any[]
  comparisonChartOptions: any
  comparisonChartSeries: any[]
  performanceComparisonChartOptions: any
  performanceComparisonChartSeries: any[]
}

export function DashboardCharts({
  dashboardData,
  totalChartOptions,
  totalChartSeries,
  comparisonChartOptions,
  comparisonChartSeries,
  performanceComparisonChartOptions,
  performanceComparisonChartSeries,
}: DashboardChartsProps) {
  return (
    <>
      <div className="rounded-md border border-gray-100 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900 md:col-span-2">
        <div className="mb-2">
          <div className="text-md text-gray-500 dark:text-gray-400">
            เปรียบเทียบคะแนนรวมจากการประเมินภาระงาน
          </div>
        </div>
        <div className="mt-1">
          {totalChartSeries.length > 0 && (
            <ReactApexChart
              options={totalChartOptions}
              series={totalChartSeries}
              type="bar"
              height={350}
            />
          )}
        </div>
      </div>
    </>
  )
}

interface CriteriaChartProps {
  dashboardData: EvaluationDashboard
  comparisonChartOptions: any
  comparisonChartSeries: any[]
}

export function CriteriaComparisonChart({
  dashboardData,
  comparisonChartOptions,
  comparisonChartSeries,
}: CriteriaChartProps) {
  return (
    <div className="mt-4 rounded-lg border border-gray-100 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="mb-2">
        <div className="text-md text-gray-500 dark:text-gray-400">
          เปรียบเทียบคะแนนองค์ประกอบที่ 1 ผลสัมฤทธิ์ของงาน
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          ภาระงาน : <span className="text-blue-600 dark:text-blue-400">
            {dashboardData.workloadGroupName || 'ไม่ได้ระบุ'}
          </span>
        </div>
      </div>
      <div className="mt-1">
        {dashboardData.criteriaComparison?.length ? (
          <ReactApexChart
            options={comparisonChartOptions}
            series={comparisonChartSeries}
            type="bar"
            height={380}
          />
        ) : (
          <div className="rounded-md border border-dashed border-gray-300 p-4 text-center text-sm text-gray-500 dark:border-zinc-700 dark:text-gray-400">
            ยังไม่มีข้อมูลการเปรียบเทียบคะแนน
          </div>
        )}
      </div>
    </div>
  )
}

interface PerformanceChartProps {
  dashboardData: EvaluationDashboard
  performanceComparisonChartOptions: any
  performanceComparisonChartSeries: any[]
}

export function PerformanceComparisonChart({
  dashboardData,
  performanceComparisonChartOptions,
  performanceComparisonChartSeries,
}: PerformanceChartProps) {
  return (
    <div className="mt-4 rounded-lg border border-gray-100 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="mb-2">
        <div className="text-md text-gray-500 dark:text-gray-400">
          เปรียบเทียบคะแนนองค์ประกอบที่ 2 พฤติกรรมการปฏิบัติงาน (สมรรถนะ)
        </div>
        {dashboardData.positionName && (
          <div className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            ระดับตำแหน่งผู้รับการประเมิน : <span className="text-blue-600 dark:text-blue-400">{dashboardData.positionName}</span>
          </div>
        )}
      </div>
      <div className="mt-1">
        {dashboardData.performanceComparison?.length ? (
          <ReactApexChart
            options={performanceComparisonChartOptions}
            series={performanceComparisonChartSeries}
            type="line"
            height={400}
          />
        ) : (
          <div className="rounded-md border border-dashed border-gray-300 p-4 text-center text-sm text-gray-500 dark:border-zinc-700 dark:text-gray-400">
            ยังไม่มีข้อมูลการเปรียบเทียบคะแนน
          </div>
        )}
      </div>
    </div>
  )
}

interface FeedbackSectionProps {
  dashboardData: EvaluationDashboard
}

export function FeedbackSection({ dashboardData }: FeedbackSectionProps) {
  return (
    <div className="mt-4 flex flex-col gap-3 rounded-lg border border-gray-100 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
        คำติชมจากผู้ประเมิน
      </div>
      {dashboardData.feedback?.length ? (
        <div className="flex max-h-72 flex-col gap-3 overflow-y-auto pr-1 text-sm">
          {dashboardData.feedback.map((fb, idx) => (
            <div
              key={idx}
              className="rounded-md border border-gray-100 bg-gray-50 p-3 text-gray-700 dark:border-zinc-800 dark:bg-zinc-900/60 dark:text-gray-200"
            >
              <div className="mb-1 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                <span>{fb.reviewerName ?? 'ผู้ประเมิน'}</span>
                {fb.createdAt && (
                  <span>{new Date(fb.createdAt).toLocaleDateString('th-TH')}</span>
                )}
              </div>
              <p className="text-sm leading-relaxed">{fb.comment}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-md border border-dashed border-gray-300 p-4 text-center text-sm text-gray-500 dark:border-zinc-700 dark:text-gray-400">
          ยังไม่มีคำติชมจากผู้ประเมินในรอบนี้
        </div>
      )}
    </div>
  )
}
