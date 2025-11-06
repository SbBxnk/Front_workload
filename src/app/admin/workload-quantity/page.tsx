'use client'
import type React from 'react'
import { useEffect, useState, useMemo } from 'react'
import type { QuantityWorkload, MainTask, WorkloadGroup } from '@/Types'
import QuantityWorkloadServices from '@/services/quantityWorkloadServices'
import MainTaskServices from '@/services/mainTaskServices'
import WorkloadGroupServices from '@/services/workloadGroupServices'
import { useSession } from 'next-auth/react'
import Swal from 'sweetalert2'
import StickyFooter from '@/components/StickyFooter'
import useUtility from '@/hooks/useUtility'

function QuantityWorkloadMatrixTable() {
  const { data: session } = useSession()
  const { setBreadcrumbs } = useUtility()
  const [loading, setLoading] = useState<boolean>(false)
  const [mainTasks, setMainTasks] = useState<MainTask[]>([])
  const [workloadGroups, setWorkloadGroups] = useState<WorkloadGroup[]>([])
  const [quantityWorkloads, setQuantityWorkloads] = useState<QuantityWorkload[]>([])
  const [refreshKey, setRefreshKey] = useState(0)
  
  const [matrixData, setMatrixData] = useState<{
    [task_id: number]: {
      [workload_group_id: number]: {
        quantity_workload_id?: number
        quantity_workload_hours: number | null
        isNew?: boolean
      }
    }
  }>({})

  useEffect(() => {
    setBreadcrumbs(
      [{ text: 'เกณฑ์จำนวนภาระงาน', path: '/admin/workload-quantity' },
    ])
  }, [setBreadcrumbs])

  useEffect(() => {
    const fetchMainTasks = async () => {
      if (!session?.accessToken) return
      try {
        const response = await MainTaskServices.getAllMainTasks(session.accessToken, {
          search: '',
          limit: 1000,
          page: 1,
          sort: 'task_id',
          order: 'asc'
        })
        if (response.success) {
          setMainTasks(response.payload || [])
        }
      } catch (error) {
        console.error('Error fetching main tasks:', error)
      }
    }
    fetchMainTasks()
  }, [session?.accessToken])

  // Fetch workload groups
  useEffect(() => {
    const fetchWorkloadGroups = async () => {
      if (!session?.accessToken) return
      try {
        const response = await WorkloadGroupServices.getAllWorkloadGroups(session.accessToken, {
          search: '',
          limit: 1000,
          page: 1,
          sort: 'workload_group_id',
          order: 'asc'
        })
      if (response.success) {
          setWorkloadGroups(response.payload || [])
        }
      } catch (error) {
        console.error('Error fetching workload groups:', error)
      }
    }
    fetchWorkloadGroups()
  }, [session?.accessToken])

  // Fetch quantity workloads
  useEffect(() => {
    const fetchQuantityWorkloads = async () => {
      if (!session?.accessToken) return
      setLoading(true)
      try {
        const response = await QuantityWorkloadServices.getAllQuantityWorkloads(session.accessToken, {
          search: '',
          limit: 10000,
        page: 1,
          sort: 'task_id',
          order: 'asc'
        })
        if (response.success) {
          setQuantityWorkloads(response.payload || [])
          // Build matrix data
          const matrix: typeof matrixData = {}
          response.payload?.forEach((qty: QuantityWorkload) => {
            if (!matrix[qty.task_id]) {
              matrix[qty.task_id] = {}
            }
            matrix[qty.task_id][qty.workload_group_id] = {
              quantity_workload_id: qty.quantity_workload_id,
              quantity_workload_hours: qty.quantity_workload_hours,
              isNew: false
            }
          })
          setMatrixData(matrix)
        }
      } catch (error) {
        console.error('Error fetching quantity workloads:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchQuantityWorkloads()
  }, [session?.accessToken, refreshKey])

  // Handle cell value change
  const handleCellChange = (taskId: number, workloadGroupId: number, value: string) => {
    const numValue = value === '' ? null : parseFloat(value)
    if (numValue !== null && (numValue < 0 || isNaN(numValue))) {
      return // Invalid value
    }
    
    setMatrixData((prev) => {
      const newData = { ...prev }
      if (!newData[taskId]) {
        newData[taskId] = {}
      }
      newData[taskId][workloadGroupId] = {
        ...newData[taskId][workloadGroupId],
        quantity_workload_hours: numValue,
        isNew: newData[taskId][workloadGroupId]?.quantity_workload_id === undefined
      }
      return newData
    })
  }

  // Save all changes
  const handleSaveAll = async () => {
    if (!session?.accessToken) return
    
    setLoading(true)
    const accessToken = session.accessToken
    const updates: Array<{
      task_id: number
      workload_group_id: number
      quantity_workload_hours: number
      quantity_workload_id?: number
      isNew: boolean
    }> = []

    const deletions: Array<{ quantity_workload_id: number }> = []
    
    Object.keys(matrixData).forEach((taskIdStr) => {
      const taskId = parseInt(taskIdStr)
      Object.keys(matrixData[taskId]).forEach((groupIdStr) => {
        const groupId = parseInt(groupIdStr)
        const cell = matrixData[taskId][groupId]
        
        if (cell.quantity_workload_id && (cell.quantity_workload_hours === null || cell.quantity_workload_hours === undefined)) {
          deletions.push({ quantity_workload_id: cell.quantity_workload_id })
        }
        else if (cell.quantity_workload_hours !== null && cell.quantity_workload_hours !== undefined) {
          updates.push({
            task_id: taskId,
            workload_group_id: groupId,
            quantity_workload_hours: cell.quantity_workload_hours,
            quantity_workload_id: cell.quantity_workload_id,
            isNew: cell.isNew || false
          })
        }
      })
    })

    try {
      // Delete items that were cleared
      const deletePromises = deletions.map((del) =>
        QuantityWorkloadServices.deleteQuantityWorkload(del.quantity_workload_id, accessToken)
      )
      
      // Save all updates
      const savePromises = updates.map((update) => {
        if (update.isNew || !update.quantity_workload_id) {
          // Create new
          return QuantityWorkloadServices.createQuantityWorkload(
            {
              task_id: update.task_id,
              workload_group_id: update.workload_group_id,
              quantity_workload_hours: update.quantity_workload_hours
            },
            accessToken
          )
        } else {
          // Update existing
          return QuantityWorkloadServices.updateQuantityWorkload(
            update.quantity_workload_id,
            {
              task_id: update.task_id,
              workload_group_id: update.workload_group_id,
              quantity_workload_hours: update.quantity_workload_hours
            },
            accessToken
          )
        }
      })

      await Promise.all([...deletePromises, ...savePromises])
      
      const totalChanges = updates.length + deletions.length
      Swal.fire({
        icon: 'success',
        title: 'บันทึกสำเร็จ!',
        text: `บันทึกข้อมูล ${totalChanges} รายการสำเร็จ!`,
        showConfirmButton: false,
        timer: 1500,
      })
      
      setRefreshKey((prev) => prev + 1)
    } catch (error) {
      console.error('Error saving quantity workloads:', error)
      Swal.fire({
        icon: 'error',
        title: 'เกิดข้อผิดพลาด!',
        text: 'เกิดข้อผิดพลาดในการบันทึกข้อมูล',
        showConfirmButton: false,
        timer: 1500,
      })
    } finally {
      setLoading(false)
    }
  }


  const sortedWorkloadGroups = useMemo(() => {
    return [...workloadGroups].sort((a, b) => a.workload_group_id - b.workload_group_id)
  }, [workloadGroups])

  const sortedMainTasks = useMemo(() => {
    return [...mainTasks].sort((a, b) => a.task_id - b.task_id)
  }, [mainTasks])

  return (
    <>
      <div className="rounded-md bg-white p-4 shadow transition-all duration-300 ease-in-out dark:bg-zinc-900 dark:text-gray-400 pb-24">
        <div className="mb-4">
          <h2 className="text-xl font-normal text-gray-700 dark:text-gray-300">
            เกณฑ์จำนวนชั่วโมงภาระงานต่อสัปดาห์ (ตามกลุ่มภาระงาน)
          </h2>
        </div>

      {loading && mainTasks.length === 0 ? (
        <div className="flex items-center justify-center py-8">
          <div className="text-gray-500">กำลังโหลดข้อมูล...</div>
        </div>
      ) : (
        <div className="border transition-all duration-300 ease-in-out dark:border-zinc-600">
          <div className="overflow-x-auto">
            <table className="w-full overflow-x-auto md:table-auto">
              <thead className="bg-business1">
                <tr>
                  <th className="sticky left-0 z-10 w-16 text-nowrap border border-business1 bg-business1 px-4 py-3 text-center text-sm font-normal text-white">
                    #
                  </th>
                  <th className="sticky left-16 z-10 min-w-[200px] max-w-[700px] border border-business1 bg-business1 px-4 py-3 text-center text-sm font-normal text-white">
                    งานหลัก
                  </th>
                  {sortedWorkloadGroups.map((group) => (
                    <th
                      key={group.workload_group_id}
                      className="text-nowrap border border-business1 px-4 py-3 text-center text-sm font-normal text-white"
                    >
                      {group.workload_group_name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white transition-all duration-300 ease-in-out dark:divide-zinc-600 dark:bg-zinc-900">
                {sortedMainTasks.map((task, index) => (
                  <tr key={task.task_id} className="even:bg-gray-50 dark:even:bg-zinc-800">
                    <td className={`sticky left-0 z-10 w-16 whitespace-nowrap p-4 text-center ${
                      index % 2 === 0 ? 'bg-white dark:bg-zinc-900' : 'bg-gray-50 dark:bg-zinc-800'
                    }`}>
                      <span className="text-md font-light text-gray-500 dark:text-gray-400">
                        {index + 1}
                      </span>
                    </td>
                    <td className={`sticky left-16 z-10 min-w-[200px] max-w-[700px] p-4 text-left ${
                      index % 2 === 0 ? 'bg-white dark:bg-zinc-900' : 'bg-gray-50 dark:bg-zinc-800'
                    }`}>
                      <span className="text-md font-light text-gray-500 dark:text-gray-400 line-clamp-2">
                        {task.task_name}
                      </span>
                    </td>
                    {sortedWorkloadGroups.map((group) => {
                      const cellValue = matrixData[task.task_id]?.[group.workload_group_id]?.quantity_workload_hours ?? null
                      const hasValue = cellValue !== null && cellValue !== undefined
                      
                      return (
                        <td
                          key={group.workload_group_id}
                          className="whitespace-nowrap p-4 text-center"
                        >
                          <div className="flex items-center justify-center gap-1">
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={cellValue ?? ''}
                              onChange={(e) => handleCellChange(task.task_id, group.workload_group_id, e.target.value)}
                              className="w-20 rounded border border-gray-300 px-2 py-1 text-center text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-zinc-800 dark:text-gray-400"
                              placeholder="0"
                            />
                            <span className="text-xs text-gray-500 dark:text-gray-400">ชม.</span>
                          </div>
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      </div>

      <StickyFooter
        showSubmitOnly={true}
        onSubmit={handleSaveAll}
        submitText="บันทึกข้อมูล"
        disabled={loading}
      />
    </>
  )
}

export default QuantityWorkloadMatrixTable
