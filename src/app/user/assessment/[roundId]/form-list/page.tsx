'use client'

import { useMemo } from 'react'
import { useParams } from 'next/navigation'
import Table, { type TableColumn } from '@/components/Table'
import { useFormList, type AssesseeWithProgress } from './_partial/useFormList'
import { buildFormListColumns } from './_partial/formListColumns'

export default function AssessmentRoundPage() {
  const params = useParams()
  const roundId = params?.roundId as string

  const {
    assessees,
    roundInfo,
    total,
    page,
    rowsPerPage,
    totalPages,
    loadingData,
    error,
    assessorLoading,
    isAssessor,
    assessorInitialized,
    handlePageChange,
    handleRowsPerPageChange,
    navigateToForm,
    goBackToList,
  } = useFormList(roundId)

  const columns = useMemo<TableColumn<AssesseeWithProgress>[]>(
    () =>
      buildFormListColumns({
        page,
        rowsPerPage,
        onNavigateToForm: navigateToForm,
      }),
    [page, rowsPerPage, navigateToForm]
  )

  if (assessorInitialized && !isAssessor) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">ไม่พบข้อมูลการประเมิน</h1>
          <p className="text-gray-600">คุณไม่มีสิทธิ์เข้าถึงหน้านี้</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">เกิดข้อผิดพลาด</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={goBackToList}
            className="bg-business1 text-white px-4 py-2 rounded-md hover:bg-business1/90 transition-colors"
          >
            กลับไปหน้ารายการ
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-md bg-white p-4 shadow transition-all duration-300 ease-in-out dark:bg-zinc-900 dark:text-gray-400">
      <div className="mb-4">
        {loadingData || assessorLoading ? (
          <div className="space-y-2">
            <div className="skeleton animate-pulse dark:bg-zinc-700 h-6 w-48 rounded-md"></div>
          </div>
        ) : (
          <h2 className="text-xl font-normal text-gray-700 dark:text-gray-300">
            {(roundInfo?.round_list_name as string | undefined) ?? 'รอบการประเมินภาระงาน'}
          </h2>
        )}
      </div>
      <div className="mb-4 flex items-end justify-between">
        <div className="flex w-full flex-wrap items-end gap-4 md:w-auto">
          {loadingData ? (
            <div className="skeleton h-7 w-16 rounded-md"></div>
          ) : (
            <div className="w-auto rounded-md bg-gray-200 px-2 py-1 text-sm font-normal text-business1 dark:text-blue-500 dark:bg-zinc-800">
              {total} รายการ
            </div>
          )}
        </div>
      </div>
      <Table
        data={assessees}
        columns={columns}
        loading={loadingData}
        total={total}
        currentPage={page}
        totalPages={totalPages}
        rowsPerPage={rowsPerPage}
        onPageChange={handlePageChange}
        onRowsPerPageChange={handleRowsPerPageChange}
        emptyMessage="คุณยังไม่มีผู้รับการประเมินในรอบนี้"
        skeletonRows={rowsPerPage}
        rowsPerPageOptions={[5, 10, 20, 50]}
      />
    </div>
  )
}
