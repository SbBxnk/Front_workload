import type React from 'react'
import { useState, useEffect } from 'react'
import { ChevronDown } from 'lucide-react'
import DropdownService from '@/services/dropdownServices'
import type { DropdownExPosition } from '@/services/dropdownServices'
import { useSession } from 'next-auth/react'

interface SelectExPosition {
  openDropdown: string | null
  setOpenDropdown: React.Dispatch<React.SetStateAction<string | null>>
  expositionDropdownRef: React.RefObject<HTMLDivElement>
  setSelectExPosition: React.Dispatch<React.SetStateAction<number | null>>
  handleOnChangeExPosition: (prefix_id: number) => void
  initialExPositionName: string
  disabled?: boolean
}

function SelectPrefix({
  openDropdown,
  setOpenDropdown,
  expositionDropdownRef,
  setSelectExPosition,
  handleOnChangeExPosition,
  initialExPositionName,
  disabled = false,
}: SelectExPosition) {
  const [expositions, setExPositions] = useState<DropdownExPosition[]>([])
  const [error, setError] = useState<string | null>(null)
  const [displayPosition, setDisplayExPosition] = useState<string>('เลือกตำแหน่งบริหาร')
  const { data: session } = useSession()

  useEffect(() => {
    const fetchExPosition = async () => {
      setError(null)
      try {
        const token = session?.accessToken
        if (!token) {
          throw new Error('No token found. Please log in.')
        }
        
        const response = await DropdownService.getExPositions(token)

        if (response.status && response.data) {
          setExPositions(response.data)

          const matchingExPosition = response.data.find(
            (ex_position: DropdownExPosition) =>
              ex_position.ex_position_name === initialExPositionName
          )
          if (matchingExPosition) {
            setSelectExPosition(matchingExPosition.ex_position_id)
            setDisplayExPosition(matchingExPosition.ex_position_name)
          }
        } else {
          throw new Error('No data found')
        }
      } catch (error) {
        setError('Error fetching ex-positions')
        console.error('Error fetching ex-positions:', error)
      }
    }

    if (session?.accessToken) {
      fetchExPosition()
    }
  }, [initialExPositionName, setSelectExPosition, session?.accessToken])

  const handleSelectExPosition = (
    ex_position_id: number,
    ex_position_name: string
  ) => {
    setSelectExPosition(ex_position_id)
    setDisplayExPosition(ex_position_name)
    handleOnChangeExPosition(ex_position_id)
    setOpenDropdown(null)
  }

  return (
    <div>
      <label className="font-regular mb-2 block text-sm text-gray-600 dark:text-gray-400">
        ตำแหน่งวิชาการ
      </label>
      <div className="z-5 relative" ref={expositionDropdownRef}>
        <button
          type="button"
          onClick={() =>
            !disabled && setOpenDropdown(
              openDropdown === 'ex_position' ? null : 'ex_position'
            )
          }
          aria-expanded={openDropdown === 'ex_position'}
          disabled={disabled}
          className={`flex w-full items-center justify-between rounded-md border-2 border-gray-300 bg-white px-4 py-2 text-sm font-light text-gray-600 transition-colors duration-300 ease-in-out focus:border-blue-500 focus:outline-none disabled:cursor-not-allowed disabled:bg-gray-100 disabled:opacity-50 dark:border-zinc-600 dark:bg-zinc-800 dark:text-gray-400 dark:disabled:bg-zinc-700`}
        >
          {displayPosition}
          <ChevronDown
            className={`h-4 w-4 text-gray-600 transition-transform duration-200 dark:text-zinc-600 ${
              openDropdown === 'ex_position' ? 'rotate-180' : ''
            }`}
          />
        </button>
        {openDropdown === 'ex_position' && !disabled && (
          <div className="absolute z-10 mt-2 max-h-36 w-full overflow-y-auto rounded-md border-2 border-gray-300 bg-white shadow-lg dark:border-zinc-600 dark:bg-zinc-900">
            {expositions.map((ex_position) => (
              <div
                key={ex_position.ex_position_id}
                className="cursor-pointer px-4 py-2 text-sm font-light text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-zinc-800"
                onClick={() =>
                  handleSelectExPosition(
                    ex_position.ex_position_id,
                    ex_position.ex_position_name
                  )
                }
              >
                {ex_position.ex_position_name}
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
