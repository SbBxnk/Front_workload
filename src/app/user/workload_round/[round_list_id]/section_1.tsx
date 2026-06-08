'use client'

import React from 'react'
import { AlertCircle } from 'lucide-react'
import { BASE_URL_FILE } from '@/provider/config'
import type { Section1Props } from './_partial/sectionTypes'
import { formatNumber } from './_partial/sectionHelpers'
import { Section1SummaryRows, Section1TaskRows } from './_partial/Section1Rows'

const Section1: React.FC<Section1Props> = ({
  mergedTasks,
  terms = [],
  selectedGroupName,
  totalPerformanceWorkload,
  performanceScoreOutOf70,
  performanceScoreOutOf70Evaluated,
  isImageFile,
  formlistStatus = null,
}) => {
  const isFinalized = formlistStatus === 2
  const baseUrl = BASE_URL_FILE

  return (
    <div className="space-y-8">
      <div className="space-y-4">
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
          <table className="w-full min-w-[1100px] border-collapse border border-gray-300 dark:border-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className={`border border-gray-300 dark:border-gray-700 px-4 py-3 text-center text-gray-700 dark:text-gray-300 font-medium ${isFinalized ? 'w-[280px]' : 'min-w-[280px] max-w-[420px]'}`}>
                  ภาระงาน/กิจกรรม/โครงการ/งาน
                  <p>(1)</p>
                </th>
                <th className="border border-gray-300 dark:border-gray-700 px-4 py-3 text-center text-gray-700 dark:text-gray-300 font-medium">
                  หลักฐาน
                  <p>(2)</p>
                </th>
                <th className="border border-gray-300 dark:border-gray-700 px-4 py-3 text-center text-gray-700 dark:text-gray-300 font-medium">
                  จำนวน
                  <p>(3)</p>
                </th>
                <th className="border border-gray-300 dark:border-gray-700 px-4 py-3 text-center text-gray-700 dark:text-gray-300 font-medium">
                  ภาระงาน
                  <p>(4)</p>
                </th>
                <th className="border border-gray-300 dark:border-gray-700 px-4 py-3 text-center text-gray-700 dark:text-gray-300 font-medium">
                  รวมภาระงาน
                  <p>(3 x 4)</p>
                </th>
                {isFinalized && (
                  <th className="border border-gray-300 dark:border-gray-700 px-4 py-3 text-center text-gray-700 dark:text-gray-300 font-medium">
                    ภาระงานจากผู้ตรวจ
                  </th>
                )}
                <th className="border border-gray-300 dark:border-gray-700 px-4 py-3 text-center text-gray-700 dark:text-gray-300 font-medium max-w-10">
                  หมายเหตุ
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-zinc-900">
              {Array.isArray(mergedTasks) && mergedTasks.length > 0 ? (
                mergedTasks.map((task) => (
                  <Section1TaskRows
                    key={task.task_id}
                    task={task}
                    isFinalized={isFinalized}
                    baseUrl={baseUrl}
                    isImageFile={isImageFile}
                  />
                ))
              ) : (
                <tr>
                  <td colSpan={isFinalized ? 7 : 6} className="border border-gray-300 dark:border-gray-700 px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                    กำลังโหลดรายการ...
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1100px] border-collapse border border-gray-300 dark:border-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className={`border border-gray-300 dark:border-gray-700 px-4 py-3 text-sm text-center text-gray-700 dark:text-gray-300 font-normal ${isFinalized ? 'w-[280px]' : 'min-w-[320px]'}`}>
                    ภาระงาน/กิจกรรม/โครงการ/งาน
                  </th>
                  <th className="border border-gray-300 dark:border-gray-700 px-4 py-3 text-sm text-center text-gray-700 dark:text-gray-300 font-normal">
                    ภาระงานต่อสัปดาห์
                  </th>
                  <th className="border border-gray-300 dark:border-gray-700 px-4 py-3 text-sm text-center text-gray-700 dark:text-gray-300 font-normal">
                    รวมภาระงาน
                  </th>
                  {isFinalized && (
                    <th className="border border-gray-300 dark:border-gray-700 px-4 py-3 text-sm text-center text-gray-700 dark:text-gray-300 font-normal">
                      ภาระงานจากผู้ตรวจ
                    </th>
                  )}
                  <th className="border border-gray-300 dark:border-gray-700 px-4 py-3 text-sm text-center text-gray-700 dark:text-gray-300 font-normal">
                    หมายเหตุ
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-white">
                {Array.isArray(mergedTasks) &&
                  mergedTasks.map((task, index) => (
                    <Section1SummaryRows
                      key={task.task_id}
                      task={task}
                      index={index}
                      terms={terms}
                      selectedGroupName={selectedGroupName}
                      isFinalized={isFinalized}
                    />
                  ))}

                <tr className="bg-white dark:bg-zinc-900 font-bold">
                  <td colSpan={2} className="border border-gray-300 dark:border-gray-700 px-4 py-3 text-end text-sm font-normal text-gray-500">รวม</td>
                  <td className="border border-gray-300 dark:border-gray-700 px-4 py-3 text-center font-semibold text-sm">
                    <span className="text-blue-600 font-bold">
                      {(() => {
                        const firstFive = Array.isArray(mergedTasks) ? mergedTasks.slice(0, 5) : []
                        const hasAny = firstFive.some((task) => Object.values(task.subtasks).some((st) => st.form_infos.length > 0))
                        // คำนวณ totalPerformanceWorkload จาก quality * workload (ไม่ใช่ evaluation_score)
                        const total = firstFive.reduce((sum, task) =>
                          sum + Object.values(task.subtasks).reduce((subSum, subtask) =>
                            subSum + subtask.form_infos.reduce((formSum, formInfo) =>
                              formSum + (formInfo.quality * formInfo.workload), 0
                            ), 0
                          ), 0
                        )
                        return hasAny ? total : '-'
                      })()}
                    </span>
                  </td>
                  {isFinalized && (
                    <td className="border border-gray-300 dark:border-gray-700 px-4 py-3 text-center font-semibold text-sm">
                      <span className="text-green-600  font-bold">
                        {(() => {
                          const firstFive = Array.isArray(mergedTasks) ? mergedTasks.slice(0, 5) : []
                          const hasAny = firstFive.some((task) => Object.values(task.subtasks).some((st) => st.form_infos.length > 0))
                          // คำนวณ total จาก evaluation_score
                          const total = firstFive.reduce((sum, task) =>
                            sum + Object.values(task.subtasks).reduce((subSum, subtask) =>
                              subSum + subtask.form_infos.reduce((formSum, formInfo: any) => {
                                if (formInfo.evaluation_score != null) {
                                  return formSum + Number(formInfo.evaluation_score)
                                }
                                return formSum
                              }, 0), 0
                            ), 0
                          )
                          return hasAny ? formatNumber(total) : '-'
                        })()}
                      </span>
                    </td>
                  )}
                  <td className="border border-gray-300 dark:border-gray-700 px-4 py-3 text-center text-gray-500" />
                </tr>
              </tbody>
            </table>
          </div>
          <div className="flex md:flex-row flex-col justify-between items-start  mt-4">
            <p className="text-md font-light text-gray-500 m-0 flex flex-wrap items-center gap-2">
              สรุปคะแนนส่วนผลสัมฤทธิ์ของงาน
              <span className="text-md font-light text-red-500 m-0">คะแนนเต็ม 70 คะแนน </span>
              <AlertCircle className="h-4 w-4" />
            </p>
            <div className="text-start md:text-end mt-2 md:mt-0">
              {isFinalized && performanceScoreOutOf70Evaluated != null ? (
                <div className="flex flex-col items-end gap-1">
                  <p className="text-md font-semibold text-blue-600 m-0">
                    <span className="text-md font-light text-gray-500">(7) คะแนนที่คาดหวัง {" "}</span>
                    {formatNumber(performanceScoreOutOf70)} <span className="text-sm font-light text-gray-500 m-0">คะแนน</span>
                  </p>
                  <p className="text-md font-semibold text-green-600 m-0">
                    <span className="text-md font-light text-gray-500">(7) คะแนนที่ได้ {" "}</span>
                    {formatNumber(performanceScoreOutOf70Evaluated)} <span className="text-sm font-light text-gray-500 m-0">คะแนน</span>
                  </p>
                </div>
              ) : (
                <p className="text-md font-semibold text-blue-600 m-0">
                  <span className="text-md font-light text-gray-500">(7) คะแนนที่คาดหวัง {" "}</span>
                  {formatNumber(performanceScoreOutOf70)} <span className="text-sm font-light text-gray-500 m-0">คะแนน</span>
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Section1
