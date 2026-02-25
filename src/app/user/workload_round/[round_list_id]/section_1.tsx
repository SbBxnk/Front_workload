'use client'

import React from 'react'
import { AlertCircle, FileText, ImageIcon, LinkIcon } from 'lucide-react'
import type { Terms } from '@/Types'
import type { Task } from './types'

interface Section1Props {
  mergedTasks: Task[]
  terms?: Terms[]
  selectedGroupName?: string
  totalPerformanceWorkload: number
  performanceScoreOutOf70: number
  performanceScoreOutOf70Evaluated?: number
  isImageFile: (fileName: string | null | undefined) => boolean
  formlistStatus?: number | null
}

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
  const baseUrl = process.env.NEXT_PUBLIC_API?.replace('/api', '') || 'http://localhost:3333'

  // ฟังก์ชันสำหรับ format ตัวเลข: แสดงจำนวนเต็มถ้าไม่มีทศนิยม, แสดงทศนิยมถ้ามี
  const formatNumber = (num: number): string => {
    if (!Number.isFinite(num)) return '-'
    const rounded = Number(num.toFixed(2))
    return Number.isInteger(rounded) ? rounded.toString() : num.toFixed(2)
  }

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
                  <React.Fragment key={task.task_id}>
                    <tr className="bg-business1 text-white dark:bg-zinc-900">
                      <td colSpan={isFinalized ? 7 : 6} className="border border-gray-300 dark:border-gray-700 px-4 py-3 dark:text-gray-200 font-normal">
                        <div className="flex items-center justify-between">
                          <span>
                            {task.task_id}. {task?.task_name || 'Unknown Task'} (ภาระงานขั้นต่ำ)
                          </span>
                          {task.quantity_workload_hours && (
                            <span className="text-sm bg-white dark:bg-blue-500 dark:text-white text-business1 px-2 py-1 rounded">
                              {task.quantity_workload_hours} ภาระงาน/สัปดาห์
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>

                    {Object.values(task.subtasks).map((subtask, subtaskIndex) => (
                      <React.Fragment key={subtask.subtask_id}>
                        <tr className="bg-gray-50 dark:bg-gray-800/50">
                          <td colSpan={isFinalized ? 7 : 6} className="border border-gray-300 dark:border-gray-700 px-4 py-2 text-gray-700 dark:text-gray-300">
                            <div className="ml-6 flex items-center gap-2">
                              <span className="text-sm">
                                {task.task_id}.{subtaskIndex + 1} {subtask?.subtask_name || 'Unknown Subtask'}
                              </span>
                            </div>
                          </td>
                        </tr>

                        {(subtask.form_infos.length === 0 ? [null] : subtask.form_infos).map((formInfo, index) =>
                          formInfo === null ? (
                            <tr key={`placeholder-${task.task_id}-${subtask.subtask_id}`}>
                              <td className={`border border-gray-300 dark:border-gray-700 px-4 py-2 text-gray-500 dark:text-gray-400 ${isFinalized ? 'w-[280px]' : 'min-w-[280px] max-w-[420px]'}`}>
                                <div className="ml-12 text-sm">-</div>
                              </td>
                              <td className="border border-gray-300 dark:border-gray-700 px-4 py-2 text-left text-gray-500 dark:text-gray-400 text-sm">
                                -
                              </td>
                              <td className="border border-gray-300 dark:border-gray-700 px-4 py-2 text-center text-gray-500 dark:text-gray-400 text-sm">
                                -
                              </td>
                              <td className="border border-gray-300 dark:border-gray-700 px-4 py-2 text-center text-gray-500 dark:text-gray-400 text-sm">
                                -
                              </td>
                              <td className="border border-gray-300 dark:border-gray-700 px-4 py-2 text-center text-gray-500 dark:text-gray-400 text-sm">
                                -
                              </td>
                              {isFinalized && (
                                <td className="border border-gray-300 dark:border-gray-700 px-4 py-2 text-center text-gray-500 dark:text-gray-400 text-sm">
                                  -
                                </td>
                              )}
                              <td className="border border-gray-300 dark:border-gray-700 px-4 py-2 text-left text-gray-500 dark:text-gray-400 text-sm">
                                -
                              </td>
                            </tr>
                          ) : (
                            <tr key={`${task.task_id}-${subtask.subtask_id}-${formInfo.form_id}-${index}`}>
                              <td className={`border border-gray-300 dark:border-gray-700 px-4 py-2 text-gray-800 dark:text-gray-200 ${isFinalized ? 'w-[280px]' : 'min-w-[280px] max-w-[420px]'}`}>
                                <div className="ml-12 flex items-center gap-2">
                                  <div>
                                    <div className={`font-light text-sm dark:text-gray-200 ${isFinalized ? 'w-[280px]' : 'min-w-[280px] max-w-[420px]'}`}>
                                      {task.task_id}.{subtaskIndex + 1}.{index + 1} {formInfo.form_title}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="border border-gray-300 dark:border-gray-700 px-4 py-2 text-left text-blue-600 dark:text-white text-sm max-w-[200px]">
                                <div className="space-y-1">
                                  {formInfo.files && formInfo.files.length > 0 ? (
                                    formInfo.files.map((file, fileIndex) => (
                                      <button
                                        key={`file-${formInfo.form_id}-${fileIndex}`}
                                        onClick={() => {
                                          window.open(`${baseUrl}/files/${file.file_name}`, '_blank')
                                        }}
                                        className="inline-flex items-center text-sm text-blue-600 transition-colors duration-150 hover:text-blue-700 hover:underline dark:text-white dark:hover:text-blue-300 w-full"
                                        title={file.file_name}
                                      >
                                        {isImageFile(file.file_name) ? (
                                          <ImageIcon className="mr-2 h-4 w-4 text-blue-500 dark:text-white" />
                                        ) : (
                                          <FileText className="mr-2 h-4 w-4 text-blue-500 dark:text-white" />
                                        )}
                                        <span className="max-w-32 truncate">{file.file_name}</span>
                                      </button>
                                    ))
                                  ) : formInfo.links && formInfo.links.length > 0 ? (
                                    formInfo.links.map((link, linkIndex) => (
                                      <button
                                        key={`link-${formInfo.form_id}-${linkIndex}`}
                                        onClick={() => {
                                          let url = link.link_path || ''
                                          if (!url.startsWith('http://') && !url.startsWith('https://')) {
                                            url = `https://${url}`
                                          }
                                          window.open(url, '_blank')
                                        }}
                                        className="inline-flex items-center text-sm text-blue-600 transition-colors duration-150 hover:text-blue-700 hover:underline dark:text-white dark:hover:text-blue-300 w-full"
                                        title={link.link_path}
                                      >
                                        <LinkIcon className="mr-2 h-4 w-4 text-blue-500 dark:text-white" />
                                        <span className="max-w-32 truncate">{link.link_name}</span>
                                      </button>
                                    ))
                                  ) : (
                                    <span className="text-gray-500 dark:text-gray-400">-</span>
                                  )}
                                </div>
                              </td>
                              <td className="border border-gray-300 dark:border-gray-700 px-4 py-2 text-center dark:text-white font-light text-sm">
                                {formInfo.quality}
                              </td>
                              <td className="border border-gray-300 dark:border-gray-700 px-4 py-2 text-center dark:text-white font-light text-sm">
                                {formInfo.workload}
                              </td>
                              <td className="border border-gray-300 dark:border-gray-700 px-4 py-2 text-center text-blue-600 font-normal  text-sm">
                                {formInfo.quality * formInfo.workload}
                              </td>
                              {isFinalized && (
                                <td className="border border-gray-300 dark:border-gray-700 px-4 py-2 text-center text-green-600 font-semibold  text-sm">
                                  {(formInfo as any).evaluation_score != null 
                                    ? formatNumber(Number((formInfo as any).evaluation_score))
                                    : '-'}
                                </td>
                              )}
                              <td className="border border-gray-300 dark:border-gray-700 px-4 py-2 text-left dark:text-white text-sm font-light break-words whitespace-normal max-w-[200px]">
                                {formInfo.description && formInfo.description !== '-' ? formInfo.description : '-'}
                              </td>
                            </tr>
                          )
                        )}
                      </React.Fragment>
                    ))}

                    <tr className="dark:bg-blue-900/20 dark:border-blue-700">
                      <td colSpan={4} className="border border-gray-300 dark:border-gray-700 px-4 py-2 text-right font-light dark:text-white text-sm">
                        รวมภาระงาน
                      </td>
                      <td
                        className={`border border-gray-300 dark:border-gray-700 px-4 py-2 text-center text-blue-600 font-bold  text-sm ${task.quantity_workload_hours &&
                          Object.values(task.subtasks).reduce(
                            (subSum, subtask) =>
                              subSum +
                              subtask.form_infos.reduce((formSum, formInfo) => formSum + formInfo.quality * formInfo.workload, 0),
                            0
                          ) < task.quantity_workload_hours
                          ? 'text-red-500'
                          : ''
                          }`}
                      >
                        {(() => {
                          const hasAny = Object.values(task.subtasks).some((st) => st.form_infos.length > 0)
                          const total = Object.values(task.subtasks).reduce(
                            (subSum, subtask) =>
                              subSum +
                              subtask.form_infos.reduce((formSum, formInfo) => formSum + formInfo.quality * formInfo.workload, 0),
                            0
                          )
                          return hasAny ? total : '-'
                        })()}
                      </td>
                      {isFinalized && (
                        <td className="border border-gray-300 dark:border-gray-700 px-4 py-2 text-center text-green-600 font-bold  text-sm">
                          {(() => {
                            const hasAny = Object.values(task.subtasks).some((st) => st.form_infos.length > 0)
                            const total = Object.values(task.subtasks).reduce(
                              (subSum, subtask) =>
                                subSum +
                                subtask.form_infos.reduce((formSum, formInfo: any) => {
                                  if (formInfo.evaluation_score != null) {
                                    return formSum + Number(formInfo.evaluation_score)
                                  }
                                  return formSum
                                }, 0),
                              0
                            )
                            return hasAny ? formatNumber(total) : '-'
                          })()}
                        </td>
                      )}
                      <td className="border border-gray-300 dark:border-gray-700 px-4 py-2 text-left " />
                    </tr>
                  </React.Fragment>
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
                  mergedTasks.map((task, index) => {
                    const hasAny = Object.values(task.subtasks).some((st) => st.form_infos.length > 0)
                    const taskTotal = Object.values(task.subtasks).reduce(
                      (subSum, subtask) =>
                        subSum + subtask.form_infos.reduce((formSum, formInfo) => formSum + formInfo.quality * formInfo.workload, 0),
                      0
                    )

                    const displayTaskName = task?.task_name ? (task?.task_id ? `${task.task_id}. ${task.task_name}` : task.task_name) : ''

                    const workloadGroups: Array<{ name: string; hours: { [key: string]: number } }> = []
                    if (terms && terms.length > 0) {
                      const uniqueGroups = [...new Set(terms.map((term) => term.workload_group_name))]
                      uniqueGroups.forEach((groupName) => {
                        const hours: { [key: string]: number } = {}
                        terms.forEach((term) => {
                          if (term.workload_group_name === groupName) {
                            hours[term.task_name] = term.quantity_workload_hours
                          }
                        })
                        if (Object.values(hours).some((h) => h > 0)) {
                          workloadGroups.push({ name: groupName ?? '', hours })
                        }
                      })
                    }

                    const hasGroupMinimum = workloadGroups.some((g) => !!g.hours[task.task_name])
                    const groupCountWithMinimum = workloadGroups.filter((g) => !!g.hours[task.task_name]).length
                    const rowSpanValue = hasGroupMinimum ? groupCountWithMinimum + 1 : 1

                    return (
                      <React.Fragment key={task.task_id}>
                        <tr className="bg-white dark:bg-zinc-900">
                          <td
                            className={`px-4 py-2 text-gray-500 dark:text-white font-light text-sm ${isFinalized ? 'w-[280px]' : 'min-w-[320px]'} ${index > 0 ? 'border-t border-l border-r border-gray-300 dark:border-gray-700' : 'border-l border-r border-gray-300 dark:border-gray-700'
                              }`}
                          >
                            {displayTaskName}
                          </td>
                          <td rowSpan={rowSpanValue} className="border border-gray-300 dark:border-gray-700 px-4 py-3 text-center font-light text-sm bg-white dark:bg-zinc-900 dark:text-white">
                            {(() => {
                              const groupMatch = workloadGroups.find((g) => Number.isFinite(g.hours[task.task_name]) && g.hours[task.task_name] > 0)
                              if (groupMatch) {
                                return `${groupMatch.hours[task.task_name]} ภาระงาน/สัปดาห์`
                              }
                              if (Number.isFinite(task.quantity_workload_hours) && (task.quantity_workload_hours ?? 0) > 0) {
                                return `${task.quantity_workload_hours}`
                              }
                              return '-'
                            })()}
                          </td>
                          <td rowSpan={rowSpanValue} className="border border-gray-300 dark:border-gray-700 text-blue-600 px-4 py-3 text-center font-light text-sm bg-white dark:bg-zinc-900">
                            {hasAny ? taskTotal : '-'}
                          </td>
                          {isFinalized && (
                            <td rowSpan={rowSpanValue} className="border border-gray-300 dark:border-gray-700 text-green-600  px-4 py-3 text-center font-semibold text-sm bg-white dark:bg-zinc-900">
                              {(() => {
                                const evalTotal = Object.values(task.subtasks).reduce(
                                  (subSum, subtask) =>
                                    subSum + subtask.form_infos.reduce((formSum, formInfo: any) => {
                                      if (formInfo.evaluation_score != null) {
                                        return formSum + Number(formInfo.evaluation_score)
                                      }
                                      return formSum
                                    }, 0),
                                  0
                                )
                                return hasAny ? formatNumber(evalTotal) : '-'
                              })()}
                            </td>
                          )}
                          <td rowSpan={rowSpanValue} className="border border-gray-300 dark:border-gray-700 px-4 py-3 text-center text-gray-500 bg-white dark:bg-zinc-900" />
                        </tr>

                        {hasGroupMinimum &&
                          workloadGroups.map((group, groupIndex) => {
                            const isSelected = selectedGroupName === group.name
                            const hourValue = group.hours[task.task_name] || 0
                            if (!(hourValue > 0)) return null

                              return (
                                <tr key={`${task.task_id}-${groupIndex}`} className="bg-white">
                                  <td className={`border-l border-r border-gray-300 dark:border-gray-700 px-4 pb-2 text-gray-800 font-light text-sm ${isFinalized ? 'w-[280px]' : 'min-w-[320px]'}`}>
                                  <div className="flex items-center gap-3">
                                    <div
                                      className={`w-4 h-4 border-2 rounded flex items-center justify-center flex-shrink-0 ${isSelected ? 'border-red-500 bg-red-500' : 'border-gray-400 bg-white'
                                        }`}
                                      role="checkbox"
                                      aria-checked={isSelected}
                                    >
                                      {isSelected && (
                                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                          <path
                                            fillRule="evenodd"
                                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                            clipRule="evenodd"
                                          />
                                        </svg>
                                      )}
                                    </div>
                                    <span className={isSelected ? 'text-red-500 font-light' : 'text-gray-700'}>
                                      {group.name} {hourValue}
                                    </span>
                                  </div>
                                </td>
                              </tr>
                            )
                          })}
                      </React.Fragment>
                    )
                  })}

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


