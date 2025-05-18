import type React from "react"
import { useState, useEffect } from "react"
import { ChevronDown } from "lucide-react"
import axios from "axios"

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
  const [displayPosition, setDisplayPosition] = useState<string>("เลือกคำนำหน้า")

  useEffect(() => {
    const fetchPosition = async () => {
      setError(null)
      try {
        const token = localStorage.getItem("token")
        if (!token) {
          throw new Error("No token found. Please log in.")
        }
        const response = await axios.get(process.env.NEXT_PUBLIC_API + "position", {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        })

        if (response.status === 200 && response.data.status) {
            setPositions(response.data.data)

          const matchingPosition = response.data.data.find((position: Position) => position.position_name === initialPositionName)
          if (matchingPosition) {
            setSelectPosition(matchingPosition.position_id)
            setDisplayPosition(matchingPosition.position_name)
          }
        } else {
          throw new Error("No data found")
        }
      } catch (error) {
        if (axios.isAxiosError(error)) {
          setError(error.response?.data?.message || "Error fetching prefixes")
          console.error("Axios error:", error.response || error.message)
        } else {
          setError("An unknown error occurred")
          console.error("Unknown error:", error)
        }
      }
    }

    fetchPosition()
  }, [initialPositionName, setSelectPosition])

  const handleSelectPosition = (position_id: number, position_name: string) => {
    setSelectPosition(position_id)
    setDisplayPosition(position_name)
    handleOnChangePosition(position_id)
    setOpenDropdown(null)
  }

  return (
    <div>
      <label className="block text-sm font-regular text-gray-600 dark:text-gray-400 mb-2">ตำแหน่งวิชาการ</label>
      <div className="relative z-5" ref={positionDropdownRef}>
        <button
          type="button"
          onClick={() => setOpenDropdown(openDropdown === "position" ? null : "position")}
          aria-expanded={openDropdown === "position"}
          className="w-full px-4 py-2 font-light rounded-md text-sm border-2 border-gray-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-gray-600 dark:text-gray-400 focus:outline-none focus:border-blue-500 transition-colors flex items-center justify-between transition-all duration-300 ease-in-out"
        >
          {displayPosition}
          <ChevronDown
            className={`w-4 h-4 text-gray-600 dark:text-zinc-600 transition-transform duration-200 ${
              openDropdown === "position" ? "rotate-180" : ""
            }`}
          />
        </button>
        {openDropdown === "position" && (
          <div className="absolute z-10 overflow-y-auto max-h-36 w-full mt-2 bg-white dark:bg-zinc-900 border-2 border-gray-300 dark:border-zinc-600 rounded-md shadow-lg">
            {positions.map((position) => (
              <div
                key={position.position_id}
                className="px-4 py-2 text-sm font-light text-gray-600 hover:bg-gray-100 dark:hover:bg-zinc-800 cursor-pointer dark:text-gray-400"
                onClick={() => handleSelectPosition(position.position_id, position.position_name)}
              >
                {position.position_name}
              </div>
            ))}
          </div>
        )}
      </div>
      {error && <div className="text-red-500 mt-2">{error}</div>}
    </div>
  )
}

export default SelectPrefix

