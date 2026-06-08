'use client'
import React, { useState, useMemo } from 'react'
import { Search } from 'lucide-react'
import { FiX } from 'react-icons/fi'
import Table from '@/components/Table'
import SearchFilter from '@/components/SearchFilter'
import useUtility from '@/hooks/useUtility'
import { useAuditLogs } from './_partial/useAuditLogs'
import { getAuditLogColumns } from './_partial/auditLogColumns'
import DetailModal from './_partial/detailModal'
import { AuditLog } from './_partial/types'

const METHOD_OPTIONS = [
    { label: 'ทุก Method', value: '' },
    { label: 'POST', value: 'POST' },
    { label: 'PUT', value: 'PUT' },
    { label: 'DELETE', value: 'DELETE' },
    { label: 'GET', value: 'GET' },
]

export default function AuditLogsPage() {
    const { setBreadcrumbs } = useUtility()

    const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null)
    const [showDetail, setShowDetail] = useState(false)

    const {
        data,
        loading,
        total,
        page,
        rowsPerPage,
        searchInput,
        methodFilter,
        setSearchInput,
        handleMethodChange,
        handlePageChange,
        handleRowsPerPageChange,
    } = useAuditLogs()

    // Set breadcrumbs once on mount
    React.useEffect(() => {
        setBreadcrumbs([{ text: 'Audit Logs', path: '/admin/audit-logs' }])
    }, [setBreadcrumbs])

    const handleViewDetail = (row: AuditLog) => {
        setSelectedLog(row)
        setShowDetail(true)
    }

    const columns = useMemo(
        () => getAuditLogColumns(page, rowsPerPage, handleViewDetail),
        [page, rowsPerPage]
    )

    return (
        <div className="rounded-md bg-white p-4 shadow transition-all duration-300 ease-in-out dark:bg-zinc-900 dark:text-gray-400">
            <div className="mb-4 flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div className="flex w-full flex-wrap items-end gap-4 md:w-auto">
                    {loading ? (
                        <div className="h-7 w-16 animate-pulse rounded-md bg-gray-200 dark:bg-zinc-800" />
                    ) : (
                        <div className="w-auto rounded-md bg-gray-200 px-2 py-1 text-sm font-normal text-business1 dark:text-blue-500 dark:bg-zinc-800">
                            {total} รายการ
                        </div>
                    )}
                </div>

                <div className="flex items-center justify-end gap-4">
                    <SearchFilter<{ label: string; value: string }, 'label' | 'value'>
                        selectedLabel={methodFilter}
                        handleSelect={handleMethodChange}
                        objects={METHOD_OPTIONS}
                        valueKey="value"
                        labelKey="label"
                        placeholder="เลือก Method"
                    />

                    <div className="relative flex w-full items-center md:w-52 h-[40px]">
                        <input
                            type="text"
                            placeholder="ค้นหาชื่อผู้ใช้งาน..."
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            className="w-full pl-4 pr-10 py-2 bg-white dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded-md text-sm font-light text-gray-600 dark:text-gray-400 focus:border-blue-500 focus:outline-none transition-all duration-300"
                        />
                        {searchInput ? (
                            <button
                                onClick={() => setSearchInput('')}
                                className="absolute right-3 text-gray-400 transition duration-200 hover:text-red-500"
                            >
                                <FiX size={14} />
                            </button>
                        ) : (
                            <Search size={14} className="absolute right-3 text-gray-400" />
                        )}
                    </div>
                </div>
            </div>

            <Table<AuditLog>
                data={data}
                columns={columns}
                loading={loading}
                total={total}
                currentPage={page + 1}
                totalPages={Math.ceil(total / rowsPerPage)}
                rowsPerPage={rowsPerPage}
                onPageChange={handlePageChange}
                onRowsPerPageChange={handleRowsPerPageChange}
                emptyMessage="ไม่มีประวัติการใช้งานที่คุณค้นหา"
                skeletonRows={rowsPerPage}
            />

            {showDetail && selectedLog && (
                <DetailModal
                    log={selectedLog}
                    onClose={() => setShowDetail(false)}
                />
            )}
        </div>
    )
}
