import React from 'react'
import type { Form1ItemDraft as ItemDraft, StructuredTask } from './types'

interface Form1TaskRowsProps {
    structuredTasks: StructuredTask[]
    itemMap: Map<number, ItemDraft>
    items: ItemDraft[]
    canEdit: boolean
    baseUrl: string
    handleScoreChange: (snapshotFormId: number, value: string, task: StructuredTask) => void
    handleScoreBlur: (snapshotFormId: number, value: string, task: StructuredTask) => void
    handleScoreWheel: (event: React.WheelEvent<HTMLInputElement>) => void
    handleCommentChange: (snapshotFormId: number, value: string) => void
}

export default function Form1TaskRows({
    structuredTasks,
    itemMap,
    items,
    canEdit,
    baseUrl,
    handleScoreChange,
    handleScoreBlur,
    handleScoreWheel,
    handleCommentChange,
}: Form1TaskRowsProps) {
    if (structuredTasks.length === 0) {
        return (
            <tr>
                <td colSpan={8} className="border border-gray-300 dark:border-gray-700 px-4 py-8 text-center text-gray-500 dark:text-white">
                    กำลังโหลดรายการ...
                </td>
            </tr>
        )
    }

    return (
        <>
            {structuredTasks.map((task) => {
                const totalForTask = task.subtasks.reduce((taskSum, subtask) => {
                    return (
                        taskSum +
                        subtask.form_infos.reduce((formSum, formInfo) => {
                            const quality = Number.isFinite(formInfo.quality) ? Number(formInfo.quality) : 0
                            const workload = Number.isFinite(formInfo.workload) ? Number(formInfo.workload) : 0
                            return formSum + quality * workload
                        }, 0)
                    )
                }, 0)

                const hasAnyForm = task.subtasks.some((st) => st.form_infos.length > 0)

                return (
                    <React.Fragment key={task.task_id}>
                        <tr className="bg-business1 text-white dark:bg-business1 dark:text-white">
                            <td colSpan={8} className="border border-gray-300 dark:border-gray-700 px-4 py-3 font-normal">
                                <div className="flex items-center justify-between">
                                    <span>
                                        {task.task_id}. {task.task_name || 'Unknown Task'} (ภาระงานขั้นต่ำ)
                                    </span>
                                    {task.quantity_workload_hours && (
                                        <span className="text-sm bg-white text-business1 dark:bg-blue-500 dark:text-white px-2 py-1 rounded">
                                            {task.quantity_workload_hours} ภาระงาน/สัปดาห์
                                        </span>
                                    )}
                                </div>
                            </td>
                        </tr>

                        {task.subtasks.map((subtask, subtaskIndex) => (
                            <React.Fragment key={subtask.subtask_id}>
                                <tr className="bg-gray-50 dark:bg-zinc-900">
                                    <td colSpan={8} className="border border-gray-300 dark:border-gray-700 px-4 py-2 text-gray-700 dark:text-white">
                                        <div className="ml-6 flex items-center gap-2">
                                            <span className="text-sm">
                                                {task.task_id}.{subtaskIndex + 1} {subtask.subtask_name || 'Unknown Subtask'}
                                            </span>
                                        </div>
                                    </td>
                                </tr>

                                {(subtask.form_infos.length === 0 ? [null] : subtask.form_infos).map((formInfo, index) => {
                                    if (!formInfo) {
                                        return (
                                            <tr key={`placeholder-${task.task_id}-${subtask.subtask_id}`}>
                                                <td className="border border-gray-300 dark:border-gray-700 px-4 py-2 text-gray-500 dark:text-white text-sm">
                                                    <div className="ml-12 text-sm">-</div>
                                                </td>
                                                <td className="border border-gray-300 dark:border-gray-700 px-4 py-2 text-left text-gray-500 text-sm">-</td>
                                                <td className="border border-gray-300 dark:border-gray-700 px-4 py-2 text-center text-gray-500 text-sm">-</td>
                                                <td className="border border-gray-300 dark:border-gray-700 px-4 py-2 text-center text-gray-500 text-sm">-</td>
                                                <td className="border border-gray-300 dark:border-gray-700 px-4 py-2 text-center text-gray-500 text-sm">-</td>
                                                <td className="border border-gray-300 dark:border-gray-700 px-4 py-2 text-left text-gray-500 text-sm">-</td>
                                                <td className="border border-gray-300 dark:border-gray-700 px-4 py-2 text-center text-gray-500 text-sm">-</td>
                                                <td className="border border-gray-300 dark:border-gray-700 px-4 py-2 text-left text-gray-500 text-sm">-</td>
                                            </tr>
                                        )
                                    }

                                    const draft = itemMap.get(formInfo.snapshot_form_id)
                                    const quality = Number.isFinite(formInfo.quality) ? Number(formInfo.quality) : 0
                                    const workload = Number.isFinite(formInfo.workload) ? Number(formInfo.workload) : 0

                                    return (
                                        <tr key={`${task.task_id}-${subtask.subtask_id}-${formInfo.snapshot_form_id}-${index}`}>
                                            <td className="border border-gray-300 dark:border-gray-700 px-4 py-2 text-gray-800 dark:text-white">
                                                <div className="ml-12 flex flex-col gap-1">
                                                    <div className="font-light text-gray-500 dark:text-white text-sm max-w-[200px]">
                                                        {task.task_id}.{subtaskIndex + 1}.{index + 1} {formInfo.form_title || '-'}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="border border-gray-300 dark:border-gray-700 px-4 py-2 text-left text-blue-600 dark:text-white text-sm max-w-[200px]">
                                                <div className="space-y-1">
                                                    {(() => {
                                                        const combined = [] as Array<
                                                            | { kind: 'file' | 'link'; name: string; path: string }
                                                        >

                                                        if (formInfo.files && formInfo.files.length > 0) {
                                                            formInfo.files.forEach((file) => {
                                                                if (file.file_name) {
                                                                    combined.push({
                                                                        kind: 'file',
                                                                        name: file.file_name,
                                                                        path: file.file_name,
                                                                    })
                                                                }
                                                            })
                                                        }

                                                        if (formInfo.links && formInfo.links.length > 0) {
                                                            formInfo.links.forEach((link) => {
                                                                if (link.link_path) {
                                                                    combined.push({
                                                                        kind: 'link',
                                                                        name: link.link_name || link.link_path,
                                                                        path: link.link_path,
                                                                    })
                                                                }
                                                            })
                                                        }

                                                        if (combined.length === 0) {
                                                            return <span className="text-gray-400">-</span>
                                                        }

                                                        return combined.map((item, index) => (
                                                            <div key={`${formInfo.snapshot_form_id}-${item.kind}-${index}`} className="flex items-start gap-2">
                                                                <span className="text-blue-500">{`${index + 1}.`}</span>
                                                                <button
                                                                    onClick={() => {
                                                                        if (item.kind === 'file') {
                                                                            window.open(`${baseUrl}/files/${item.path}`, '_blank')
                                                                        } else {
                                                                            let url = item.path || ''
                                                                            if (!url.startsWith('http://') && !url.startsWith('https://')) {
                                                                                url = `https://${url}`
                                                                            }
                                                                            window.open(url, '_blank')
                                                                        }
                                                                    }}
                                                                    className="text-left text-sm leading-5 text-blue-600 transition-colors duration-150 hover:text-blue-700 hover:underline"
                                                                    title={item.path}
                                                                >
                                                                    {item.name}
                                                                </button>
                                                            </div>
                                                        ))
                                                    })()}
                                                </div>
                                            </td>
                                            <td className="border border-gray-300 dark:border-gray-700 px-4 py-2 text-center text-sm">
                                                {Number.isFinite(formInfo.quality) ? formInfo.quality : '-'}
                                            </td>
                                            <td className="border border-gray-300 dark:border-gray-700 px-4 py-2 text-center text-sm">
                                                {Number.isFinite(formInfo.workload) ? formInfo.workload : '-'}
                                            </td>
                                            <td className="border border-gray-300 dark:border-gray-700 px-4 py-2 text-center text-sm text-blue-600">
                                                {quality && workload ? quality * workload : '-'}
                                            </td>
                                            <td className="border border-gray-300 dark:border-gray-700 text-gray-500 dark:text-white font-light px-4 py-2 text-left text-sm break-words whitespace-normal max-w-[200px]">
                                                {formInfo.description && formInfo.description !== '-' ? formInfo.description : '-'}
                                            </td>
                                            <td className="border border-gray-300 dark:border-gray-700 px-4 py-2 text-center">
                                                {(() => {
                                                    // Calculate total workload for this task (quantity * workload)
                                                    const totalWorkload = task.subtasks.reduce((taskSum, subtask) => {
                                                        return (
                                                            taskSum +
                                                            subtask.form_infos.reduce((formSum, formInfo) => {
                                                                const q = Number.isFinite(formInfo.quality) ? Number(formInfo.quality) : 0
                                                                const w = Number.isFinite(formInfo.workload) ? Number(formInfo.workload) : 0
                                                                return formSum + q * w
                                                            }, 0)
                                                        )
                                                    }, 0)

                                                    // Calculate current sum of all evaluation scores for this task, excluding the current field
                                                    let sumWithoutCurrent = 0
                                                    task.subtasks.forEach((subtask) => {
                                                        subtask.form_infos.forEach((fi) => {
                                                            if (fi.snapshot_form_id !== formInfo.snapshot_form_id) {
                                                                const item = items.find((i) => i.snapshot_form_id === fi.snapshot_form_id)
                                                                if (item?.score) {
                                                                    const scoreValue = Number(item.score)
                                                                    if (Number.isFinite(scoreValue) && scoreValue >= 0) {
                                                                        sumWithoutCurrent += scoreValue
                                                                    }
                                                                }
                                                            }
                                                        })
                                                    })

                                                    const maxAllowed = Math.max(0, totalWorkload - sumWithoutCurrent)

                                                    return (
                                                        <input
                                                            type="number"
                                                            step="0.1"
                                                            min="0"
                                                            max={maxAllowed}
                                                            value={draft?.score ?? ''}
                                                            onChange={(event) => handleScoreChange(formInfo.snapshot_form_id, event.target.value, task)}
                                                            onBlur={(event) => handleScoreBlur(formInfo.snapshot_form_id, event.target.value, task)}
                                                            onWheel={handleScoreWheel}
                                                            disabled={!canEdit}
                                                            className="w-20 rounded-md border bg-white dark:bg-zinc-900 dark:text-white border-gray-300 dark:border-gray-700 px-3 py-2 text-sm focus:border-business1 focus:outline-none disabled:cursor-default disabled:bg-gray-50 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
                                                            placeholder="0"
                                                        />
                                                    )
                                                })()}
                                            </td>
                                            <td className="border border-gray-300 dark:border-gray-700 px-4 py-2">
                                                <textarea
                                                    value={draft?.comment ?? ''}
                                                    onChange={(event) => handleCommentChange(formInfo.snapshot_form_id, event.target.value)}
                                                    disabled={!canEdit}
                                                    rows={3}
                                                    className="w-full rounded-md border bg-white dark:bg-zinc-900 dark:text-white border-gray-300 dark:border-gray-700 px-3 py-2 text-sm focus:border-business1 focus:outline-none disabled:cursor-default disabled:bg-gray-50"
                                                    placeholder="เพิ่มความคิดเห็น"
                                                />
                                            </td>
                                        </tr>
                                    )
                                })}
                            </React.Fragment>
                        ))}

                        <tr className="bg-gray-50 dark:bg-zinc-900">
                            <td colSpan={4} className="border border-gray-300 dark:border-gray-700 dark:text-white px-4 py-2 text-right text-sm font-light">
                                รวมภาระงาน
                            </td>
                            <td
                                className={`border border-gray-300 dark:border-gray-700 px-4 py-2 text-center text-sm font-semibold ${task.quantity_workload_hours &&
                                    totalForTask < task.quantity_workload_hours
                                    ? 'text-red-500'
                                    : 'text-blue-600'
                                    }`}
                            >
                                {hasAnyForm ? totalForTask : '-'}
                            </td>
                            <td className="border border-gray-300 dark:border-gray-700 px-4 py-2" />
                            <td className="border border-gray-300 dark:border-gray-700 px-4 py-2" />
                            <td className="border border-gray-300 dark:border-gray-700 px-4 py-2" />
                        </tr>
                    </React.Fragment>
                )
            })}
        </>
    )
}
