'use client'

import SelectDropdown from '@/components/SelectDropdown'
import { useUserLevels } from './useDropdownData'

interface Props {
  selectedLabel: string
  onSelect: (id: number, name: string) => void
  onClear: () => void
}

export default function SelectUserLevel({
  selectedLabel,
  onSelect,
  onClear,
}: Props) {
  const { data: userLevels = [] } = useUserLevels()

  return (
    <SelectDropdown
      selectedLabel={selectedLabel}
      handleSelect={(value) => {
        if (value) {
          const item = userLevels.find((l) => l.level_id.toString() === value)
          if (item) onSelect(item.level_id, item.level_name)
        } else {
          onClear()
        }
      }}
      objects={userLevels}
      valueKey="level_id"
      labelKey="level_name"
      placeholder="เลือกระดับผู้ใช้งาน"
    />
  )
}
