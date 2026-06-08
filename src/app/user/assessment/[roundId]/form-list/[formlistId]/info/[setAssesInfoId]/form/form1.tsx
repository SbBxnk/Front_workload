'use client'

import StickyFooter from '@/components/StickyFooter'
import ConfirmSubmitEvaluationModal from '../partial/confirmSubmitEvaluationModal'
import type { Component1ContentProps, Form1ItemDraft as ItemDraft } from './_partial/types'
import { useForm1 } from './_partial/useForm1'
import Form1Skeleton from './_partial/Form1Skeleton'
import Form1TaskRows from './_partial/Form1TaskRows'

export default function Component1Content(props: Component1ContentProps) {
    const {
        baseUrl,
        isLoading,
        evaluation,
        items,
        generalComment,
        setGeneralComment,
        isSubmitting,
        isSaving,
        setDirty,
        showConfirmModal,
        setShowConfirmModal,
        canEdit,
        handleScoreChange,
        handleScoreBlur,
        handleScoreWheel,
        handleCommentChange,
        structuredTasks,
        handleConfirmSubmit,
        handleManualSave,
        handleManualSubmit,
    } = useForm1(props)

    if (isLoading) {
        return <Form1Skeleton />
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
                            <Form1TaskRows
                                structuredTasks={structuredTasks}
                                itemMap={itemMap}
                                items={items}
                                canEdit={canEdit}
                                baseUrl={baseUrl}
                                handleScoreChange={handleScoreChange}
                                handleScoreBlur={handleScoreBlur}
                                handleScoreWheel={handleScoreWheel}
                                handleCommentChange={handleCommentChange}
                            />
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
