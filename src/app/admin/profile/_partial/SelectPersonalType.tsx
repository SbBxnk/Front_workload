import type React from 'react'
import { useQuery } from '@tanstack/react-query'
import { ChevronDown } from 'lucide-react'
import DropdownService from '@/services/dropdownServices'
import type { DropdownPersonalType } from '@/Types'

interface SelectPersonalTypeProps {
  openDropdown: string | null
  setOpenDropdown: React.Dispatch<React.SetStateAction<string | null>>
  personalTypeDropdownRef: React.RefObject<HTMLDivElement>
  setSelectPersonalType: React.Dispatch<React.SetStateAction<number | null>>
  handleOnChangePersonalType: (type_p_id: number) => void
  initialPersonalTypeName: string
  disabled?: boolean
}

function SelectPersonalType({
  openDropdown,
  setOpenDropdown,
  personalTypeDropdownRef,
  setSelectPersonalType,
  handleOnChangePersonalType,
  initialPersonalTypeName,
  disabled = false,
}: SelectPersonalTypeProps) {
  const {
    data: personalTypes = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['dropdown', 'personalTypes'],
    queryFn: async () => {
      const response = await DropdownService.getPersonalTypes()
      if (response.success && response.payload) return response.payload
      throw new Error('Failed to fetch personal types')
    },
  })

  const handleSelectPersonalType = (type_p_id: number) => {
    setSelectPersonalType(type_p_id)
    handleOnChangePersonalType(type_p_id)
    setOpenDropdown(null)
  }

  const displayPersonalType = initialPersonalTypeName || 'เลือกประเภทบุคลากร'

  if (isLoading) {
    return (
      <div className="space-y-2">
        <label className="font-regular mb-2 block text-sm text-gray-600 dark:text-gray-400">
          ประเภทบุคลากร
        </label>
        <div className="flex h-10 w-full items-center justify-center rounded-md border-2 border-gray-300 bg-gray-100 dark:border-zinc-600 dark:bg-zinc-700">
          <span className="text-sm text-gray-500">กำลังโหลด...</span>
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="space-y-2">
        <label className="font-regular mb-2 block text-sm text-gray-600 dark:text-gray-400">
          ประเภทบุคลากร
        </label>
        <div className="flex h-10 w-full items-center justify-center rounded-md border-2 border-red-300 bg-red-50 dark:border-red-600 dark:bg-red-900/20">
          <span className="text-sm text-red-500">
            Error fetching personal types
          </span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <label className="font-regular mb-2 block text-sm text-gray-600 dark:text-gray-400">
        ประเภทบุคลากร
      </label>
      <div className="relative" ref={personalTypeDropdownRef}>
        <button
          type="button"
          onClick={() =>
            !disabled && setOpenDropdown(openDropdown === 'personalType' ? null : 'personalType')
          }
          aria-expanded={openDropdown === 'personalType'}
          disabled={disabled}
          className={`flex w-full items-center justify-between rounded-md border-2 border-gray-300 bg-white px-4 py-2 text-sm font-light text-gray-600 transition-colors duration-300 ease-in-out focus:border-blue-500 focus:outline-none disabled:cursor-not-allowed disabled:bg-gray-100 disabled:opacity-50 dark:border-zinc-600 dark:bg-zinc-800 dark:text-gray-400 dark:disabled:bg-zinc-700`}
        >
          {displayPersonalType}
          <ChevronDown
            className={`h-4 w-4 text-gray-600 transition-transform duration-200 dark:text-zinc-600 ${
              openDropdown === 'personalType' ? 'rotate-180' : ''
            }`}
          />
        </button>
        {openDropdown === 'personalType' && !disabled && (
          <div className="absolute z-10 mt-2 max-h-36 w-full overflow-y-auto rounded-md border-2 border-gray-300 bg-white shadow-lg dark:border-zinc-600 dark:bg-zinc-900">
            {personalTypes.map((personalType: DropdownPersonalType) => (
              <div
                key={personalType.type_p_id}
                className="cursor-pointer px-4 py-2 text-sm font-light text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-zinc-800"
                onClick={() =>
                  handleSelectPersonalType(personalType.type_p_id)
                }
              >
                {personalType.type_p_name}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default SelectPersonalType
