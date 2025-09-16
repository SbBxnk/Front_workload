import type React from 'react'
import { ChevronDown } from 'lucide-react'
import useFetchData from '@/hooks/FetchAPI'
import { ExPosition } from '@/Types'

interface SelectExPositionProps {
  ex_position_id: number
  ex_position_name: string
  openDropdown: string | null
  setOpenDropdown: React.Dispatch<React.SetStateAction<string | null>>
  exPositionDropdownRef: React.RefObject<HTMLDivElement>
  selectExPosition: string | null
  setSelectExPosition: React.Dispatch<React.SetStateAction<string | null>>
  handleOnChangeExPosition: (
    ex_position_id: number,
    ex_position_name: string
  ) => void
}

function SelectExPosition({
  openDropdown,
  setOpenDropdown,
  exPositionDropdownRef,
  selectExPosition,
  setSelectExPosition,
  handleOnChangeExPosition,
}: SelectExPositionProps) {
  const { data: expositions, error } =
    useFetchData<ExPosition[]>('/ex_position')

  const handleSelectExPosition = (
    ex_position_id: number,
    ex_position_name: string
  ) => {
    setSelectExPosition(ex_position_name)
    handleOnChangeExPosition(ex_position_id, ex_position_name)
    setOpenDropdown(null)
  }

  return (
    <div>
      <label className="font-regular mb-2 block text-sm text-gray-600 dark:text-gray-400">
        ตำแหน่งบริหาร
      </label>
      <div className="z-5 relative" ref={exPositionDropdownRef}>
        <button
          type="button"
          onClick={() =>
            setOpenDropdown(openDropdown === 'exposition' ? null : 'exposition')
          }
          className="flex w-full items-center justify-between rounded-md border-2 border-gray-300 bg-white px-4 py-2 text-sm font-light text-gray-600 transition-all transition-colors duration-300 ease-in-out focus:border-blue-500 focus:outline-none dark:border-zinc-600 dark:bg-zinc-800 dark:text-gray-400"
        >
          {selectExPosition === null
            ? 'เลือกตำแหน่งบริหาร'
            : expositions?.find(
                (exposition) => exposition.ex_position_name === selectExPosition
              )?.ex_position_name}
          <ChevronDown
            className={`h-4 w-4 text-gray-600 transition-transform duration-200 dark:text-zinc-600 ${openDropdown === 'exposition' ? 'rotate-180' : ''}`}
          />
        </button>
        {openDropdown === 'exposition' && (
          <div className="absolute z-10 mt-2 max-h-36 w-full overflow-y-auto rounded-md border-2 border-gray-300 bg-white shadow-lg dark:border-zinc-600 dark:bg-zinc-900">
            {expositions?.map((exposition) => (
              <div
                key={exposition.ex_position_id}
                className="cursor-pointer px-4 py-2 text-sm font-light text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-zinc-800"
                onClick={() =>
                  handleSelectExPosition(
                    exposition.ex_position_id,
                    exposition.ex_position_name
                  )
                }
              >
                {exposition.ex_position_name}
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

export default SelectExPosition
