import React, { useState, useRef, useEffect } from 'react'
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

const branchs = [
  { value: '', label: 'เลือกสาขา' },
  { value: 'สาขาบริหารธุรกิจ', label: 'สาขาบริหารธุรกิจ' },
  { value: 'สาขาการบัญชี', label: 'สาขาการบัญชี' },
  { value: 'สาขาศิลปศาสตร์', label: 'สาขาศิลปศาสตร์' },
]

const courses = [
  { value: '', label: 'เลือกหลักสูตร' },
  { value: 'เทคโนโลยีสารสนเทศ', label: 'เทคโนโลยีสารสนเทศ' },
  { value: 'การจัดการ', label: 'การจัดการ' },
  { value: 'การบัญชี', label: 'การบัญชี' },
  { value: 'การตลาด', label: 'การตลาด' },
]

const user_levels = [
  { value: '', label: 'เลือกระดับผู้ใช้งาน' },
  { value: 'ผู้ใช้งานทั่วไป', label: 'ผู้ใช้งานทั่วไป' },
  { value: 'ผู้ประเมิน', label: 'ผู้ประเมิน' },
  { value: 'เลขาณุการ', label: 'เลขาณุการ' },
  { value: 'ผู้ดูแลระบบ', label: 'ผู้ดูแลระบบ' },
]
export default function CreatePersonalModal() {
  const [isPrefixDropdownOpen, setIsPrefixDropdownOpen] = useState(false)
  const [isPositionDropdownOpen, setIsPositionDropdownOpen] = useState(false)
  const [isExPositionDropdownOpen, setIsExPositionDropdownOpen] =
    useState(false)
  const [isBranchDropdownOpen, setIsBranchDropdownOpen] = useState(false)
  const [isCourseDropdownOpen, setIsCourseDropdownOpen] = useState(false)
  const [isUserLevelDropdownOpen, setIsUserLevelDropdownOpen] = useState(false)
  const [selectedPrefix, setSelectedPrefix] = useState('')
  const [selectedPosition, setSelectedPosition] = useState('')
  const [selectedExPosition, setSelectedExPosition] = useState('')
  const [selectedBanch, setSelectedBranch] = useState('')
  const [selectCorse, setSelectedCourse] = useState('')
  const [selectUserLevel, setSelectedUserLevel] = useState('')
  const prefixDropdownRef = useRef<HTMLDivElement>(null)
  const positionDropdownRef = useRef<HTMLDivElement>(null)
  const exPositionDropdownRef = useRef<HTMLDivElement>(null)
  const branchDropdownRef = useRef<HTMLDivElement>(null)
  const courseDropdownRef = useRef<HTMLDivElement>(null)
  const userLevelDropdownRef = useRef<HTMLDivElement>(null)

  const handleClickOutside = (e: MouseEvent) => {
    if (
      prefixDropdownRef.current &&
      !prefixDropdownRef.current.contains(e.target as Node) &&
      positionDropdownRef.current &&
      !positionDropdownRef.current.contains(e.target as Node) &&
      exPositionDropdownRef.current &&
      !exPositionDropdownRef.current.contains(e.target as Node) &&
      branchDropdownRef.current &&
      !branchDropdownRef.current.contains(e.target as Node) &&
      courseDropdownRef.current &&
      !courseDropdownRef.current.contains(e.target as Node) &&
      userLevelDropdownRef.current &&
      !userLevelDropdownRef.current.contains(e.target as Node)
    ) {
      setIsPositionDropdownOpen(false)
      setIsExPositionDropdownOpen(false)
      setIsPrefixDropdownOpen(false)
      setIsBranchDropdownOpen(false)
      setIsCourseDropdownOpen(false)
      setIsUserLevelDropdownOpen(false)
    }
  }

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handleSelectPrefix = (value: string) => {
    setSelectedPrefix(value)
    setIsPrefixDropdownOpen(false)
  }
  const handleSelectPosition = (value: string) => {
    setSelectedPosition(value)
    setIsPositionDropdownOpen(false)
  }

  const handleSelectExPosition = (value: string) => {
    setSelectedExPosition(value)
    setIsExPositionDropdownOpen(false)
  }

  const handleSelectBranch = (value: string) => {
    setSelectedBranch(value)
    setIsBranchDropdownOpen(false)
  }

  const handleSelectCourse = (value: string) => {
    setSelectedCourse(value)
    setIsCourseDropdownOpen(false)
  }

  const handleSelectUserLevel = (value: string) => {
    setSelectedUserLevel(value)
    setIsUserLevelDropdownOpen(false)
  }

  return (
    <div className="drawer-side z-50">
      <label
        htmlFor="my-drawer-4"
        aria-label="close sidebar"
        className="drawer-overlay !cursor-default"
      ></label>
      <div className="menu h-full w-full bg-white p-0 text-base-content dark:bg-zinc-800 md:m-4 md:h-auto md:w-[500px] md:rounded-md">
        <div className="flex items-center justify-between border-b-2 border-gray-300 p-4 dark:border-zinc-600">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl text-gray-600 dark:text-gray-400">
              เพิ่มบุคลากร
            </h1>
          </div>
          <label
            htmlFor="my-drawer-4"
            aria-label="close modal"
            className="cursor-pointer text-gray-600 hover:text-gray-200 focus:outline-none dark:text-white"
          >
            <IoClose className="h-6 w-6 text-gray-600 dark:text-gray-400" />
          </label>
        </div>
        <div className="menu-content no-scrollbar max-h-[85vh] overflow-y-auto px-8 py-4">
          <form className="space-y-2">
            <div className="flex flex-row gap-4">
              <div className="flex-1">
                <label className="font-regular mb-2 block text-sm text-gray-600 dark:text-gray-400">
                  คำนำหน้า
                </label>
                <div className="relative flex-1" ref={prefixDropdownRef}>
                  <button
                    type="button"
                    onClick={() =>
                      setIsPrefixDropdownOpen(!isPrefixDropdownOpen)
                    }
                    className="flex w-40 items-center justify-between rounded-lg border-2 border-gray-300 bg-white px-4 py-2 font-light text-gray-600 transition-colors focus:border-blue-500 focus:outline-none dark:border-zinc-600 dark:bg-zinc-800 dark:text-gray-400"
                  >
                    {prefixes
                      ? prefixes.find((p) => p.value === selectedPrefix)?.label
                      : 'คำนำหน้า'}
                    <ChevronDown
                      className={`h-4 w-4 text-gray-600 transition-transform duration-200 dark:text-zinc-600 ${isPrefixDropdownOpen ? 'rotate-180' : ''}`}
                    />
                  </button>
                  {isPrefixDropdownOpen && (
                    <div className="absolute z-10 mt-2 w-40 rounded-md border-2 border-gray-300 bg-white shadow-lg dark:border-zinc-600 dark:bg-zinc-900">
                      {prefixes.map((preifx) => (
                        <div
                          key={preifx.value}
                          className="cursor-pointer px-4 py-2 text-sm font-light text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-zinc-800"
                          onClick={() => handleSelectPrefix(preifx.value)}
                        >
                          {preifx.label}
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
                  className="w-full rounded-lg border-2 border-gray-300 px-4 py-2 font-light text-gray-600 transition-colors focus:border-blue-500 focus:outline-none dark:border-zinc-600 dark:bg-zinc-800 dark:text-gray-400"
                  placeholder="กรอกชื่อ"
                />
              </div>
              <div className="flex-1">
                <label className="font-regular mb-2 block text-sm text-gray-600 dark:text-gray-400">
                  นามสกุล
                </label>
                <input
                  type="text"
                  className="w-full rounded-lg border-2 border-gray-300 px-4 py-2 font-light text-gray-600 transition-colors focus:border-blue-500 focus:outline-none dark:border-zinc-600 dark:bg-zinc-800 dark:text-gray-400"
                  placeholder="กรอกนามสกุล"
                />
              </div>
            </div>

            <div className="flex flex-row gap-4">
              {/* อายุ */}
              <div className="flex-1">
                <label className="font-regular mb-2 block text-sm text-gray-600 dark:text-gray-400">
                  อายุ
                </label>
                <input
                  type="text"
                  className="w-full rounded-lg border-2 border-gray-300 px-4 py-2 font-light text-gray-600 transition-colors focus:border-blue-500 focus:outline-none dark:border-zinc-600 dark:bg-zinc-800 dark:text-gray-400"
                  placeholder="กรอกอายุ"
                />
              </div>
              {/* เงินเดือน */}
              <div className="flex-1">
                <label className="font-regular mb-2 block text-sm text-gray-600 dark:text-gray-400">
                  เงินเดือน
                </label>
                <input
                  type="text"
                  className="w-full rounded-lg border-2 border-gray-300 px-4 py-2 font-light text-gray-600 transition-colors focus:border-blue-500 focus:outline-none dark:border-zinc-600 dark:bg-zinc-800 dark:text-gray-400"
                  placeholder="กรอกเงินเดือน"
                />
              </div>
              {/* วันรับราชการ */}
              <div className="flex-1">
                <label className="font-regular mb-2 block text-sm text-gray-600 dark:text-gray-400">
                  วันรับราชการ
                </label>
                <input
                  type="date"
                  className="w-full rounded-lg border-2 border-gray-300 px-4 py-[7px] font-light text-gray-600 transition-colors focus:border-blue-500 focus:outline-none dark:border-zinc-600 dark:bg-zinc-800 dark:text-gray-400"
                  placeholder="กรอกนามสกุล"
                />
              </div>
            </div>

            <div className="flex flex-row gap-4">
              {/* สาขา */}
              <div className="flex-1">
                <label className="font-regular mb-2 block text-sm text-gray-600 dark:text-gray-400">
                  สาขา
                </label>
                <div className="relative flex-1" ref={branchDropdownRef}>
                  <button
                    type="button"
                    onClick={() =>
                      setIsBranchDropdownOpen(!isBranchDropdownOpen)
                    }
                    className="flex w-full items-center justify-between rounded-lg border-2 border-gray-300 bg-white px-4 py-2 font-light text-gray-600 transition-colors focus:border-blue-500 focus:outline-none dark:border-zinc-600 dark:bg-zinc-800 dark:text-gray-400"
                  >
                    {branchs
                      ? branchs.find((p) => p.value === selectedBanch)?.label
                      : 'เลือกสาขา'}
                    <ChevronDown
                      className={`h-4 w-4 text-gray-600 transition-transform duration-200 dark:text-zinc-600 ${isBranchDropdownOpen ? 'rotate-180' : ''}`}
                    />
                  </button>
                  {isBranchDropdownOpen && (
                    <div className="absolute z-10 mt-2 w-full rounded-md border-2 border-gray-300 bg-white shadow-lg dark:border-zinc-600 dark:bg-zinc-900">
                      {branchs.map((branch) => (
                        <div
                          key={branch.value}
                          className="cursor-pointer px-4 py-2 text-sm font-light text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-zinc-800"
                          onClick={() => handleSelectBranch(branch.value)}
                        >
                          {branch.label}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              {/* หลักสูตร */}
              <div className="flex-1">
                <label className="font-regular mb-2 block text-sm text-gray-600 dark:text-gray-400">
                  หลักสูตร
                </label>
                <div className="relative" ref={courseDropdownRef}>
                  <button
                    type="button"
                    onClick={() =>
                      setIsCourseDropdownOpen(!isCourseDropdownOpen)
                    }
                    className="flex w-full items-center justify-between rounded-lg border-2 border-gray-300 bg-white px-4 py-2 font-light text-gray-600 transition-colors focus:border-blue-500 focus:outline-none dark:border-zinc-600 dark:bg-zinc-800 dark:text-gray-400"
                  >
                    {courses
                      ? courses.find((p) => p.value === selectCorse)?.label
                      : 'เลือกหลักสูตร'}
                    <ChevronDown
                      className={`h-4 w-4 text-gray-600 transition-transform duration-200 dark:text-zinc-600 ${isCourseDropdownOpen ? 'rotate-180' : ''}`}
                    />
                  </button>
                  {isCourseDropdownOpen && (
                    <div className="absolute z-10 mt-2 w-full rounded-md border-2 border-gray-300 bg-white shadow-lg dark:border-zinc-600 dark:bg-zinc-900">
                      {courses.map((course) => (
                        <div
                          key={course.value}
                          className="cursor-pointer px-4 py-2 text-sm font-light text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-zinc-800"
                          onClick={() => handleSelectCourse(course.value)}
                        >
                          {course.label}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-4 md:flex-row">
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
                    className="flex w-full items-center justify-between rounded-lg border-2 border-gray-300 bg-white px-4 py-2 font-light text-gray-600 transition-colors focus:border-blue-500 focus:outline-none dark:border-zinc-600 dark:bg-zinc-800 dark:text-gray-400"
                  >
                    {positions
                      ? positions.find((p) => p.value === selectedPosition)
                          ?.label
                      : 'ตำแหน่งวิชาการ'}
                    <ChevronDown
                      className={`h-4 w-4 text-gray-600 transition-transform duration-200 dark:text-zinc-600 ${isPositionDropdownOpen ? 'rotate-180' : ''}`}
                    />
                  </button>
                  {isPositionDropdownOpen && (
                    <div className="absolute z-10 mt-2 w-full rounded-md border-2 border-gray-300 bg-white shadow-lg dark:border-zinc-600 dark:bg-zinc-900">
                      {positions.map((position) => (
                        <div
                          key={position.value}
                          className="cursor-pointer px-4 py-2 text-sm font-light text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-zinc-800"
                          onClick={() => handleSelectPosition(position.value)}
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
                    className="flex w-full items-center justify-between rounded-lg border-2 border-gray-300 bg-white px-4 py-2 font-light text-gray-600 transition-colors focus:border-blue-500 focus:outline-none dark:border-zinc-600 dark:bg-zinc-800 dark:text-gray-400"
                  >
                    {ex_positions
                      ? ex_positions.find((p) => p.value === selectedExPosition)
                          ?.label
                      : 'ตำแหน่งบริหาร'}
                    <ChevronDown
                      className={`h-4 w-4 text-gray-600 transition-transform duration-200 dark:text-zinc-600 ${isExPositionDropdownOpen ? 'rotate-180' : ''}`}
                    />
                  </button>
                  {isExPositionDropdownOpen && (
                    <div className="absolute z-10 mt-2 w-full rounded-md border-2 border-gray-300 bg-white shadow-lg dark:border-zinc-600 dark:bg-zinc-900">
                      {ex_positions.map((ex_position) => (
                        <div
                          key={ex_position.value}
                          className="cursor-pointer px-4 py-2 text-sm font-light text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-zinc-800"
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

            <div className="flex-1">
              <label className="font-regular mb-2 block text-sm text-gray-600 dark:text-gray-400">
                เลขประจำตำแหน่ง
              </label>
              <input
                type="text"
                className="w-full rounded-lg border-2 border-gray-300 px-4 py-2 font-light text-gray-600 transition-colors focus:border-blue-500 focus:outline-none dark:border-zinc-600 dark:bg-zinc-800 dark:text-gray-400"
                placeholder="6564XXXXXXX-X"
              />
            </div>

            <div className="flex flex-col gap-4 md:flex-row">
              <div className="flex-1">
                <label className="font-regular mb-2 block text-sm text-gray-600 dark:text-gray-400">
                  รูปโปรไฟล์
                </label>
                <input
                  type="file"
                  className="file-input file-input-bordered file-input-md w-full max-w-xs"
                />
              </div>
              {/* ระดับผู้ใช้งาน */}
              <div className="flex-1">
                <label className="font-regular mb-2 block text-sm text-gray-600 dark:text-gray-400">
                  ระดับผู้ใช้งาน
                </label>
                <div className="relative" ref={userLevelDropdownRef}>
                  <button
                    type="button"
                    onClick={() =>
                      setIsUserLevelDropdownOpen(!isUserLevelDropdownOpen)
                    }
                    className="flex w-full items-center justify-between rounded-lg border-2 border-gray-300 bg-white px-4 py-2 font-light text-gray-600 transition-colors focus:border-blue-500 focus:outline-none dark:border-zinc-600 dark:bg-zinc-800 dark:text-gray-400"
                  >
                    {user_levels
                      ? user_levels.find((p) => p.value === selectUserLevel)
                          ?.label
                      : 'ระดับผู้ใช้งาน'}
                    <ChevronDown
                      className={`h-4 w-4 text-gray-600 transition-transform duration-200 dark:text-zinc-600 ${isUserLevelDropdownOpen ? 'rotate-180' : ''}`}
                    />
                  </button>
                  {isUserLevelDropdownOpen && (
                    <div className="absolute z-10 mt-2 w-full rounded-md border-2 border-gray-300 bg-white shadow-lg dark:border-zinc-600 dark:bg-zinc-900">
                      {user_levels.map((level) => (
                        <div
                          key={level.value}
                          className="cursor-pointer px-4 py-2 text-sm font-light text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-zinc-800"
                          onClick={() => handleSelectUserLevel(level.value)}
                        >
                          {level.label}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex-1">
              <label className="font-regular mb-2 block text-sm text-gray-600 dark:text-gray-400">
                อีเมล
              </label>
              <input
                type="text"
                className="w-full rounded-lg border-2 border-gray-300 px-4 py-2 font-light text-gray-600 transition-colors focus:border-blue-500 focus:outline-none dark:border-zinc-600 dark:bg-zinc-800 dark:text-gray-400"
                placeholder="example.live.rmutl.ac.th"
              />
            </div>

            <div className="flex-1">
              <label className="font-regular mb-2 block text-sm text-gray-600 dark:text-gray-400">
                รหัสผ่าน
              </label>
              <input
                type="password"
                className="w-full rounded-lg border-2 border-gray-300 px-4 py-2 font-light text-gray-600 transition-colors focus:border-blue-500 focus:outline-none dark:border-zinc-600 dark:bg-zinc-800 dark:text-gray-400"
                placeholder="กรอกรหัสผ่าน"
              />
            </div>

            <div className="flex gap-4 pt-4">
              <div className="flex-1"></div>
              <div className="flex-1">
                <button
                  type="button"
                  className="w-full rounded-lg bg-success px-4 py-2 text-white transition-colors duration-200 hover:bg-success/80 focus:outline-none focus:ring-2 focus:ring-success focus:ring-offset-2"
                >
                  บันทึกข้อมูล
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
