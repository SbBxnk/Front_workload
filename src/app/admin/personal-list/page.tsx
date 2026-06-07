'use client'

import { useEffect } from 'react'
import { Plus, FileText } from 'lucide-react'
import { FiFilter } from 'react-icons/fi'
import { LuDelete } from 'react-icons/lu'
import { useRouter } from 'next/navigation'

import type { Personal } from '@/Types'
import Table from '@/components/Table'
import useUtility from '@/hooks/useUtility'
import { useUserList } from './_partial/useUserList'
import { useUserMutations } from './_partial/useUserMutations'
import { getUserColumns } from './_partial/userColumns'
import DeletePersonalModal from './_partial/DeletePersonalModal'
import UpdatePersonalModal from './_partial/UpdatePersonalModal'
import FilterDialog from './_partial/FilterDialog'

const ROWS_PER_PAGE_OPTIONS = [10, 20, 50, 100, 200]

// เปิด daisyui modal ผ่าน checkbox id
const openModal = (id: string) => {
  const el = document.getElementById(id) as HTMLInputElement | null
  if (el) el.checked = true
}

export default function PersonalListPage() {
  const router = useRouter()
  const { setBreadcrumbs } = useUtility()
  const list = useUserList()
  const { deleteUser, updateUser, exportUsersToExcel } = useUserMutations()

  useEffect(() => {
    setBreadcrumbs([{ text: 'รายชื่อบุคลากร', path: '/admin/personal-list' }])
  }, [setBreadcrumbs])

  const columns = getUserColumns({
    page: list.params.page ?? 1,
    rowsPerPage: list.params.limit ?? 10,
    onEdit: (row) =>
      router.push(`/admin/personal-list/${row.u_id}/edit-personal`),
    onDelete: (row) => openModal(`modal-delete${row.u_id}`),
  })

  // ป้ายชื่อตัวเลือกที่เลือกอยู่ใน dialog (อิงค่า temp)
  const tempPositionLabel =
    list.tempFilters.position_name || 'เลือกตำแหน่งวิชาการ'
  const tempBranchLabel = list.tempFilters.branch_name || 'เลือกสาขา'
  const tempCourseLabel = list.tempFilters.course_name || 'เลือกหลักสูตร'
  const tempExPositionLabel =
    list.tempFilters.ex_position_name || 'เลือกตำแหน่งบริหาร'
  const tempGenderLabel = list.tempFilters.gender || 'เลือกเพศ'

  return (
    <div className="rounded-md bg-white p-4 shadow transition-all duration-300 ease-in-out dark:bg-zinc-900 dark:text-gray-400">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-4">
        {list.isLoading ? (
          <div className="skeleton h-7 w-16 rounded-md" />
        ) : (
          <div className="w-auto rounded-md bg-gray-200 px-2 py-1 text-sm font-normal text-business1 dark:bg-zinc-800 dark:text-blue-500">
            {list.total} รายการ
          </div>
        )}

        <div className="flex flex-wrap items-center justify-end gap-4">
          <div className="flex items-center gap-4">
            <div className="relative flex w-full items-center sm:w-52">
              <input
                className="w-full rounded-md border border-gray-300 px-4 py-2 text-sm font-light text-gray-600 transition-all duration-300 ease-in-out focus:border-blue-500 focus:outline-none dark:border-zinc-600 dark:bg-zinc-800 dark:text-gray-400"
                placeholder="ค้นหาชื่อ, สาขา, หลักสูตร, เลขบัตร, อีเมล"
                value={list.searchInput}
                onChange={(e) => list.handleSearchChange(e.target.value)}
              />
              {list.searchInput && (
                <button
                  onClick={() => list.handleSearchChange('')}
                  className="absolute right-3 text-gray-400 transition duration-200 hover:text-red-500"
                >
                  <LuDelete className="h-4 w-4" />
                </button>
              )}
            </div>

            <button
              onClick={list.openFilterDialog}
              className="relative flex items-center gap-2 rounded-md border border-business1 px-4 py-2 text-sm font-light text-business1 transition duration-300 ease-in-out hover:bg-business1 hover:text-white dark:border-blue-400 dark:text-blue-400 dark:hover:bg-blue-400"
            >
              <FiFilter className="h-4 w-4" />
              ตัวกรอง
              {list.activeFiltersCount > 0 && (
                <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                  {list.activeFiltersCount}
                </span>
              )}
            </button>

            <button
              onClick={list.clearAllFilters}
              className="flex items-center gap-2 rounded-md border border-red-500 px-4 py-2 text-sm font-light text-red-500 transition duration-300 ease-in-out hover:bg-red-500 hover:text-white dark:border-red-400 dark:text-red-400 dark:hover:bg-red-400"
            >
              <LuDelete className="h-4 w-4" />
              ล้างตัวกรอง
            </button>
          </div>

          <button
            onClick={() => exportUsersToExcel(list.params)}
            className="flex items-center gap-2 rounded-md border border-success px-4 py-2 text-sm font-light text-success transition duration-300 ease-in-out hover:bg-success hover:text-white dark:border-success dark:text-success dark:hover:bg-success"
          >
            ส่งออกข้อมูล
            <FileText className="h-4 w-4" />
          </button>
          <button
            onClick={() => router.push('/admin/personal-list/create-personal')}
            className="flex w-full items-center justify-between gap-2 rounded-md bg-success px-4 py-2.5 text-sm font-light text-white transition duration-300 ease-in-out hover:bg-success/80 sm:w-52"
          >
            เพิ่มบุคลากร
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </div>

      <Table
        data={list.users}
        columns={columns}
        loading={list.isLoading}
        total={list.total}
        currentPage={list.params.page ?? 1}
        totalPages={list.totalPages}
        rowsPerPage={list.params.limit ?? 10}
        onPageChange={list.handlePageChange}
        onRowsPerPageChange={list.handleRowsPerPageChange}
        emptyMessage="ไม่พบข้อมูลบุคลากร"
        skeletonRows={list.params.limit ?? 10}
        stickyColumns={1}
        sortable
        sortState={list.sortState}
        onSort={list.handleSort}
        rowsPerPageOptions={ROWS_PER_PAGE_OPTIONS}
      />

      <DeletePersonalModal
        currentData={list.users}
        isLoading={list.isLoading}
        handleDeletePost={(e, userId, userName) => {
          e.preventDefault()
          deleteUser.mutate({ userId, userName })
        }}
      />
      <UpdatePersonalModal
        currentData={list.users}
        isLoading={list.isLoading}
        handleUpdatePost={(e, _prefix, _fname, _lname, id) => {
          e.preventDefault()
          const userData = list.users.find((user) => user.u_id === id)
          if (userData) {
            updateUser.mutate({ userId: id, data: userData as Partial<Personal> })
          }
        }}
      />

      <FilterDialog
        isOpen={list.isFilterDialogOpen}
        onClose={list.closeFilterDialog}
        positions={list.positions}
        branchs={list.branches}
        courses={list.courses}
        exPositions={list.exPositions}
        selectedPositionLabel={tempPositionLabel}
        selectedBranchLabel={tempBranchLabel}
        selectedCourseLabel={tempCourseLabel}
        selectedExPositionLabel={tempExPositionLabel}
        selectedGenderLabel={tempGenderLabel}
        onPositionSelect={(v) => list.setTempFilter('position_name', v)}
        onBranchSelect={(v) => list.setTempFilter('branch_name', v)}
        onCourseSelect={(v) => list.setTempFilter('course_name', v)}
        onExPositionSelect={(v) => list.setTempFilter('ex_position_name', v)}
        onGenderSelect={(v) => list.setTempFilter('gender', v)}
        onApplyFilters={list.applyFilters}
      />
    </div>
  )
}
