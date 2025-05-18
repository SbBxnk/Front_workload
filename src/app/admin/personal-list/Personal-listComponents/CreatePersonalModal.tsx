import React, { useState, useRef, useEffect } from 'react';
import { IoClose } from "react-icons/io5";
import { ChevronDown } from 'lucide-react';

const prefixes = [
  { value: "", label: "เลือกคำนำหน้า" },
  { value: "นาย", label: "นาย" },
  { value: "นาง", label: "นาง" },
  { value: "นางสาว", label: "นางสาว" },
];

const positions = [
  { value: "", label: "เลือกตำแหน่งวิชาการ" },
  { value: "อาจารย์", label: "อาจารย์" },
  { value: "รองศาสตราจารย์", label: "รองศาสตราจารย์" },
  { value: "ศาสตราจารย์", label: "ศาสตราจารย์" },
];

const ex_positions = [
  { value: "", label: "เลือกตำแหน่งบริหาร" },
  { value: "หัวหน้าสาขา", label: "หัวหน้าสาขา" }
];

const branchs = [
  { value: "", label: "เลือกสาขา" },
  { value: "สาขาบริหารธุรกิจ", label: "สาขาบริหารธุรกิจ" },
  { value: "สาขาการบัญชี", label: "สาขาการบัญชี" },
  { value: "สาขาศิลปศาสตร์", label: "สาขาศิลปศาสตร์" },
];

const courses = [
  { value: "", label: "เลือกหลักสูตร" },
  { value: "เทคโนโลยีสารสนเทศ", label: "เทคโนโลยีสารสนเทศ" },
  { value: "การจัดการ", label: "การจัดการ" },
  { value: "การบัญชี", label: "การบัญชี" },
  { value: "การตลาด", label: "การตลาด" },
]

