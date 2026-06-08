import React from 'react'
import { Eye } from 'lucide-react'
import { TableColumn } from '@/components/Table'
import { AuditLog } from './types'

function getMethodBadgeClass(method: AuditLog['method']): string {
    switch (method) {
        case 'POST':
            return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
        case 'PUT':
            return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
        case 'DELETE':
            return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
        default:
            return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
    }
}

export function getAuditLogColumns(
    page: number,
    rowsPerPage: number,
    onViewDetail: (row: AuditLog) => void
): TableColumn<AuditLog>[] {
    return [
        {
            key: 'index',
            label: '#',
            width: '60px',
            align: 'center',
            render: (_, __, index) => (
                <span className="text-sm font-light text-gray-500 dark:text-gray-400">
                    {page * rowsPerPage + index + 1}
                </span>
            ),
        },
        {
            key: 'created_at',
            label: 'วันที่',
            width: '180px',
            render: (val: string) => (
                <span className="text-sm font-light text-gray-500 dark:text-gray-400">
                    {new Date(val).toLocaleDateString('th-TH')}
                </span>
            ),
        },
        {
            key: 'u_fname',
            label: 'ผู้ใช้งาน',
            width: '250px',
            render: (_, row: AuditLog) => (
                <span className="text-sm font-light text-gray-500 dark:text-gray-400">
                    {row.u_fname
                        ? `${row.prefix_name || ''}${row.u_fname} ${row.u_lname}`
                        : 'Guest / System'}
                </span>
            ),
        },
        {
            key: 'method',
            label: 'Method',
            width: '100px',
            align: 'center',
            render: (val: AuditLog['method']) => (
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${getMethodBadgeClass(val)}`}>
                    {val}
                </span>
            ),
        },
        {
            key: 'endpoint',
            label: 'Endpoint',
            render: (val: string) => (
                <code className="text-xs font-mono text-gray-500 dark:text-zinc-500 truncate block max-w-sm">
                    {val}
                </code>
            ),
        },
        {
            key: 'actions',
            label: 'ดูข้อมูล',
            width: '80px',
            align: 'center',
            render: (_, row: AuditLog) => (
                <button
                    onClick={() => onViewDetail(row)}
                    className="p-1.5 rounded-lg text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                >
                    <Eye size={18} />
                </button>
            ),
        },
    ]
}
