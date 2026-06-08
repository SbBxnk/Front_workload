'use client'

import React from 'react'
import { FileText, ImageIcon, LinkIcon } from 'lucide-react'
import type { Terms } from '@/Types'
import type { Task } from '../types'
import { formatNumber } from './sectionHelpers'

// ===== ตารางที่ 1: แถวของแต่ละ task (task -> subtask -> form_infos) =====
interface Section1TaskRowsProps {
  task: Task
  isFinalized: boolean
  baseUrl: string
  isImageFile: (fileName: string | null | undefined) => boolean
}

export const Section1TaskRows: React.FC<Section1TaskRowsProps> = ({
  task,
  isFinalized,
  baseUrl,
  isImageFile,
}) => {
  return (
    <React.Fragment>
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
  )
}

// ===== ตารางที่ 2: แถวสรุปภาระงานของแต่ละ task =====
interface Section1SummaryRowsProps {
  task: Task
  index: number
  terms: Terms[]
  selectedGroupName?: string
  isFinalized: boolean
}

export const Section1SummaryRows: React.FC<Section1SummaryRowsProps> = ({
  task,
  index,
  terms,
  selectedGroupName,
  isFinalized,
}) => {
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
    <React.Fragment>
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
}
