import type React from 'react'
import { ChevronDown } from 'lucide-react'
import { MainTask } from '@/Types'

interface SelectMainTaskProps {
  openDropdown: string | null
  setOpenDropdown: React.Dispatch<React.SetStateAction<string | null>>
  mainTaskDropdownRef: React.RefObject<HTMLDivElement>
  handleOnChangeMainTask: (task_id: number, task_name: string) => void
  setSelectedMainTask: React.Dispatch<React.SetStateAction<string | null>>
  selectMainTask: string | null
  mainTasks: MainTask[]
}

function SelectMainTask({
  openDropdown,
  setOpenDropdown,
  mainTaskDropdownRef,
  handleOnChangeMainTask,
  setSelectedMainTask,
  selectMainTask,
  mainTasks,
}: SelectMainTaskProps) {
  const handleSelectMainTask = (task_id: number, task_name: string) => {
    handleOnChangeMainTask(task_id, task_name)
    setSelectedMainTask(task_name)
    setOpenDropdown(null)
  }

  return (
    <div>
      <label className="font-regular mb-2 block text-sm text-gray-600 dark:text-gray-400">
        งานหลัก
      </label>
      <div className="z-5 relative" ref={mainTaskDropdownRef}>
        <button
          type="button"
          onClick={() =>
            setOpenDropdown(openDropdown === 'mainTask' ? null : 'mainTask')
          }
          className="flex w-full items-center justify-between rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-light text-gray-600 transition-colors duration-300 ease-in-out focus:border-blue-500 focus:outline-none dark:border-zinc-600 dark:bg-zinc-800 dark:text-gray-400 min-h-[40px]"
        >
          <span className="truncate flex-1 mr-2 text-left">
            {selectMainTask === null
              ? 'เลือกงานหลัก'
              : mainTasks?.find((task) => task.task_name === selectMainTask)
                  ?.task_name || 'เลือกงานหลัก'}
          </span>
          <ChevronDown
            className={`h-4 w-4 text-gray-600 transition-transform duration-200 dark:text-zinc-600 ${openDropdown === 'mainTask' ? 'rotate-180' : ''}`}
          />
        </button>
        {openDropdown === 'mainTask' && mainTasks && (
          <div className="absolute z-10 mt-2 max-h-36 w-full overflow-y-auto rounded-md border border-gray-300 bg-white shadow-lg dark:border-zinc-600 dark:bg-zinc-900 min-w-[300px]">
            {mainTasks.map((task) => (
              <div
                key={task.task_id}
                className="cursor-pointer px-4 py-2 text-sm font-light text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-zinc-800"
                onClick={() =>
                  handleSelectMainTask(task.task_id, task.task_name)
                }
              >
                <span className="truncate block w-full">
                  {task.task_name}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default SelectMainTask
