'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { FiX } from 'react-icons/fi'
import Table from '@/components/Table'
import SearchFilter from '@/components/SearchFilter'
import useUtility from '@/hooks/useUtility'
import type { RoundList } from '@/Types/setAssessor'
import { useWorkloadRounds } from './_partial/useWorkloadRounds'
import { buildRoundColumns } from './_partial/roundColumns'

function SetAssessor() {
  const { setBreadcrumbs } = useUtility()
  const router = useRouter()
  const {
    rounds,
    total,
    totalPages,
    currentPage,
    rowsPerPage,
    isLoading,
    error,
    roundAccessInfo,
    searchInput,
    sortState,
    selectedLabel,
    uniqueYears,
    handleSearchChange,
    clearSearch,
    handlePageChange,
    handleRowsPerPageChange,
    handleYearSelect,
    handleSort,
    refetch,
  } = useWorkloadRounds()

  useEffect(() => {
    setBreadcrumbs([{ text: 'ฟอร์มประเมินภาระงาน', path: '/user/workload_round' }])
  }, [setBreadcrumbs])

  const goToRound = (roundListId: number) => {
    router.push(`/user/workload_round/${roundListId}`)
  }

  const columns = buildRoundColumns({
    page: currentPage,
    rowsPerPage,
    roundAccessInfo,
    onView: goToRound,
  })

  return (
    <div className="rounded-md bg-white p-4 shadow transition-all duration-300 ease-in-out dark:bg-zinc-900 dark:text-gray-400">
      <div className="mb-4 flex items-end justify-between">
        <div className="flex w-full flex-wrap items-end gap-4 md:w-auto">
          {isLoading ? (
            <div className="skeleton h-7 w-16 rounded-md"></div>
          ) : (
            <div className="w-auto rounded-md bg-gray-200 px-2 py-1 text-sm font-normal text-business1 dark:text-blue-500 dark:bg-zinc-800">
              {total} รายการ
            </div>
          )}
        </div>
        <div className="flex items-center justify-end gap-4">
          <div className="relative flex w-full items-center md:w-52">
            <input
              className="w-full rounded-md border border-gray-300 px-4 py-2 text-sm font-light text-gray-600 transition-all duration-300 ease-in-out focus:border-blue-500 focus:outline-none dark:border-zinc-600 dark:bg-zinc-800 dark:text-gray-400"
              placeholder="ค้นหารอบการประเมินภาระงาน"
              value={searchInput}
              onChange={(e) => handleSearchChange(e.target.value)}
            />
            {searchInput && (
              <button
                onClick={clearSearch}
                className="absolute right-3 text-gray-400 transition duration-200 hover:text-red-500"
              >
                <FiX className="h-4 w-4" />
              </button>
            )}
          </div>
          <SearchFilter<RoundList, 'year'>
            selectedLabel={selectedLabel}
            handleSelect={handleYearSelect}
            objects={uniqueYears.map((year) => ({
              year,
              round_list_id: 0,
              round_list_name: '',
              date_start: '',
              date_end: '',
              round: 0,
            }))}
            valueKey="year"
            labelKey="year"
            placeholder="ค้นหาปีรอบการประเมิน"
          />
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-md bg-red-50 p-4 text-red-700 dark:bg-red-900/20 dark:text-red-400">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium">เกิดข้อผิดพลาด</h3>
              <div className="mt-2 text-sm">{error}</div>
              <div className="mt-4">
                <button
                  onClick={() => refetch()}
                  className="rounded-md bg-red-100 px-3 py-2 text-sm font-medium text-red-800 hover:bg-red-200 dark:bg-red-800 dark:text-red-200 dark:hover:bg-red-700"
                >
                  ลองใหม่
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {!error && (
        <Table
          data={rounds}
          columns={columns}
          loading={isLoading}
          sortState={sortState}
          onSort={(column, order) => handleSort(column, order)}
          currentPage={currentPage}
          rowsPerPage={rowsPerPage}
          total={total}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          onRowsPerPageChange={handleRowsPerPageChange}
          emptyMessage="ไม่พบข้อมูลรอบการประเมิน"
          skeletonRows={rowsPerPage}
        />
      )}
    </div>
  )
}

export default SetAssessor
