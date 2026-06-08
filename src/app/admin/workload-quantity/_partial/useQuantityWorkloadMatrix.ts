'use client'

import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import QuantityWorkloadServices from '@/services/quantityWorkloadServices'
import MainTaskServices from '@/services/mainTaskServices'
import WorkloadGroupServices from '@/services/workloadGroupServices'
import type {
  MainTask,
  QuantityMatrixDataState,
  QuantityWorkload,
  WorkloadGroup,
} from '@/Types'

// แปลงรายการ quantity workloads เป็นโครงสร้าง matrix (งานหลัก → กลุ่มภาระงาน → ค่า)
function buildMatrix(items: QuantityWorkload[]): QuantityMatrixDataState {
  const matrix: QuantityMatrixDataState = {}
  items.forEach((item) => {
    if (!matrix[item.task_id]) matrix[item.task_id] = {}
    matrix[item.task_id][item.workload_group_id] = {
      quantity_workload_id: item.quantity_workload_id,
      quantity_workload_hours: item.quantity_workload_hours,
      isNew: false,
    }
  })
  return matrix
}

/**
 * ดึงข้อมูลสำหรับตารางเกณฑ์จำนวนภาระงาน (งานหลัก × กลุ่มภาระงาน) ผ่าน React Query
 * คืนรายการที่เรียงแล้ว + matrix เริ่มต้นสำหรับ seed state ฝั่งหน้า
 */
export function useQuantityWorkloadMatrix() {
  const mainTasksQuery = useQuery({
    queryKey: ['mainTasks', { for: 'workload-quantity' }],
    queryFn: () =>
      MainTaskServices.getAllMainTasks({
        search: '',
        limit: 1000,
        page: 1,
        sort: 'task_id',
        order: 'asc',
      }),
  })

  const workloadGroupsQuery = useQuery({
    queryKey: ['workloadGroups', { for: 'workload-quantity' }],
    queryFn: () =>
      WorkloadGroupServices.getAllWorkloadGroups({
        search: '',
        limit: 1000,
        page: 1,
        sort: 'workload_group_id',
        order: 'asc',
      }),
  })

  const quantityWorkloadsQuery = useQuery({
    queryKey: ['quantityWorkloads'],
    queryFn: () =>
      QuantityWorkloadServices.getAllQuantityWorkloads({
        search: '',
        limit: 10000,
        page: 1,
        sort: 'task_id',
        order: 'asc',
      }),
  })

  const mainTasks: MainTask[] = mainTasksQuery.data?.payload ?? []
  const workloadGroups: WorkloadGroup[] =
    workloadGroupsQuery.data?.payload ?? []
  const quantityWorkloads: QuantityWorkload[] =
    quantityWorkloadsQuery.data?.payload ?? []

  const sortedMainTasks = useMemo(
    () => [...mainTasks].sort((a, b) => a.task_id - b.task_id),
    [mainTasks]
  )

  const sortedWorkloadGroups = useMemo(
    () =>
      [...workloadGroups].sort(
        (a, b) => a.workload_group_id - b.workload_group_id
      ),
    [workloadGroups]
  )

  const initialMatrix = useMemo(
    () => buildMatrix(quantityWorkloads),
    [quantityWorkloads]
  )

  const isLoading =
    mainTasksQuery.isLoading ||
    workloadGroupsQuery.isLoading ||
    quantityWorkloadsQuery.isLoading

  return {
    sortedMainTasks,
    sortedWorkloadGroups,
    initialMatrix,
    isLoading,
  }
}
