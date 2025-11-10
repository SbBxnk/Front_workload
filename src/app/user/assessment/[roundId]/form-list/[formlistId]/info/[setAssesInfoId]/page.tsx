'use client'

import { useSession } from 'next-auth/react'
import { useParams, useRouter } from 'next/navigation'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Swal from 'sweetalert2'
import { Loader2, ArrowLeft, Save, Send, ClipboardList, AlertCircle, Armchair, Calendar, User, Book } from 'lucide-react'
import StickyFooter from '@/components/StickyFooter'
import WorkloadEvaluationService, {
    type EvaluationPayload,
    type EvaluationItem,
    type SnapshotRow,
} from '@/services/workloadEvaluationService'
import { useAssessor } from '@/hooks/useAssessor'
import useUtility from '@/hooks/useUtility'
import React from 'react'
import SetAssessorServices, { AssesseeSummary, RoundList } from '@/services/setAssessorServices'
import InfoHoverModal from '@/app/user/workload_round/[round_list_id]/form/infoTermModal'

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

export default function AssessmentEvaluationPage() {
    const params = useParams()
    const router = useRouter()
    const { setBreadcrumbs } = useUtility()
    const { data: session, status } = useSession()
    const { isAssessor, loading: assessorLoading, isInitialized: isAssessorInitialized } = useAssessor()
    const isSessionLoading = status === 'loading'

    const roundIdParam = params?.roundId as string | undefined
    const formlistIdParam = params?.formlistId as string | undefined
    const setAssesInfoIdParam = params?.setAssesInfoId as string | undefined

    const baseUrl = process.env.NEXT_PUBLIC_API?.replace('/api', '') || 'http://localhost:3333'

    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [snapshotRows, setSnapshotRows] = useState<SnapshotRow[]>([])
    const [evaluation, setEvaluation] = useState<EvaluationPayload | null>(null)
    const [items, setItems] = useState<ItemDraft[]>([])
    const [generalComment, setGeneralComment] = useState<string>('')
    const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const [dirty, setDirty] = useState(false)
    const isInitializing = useRef(true)
    const [assesseeInfo, setAssesseeInfo] = useState<AssesseeSummary | null>(null)
    const [roundInfo, setRoundInfo] = useState<RoundList | null>(null)

    const canEdit = evaluation?.status !== 1

    const evaluationId = evaluation?.evaluation_id ?? null

    const assesseeDisplayName = useMemo(() => {
        if (!assesseeInfo) return ''
        const parts = [assesseeInfo.prefix_name, assesseeInfo.u_fname, assesseeInfo.u_lname]
            .filter((part): part is string => !!part && part.trim().length > 0)
        return parts.join(' ').replace(/\s+/g, ' ').trim()
    }, [assesseeInfo])

    const academicPositionDisplay = assesseeInfo?.position_name?.trim() || '-'
    const managementPositionDisplay = assesseeInfo?.ex_position_name?.trim() || '-'
    const combinedPositionDisplay = useMemo(() => {
        const values = [academicPositionDisplay, managementPositionDisplay].filter((value, index, self) => {
            const normalized = value?.trim() || '-'
            return normalized !== '-' && self.indexOf(value) === index
        })

        if (values.length === 0) return '-'
        return values.join(' / ')
    }, [academicPositionDisplay, managementPositionDisplay])

    const workloadGroupDisplay = useMemo(() => {
        if (assesseeInfo?.workload_group_name) {
            return assesseeInfo.workload_group_name
        }
        return snapshotRows[0]?.workload_group_name ?? '-'
    }, [assesseeInfo?.workload_group_name, snapshotRows])

    const roundTitle = useMemo(() => {
        if (roundInfo?.round_list_name) return roundInfo.round_list_name
        if (roundIdParam) return `รอบที่ ${roundIdParam}`
        return 'รอบการประเมิน'
    }, [roundInfo?.round_list_name, roundIdParam])

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

    useEffect(() => {
        if (!roundIdParam || isSessionLoading || assessorLoading || isLoading) return
        setBreadcrumbs([
            { text: 'ตรวจประเมินภาระงาน', path: '/user/assessment' },
            { text: roundTitle, path: `/user/assessment/${roundIdParam}/form-list` },
            { text: assesseeDisplayName || 'การประเมิน', path: '#' },
        ])
    }, [roundIdParam, assesseeDisplayName, roundTitle, setBreadcrumbs, isSessionLoading, assessorLoading, isLoading])

    const fetchData = useCallback(async () => {
        if (!session?.accessToken || !formlistIdParam || !setAssesInfoIdParam || isSessionLoading || assessorLoading) {
            return
        }

        setIsLoading(true)
        setError(null)

        try {
            const data = await WorkloadEvaluationService.getEvaluation(
                session.accessToken as string,
                Number(formlistIdParam),
                Number(setAssesInfoIdParam)
            )

            const evaluationPayload = Array.isArray(data) ? data[0] : data

            setEvaluation(evaluationPayload.evaluation)
            const snapshotItems: SnapshotRow[] = Array.isArray(evaluationPayload.snapshot)
                ? evaluationPayload.snapshot
                : []
            setSnapshotRows(snapshotItems)

            const accessToken = session.accessToken as string
            const setAssesListId = evaluationPayload.evaluation.set_asses_list_id
            const roundListId = evaluationPayload.evaluation.round_list_id

            const fetchPromises: Promise<void>[] = []

            if (setAssesListId) {
                fetchPromises.push(
                    SetAssessorServices.getAssesseeBySetAssesListId(setAssesListId, accessToken)
                        .then((response) => {
                            const payload = Array.isArray(response.payload) ? response.payload[0] : response.payload
                            setAssesseeInfo(payload ?? null)
                        })
                        .catch((assesseeError) => {
                            console.error('Error fetching assessee info:', assesseeError)
                            setAssesseeInfo(null)
                        })
                )
            } else {
                setAssesseeInfo(null)
            }

            if (roundListId) {
                fetchPromises.push(
                    SetAssessorServices.getRoundListById(roundListId, accessToken)
                        .then((response) => {
                            const payload = Array.isArray(response.payload) ? response.payload[0] : response.payload
                            setRoundInfo(payload ?? null)
                        })
                        .catch((roundError) => {
                            console.error('Error fetching round info:', roundError)
                            setRoundInfo(null)
                        })
                )
            } else {
                setRoundInfo(null)
            }

            if (fetchPromises.length > 0) {
                await Promise.all(fetchPromises)
            }

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
                const fallbackScore =
                    existingScore != null
                        ? existingScore
                        : getDefaultScoreFromSnapshot(row.snapshot_form_id)

                return {
                    snapshot_form_id: row.snapshot_form_id,
                    score:
                        fallbackScore != null && Number.isFinite(fallbackScore)
                            ? formatScoreValue(fallbackScore)
                            : '',
                    comment: existing?.comment ?? '',
                }
            })

            setGeneralComment(evaluationPayload.evaluation.comment ?? '')
            setItems(mergedItems)
            setDirty(false)
            isInitializing.current = false
        } catch (err) {
            console.error('Error loading evaluation:', err)
            setError('ไม่สามารถโหลดข้อมูลการประเมินได้')
        } finally {
            setIsLoading(false)
        }
    }, [session?.accessToken, formlistIdParam, setAssesInfoIdParam, isSessionLoading, assessorLoading])

    useEffect(() => {
        if (!formlistIdParam || !setAssesInfoIdParam) {
            setError('ไม่พบข้อมูลสำหรับการประเมิน')
            setIsLoading(false)
            return
        }

        if (status === 'loading' || assessorLoading || !isAssessorInitialized) return

        if (status === 'unauthenticated') {
            router.replace('/login')
            return
        }

        if (!isAssessor) {
            router.replace('/user')
            return
        }

        void fetchData()
    }, [status, assessorLoading, isAssessorInitialized, isAssessor, fetchData, router, formlistIdParam, setAssesInfoIdParam])

    const saveDraft = useCallback(
        async (options?: { force?: boolean }) => {
            if (!session?.accessToken || !evaluation) {
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
                    session.accessToken as string,
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
                setError('ไม่สามารถบันทึกแบบร่างได้')
                return false
            } finally {
                setIsSaving(false)
            }
        },
        [session?.accessToken, evaluation, items, generalComment, dirty]
    )

    const handleScoreChange = (snapshotFormId: number, value: string) => {
        if (!canEdit) return

        let sanitized = value.replace(/[^0-9.]/g, '')
        const firstDotIndex = sanitized.indexOf('.')
        if (firstDotIndex !== -1) {
            const before = sanitized.slice(0, firstDotIndex + 1)
            const after = sanitized.slice(firstDotIndex + 1).replace(/\./g, '')
            sanitized = `${before}${after}`
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

    const handleSubmitEvaluation = async () => {
        if (!session?.accessToken || !evaluationId || !evaluation) return

        if (evaluation.status === 1) {
            Swal.fire('ข้อมูลถูกส่งแล้ว', 'การประเมินนี้ถูกส่งไปก่อนหน้านี้แล้ว', 'info')
            return
        }

        const confirmResult = await Swal.fire({
            title: 'ยืนยันการส่งผลประเมิน?',
            text: 'เมื่อส่งแล้วจะไม่สามารถแก้ไขได้อีก',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'ส่งผลประเมิน',
            cancelButtonText: 'ยกเลิก',
            reverseButtons: true,
        })

        if (!confirmResult.isConfirmed) {
            return
        }

        setIsSubmitting(true)
        try {
            await saveDraft({ force: true })

            const submitResult = await WorkloadEvaluationService.submitEvaluation(
                session.accessToken as string,
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

    if (isSessionLoading || assessorLoading || isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <Loader2 className="h-10 w-10 animate-spin text-business1" />
            </div>
        )
    }

    if (error) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="rounded-lg border border-red-300 bg-red-50 p-6 text-red-700">
                    <h2 className="text-xl font-semibold mb-2">เกิดข้อผิดพลาด</h2>
                    <p>{error}</p>
                    <button
                        type="button"
                        className="mt-4 inline-flex items-center gap-2 rounded-md bg-red-500 px-4 py-2 text-sm font-medium text-white hover:bg-red-600"
                        onClick={() => router.back()}
                    >
                        <ArrowLeft className="h-4 w-4" />
                        กลับไปหน้าก่อนหน้า
                    </button>
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
        <div className="flex flex-col gap-4">
            <div className="z-10 rounded-md bg-white p-4 shadow dark:bg-zinc-900 dark:text-gray-400">
                <h2 className="mb-4 text-lg font-medium text-gray-700 dark:text-gray-300">
                    รอบการประเมินปัจจุบัน
                </h2>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                    {/* ตำแหน่งผู้รับการประเมิน */}
                    <div>
                        <p className="flex items-center gap-2 text-sm font-light text-gray-500">
                            <Armchair className="h-4 w-4" />
                            ตำแหน่งผู้รับการประเมิน
                        </p>
                        <p className="text-md p-2 font-normal">
                            {combinedPositionDisplay}
                        </p>
                    </div>
                    {/* ชื่อ-สกุลผู้รับการประเมิน */}
                    <div>
                        <p className="flex items-center gap-2 text-sm font-light text-gray-500">
                            <User className="h-4 w-4" />
                            ชื่อ-สกุล
                        </p>
                        <p className="text-md p-2 font-normal">
                            {assesseeDisplayName || '-'}
                        </p>
                    </div>
                    {/* รอบ / ปีงบประมาณ */}
                    <div>
                        <p className="flex items-center gap-2 text-sm font-light text-gray-500">
                            <Calendar className="h-4 w-4" />
                            รอบ / ปีงบประมาณ
                        </p>
                        <p className="text-md p-2 font-normal">
                            {roundInfo?.round ?? '-'} / {roundInfo?.year ?? '-'}
                        </p>
                    </div>
                    {/* กลุ่มภาระงาน */}
                    <div>
                        <p className="flex items-center gap-2 text-sm font-light text-gray-500">
                            <Book className="h-4 w-4" />
                            กลุ่มภาระงาน
                        </p>
                        <div className="text-md relative flex items-center gap-2 p-2 font-normal">
                            {workloadGroupDisplay || '-'}
                            {/* สามารถเพิ่ม modal ข้อมูลกลุ่มภาระงานตรงนี้ได้ถ้าต้องการ */}
                        </div>
                    </div>
                </div>
            </div>

            <div className={`z-10 rounded-md bg-white p-4 ${canEdit ? 'mb-28' : 'mb-0'} dark:bg-zinc-900 dark:text-gray-400`}>
                <div>
                    <div className="">
                        <p className="text-lg font-light text-center text-gray-800 dark:text-gray-200">
                            ข้อตกลงและแบบประเมินผลการปฏิบัติงานของบุคลากรสายวิชาการ
                        </p>
                        <p className="text-lg font-light text-center text-gray-800 dark:text-gray-200 mb-8">
                            มหาวิทยาลัยเทคโนโลยีราชมงคลล้านนา
                        </p>
                        <p className="text-md font-normal text-gray-800 dark:text-gray-200 mb-4">
                            ส่วนที่ 1 องค์ประกอบที่ 1 ผลสัมฤทธิ์ของงาน
                        </p>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[1100px] border-collapse border border-gray-300">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="border border-gray-300 px-4 py-3 text-center text-gray-700 font-normal truncate">
                                        ภาระงาน/กิจกรรม/โครงการ/งาน
                                        <p>(1)</p>
                                    </th>
                                    <th className="border border-gray-300 px-4 py-3 text-center text-gray-700 font-normal truncate">
                                        หลักฐาน
                                        <p>(2)</p>
                                    </th>
                                    <th className="border border-gray-300 px-4 py-3 text-center text-gray-700 font-normal truncate">
                                        จำนวน
                                        <p>(3)</p>
                                    </th>
                                    <th className="border border-gray-300 px-4 py-3 text-center text-gray-700 font-normal truncate">
                                        ภาระงาน
                                        <p>(4)</p>
                                    </th>
                                    <th className="border border-gray-300 px-4 py-3 text-center text-gray-700 font-normal truncate">
                                        รวมภาระงาน
                                        <p>(3 x 4)</p>
                                    </th>
                                    <th className="border border-gray-300 px-4 py-3 text-center text-gray-700 font-normal truncate">
                                        หมายเหตุ
                                    </th>
                                    <th className="border border-gray-300 px-4 py-3 text-center text-gray-700 font-normal break-words text-wrap">
                                        ประเมิน
                                    </th>
                                    <th className="border border-gray-300 px-4 py-3 text-center text-gray-700 font-normal truncate">
                                        ความเห็นผู้ประเมิน
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white">
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
                                                <tr className="bg-business1 text-white">
                                                    <td colSpan={8} className="border border-gray-300 px-4 py-3 font-normal">
                                                        <div className="flex items-center justify-between">
                                                            <span>
                                                                {task.task_id}. {task.task_name || 'Unknown Task'} (ภาระงานขั้นต่ำ)
                                                            </span>
                                                            {task.quantity_workload_hours && (
                                                                <span className="text-sm bg-white text-business1 px-2 py-1 rounded">
                                                                    {task.quantity_workload_hours} ภาระงาน/สัปดาห์
                                                                </span>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>

                                                {task.subtasks.map((subtask, subtaskIndex) => (
                                                    <React.Fragment key={subtask.subtask_id}>
                                                        <tr className="bg-gray-50">
                                                            <td colSpan={8} className="border border-gray-300 px-4 py-2 text-gray-700">
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
                                                                        <td className="border border-gray-300 px-4 py-2 text-gray-500">
                                                                            <div className="ml-12 text-sm">-</div>
                                                                        </td>
                                                                        <td className="border border-gray-300 px-4 py-2 text-left text-gray-500 text-sm">-</td>
                                                                        <td className="border border-gray-300 px-4 py-2 text-center text-gray-500 text-sm">-</td>
                                                                        <td className="border border-gray-300 px-4 py-2 text-center text-gray-500 text-sm">-</td>
                                                                        <td className="border border-gray-300 px-4 py-2 text-center text-gray-500 text-sm">-</td>
                                                                        <td className="border border-gray-300 px-4 py-2 text-left text-gray-500 text-sm">-</td>
                                                                        <td className="border border-gray-300 px-4 py-2 text-center text-gray-500 text-sm">-</td>
                                                                        <td className="border border-gray-300 px-4 py-2 text-left text-gray-500 text-sm">-</td>
                                                                    </tr>
                                                                )
                                                            }

                                                            const draft = itemMap.get(formInfo.snapshot_form_id)
                                                            const quality = Number.isFinite(formInfo.quality) ? Number(formInfo.quality) : 0
                                                            const workload = Number.isFinite(formInfo.workload) ? Number(formInfo.workload) : 0

                                                            return (
                                                                <tr key={`${task.task_id}-${subtask.subtask_id}-${formInfo.snapshot_form_id}-${index}`}>
                                                                    <td className="border border-gray-300 px-4 py-2 text-gray-800">
                                                                        <div className="ml-12 flex flex-col gap-1">
                                                                            <div className="font-light text-gray-500 text-sm max-w-[200px]">
                                                                                {task.task_id}.{subtaskIndex + 1}.{index + 1} {formInfo.form_title || '-'}
                                                                            </div>
                                                                        </div>
                                                                    </td>
                                                                    <td className="border border-gray-300 px-4 py-2 text-left text-blue-600 text-sm max-w-[200px]">
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
                                                                    <td className="border border-gray-300 px-4 py-2 text-center text-sm">
                                                                        {Number.isFinite(formInfo.quality) ? formInfo.quality : '-'}
                                                                    </td>
                                                                    <td className="border border-gray-300 px-4 py-2 text-center text-sm">
                                                                        {Number.isFinite(formInfo.workload) ? formInfo.workload : '-'}
                                                                    </td>
                                                                    <td className="border border-gray-300 px-4 py-2 text-center text-sm text-blue-600">
                                                                        {quality && workload ? quality * workload : '-'}
                                                                    </td>
                                                                    <td className="border border-gray-300 text-gray-500 font-light px-4 py-2 text-left text-sm break-words whitespace-normal max-w-[200px]">
                                                                        {formInfo.description && formInfo.description !== '-' ? formInfo.description : '-'}
                                                                    </td>
                                                                    <td className="border border-gray-300 px-4 py-2 text-center">
                                                                        <input
                                                                            type="number"
                                                                            step="0.1"
                                                                            min="0"
                                                                            value={draft?.score ?? ''}
                                                                            onChange={(event) => handleScoreChange(formInfo.snapshot_form_id, event.target.value)}
                                                                            disabled={!canEdit}
                                                                            className="w-20 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-business1 focus:outline-none disabled:cursor-default disabled:bg-gray-50"
                                                                            placeholder="0"
                                                                        />
                                                                    </td>
                                                                    <td className="border border-gray-300 px-4 py-2">
                                                                        <textarea
                                                                            value={draft?.comment ?? ''}
                                                                            onChange={(event) => handleCommentChange(formInfo.snapshot_form_id, event.target.value)}
                                                                            disabled={!canEdit}
                                                                            rows={3}
                                                                            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-business1 focus:outline-none disabled:cursor-default disabled:bg-gray-50"
                                                                            placeholder="เพิ่มความคิดเห็น"
                                                                        />
                                                                    </td>
                                                                </tr>
                                                            )
                                                        })}
                                                    </React.Fragment>
                                                ))}

                                                <tr className="bg-gray-50">
                                                    <td colSpan={4} className="border border-gray-300 px-4 py-2 text-right text-sm font-light">
                                                        รวมภาระงาน
                                                    </td>
                                                    <td
                                                        className={`border border-gray-300 px-4 py-2 text-center text-sm font-semibold ${task.quantity_workload_hours &&
                                                            totalForTask < task.quantity_workload_hours
                                                            ? 'text-red-500'
                                                            : 'text-blue-600'
                                                            }`}
                                                    >
                                                        {hasAnyForm ? totalForTask : '-'}
                                                    </td>
                                                    <td className="border border-gray-300 px-4 py-2" />
                                                    <td className="border border-gray-300 px-4 py-2" />
                                                    <td className="border border-gray-300 px-4 py-2" />
                                                </tr>
                                            </React.Fragment>
                                        )
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan={8} className="border border-gray-300 px-4 py-8 text-center text-gray-500">
                                            กำลังโหลดรายการ...
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="mt-6 rounded-lg bg-white">
                    <h3 className="text-md font-normal">สรุปความคิดเห็น</h3>
                    <p className="mt-1 text-sm text-gray-500">
                        ระบุความคิดเห็นโดยรวมสำหรับผู้รับการประเมิน
                    </p>
                    <textarea
                        value={generalComment}
                        onChange={(event) => {
                            if (!canEdit) return
                            setGeneralComment(event.target.value)
                            setDirty(true)
                        }}
                        disabled={!canEdit}
                        rows={4}
                        className="mt-3 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-business1 focus:outline-none disabled:cursor-default disabled:bg-gray-50"
                        placeholder="ความคิดเห็นเพิ่มเติม"
                    />
                </div>

            </div>
            {canEdit ? (
                <StickyFooter
                    showSubmitOnly
                    secondaryText="บันทึกแบบร่าง"
                    onSecondary={handleManualSave}
                    secondaryDisabled={!canEdit || isSaving}
                    submitText={isSubmitting ? 'กำลังส่ง...' : 'ส่งผลประเมิน'}
                    onSubmit={handleManualSubmit}
                    disabled={!canEdit || isSubmitting}
                />
            ) : null}
        </div>
    )
}

