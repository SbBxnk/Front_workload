'use client'

import { FiX } from 'react-icons/fi'
import { Plus } from 'lucide-react'
import SearchFilter from '@/components/SearchFilter'
import Table from '@/components/Table'
import Swal from 'sweetalert2'
import AddAssessorModal from './_partial/AddAssessorModal'
import DeleteAssessorModal from './_partial/DeleteAssessorModal'
import { getAssessorColumns } from './_partial/assessorColumns'
import { useAssignAssessor } from './_partial/useAssignAssessor'

export default function AsDetailsPage() {
  const {
    round_list_id,
    assessors,
    expositons,
    loading,
    error,
    searchName,
    selectedAssessor,
    total,
    rowsPerPage,
    page,
    selectedSetAssesInfoId,
    setSelectedSetAssesInfoId,
    FormData,
    setFormData,
    sortState,
    hasAvailableExaminers,
    isCheckingExaminers,
    assesseeInfo,
    params,
    searchInput,
    setSearchInput,
    fetchAssessorData,
    checkAvailableExaminers,
    clearSearch,
    handlePageChange,
    handleSort,
    handleRowsPerPageChange,
    handleAssessorSelect,
    handleSubmit,
    handleDelete,
  } = useAssignAssessor()

  // Server-side filtering is now handled by the API
  const filteredAssessors = assessors

  const assessorOptions = expositons.map((expositon) => ({
    ex_position_name: expositon.ex_position_name,
    label: `${expositon.ex_position_name}`,
  }))

  // Define table columns
  const columns = getAssessorColumns({
    page,
    rowsPerPage,
    setSelectedSetAssesInfoId,
  })

  return (
    <div className="rounded-md bg-white p-4 shadow transition-all duration-300 ease-in-out dark:bg-zinc-900 dark:text-gray-400">
      <div className="pb-4">
        <h1 className="text-xl text-gray-500">
          รายชื่อผู้ประเมินภาระงานของ{' '}
          <span className="text-business1">
            {assesseeInfo ? `${assesseeInfo.prefix_name}${assesseeInfo.u_fname} ${assesseeInfo.u_lname}` : '-'}
          </span>
        </h1>
      </div>
      <div className="mb-4 flex items-end justify-between">
        <div className="flex w-full flex-wrap items-end gap-4 md:w-auto">
          {loading ? (
            <div className="skeleton h-7 w-16 rounded-md"></div>
          ) : (
            <div className="w-auto rounded-md bg-gray-200 px-2 py-1 text-sm font-normal text-business1 dark:text-gray-400">
              {filteredAssessors.length} รายการ
            </div>
          )}
        </div>
        <div className="flex items-center justify-end gap-4">
          <div className="relative flex w-full items-center md:w-52">
            <input
              className="w-full rounded-md border border-gray-300 px-4 py-2 text-sm font-light text-gray-600 transition-all duration-300 ease-in-out focus:border-blue-500 focus:outline-none dark:border-zinc-600 dark:bg-zinc-800 dark:text-gray-400"
              placeholder="ค้นหาชื่อผู้ประเมิน"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
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
          <SearchFilter
            key={`exposition-${selectedAssessor}`}
            selectedLabel={selectedAssessor}
            handleSelect={handleAssessorSelect}
            objects={assessorOptions || []}
            valueKey="ex_position_name"
            labelKey="label"
            placeholder={assessorOptions && assessorOptions.length > 0 ? "เลือกตำแหน่งบริหาร" : "กำลังโหลด..."}
          />
          <div className="w-full pt-4 md:w-auto md:pt-0">
            <label
              htmlFor={hasAvailableExaminers && !isCheckingExaminers ? "modal-create" : undefined}
              className={`flex w-full items-center justify-between gap-2 rounded-md px-4 py-2.5 text-sm font-light transition duration-300 ease-in-out md:w-52 ${
                hasAvailableExaminers && !isCheckingExaminers
                  ? "cursor-pointer bg-success text-white hover:bg-success/80"
                  : "cursor-default bg-gray-200 text-gray-400"
              }`}
              title={
                isCheckingExaminers
                  ? "กำลังตรวจสอบ..."
                  : hasAvailableExaminers
                    ? "เพิ่มผู้ประเมิน"
                    : "ไม่มีผู้ประเมินที่สามารถเพิ่มได้"
              }
            >
              {isCheckingExaminers ? "เพิ่มผู้ประเมิน" : "เพิ่มผู้ประเมิน"}
              <Plus className="h-4 w-4" />
            </label>
          </div>
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
                  onClick={() => fetchAssessorData(
                    params.search || '',
                    params.limit,
                    params.page,
                    params.sort || '',
                    params.order || '',
                    params.ex_position_name || ''
                  )}
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
          data={filteredAssessors}
          columns={columns}
          loading={loading}
          total={total}
          currentPage={page + 1}
          totalPages={Math.ceil(total / rowsPerPage)}
          rowsPerPage={rowsPerPage}
          onPageChange={(newPage) => handlePageChange(newPage - 1)}
          onRowsPerPageChange={handleRowsPerPageChange}
          emptyMessage={'ไม่พบข้อมูลผู้ประเมิน'}
          skeletonRows={rowsPerPage}
          stickyColumns={1}
          sortable={true}
          sortState={sortState}
          onSort={handleSort}
          rowsPerPageOptions={[10, 20, 50, 100, 200]}
        />
      )}

      <AddAssessorModal
        isLoading={loading}
        handleSubmit={handleSubmit}
        formData={FormData}
        setFormData={setFormData}
        expositons={expositons}
        round_list_id={round_list_id}
        onSuccess={() => {
          // Refresh the assessors list after successful addition
          fetchAssessorData(
            searchName,
            rowsPerPage,
            page,
            sortState.column || 'date_save',
            sortState.order || 'desc',
            ''
          )

          // Check available examiners after successful addition
          checkAvailableExaminers()

          // Show success SweetAlert after modal closes
          Swal.fire({
            position: 'center',
            icon: 'success',
            title: 'สำเร็จ!',
            text: `เพิ่มผู้ประเมิน สำเร็จ!`,
            showConfirmButton: false,
            timer: 1500,
          })
        }}
      />

      <DeleteAssessorModal
        isLoading={loading}
        set_asses_info_id={selectedSetAssesInfoId}
        handleDelete={handleDelete}
      />
    </div>
  )
}
