import React, { useMemo } from 'react'

interface Section3Props {
    performanceScoreOutOf70: number
    performanceScoreOutOf30: number
    formlistStatus?: number | null
    performanceScoreOutOf70Evaluated?: number | null
    performanceScoreOutOf30Evaluated?: number | null
    userName?: string | null
    evaluatorName?: string | null
}

const MAX_SCORE_COMPONENT_1 = 70
const MAX_SCORE_COMPONENT_2 = 30

function Section3({ 
    performanceScoreOutOf70, 
    performanceScoreOutOf30,
    formlistStatus = null,
    performanceScoreOutOf70Evaluated,
    performanceScoreOutOf30Evaluated,
    userName = null,
    evaluatorName = null,
}: Section3Props) {
    const isFinalized = formlistStatus === 2
    const { totalMaxScore, totalScore, totalPercentage } = useMemo(() => {
        const max = MAX_SCORE_COMPONENT_1 + MAX_SCORE_COMPONENT_2
        const score = (Number.isFinite(performanceScoreOutOf70) ? performanceScoreOutOf70 : 0) +
            (Number.isFinite(performanceScoreOutOf30) ? performanceScoreOutOf30 : 0)
        const percentage = max > 0 ? (score / max) * 100 : 0
        return {
            totalMaxScore: max,
            totalScore: score,
            totalPercentage: percentage,
        }
    }, [performanceScoreOutOf30, performanceScoreOutOf70])

    const evaluationLevels = useMemo(
        () => [
            {
                label: 'ดีเด่น',
                description: '(90 - 100)',
                min: 90,
                max: 100,
            },
            {
                label: 'ดีมาก',
                description: '(80 - 89.99)',
                min: 80,
                max: 89.99,
            },
            {
                label: 'ดี',
                description: '(70 - 79.99)',
                min: 70,
                max: 79.99,
            },
            {
                label: 'พอใช้',
                description: '(60 - 69.99)',
                min: 60,
                max: 69.99,
            },
            {
                label: 'ต้องปรับปรุง',
                description: '(ต่ำกว่า 60)',
                min: -Infinity,
                max: 59.99,
            },
        ],
        []
    )

    // คำนวณคะแนนจากผู้ตรวจเมื่อ isFinalized
    const evaluatedTotalPercentage = useMemo(() => {
        if (!isFinalized) return null
        const max = MAX_SCORE_COMPONENT_1 + MAX_SCORE_COMPONENT_2
        const evaluatedScore = (Number.isFinite(performanceScoreOutOf70Evaluated ?? null) ? (performanceScoreOutOf70Evaluated ?? 0) : 0) +
            (Number.isFinite(performanceScoreOutOf30Evaluated ?? null) ? (performanceScoreOutOf30Evaluated ?? 0) : 0)
        const percentage = max > 0 ? (evaluatedScore / max) * 100 : 0
        return percentage
    }, [isFinalized, performanceScoreOutOf70Evaluated, performanceScoreOutOf30Evaluated])

    const normalizedPercentage = useMemo(() => {
        // ใช้คะแนนจากผู้ตรวจเมื่อ isFinalized
        const percentageToUse = (isFinalized && evaluatedTotalPercentage != null) 
            ? evaluatedTotalPercentage 
            : totalPercentage

        if (!Number.isFinite(percentageToUse)) {
            return 0
        }
        if (percentageToUse < 0) {
            return 0
        }
        if (percentageToUse > 100) {
            return 100
        }
        return percentageToUse
    }, [isFinalized, evaluatedTotalPercentage, totalPercentage])

    const formatScore = (value: number) => {
        if (!Number.isFinite(value)) {
            return '-'
        }
        return value.toLocaleString('th-TH', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        })
    }

    return (
        <div>
             <div className="w-full mb-6">
                <div className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-zinc-900 p-3 mb-3">
                    <p className="text-sm font-light text-gray-800 dark:text-gray-200 mb-1">
                        (9) ผู้ประเมินและผู้รับการประเมินได้ตกลงร่วมกันและเห็นพ้องกันแล้ว (ระบุข้อมูลใน (1) ให้ครบ)
                    </p>
                    <p className="text-sm font-light text-gray-800 dark:text-gray-200 text-center">
                        จึงลงลายมือชื่อไว้เป็นหลักฐาน (ลงนามเมื่อจัดทำข้อตกลง)
                    </p>
                </div>
                <div className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-zinc-900">
                    <div className="grid grid-cols-2 divide-x divide-gray-300 dark:divide-gray-600">
                        {/* คอลัมน์ซ้าย - ผู้ประเมิน */}
                        <div className="p-3 space-y-3">
                            <div>
                                <p className="text-sm font-light text-gray-800 dark:text-gray-200 mb-1">
                                    ลายมือชื่อ
                                </p>
                                <div className="relative border-b-2 border-dotted border-gray-500 dark:border-gray-400 pb-1 min-h-[1.5rem]">
                                    {evaluatorName && (
                                        <span className="text-sm font-light text-gray-800 dark:text-gray-200 absolute bottom-1 left-0">
                                            {evaluatorName}
                                        </span>
                                    )}
                                </div>
                                <p className="text-xs font-light text-gray-600 dark:text-gray-400 mt-0.5">
                                    (ผู้ประเมิน)
                                </p>
                            </div>
                            <div className="flex items-baseline gap-1.5 mt-3">
                                <span className="text-sm font-light text-gray-800 dark:text-gray-200 whitespace-nowrap">วันที่</span>
                                <div className="relative border-b border-dotted border-gray-500 dark:border-gray-400 flex-1 pb-0.5 min-h-[1.2rem]">
                                    <span className="text-xs font-light text-gray-500 dark:text-gray-400 absolute bottom-0 left-0">........</span>
                                </div>
                                <span className="text-sm font-light text-gray-800 dark:text-gray-200 whitespace-nowrap ml-1">เดือน</span>
                                <div className="relative border-b border-dotted border-gray-500 dark:border-gray-400 flex-1 pb-0.5 min-h-[1.2rem]">
                                    <span className="text-xs font-light text-gray-500 dark:text-gray-400 absolute bottom-0 left-0">........</span>
                                </div>
                                <span className="text-sm font-light text-gray-800 dark:text-gray-200 whitespace-nowrap ml-1">พ.ศ.</span>
                                <div className="relative border-b border-dotted border-gray-500 dark:border-gray-400 flex-1 pb-0.5 min-h-[1.2rem]">
                                    <span className="text-xs font-light text-gray-500 dark:text-gray-400 absolute bottom-0 left-0">........</span>
                                </div>
                            </div>
                        </div>

                        {/* คอลัมน์ขวา - ผู้รับการประเมิน */}
                        <div className="p-3 space-y-3">
                            <div>
                                <p className="text-sm font-light text-gray-800 dark:text-gray-200 mb-1">
                                    ลายมือชื่อ
                                </p>
                                <div className="relative border-b-2 border-dotted border-gray-500 dark:border-gray-400 pb-1 min-h-[1.5rem]">
                                    {userName && (
                                        <span className="text-sm font-light text-gray-800 dark:text-gray-200 absolute bottom-1 left-0">
                                            {userName}
                                        </span>
                                    )}
                                </div>
                                <p className="text-xs font-light text-gray-600 dark:text-gray-400 mt-0.5">
                                    (ผู้รับการประเมิน)
                                </p>
                            </div>
                            <div className="flex items-baseline gap-1.5 mt-3">
                                <span className="text-sm font-light text-gray-800 dark:text-gray-200 whitespace-nowrap">วันที่</span>
                                <div className="relative border-b border-dotted border-gray-500 dark:border-gray-400 flex-1 pb-0.5 min-h-[1.2rem]">
                                    <span className="text-xs font-light text-gray-500 dark:text-gray-400 absolute bottom-0 left-0">........</span>
                                </div>
                                <span className="text-sm font-light text-gray-800 dark:text-gray-200 whitespace-nowrap ml-1">เดือน</span>
                                <div className="relative border-b border-dotted border-gray-500 dark:border-gray-400 flex-1 pb-0.5 min-h-[1.2rem]">
                                    <span className="text-xs font-light text-gray-500 dark:text-gray-400 absolute bottom-0 left-0">........</span>
                                </div>
                                <span className="text-sm font-light text-gray-800 dark:text-gray-200 whitespace-nowrap ml-1">พ.ศ.</span>
                                <div className="relative border-b border-dotted border-gray-500 dark:border-gray-400 flex-1 pb-0.5 min-h-[1.2rem]">
                                    <span className="text-xs font-light text-gray-500 dark:text-gray-400 absolute bottom-0 left-0">........</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <p className="text-md mb-2 font-normal text-gray-800 dark:text-gray-200">
                ส่วนที่ 3 สรุปการประเมินผลการปฏิบัติราชการ
            </p>
            <div className="w-full md:w-[70%] overflow-x-auto">
                <table className="min-w-[640px] w-full border-collapse border border-gray-300 dark:border-gray-600">
                    <thead className="bg-gray-50 dark:bg-gray-800">
                        <tr>
                            <th className="w-3/5 border border-gray-300 px-3 py-2 text-center text-sm font-normal text-gray-700 dark:text-gray-300">
                                องค์ประกอบการประเมิน
                            </th>
                            <th className="w-40 border border-gray-300 px-2 py-2 text-center text-sm font-normal text-gray-700 dark:text-gray-300">
                                คะแนนเต็ม
                            </th>
                            <th className={`border border-gray-300 px-1 py-2 text-center text-sm font-normal text-gray-700 dark:text-gray-300 ${isFinalized ? 'w-32' : 'w-32'}`}>
                                คะแนนที่ได้
                            </th>
                            {isFinalized && (
                                <th className="w-32 border border-gray-300 px-1 py-2 text-center text-sm font-normal text-gray-700 dark:text-gray-300">
                                    คะแนนที่ได้ (ประเมิน)
                                </th>
                            )}
                            <th className="w-32 border border-gray-300 px-1 py-2 text-center text-sm font-normal text-gray-700 dark:text-gray-300">
                                หมายเหตุ
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-zinc-900">
                        <tr>
                            <td className="border border-gray-300 px-3 py-2 text-start text-sm font-light text-gray-800 dark:text-gray-200">
                                องค์ประกอบที่ 1 : ผลสัมฤทธิ์ของงาน
                            </td>
                            <td className="border border-gray-300 px-2 py-2 text-center text-sm font-light text-gray-800 dark:text-gray-200">
                                {formatScore(MAX_SCORE_COMPONENT_1)}
                            </td>
                            <td className="border border-gray-300 px-1 py-2 text-center text-sm font-light text-gray-800 dark:text-gray-200">
                                {formatScore(performanceScoreOutOf70)}
                            </td>
                            {isFinalized && (
                                <td className="border border-gray-300 px-1 py-2 text-center text-sm font-semibold text-green-600 dark:text-green-400">
                                    {performanceScoreOutOf70Evaluated != null 
                                        ? formatScore(performanceScoreOutOf70Evaluated)
                                        : '-'}
                                </td>
                            )}
                            <td className="border border-gray-300 px-1 py-2 text-start text-sm font-light text-gray-800 dark:text-gray-200" />
                        </tr>
                        <tr>
                            <td className="border border-gray-300 px-3 py-2 text-start text-sm font-light text-gray-800 dark:text-gray-200">
                                องค์ประกอบที่ 2 : พฤติกรรมการปฏิบัติราชการ (สมรรถนะ)
                            </td>
                            <td className="border border-gray-300 px-2 py-2 text-center text-sm font-light text-gray-800 dark:text-gray-200">
                                {formatScore(MAX_SCORE_COMPONENT_2)}
                            </td>
                            <td className="border border-gray-300 px-1 py-2 text-center text-sm font-light text-gray-800 dark:text-gray-200">
                                {formatScore(performanceScoreOutOf30)}
                            </td>
                            {isFinalized && (
                                <td className="border border-gray-300 px-1 py-2 text-center text-sm font-semibold text-green-600 dark:text-green-400">
                                    {performanceScoreOutOf30Evaluated != null 
                                        ? formatScore(performanceScoreOutOf30Evaluated)
                                        : '-'}
                                </td>
                            )}
                            <td className="border border-gray-300 px-1 py-2 text-start text-sm font-light text-gray-800 dark:text-gray-200" />
                        </tr>
                        <tr>
                            <td className="border border-gray-300 px-3 py-2 text-start text-sm font-light text-gray-800 dark:text-gray-200">
                                องค์ประกอบอื่น ๆ (ถ้ามี)
                            </td>
                            <td className="border border-gray-300 px-2 py-2 text-start text-sm font-light text-gray-800 dark:text-gray-200" />
                            <td className="border border-gray-300 px-1 py-2 text-start text-sm font-light text-gray-800 dark:text-gray-200" />
                            {isFinalized && (
                                <td className="border border-gray-300 px-1 py-2 text-start text-sm font-light text-gray-800 dark:text-gray-200" />
                            )}
                            <td className="border border-gray-300 px-1 py-2 text-start text-sm font-light text-gray-800 dark:text-gray-200" />
                        </tr>
                        <tr>
                            <td className="border border-gray-300 px-3 py-2 text-end text-sm font-normal text-gray-800 dark:text-gray-200">
                                รวม (7) + (8)
                            </td>
                            <td className="border border-gray-300 px-2 py-2 text-center text-sm font-light text-gray-800 dark:text-gray-200">
                                {formatScore(totalMaxScore)}
                            </td>
                            <td className="border border-gray-300 px-1 py-2 text-center text-sm font-semibold text-blue-600 dark:text-gray-100">
                                {formatScore(totalScore)}
                            </td>
                            {isFinalized && (
                                <td className="border border-gray-300 px-1 py-2 text-center text-sm font-semibold text-green-600 dark:text-green-400">
                                    {(() => {
                                        const evaluatedScore = (Number.isFinite(performanceScoreOutOf70Evaluated ?? null) ? (performanceScoreOutOf70Evaluated ?? 0) : 0) +
                                            (Number.isFinite(performanceScoreOutOf30Evaluated ?? null) ? (performanceScoreOutOf30Evaluated ?? 0) : 0)
                                        return formatScore(evaluatedScore)
                                    })()}
                                </td>
                            )}
                            <td className="border border-gray-300 px-1 py-2 text-start text-sm font-light text-gray-800 dark:text-gray-200" />
                        </tr>
                    </tbody>
                </table>
            </div>

            <div className="mt-4">
                <p className="text-md mb-2 font-normal text-gray-800 dark:text-gray-200">
                    ระดับผลการประเมิน
                </p>
                <div className="flex flex-col gap-3">
                    {evaluationLevels.map((level) => {
                        const isActive =
                            normalizedPercentage >= level.min && normalizedPercentage <= level.max
                        return (
                            <label
                                key={level.label}
                                className={`flex items-center gap-3 text-sm ${
                                    isActive
                                        ? 'text-business1 font-semibold'
                                        : 'text-gray-700 dark:text-gray-200'
                                }`}
                            >
                                <input
                                    type="checkbox"
                                    checked={isActive}
                                    disabled
                                    className={`h-4 w-4 cursor-default ${isActive ? 'checkbox-business1' : ''}`}
                                    style={{
                                        accentColor: isActive ? '#2E4497' : undefined,
                                    }}
                                />
                                <span className="flex flex-row gap-2 leading-tight">
                                    <span className="text-sm font-light">{level.label}</span>
                                    <span className="text-sm font-light">{level.description}</span>
                                    {isActive && isFinalized && (
                                        <span className="text-sm font-light text-green-600 dark:text-green-400">
                                            (ประเมินจากผู้ตรวจ)
                                        </span>
                                    )}
                                </span>
                            </label>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}

export default Section3