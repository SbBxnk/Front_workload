'use client'
import { FileDown } from 'lucide-react'
import Section1 from './section_1'
import Section2 from './section_2'
import Section3 from './section_3'
import Section4 from './section_4'
import Section5 from './section_5'
import Section6 from './section_6'
import Section2CalModal from './_partial/section2CalModal'
import type { WorkloadFormProps } from './_partial/workloadFormTypes'
import { isImageFile, POSITIONS } from './_partial/workloadFormHelpers'
import { useWorkloadForm } from './_partial/useWorkloadForm'

export default function WorkloadForm({ selectedGroupName, terms = [], userId, roundId, isPreview = false, forceSnapshot = false }: WorkloadFormProps) {
  const {
    workloadData,
    exporting,
    performanceSnapshot,
    expectedLevels,
    competencies,
    performanceEvaluations,
    isCompetencyModalOpen,
    setIsCompetencyModalOpen,
    currentUser,
    userPositionName,
    userPositionId,
    competencyScoreSummary,
    competencyTotalScoreCalc,
    formlistStatus,
    evaluatedCompetencyScoreSummary,
    setEvaluatedCompetencyScoreSummary,
    totalPerformanceWorkload,
    performanceScoreOutOf70,
    mergedTasks,
    performanceScoreOutOf70Evaluated,
    isFinalized,
    handleExportPDFWithLinksWrapper,
    handleExportPDFEvaluatedWrapper,
  } = useWorkloadForm({ selectedGroupName, terms, userId, roundId, isPreview, forceSnapshot })

  return (
    <>
      <div id="workload-content" className="space-y-4">
        <div className="flex flex-col gap-10 rounded-md p-4 bg-white dark:bg-zinc-900">
          <div className="flex justify-end gap-3 mb-4">
          {isFinalized && (
              <button
                id="export-pdf-btn-evaluation"
                onClick={handleExportPDFEvaluatedWrapper}
                disabled={exporting || !Array.isArray(workloadData) || workloadData.length === 0}
                className="inline-flex h-10 items-center px-4 py-2 bg-white text-red-500 border border-red-500 rounded-lg hover:text-white hover:bg-red-600 transition-colors duration-200"
                title="Export PDF พร้อม clickable links (คะแนนจากผู้ตรวจ)"
              >
                <FileDown className="mr-2 h-4 w-4" />
                คะแนนจากผู้ตรวจ
              </button>
            )}
            <button
              id="export-pdf-btn"
              onClick={handleExportPDFWithLinksWrapper}
              disabled={exporting || !Array.isArray(workloadData) || workloadData.length === 0}
              className="inline-flex h-10 items-center px-4 py-2 bg-red-500 text-white rounded-lg hover:text-white hover:bg-red-600 transition-colors duration-200"
              title="Export PDF พร้อม clickable links"
            >
              <FileDown className="mr-2 h-4 w-4" />
              ผลการประเมินภาระงาน
            </button>
          </div>

          <Section1
            mergedTasks={mergedTasks}
            terms={terms}
            selectedGroupName={selectedGroupName}
            totalPerformanceWorkload={totalPerformanceWorkload}
            performanceScoreOutOf70={performanceScoreOutOf70}
            performanceScoreOutOf70Evaluated={performanceScoreOutOf70Evaluated}
            isImageFile={isImageFile}
            formlistStatus={formlistStatus}
          />

          <Section2
            isPreview={isPreview}
            competencies={competencies}
            expectedLevels={expectedLevels}
            performanceEvaluations={performanceEvaluations}
            performanceSnapshot={performanceSnapshot}
            userPositionName={userPositionName}
            userPositionId={userPositionId}
            positions={POSITIONS}
            competencyScoreSummary={competencyScoreSummary}
            competencyTotalScoreCalc={competencyTotalScoreCalc}
            onOpenCompetencyModal={() => setIsCompetencyModalOpen(true)}
            formlistStatus={formlistStatus}
            userId={userId}
            roundId={roundId}
            onEvaluatedCompetencyScoreSummaryChange={(summary) => {
              setEvaluatedCompetencyScoreSummary(summary)
            }}
          />

          <Section3
            performanceScoreOutOf70={performanceScoreOutOf70}
            performanceScoreOutOf30={competencyScoreSummary.totalScore}
            formlistStatus={formlistStatus}
            performanceScoreOutOf70Evaluated={formlistStatus === 2 ? performanceScoreOutOf70Evaluated : null}
            performanceScoreOutOf30Evaluated={formlistStatus === 2 && evaluatedCompetencyScoreSummary ? evaluatedCompetencyScoreSummary.totalScore : null}
            userName={currentUser ? `${currentUser.prefix_name || ''} ${currentUser.u_fname || ''} ${currentUser.u_lname || ''}`.trim() || null : null}
            evaluatorName={null}
          />

          <Section4
            userName={currentUser ? `${currentUser.prefix_name || ''} ${currentUser.u_fname || ''} ${currentUser.u_lname || ''}`.trim() || null : null}
            evaluatorName={null}
          />
          <Section5/>
          <Section6/>
        </div>
      </div>
      <Section2CalModal
        isOpen={isCompetencyModalOpen}
        onClose={() => setIsCompetencyModalOpen(false)}
        title="วิธีคำนวณ"
      >
        <div className="flex flex-col items-center text-center text-base font-light">
          <p>ผลรวมคะแนน</p>
          <div className="my-3 h-px w-2/3 mx-auto bg-gray-300" />
          <p>จำนวนสมรรถนะที่ใช้ในการประเมิน x 3</p>
        </div>
      </Section2CalModal>
    </>
  )
}
