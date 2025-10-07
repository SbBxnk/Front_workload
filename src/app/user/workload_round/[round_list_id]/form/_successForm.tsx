'use client'
import React from 'react'
import type { Terms } from '@/Types'

interface _successFormProps {
  terms?: Terms[]
  selectedGroupName?: string
}

export default function _successForm({ terms = [], selectedGroupName }: _successFormProps) {
  // ดึงรายการภาระงานที่ไม่ซ้ำกันจากข้อมูล API
  const uniqueTasks = Array.isArray(terms)
    ? [...new Set(terms.map((term) => term.task_name))]
    : []

  // แสดงเฉพาะกลุ่มงานที่เลือก
  const uniqueGroups = selectedGroupName 
    ? [selectedGroupName]
    : Array.isArray(terms)
    ? [...new Set(terms.map((term) => term.workload_group_name))]
    : []

  // ฟังก์ชันหาจำนวนชั่วโมงตามภาระงานและกลุ่มงาน
  const getWorkloadHours = (taskName: string, groupName: string) => {
    if (!Array.isArray(terms)) return 0

    const item = terms.find(
      (term) =>
        term.task_name === taskName && term.workload_group_name === groupName
    )
    return item ? item.quantity_workload_hours : 0
  }

  // คำนวณผลรวมของแต่ละกลุ่ม
  const calculateGroupTotal = (groupName: string) => {
    if (!Array.isArray(terms)) return 0

    let total = 0
    uniqueTasks.forEach((taskName) => {
      total += getWorkloadHours(taskName, groupName)
    })
    return total
  }

  return (
    <div className="space-y-4">
      {Array.isArray(terms) && terms.length > 0 && (
        <div className="rounded-md bg-white px-4 pt-4 pb-1 shadow transition-all duration-300 ease-in-out dark:bg-zinc-900 dark:text-gray-400">
          <h2 className="text-lg font-medium text-gray-700">
            {selectedGroupName 
              ? `เกณฑ์การประเมินภาระงานของกลุ่มภาระงาน: ${selectedGroupName}`
              : 'เกณฑ์การประเมินภาระงานของแต่ละด้านภาระงาน'
            }
          </h2>
          <div className="my-4 overflow-x-auto">
            <table className="w-full overflow-x-auto border border-gray-300 bg-white dark:border-gray-700 dark:bg-zinc-900 md:table-auto">
              <thead className="bg-gray-100 dark:bg-zinc-800">
                <tr>
                  <th className="border-b border-r border-gray-300 px-4 py-3 text-left text-gray-700 dark:text-gray-300"></th>
                  {uniqueGroups.map((group, index) => (
                    <th
                      key={index}
                      className="text-md text-nowrap border-b border-r border-gray-300 bg-green-200 px-4 py-2 text-center font-normal text-gray-600 dark:bg-green-700/50 dark:text-gray-300"
                    >
                      {group}
                      <div className="text-nowrap text-xs text-gray-500 dark:text-gray-400">
                        (ภาระงานต่อสัปดาห์)
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {uniqueTasks.map((taskName, taskIndex) => (
                  <tr
                    key={taskIndex}
                    className="hover:bg-gray-50 dark:hover:bg-zinc-800"
                  >
                    <td className="text-md text-nowrap border-b border-r border-gray-300 px-4 py-2 font-normal text-gray-700">
                      {taskIndex + 1}. {taskName}
                    </td>
                    {uniqueGroups.map((group, groupIndex) => (
                      <td
                        key={groupIndex}
                        className="border-b border-r border-gray-300 bg-green-100 px-4 py-2 text-center text-gray-500 dark:bg-green-800/30 dark:text-gray-400"
                      >
                        {getWorkloadHours(taskName, group)}
                      </td>
                    ))}
                  </tr>
                ))}
                <tr className="bg-gray-100 font-bold dark:bg-zinc-800">
                  <td className="border-b border-r border-gray-300 px-4 py-2 text-center font-normal text-gray-600">
                    ผลรวม (ไม่น้อยกว่า)
                  </td>
                  {uniqueGroups.map((group, groupIndex) => (
                    <td
                      key={groupIndex}
                      className="border-b border-r border-gray-300 bg-green-200 px-4 py-2 text-center font-normal text-business1 dark:bg-green-700/50 dark:text-blue-400"
                    >
                      {calculateGroupTotal(group)}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}