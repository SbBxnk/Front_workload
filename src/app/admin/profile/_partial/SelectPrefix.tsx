import type React from 'react'
import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { ChevronDown } from 'lucide-react'
import DropdownService from '@/services/dropdownServices'
import type { DropdownPrefix } from '@/Types'

interface SelectPrefixProps {
  openDropdown: string | null
  setOpenDropdown: React.Dispatch<React.SetStateAction<string | null>>
  prefixDropdownRef: React.RefObject<HTMLDivElement>
  setSelectPrefix: React.Dispatch<React.SetStateAction<number | null>>
  handleOnChangePrefix: (prefix_id: number) => void
  initialPrefixName: string
  disabled?: boolean
}

function SelectPrefix({
  openDropdown,
  setOpenDropdown,
  prefixDropdownRef,
  setSelectPrefix,
  handleOnChangePrefix,
  initialPrefixName,
  disabled = false,
}: SelectPrefixProps) {
  const [displayPrefix, setDisplayPrefix] = useState<string>('เลือกคำนำหน้า')

  const { data: prefixes = [], isError } = useQuery({
    queryKey: ['dropdown', 'prefixes'],
    queryFn: async () => {
      const response = await DropdownService.getPrefixes()
      if (response.success && response.payload) return response.payload
      throw new Error('No data found')
    },
  })

  useEffect(() => {
    const matchingPrefix = prefixes.find(
      (prefix: DropdownPrefix) => prefix.prefix_name === initialPrefixName
    )
    if (matchingPrefix) {
      setSelectPrefix(matchingPrefix.prefix_id)
      setDisplayPrefix(matchingPrefix.prefix_name)
    }
  }, [prefixes, initialPrefixName, setSelectPrefix])

  const handleSelectPrefix = (prefix_id: number, prefix_name: string) => {
    setSelectPrefix(prefix_id)
    setDisplayPrefix(prefix_name)
    handleOnChangePrefix(prefix_id)
    setOpenDropdown(null)
  }

  return (
    <div>
      <label className="font-regular mb-2 block text-sm text-gray-600 dark:text-gray-400">
        คำนำหน้า
      </label>
      <div className="z-5 relative" ref={prefixDropdownRef}>
        <button
          type="button"
          onClick={() =>
            !disabled && setOpenDropdown(openDropdown === 'prefix' ? null : 'prefix')
          }
          aria-expanded={openDropdown === 'prefix'}
          disabled={disabled}
          className={`flex w-full items-center justify-between rounded-md border-2 border-gray-300 bg-white px-4 py-2 text-sm font-light text-gray-600 transition-colors duration-300 ease-in-out focus:border-blue-500 focus:outline-none disabled:cursor-not-allowed disabled:bg-gray-100 disabled:opacity-50 dark:border-zinc-600 dark:bg-zinc-800 dark:text-gray-400 dark:disabled:bg-zinc-700`}
        >
          {displayPrefix}
          <ChevronDown
            className={`h-4 w-4 text-gray-600 transition-transform duration-200 dark:text-zinc-600 ${
              openDropdown === 'prefix' ? 'rotate-180' : ''
            }`}
          />
        </button>
        {openDropdown === 'prefix' && !disabled && (
          <div className="absolute z-10 mt-2 max-h-36 w-full overflow-y-auto rounded-md border-2 border-gray-300 bg-white shadow-lg dark:border-zinc-600 dark:bg-zinc-900">
            {prefixes.map((prefix) => (
              <div
                key={prefix.prefix_id}
                className="cursor-pointer px-4 py-2 text-sm font-light text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-zinc-800"
                onClick={() =>
                  handleSelectPrefix(prefix.prefix_id, prefix.prefix_name)
                }
              >
                {prefix.prefix_name}
              </div>
            ))}
          </div>
        )}
      </div>
      {isError && <div className="mt-2 text-red-500">Error fetching prefixes</div>}
    </div>
  )
}

export default SelectPrefix
