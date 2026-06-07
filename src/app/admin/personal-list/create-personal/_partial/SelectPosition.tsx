'use client'

import SelectDropdown from '@/components/SelectDropdown'
import { usePositions } from './useDropdownData'

interface Props {
  selectedLabel: string
  onSelect: (id: number, name: string) => void
  onClear: () => void
}

export default function SelectPosition({
  selectedLabel,
  onSelect,
  onClear,
}: Props) {
  const { data: positions = [] } = usePositions()

  return (
    <SelectDropdown
      selectedLabel={selectedLabel}
      handleSelect={(value) => {
        if (value) {
          const item = positions.find(
            (p) => p.position_id.toString() === value
          )
          if (item) onSelect(item.position_id, item.position_name)
        } else {
          onClear()
        }
      }}
      objects={positions}
      valueKey="position_id"
      labelKey="position_name"
      placeholder="เลือกตำแหน่งวิชาการ"
    />
  )
}
