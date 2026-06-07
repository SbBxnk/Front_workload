'use client'

import { useEffect } from 'react'
import { Eye } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Table, { type TableColumn } from '@/components/Table'
import SearchFilter from '@/components/SearchFilter'
import type { RoundList } from '@/Types/assessor'
import useUtility from '@/hooks/useUtility'
import { useAssessmentRounds } from './_partial/useAssessmentRounds'
import { formatThaiDate, isCurrentRound } from './_partial/roundHelpers'

function SetAssessor() {
  const { setBreadcrumbs } = useUtility()
  const router = useRouter()
  const list = useAssessmentRounds()

  useEffect(() => {
    setBreadcrumbs([{ text: 'ตรวจประเมินภาระงาน', path: '/admin/assessment' }])
  }, [setBreadcrumbs])

  const handleSetAssessorInfo = (round_list_id: number) => {
    router.push(`/user/assessment/${round_list_id}/form-list`)
  }

  const columns: TableColumn<RoundList>[] = [
    {
      key: 'index',
      label: '#',
      width: '80px',
      align: 'center',
      render: (_, __, index) => (
        <span className="font-regular text-sm text-gray-600 dark:text-gray-300">
          {list.page * list.rowsPerPage + index + 1}
        </span>
      ),
    },
    {
      key: 'round_list_name',
      label: 'รอบการประเมิน',
      align: 'left',
      sortable: true,
      render: (value) => (
        <span className="text-sm font-light text-gray-500 dark:text-gray-400">
          {value || '-'}
        </span>
      ),
    },
    {
      key: 'date_start',
      label: 'วันที่เริ่มต้น',
      align: 'left',
      sortable: true,
      render: (value) => (
        <span className="text-sm font-light text-gray-500 dark:text-gray-400">
          {formatThaiDate(value) || '-'}
        </span>
      ),
    },
    {
      key: 'date_end',
      label: 'วันที่สิ้นสุด',
      align: 'left',
      sortable: true,
      render: (value) => (
        <span className="text-sm font-light text-gray-500 dark:text-gray-400">
          {formatThaiDate(value) || '-'}
        </span>
      ),
    },
    {
      key: 'form_count',
      label: 'จำนวนผู้รับการประเมิน',
      align: 'left',
      sortable: true,
      render: (value) => (
        <span className="text-sm font-light text-gray-500 dark:text-gray-400">
          {value || 0}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'สถานะ',
      align: 'left',
      sortable: true,
      render: (_, record) => (
        <span
          className={`inline-flex rounded-md px-2 py-1 text-xs font-normal ${
            isCurrentRound(record.date_start, record.date_end)
              ? 'bg-blue-500 text-white'
              : 'bg-gray-200 text-gray-500'
          }`}
        >
          {isCurrentRound(record.date_start, record.date_end)
            ? 'กำลังดำเนินการ'
            : 'สิ้นสุดการดำเนินการ'}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'จัดการ',
      width: 'auto',
      align: 'center',
      render: (_, record) => (
        <div className="flex w-full justify-center gap-2 p-0">
          <button
            type="button"
            className="cursor-pointer rounded-md p-1 text-blue-500 transition duration-300 ease-in-out hover:bg-blue-500 hover:text-white"
            onClick={() => handleSetAssessorInfo(record.round_list_id)}
          >
            <Eye className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ]

  return (
    <div className="rounded-md bg-white p-4 shadow transition-all duration-300 ease-in-out dark:bg-zinc-900 dark:text-gray-400">
      <div className="mb-4 flex items-end justify-between">
        <div className="flex w-full flex-wrap items-end gap-4 md:w-auto">
          {list.isLoading ? (
            <div className="skeleton h-7 w-16 rounded-md"></div>
          ) : (
            <div className="w-auto rounded-md bg-gray-200 px-2 py-1 text-sm font-normal text-business1 dark:bg-zinc-800 dark:text-blue-500">
              {list.total} รายการ
            </div>
          )}
        </div>
        <div className="flex items-center justify-end gap-4">
          <div className="relative flex w-full items-center md:w-52">
            <input
              className="w-full rounded-md border border-gray-300 px-4 py-2 text-sm font-light text-gray-600 transition-all duration-300 ease-in-out focus:border-blue-500 focus:outline-none dark:border-zinc-600 dark:bg-zinc-800 dark:text-gray-400"
              placeholder="ค้นหารอบการประเมินภาระงาน"
              value={list.searchInput}
              onChange={(e) => list.handleSearchChange(e.target.value)}
            />
          </div>
          <SearchFilter<RoundList, 'year'>
            selectedLabel={list.selectedLabel}
            handleSelect={list.handleYearSelect}
            objects={list.years.map((year) => ({
              year,
              round_list_id: 0,
              round_list_name: '',
              date_start: '',
              date_end: '',
              round: 0,
              form_count: 0,
            }))}
            valueKey="year"
            labelKey="year"
            placeholder="ค้นหาปีรอบการประเมิน"
          />
        </div>
      </div>

      {!list.error && (
        <Table
          data={list.rounds}
          columns={columns}
          loading={list.isLoading}
          sortState={list.sortState}
          onSort={list.handleSort}
          currentPage={list.page}
          rowsPerPage={list.rowsPerPage}
          total={list.total}
          totalPages={list.totalPages}
          onPageChange={list.handlePageChange}
          onRowsPerPageChange={list.handleRowsPerPageChange}
          emptyMessage="ไม่พบข้อมูลรอบการประเมิน"
          skeletonRows={list.rowsPerPage}
        />
      )}
    </div>
  )
}

export default SetAssessor
