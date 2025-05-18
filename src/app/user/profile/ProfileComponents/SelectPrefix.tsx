import type React from "react"
import { useState, useEffect } from "react"
import { ChevronDown } from "lucide-react"
import axios from "axios"

interface Prefix {
  prefix_id: number
  prefix_name: string
}

interface SelectPrefixProps {
  openDropdown: string | null
  setOpenDropdown: React.Dispatch<React.SetStateAction<string | null>>
  prefixDropdownRef: React.RefObject<HTMLDivElement>
  setSelectPrefix: React.Dispatch<React.SetStateAction<number | null>>
  handleOnChangePrefix: (prefix_id: number) => void
  initialPrefixName: string
}

function SelectPrefix({
  openDropdown,
  setOpenDropdown,
  prefixDropdownRef,
  setSelectPrefix,
  handleOnChangePrefix,
  initialPrefixName,
}: SelectPrefixProps) {
  const [prefixes, setPrefixes] = useState<Prefix[]>([])
  const [error, setError] = useState<string | null>(null)
  const [displayPrefix, setDisplayPrefix] = useState<string>("เลือกคำนำหน้า")

  useEffect(() => {
    const fetchPrefix = async () => {
      setError(null)
      try {
        const token = localStorage.getItem("token")
        if (!token) {
          throw new Error("No token found. Please log in.")
        }
        const response = await axios.get(process.env.NEXT_PUBLIC_API + "prefix", {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        })

        if (response.status === 200 && response.data.status) {
          setPrefixes(response.data.data)


          const matchingPrefix = response.data.data.find((prefix: Prefix) => prefix.prefix_name === initialPrefixName)
          if (matchingPrefix) {
            setSelectPrefix(matchingPrefix.prefix_id)
            setDisplayPrefix(matchingPrefix.prefix_name)
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

    fetchPrefix()
  }, [initialPrefixName, setSelectPrefix])

  const handleSelectPrefix = (prefix_id: number, prefix_name: string) => {
    setSelectPrefix(prefix_id)
    setDisplayPrefix(prefix_name)
    handleOnChangePrefix(prefix_id)
    setOpenDropdown(null)
  }

  return (
    <div>
      <label className="block text-sm font-regular text-gray-600 dark:text-gray-400 mb-2">คำนำหน้า</label>
      <div className="relative z-5" ref={prefixDropdownRef}>
        <button
          type="button"
          onClick={() => setOpenDropdown(openDropdown === "prefix" ? null : "prefix")}
          aria-expanded={openDropdown === "prefix"}
          className="w-full px-4 py-2 font-light rounded-md text-sm border-2 border-gray-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-gray-600 dark:text-gray-400 focus:outline-none focus:border-blue-500 transition-colors flex items-center justify-between transition-all duration-300 ease-in-out"
        >
          {displayPrefix}
          <ChevronDown
            className={`w-4 h-4 text-gray-600 dark:text-zinc-600 transition-transform duration-200 ${
              openDropdown === "prefix" ? "rotate-180" : ""
            }`}
          />
        </button>
        {openDropdown === "prefix" && (
          <div className="absolute z-10 overflow-y-auto max-h-36 w-full mt-2 bg-white dark:bg-zinc-900 border-2 border-gray-300 dark:border-zinc-600 rounded-md shadow-lg">
            {prefixes.map((prefix) => (
              <div
                key={prefix.prefix_id}
                className="px-4 py-2 text-sm font-light text-gray-600 hover:bg-gray-100 dark:hover:bg-zinc-800 cursor-pointer dark:text-gray-400"
                onClick={() => handleSelectPrefix(prefix.prefix_id, prefix.prefix_name)}
              >
                {prefix.prefix_name}
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

