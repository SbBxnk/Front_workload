import type React from 'react'
import { useState, useEffect } from 'react'
import { ChevronDown } from 'lucide-react'
import axios from 'axios'
import { useSession } from 'next-auth/react'

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
  const [displayPrefix, setDisplayPrefix] = useState<string>('เลือกคำนำหน้า')
  const { data: session } = useSession()

  useEffect(() => {
    const fetchPrefix = async () => {
      setError(null)
      try {
        if (!session?.accessToken) {
          throw new Error('No token found. Please log in.')
        }
        const response = await axios.get(
          process.env.NEXT_PUBLIC_API + '/prefix',
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${session.accessToken}`,
            },
          }
        )

        if (response.status === 200 && response.data.status) {
          setPrefixes(response.data.data)

          const matchingPrefix = response.data.data.find(
            (prefix: Prefix) => prefix.prefix_name === initialPrefixName
          )
          if (matchingPrefix) {
            setSelectPrefix(matchingPrefix.prefix_id)
            setDisplayPrefix(matchingPrefix.prefix_name)
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
      fetchPrefix()
    }
  }, [initialPrefixName, setSelectPrefix, session?.accessToken])

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
            setOpenDropdown(openDropdown === 'prefix' ? null : 'prefix')
          }
          aria-expanded={openDropdown === 'prefix'}
          className="flex w-full items-center justify-between rounded-md border-2 border-gray-300 bg-white px-4 py-2 text-sm font-light text-gray-600 transition-all transition-colors duration-300 ease-in-out focus:border-blue-500 focus:outline-none dark:border-zinc-600 dark:bg-zinc-800 dark:text-gray-400"
        >
          {displayPrefix}
          <ChevronDown
            className={`h-4 w-4 text-gray-600 transition-transform duration-200 dark:text-zinc-600 ${
              openDropdown === 'prefix' ? 'rotate-180' : ''
            }`}
          />
        </button>
        {openDropdown === 'prefix' && (
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
      {error && <div className="mt-2 text-red-500">{error}</div>}
    </div>
  )
}

export default SelectPrefix