const user_levels =[
  { value: "", label: "เลือกระดับผู้ใช้งาน" },
  { value: "ผู้ใช้งานทั่วไป", label: "ผู้ใช้งานทั่วไป" },
  { value: "ผู้ประเมิน", label: "ผู้ประเมิน" },
  { value: "เลขาณุการ", label: "เลขาณุการ" },
  { value: "ผู้ดูแลระบบ", label: "ผู้ดูแลระบบ" },
]
export default function CreatePersonalModal() {
  const [isPrefixDropdownOpen, setIsPrefixDropdownOpen] = useState(false);
  const [isPositionDropdownOpen, setIsPositionDropdownOpen] = useState(false);
  const [isExPositionDropdownOpen, setIsExPositionDropdownOpen] = useState(false);
  const [isBranchDropdownOpen, setIsBranchDropdownOpen] = useState(false);
  const [isCourseDropdownOpen, setIsCourseDropdownOpen] = useState(false);
  const [isUserLevelDropdownOpen, setIsUserLevelDropdownOpen] = useState(false);
  const [selectedPrefix, setSelectedPrefix] = useState("");
  const [selectedPosition, setSelectedPosition] = useState("");
  const [selectedExPosition, setSelectedExPosition] = useState("");
  const [selectedBanch, setSelectedBranch] = useState("");
  const [selectCorse, setSelectedCourse] = useState("");
  const [selectUserLevel, setSelectedUserLevel] = useState("");
  const prefixDropdownRef = useRef<HTMLDivElement>(null);
  const positionDropdownRef = useRef<HTMLDivElement>(null);
  const exPositionDropdownRef = useRef<HTMLDivElement>(null);
  const branchDropdownRef = useRef<HTMLDivElement>(null);
  const courseDropdownRef = useRef<HTMLDivElement>(null);
  const userLevelDropdownRef = useRef<HTMLDivElement>(null);




  const handleClickOutside = (e: MouseEvent) => {
    if (
      (prefixDropdownRef.current && !prefixDropdownRef.current.contains(e.target as Node)) &&
      (positionDropdownRef.current && !positionDropdownRef.current.contains(e.target as Node)) &&
      (exPositionDropdownRef.current && !exPositionDropdownRef.current.contains(e.target as Node)) &&
      (branchDropdownRef.current && !branchDropdownRef.current.contains(e.target as Node)) &&
      (courseDropdownRef.current && !courseDropdownRef.current.contains(e.target as Node)) &&
      (userLevelDropdownRef.current && !userLevelDropdownRef.current.contains(e.target as Node))
    ) {
      setIsPositionDropdownOpen(false);
      setIsExPositionDropdownOpen(false);
      setIsPrefixDropdownOpen(false);
      setIsBranchDropdownOpen(false);
      setIsCourseDropdownOpen(false);
      setIsUserLevelDropdownOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSelectPrefix = (value: string) => {
    setSelectedPrefix(value);
    setIsPrefixDropdownOpen(false);
  };
  const handleSelectPosition = (value: string) => {
    setSelectedPosition(value);
    setIsPositionDropdownOpen(false);
  };

  const handleSelectExPosition = (value: string) => {
    setSelectedExPosition(value);
    setIsExPositionDropdownOpen(false);
  };

  const handleSelectBranch = (value: string) => {
    setSelectedBranch(value);
    setIsBranchDropdownOpen(false);
  };

  const handleSelectCourse = (value: string) => {
    setSelectedCourse(value);
    setIsCourseDropdownOpen(false);
  };

const handleSelectUserLevel = (value: string) => {
  setSelectedUserLevel(value);
  setIsUserLevelDropdownOpen(false);
};

  return (

    <div className="drawer-side z-50">
      <label htmlFor="my-drawer-4" aria-label="close sidebar" className="drawer-overlay !cursor-default"></label>
      <div className="menu bg-white dark:bg-zinc-800 text-base-content h-full w-full md:w-[500px] p-0 md:h-auto md:m-4 md:rounded-md">
        <div className="flex items-center justify-between p-4 border-b-2 border-gray-300 dark:border-zinc-600">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl text-gray-600 dark:text-gray-400">เพิ่มบุคลากร</h1>
          </div>
          <label htmlFor="my-drawer-4" aria-label="close modal" className=" text-gray-600 dark:text-white hover:text-gray-200 focus:outline-none cursor-pointer">
            <IoClose className="w-6 h-6 text-gray-600 dark:text-gray-400" />
          </label>
        </div>
        <div className="menu-content px-8 py-4 max-h-[85vh] overflow-y-auto no-scrollbar">
          <form className="space-y-2">
            <div className="flex flex-row gap-4">
              <div className='flex-1'>
                <label className="block text-sm font-regular text-gray-600 dark:text-gray-400 mb-2">
                  คำนำหน้า
                </label>
                <div className="flex-1 relative" ref={prefixDropdownRef}>
                  <button
                    type="button"
                    onClick={() => setIsPrefixDropdownOpen(!isPrefixDropdownOpen)}
                    className="w-40 px-4 py-2 font-light rounded-lg border-2 border-gray-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-gray-600 dark:text-gray-400 focus:outline-none focus:border-blue-500 transition-colors flex items-center justify-between">
                    {prefixes ? prefixes.find(p => p.value === selectedPrefix)?.label : "คำนำหน้า"}
                    <ChevronDown
                      className={`w-4 h-4 text-gray-600 dark:text-zinc-600 transition-transform duration-200 ${isPrefixDropdownOpen ? 'rotate-180' : ''}`}
                    />
                  </button>
                  {isPrefixDropdownOpen && (
                    <div className="absolute w-40 mt-2 bg-white dark:bg-zinc-900 border-2 border-gray-300 dark:border-zinc-600 rounded-md shadow-lg z-10">
                      {prefixes.map((preifx) => (
                        <div
                          key={preifx.value}
                          className="px-4 py-2 text-sm font-light text-gray-600 hover:bg-gray-100 dark:hover:bg-zinc-800 cursor-pointer dark:text-gray-400"
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
                  <label className="block text-sm font-regular text-gray-600 dark:text-gray-400 mb-2">
                    เพศ
                  </label>
                  <div className="flex items-center h-full gap-6">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        name="gender"
                        value="ชาย"
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 cursor-pointer"
                      />
                      <span className="text-gray-600 font-light dark:text-gray-400">ชาย</span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        name="gender"
                        value="หญิง"
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 cursor-pointer"
                      />
                      <span className="text-gray-600 font-light dark:text-gray-400">หญิง</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-row gap-4">
              <div className="flex-1">
                <label className="block text-sm font-regular text-gray-600 dark:text-gray-400 mb-2">
                  ชื่อ
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-2 font-light rounded-lg border-2 border-gray-300 dark:border-zinc-600 text-gray-600 dark:bg-zinc-800 dark:text-gray-400 focus:outline-none focus:border-blue-500 transition-colors"
                  placeholder="กรอกชื่อ"
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-regular text-gray-600 dark:text-gray-400 mb-2">
                  นามสกุล
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-2 font-light rounded-lg border-2 border-gray-300 dark:border-zinc-600 text-gray-600 dark:bg-zinc-800 dark:text-gray-400 focus:outline-none focus:border-blue-500 transition-colors"
                  placeholder="กรอกนามสกุล"
                />
              </div>
            </div>

            <div className="flex flex-row gap-4">
              {/* อายุ */}
              <div className="flex-1">
                <label className="block text-sm font-regular text-gray-600 dark:text-gray-400 mb-2">
                  อายุ
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-2 font-light rounded-lg border-2 border-gray-300 dark:border-zinc-600 text-gray-600 dark:bg-zinc-800 dark:text-gray-400 focus:outline-none focus:border-blue-500 transition-colors"
                  placeholder="กรอกอายุ"
                />
              </div>
              {/* เงินเดือน */}
              <div className="flex-1">
                <label className="block text-sm font-regular text-gray-600 dark:text-gray-400 mb-2">
                  เงินเดือน
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-2 font-light rounded-lg border-2 border-gray-300 dark:border-zinc-600 text-gray-600 dark:bg-zinc-800 dark:text-gray-400 focus:outline-none focus:border-blue-500 transition-colors"
                  placeholder="กรอกเงินเดือน"
                />
              </div>
              {/* วันรับราขการ */}
              <div className="flex-1">
                <label className="block text-sm font-regular text-gray-600 dark:text-gray-400 mb-2">
                  วันรับราขการ
                </label>
                <input
                  type="date"
                  className="w-full px-4 py-[7px] font-light rounded-lg border-2 border-gray-300 dark:border-zinc-600 text-gray-600 dark:bg-zinc-800 dark:text-gray-400 focus:outline-none focus:border-blue-500 transition-colors"
                  placeholder="กรอกนามสกุล"
                />
              </div>
            </div>

            <div className="flex flex-row gap-4">
              {/* สาขา */}
              <div className='flex-1'>
                <label className="block text-sm font-regular text-gray-600 dark:text-gray-400 mb-2">
                  สาขา
                </label>
                <div className="flex-1 relative" ref={branchDropdownRef}>
                  <button
                    type="button"
                    onClick={() => setIsBranchDropdownOpen(!isBranchDropdownOpen)}
                    className="w-full px-4 py-2 font-light rounded-lg border-2 border-gray-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-gray-600 dark:text-gray-400 focus:outline-none focus:border-blue-500 transition-colors flex items-center justify-between"
                  >
                    {branchs ? branchs.find(p => p.value === selectedBanch)?.label : "เลือกสาขา"}
                    <ChevronDown
                      className={`w-4 h-4 text-gray-600 dark:text-zinc-600 transition-transform duration-200 ${isBranchDropdownOpen ? 'rotate-180' : ''}`}
                    />
                  </button>
                  {isBranchDropdownOpen && (
                    <div className="absolute w-full mt-2 bg-white dark:bg-zinc-900 border-2 border-gray-300 dark:border-zinc-600 rounded-md shadow-lg z-10">
                      {branchs.map((branch) => (
                        <div
                          key={branch.value}
                          className="px-4 py-2 text-sm font-light text-gray-600 hover:bg-gray-100 dark:hover:bg-zinc-800 cursor-pointer dark:text-gray-400"
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
              <div className='flex-1'>
                <label className="block text-sm font-regular text-gray-600 dark:text-gray-400 mb-2">
                  หลักสูตร
                </label>
                <div className="relative " ref={courseDropdownRef}>
                  <button
                    type="button"
                    onClick={() => setIsCourseDropdownOpen(!isCourseDropdownOpen)}
                    className="w-full px-4 py-2 font-light rounded-lg border-2 border-gray-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-gray-600 dark:text-gray-400 focus:outline-none focus:border-blue-500 transition-colors flex items-center justify-between"
                  >
                    {courses ? courses.find(p => p.value === selectCorse)?.label : "เลือกหลักสูตร"}
                    <ChevronDown
                      className={`w-4 h-4 text-gray-600 dark:text-zinc-600 transition-transform duration-200 ${isCourseDropdownOpen ? 'rotate-180' : ''}`}
                    />
                  </button>
                  {isCourseDropdownOpen && (
                    <div className="absolute w-full mt-2 bg-white dark:bg-zinc-900 border-2 border-gray-300 dark:border-zinc-600 rounded-md shadow-lg z-10">
                      {courses.map((course) => (
                        <div
                          key={course.value}
                          className="px-4 py-2 text-sm font-light text-gray-600 hover:bg-gray-100 dark:hover:bg-zinc-800 cursor-pointer dark:text-gray-400"
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

            <div className="flex flex-col md:flex-row gap-4">
              <div className='flex-1'>
                <label className="block text-sm font-regular text-gray-600 dark:text-gray-400 mb-2">
                  ตำแหน่งวิชาการ
                </label>
                <div className="flex-1 relative" ref={positionDropdownRef}>
                  <button
                    type="button"
                    onClick={() => setIsPositionDropdownOpen(!isPositionDropdownOpen)}
                    className="w-full px-4 py-2 font-light rounded-lg border-2 border-gray-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-gray-600 dark:text-gray-400 focus:outline-none focus:border-blue-500 transition-colors flex items-center justify-between"
                  >
                    {positions ? positions.find(p => p.value === selectedPosition)?.label : "ตำแหน่งวิชาการ"}
                    <ChevronDown
                      className={`w-4 h-4 text-gray-600 dark:text-zinc-600 transition-transform duration-200 ${isPositionDropdownOpen ? 'rotate-180' : ''}`}
                    />
                  </button>
                  {isPositionDropdownOpen && (
                    <div className="absolute w-full mt-2 bg-white dark:bg-zinc-900 border-2 border-gray-300 dark:border-zinc-600 rounded-md shadow-lg z-10">
                      {positions.map((position) => (
                        <div
                          key={position.value}
                          className="px-4 py-2 text-sm font-light text-gray-600 hover:bg-gray-100 dark:hover:bg-zinc-800 cursor-pointer dark:text-gray-400"
                          onClick={() => handleSelectPosition(position.value)}
                        >
                          {position.label}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className='flex-1'>
                <label className="block text-sm font-regular text-gray-600 dark:text-gray-400 mb-2">
                  ตำแหน่งบริหาร
                </label>
                <div className="relative " ref={exPositionDropdownRef}>
                  <button
                    type="button"
                    onClick={() => setIsExPositionDropdownOpen(!isExPositionDropdownOpen)}
                    className="w-full px-4 py-2 font-light rounded-lg border-2 border-gray-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-gray-600 dark:text-gray-400 focus:outline-none focus:border-blue-500 transition-colors flex items-center justify-between"
                  >
                    {ex_positions ? ex_positions.find(p => p.value === selectedExPosition)?.label : "ตำแหน่งบริหาร"}
                    <ChevronDown
                      className={`w-4 h-4 text-gray-600 dark:text-zinc-600 transition-transform duration-200 ${isExPositionDropdownOpen ? 'rotate-180' : ''}`}
                    />
                  </button>
                  {isExPositionDropdownOpen && (
                    <div className="absolute w-full mt-2 bg-white dark:bg-zinc-900 border-2 border-gray-300 dark:border-zinc-600 rounded-md shadow-lg z-10">
                      {ex_positions.map((ex_position) => (
                        <div
                          key={ex_position.value}
                          className="px-4 py-2 text-sm font-light text-gray-600 hover:bg-gray-100 dark:hover:bg-zinc-800 cursor-pointer dark:text-gray-400"
                          onClick={() => handleSelectExPosition(ex_position.value)}
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
              <label className="block text-sm font-regular text-gray-600 dark:text-gray-400 mb-2">
                เลขประจำตำแหน่ง
              </label>
              <input
                type="text"
                className="w-full px-4 py-2 font-light rounded-lg border-2 border-gray-300 dark:border-zinc-600 text-gray-600 dark:bg-zinc-800 dark:text-gray-400 focus:outline-none focus:border-blue-500 transition-colors"
                placeholder="6564XXXXXXX-X"
              />
            </div>

            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <label className="block text-sm font-regular text-gray-600 dark:text-gray-400 mb-2">
                  รูปโปรไฟล์
                </label>
                <input type="file" className="file-input file-input-bordered file-input-md  w-full max-w-xs" />
              </div>
              {/* ระดับผู้ใช้งาน */}
              <div className='flex-1'>
                <label className="block text-sm font-regular text-gray-600 dark:text-gray-400 mb-2">
                  ระดับผู้ใช้งาน
                </label>
                <div className="relative " ref={userLevelDropdownRef}>
                  <button
                    type="button"
                    onClick={() => setIsUserLevelDropdownOpen(!isUserLevelDropdownOpen)}
                    className="w-full px-4 py-2 font-light rounded-lg border-2 border-gray-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-gray-600 dark:text-gray-400 focus:outline-none focus:border-blue-500 transition-colors flex items-center justify-between"
                  >
                    {user_levels ? user_levels.find(p => p.value === selectUserLevel)?.label : "ระดับผู้ใช้งาน"}
                    <ChevronDown
                      className={`w-4 h-4 text-gray-600 dark:text-zinc-600 transition-transform duration-200 ${isUserLevelDropdownOpen ? 'rotate-180' : ''}`}
                    />
                  </button>
                  {isUserLevelDropdownOpen && (
                    <div className="absolute w-full mt-2 bg-white dark:bg-zinc-900 border-2 border-gray-300 dark:border-zinc-600 rounded-md shadow-lg z-10">
                      {user_levels.map((level) => (
                        <div
                          key={level.value}
                          className="px-4 py-2 text-sm font-light text-gray-600 hover:bg-gray-100 dark:hover:bg-zinc-800 cursor-pointer dark:text-gray-400"
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
              <label className="block text-sm font-regular text-gray-600 dark:text-gray-400 mb-2">
                อีเมล
              </label>
              <input
                type="text"
                className="w-full px-4 py-2 font-light rounded-lg border-2 border-gray-300 dark:border-zinc-600 text-gray-600 dark:bg-zinc-800 dark:text-gray-400 focus:outline-none focus:border-blue-500 transition-colors"
                placeholder="example.live.rmutl.ac.th"
              />
            </div>

            <div className="flex-1">
              <label className="block text-sm font-regular text-gray-600 dark:text-gray-400 mb-2">
                รหัสผ่าน
              </label>
              <input
                type="password"
                className="w-full px-4 py-2 font-light rounded-lg border-2 border-gray-300 dark:border-zinc-600 text-gray-600 dark:bg-zinc-800 dark:text-gray-400 focus:outline-none focus:border-blue-500 transition-colors"
                placeholder="กรอกรหัสผ่าน"
              />
            </div>





            <div className="flex pt-4  gap-4">
              <div className="flex-1"></div>
              <div className="flex-1">
                <button
                  type="button"
                  className="w-full px-4 py-2 bg-success hover:bg-success/80 text-white rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-success focus:ring-offset-2">
                  บันทึกข้อมูล
                </button>
              </div>
            </div>

          </form>
        </div>
      </div>
    </div>


  );
}
