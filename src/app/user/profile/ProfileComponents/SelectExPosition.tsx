import type React from "react"
import { useState, useEffect } from "react"
import { ChevronDown } from "lucide-react"
import axios from "axios"

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
  const [displayPosition, setDisplayExPosition] = useState<string>("เลือกคำนำหน้า")

  useEffect(() => {
    const fetchExPosition = async () => {
      setError(null)
      try {
        const token = localStorage.getItem("token")
        if (!token) {
          throw new Error("No token found. Please log in.")
        }
        const response = await axios.get(process.env.NEXT_PUBLIC_API + "ex_position", {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        })

        if (response.status === 200 && response.data.status) {
            setExPositions(response.data.data)

          const matchingExPosition = response.data.data.find((ex_position: ExPosition) => ex_position.ex_position_name === initialExPositionName)
          if (matchingExPosition) {
            setSelectExPosition(matchingExPosition.ex_position_id)
            setDisplayExPosition(matchingExPosition.ex_position_name)
          }
        } else {
          throw new Error("No data found")
        }
      } catch (error) {
        if (axios.isAxiosError(error)) {
          setError(error.response?.data?.message || "Error fetching ex_positions")
          console.error("Axios error:", error.response || error.message)
        } else {
          setError("An unknown error occurred")
          console.error("Unknown error:", error)
        }
      }
    }

    fetchExPosition()
  }, [initialExPositionName, setSelectExPosition])

  const handleSelectExPosition = (ex_position_id: number, ex_position_name: string) => {
    setSelectExPosition(ex_position_id)
    setDisplayExPosition(ex_position_name)
    handleOnChangeExPosition(ex_position_id)
    setOpenDropdown(null)
  }

  return (
    <div>
      <label className="block text-sm font-regular text-gray-600 dark:text-gray-400 mb-2">ตำแหน่งวิชาการ</label>
      <div className="relative z-5" ref={expositionDropdownRef}>
        <button
          type="button"
          onClick={() => setOpenDropdown(openDropdown === "ex_position" ? null : "ex_position")}
          aria-expanded={openDropdown === "ex_position"}
          className="w-full px-4 py-2 font-light rounded-md text-sm border-2 border-gray-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-gray-600 dark:text-gray-400 focus:outline-none focus:border-blue-500 transition-colors flex items-center justify-between transition-all duration-300 ease-in-out"
        >
          {displayPosition}
          <ChevronDown
            className={`w-4 h-4 text-gray-600 dark:text-zinc-600 transition-transform duration-200 ${
              openDropdown === "ex_position" ? "rotate-180" : ""
            }`}
          />
        </button>
        {openDropdown === "ex_position" && (
          <div className="absolute z-10 overflow-y-auto max-h-36 w-full mt-2 bg-white dark:bg-zinc-900 border-2 border-gray-300 dark:border-zinc-600 rounded-md shadow-lg">
            {expositions.map((ex_position) => (
              <div
                key={ex_position.ex_position_id}
                className="px-4 py-2 text-sm font-light text-gray-600 hover:bg-gray-100 dark:hover:bg-zinc-800 cursor-pointer dark:text-gray-400"
                onClick={() => handleSelectExPosition(ex_position.ex_position_id, ex_position.ex_position_name)}
              >
                {ex_position.ex_position_name}
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

