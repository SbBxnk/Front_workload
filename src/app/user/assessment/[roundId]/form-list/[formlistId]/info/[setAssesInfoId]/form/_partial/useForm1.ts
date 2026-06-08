'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Swal from 'sweetalert2'
import { BASE_URL_FILE } from '@/provider/config'
import WorkloadEvaluationService from '@/services/workloadEvaluationService'
import type {
    EvaluationPayload,
    EvaluationItem,
    SnapshotRow,
} from '@/Types/workloadEvaluation'
import type {
    Form1ItemDraft as ItemDraft,
    StructuredTask,
    Component1ContentProps,
} from './types'

export function useForm1({
    formlistIdParam,
    setAssesInfoIdParam,
    accessToken,
}: Component1ContentProps) {
    const baseUrl = BASE_URL_FILE

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

    return {
        baseUrl,
        isLoading,
        snapshotRows,
        evaluation,
        items,
        generalComment,
        setGeneralComment,
        lastSavedAt,
        isSubmitting,
        isSaving,
        dirty,
        setDirty,
        showConfirmModal,
        setShowConfirmModal,
        canEdit,
        evaluationId,
        workloadGroupDisplay,
        formatScoreValue,
        getDefaultScoreFromSnapshot,
        getCurrentEvaluationSumForTask,
        handleScoreChange,
        handleScoreBlur,
        handleScoreWheel,
        handleCommentChange,
        structuredTasks,
        evaluationStatusLabel,
        handleConfirmSubmit,
        handleManualSave,
        handleManualSubmit,
    }
}
