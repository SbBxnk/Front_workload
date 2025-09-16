import React, { useState, useEffect } from 'react'
import { ChevronDown } from 'lucide-react'
import { useSession } from 'next-auth/react'
import DropdownService from '@/services/dropdownServices'
import type { DropdownBranch } from '@/services/dropdownServices'

interface SelectBranchProps {
  openDropdown: string | null
  setOpenDropdown: React.Dispatch<React.SetStateAction<string | null>>
  branchDropdownRef: React.RefObject<HTMLDivElement>
  setSelectBranch: React.Dispatch<React.SetStateAction<number | null>>
  handleOnChangeBranch: (branch_id: number) => void
  initialBranchName: string
  disabled?: boolean
}

function SelectBranch({
  openDropdown,
  setOpenDropdown,
  branchDropdownRef,
  setSelectBranch,
  handleOnChangeBranch,
  initialBranchName,
  disabled = false,
}: SelectBranchProps) {
  const [branches, setBranches] = useState<DropdownBranch[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const { data: session } = useSession()

  useEffect(() => {
    const fetchBranches = async () => {
      try {
        setLoading(true)
        setError(null)
        
        if (!session?.accessToken) {
          throw new Error('No access token available')
        }

        const response = await DropdownService.getBranches(session.accessToken)
        
        if (response.success && response.payload) {
          setBranches(response.payload)
        } else {
          throw new Error('Failed to fetch branches')
        }
      } catch (err) {
        console.error('Error fetching branches:', err)
        setError('Error fetching branches')
      } finally {
        setLoading(false)
      }
    }

    fetchBranches()
  }, [session?.accessToken])

  const handleSelectBranch = (branch_id: number, branch_name: string) => {
    setSelectBranch(branch_id)
    handleOnChangeBranch(branch_id)
    setOpenDropdown(null)
  }

  const displayBranch = initialBranchName || 'เลือกสาขา'

  if (loading) {
    return (
      <div className="space-y-2">
        <label className="font-regular mb-2 block text-sm text-gray-600 dark:text-gray-400">
          สาขา
        </label>
        <div className="flex h-10 w-full items-center justify-center rounded-md border-2 border-gray-300 bg-gray-100 dark:border-zinc-600 dark:bg-zinc-700">
          <span className="text-sm text-gray-500">กำลังโหลด...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-2">
        <label className="font-regular mb-2 block text-sm text-gray-600 dark:text-gray-400">
          สาขา
        </label>
        <div className="flex h-10 w-full items-center justify-center rounded-md border-2 border-red-300 bg-red-50 dark:border-red-600 dark:bg-red-900/20">
          <span className="text-sm text-red-500">{error}</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <label className="font-regular mb-2 block text-sm text-gray-600 dark:text-gray-400">
        สาขา
      </label>
      <div className="relative" ref={branchDropdownRef}>
        <button
          type="button"
          onClick={() =>
            !disabled && setOpenDropdown(openDropdown === 'branch' ? null : 'branch')
          }
          aria-expanded={openDropdown === 'branch'}
          disabled={disabled}
          className={`flex w-full items-center justify-between rounded-md border-2 border-gray-300 bg-white px-4 py-2 text-sm font-light text-gray-600 transition-colors duration-300 ease-in-out focus:border-blue-500 focus:outline-none disabled:cursor-not-allowed disabled:bg-gray-100 disabled:opacity-50 dark:border-zinc-600 dark:bg-zinc-800 dark:text-gray-400 dark:disabled:bg-zinc-700`}
        >
          {displayBranch}
          <ChevronDown
            className={`h-4 w-4 text-gray-600 transition-transform duration-200 dark:text-zinc-600 ${
              openDropdown === 'branch' ? 'rotate-180' : ''
            }`}
          />
        </button>
        {openDropdown === 'branch' && !disabled && (
          <div className="absolute z-10 mt-2 max-h-36 w-full overflow-y-auto rounded-md border-2 border-gray-300 bg-white shadow-lg dark:border-zinc-600 dark:bg-zinc-900">
            {branches.map((branch) => (
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
    </div>
  )
}

export default SelectBranch