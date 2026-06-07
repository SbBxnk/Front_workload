'use client'

import SelectDropdown from '@/components/SelectDropdown'
import { usePrefixes } from './useDropdownData'

interface Props {
  selectedLabel: string
  onSelect: (id: number, name: string) => void
  onClear: () => void
}

export default function SelectPrefix({ selectedLabel, onSelect, onClear }: Props) {
  const { data: prefixes = [] } = usePrefixes()

  return (
    <SelectDropdown
      selectedLabel={selectedLabel}
      handleSelect={(value) => {
        if (value) {
          const item = prefixes.find((p) => p.prefix_id.toString() === value)
          if (item) onSelect(item.prefix_id, item.prefix_name)
        } else {
          onClear()
        }
      }}
      objects={prefixes}
      valueKey="prefix_id"
      labelKey="prefix_name"
      placeholder="เลือกคำนำหน้า"
    />
  )
}
