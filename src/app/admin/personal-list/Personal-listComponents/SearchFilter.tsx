import React from 'react'
import { useRouter } from 'next/navigation'
import Select, {
  ClearIndicatorProps,
  components,
  StylesConfig,
} from 'react-select'
import { HiPlus } from 'react-icons/hi'
import { FiX } from 'react-icons/fi'

interface SearchFilterProps {
  searchName: string
  setSearchName: React.Dispatch<React.SetStateAction<string>>
  selectedLabel: string
  handleSelect: (value: string) => void
  objects: { position_id: number; position_name: string }[]
}

interface Option {
  value: string
  label: string
}

export default function SearchFilter({
  searchName,
  setSearchName,
  selectedLabel,
  handleSelect,
  objects,
}: SearchFilterProps) {
  const router = useRouter()

  const options = objects.map((position) => ({
    value: position.position_name,
    label: position.position_name,
  }))

  const createPersonal = () => {
    router.push('/admin/personal-list/create-personal')
  }

  const clearSearch = () => {
    setSearchName('')
  }

  const CustomClearIndicator = (props: ClearIndicatorProps<Option, false>) => {
    return (
      <components.ClearIndicator {...props}>
        <FiX className="h-4 w-4 cursor-pointer text-gray-400 transition duration-200 hover:text-red-500" />
      </components.ClearIndicator>
    )
  }

  const customStyles: StylesConfig<Option, false> = {
    control: (provided) => ({
      ...provided,
      fontSize: '0.875rem',
      fontWeight: '300',
      color: '#d1d5db',
      borderRadius: '0.375rem',
      border: '2px solid',
      padding: '0px 4px',
    }),
    placeholder: (provided) => ({
      ...provided,
      fontSize: '0.875rem',
      fontWeight: '300',
      color: '#9CA3AF',
    }),
    option: (provided) => ({
      ...provided,
      fontSize: '0.875rem',
      fontWeight: '300',
      padding: '10px',
    }),
    dropdownIndicator: (provided) => ({
      ...provided,
      fontSize: '1rem',
      padding: '4px',
    }),
  }

  return (
    <div className="pb-4 md:flex">
      <div className="flex w-full flex-wrap items-center gap-4 md:w-full">
        <div className="relative flex w-full items-center md:w-52">
          <input
            className="w-full rounded-md border-2 border-gray-300 px-4 py-2 text-sm font-light text-gray-600 transition-all duration-300 ease-in-out focus:border-blue-500 focus:outline-none dark:border-zinc-600 dark:bg-zinc-800 dark:text-gray-400"
            placeholder="ค้นหาด้วยชื่อบุคคล"
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
          />
          {searchName && (
            <button
              onClick={clearSearch}
              className="absolute right-3 text-gray-400 transition duration-200 hover:text-red-500"
            >
              <FiX className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="w-full md:w-52">
          <Select<Option, false>
            placeholder="ค้นหาตำแหน่ง"
            options={options}
            onChange={(selectedOption) => {
              if (selectedOption && 'value' in selectedOption) {
                handleSelect(selectedOption.value)
              } else {
                handleSelect('')
              }
            }}
            isClearable
            value={
              selectedLabel
                ? options.find((option) => option.value === selectedLabel)
                : null
            }
            classNamePrefix="react-select"
            components={{ ClearIndicator: CustomClearIndicator }}
            styles={customStyles}
          />
        </div>
      </div>
      <div className="pt-4 md:pt-0">
        <button
          onClick={createPersonal}
          className="flex w-full items-center justify-between gap-2 rounded-md bg-success px-4 py-2.5 text-sm font-light text-white transition duration-300 ease-in-out hover:bg-success/80 md:w-52"
        >
          เพิ่มบุคลากร
          <HiPlus className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
