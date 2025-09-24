import Select, {
  type ClearIndicatorProps,
  components,
  type StylesConfig,
} from 'react-select'
import { FiX } from 'react-icons/fi'

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
  className?: string
}

export default function SearchFilter<T, K extends keyof T>({
  selectedLabel,
  handleSelect,
  objects,
  valueKey,
  labelKey,
  placeholder = 'ค้นหา',
  className = '',
}: SearchFilterProps<T, K>) {
  const options: Option[] = objects.map((obj) => ({
    value: String(obj[valueKey]),
    label: String(obj[labelKey]),
  }))

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
      padding: '2px 4px',
      minHeight: '40px',
      ...(className.includes('w-full') ? {} : { maxWidth: '200px' }), // จำกัดความกว้างเฉพาะเมื่อไม่ได้ส่ง w-full
    }),
    placeholder: (provided) => ({
      ...provided,
      fontSize: '0.875rem',
      fontWeight: '300',
      color: '#9CA3AF',
    }),
    singleValue: (provided) => ({
      ...provided,
      fontSize: '0.875rem',
      fontWeight: '300',
      color: '#6B7280',
      maxWidth: 'calc(100% - 40px)', // ลบพื้นที่สำหรับ dropdown indicator
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    }),
    option: (provided) => ({
      ...provided,
      fontSize: '0.875rem',
      fontWeight: '300',
      padding: '10px',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    }),
    dropdownIndicator: (provided) => ({
      ...provided,
      fontSize: '1rem',
      padding: '4px',
    }),
    menu: (provided) => ({
      ...provided,
      maxWidth: '300px', 
      zIndex: 99999, 
    }),
    menuPortal: (provided) => ({
      ...provided,
      zIndex: 99999, 
    }),
    menuList: (provided) => ({
      ...provided,
      maxHeight: '200px',
    }),
  }

  return (
    <div className={`w-full ${className.includes('w-full') ? '' : 'md:min-w-[200px] md:max-w-[200px] md:w-auto'}`}>
      <Select<Option, false>
        placeholder={placeholder}
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
        menuPortalTarget={document.body}
        menuPosition="fixed"
      />
    </div>
  )
}
