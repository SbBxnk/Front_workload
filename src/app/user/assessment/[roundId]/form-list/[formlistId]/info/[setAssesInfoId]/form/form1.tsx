'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Swal from 'sweetalert2'
import { Loader2 } from 'lucide-react'
import StickyFooter from '@/components/StickyFooter'
import WorkloadEvaluationService, {
    type EvaluationPayload,
    type EvaluationItem,
    type SnapshotRow,
} from '@/services/workloadEvaluationService'
import React from 'react'
import ConfirmSubmitEvaluationModal from '../partial/confirmSubmitEvaluationModal'

interface ItemDraft {
    snapshot_form_id: number
    score: string
    comment: string
}

interface StructuredSubtask {
    subtask_id: number
    subtask_name: string
    form_infos: SnapshotRow[]
}

interface StructuredTask {
    task_id: number
    task_name: string
    quantity_workload_hours: number | null | undefined
    subtasks: StructuredSubtask[]
}

const formatThaiDateTime = (date?: Date | null) => {
    if (!date) return '-'
    return date.toLocaleString('th-TH', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    })
}

interface Component1ContentProps {
    formlistIdParam: string
    setAssesInfoIdParam: string
    accessToken: string
}

export default function Component1Content({
    formlistIdParam,
    setAssesInfoIdParam,
    accessToken,
}: Component1ContentProps) {
    const baseUrl = process.env.NEXT_PUBLIC_API?.replace('/api', '') || 'http://localhost:3333'

    const [isLoading, setIsLoading] = useState(true)
    const [snapshotRows, setSnapshotRows] = useState<SnapshotRow[]>([])
    const [evaluation, setEvaluation] = useState<EvaluationPayload | null>(null)
    const [items, setItems] = useState<ItemDraft[]>([])
    const [generalComment, setGeneralComment] = useState<string>('')
    const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const [dirty, setDirty] = useState(false)
    const isInitializing = useRef(true)
    const [showConfirmModal, setShowConfirmModal] = useState(false)
    const fetchAbortController = useRef<AbortController | null>(null)
    const fetchKeyRef = useRef<string>('')
    const isFetchingRef = useRef(false)

    const canEdit = evaluation?.status !== 1
    const evaluationId = evaluation?.evaluation_id ?? null

    const workloadGroupDisplay = useMemo(() => {
        return snapshotRows[0]?.workload_group_name ?? '-'
    }, [snapshotRows])

    const formatScoreValue = useCallback((value: number): string => {
        if (!Number.isFinite(value)) {
            return ''
        }

        if (Number.isInteger(value)) {
            return `${value}`
        }

        return `${value}`.replace(/(\.\d*?[1-9])0+$|\.0+$/, '$1')
    }, [])

    const getDefaultScoreFromSnapshot = useCallback(
        (snapshotFormId: number): number | null => {
            const snapshot = snapshotRows.find((row) => row.snapshot_form_id === snapshotFormId)
            if (!snapshot) {
                return null
            }

            const workload = Number(snapshot.workload ?? 0)
            const quality = Number(snapshot.quality ?? 0)

            if (!Number.isFinite(workload) || !Number.isFinite(quality)) {
                return null
            }

            return workload * quality
        },
        [snapshotRows]
    )

    const fetchData = useCallback(async () => {
        if (!accessToken || !formlistIdParam || !setAssesInfoIdParam) {
            return
        }

        const currentFetchKey = `${formlistIdParam}-${setAssesInfoIdParam}-${accessToken}`
        if (fetchKeyRef.current === currentFetchKey || isFetchingRef.current) {
            return
        }
        if (fetchAbortController.current) {
            fetchAbortController.current.abort()
        }
        fetchAbortController.current = new AbortController()
        fetchKeyRef.current = currentFetchKey
        isFetchingRef.current = true

        setIsLoading(true)

        try {
            const data = await WorkloadEvaluationService.getEvaluation(
                accessToken,
                Number(formlistIdParam),
                Number(setAssesInfoIdParam)
            )

            const evaluationPayload = Array.isArray(data) ? data[0] : data

            setEvaluation(evaluationPayload.evaluation)
            const snapshotItems: SnapshotRow[] = Array.isArray(evaluationPayload.snapshot)
                ? evaluationPayload.snapshot
                : []
            setSnapshotRows(snapshotItems)

            const evaluationItems: EvaluationItem[] = Array.isArray(evaluationPayload.evaluation.items)
                ? evaluationPayload.evaluation.items
                : []

            const mergedItems: ItemDraft[] = snapshotItems.map((row: SnapshotRow) => {
                const existing = evaluationItems.find((item) => item.snapshot_form_id === row.snapshot_form_id)

                const rawScore = existing?.score as number | string | null | undefined
                let existingScore: number | null = null
                if (typeof rawScore === 'number') {
                    existingScore = Number.isFinite(rawScore) ? rawScore : null
                } else if (typeof rawScore === 'string') {
                    const trimmed = rawScore.trim()
                    existingScore = trimmed === '' ? null : Number(trimmed)
                    if (!Number.isFinite(existingScore)) {
                        existingScore = null
                    }
                }
                
                // Calculate fallback score directly
                let fallbackScore: number | null = existingScore
                if (fallbackScore == null) {
                    const workload = Number(row.workload ?? 0)
                    const quality = Number(row.quality ?? 0)
                    if (Number.isFinite(workload) && Number.isFinite(quality)) {
                        fallbackScore = workload * quality
                    } else {
                        fallbackScore = null
                    }
                }

                // Format score value
                let scoreString = ''
                if (fallbackScore != null && Number.isFinite(fallbackScore)) {
                    if (Number.isInteger(fallbackScore)) {
                        scoreString = `${fallbackScore}`
                    } else {
                        scoreString = `${fallbackScore}`.replace(/(\.\d*?[1-9])0+$|\.0+$/, '$1')
                    }
                }

                return {
                    snapshot_form_id: row.snapshot_form_id,
                    score: scoreString,
                    comment: existing?.comment ?? '',
                }
            })

            setGeneralComment(evaluationPayload.evaluation.comment ?? '')
            setItems(mergedItems)
            setDirty(false)
            isInitializing.current = false
        } catch (err) {
            // Reset fetch key and flag on error so it can retry
            const currentFetchKey = `${formlistIdParam}-${setAssesInfoIdParam}-${accessToken}`
            if (fetchKeyRef.current === currentFetchKey) {
                fetchKeyRef.current = ''
            }
            isFetchingRef.current = false
            console.error('Error loading evaluation:', err)
        } finally {
            setIsLoading(false)
            isFetchingRef.current = false
        }
    }, [accessToken, formlistIdParam, setAssesInfoIdParam])

    useEffect(() => {
        if (!formlistIdParam || !setAssesInfoIdParam || !accessToken) {
            setIsLoading(false)
            return
        }

        // Create unique key for this fetch request
        const currentFetchKey = `${formlistIdParam}-${setAssesInfoIdParam}-${accessToken}`
        
        // Only fetch if the key has changed (new params or remount)
        if (fetchKeyRef.current !== currentFetchKey) {
            void fetchData()
        }

        // Cleanup function to cancel request if component unmounts
        return () => {
            if (fetchAbortController.current) {
                fetchAbortController.current.abort()
            }
            isFetchingRef.current = false
        }
    }, [formlistIdParam, setAssesInfoIdParam, accessToken, fetchData])

    const saveDraft = useCallback(
        async (options?: { force?: boolean }) => {
            if (!accessToken || !evaluation) {
                return false
            }

            if (!options?.force && (!dirty || evaluation.status === 1)) {
                return false
            }

            try {
                setIsSaving(true)

                const payload = {
                    comment: generalComment || null,
                    items: items.map((item) => ({
                        snapshot_form_id: item.snapshot_form_id,
                        score: item.score.trim() === '' ? null : Number(item.score),
                        comment: item.comment ? item.comment : null,
                    })),
                }

                await WorkloadEvaluationService.saveDraft(
                    accessToken,
                    evaluation.evaluation_id,
                    payload
                )

                setDirty(false)
                setLastSavedAt(new Date())

                if (options?.force) {
                    await new Promise((resolve) => setTimeout(resolve, 150))
                }

                return true
            } catch (err) {
                console.error('Error saving draft:', err)
                return false
            } finally {
                setIsSaving(false)
            }
        },
        [accessToken, evaluation, items, generalComment, dirty]
    )

    const getCurrentEvaluationSumForTask = useCallback((task: StructuredTask): number => {
        let sum = 0
        task.subtasks.forEach((subtask) => {
            subtask.form_infos.forEach((formInfo) => {
                const item = items.find((i) => i.snapshot_form_id === formInfo.snapshot_form_id)
                if (item?.score) {
                    const scoreValue = Number(item.score)
                    if (Number.isFinite(scoreValue)) {
                        sum += scoreValue
                    }
                }
            })
        })
        return sum
    }, [items])

    const handleScoreChange = (snapshotFormId: number, value: string, task: StructuredTask) => {
        if (!canEdit) return

        let sanitized = value.replace(/[^0-9.]/g, '')
        const firstDotIndex = sanitized.indexOf('.')
        if (firstDotIndex !== -1) {
            const before = sanitized.slice(0, firstDotIndex + 1)
            const after = sanitized.slice(firstDotIndex + 1).replace(/\./g, '')
            sanitized = `${before}${after}`
        }

        // Calculate total workload for this task (quantity * workload)
        const totalWorkload = task.subtasks.reduce((taskSum, subtask) => {
            return (
                taskSum +
                subtask.form_infos.reduce((formSum, formInfo) => {
                    const quality = Number.isFinite(formInfo.quality) ? Number(formInfo.quality) : 0
                    const workload = Number.isFinite(formInfo.workload) ? Number(formInfo.workload) : 0
                    return formSum + quality * workload
                }, 0)
            )
        }, 0)

        // Calculate current sum of all evaluation scores for this task, excluding the field being edited
        let sumWithoutCurrent = 0
        task.subtasks.forEach((subtask) => {
            subtask.form_infos.forEach((formInfo) => {
                if (formInfo.snapshot_form_id !== snapshotFormId) {
                    const item = items.find((i) => i.snapshot_form_id === formInfo.snapshot_form_id)
                    if (item?.score) {
                        const scoreValue = Number(item.score)
                        if (Number.isFinite(scoreValue) && scoreValue >= 0) {
                            sumWithoutCurrent += scoreValue
                        }
                    }
                }
            })
        })

        // Calculate max allowed value
        const maxAllowed = Math.max(0, totalWorkload - sumWithoutCurrent)

        // Parse the new value
        let newValue: number
        if (sanitized === '' || sanitized === '.') {
            newValue = 0
        } else {
            newValue = Number(sanitized)
        }

        // Validate: new total should not exceed total workload
        if (Number.isFinite(newValue) && newValue >= 0) {
            if (newValue > maxAllowed) {
                // Limit to maximum allowed value
                sanitized = formatScoreValue(maxAllowed)
            }
        } else if (sanitized !== '' && sanitized !== '-') {
            // If invalid number, keep only valid part or empty
            sanitized = ''
        }

        setItems((prev) =>
            prev.map((item) =>
                item.snapshot_form_id === snapshotFormId
                    ? { ...item, score: sanitized }
                    : item
            )
        )
        setDirty(true)
    }

    const handleScoreBlur = (snapshotFormId: number, value: string, task: StructuredTask) => {
        if (!canEdit) return

        // Calculate total workload for this task (quantity * workload)
        const totalWorkload = task.subtasks.reduce((taskSum, subtask) => {
            return (
                taskSum +
                subtask.form_infos.reduce((formSum, formInfo) => {
                    const quality = Number.isFinite(formInfo.quality) ? Number(formInfo.quality) : 0
                    const workload = Number.isFinite(formInfo.workload) ? Number(formInfo.workload) : 0
                    return formSum + quality * workload
                }, 0)
            )
        }, 0)

        // Calculate current sum of all evaluation scores for this task, excluding the field being edited
        let sumWithoutCurrent = 0
        task.subtasks.forEach((subtask) => {
            subtask.form_infos.forEach((formInfo) => {
                if (formInfo.snapshot_form_id !== snapshotFormId) {
                    const item = items.find((i) => i.snapshot_form_id === formInfo.snapshot_form_id)
                    if (item?.score) {
                        const scoreValue = Number(item.score)
                        if (Number.isFinite(scoreValue) && scoreValue >= 0) {
                            sumWithoutCurrent += scoreValue
                        }
                    }
                }
            })
        })

        // Calculate max allowed value
        const maxAllowed = Math.max(0, totalWorkload - sumWithoutCurrent)

        // Parse the current value
        const currentValue = value === '' ? 0 : Number(value)

        // If value exceeds max, correct it
        if (Number.isFinite(currentValue) && currentValue > maxAllowed) {
            const correctedValue = formatScoreValue(maxAllowed)
            setItems((prev) =>
                prev.map((item) =>
                    item.snapshot_form_id === snapshotFormId
                        ? { ...item, score: correctedValue }
                        : item
                )
            )
            setDirty(true)
        }
    }

    const handleScoreWheel = (event: React.WheelEvent<HTMLInputElement>) => {
        // Prevent scrolling from changing the input value
        event.currentTarget.blur()
    }

    const handleCommentChange = (snapshotFormId: number, value: string) => {
        if (!canEdit) return
        setItems((prev) =>
            prev.map((item) =>
                item.snapshot_form_id === snapshotFormId
                    ? { ...item, comment: value }
                    : item
            )
        )
        setDirty(true)
    }

    const structuredTasks = useMemo<StructuredTask[]>(() => {
        const taskMap = new Map<number, StructuredTask>()

        snapshotRows.forEach((row) => {
            if (!taskMap.has(row.task_id)) {
                taskMap.set(row.task_id, {
                    task_id: row.task_id,
                    task_name: row.task_name,
                    quantity_workload_hours: row.quantity_workload_hours ?? null,
                    subtasks: [],
                })
            }

            const taskEntry = taskMap.get(row.task_id)!

            let subtaskEntry = taskEntry.subtasks.find((st) => st.subtask_id === row.subtask_id)
            if (!subtaskEntry) {
                subtaskEntry = {
                    subtask_id: row.subtask_id,
                    subtask_name: row.subtask_name,
                    form_infos: [],
                }
                taskEntry.subtasks.push(subtaskEntry)
            }

            subtaskEntry.form_infos.push(row)
        })

        return Array.from(taskMap.values()).map((task) => ({
            ...task,
            subtasks: task.subtasks.sort((a, b) => a.subtask_id - b.subtask_id),
        }))
    }, [snapshotRows])

    const evaluationStatusLabel = evaluation?.status === 1 ? 'ส่งแล้ว' : 'แบบร่าง'

    const handleSubmitEvaluation = useCallback(async () => {
        if (!accessToken || !evaluationId || !evaluation) return

        if (evaluation.status === 1) {
            Swal.fire('ข้อมูลถูกส่งแล้ว', 'การประเมินนี้ถูกส่งไปก่อนหน้านี้แล้ว', 'info')
            return
        }

        setShowConfirmModal(true)
    }, [accessToken, evaluationId, evaluation])

    const handleConfirmSubmit = async () => {
        if (!accessToken || !evaluationId || !evaluation) return

        setIsSubmitting(true)
        try {
            await saveDraft({ force: true })

            const submitResult = await WorkloadEvaluationService.submitEvaluation(
                accessToken,
                evaluationId
            )

            const submittedAt = new Date().toISOString()

            setEvaluation((prev) => {
                if (!prev) return prev

                const updatedItems = Array.isArray(prev.items)
                    ? prev.items.map((item) => {
                        if (item.score != null) {
                            return {
                                ...item,
                                score: Number(item.score),
                                comment: item.comment,
                            }
                        }

                        const fallback = getDefaultScoreFromSnapshot(item.snapshot_form_id)
                        return fallback == null
                            ? item
                            : {
                                ...item,
                                score: fallback,
                            }
                    })
                    : prev.items

                return {
                    ...prev,
                    status: 1,
                    submitted_at: submittedAt,
                    items: updatedItems ?? prev.items,
                }
            })

            setItems((prev) =>
                prev.map((item) => {
                    if (item.score !== '' && !Number.isNaN(Number(item.score))) {
                        return item
                    }

                    const fallback = getDefaultScoreFromSnapshot(item.snapshot_form_id)
                    if (fallback == null) {
                        return item
                    }

                    return {
                        ...item,
                        score: formatScoreValue(fallback),
                    }
                })
            )
            setDirty(false)
            setShowConfirmModal(false)

            Swal.fire({
                title: 'ส่งผลสำเร็จ',
                text: 'ได้ทำการส่งผลประเมินเรียบร้อยแล้ว',
                icon: 'success',
                showConfirmButton: false,
                timer: 1600,
            })

            if (submitResult?.form_finalized) {
                console.info('Form finalized for workload form', submitResult)
            }
        } catch (err) {
            console.error('Error submitting evaluation:', err)
            setShowConfirmModal(false)
            Swal.fire('เกิดข้อผิดพลาด', 'ไม่สามารถส่งผลประเมินได้', 'error')
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleManualSave = useCallback(async () => {
        const success = await saveDraft({ force: true })
        if (success) {
            Swal.fire({
                title: 'บันทึกสำเร็จ',
                text: 'ข้อมูลแบบร่างถูกบันทึกแล้ว',
                icon: 'success',
                showConfirmButton: false,
                timer: 1500,
            })
        }
    }, [saveDraft])

    const handleManualSubmit = useCallback(() => {
        void handleSubmitEvaluation()
    }, [handleSubmitEvaluation])

    if (isLoading) {
        return (
            <div className="z-10 rounded-md bg-white dark:bg-zinc-900 p-4 mb-28 dark:text-gray-400">
                <div className="animate-pulse">
                    <div className="mb-8">
                        <div className="mb-2 h-7 w-full max-w-md mx-auto bg-gray-200 dark:bg-zinc-700 rounded"></div>
                        <div className="mb-4 h-7 w-full max-w-md mx-auto bg-gray-200 dark:bg-zinc-700 rounded"></div>
                        <div className="h-6 w-64 bg-gray-200 dark:bg-zinc-700 rounded"></div>
                    </div>

                    <div className="w-full">
                        <table className="w-full border-collapse border border-gray-300 dark:border-gray-700">
                            <thead className="bg-gray-50 dark:bg-zinc-900">
                                <tr>
                                    {[...Array(8)].map((_, index) => (
                                        <th key={index} className="border border-gray-300 dark:border-gray-700 px-4 py-3">
                                            <div className="h-4 bg-gray-200 dark:bg-zinc-700 rounded"></div>
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-zinc-900">
                                <tr className="bg-business1">
                                    <td colSpan={8} className="border border-gray-300 dark:border-gray-700 px-4 py-3">
                                        <div className="h-5 w-64 bg-white/20 rounded"></div>
                                    </td>
                                </tr>
                                
                                <tr className="bg-gray-50 dark:bg-zinc-900">
                                    <td colSpan={8} className="border border-gray-300 dark:border-gray-700 px-4 py-2">
                                        <div className="ml-6 h-4 w-48 bg-gray-200 dark:bg-zinc-700 rounded"></div>
                                    </td>
                                </tr>
                                
                                {[...Array(3)].map((_, rowIndex) => (
                                    <tr key={rowIndex}>
                                        {[...Array(8)].map((_, colIndex) => (
                                            <td key={colIndex} className="border border-gray-300 dark:border-gray-700 px-4 py-2">
                                                {colIndex === 0 ? (
                                                    <div className="ml-12 h-4 w-32 bg-gray-200 dark:bg-zinc-700 rounded"></div>
                                                ) : colIndex === 1 ? (
                                                    <div className="h-4 w-24 bg-gray-200 dark:bg-zinc-700 rounded"></div>
                                                ) : colIndex === 6 ? (
                                                    <div className="mx-auto h-8 w-20 bg-gray-200 dark:bg-zinc-700 rounded"></div>
                                                ) : colIndex === 7 ? (
                                                    <div className="h-16 w-full bg-gray-200 dark:bg-zinc-700 rounded"></div>
                                                ) : (
                                                    <div className="h-4 w-12 bg-gray-200 dark:bg-zinc-700 rounded mx-auto"></div>
                                                )}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                                
                                <tr className="bg-gray-50 dark:bg-zinc-900">
                                    <td colSpan={4} className="border border-gray-300 dark:border-gray-700 px-4 py-2">
                                        <div className="h-4 w-24 bg-gray-200 dark:bg-zinc-700 rounded ml-auto"></div>
                                    </td>
                                    <td className="border border-gray-300 dark:border-gray-700 px-4 py-2">
                                        <div className="h-4 w-16 bg-gray-200 dark:bg-zinc-700 rounded mx-auto"></div>
                                    </td>
                                    <td colSpan={3} className="border border-gray-300 dark:border-gray-700 px-4 py-2"></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <div className="mt-6 rounded-lg bg-white dark:bg-zinc-900">
                        <div className="mb-3 h-5 w-32 bg-gray-200 dark:bg-zinc-700 rounded"></div>
                        <div className="h-24 w-full bg-gray-200 dark:bg-zinc-700 rounded"></div>
                    </div>
                </div>
            </div>
        )
    }


    if (!evaluation) {
        return null
    }

    const itemMap = new Map<number, ItemDraft>()
    items.forEach((item) => itemMap.set(item.snapshot_form_id, item))

    return (
        <div className={`z-10 rounded-md bg-white p-4 ${canEdit ? 'mb-28' : 'mb-0'} dark:bg-zinc-900 dark:text-gray-400`}>
                <div>
                    <div className="">
                        <p className="text-lg font-light text-center text-gray-800 dark:text-white">
                            ข้อตกลงและแบบประเมินผลการปฏิบัติงานของบุคลากรสายวิชาการ
                        </p>
                        <p className="text-lg font-light text-center text-gray-800 dark:text-white mb-8">
                            มหาวิทยาลัยเทคโนโลยีราชมงคลล้านนา
                        </p>
                        <p className="text-md font-normal text-gray-800 dark:text-white mb-4">
                            ส่วนที่ 1 องค์ประกอบที่ 1 ผลสัมฤทธิ์ของงาน
                        </p>
                    </div>

                    <div className="w-full">
                        <table className="w-full border-collapse border border-gray-300 dark:border-gray-700">
                            <thead className="bg-gray-50 dark:bg-zinc-900">
                                <tr>
                                    <th className="border border-gray-300 dark:border-gray-700 px-4 py-3 text-center text-gray-700 dark:text-white font-normal truncate">
                                        ภาระงาน/กิจกรรม/โครงการ/งาน
                                        <p>(1)</p>
                                    </th>
                                    <th className="border border-gray-300 dark:border-gray-700 px-4 py-3 text-center text-gray-700 dark:text-white font-normal truncate">
                                        หลักฐาน
                                        <p>(2)</p>
                                    </th>
                                    <th className="border border-gray-300 dark:border-gray-700 px-4 py-3 text-center text-gray-700 dark:text-white font-normal truncate">
                                        จำนวน
                                        <p>(3)</p>
                                    </th>
                                    <th className="border border-gray-300 dark:border-gray-700 px-4 py-3 text-center text-gray-700 dark:text-white font-normal truncate">
                                        ภาระงาน
                                        <p>(4)</p>
                                    </th>
                                    <th className="border border-gray-300 dark:border-gray-700 px-4 py-3 text-center text-gray-700 dark:text-white font-normal truncate">
                                        รวมภาระงาน
                                        <p>(3 x 4)</p>
                                    </th>
                                    <th className="border border-gray-300 dark:border-gray-700 px-4 py-3 text-center text-gray-700 dark:text-white font-normal truncate">
                                        หมายเหตุ
                                    </th>
                                    <th className="border border-gray-300 dark:border-gray-700 px-4 py-3 text-center text-gray-700 dark:text-white font-normal break-words text-wrap">
                                        ประเมิน
                                    </th>
                                    <th className="border border-gray-300 dark:border-gray-700 px-4 py-3 text-center text-gray-700 dark:text-white font-normal truncate">
                                        ความเห็นผู้ประเมิน
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-zinc-900">
                                {structuredTasks.length > 0 ? (
                                    structuredTasks.map((task) => {
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
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan={8} className="border border-gray-300 dark:border-gray-700 px-4 py-8 text-center text-gray-500 dark:text-white">
                                            กำลังโหลดรายการ...
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="mt-6 rounded-lg bg-white dark:bg-zinc-900">
                    <h3 className="text-md font-normal text-gray-800 dark:text-white">สรุปความคิดเห็น</h3>
                    <textarea
                        value={generalComment}
                        onChange={(event) => {
                            if (!canEdit) return
                            setGeneralComment(event.target.value)
                            setDirty(true)
                        }}
                        disabled={!canEdit}
                        rows={4}
                        className="mt-3 w-full rounded-md border dark:bg-zinc-900 dark:text-white border-gray-300 dark:border-gray-700 px-3 py-2 text-sm focus:border-business1 focus:outline-none disabled:cursor-default disabled:bg-gray-50"
                        placeholder="ความคิดเห็นเพิ่มเติม"
                    />
                </div>

                {canEdit ? (
                    <StickyFooter
                        showSubmitOnly
                        secondaryText="บันทึกแบบร่าง"
                        onSecondary={handleManualSave}
                        secondaryDisabled={!canEdit || isSaving}
                        submitText='ส่งผลประเมิน'
                        onSubmit={handleManualSubmit}
                        disabled={!canEdit || isSubmitting}
                    />
                ) : null}
                <ConfirmSubmitEvaluationModal
                    isOpen={showConfirmModal}
                    onConfirm={handleConfirmSubmit}
                    onClose={() => setShowConfirmModal(false)}
                />
        </div>
    )
}

