import React, { useState, useRef, useEffect } from 'react'
import { MdOutlinePersonAddAlt } from 'react-icons/md'
import { IoClose } from 'react-icons/io5'
import { ChevronDown } from 'lucide-react'

const prefixes = [
  { value: '', label: 'เลือกคำนำหน้า' },
  { value: 'นาย', label: 'นาย' },
  { value: 'นาง', label: 'นาง' },
  { value: 'นางสาว', label: 'นางสาว' },
]

const positions = [
  { value: '', label: 'เลือกตำแหน่งวิชาการ' },
  { value: 'อาจารย์', label: 'อาจารย์' },
  { value: 'รองศาสตราจารย์', label: 'รองศาสตราจารย์' },
  { value: 'ศาสตราจารย์', label: 'ศาสตราจารย์' },
]

const ex_positions = [
  { value: '', label: 'เลือกตำแหน่งบริหาร' },
  { value: 'หัวหน้าสาขา', label: 'หัวหน้าสาขา' },
]

export default function CreatePersonalModal() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isPositionDropdownOpen, setIsPositionDropdownOpen] = useState(false)
  const [isExPositionDropdownOpen, setIsExPositionDropdownOpen] =
    useState(false)
  const [selectedPosition, setSelectedPosition] = useState('')
  const [selectedExPosition, setSelectedExPosition] = useState('')
  const dropdownRef = useRef<HTMLDivElement>(null)
  const positionDropdownRef = useRef<HTMLDivElement>(null)
  const exPositionDropdownRef = useRef<HTMLDivElement>(null)

  const [gender, setGender] = useState('')
  const [prefix, setPrefix] = useState('')
  const handleClickOutside = (e: MouseEvent) => {
    if (
      dropdownRef.current &&
      !dropdownRef.current.contains(e.target as Node) &&
      positionDropdownRef.current &&
      !positionDropdownRef.current.contains(e.target as Node) &&
      exPositionDropdownRef.current &&
      !exPositionDropdownRef.current.contains(e.target as Node)
    ) {
      setIsDropdownOpen(false)
      setIsPositionDropdownOpen(false)
      setIsExPositionDropdownOpen(false)
    }
  }

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handlePrefixSelect = (value: string) => {
    setPrefix(value)
    setIsDropdownOpen(false)

    if (value === 'นาย') {
      setGender('ชาย')
    } else if (value === 'นาง' || value === 'นางสาว') {
      setGender('หญิง')
    } else {
      setGender('')
    }
  }

  const handleSelectPosition = (value: string) => {
    setSelectedPosition(value)
    setIsPositionDropdownOpen(false)
  }

  const handleSelectExPosition = (value: string) => {
    setSelectedExPosition(value)
    setIsExPositionDropdownOpen(false)
  }

  return (
    <div className="drawer-side z-50">
      <label
        htmlFor="my-drawer-4"
        className="drawer-overlay !cursor-default"
      ></label>
      <div className="menu h-full w-full bg-white text-base-content dark:bg-zinc-800 md:m-4 md:h-auto md:w-[500px] md:rounded-md">
        <div className="mx-6 flex items-center justify-between border-b-2 border-gray-300 py-4 dark:border-zinc-600">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl text-gray-600 dark:text-gray-400">
              เพิ่มบุคลากร
            </h1>
            <MdOutlinePersonAddAlt className="h-7 w-7 text-gray-600 dark:text-gray-400" />
          </div>
          <button className="text-gray-600 hover:text-gray-800 dark:text-gray-400">
            <IoClose className="h-6 w-6" />
          </button>
        </div>

        <div className="menu-content px-6 py-4">
          <form className="space-y-6">
            {/* Personal Information Section */}
            <div className="rounded-lg border-2 border-gray-200 p-4 dark:border-zinc-700">
              <h2 className="mb-4 text-lg font-medium text-gray-700 dark:text-gray-300">
                ข้อมูลส่วนตัว
              </h2>
              <div className="space-y-4">
                <div className="flex flex-row gap-4">
                  <div>
                    <label className="font-regular mb-2 block text-sm text-gray-600 dark:text-gray-400">
                      คำนำหน้า
                    </label>
                    <div className="relative" ref={dropdownRef}>
                      <button
                        type="button"
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        className="flex w-32 items-center justify-between rounded-lg border-2 border-gray-300 bg-white px-4 py-2 font-light text-gray-400 transition-colors focus:border-blue-500 focus:outline-none dark:border-zinc-600 dark:bg-zinc-800 dark:text-gray-400"
                      >
                        {prefix
                          ? prefixes.find((p) => p.value === prefix)?.label
                          : 'คำนำหน้า'}
                        <ChevronDown
                          className={`h-4 w-4 text-gray-400 transition-transform duration-200 dark:text-zinc-600 ${isDropdownOpen ? 'rotate-180' : ''}`}
                        />
                      </button>

                      {isDropdownOpen && (
                        <div className="absolute z-10 mt-2 w-32 rounded-md border-2 border-gray-300 bg-white shadow-lg dark:border-zinc-600 dark:bg-zinc-900">
                          {prefixes.map((prefixOption) => (
                            <div
                              key={prefixOption.value}
                              className="cursor-pointer px-4 py-2 text-sm font-light text-gray-400 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-zinc-800"
                              onClick={() =>
                                handlePrefixSelect(prefixOption.value)
                              }
                            >
                              {prefixOption.label}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="space-y-2">
                      <label className="font-regular mb-2 block text-sm text-gray-600 dark:text-gray-400">
                        เพศ
                      </label>
                      <div className="flex h-full items-center gap-6">
                        <label className="flex cursor-pointer items-center space-x-2">
                          <input
                            type="radio"
                            name="gender"
                            value="ชาย"
                            disabled
                            checked={gender === 'ชาย'}
                            onChange={() => setGender('ชาย')}
                            className="h-4 w-4 cursor-pointer border-gray-300 bg-gray-100 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="font-light text-gray-600 dark:text-gray-400">
                            ชาย
                          </span>
                        </label>
                        <label className="flex cursor-pointer items-center space-x-2">
                          <input
                            type="radio"
                            name="gender"
                            value="หญิง"
                            disabled
                            checked={gender === 'หญิง'}
                            onChange={() => setGender('หญิง')}
                            className="h-4 w-4 cursor-pointer border-gray-300 bg-gray-100 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="font-light text-gray-600 dark:text-gray-400">
                            หญิง
                          </span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-row gap-4">
                  <div className="flex-1">
                    <label className="font-regular mb-2 block text-sm text-gray-600 dark:text-gray-400">
                      ชื่อ
                    </label>
                    <input
                      type="text"
                      className="w-full rounded-lg border-2 border-gray-300 px-4 py-2 font-light text-gray-600 transition-colors focus:border-blue-500 focus:outline-none dark:border-zinc-600 dark:text-gray-400"
                      placeholder="กรอกชื่อ"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="font-regular mb-2 block text-sm text-gray-600 dark:text-gray-400">
                      นามสกุล
                    </label>
                    <input
                      type="text"
                      className="w-full rounded-lg border-2 border-gray-300 px-4 py-2 font-light text-gray-600 transition-colors focus:border-blue-500 focus:outline-none dark:border-zinc-600 dark:text-gray-400"
                      placeholder="กรอกนามสกุล"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Information Section */}
            <div className="rounded-lg border-2 border-gray-200 p-4 dark:border-zinc-700">
              <h2 className="mb-4 text-lg font-medium text-gray-700 dark:text-gray-300">
                ข้อมูลการติดต่อ
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="font-regular mb-2 block text-sm text-gray-600 dark:text-gray-400">
                    อีเมล
                  </label>
                  <input
                    type="email"
                    className="w-full rounded-lg border-2 border-gray-300 px-4 py-2 font-light text-gray-600 transition-colors focus:border-blue-500 focus:outline-none dark:border-zinc-600 dark:text-gray-400"
                    placeholder="example.live.rmutl.ac.th"
                  />
                </div>
              </div>
            </div>

            {/* Position Information Section */}
            <div className="rounded-lg border-2 border-gray-200 p-4 dark:border-zinc-700">
              <h2 className="mb-4 text-lg font-medium text-gray-700 dark:text-gray-300">
                ข้อมูลตำแหน่ง
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="font-regular mb-2 block text-sm text-gray-600 dark:text-gray-400">
                    เลขประจำตำแหน่ง
                  </label>
                  <input
                    type="text"
                    className="w-full rounded-lg border-2 border-gray-300 px-4 py-2 font-light text-gray-600 transition-colors focus:border-blue-500 focus:outline-none dark:border-zinc-600 dark:text-gray-400"
                    placeholder="6564XXXXXXX-X"
                  />
                </div>

                <div className="flex flex-row gap-4">
                  <div className="flex-1">
                    <label className="font-regular mb-2 block text-sm text-gray-600 dark:text-gray-400">
                      ตำแหน่งวิชาการ
                    </label>
                    <div className="relative flex-1" ref={positionDropdownRef}>
                      <button
                        type="button"
                        onClick={() =>
                          setIsPositionDropdownOpen(!isPositionDropdownOpen)
                        }
                        className="flex w-full items-center justify-between rounded-lg border-2 border-gray-300 bg-white px-4 py-2 font-light text-gray-400 transition-colors focus:border-blue-500 focus:outline-none dark:border-zinc-600 dark:bg-zinc-800 dark:text-gray-400"
                      >
                        {positions
                          ? positions.find((p) => p.value === selectedPosition)
                              ?.label
                          : 'ตำแหน่งวิชาการ'}
                        <ChevronDown
                          className={`h-4 w-4 text-gray-400 transition-transform duration-200 dark:text-zinc-600 ${isPositionDropdownOpen ? 'rotate-180' : ''}`}
                        />
                      </button>
                      {isPositionDropdownOpen && (
                        <div className="absolute z-10 mt-2 w-full rounded-md border-2 border-gray-300 bg-white shadow-lg dark:border-zinc-600 dark:bg-zinc-900">
                          {positions.map((position) => (
                            <div
                              key={position.value}
                              className="cursor-pointer px-4 py-2 text-sm font-light text-gray-400 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-zinc-800"
                              onClick={() =>
                                handleSelectPosition(position.value)
                              }
                            >
                              {position.label}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex-1">
                    <label className="font-regular mb-2 block text-sm text-gray-600 dark:text-gray-400">
                      ตำแหน่งบริหาร
                    </label>
                    <div className="relative" ref={exPositionDropdownRef}>
                      <button
                        type="button"
                        onClick={() =>
                          setIsExPositionDropdownOpen(!isExPositionDropdownOpen)
                        }
                        className="flex w-full items-center justify-between rounded-lg border-2 border-gray-300 bg-white px-4 py-2 font-light text-gray-400 transition-colors focus:border-blue-500 focus:outline-none dark:border-zinc-600 dark:bg-zinc-800 dark:text-gray-400"
                      >
                        {ex_positions
                          ? ex_positions.find(
                              (p) => p.value === selectedExPosition
                            )?.label
                          : 'ตำแหน่งบริหาร'}
                        <ChevronDown
                          className={`h-4 w-4 text-gray-400 transition-transform duration-200 dark:text-zinc-600 ${isExPositionDropdownOpen ? 'rotate-180' : ''}`}
                        />
                      </button>
                      {isExPositionDropdownOpen && (
                        <div className="absolute z-10 mt-2 w-full rounded-md border-2 border-gray-300 bg-white shadow-lg dark:border-zinc-600 dark:bg-zinc-900">
                          {ex_positions.map((ex_position) => (
                            <div
                              key={ex_position.value}
                              className="cursor-pointer px-4 py-2 text-sm font-light text-gray-400 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-zinc-800"
                              onClick={() =>
                                handleSelectExPosition(ex_position.value)
                              }
                            >
                              {ex_position.label}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button className="rounded-lg bg-success px-6 py-2 text-white transition-colors duration-200 hover:bg-success/80 focus:outline-none focus:ring-2 focus:ring-success focus:ring-offset-2">
                บันทึกข้อมูล
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
