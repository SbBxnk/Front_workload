import type React from 'react'
import { useState, useEffect } from 'react'
import { ChevronDown } from 'lucide-react'
import axios from 'axios'
import { useSession } from 'next-auth/react'

interface ExPosition {
  ex_position_id: number
  ex_position_name: string
}

interface SelectExPosition {
  openDropdown: string | null
  setOpenDropdown: React.Dispatch<React.SetStateAction<string | null>>
  expositionDropdownRef: React.RefObject<HTMLDivElement>
  setSelectExPosition: React.Dispatch<React.SetStateAction<number | null>>
  handleOnChangeExPosition: (prefix_id: number) => void
  initialExPositionName: string
}

function SelectPrefix({
  openDropdown,
  setOpenDropdown,
  expositionDropdownRef,
  setSelectExPosition,
  handleOnChangeExPosition,
  initialExPositionName,
}: SelectExPosition) {
  const [expositions, setExPositions] = useState<ExPosition[]>([])
  const [error, setError] = useState<string | null>(null)
  const [displayPosition, setDisplayExPosition] =
    useState<string>('เลือกคำนำหน้า')
  const { data: session } = useSession()

  useEffect(() => {
    const fetchExPosition = async () => {
      setError(null)
      try {
        if (!session?.accessToken) {
          throw new Error('No token found. Please log in.')
        }
        const response = await axios.get(
          process.env.NEXT_PUBLIC_API + '/ex_position',
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${session.accessToken}`,
            },
          }
        )

        if (response.status === 200 && response.data.status) {
          setExPositions(response.data.data)

          const matchingExPosition = response.data.data.find(
            (ex_position: ExPosition) =>
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
        if (axios.isAxiosError(error)) {
          setError(
            error.response?.data?.message || 'Error fetching ex_positions'
          )
          console.error('Axios error:', error.response || error.message)
        } else {
          setError('An unknown error occurred')
          console.error('Unknown error:', error)
        }
      }
    }

    fetchExPosition()
  }, [session?.accessToken, initialExPositionName, setSelectExPosition])

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
            setOpenDropdown(
              openDropdown === 'ex_position' ? null : 'ex_position'
            )
          }
          aria-expanded={openDropdown === 'ex_position'}
          className="flex w-full items-center justify-between rounded-md border-2 border-gray-300 bg-white px-4 py-2 text-sm font-light text-gray-600 transition-all transition-colors duration-300 ease-in-out focus:border-blue-500 focus:outline-none dark:border-zinc-600 dark:bg-zinc-800 dark:text-gray-400"
        >
          {displayPosition}
          <ChevronDown
            className={`h-4 w-4 text-gray-600 transition-transform duration-200 dark:text-zinc-600 ${
              openDropdown === 'ex_position' ? 'rotate-180' : ''
            }`}
          />
        </button>
        {openDropdown === 'ex_position' && (
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
