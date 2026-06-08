'use client'

import { Loader2, Armchair, Calendar, User, Book } from 'lucide-react'
import Component1Content from './form/form1'
import Component2Content from './form/form2'
import { useAssessmentInfo } from './_partial/useAssessmentInfo'

export default function AssessmentComponentSelectionPage() {
    const {
        formlistIdParam,
        setAssesInfoIdParam,
        accessToken,
        isSessionLoading,
        assessorLoading,
        assesseeInfo,
        roundInfo,
        assesseeDisplayName,
        combinedPositionDisplay,
        workloadGroupDisplay,
        selectedComponent,
        handleComponentClick,
        isLoading,
        error,
    } = useAssessmentInfo()

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
                </div>
            </div>
        )
    }

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
                        </div>
                    </div>
                </div>
            </div>

            {selectedComponent === null ? (
                <div className="rounded-md bg-white dark:bg-zinc-900 p-4 shadow flex flex-col gap-4">
                    <div className="flex flex-col gap-4">
                        {/* องค์ประกอบที่ 1 */}
                        <button
                            onClick={() => handleComponentClick(1)}
                            className="flex w-full cursor-pointer items-center justify-start gap-4 text-nowrap rounded-md border border-gray-200 dark:border-zinc-700 px-4 py-2 hover:bg-gray-50 dark:hover:bg-zinc-800"
                        >
                            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-business1 text-white">
                                <span className="flex h-full w-full items-center justify-center text-sm">
                                    1
                                </span>
                            </div>
                            <p className="overflow-hidden truncate text-nowrap font-light text-gray-600 dark:text-gray-300">
                                องค์ประกอบที่ 1 ผลสัมฤทธิ์ของงาน
                            </p>
                        </button>

                        {/* องค์ประกอบที่ 2 */}
                        <button
                            onClick={() => handleComponentClick(2)}
                            className="flex w-full cursor-pointer items-center justify-start gap-4 text-nowrap rounded-md border border-gray-200 dark:border-zinc-700 px-4 py-2 hover:bg-gray-50 dark:hover:bg-zinc-800"
                        >
                            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-business1 text-white">
                                <span className="flex h-full w-full items-center justify-center text-sm">
                                    2
                                </span>
                            </div>
                            <p className="overflow-hidden truncate text-nowrap font-light text-gray-600 dark:text-gray-300">
                                องค์ประกอบที่ 2 พฤติกรรมการปฏิบัติงาน
                            </p>
                        </button>
                    </div>
                </div>
            ) : (
                <div className="flex flex-col gap-4">
                    {selectedComponent === 1 && accessToken && (
                        <Component1Content
                            formlistIdParam={formlistIdParam!}
                            setAssesInfoIdParam={setAssesInfoIdParam!}
                            accessToken={accessToken}
                        />
                    )}

                    {selectedComponent === 2 && accessToken && (
                        <Component2Content
                            formlistIdParam={formlistIdParam!}
                            setAssesInfoIdParam={setAssesInfoIdParam!}
                            accessToken={accessToken}
                            roundListId={roundInfo?.round_list_id}
                            assesseeUserId={assesseeInfo?.as_u_id}
                        />
                    )}
                </div>
            )}
        </div>
    )
}
