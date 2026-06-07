'use client'

import SelectDropdown from '@/components/SelectDropdown'
import { useExPositions } from './useDropdownData'

interface Props {
  selectedLabel: string
  onSelect: (id: number, name: string) => void
  onClear: () => void
}

export default function SelectExPosition({
  selectedLabel,
  onSelect,
  onClear,
}: Props) {
  const { data: exPositions = [] } = useExPositions()

  return (
    <SelectDropdown
      selectedLabel={selectedLabel}
      handleSelect={(value) => {
        if (value) {
          const item = exPositions.find(
            (p) => p.ex_position_id.toString() === value
          )
          if (item) onSelect(item.ex_position_id, item.ex_position_name)
        } else {
          onClear()
        }
      }}
      objects={exPositions}
      valueKey="ex_position_id"
      labelKey="ex_position_name"
      placeholder="เลือกตำแหน่งบริหาร"
    />
  )
}
