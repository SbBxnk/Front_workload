import React, { useState, useEffect } from 'react'
import { ChevronDown } from 'lucide-react'
import { useSession } from 'next-auth/react'
import DropdownService from '@/services/dropdownServices'
import type { DropdownUserLevel } from '@/services/dropdownServices'

interface SelectLevelProps {
  openDropdown: string | null
  setOpenDropdown: React.Dispatch<React.SetStateAction<string | null>>
  levelDropdownRef: React.RefObject<HTMLDivElement>
  setSelectLevel: React.Dispatch<React.SetStateAction<number | null>>
  handleOnChangeLevel: (level_id: number) => void
  initialLevelName: string
  disabled?: boolean
}

function SelectLevel({
  openDropdown,
  setOpenDropdown,
  levelDropdownRef,
  setSelectLevel,
  handleOnChangeLevel,
  initialLevelName,
  disabled = false,
}: SelectLevelProps) {
  const [levels, setLevels] = useState<DropdownUserLevel[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const { data: session } = useSession()

  useEffect(() => {
    const fetchLevels = async () => {
      try {
        setLoading(true)
        setError(null)
        
        if (!session?.accessToken) {
          throw new Error('No access token available')
        }

        const response = await DropdownService.getUserLevels(session.accessToken)
        
        if (response.success && response.payload) {
          setLevels(response.payload)
        } else {
          throw new Error('Failed to fetch levels')
        }
      } catch (err) {
        console.error('Error fetching levels:', err)
        setError('Error fetching levels')
      } finally {
        setLoading(false)
      }
    }

    fetchLevels()
  }, [session?.accessToken])

  const handleSelectLevel = (level_id: number, level_name: string) => {
    setSelectLevel(level_id)
    handleOnChangeLevel(level_id)
    setOpenDropdown(null)
  }

  const displayLevel = initialLevelName || 'เลือกระดับ'

  if (loading) {
    return (
      <div className="space-y-2">
        <label className="font-regular mb-2 block text-sm text-gray-600 dark:text-gray-400">
          ระดับ
        </label>
        <div className="flex h-10 w-full items-center justify-center rounded-md border-2 border-gray-300 bg-gray-100 dark:border-zinc-600 dark:bg-zinc-700">
          <span className="text-sm text-gray-500">กำลังโหลด...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-2">
        <label className="font-regular mb-2 block text-sm text-gray-600 dark:text-gray-400">
          ระดับ
        </label>
        <div className="flex h-10 w-full items-center justify-center rounded-md border-2 border-red-300 bg-red-50 dark:border-red-600 dark:bg-red-900/20">
          <span className="text-sm text-red-500">{error}</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <label className="font-regular mb-2 block text-sm text-gray-600 dark:text-gray-400">
        ระดับ
      </label>
      <div className="relative" ref={levelDropdownRef}>
        <button
          type="button"
          onClick={() =>
            !disabled && setOpenDropdown(openDropdown === 'level' ? null : 'level')
          }
          aria-expanded={openDropdown === 'level'}
          disabled={disabled}
          className={`flex w-full items-center justify-between rounded-md border-2 border-gray-300 bg-white px-4 py-2 text-sm font-light text-gray-600 transition-colors duration-300 ease-in-out focus:border-blue-500 focus:outline-none disabled:cursor-not-allowed disabled:bg-gray-100 disabled:opacity-50 dark:border-zinc-600 dark:bg-zinc-800 dark:text-gray-400 dark:disabled:bg-zinc-700`}
        >
          {displayLevel}
          <ChevronDown
            className={`h-4 w-4 text-gray-600 transition-transform duration-200 dark:text-zinc-600 ${
              openDropdown === 'level' ? 'rotate-180' : ''
            }`}
          />
        </button>
        {openDropdown === 'level' && !disabled && (
          <div className="absolute z-10 mt-2 max-h-36 w-full overflow-y-auto rounded-md border-2 border-gray-300 bg-white shadow-lg dark:border-zinc-600 dark:bg-zinc-900">
            {levels.map((level) => (
              <div
                key={level.level_id}
                className="cursor-pointer px-4 py-2 text-sm font-light text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-zinc-800"
                onClick={() =>
                  handleSelectLevel(level.level_id, level.level_name)
                }
              >
                {level.level_name}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default SelectLevel
