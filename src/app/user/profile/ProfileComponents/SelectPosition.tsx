import type React from 'react'
import { useState, useEffect } from 'react'
import { ChevronDown } from 'lucide-react'
import axios from 'axios'
import { useSession } from 'next-auth/react'

interface Position {
  position_id: number
  position_name: string
}

interface SelectPosition {
  openDropdown: string | null
  setOpenDropdown: React.Dispatch<React.SetStateAction<string | null>>
  positionDropdownRef: React.RefObject<HTMLDivElement>
  setSelectPosition: React.Dispatch<React.SetStateAction<number | null>>
  handleOnChangePosition: (prefix_id: number) => void
  initialPositionName: string
}

function SelectPrefix({
  openDropdown,
  setOpenDropdown,
  positionDropdownRef,
  setSelectPosition,
  handleOnChangePosition,
  initialPositionName,
}: SelectPosition) {
  const [positions, setPositions] = useState<Position[]>([])
  const [error, setError] = useState<string | null>(null)
  const [displayPosition, setDisplayPosition] =
    useState<string>('เลือกคำนำหน้า')
  const { data: session } = useSession()

  useEffect(() => {
    const fetchPosition = async () => {
      setError(null)
      try {
        if (!session?.accessToken) {
          throw new Error('No token found. Please log in.')
        }
        const response = await axios.get(
          process.env.NEXT_PUBLIC_API + '/position',
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${session.accessToken}`,
            },
          }
        )

        if (response.status === 200 && response.data.status) {
          setPositions(response.data.data)

          const matchingPosition = response.data.data.find(
            (position: Position) =>
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
        if (axios.isAxiosError(error)) {
          setError(error.response?.data?.message || 'Error fetching prefixes')
          console.error('Axios error:', error.response || error.message)
        } else {
          setError('An unknown error occurred')
          console.error('Unknown error:', error)
        }
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
            setOpenDropdown(openDropdown === 'position' ? null : 'position')
          }
          aria-expanded={openDropdown === 'position'}
          className="flex w-full items-center justify-between rounded-md border-2 border-gray-300 bg-white px-4 py-2 text-sm font-light text-gray-600 transition-all transition-colors duration-300 ease-in-out focus:border-blue-500 focus:outline-none dark:border-zinc-600 dark:bg-zinc-800 dark:text-gray-400"
        >
          {displayPosition}
          <ChevronDown
            className={`h-4 w-4 text-gray-600 transition-transform duration-200 dark:text-zinc-600 ${
              openDropdown === 'position' ? 'rotate-180' : ''
            }`}
          />
        </button>
        {openDropdown === 'position' && (
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
