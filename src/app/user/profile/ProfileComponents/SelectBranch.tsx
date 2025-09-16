import React, { useState, useEffect } from 'react'
import { ChevronDown } from 'lucide-react'
import axios from 'axios'
import { jwtDecode } from 'jwt-decode'
import { useSession } from 'next-auth/react'

interface UserLoginData {
  branch_name: string
}

interface Branch {
  branch_id: number
  branch_name: string
}

interface SelectBranchProps {
  openDropdown: string | null
  setOpenDropdown: React.Dispatch<React.SetStateAction<string | null>>
  branchDropdownRef: React.RefObject<HTMLDivElement>
  selectBranch: string | null
  setSelectedBranch: React.Dispatch<React.SetStateAction<string | null>>
  handleOnChangeBranch: (branch_id: number, branch_name: string) => void
}

function SelectBranch({
  openDropdown,
  setOpenDropdown,
  branchDropdownRef,
  selectBranch,
  setSelectedBranch,
  handleOnChangeBranch,
}: SelectBranchProps) {
  const [branchs, setBranchs] = useState<Branch[]>([])
  const [error, setError] = useState<string | null>(null)
  const { data: session } = useSession()

  useEffect(() => {
    if (session?.accessToken) {
      try {
        const decoded: UserLoginData = jwtDecode(session.accessToken)
        setSelectedBranch(decoded.branch_name)
      } catch (decodeError) {
        console.error('Error decoding token:', decodeError)
      }
    }
  }, [session?.accessToken, setSelectedBranch])

  useEffect(() => {
    const fetchBranch = async () => {
      setError(null) // Clear previous errors
      try {
        if (!session?.accessToken) {
          throw new Error('No token found. Please log in.')
        }

        const response = await axios.get(
          process.env.NEXT_PUBLIC_API + '/branch',
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${session.accessToken}`,
            },
          }
        )

        if (response.status === 200 && response.data.status) {
          setBranchs(response.data.data)
        } else {
          throw new Error('No data found')
        }
      } catch (error) {
        if (axios.isAxiosError(error)) {
          setError(error.response?.data?.message || 'Error fetching branchs')
          console.error('Axios error:', error.response || error.message)
        } else {
          setError('An unknown error occurred')
          console.error('Unknown error:', error)
        }
      }
    }

    if (session?.accessToken) {
      fetchBranch()
    }
  }, [session?.accessToken])

  const handleSelectBranch = (branch_id: number, branch_name: string) => {
    setSelectedBranch(branch_name)
    handleOnChangeBranch(branch_id, branch_name)
    setOpenDropdown(null)
  }

  return (
    <div>
      <label className="font-regular mb-2 block text-sm text-gray-600 dark:text-gray-400">
        หลักสูตร
      </label>
      <div className="z-5 relative" ref={branchDropdownRef}>
        <button
          type="button"
          onClick={() =>
            setOpenDropdown(openDropdown === 'branch' ? null : 'branch')
          }
          aria-expanded={openDropdown === 'branch'}
          className="flex w-full items-center justify-between rounded-md border-2 border-gray-300 bg-white px-4 py-2 text-sm font-light text-gray-600 transition-all transition-colors duration-300 ease-in-out focus:border-blue-500 focus:outline-none dark:border-zinc-600 dark:bg-zinc-800 dark:text-gray-400"
        >
          {selectBranch || 'เลือกสาขา'}
          <ChevronDown
            className={`h-4 w-4 text-gray-600 transition-transform duration-200 dark:text-zinc-600 ${
              openDropdown === 'branch' ? 'rotate-180' : ''
            }`}
          />
        </button>
        {openDropdown === 'branch' && (
          <div className="absolute z-10 mt-2 max-h-36 w-full overflow-y-auto rounded-md border-2 border-gray-300 bg-white shadow-lg dark:border-zinc-600 dark:bg-zinc-900">
            {branchs.map((branch) => (
              <div
                key={branch.branch_id}
                className="cursor-pointer px-4 py-2 text-sm font-light text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-zinc-800"
                onClick={() =>
                  handleSelectBranch(branch.branch_id, branch.branch_name)
                }
              >
                {branch.branch_name}
              </div>
            ))}
          </div>
        )}
      </div>
      {error && <div className="mt-2 text-red-500">{error}</div>}
    </div>
  )
}

export default SelectBranch
