import type React from 'react'
import { ChevronDown } from 'lucide-react'
import useFetchData from '@/hooks/FetchAPI'
import { Branch } from '@/Types'

interface SelectBranchProps {
  openDropdown: string | null
  setOpenDropdown: React.Dispatch<React.SetStateAction<string | null>>
  branchDropdownRef: React.RefObject<HTMLDivElement>
  handleOnChangeBranch: (branch_id: number, branch_name: string) => void
  setSelectedBranch: React.Dispatch<React.SetStateAction<string | null>>
  selectBranch: string | null
}

function SelectBranch({
  openDropdown,
  setOpenDropdown,
  branchDropdownRef,
  handleOnChangeBranch,
  selectBranch,
  setSelectedBranch,
}: SelectBranchProps) {
  const { data: branches, error } = useFetchData<Branch[]>('/branch')

  const handleSelectBranch = (branch_id: number, branch_name: string) => {
    handleOnChangeBranch(branch_id, branch_name)
    setSelectedBranch(branch_name)
    setOpenDropdown(null)
  }

  return (
    <div>
      <label className="font-regular mb-2 block text-sm text-gray-600 dark:text-gray-400">
        สาขา
      </label>
      <div className="z-5 relative" ref={branchDropdownRef}>
        <button
          type="button"
          onClick={() =>
            setOpenDropdown(openDropdown === 'branch' ? null : 'branch')
          }
          className="flex w-full items-center justify-between rounded-md border-2 border-gray-300 bg-white px-4 py-2 text-sm font-light text-gray-600 transition-all transition-colors duration-300 ease-in-out focus:border-blue-500 focus:outline-none dark:border-zinc-600 dark:bg-zinc-800 dark:text-gray-400"
        >
          {selectBranch === null
            ? 'เลือกสาขา'
            : branches?.find((branch) => branch.branch_name === selectBranch)
                ?.branch_name || 'เลือกสาขา'}
          <ChevronDown
            className={`h-4 w-4 text-gray-600 transition-transform duration-200 dark:text-zinc-600 ${openDropdown === 'branch' ? 'rotate-180' : ''}`}
          />
        </button>
        {openDropdown === 'branch' && branches && (
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
      {error && (
        <div className="mt-2 text-red-500">
          เกิดข้อผิดพลาดในการเชื่อมต่อข้อมูล
        </div>
      )}
    </div>
  )
}

export default SelectBranch
