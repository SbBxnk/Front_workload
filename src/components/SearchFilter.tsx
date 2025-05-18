import Select, { type ClearIndicatorProps, components, type StylesConfig } from "react-select"
import { FiX } from "react-icons/fi"

interface Option {
  value: string
  label: string
}

interface SearchFilterProps<T, K extends keyof T> {
  selectedLabel: string
  handleSelect: (value: string) => void
  objects: T[]
  valueKey: K
  labelKey: K
  placeholder?: string
}

export default function SearchFilter<T, K extends keyof T>({
  selectedLabel,
  handleSelect,
  objects,
  valueKey,
  labelKey,
  placeholder = "ค้นหา",
}: SearchFilterProps<T, K>) {
  const options: Option[] = objects.map((obj) => ({
    value: String(obj[valueKey]),
    label: String(obj[labelKey]),
  }))

  const CustomClearIndicator = (props: ClearIndicatorProps<Option, false>) => {
    return (
      <components.ClearIndicator {...props}>
        <FiX className="w-4 h-4 text-gray-400 hover:text-red-500 transition duration-200 cursor-pointer" />
      </components.ClearIndicator>
    )
  }

  const customStyles: StylesConfig<Option, false> = {
    control: (provided) => ({
      ...provided,
      fontSize: "0.875rem",
      fontWeight: "300",
      color: "#d1d5db",
      borderRadius: "0.375rem",
      border: "2px solid",
      padding: "2px 4px",
    }),
    placeholder: (provided) => ({
      ...provided,
      fontSize: "0.875rem",
      fontWeight: "300",
      color: "#9CA3AF",
    }),
    option: (provided) => ({
      ...provided,
      fontSize: "0.875rem",
      fontWeight: "300",
      padding: "10px",
    }),
    dropdownIndicator: (provided) => ({
      ...provided,
      fontSize: "1rem",
      padding: "4px",
    }),
  }

  return (
    <div className="w-full md:w-52">
      <Select<Option, false>
        placeholder={placeholder}
        options={options}
        onChange={(selectedOption) => {
          if (selectedOption && "value" in selectedOption) {
            handleSelect(selectedOption.value)
          } else {
            handleSelect("")
          }
        }}
        isClearable
        value={selectedLabel ? options.find((option) => option.value === selectedLabel) : null}
        classNamePrefix="react-select"
        components={{ ClearIndicator: CustomClearIndicator }}
        styles={customStyles}
      />
    </div>
  )
}

