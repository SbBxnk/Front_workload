'use client'

import SelectDropdown from '@/components/SelectDropdown'
import { useBranches } from './useDropdownData'

interface Props {
  selectedLabel: string
  onSelect: (id: number, name: string) => void
  onClear: () => void
}

export default function SelectBranch({ selectedLabel, onSelect, onClear }: Props) {
  const { data: branches = [] } = useBranches()

  return (
    <SelectDropdown
      selectedLabel={selectedLabel}
      handleSelect={(value) => {
        if (value) {
          const item = branches.find((b) => b.branch_id.toString() === value)
          if (item) onSelect(item.branch_id, item.branch_name)
        } else {
          onClear()
        }
      }}
      objects={branches}
      valueKey="branch_id"
      labelKey="branch_name"
      placeholder="เลือกสาขา"
    />
  )
}
