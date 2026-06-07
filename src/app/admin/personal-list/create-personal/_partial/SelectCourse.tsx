'use client'

import SelectDropdown from '@/components/SelectDropdown'
import { useCourses } from './useDropdownData'

interface Props {
  selectedLabel: string
  branchId: number | null
  onSelect: (id: number, name: string) => void
  onClear: () => void
}

export default function SelectCourse({
  selectedLabel,
  branchId,
  onSelect,
  onClear,
}: Props) {
  // หลักสูตรขึ้นกับสาขาที่เลือก (รักษา behavior เดิม)
  const { data: courses = [], isFetching } = useCourses(branchId)

  return (
    <SelectDropdown
      selectedLabel={selectedLabel}
      handleSelect={(value) => {
        if (value) {
          const item = courses.find((c) => c.course_id.toString() === value)
          if (item) onSelect(item.course_id, item.course_name)
        } else {
          onClear()
        }
      }}
      objects={courses}
      valueKey="course_id"
      labelKey="course_name"
      placeholder={isFetching ? 'กำลังโหลด...' : 'เลือกหลักสูตร'}
    />
  )
}
