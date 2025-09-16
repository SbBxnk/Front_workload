import type React from 'react'
import { useState, useEffect } from 'react'
import { ChevronDown } from 'lucide-react'
import DropdownService from '@/services/dropdownServices'
import type { DropdownPosition } from '@/services/dropdownServices'
import { useSession } from 'next-auth/react'

interface SelectPosition {
  openDropdown: string | null
  setOpenDropdown: React.Dispatch<React.SetStateAction<string | null>>
  positionDropdownRef: React.RefObject<HTMLDivElement>
  setSelectPosition: React.Dispatch<React.SetStateAction<number | null>>
  handleOnChangePosition: (prefix_id: number) => void
  initialPositionName: string
  disabled?: boolean
}

function SelectPrefix({
  openDropdown,
  setOpenDropdown,
  positionDropdownRef,
  setSelectPosition,
  handleOnChangePosition,
  initialPositionName,
  disabled = false,
}: SelectPosition) {
  const [positions, setPositions] = useState<DropdownPosition[]>([])
  const [error, setError] = useState<string | null>(null)
  const [displayPosition, setDisplayPosition] = useState<string>('เลือกตำแหน่งวิชาการ')
  const { data: session } = useSession()

  useEffect(() => {
    const fetchPosition = async () => {
      setError(null)
      try {
        const token = session?.accessToken
        if (!token) {
          throw new Error('No token found. Please log in.')
        }
        
        const response = await DropdownService.getPositions(token)

        if (response.status && response.data) {
          setPositions(response.data)

          const matchingPosition = response.data.find(
            (position: DropdownPosition) =>
              position.position_name === initialPositionName
          )
          if (matchingPosition) {
            setSelectPosition(matchingPosition.position_id)
            setDisplayPosition(matchingPosition.position_name)
          }
        } else {
          throw new Error('No data found')
        }
      } catch (error) {
        setError('Error fetching positions')
        console.error('Error fetching positions:', error)
      }
    }

    if (session?.accessToken) {
      fetchPosition()
    }
  }, [initialPositionName, setSelectPosition, session?.accessToken])

  const handleSelectPosition = (position_id: number, position_name: string) => {
    setSelectPosition(position_id)
    setDisplayPosition(position_name)
    handleOnChangePosition(position_id)
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
            !disabled && setOpenDropdown(openDropdown === 'position' ? null : 'position')
          }
          aria-expanded={openDropdown === 'position'}
          disabled={disabled}
          className={`flex w-full items-center justify-between rounded-md border-2 border-gray-300 bg-white px-4 py-2 text-sm font-light text-gray-600 transition-colors duration-300 ease-in-out focus:border-blue-500 focus:outline-none disabled:cursor-not-allowed disabled:bg-gray-100 disabled:opacity-50 dark:border-zinc-600 dark:bg-zinc-800 dark:text-gray-400 dark:disabled:bg-zinc-700`}
        >
          {displayPosition}
          <ChevronDown
            className={`h-4 w-4 text-gray-600 transition-transform duration-200 dark:text-zinc-600 ${
              openDropdown === 'position' ? 'rotate-180' : ''
            }`}
          />
        </button>
        {openDropdown === 'position' && !disabled && (
          <div className="absolute z-10 mt-2 max-h-36 w-full overflow-y-auto rounded-md border-2 border-gray-300 bg-white shadow-lg dark:border-zinc-600 dark:bg-zinc-900">
            {positions.map((position) => (
              <div
                key={position.position_id}
                className="cursor-pointer px-4 py-2 text-sm font-light text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-zinc-800"
                onClick={() =>
                  handleSelectPosition(
                    position.position_id,
                    position.position_name
                  )
                }
              >
                {position.position_name}
              </div>
            ))}
          </div>
        )}
      </div>
      {error && <div className="mt-2 text-red-500">{error}</div>}
    </div>
  )
}

export default SelectPrefix
