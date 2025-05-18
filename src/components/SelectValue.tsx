"use client"

import { useState, useEffect } from "react"
import Select, {
  type ClearIndicatorProps,
  components,
  type StylesConfig,
  type SingleValue,
} from "react-select"
import { FiX } from "react-icons/fi"

export interface SelectOption {
  value: number | string
  label: string
}

interface SelectDropdownProps {
  options: SelectOption[]
  value: SelectOption | null
  onChange: (option: SelectOption | null) => void
  placeholder?: string
  isDisabled?: boolean
  isLoading?: boolean
  isClearable?: boolean
  isSearchable?: boolean
  className?: string
  menuPosition?: "absolute" | "fixed"
  noOptionsMessage?: () => string
}

export default function SelectDropdown({
  options,
  value,
  onChange,
  placeholder = "เลือกตัวเลือก",
  isDisabled = false,
  isLoading = false,
  isClearable = true,
  isSearchable = true,
  className = "",
  menuPosition = "fixed",
  noOptionsMessage = () => "ไม่พบข้อมูล",
}: SelectDropdownProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const CustomClearIndicator = (props: ClearIndicatorProps<SelectOption, false>) => {
    return (
      <components.ClearIndicator {...props}>
        <FiX className="w-4 h-4 text-gray-400 hover:text-red-500 transition duration-200 cursor-pointer" />
      </components.ClearIndicator>
    )
  }

  // Custom styles for react-select
  const customStyles: StylesConfig<SelectOption, false> = {
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
    menuPortal: (base) => ({
      ...base,
      zIndex: 9999,
    }),
  }

  const handleChange = (option: SingleValue<SelectOption>) => {
    onChange(option)
  }

  if (!mounted) return null

  return (
    <div className={`dark:text-gray-400 ${className}`}>
      <Select
        options={options}
        value={value}
        onChange={handleChange}
        components={{ ClearIndicator: CustomClearIndicator }}
        placeholder={placeholder}
        isClearable={isClearable}
        isSearchable={isSearchable}
        isDisabled={isDisabled}
        isLoading={isLoading}
        styles={customStyles}
        className="react-select-container"
        classNamePrefix="react-select"
        menuPortalTarget={document.body}
        menuPosition={menuPosition}
        noOptionsMessage={() => noOptionsMessage()}
        theme={(theme) => ({
          ...theme,
          colors: {
            ...theme.colors,
            primary: "#3b82f6",
            primary25: "#e5e7eb",
            neutral0: "var(--bg-color, white)",
            neutral80: "var(--text-color, #4b5563)",
          },
        })}
      />
    </div>
  )
}
