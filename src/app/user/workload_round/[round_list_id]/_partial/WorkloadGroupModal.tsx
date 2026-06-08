'use client'

import type { WorkloadGroup } from '@/Types'
import ConfirmModal from './confirmWorkloadModal'

interface WorkloadGroupModalProps {
  terms: any[]
  workloadGroups: WorkloadGroup[]
  selectedWorkloadGroup: WorkloadGroup | null
  setSelectedWorkloadGroup: (group: WorkloadGroup) => void
  handleSelectWorkloadGroup: (group: WorkloadGroup) => void | Promise<void>
}

export default function WorkloadGroupModal({
  terms,
  workloadGroups,
  selectedWorkloadGroup,
  setSelectedWorkloadGroup,
  handleSelectWorkloadGroup,
}: WorkloadGroupModalProps) {
  return (
    <div className="space-y-4">
      <div className="rounded-md bg-white px-4 pt-4 pb-1 shadow dark:bg-zinc-900 dark:text-gray-400">
        <h2 className="text-lg font-medium text-gray-700 dark:text-gray-300">เกณฑ์การประเมินภาระงานของแต่ละด้านภาระงาน</h2>
        <div className="my-4 overflow-x-auto" style={{ minHeight: 'calc(5 * 3rem + 3.5rem)' }}>
          {Array.isArray(terms) && terms.length > 0 ? (() => {
            // กรอง terms ให้เหลือเฉพาะคู่ task-group ที่มีค่า minimum จริง (quantity > 0 หรือไม่เป็น null/ว่าง)
            const effectiveTerms = terms.filter((t: any) => t && t.workload_group_name && t.task_name && t.quantity_workload_hours != null && String(t.quantity_workload_hours).trim() !== '' && Number(t.quantity_workload_hours) > 0)

            // ลำดับคอลัมน์กลุ่มภาระงานตามลำดับจาก database (workload_group_id)
            // ใช้ลำดับจาก workloadGroups ที่เรียงแล้วตาม workload_group_id
            const presentGroupSet = new Set(effectiveTerms.map((t: any) => t.workload_group_name))

            // สร้าง Map สำหรับเก็บลำดับ workload_group_id จาก workloadGroups
            const groupOrderMap = new Map<number, string>()
            if (Array.isArray(workloadGroups) && workloadGroups.length > 0) {
              workloadGroups.forEach((g: any) => {
                if (presentGroupSet.has(g.workload_group_name)) {
                  groupOrderMap.set(g.workload_group_id, g.workload_group_name)
                }
              })
            }

            // เรียง groups ตาม workload_group_id จาก database
            let groups: string[] = []
            if (groupOrderMap.size > 0) {
              groups = Array.from(groupOrderMap.entries())
                .sort((a, b) => a[0] - b[0]) // เรียงตาม workload_group_id
                .map(([, name]) => name)
            } else {
              // ถ้าไม่มี groups จาก workloadGroups ให้ใช้จาก terms โดยเรียงตาม workload_group_id
              const groupMap = new Map<number, string>()
              effectiveTerms.forEach((t: any) => {
                if (t.workload_group_id && !groupMap.has(t.workload_group_id)) {
                  groupMap.set(t.workload_group_id, t.workload_group_name)
                }
              })
              groups = Array.from(groupMap.entries())
                .sort((a, b) => a[0] - b[0])
                .map(([, name]) => name)
            }

            // ลำดับแถวภาระงาน: เรียงตาม task_id จาก database
            const taskMap = new Map<number, string>()
            effectiveTerms.forEach((t: any) => {
              if (t.task_id && !taskMap.has(t.task_id)) {
                taskMap.set(t.task_id, t.task_name)
              }
            })

            // เรียง tasks ตาม task_id จาก database
            const tasks = Array.from(taskMap.entries())
              .sort((a, b) => a[0] - b[0]) // เรียงตาม task_id
              .map(([, name]) => name)
            const getQty = (taskName: string, groupName: string) => {
              const found = effectiveTerms.find((t: any) => t.task_name === taskName && t.workload_group_name === groupName)
              return found?.quantity_workload_hours ?? ''
            }
            // คำนวณผลรวมต่อกลุ่ม
            const groupTotals: Record<string, number> = {}
            groups.forEach((g) => {
              groupTotals[g as string] = effectiveTerms
                .filter((t: any) => t.workload_group_name === g)
                .reduce((sum: number, t: any) => sum + (Number(t.quantity_workload_hours) || 0), 0)
            })
            return (
              <table className="w-full border border-gray-300 bg-white dark:border-gray-700 dark:bg-zinc-900">
                <thead className="bg-gray-100 dark:bg-zinc-800">
                  <tr>
                    <th className="font-normal border-b border-r border-gray-300 px-4 py-3 text-center text-gray-700 dark:text-gray-300">ภาระงาน</th>
                    {groups.map((g) => (
                      <th key={g} className="font-normal border-b border-r border-gray-300 px-4 py-3 text-center text-gray-700 dark:text-gray-300">{g}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {tasks.map((task) => (
                    <tr key={task} className="hover:bg-gray-50 dark:hover:bg-zinc-800">
                      <td className="font-light border-b border-r border-gray-300 px-4 py-3 text-gray-700">{task}</td>
                      {groups.map((g) => (
                        <td key={`${task}-${g}`} className="font-light border-b border-r border-gray-300 px-4 py-3 text-center text-gray-700">{getQty(task as string, g as string)}</td>
                      ))}
                    </tr>
                  ))}
                  <tr className="bg-gray-50 dark:bg-zinc-800">
                    <td className="font-normal border-b border-r border-gray-300 px-4 py-3 text-right text-gray-700">รวม</td>
                    {groups.map((g) => (
                      <td key={`total-${g}`} className="border-b border-r border-gray-300 px-4 py-3 text-center text-business1 font-normal">{groupTotals[g as string]}</td>
                    ))}
                  </tr>
                </tbody>
              </table>
            )
          })() : (
            <div className="p-4 text-center text-gray-500">ไม่มีข้อมูล terms</div>
          )}
        </div>
      </div>

      <div className="rounded-md bg-white p-4 shadow dark:bg-zinc-900 dark:text-gray-400">
        <h2 className="text-lg font-medium text-gray-700 dark:text-gray-300">กรุณาเลือกภาระงานก่อน</h2>
        <div className="mt-4 flex flex-wrap gap-2 min-h-[2.5rem]">
          {Array.isArray(workloadGroups) && workloadGroups.length > 0 ? (
            // เรียงลำดับตาม workload_group_id ก่อนแสดง
            [...workloadGroups]
              .sort((a, b) => a.workload_group_id - b.workload_group_id)
              .map((group: WorkloadGroup) => (
              <label
                key={group.workload_group_id}
                htmlFor={`confirm-modal`}
                onClick={() => setSelectedWorkloadGroup(group)}
                className="cursor-pointer rounded bg-business1 px-4 py-2 text-white hover:bg-business1/90"
              >
                {group.workload_group_name}
              </label>
            ))
          ) : (
            <div className="w-full rounded bg-yellow-100 p-4 text-yellow-800">
              <p className="font-medium">ไม่พบข้อมูลกลุ่มภาระงาน</p>
              <p className="text-sm">กรุณาติดต่อผู้ดูแลระบบ</p>
            </div>
          )}
        </div>
        <ConfirmModal
          workload_group={selectedWorkloadGroup}
          handleSelectWorkloadGroup={handleSelectWorkloadGroup}
        />
      </div>
    </div>
  )
}
