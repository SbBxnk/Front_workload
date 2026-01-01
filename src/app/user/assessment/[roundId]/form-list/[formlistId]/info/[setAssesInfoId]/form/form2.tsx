'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Swal from 'sweetalert2'
import { Loader2 } from 'lucide-react'
import StickyFooter from '@/components/StickyFooter'
import PerformanceEvaluationAssessmentService, {
    type EvaluationAssessmentResponse,
    type AssessmentItem,
} from '@/services/performanceEvaluationAssessmentService'
import React from 'react'
import ConfirmSubmitEvaluationModal from '../partial/confirmSubmitEvaluationModal'

interface ItemDraft {
    competency_id: number
    assessed_level: number | null
    comment: string
}

interface Component2ContentProps {
    formlistIdParam: string
    setAssesInfoIdParam: string
    accessToken: string
    roundListId?: number
    assesseeUserId?: number
}

export default function Component2Content({
    formlistIdParam,
    setAssesInfoIdParam,
    accessToken,
}: Component2ContentProps) {
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [evaluationAssessment, setEvaluationAssessment] = useState<EvaluationAssessmentResponse | null>(null)
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

    const canEdit = evaluationAssessment?.evaluation_assessment.status !== 1
    const evaluationAssessmentId = evaluationAssessment?.evaluation_assessment.evaluation_assessment_id ?? null

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
        setError(null)

        try {
            const data = await PerformanceEvaluationAssessmentService.getEvaluationAssessment(
                accessToken,
                Number(formlistIdParam),
                Number(setAssesInfoIdParam)
            )

            // data ควรเป็น EvaluationAssessmentResponse object โดยตรง
            if (!data || !data.evaluation_assessment) {
                throw new Error('Invalid response structure')
            }

            setEvaluationAssessment(data)

            const assessmentItems: AssessmentItem[] = Array.isArray(data.items)
                ? data.items
                : []

            const mergedItems: ItemDraft[] = assessmentItems.map((item: AssessmentItem) => {
                return {
                    competency_id: item.competency_id,
                    assessed_level: item.assessed_level,
                    comment: item.comment ?? '',
                }
            })

            setGeneralComment(data.evaluation_assessment.comment ?? '')
            setItems(mergedItems)
            setDirty(false)
            isInitializing.current = false
        } catch (err: any) {
            // Reset fetch key and flag on error so it can retry
            const currentFetchKey = `${formlistIdParam}-${setAssesInfoIdParam}-${accessToken}`
            if (fetchKeyRef.current === currentFetchKey) {
                fetchKeyRef.current = ''
            }
            isFetchingRef.current = false
            console.error('Error loading evaluation assessment:', err)
            const errorMessage = err?.response?.data?.message || err?.message || 'ไม่สามารถโหลดข้อมูลการประเมินได้'
            setError(errorMessage)
        } finally {
            setIsLoading(false)
            isFetchingRef.current = false
        }
    }, [accessToken, formlistIdParam, setAssesInfoIdParam])

    useEffect(() => {
        if (!formlistIdParam || !setAssesInfoIdParam || !accessToken) {
            setError('ไม่พบข้อมูลสำหรับการประเมิน')
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
            if (!accessToken || !evaluationAssessment) {
                return false
            }

            if (!options?.force && (!dirty || evaluationAssessment.evaluation_assessment.status === 1)) {
                return false
            }

            try {
                setIsSaving(true)

                // เตรียม items โดยใช้ demonstrated_level ถ้า assessed_level เป็น null
                const preparedItems = items.map((item) => {
                    const assessmentItem = evaluationAssessment.items.find(
                        (ai) => ai.competency_id === item.competency_id
                    )
                    // ถ้า assessed_level เป็น null หรือ undefined ให้ใช้ demonstrated_level แทน
                    const finalAssessedLevel = item.assessed_level ?? assessmentItem?.demonstrated_level ?? null

                    return {
                        competency_id: item.competency_id,
                        assessed_level: finalAssessedLevel,
                        comment: item.comment ? item.comment : null,
                    }
                })

                const payload = {
                    comment: generalComment || null,
                    items: preparedItems,
                }

                await PerformanceEvaluationAssessmentService.saveDraft(
                    accessToken,
                    evaluationAssessment.evaluation_assessment.evaluation_assessment_id,
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
        [accessToken, evaluationAssessment, items, generalComment, dirty]
    )

    const handleAssessedLevelChange = (competencyId: number, value: string) => {
        if (!canEdit) return

        // หา expected_level สำหรับ competency นี้
        const assessmentItem = evaluationAssessment?.items.find(
            (ai) => ai.competency_id === competencyId
        )
        const expectedLevel = assessmentItem?.expected_level ?? 5 // default เป็น 5 ถ้าไม่มี

        let sanitized = value.replace(/[^0-9]/g, '')
        let newValue: number | null = null

        if (sanitized !== '') {
            const numValue = Number(sanitized)
            const maxAllowed = expectedLevel // ใช้ expected_level เป็น max
            
            if (Number.isFinite(numValue) && numValue >= 1 && numValue <= maxAllowed) {
                newValue = numValue
            } else if (numValue > maxAllowed) {
                // ถ้าเกิน expected_level ให้ limit เป็น expected_level
                newValue = maxAllowed
                sanitized = String(maxAllowed)
            } else if (numValue < 1) {
                newValue = 1
                sanitized = '1'
            }
        }

        setItems((prev) =>
            prev.map((item) =>
                item.competency_id === competencyId
                    ? { ...item, assessed_level: newValue }
                    : item
            )
        )
        setDirty(true)
    }

    const handleAssessedLevelBlur = (competencyId: number, value: string) => {
        if (!canEdit) return

        // หา expected_level สำหรับ competency นี้
        const assessmentItem = evaluationAssessment?.items.find(
            (ai) => ai.competency_id === competencyId
        )
        const expectedLevel = assessmentItem?.expected_level ?? 5 // default เป็น 5 ถ้าไม่มี

        const currentValue = value === '' ? null : Number(value)
        if (currentValue !== null) {
            const maxAllowed = expectedLevel
            
            if (!Number.isFinite(currentValue) || currentValue < 1 || currentValue > maxAllowed) {
                // ถ้าเกิน expected_level ให้แก้เป็น expected_level
                if (currentValue > maxAllowed) {
                    setItems((prev) =>
                        prev.map((item) =>
                            item.competency_id === competencyId
                                ? { ...item, assessed_level: maxAllowed }
                                : item
                        )
                    )
                    Swal.fire({
                        title: 'แจ้งเตือน',
                        text: `ระดับที่ประเมินต้องไม่เกินระดับที่คาดหวัง (${maxAllowed})`,
                        icon: 'warning',
                        showConfirmButton: false,
                        timer: 2000,
                    })
                } else {
                    // Reset to empty if invalid (น้อยกว่า 1)
                    setItems((prev) =>
                        prev.map((item) =>
                            item.competency_id === competencyId
                                ? { ...item, assessed_level: null }
                                : item
                        )
                    )
                }
                setDirty(true)
            }
        }
    }

    const handleAssessedLevelWheel = (event: React.WheelEvent<HTMLInputElement>) => {
        // Prevent scrolling from changing the input value
        event.currentTarget.blur()
    }

    const handleCommentChange = (competencyId: number, value: string) => {
        if (!canEdit) return
        setItems((prev) =>
            prev.map((item) =>
                item.competency_id === competencyId
                    ? { ...item, comment: value }
                    : item
            )
        )
        setDirty(true)
    }

    const sortedItems = useMemo(() => {
        if (!evaluationAssessment) return []
        return [...items].sort((a, b) => {
            const aItem = evaluationAssessment.items.find((item) => item.competency_id === a.competency_id)
            const bItem = evaluationAssessment.items.find((item) => item.competency_id === b.competency_id)
            const aOrder = aItem?.competency_order || 0
            const bOrder = bItem?.competency_order || 0
            return aOrder - bOrder
        })
    }, [items, evaluationAssessment])

    const handleSubmitEvaluationAssessment = useCallback(async () => {
        if (!accessToken || !evaluationAssessmentId || !evaluationAssessment) return

        if (evaluationAssessment.evaluation_assessment.status === 1) {
            Swal.fire('ข้อมูลถูกส่งแล้ว', 'การประเมินนี้ถูกส่งไปก่อนหน้านี้แล้ว', 'info')
            return
        }

        setShowConfirmModal(true)
    }, [accessToken, evaluationAssessmentId, evaluationAssessment])

    const handleConfirmSubmit = async () => {
        if (!accessToken || !evaluationAssessmentId || !evaluationAssessment) return

        setIsSubmitting(true)
        try {
            // ก่อน submit ให้อัปเดต items ที่ assessed_level เป็น null ให้ใช้ demonstrated_level แทน
            const updatedItems = items.map((item) => {
                const assessmentItem = evaluationAssessment.items.find(
                    (ai) => ai.competency_id === item.competency_id
                )
                // ถ้า assessed_level เป็น null หรือ undefined ให้ใช้ demonstrated_level แทน
                if (item.assessed_level == null && assessmentItem?.demonstrated_level != null) {
                    return {
                        ...item,
                        assessed_level: assessmentItem.demonstrated_level,
                    }
                }
                return item
            })

            // อัปเดต state ก่อน save
            setItems(updatedItems)

            // รอให้ state อัปเดต
            await new Promise((resolve) => setTimeout(resolve, 100))

            await saveDraft({ force: true })

            await PerformanceEvaluationAssessmentService.submitEvaluationAssessment(
                accessToken,
                evaluationAssessmentId
            )

            setEvaluationAssessment((prev) => {
                if (!prev) return prev
                return {
                    ...prev,
                    evaluation_assessment: {
                        ...prev.evaluation_assessment,
                        status: 1,
                        submitted_at: new Date().toISOString(),
                    }
                }
            })
            setDirty(false)
            setShowConfirmModal(false)

            Swal.fire({
                title: 'ส่งผลสำเร็จ',
                text: 'ได้ทำการส่งผลประเมินเรียบร้อยแล้ว',
                icon: 'success',
                showConfirmButton: false,
                timer: 1600,
            })
        } catch (err) {
            console.error('Error submitting evaluation assessment:', err)
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
        void handleSubmitEvaluationAssessment()
    }, [handleSubmitEvaluationAssessment])

    if (isLoading) {
        return (
            <div className="flex min-h-[400px] items-center justify-center">
                <Loader2 className="h-10 w-10 animate-spin text-business1" />
            </div>
        )
    }

    if (error) {
        return (
            <div className="rounded-lg border border-red-300 bg-red-50 p-6 text-red-700">
                <h2 className="text-xl font-semibold mb-2">เกิดข้อผิดพลาด</h2>
                <p>{error}</p>
            </div>
        )
    }

    if (!evaluationAssessment) {
        return null
    }

    const itemMap = new Map<number, ItemDraft>()
    items.forEach((item) => itemMap.set(item.competency_id, item))

    return (
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
                        ส่วนที่ 2 องค์ประกอบที่ 2 พฤติกรรมการปฏิบัติงาน (สมรรถนะ)
                    </p>
                </div>

                <div className="w-full">
                    <table className="w-full border-collapse border border-gray-300">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="border border-gray-300 px-4 py-3 text-center text-gray-700 font-normal truncate">
                                    ลำดับ
                                </th>
                                <th className="border border-gray-300 px-4 py-3 text-center text-gray-700 font-normal truncate">
                                    สมรรถนะ
                                </th>
                                <th className="border border-gray-300 px-4 py-3 text-center text-gray-700 font-normal truncate">
                                    ระดับที่คาดหวัง
                                </th>
                                <th className="border border-gray-300 px-4 py-3 text-center text-gray-700 font-normal truncate">
                                    ระดับที่แสดงออก
                                    <p className="text-xs font-light">(ผู้ถูกประเมินกรอก)</p>
                                </th>
                                <th className="border border-gray-300 px-4 py-3 text-center text-gray-700 font-normal break-words text-wrap">
                                    ระดับที่ประเมิน
                                    <p className="text-xs font-light">(ผู้ประเมินกรอก)</p>
                                </th>
                                <th className="border border-gray-300 px-4 py-3 text-center text-gray-700 font-normal truncate">
                                    ความเห็นผู้ประเมิน
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white">
                            {sortedItems.length > 0 ? (
                                sortedItems.map((item, index) => {
                                    const assessmentItem = evaluationAssessment.items.find(
                                        (ai) => ai.competency_id === item.competency_id
                                    )
                                    const draft = itemMap.get(item.competency_id)

                                    return (
                                        <tr key={item.competency_id}>
                                            <td className="border border-gray-300 px-4 py-2 text-center text-sm">
                                                {index + 1}
                                            </td>
                                            <td className="border border-gray-300 px-4 py-2 text-gray-800">
                                                <div className="font-light text-sm">
                                                    {assessmentItem?.competency_name || '-'}
                                                </div>
                                            </td>
                                            <td className="border border-gray-300 px-4 py-2 text-center text-sm">
                                                {assessmentItem?.expected_level != null ? assessmentItem.expected_level : '-'}
                                            </td>
                                            <td className="border border-gray-300 px-4 py-2 text-center">
                                                <input
                                                    type="number"
                                                    min="1"
                                                    max="5"
                                                    value={assessmentItem?.demonstrated_level ?? ''}
                                                    disabled
                                                    className="w-20 rounded-md border border-gray-300 px-3 py-2 text-sm bg-gray-100 cursor-not-allowed text-gray-500 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
                                                />
                                            </td>
                                            <td className="border border-gray-300 px-4 py-2 text-center">
                                                <input
                                                    type="number"
                                                    min="1"
                                                    max={assessmentItem?.expected_level ?? 5}
                                                    value={draft?.assessed_level ?? ''}
                                                    onChange={(event) => handleAssessedLevelChange(item.competency_id, event.target.value)}
                                                    onBlur={(event) => handleAssessedLevelBlur(item.competency_id, event.target.value)}
                                                    onWheel={handleAssessedLevelWheel}
                                                    disabled={!canEdit}
                                                    className="w-20 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-business1 focus:outline-none disabled:cursor-default disabled:bg-gray-50 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
                                                    placeholder={`1-${assessmentItem?.expected_level ?? 5}`}
                                                    title={assessmentItem?.expected_level ? `ต้องไม่เกิน ${assessmentItem.expected_level}` : '1-5'}
                                                />
                                            </td>
                                            <td className="border border-gray-300 px-4 py-2">
                                                <textarea
                                                    value={draft?.comment ?? ''}
                                                    onChange={(event) => handleCommentChange(item.competency_id, event.target.value)}
                                                    disabled={!canEdit}
                                                    rows={3}
                                                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-business1 focus:outline-none disabled:cursor-default disabled:bg-gray-50"
                                                    placeholder="เพิ่มความคิดเห็น"
                                                />
                                            </td>
                                        </tr>
                                    )
                                })
                            ) : (
                                <tr>
                                    <td colSpan={6} className="border border-gray-300 px-4 py-8 text-center text-gray-500">
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
            <ConfirmSubmitEvaluationModal
                isOpen={showConfirmModal}
                onConfirm={handleConfirmSubmit}
                onClose={() => setShowConfirmModal(false)}
            />
        </div>
    )
}
