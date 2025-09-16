import type React from 'react'
import { ChevronDown } from 'lucide-react'
import useFetchData from '@/hooks/FetchAPI'
import { Position } from '@/Types'

interface SelectPositionProps {
  position_id: number
  position_name: string
  openDropdown: string | null
  setOpenDropdown: React.Dispatch<React.SetStateAction<string | null>>
  positionDropdownRef: React.RefObject<HTMLDivElement>
  selectPosition: string | null
  setSelectPosition: React.Dispatch<React.SetStateAction<string | null>>
  handleOnChangePosition: (position_id: number, position_name: string) => void
}

function SelectPosition({
  openDropdown,
  setOpenDropdown,
  positionDropdownRef,
  selectPosition,
  setSelectPosition,
  handleOnChangePosition,
}: SelectPositionProps) {
  const { data: positions, error } = useFetchData<Position[]>('/position')

  const handleSelectPosition = (position_name: string, position_id: number) => {
    setSelectPosition(position_name)
    handleOnChangePosition(position_id, position_name)
    setOpenDropdown(null)
  }

  return (
    <div>
      <label className="font-regular mb-2 block text-sm text-gray-600 dark:text-gray-400">
        ตำแหน่งวิชาการ
      </label>
      <div className="z-5 relative" ref={positionDropdownRef}>
        <button
          type="button"
          onClick={() =>
            setOpenDropdown(openDropdown === 'position' ? null : 'position')
          }
          className="flex w-full items-center justify-between rounded-md border-2 border-gray-300 bg-white px-4 py-2 text-sm font-light text-gray-600 transition-all transition-colors duration-300 ease-in-out focus:border-blue-500 focus:outline-none dark:border-zinc-600 dark:bg-zinc-800 dark:text-gray-400"
        >
          {selectPosition === null
            ? 'เลือกตำแหน่งวิชาการ'
            : positions?.find(
                (position) => position.position_name === selectPosition
              )?.position_name}
          <ChevronDown
            className={`h-4 w-4 text-gray-600 transition-transform duration-200 dark:text-zinc-600 ${openDropdown === 'position' ? 'rotate-180' : ''}`}
          />
        </button>
        {openDropdown === 'position' && (
          <div className="absolute z-10 mt-2 max-h-36 w-full overflow-y-auto rounded-md border-2 border-gray-300 bg-white shadow-lg dark:border-zinc-600 dark:bg-zinc-900">
            {positions?.map((position) => (
              <div
                key={position.position_id}
                className="cursor-pointer px-4 py-2 text-sm font-light text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-zinc-800"
                onClick={() =>
                  handleSelectPosition(
                    position.position_name,
                    position.position_id
                  )
                }
              >
                {position.position_name}
              </div>
            ))}
          </div>
        )}
      </div>
      {error && (
        <div className="mt-2 text-red-500">
          เกิดข้อผิดพลาดในการเชื่อมต่อข้อมูล
        </div>
      )}
    </div>
  )
}

export default SelectPosition
