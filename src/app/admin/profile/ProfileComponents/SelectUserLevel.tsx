import React, { useState, useEffect } from 'react'
import { ChevronDown } from 'lucide-react'
import axios from 'axios'
interface SelectedUserLevelProps {
  level_id: number
  level_name: string
  userLevelDropdownRef: React.RefObject<HTMLDivElement>
  setOpenDropdown: React.Dispatch<React.SetStateAction<string | null>>
  openDropdown: string | null
  handleOnChangeUserLevel: (level_id: number, level_name: string) => void
  setSelectedLevel: React.Dispatch<React.SetStateAction<string | null>>
  selectLevel: string | null
}

function SelectedUserLevel({
  userLevelDropdownRef,
  setOpenDropdown,
  openDropdown,
  handleOnChangeUserLevel,
  setSelectedLevel,
  selectLevel,
}: SelectedUserLevelProps) {
  const [userLevels, setUserLevels] = useState<SelectedUserLevelProps[]>([])
  const [, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchUserLevels = async () => {
      try {
        const token = localStorage.getItem('token')
        if (!token) {
          throw new Error('No token found. Please log in.')
        }

        const response = await axios.get(
          process.env.NEXT_PUBLIC_API + 'level',
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
          }
        )

        if (response.status === 200) {
          if (response.data.status) {
            setUserLevels(response.data.data) // Set user levels from API
          } else {
            throw new Error('No data found')
          }
        } else {
          throw new Error('Failed to fetch data')
        }
      } catch (error) {
        if (axios.isAxiosError(error)) {
          setError(error.response?.data?.message || 'Error fetching levels')
          console.error('Axios error:', error.response || error.message)
        } else {
          setError('An unknown error occurred')
          console.error('Unknown error:', error)
        }
      } finally {
        setLoading(false)
      }
    }

    fetchUserLevels()
  }, [])

  const handleSelectLevel = (level_id: number, level_name: string) => {
    setSelectedLevel(level_name)
    handleOnChangeUserLevel(level_id, level_name)
    setOpenDropdown(null)
  }

  return (
    <div>
      <label className="font-regular mb-2 block text-sm text-gray-600 dark:text-gray-400">
        ระดับผู้ใช้งาน
      </label>
      <div className="z-5 relative" ref={userLevelDropdownRef}>
        <button
          type="button"
          onClick={() =>
            setOpenDropdown(openDropdown === 'level' ? null : 'level')
          }
          className="flex w-full items-center justify-between rounded-md border-2 border-gray-300 bg-white px-4 py-2 text-sm font-light text-gray-600 transition-all transition-colors duration-300 ease-in-out focus:border-blue-500 focus:outline-none dark:border-zinc-600 dark:bg-zinc-800 dark:text-gray-400"
        >
          {selectLevel === null
            ? 'เลือกระดับ'
            : userLevels.find((level) => level.level_name === selectLevel)
                ?.level_name}
          <ChevronDown
            className={`h-4 w-4 text-gray-600 transition-transform duration-200 dark:text-zinc-600 ${openDropdown === 'level' ? 'rotate-180' : ''}`}
          />
        </button>
        {openDropdown === 'level' && (
          <div className="absolute z-10 mt-2 h-36 w-full overflow-y-auto rounded-md border-2 border-gray-300 bg-white shadow-lg dark:border-zinc-600 dark:bg-zinc-900">
            {userLevels.map((level) => (
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
      {error && <div className="mt-2 text-red-500">{error}</div>}
    </div>
  )
}

export default SelectedUserLevel
