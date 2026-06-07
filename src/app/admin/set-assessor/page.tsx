'use client'

import { useEffect, useState } from 'react'
import { Plus } from 'lucide-react'
import { FiX } from 'react-icons/fi'
import { useRouter } from 'next/navigation'

import type { RoundList } from '@/Types/setAssessor'
import Table from '@/components/Table'
import SearchFilter from '@/components/SearchFilter'
import useUtility from '@/hooks/useUtility'
import { useRoundList } from './_partial/useRoundList'
import { useRoundMutations } from './_partial/useRoundMutations'
import { getRoundColumns } from './_partial/roundColumns'
import CreateRoundModal from './_partial/CreateRoundModal'
import EditRoundModal from './_partial/EditRoundModal'
import DeleteRoundModal from './_partial/DeleteRoundModal'

// เปิด daisyui modal ผ่าน checkbox id
const openModal = (id: string) => {
  const el = document.getElementById(id) as HTMLInputElement | null
  if (el) el.checked = true
}

export default function SetAssessorPage() {
  const router = useRouter()
  const { setBreadcrumbs } = useUtility()
  const list = useRoundList()
  const { createRound, updateRound, deleteRound } = useRoundMutations()
  const [selected, setSelected] = useState<RoundList | null>(null)

  useEffect(() => {
    setBreadcrumbs([
      { text: 'รอบประเมินภาระงาน', path: '/admin/set-assessor' },
    ])
  }, [setBreadcrumbs])

  const columns = getRoundColumns({
    page: list.params.page,
    rowsPerPage: list.params.limit,
    onEdit: (row) => {
      setSelected(row)
      openModal('modal-edit')
    },
    onDelete: (row) => {
      setSelected(row)
      openModal('modal-delete')
    },
    onView: (roundListId) =>
      router.push(`/admin/set-assessor/${roundListId}`),
    roundsWithAssessorData: list.roundsWithAssessorData,
  })

  // ตัวเลือกปีจากข้อมูลในหน้าปัจจุบัน (คงพฤติกรรมเดิม)
  const uniqueYears = Array.from(new Set(list.rounds.map((r) => r.year)))
  const selectedLabel =
    list.rounds.find((r) => r.year === list.params.year)?.year ||
    'เลือกรอบการประเมิน'

  return (
    <div className="rounded-md bg-white p-4 shadow transition-all duration-300 ease-in-out dark:bg-zinc-900 dark:text-gray-400">
      <div className="mb-4 flex items-end justify-between">
        <div className="flex w-full flex-wrap items-end gap-4 md:w-auto">
          {list.isLoading ? (
            <div className="skeleton h-7 w-16 rounded-md" />
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
            {list.searchInput && (
              <button
                onClick={list.clearSearch}
                className="absolute right-3 text-gray-400 transition duration-200 hover:text-red-500"
              >
                <FiX className="h-4 w-4" />
              </button>
            )}
          </div>
          <SearchFilter<RoundList, 'year'>
            selectedLabel={selectedLabel}
            handleSelect={list.handleYearChange}
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
          <div className="w-full pt-4 md:w-auto md:pt-0">
            <label
              htmlFor="modal-create"
              className="flex w-full cursor-pointer items-center justify-between gap-2 rounded-md bg-success px-4 py-2.5 text-sm font-light text-white transition duration-300 ease-in-out hover:bg-success/80 md:w-52"
            >
              เพิ่มรอบการประเมิน
              <Plus className="h-4 w-4" />
            </label>
          </div>
        </div>
      </div>

      <Table
        data={list.rounds}
        columns={columns}
        loading={list.isLoading}
        total={list.total}
        currentPage={list.params.page}
        totalPages={list.totalPages}
        rowsPerPage={list.params.limit}
        onPageChange={list.handlePageChange}
        onRowsPerPageChange={list.handleRowsPerPageChange}
        emptyMessage="ไม่พบข้อมูลรอบการประเมิน"
        skeletonRows={list.params.limit}
        sortState={list.sortState}
        onSort={list.handleSort}
      />

      <CreateRoundModal
        onSubmit={(data) => createRound.mutate(data)}
      />
      <EditRoundModal
        roundListId={selected?.round_list_id ?? 0}
        onSubmit={(roundListId, data) =>
          updateRound.mutate({ roundListId, data })
        }
      />
      <DeleteRoundModal
        round={selected}
        onConfirm={(roundListId, roundName) =>
          deleteRound.mutate({ roundListId, roundName })
        }
      />
    </div>
  )
}
