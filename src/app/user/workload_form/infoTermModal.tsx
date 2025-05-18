"use client"

import { CalendarClock } from "lucide-react"
import type { Terms, WorkloadGroup } from "@/Types"
import useAuthHeaders from "@/hooks/Header"
import { useEffect, useState, useRef } from "react"
import axios from "axios"

interface CheckWorkloadGroupResponse {
  workload_group_id: number | null
  workload_group_name: string | null
}

interface InfoHoverModalProps {
  workloadGroupInfo: CheckWorkloadGroupResponse | null
  isOpen: boolean
}

export default function InfoHoverModal({ workloadGroupInfo, isOpen }: InfoHoverModalProps) {
  const [terms, setTerms] = useState<Terms[]>([])
  const [, setWorkloadGroups] = useState<WorkloadGroup[]>([])
  const [taskNames, setTaskNames] = useState<string[]>([])
  const headers = useAuthHeaders()
  const modalRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const responseTerms = await axios.get(`${process.env.NEXT_PUBLIC_API}/workload_form/terms`, { headers })
        const responseWorkloadGroups = await axios.get(`${process.env.NEXT_PUBLIC_API}/workload_group`, {
          headers,
        })

        const termsData = responseTerms.data.data
        const workloadGroupsData = responseWorkloadGroups.data.data

        setTerms(termsData)
        setWorkloadGroups(workloadGroupsData)

        if (Array.isArray(termsData) && termsData.length > 0) {
          const uniqueTaskNames = [...new Set(termsData.map((term) => term.task_name))]
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

    const item = terms.find((term) => term.task_name === taskName && term.workload_group_name === groupName)
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
      className="absolute z-50 top-7 right-0 w-auto bg-white dark:bg-zinc-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 transition-opacity duration-200 ease-in-out"
    >
      <div className="p-4 max-h-[80vh] overflow-auto">
        <div className="flex items-center mb-4">
          <CalendarClock className="text-blue-500 dark:text-blue-400 mr-2 w-7 h-7" />
          <h3 className="text-xl font-medium text-gray-700 dark:text-gray-300 truncate">
            เกณฑ์การประเมินภาระงานของกลุ่มภาระงาน: {selectedGroupName}
          </h3>
        </div>

        <div className="overflow-x-auto">
          {Array.isArray(terms) && terms.length > 0 && (
            <table className="w-full bg-white border border-gray-300 dark:bg-zinc-900 dark:border-gray-700">
              <thead className="bg-gray-100 dark:bg-zinc-800">
                <tr>
                  <th className="py-3 px-4 border-b border-r border-gray-300 dark:border-gray-700 text-left text-gray-700 dark:text-gray-300">
                    ภาระงาน
                  </th>
                  <th className="py-2 px-4 border-b border-r border-gray-300 dark:border-gray-700 text-center font-normal text-gray-600 dark:text-gray-300 text-md text-nowrap bg-green-200 dark:bg-green-700/50">
                    {selectedGroupName}
                    <div className="text-xs text-gray-500 dark:text-gray-400 text-nowrap">(ภาระงานต่อสัปดาห์)</div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {taskNames.map((taskName, taskIndex) => (
                  <tr key={taskIndex} className="hover:bg-gray-50 dark:hover:bg-zinc-800/50">
                    <td className="py-2 px-4 border-b border-r border-gray-300 dark:border-gray-700 font-normal text-md text-gray-700 dark:text-gray-300 text-nowrap">
                      {taskIndex + 1}. {taskName}
                    </td>
                    <td className="py-2 px-4 border-b border-r border-gray-300 dark:border-gray-700 text-center text-gray-500 dark:text-gray-400 bg-green-100 dark:bg-green-800/30">
                      {getWorkloadHours(taskName, selectedGroupName)}
                    </td>
                  </tr>
                ))}
                <tr className="bg-gray-100 dark:bg-zinc-800 font-bold">
                  <td className="py-2 px-4 border-b border-r border-gray-300 dark:border-gray-700 font-normal text-center text-gray-600 dark:text-gray-300">
                    ผลรวม (ไม่น้อยกว่า)
                  </td>
                  <td className="py-2 px-4 border-b border-r border-gray-300 dark:border-gray-700 text-center text-business1 dark:text-blue-400 font-normal bg-green-200 dark:bg-green-700/50">
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
