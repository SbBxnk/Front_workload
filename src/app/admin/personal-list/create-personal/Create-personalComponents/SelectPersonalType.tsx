import type React from 'react'
import { ChevronDown } from 'lucide-react'
import useFetchData from '@/hooks/FetchAPI'
import { PersonalType } from '@/Types'

interface SelectPersonalTypeProps {
  type_p_id: number
  type_p_name: string
  openDropdown: string | null
  setOpenDropdown: React.Dispatch<React.SetStateAction<string | null>>
  personalTypeDropdownRef: React.RefObject<HTMLDivElement>
  selectPersonalType: string | null
  setSelectPersonalType: React.Dispatch<React.SetStateAction<string | null>>
  handleOnChangePersonalType: (type_p_id: number, type_p_name: string) => void
}

function SelectPersonalType({
  openDropdown,
  setOpenDropdown,
  personalTypeDropdownRef,
  handleOnChangePersonalType,
  selectPersonalType,
  setSelectPersonalType,
}: SelectPersonalTypeProps) {
  const { data: personalTypes, error } =
    useFetchData<PersonalType[]>('/personalType')

  const handleSelectPersonalType = (type_p_id: number, type_p_name: string) => {
    setSelectPersonalType(type_p_name)
    handleOnChangePersonalType(type_p_id, type_p_name)
    setOpenDropdown(null)
  }

  return (
    <div>
      <label className="font-regular mb-2 block text-sm text-gray-600 dark:text-gray-400">
        ประเภทบุคลากร
      </label>
      <div className="z-5 relative" ref={personalTypeDropdownRef}>
        <button
          type="button"
          onClick={() =>
            setOpenDropdown(
              openDropdown === 'personalType' ? null : 'personalType'
            )
          }
          className="flex w-full items-center justify-between rounded-md border-2 border-gray-300 bg-white px-4 py-2 text-sm font-light text-gray-600 transition-all transition-colors duration-300 ease-in-out focus:border-blue-500 focus:outline-none dark:border-zinc-600 dark:bg-zinc-800 dark:text-gray-400"
        >
          {selectPersonalType === null
            ? 'เลือกประเภทบุคลากร'
            : personalTypes?.find(
                (personalType) =>
                  personalType.type_p_name === selectPersonalType
              )?.type_p_name}
          <ChevronDown
            className={`h-4 w-4 text-gray-600 transition-transform duration-200 dark:text-zinc-600 ${openDropdown === 'personalType' ? 'rotate-180' : ''}`}
          />
        </button>
        {openDropdown === 'personalType' && (
          <div className="absolute z-10 mt-2 max-h-36 w-full overflow-y-auto rounded-md border-2 border-gray-300 bg-white shadow-lg dark:border-zinc-600 dark:bg-zinc-900">
            {personalTypes?.map((personalType) => (
              <div
                key={personalType.type_p_id}
                className="cursor-pointer px-4 py-2 text-sm font-light text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-zinc-800"
                onClick={() =>
                  handleSelectPersonalType(
                    personalType.type_p_id,
                    personalType.type_p_name
                  )
                }
              >
                {personalType.type_p_name}
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

export default SelectPersonalType
