'use client'

import { CalendarClock } from 'lucide-react'
import type { Terms, WorkloadGroup } from '@/Types'
import useAuthHeaders from '@/hooks/Header'
import { useEffect, useState, useRef } from 'react'
import axios from 'axios'

interface CheckWorkloadGroupResponse {
  workload_group_id: number | null
  workload_group_name: string | null
}

interface InfoHoverModalProps {
  workloadGroupInfo: CheckWorkloadGroupResponse | null
  isOpen: boolean
}

export default function InfoHoverModal({
  workloadGroupInfo,
  isOpen,
}: InfoHoverModalProps) {
  const [terms, setTerms] = useState<Terms[]>([])
  const [, setWorkloadGroups] = useState<WorkloadGroup[]>([])
  const [taskNames, setTaskNames] = useState<string[]>([])
  const headers = useAuthHeaders()
  const modalRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const responseTerms = await axios.get(
          `${process.env.NEXT_PUBLIC_API}/workload_form/terms`,
          { headers }
        )
        const responseWorkloadGroups = await axios.get(
          `${process.env.NEXT_PUBLIC_API}/workload_group`,
          {
            headers,
          }
        )

        const termsData = responseTerms.data.data
        const workloadGroupsData = responseWorkloadGroups.data.data

        setTerms(termsData)
        setWorkloadGroups(workloadGroupsData)

        if (Array.isArray(termsData) && termsData.length > 0) {
          const uniqueTaskNames = [
            ...new Set(termsData.map((term) => term.task_name)),
          ]
          setTaskNames(uniqueTaskNames)
        }
      } catch (error) {
        console.error(error)
      }
    }

    if (isOpen) {
      fetchData()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen])

  const getWorkloadHours = (taskName: string, groupName: string) => {
    if (!Array.isArray(terms)) return 0

    const item = terms.find(
      (term) =>
        term.task_name === taskName && term.workload_group_name === groupName
    )
    return item ? item.quantity_workload_hours : 0
  }

  const calculateGroupTotal = (groupName: string) => {
    if (!Array.isArray(terms)) return 0

    let total = 0
    taskNames.forEach((taskName) => {
      total += getWorkloadHours(taskName, groupName)
    })
    return total
  }

  if (!isOpen || !workloadGroupInfo?.workload_group_name) return null

  const selectedGroupName = workloadGroupInfo.workload_group_name

  return (
    <div
      ref={modalRef}
      className="absolute right-0 top-7 z-50 w-auto rounded-lg border border-gray-200 bg-white shadow-xl transition-opacity duration-200 ease-in-out dark:border-gray-700 dark:bg-zinc-800"
    >
      <div className="max-h-[80vh] overflow-auto p-4">
        <div className="mb-4 flex items-center">
          <CalendarClock className="mr-2 h-7 w-7 text-blue-500 dark:text-blue-400" />
          <h3 className="truncate text-xl font-medium text-gray-700 dark:text-gray-300">
            เกณฑ์การประเมินภาระงานของกลุ่มภาระงาน: {selectedGroupName}
          </h3>
        </div>

        <div className="overflow-x-auto">
          {Array.isArray(terms) && terms.length > 0 && (
            <table className="w-full border border-gray-300 bg-white dark:border-gray-700 dark:bg-zinc-900">
              <thead className="bg-gray-100 dark:bg-zinc-800">
                <tr>
                  <th className="border-b border-r border-gray-300 px-4 py-3 text-left text-gray-700 dark:border-gray-700 dark:text-gray-300">
                    ภาระงาน
                  </th>
                  <th className="text-md text-nowrap border-b border-r border-gray-300 bg-green-200 px-4 py-2 text-center font-normal text-gray-600 dark:border-gray-700 dark:bg-green-700/50 dark:text-gray-300">
                    {selectedGroupName}
                    <div className="text-nowrap text-xs text-gray-500 dark:text-gray-400">
                      (ภาระงานต่อสัปดาห์)
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {taskNames.map((taskName, taskIndex) => (
                  <tr
                    key={taskIndex}
                    className="hover:bg-gray-50 dark:hover:bg-zinc-800/50"
                  >
                    <td className="text-md text-nowrap border-b border-r border-gray-300 px-4 py-2 font-normal text-gray-700 dark:border-gray-700 dark:text-gray-300">
                      {taskIndex + 1}. {taskName}
                    </td>
                    <td className="border-b border-r border-gray-300 bg-green-100 px-4 py-2 text-center text-gray-500 dark:border-gray-700 dark:bg-green-800/30 dark:text-gray-400">
                      {getWorkloadHours(taskName, selectedGroupName)}
                    </td>
                  </tr>
                ))}
                <tr className="bg-gray-100 font-bold dark:bg-zinc-800">
                  <td className="border-b border-r border-gray-300 px-4 py-2 text-center font-normal text-gray-600 dark:border-gray-700 dark:text-gray-300">
                    ผลรวม (ไม่น้อยกว่า)
                  </td>
                  <td className="border-b border-r border-gray-300 bg-green-200 px-4 py-2 text-center font-normal text-business1 dark:border-gray-700 dark:bg-green-700/50 dark:text-blue-400">
                    {calculateGroupTotal(selectedGroupName)}
                  </td>
                </tr>
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}
