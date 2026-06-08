'use client'

import StickyFooter from '@/components/StickyFooter'
import ConfirmSubmitEvaluationModal from '../partial/confirmSubmitEvaluationModal'
import type { Component2ContentProps, Form2ItemDraft as ItemDraft } from './_partial/types'
import { useForm2 } from './_partial/useForm2'
import Form2Skeleton from './_partial/Form2Skeleton'

export default function Component2Content(props: Component2ContentProps) {
    const {
        isLoading,
        error,
        evaluationAssessment,
        items,
        generalComment,
        setGeneralComment,
        isSubmitting,
        isSaving,
        setDirty,
        showConfirmModal,
        setShowConfirmModal,
        canEdit,
        handleAssessedLevelChange,
        handleAssessedLevelBlur,
        handleAssessedLevelWheel,
        handleCommentChange,
        sortedItems,
        handleConfirmSubmit,
        handleManualSave,
        handleManualSubmit,
    } = useForm2(props)

    if (isLoading) {
        return <Form2Skeleton />
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
        <div className={`z-10 rounded-md bg-white dark:bg-zinc-900 p-4 ${canEdit ? 'mb-28' : 'mb-0'} dark:bg-zinc-900 dark:text-gray-400`}>
            <div>
                <div className="">
                    <p className="text-lg font-light text-center text-gray-800 dark:text-white">
                        ข้อตกลงและแบบประเมินผลการปฏิบัติงานของบุคลากรสายวิชาการ
                    </p>
                    <p className="text-lg font-light text-center text-gray-800 dark:text-white mb-8">
                        มหาวิทยาลัยเทคโนโลยีราชมงคลล้านนา
                    </p>
                    <p className="text-md font-normal text-gray-800 dark:text-white mb-4">
                        ส่วนที่ 2 องค์ประกอบที่ 2 พฤติกรรมการปฏิบัติงาน (สมรรถนะ)
                    </p>
                </div>

                <div className="w-full">
                    <table className="w-full border-collapse border border-gray-300 dark:border-gray-700">
                        <thead className="bg-gray-50 dark:bg-zinc-900">
                            <tr>
                                <th className="border border-gray-300 dark:border-gray-700 px-4 py-3 text-center text-gray-700 dark:text-white font-normal truncate">
                                    ลำดับ
                                </th>
                                <th className="border border-gray-300 dark:border-gray-700 px-4 py-3 text-center text-gray-700 dark:text-white font-normal truncate">
                                    สมรรถนะ
                                </th>
                                <th className="border border-gray-300 dark:border-gray-700 px-4 py-3 text-center text-gray-700 dark:text-white font-normal truncate">
                                    ระดับที่คาดหวัง
                                </th>
                                <th className="border border-gray-300 dark:border-gray-700 px-4 py-3 text-center text-gray-700 dark:text-white font-normal truncate">
                                    ระดับที่แสดงออก
                                    <p className="text-xs font-light">(ผู้ถูกประเมินกรอก)</p>
                                </th>
                                <th className="border border-gray-300 dark:border-gray-700 px-4 py-3 text-center text-gray-700 dark:text-white font-normal break-words text-wrap">
                                    ระดับที่ประเมิน
                                    <p className="text-xs font-light">(ผู้ประเมินกรอก)</p>
                                </th>
                                <th className="border border-gray-300 dark:border-gray-700 px-4 py-3 text-center text-gray-700 dark:text-white font-normal truncate">
                                    ความเห็นผู้ประเมิน
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-zinc-900">
                            {sortedItems.length > 0 ? (
                                sortedItems.map((item, index) => {
                                    const assessmentItem = evaluationAssessment.items.find(
                                        (ai) => ai.competency_id === item.competency_id
                                    )
                                    const draft = itemMap.get(item.competency_id)

                                    return (
                                        <tr key={item.competency_id}>
                                            <td className="border border-gray-300 dark:border-gray-700 px-4 py-2 text-center text-sm">
                                                {index + 1}
                                            </td>
                                            <td className="border border-gray-300 dark:border-gray-700 px-4 py-2 text-gray-800 dark:text-white">
                                                <div className="font-light text-sm">
                                                    {assessmentItem?.competency_name || '-'}
                                                </div>
                                            </td>
                                            <td className="border border-gray-300 dark:border-gray-700 px-4 py-2 text-center text-sm">
                                                {assessmentItem?.expected_level != null ? assessmentItem.expected_level : '-'}
                                            </td>
                                            <td className="border border-gray-300 dark:border-gray-700 px-4 py-2 text-center">
                                                <input
                                                    type="number"
                                                    min="1"
                                                    max="5"
                                                    value={assessmentItem?.demonstrated_level ?? ''}
                                                    disabled
                                                    className="w-20 rounded-md border border-gray-300 dark:border-gray-700 px-3 py-2 text-sm bg-gray-100 dark:bg-zinc-900 cursor-not-allowed text-gray-500 dark:text-white [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
                                                />
                                            </td>
                                            <td className="border border-gray-300 dark:border-gray-700 px-4 py-2 text-center">
                                                <input
                                                    type="number"
                                                    min="1"
                                                    max={assessmentItem?.expected_level ?? 5}
                                                    value={draft?.assessed_level ?? ''}
                                                    onChange={(event) => handleAssessedLevelChange(item.competency_id, event.target.value)}
                                                    onBlur={(event) => handleAssessedLevelBlur(item.competency_id, event.target.value)}
                                                    onWheel={handleAssessedLevelWheel}
                                                    disabled={!canEdit}
                                                    className="w-20 rounded-md border border-gray-300 dark:border-gray-700 px-3 py-2 text-sm focus:border-business1 focus:outline-none disabled:cursor-default disabled:bg-gray-50 dark:bg-zinc-900 dark:text-white [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
                                                    placeholder={`1-${assessmentItem?.expected_level ?? 5}`}
                                                    title={assessmentItem?.expected_level ? `ต้องไม่เกิน ${assessmentItem.expected_level}` : '1-5'}
                                                />
                                            </td>
                                            <td className="border border-gray-300 dark:border-gray-700 px-4 py-2">
                                                <textarea
                                                    value={draft?.comment ?? ''}
                                                    onChange={(event) => handleCommentChange(item.competency_id, event.target.value)}
                                                    disabled={!canEdit}
                                                    rows={3}
                                                    className="w-full rounded-md border border-gray-300 dark:border-gray-700 px-3 py-2 text-sm focus:border-business1 focus:outline-none disabled:cursor-default disabled:bg-gray-50 dark:bg-zinc-900 dark:text-white"
                                                    placeholder="เพิ่มความคิดเห็น"
                                                />
                                            </td>
                                        </tr>
                                    )
                                })
                            ) : (
                                <tr>
                                    <td colSpan={6} className="border border-gray-300 dark:border-gray-700 px-4 py-8 text-center text-gray-500 dark:text-white">
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
                    className="mt-3 w-full rounded-md border border-gray-300 dark:border-gray-700 px-3 py-2 text-sm focus:border-business1 focus:outline-none disabled:cursor-default disabled:bg-gray-50 dark:bg-zinc-900 dark:text-white"
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
