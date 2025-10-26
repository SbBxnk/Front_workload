import type React from 'react'
import { ChevronDown } from 'lucide-react'
import { WorkloadGroup } from '@/Types'

interface SelectWorkloadGroupProps {
  openDropdown: string | null
  setOpenDropdown: React.Dispatch<React.SetStateAction<string | null>>
  workloadGroupDropdownRef: React.RefObject<HTMLDivElement>
  handleOnChangeWorkloadGroup: (workload_group_id: number, workload_group_name: string) => void
  setSelectedWorkloadGroup: React.Dispatch<React.SetStateAction<string | null>>
  selectWorkloadGroup: string | null
  workloadGroups: WorkloadGroup[]
}

function SelectWorkloadGroup({
  openDropdown,
  setOpenDropdown,
  workloadGroupDropdownRef,
  handleOnChangeWorkloadGroup,
  setSelectedWorkloadGroup,
  selectWorkloadGroup,
  workloadGroups,
}: SelectWorkloadGroupProps) {
  const handleSelectWorkloadGroup = (workload_group_id: number, workload_group_name: string) => {
    handleOnChangeWorkloadGroup(workload_group_id, workload_group_name)
    setSelectedWorkloadGroup(workload_group_name)
    setOpenDropdown(null)
  }

  return (
    <div>
      <label className="font-regular mb-2 block text-sm text-gray-600 dark:text-gray-400">
        กลุ่มงาน
      </label>
      <div className="z-5 relative" ref={workloadGroupDropdownRef}>
        <button
          type="button"
          onClick={() =>
            setOpenDropdown(openDropdown === 'workloadGroup' ? null : 'workloadGroup')
          }
          className="flex w-full items-center justify-between rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-light text-gray-600 transition-colors duration-300 ease-in-out focus:border-blue-500 focus:outline-none dark:border-zinc-600 dark:bg-zinc-800 dark:text-gray-400 min-h-[40px]"
        >
          <span className="truncate flex-1 mr-2 text-left">
            {selectWorkloadGroup === null
              ? 'เลือกกลุ่มงาน'
              : workloadGroups?.find((group) => group.workload_group_name === selectWorkloadGroup)
                  ?.workload_group_name || 'เลือกกลุ่มงาน'}
          </span>
          <ChevronDown
            className={`h-4 w-4 text-gray-600 transition-transform duration-200 dark:text-zinc-600 ${openDropdown === 'workloadGroup' ? 'rotate-180' : ''}`}
          />
        </button>
        {openDropdown === 'workloadGroup' && workloadGroups && (
          <div className="absolute z-10 mt-2 max-h-36 w-full overflow-y-auto rounded-md border border-gray-300 bg-white shadow-lg dark:border-zinc-600 dark:bg-zinc-900 min-w-[300px]">
            {workloadGroups.map((group) => (
              <div
                key={group.workload_group_id}
                className="cursor-pointer px-4 py-2 text-sm font-light text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-zinc-800"
                onClick={() =>
                  handleSelectWorkloadGroup(group.workload_group_id, group.workload_group_name)
                }
              >
                <span className="truncate block w-full">
                  {group.workload_group_name}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default SelectWorkloadGroup
