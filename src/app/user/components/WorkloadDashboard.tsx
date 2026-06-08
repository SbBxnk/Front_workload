'use client'

import { TriangleAlertIcon, CircleX } from 'lucide-react'
import { useWorkloadDashboard } from './_partial/useWorkloadDashboard'
import { RoundSelector } from './_partial/RoundSelector'
import { DashboardSummaryCard } from './_partial/DashboardSummaryCard'
import {
  DashboardCharts,
  CriteriaComparisonChart,
  PerformanceComparisonChart,
  FeedbackSection,
} from './_partial/DashboardCharts'

export default function WorkloadDashboard() {
  const {
    router,
    searchParams,
    rounds,
    selectedRoundId,
    setSelectedRoundId,
    dashboardData,
    invalidRoundFromUrl,
    hasFormInRound,
    exporting,
    isUserAssigned,
    isLoading,
    hasError,
    error,
    isDropdownOpen,
    setIsDropdownOpen,
    showGradeInfo,
    setShowGradeInfo,
    dropdownRef,
    gradeInfoRef,
    handleExportPDF,
    comparisonChartOptions,
    comparisonChartSeries,
    totalChartOptions,
    totalChartSeries,
    performanceComparisonChartOptions,
    performanceComparisonChartSeries,
  } = useWorkloadDashboard()

  const handleSelectRound = (roundId: number) => {
    setSelectedRoundId(roundId)
    setIsDropdownOpen(false)
    const params = new URLSearchParams(searchParams.toString())
    params.set('roundId', String(roundId))
    router.replace(`?${params.toString()}`, { scroll: false })
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-lg bg-white p-4 shadow transition-all duration-300 ease-in-out dark:bg-zinc-900">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-lg font-normal text-gray-700 dark:text-gray-200">
              ภาพรวมการประเมินภาระงานอาจารย์
            </h2>
          </div>

          <div className="flex flex-col items-end gap-2 sm:flex-row sm:items-center">
            <RoundSelector
              rounds={rounds}
              selectedRoundId={selectedRoundId}
              isDropdownOpen={isDropdownOpen}
              setIsDropdownOpen={setIsDropdownOpen}
              dropdownRef={dropdownRef}
              onSelectRound={handleSelectRound}
            />
          </div>
        </div>
      </div>


      <div className="rounded-lg bg-white p-4 shadow transition-all duration-300 ease-in-out dark:bg-zinc-900">

        {hasFormInRound === false && !isLoading && !invalidRoundFromUrl && (
          <div className="mb-4 rounded-md bg-white p-6 dark:bg-zinc-900 dark:text-gray-400">
            <div className="flex flex-col items-center justify-center gap-4 py-8 text-center">
              <TriangleAlertIcon className="h-12 w-12 text-red-500 md:h-24 md:w-24" />
              <div className="">
                <h2 className="mb-2 text-4xl font-medium text-gray-700 dark:text-gray-300">
                  การประเมินสิ้นสุดแล้ว
                </h2>
                <p className="text-gray-500 dark:text-gray-400">
                  คุณไม่ได้ถูกกำหนดให้เป็นผู้ประเมินในรอบนี้
                </p>
                <p className="text-gray-500 dark:text-gray-400">
                  กรุณาติดต่อผู้ดูแลระบบหากคิดว่านี่เป็นข้อผิดพลาด
                </p>
              </div>
            </div>
          </div>
        )}

        {isUserAssigned === false && !isLoading && !invalidRoundFromUrl && (
          <div className="mb-4 rounded-md bg-white p-6 dark:bg-zinc-900 dark:text-gray-400">
            <div className="flex flex-col items-center justify-center gap-4 py-8 text-center">
              <CircleX className="h-12 w-12 text-red-500 md:h-24 md:w-24" />
              <div className="">
                <h2 className="mb-2 text-4xl font-normal text-gray-700 dark:text-gray-300">
                  ไม่พบรอบการประเมิน
                </h2>
                <p className="text-gray-500 dark:text-gray-400">
                  คุณไม่ได้ถูกกำหนดให้เป็นผู้รับการประเมินในรอบนี้
                </p>
                <p className="text-gray-500 dark:text-gray-400">
                  กรุณาติดต่อผู้ดูแลระบบหากคิดว่านี่เป็นข้อผิดพลาด
                </p>
              </div>
            </div>
          </div>
        )}


        {invalidRoundFromUrl && !isLoading && (
          <div className="mb-4 rounded-md bg-white p-6 shadow dark:bg-zinc-900 dark:text-gray-400">
            <div className="flex flex-col items-center justify-center gap-4 py-8 text-center">
              <TriangleAlertIcon className="h-12 w-12 text-red-500 md:h-24 md:w-24" />
              <div>
                <h2 className="mb-2 text-2xl md:text-4xl font-medium text-gray-700 dark:text-gray-300">
                  การประเมินสิ้นสุดแล้ว
                </h2>
                <p className="text-gray-500 dark:text-gray-400">
                  ไม่พบรอบการประเมินตามลิงก์ที่คุณเข้าถึง หรือคุณไม่ได้ถูกกำหนดให้เป็นผู้รับการประเมินในรอบนี้
                </p>
                <p className="text-gray-500 dark:text-gray-400">
                  กรุณาติดต่อผู้ดูแลระบบหากคิดว่านี่เป็นข้อผิดพลาด
                </p>
              </div>
            </div>
          </div>
        )}

        {hasError && !isLoading && !invalidRoundFromUrl && hasFormInRound !== false && (
          <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-900/20 dark:text-red-200">
            {error}
          </div>
        )}

        {!isLoading &&
          !hasError &&
          !invalidRoundFromUrl &&
          isUserAssigned === true &&
          hasFormInRound !== false &&
          dashboardData && (
            <>
              <div className="grid gap-4 md:grid-cols-3">
                <DashboardSummaryCard
                  dashboardData={dashboardData}
                  showGradeInfo={showGradeInfo}
                  setShowGradeInfo={setShowGradeInfo}
                  gradeInfoRef={gradeInfoRef}
                  exporting={exporting}
                  onExportPDF={handleExportPDF}
                />

                <DashboardCharts
                  dashboardData={dashboardData}
                  totalChartOptions={totalChartOptions}
                  totalChartSeries={totalChartSeries}
                  comparisonChartOptions={comparisonChartOptions}
                  comparisonChartSeries={comparisonChartSeries}
                  performanceComparisonChartOptions={performanceComparisonChartOptions}
                  performanceComparisonChartSeries={performanceComparisonChartSeries}
                />
              </div>

              <CriteriaComparisonChart
                dashboardData={dashboardData}
                comparisonChartOptions={comparisonChartOptions}
                comparisonChartSeries={comparisonChartSeries}
              />

              <PerformanceComparisonChart
                dashboardData={dashboardData}
                performanceComparisonChartOptions={performanceComparisonChartOptions}
                performanceComparisonChartSeries={performanceComparisonChartSeries}
              />

              <FeedbackSection dashboardData={dashboardData} />
            </>
          )}
      </div>
    </div>
  )
}
