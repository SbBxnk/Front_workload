import type React from "react"
import { ChevronDown } from "lucide-react"
import useFetchData from "@/hooks/FetchAPI"
import { Branch } from "@/Types"


interface SelectBranchProps {
    openDropdown: string | null
    setOpenDropdown: React.Dispatch<React.SetStateAction<string | null>>
    branchDropdownRef: React.RefObject<HTMLDivElement>
    handleOnChangeBranch: (branch_id: number, branch_name: string) => void
    setSelectedBranch: React.Dispatch<React.SetStateAction<string | null>>
    selectBranch: string | null
}

function SelectBranch({ openDropdown, setOpenDropdown, branchDropdownRef, handleOnChangeBranch, selectBranch, setSelectedBranch }: SelectBranchProps) {
    const { data: branches, error } = useFetchData<Branch[]>("/branch")

    const handleSelectBranch = (branch_id: number, branch_name: string) => {
        handleOnChangeBranch(branch_id, branch_name)
        setSelectedBranch(branch_name)
        setOpenDropdown(null)
    }

    return (
        <div>
            <label className="block text-sm font-regular text-gray-600 dark:text-gray-400 mb-2">สาขา</label>
            <div className="relative z-5" ref={branchDropdownRef}>
                <button
                    type="button"
                    onClick={() => setOpenDropdown(openDropdown === "branch" ? null : "branch")}
                    className="w-full px-4 py-2 font-light rounded-md text-sm border-2 border-gray-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-gray-600 dark:text-gray-400 focus:outline-none focus:border-blue-500 transition-colors flex items-center justify-between transition-all duration-300 ease-in-out"
                >
                    {selectBranch === null
                        ? "เลือกสาขา"
                        : branches?.find((branch) => branch.branch_name === selectBranch)?.branch_name || "เลือกสาขา"}
                    <ChevronDown
                        className={`w-4 h-4 text-gray-600 dark:text-zinc-600 transition-transform duration-200 ${openDropdown === "branch" ? "rotate-180" : ""}`}
                    />
                </button>
                {openDropdown === "branch" && branches && (
                    <div className="absolute z-10 overflow-y-auto max-h-36 w-full mt-2 bg-white dark:bg-zinc-900 border-2 border-gray-300 dark:border-zinc-600 rounded-md shadow-lg">
                        {branches.map((branch) => (
                            <div
                                key={branch.branch_id}
                                className="px-4 py-2 text-sm font-light text-gray-600 hover:bg-gray-100 dark:hover:bg-zinc-800 cursor-pointer dark:text-gray-400"
                                onClick={() => handleSelectBranch(branch.branch_id, branch.branch_name)}
                            >
                                {branch.branch_name}
                            </div>
                        ))}
                    </div>
                )}
            </div>
            {error && <div className="text-red-500 mt-2">เกิดข้อผิดพลาดในการเชื่อมต่อข้อมูล</div>}
        </div>
    )
}

export default SelectBranch