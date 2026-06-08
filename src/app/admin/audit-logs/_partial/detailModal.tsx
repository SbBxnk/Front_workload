'use client'
import React from 'react'
import { FiX } from 'react-icons/fi'
import { AuditLog } from './types'

interface DetailModalProps {
    log: AuditLog
    onClose: () => void
}

function formatPayload(payload: string | undefined): string {
    if (!payload) return ''
    try {
        return JSON.stringify(JSON.parse(payload), null, 2)
    } catch {
        return payload
    }
}

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

const DetailModal: React.FC<DetailModalProps> = ({ log, onClose }) => {
    if (!log) return null

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="relative w-full max-w-2xl bg-white dark:bg-zinc-900 rounded-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b dark:border-zinc-800">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                        รายละเอียด Audit Log
                    </h3>
                    <button
                        onClick={onClose}
                        className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-400 dark:text-zinc-500 transition-colors"
                    >
                        <FiX size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 max-h-[70vh] overflow-y-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div>
                            <label className="text-xs font-medium text-gray-400 dark:text-zinc-500 uppercase tracking-wider">
                                วัน-เวลา
                            </label>
                            <div className="mt-1 text-sm text-gray-700 dark:text-gray-300">
                                {new Date(log.created_at).toLocaleString('th-TH')}
                            </div>
                        </div>
                        <div>
                            <label className="text-xs font-medium text-gray-400 dark:text-zinc-500 uppercase tracking-wider">
                                ผู้กระทำหน่วย
                            </label>
                            <div className="mt-1 text-sm text-gray-700 dark:text-gray-300">
                                {log.u_fname ? `${log.u_fname} ${log.u_lname}` : 'Guest / System'}
                            </div>
                        </div>
                        <div>
                            <label className="text-xs font-medium text-gray-400 dark:text-zinc-500 uppercase tracking-wider">
                                Method / Endpoint
                            </label>
                            <div className="mt-1 text-sm font-mono flex items-center gap-2">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${getMethodBadgeClass(log.method)}`}>
                                    {log.method}
                                </span>
                                <span className="text-gray-600 dark:text-gray-400 truncate">{log.endpoint}</span>
                            </div>
                        </div>
                        <div>
                            <label className="text-xs font-medium text-gray-400 dark:text-zinc-500 uppercase tracking-wider">
                                IP Address
                            </label>
                            <div className="mt-1 text-sm text-gray-700 dark:text-gray-300">
                                {log.ip_address || '-'}
                            </div>
                        </div>
                    </div>

                    <div className="mb-6">
                        <label className="text-xs font-medium text-gray-400 dark:text-zinc-500 uppercase tracking-wider">
                            การกระทำ
                        </label>
                        <div className="mt-1 text-sm text-gray-700 dark:text-gray-300 italic">
                            {log.action}
                        </div>
                    </div>

                    <div>
                        <label className="text-xs font-medium text-gray-400 dark:text-zinc-500 uppercase tracking-wider">
                            Data Payload (JSON)
                        </label>
                        <div className="mt-2 p-4 bg-gray-50 dark:bg-zinc-800/50 rounded-lg border dark:border-zinc-800">
                            <pre className="text-[12px] font-mono text-gray-600 dark:text-gray-400 whitespace-pre-wrap break-all leading-relaxed">
                                {formatPayload(log.payload)}
                            </pre>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="bg-gray-50 dark:bg-zinc-800/50 p-4 border-t dark:border-zinc-800 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-gray-200 dark:bg-zinc-800 text-gray-600 dark:text-gray-300 text-sm font-medium rounded-lg hover:bg-gray-300 dark:hover:bg-zinc-700 transition-colors"
                    >
                        ปิดหน้าต่าง
                    </button>
                </div>
            </div>
        </div>
    )
}

export default DetailModal
