import React, { useMemo } from 'react'

interface Section3Props {
    performanceScoreOutOf70: number
    performanceScoreOutOf30: number
}

const MAX_SCORE_COMPONENT_1 = 70
const MAX_SCORE_COMPONENT_2 = 30

function Section3({ performanceScoreOutOf70, performanceScoreOutOf30 }: Section3Props) {
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

    const normalizedPercentage = useMemo(() => {
        if (!Number.isFinite(totalPercentage)) {
            return 0
        }
        if (totalPercentage < 0) {
            return 0
        }
        if (totalPercentage > 100) {
            return 100
        }
        return totalPercentage
    }, [totalPercentage])

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
                            <th className="w-32 border border-gray-300 px-1 py-2 text-center text-sm font-normal text-gray-700 dark:text-gray-300">
                                คะแนนที่ได้
                            </th>
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
                            <td className="border border-gray-300 px-1 py-2 text-start text-sm font-light text-gray-800 dark:text-gray-200" />
                        </tr>
                        <tr>
                            <td className="border border-gray-300 px-3 py-2 text-start text-sm font-light text-gray-800 dark:text-gray-200">
                                องค์ประกอบอื่น ๆ (ถ้ามี)
                            </td>
                            <td className="border border-gray-300 px-2 py-2 text-start text-sm font-light text-gray-800 dark:text-gray-200" />
                            <td className="border border-gray-300 px-1 py-2 text-start text-sm font-light text-gray-800 dark:text-gray-200" />
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
                                        ? 'text-blue-600 font-semibold'
                                        : 'text-gray-700 dark:text-gray-200'
                                }`}
                            >
                                <input
                                    type="checkbox"
                                    checked={isActive}
                                    readOnly
                                    className="h-4 w-4 accent-blue-600"
                                />
                                <span className="flex flex-row gap-2 leading-tight">
                                    <span className="text-sm font-light">{level.label}</span>
                                    <span className="text-sm font-light">{level.description}</span>
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