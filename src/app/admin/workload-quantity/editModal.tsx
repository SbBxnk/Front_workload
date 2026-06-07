import type React from 'react'
import { useEffect, useRef, useState } from 'react'
import { useSession } from 'next-auth/react'
import WorkloadGroupServices from '@/services/workloadGroupServices'
import MainTaskServices from '@/services/mainTaskServices'
import type { WorkloadGroup, MainTask } from '@/Types'
import SelectWorkloadGroup from './workloadQuantityComponents/SelectWorkloadGroup'
import SelectMainTask from './workloadQuantityComponents/SelectMainTask'

interface EditModalProps {
  isLoading: boolean
  quantity_workload_id: number
  quantity_workload_hours: number
  workload_group_id: number
  task_id: number
  handleEdit: (
    e: React.FormEvent<HTMLFormElement> | React.MouseEvent,
    quantity_workload_id: number,
    quantity_workload_hours: number,
    workload_group_id: number,
    task_id: number
  ) => void
}

export default function EditModal({
  isLoading,
  quantity_workload_id,
  quantity_workload_hours,
  workload_group_id,
  task_id,
  handleEdit,
}: EditModalProps) {
  const { data: session } = useSession()
  const [workloadGroups, setWorkloadGroups] = useState<WorkloadGroup[]>([])
  const [mainTasks, setMainTasks] = useState<MainTask[]>([])
  const [loadingWorkloadGroups, setLoadingWorkloadGroups] = useState(false)
  const [loadingMainTasks, setLoadingMainTasks] = useState(false)
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const workloadGroupDropdownRef = useRef<HTMLDivElement>(null)
  const mainTaskDropdownRef = useRef<HTMLDivElement>(null)
  const [selectWorkloadGroup, setSelectedWorkloadGroup] = useState<string | null>(null)
  const [selectMainTask, setSelectedMainTask] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    quantity_workload_hours: quantity_workload_hours,
    workload_group_id: workload_group_id,
    task_id: task_id,
  })

  useEffect(() => {
    setFormData({
      quantity_workload_hours: quantity_workload_hours,
      workload_group_id: workload_group_id,
      task_id: task_id,
    })
  }, [quantity_workload_hours, workload_group_id, task_id])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        workloadGroupDropdownRef.current &&
        !workloadGroupDropdownRef.current.contains(event.target as Node) &&
        mainTaskDropdownRef.current &&
        !mainTaskDropdownRef.current.contains(event.target as Node)
      ) {
        setOpenDropdown(null)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  useEffect(() => {
    const fetchWorkloadGroups = async () => {
      if (!session?.accessToken) return
      setLoadingWorkloadGroups(true)
      try {
        const response = await WorkloadGroupServices.getAllWorkloadGroups(
          { search: '', page: 1, limit: 1000, sort: 'workload_group_name', order: 'asc' }
        )
        if (response.success) {
          setWorkloadGroups(response.payload || [])
          // Set the selected label based on current workload_group_id
          const currentGroup = response.payload?.find(group => group.workload_group_id === workload_group_id)
          if (currentGroup) {
            setSelectedWorkloadGroup(currentGroup.workload_group_name)
          }
        }
      } catch (error) {
        console.error('Error fetching workload groups:', error)
      } finally {
        setLoadingWorkloadGroups(false)
      }
    }

    const fetchMainTasks = async () => {
      if (!session?.accessToken) return
      setLoadingMainTasks(true)
      try {
        const response = await MainTaskServices.getAllMainTasks(
          { search: '', page: 1, limit: 1000, sort: 'task_name', order: 'asc' }
        )
        if (response.success) {
          setMainTasks(response.payload || [])
          // Set the selected label based on current task_id
          const currentTask = response.payload?.find(task => task.task_id === task_id)
          if (currentTask) {
            setSelectedMainTask(currentTask.task_name)
          }
        }
      } catch (error) {
        console.error('Error fetching main tasks:', error)
      } finally {
        setLoadingMainTasks(false)
      }
    }

    fetchWorkloadGroups()
    fetchMainTasks()
  }, [session?.accessToken, workload_group_id, task_id])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: parseFloat(value) || 0 }))
  }

  const handleOnChangeWorkloadGroup = (workload_group_id: number, workload_group_name: string) => {
    setFormData((prevData) => ({
      ...prevData,
      workload_group_id: workload_group_id,
    }))
  }

  const handleOnChangeMainTask = (task_id: number, task_name: string) => {
    setFormData((prevData) => ({
      ...prevData,
      task_id: task_id,
    }))
  }

  return (
    <>
      {isLoading ? null : (
        <div className="relative z-[100]">
          <input type="checkbox" id={`modal-edit`} className="modal-toggle" />
          <div className="modal" role={`modal-edit`}>
            <div className="modal-box rounded-md dark:bg-zinc-800 p-0">
              <form onSubmit={(e) => handleEdit(e, quantity_workload_id, formData.quantity_workload_hours, formData.workload_group_id, formData.task_id)}>
                <div className="flex items-center border-b border-gray-200 p-4">
                  <h3 className="font-regular flex truncate text-start text-2xl text-gray-600 dark:text-gray-400">
                    แก้ไขปริมาณงาน&nbsp;
                  </h3>
                </div>
                <div className="flex-col justify-between space-y-4 p-4">
                  <div className="w-full">
                    <SelectWorkloadGroup
                      openDropdown={openDropdown}
                      setOpenDropdown={setOpenDropdown}
                      workloadGroupDropdownRef={workloadGroupDropdownRef}
                      handleOnChangeWorkloadGroup={handleOnChangeWorkloadGroup}
                      selectWorkloadGroup={selectWorkloadGroup}
                      setSelectedWorkloadGroup={setSelectedWorkloadGroup}
                      workloadGroups={workloadGroups}
                    />
                  </div>

                  <div className="w-full">
                    <SelectMainTask
                      openDropdown={openDropdown}
                      setOpenDropdown={setOpenDropdown}
                      mainTaskDropdownRef={mainTaskDropdownRef}
                      handleOnChangeMainTask={handleOnChangeMainTask}
                      selectMainTask={selectMainTask}
                      setSelectedMainTask={setSelectedMainTask}
                      mainTasks={mainTasks}
                    />
                  </div>

                  <div className="w-full">
                    <label className="font-regular mb-2 block text-sm text-gray-600 dark:text-gray-400">
                      จำนวนชั่วโมง
                    </label>
                    <input
                      name="quantity_workload_hours"
                      value={formData.quantity_workload_hours}
                      onChange={handleInputChange}
                      type="number"
                      min="0"
                      step="0.5"
                      className="w-full rounded-md border border-gray-300 px-4 py-2 text-sm font-light text-gray-600 transition-all duration-300 ease-in-out focus:border-blue-500 focus:outline-none dark:border-zinc-600 dark:bg-zinc-800 dark:text-gray-400"
                      placeholder="กรุณากรอกจำนวนชั่วโมง"
                      required
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-4 border-t border-gray-200 p-4">
                  <label
                    htmlFor={`modal-edit`}
                    className="text-md h-10 flex w-20 cursor-pointer items-center justify-center rounded-md border-2 border-gray-200 bg-gray-200 px-4 py-2 text-gray-600 transition duration-300 ease-in-out hover:border-gray-300 hover:bg-gray-300 dark:border-zinc-700 dark:bg-zinc-700 dark:text-gray-400 dark:hover:border-zinc-600 dark:hover:bg-zinc-600"
                  >
                    ยกเลิก
                  </label>
                  <button
                    type="submit"
                    className="text-md h-10 flex w-20 items-center justify-center rounded-md bg-success px-4 py-2 text-white transition duration-300 ease-in-out hover:bg-success hover:bg-success/80 hover:text-white"
                  >
                    ยืนยัน
                  </button>
                </div>
              </form>
            </div>
            <label className="modal-backdrop" htmlFor={`modal-edit`}>
              Close
            </label>
          </div>
        </div>
      )}
    </>
  )
}
