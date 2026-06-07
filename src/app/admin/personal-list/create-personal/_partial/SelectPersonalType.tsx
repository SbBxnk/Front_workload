'use client'

import SelectDropdown from '@/components/SelectDropdown'
import { usePersonalTypes } from './useDropdownData'

interface Props {
  selectedLabel: string
  onSelect: (id: number, name: string) => void
  onClear: () => void
}

export default function SelectPersonalType({
  selectedLabel,
  onSelect,
  onClear,
}: Props) {
  const { data: personalTypes = [] } = usePersonalTypes()

  return (
    <SelectDropdown
      selectedLabel={selectedLabel}
      handleSelect={(value) => {
        if (value) {
          const item = personalTypes.find(
            (p) => p.type_p_id.toString() === value
          )
          if (item) onSelect(item.type_p_id, item.type_p_name)
        } else {
          onClear()
        }
      }}
      objects={personalTypes}
      valueKey="type_p_id"
      labelKey="type_p_name"
      placeholder="เลือกประเภทบุคลากร"
    />
  )
}
