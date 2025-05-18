import React, { useState, useRef, useEffect } from 'react';
import { MdOutlinePersonAddAlt } from "react-icons/md";
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

export default function CreatePersonalModal() {
const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isPositionDropdownOpen, setIsPositionDropdownOpen] = useState(false);
  const [isExPositionDropdownOpen, setIsExPositionDropdownOpen] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState("");
  const [selectedExPosition, setSelectedExPosition] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const positionDropdownRef = useRef<HTMLDivElement>(null);
  const exPositionDropdownRef = useRef<HTMLDivElement>(null);

  const [gender, setGender] = useState('');
  const [prefix, setPrefix] = useState('');
  const handleClickOutside = (e: MouseEvent) => {
    if (
      (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) &&
      (positionDropdownRef.current && !positionDropdownRef.current.contains(e.target as Node)) &&
      (exPositionDropdownRef.current && !exPositionDropdownRef.current.contains(e.target as Node))
    ) {
      setIsDropdownOpen(false);
      setIsPositionDropdownOpen(false);
      setIsExPositionDropdownOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handlePrefixSelect = (value: string) => {
    setPrefix(value);
    setIsDropdownOpen(false);

    if (value === 'นาย') {
      setGender('ชาย');
    } else if (value === 'นาง' || value === 'นางสาว') {
      setGender('หญิง');
    } else {
      setGender('');
    }
  };

  const handleSelectPosition = (value: string) => {
    setSelectedPosition(value);
    setIsPositionDropdownOpen(false);
  };

  const handleSelectExPosition = (value: string) => {
    setSelectedExPosition(value);
    setIsExPositionDropdownOpen(false);
  };

    return (
        <div className="drawer-side z-50">
            <label htmlFor="my-drawer-4" className="drawer-overlay !cursor-default"></label>
            <div className="menu md:rounded-md bg-white dark:bg-zinc-800 text-base-content h-full md:h-auto w-full md:w-[500px] md:m-4">
                <div className="flex items-center justify-between py-4 mx-6 border-b-2 border-gray-300 dark:border-zinc-600">
                    <div className="flex items-center gap-2">
                        <h1 className="text-2xl text-gray-600 dark:text-gray-400">เพิ่มบุคลากร</h1>
                        <MdOutlinePersonAddAlt className="w-7 h-7 text-gray-600 dark:text-gray-400" />
                    </div>
                    <button className="text-gray-600 dark:text-gray-400 hover:text-gray-800">
                        <IoClose className="w-6 h-6" />
                    </button>
                </div>

                <div className="menu-content px-6 py-4">
                    <form className="space-y-6">
                        {/* Personal Information Section */}
                        <div className="rounded-lg border-2 border-gray-200 dark:border-zinc-700 p-4">
                            <h2 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-4">ข้อมูลส่วนตัว</h2>
                            <div className="space-y-4">
                                <div className="flex flex-row gap-4">
                                    <div>
                                        <label className="block text-sm font-regular text-gray-600 dark:text-gray-400 mb-2">
                                            คำนำหน้า
                                        </label>
                                        <div className="relative" ref={dropdownRef}>
                                            <button
                                                type="button"
                                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                                className="w-32 px-4 py-2 font-light rounded-lg border-2 border-gray-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-gray-400 dark:text-gray-400 focus:outline-none focus:border-blue-500 transition-colors flex items-center justify-between"
                                            >
                                                {prefix ? prefixes.find(p => p.value === prefix)?.label : "คำนำหน้า"}
                                                <ChevronDown
                                                    className={`w-4 h-4 text-gray-400 dark:text-zinc-600 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`}
                                                />
                                            </button>

                                            {isDropdownOpen && (
                                                <div className="absolute w-32 mt-2 bg-white dark:bg-zinc-900 border-2 border-gray-300 dark:border-zinc-600 rounded-md shadow-lg z-10">
                                                    {prefixes.map((prefixOption) => (
                                                        <div
                                                            key={prefixOption.value}
                                                            className="px-4 py-2 text-sm font-light text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-800 cursor-pointer dark:text-gray-400"
                                                            onClick={() => handlePrefixSelect(prefixOption.value)}
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
                                            <label className="block text-sm font-regular text-gray-600 dark:text-gray-400 mb-2">
                                                เพศ
                                            </label>
                                            <div className="flex items-center h-full gap-6">
                                                <label className="flex items-center space-x-2 cursor-pointer">
                                                    <input
                                                        type="radio"
                                                        name="gender"
                                                        value="ชาย"
                                                        disabled
                                                        checked={gender === 'ชาย'}
                                                        onChange={() => setGender('ชาย')}

                                                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 cursor-pointer"
                                                    />
                                                    <span className="text-gray-600 font-light dark:text-gray-400">ชาย</span>
                                                </label>
                                                <label className="flex items-center space-x-2 cursor-pointer">
                                                    <input
                                                        type="radio"
                                                        name="gender"
                                                        value="หญิง"
                                                        disabled
                                                        checked={gender === 'หญิง'}
                                                        onChange={() => setGender('หญิง')}

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
                                            className="w-full px-4 py-2 font-light rounded-lg border-2 border-gray-300 dark:border-zinc-600 text-gray-600 dark:text-gray-400 focus:outline-none focus:border-blue-500 transition-colors"
                                            placeholder="กรอกชื่อ"
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <label className="block text-sm font-regular text-gray-600 dark:text-gray-400 mb-2">
                                            นามสกุล
                                        </label>
                                        <input
                                            type="text"
                                            className="w-full px-4 py-2 font-light rounded-lg border-2 border-gray-300 dark:border-zinc-600 text-gray-600 dark:text-gray-400 focus:outline-none focus:border-blue-500 transition-colors"
                                            placeholder="กรอกนามสกุล"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Contact Information Section */}
                        <div className="rounded-lg border-2 border-gray-200 dark:border-zinc-700 p-4">
                            <h2 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-4">ข้อมูลการติดต่อ</h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-regular text-gray-600 dark:text-gray-400 mb-2">
                                        อีเมล
                                    </label>
                                    <input
                                        type="email"
                                        className="w-full px-4 py-2 font-light rounded-lg border-2 border-gray-300 dark:border-zinc-600 text-gray-600 dark:text-gray-400 focus:outline-none focus:border-blue-500 transition-colors"
                                        placeholder="example.live.rmutl.ac.th"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Position Information Section */}
                        <div className="rounded-lg border-2 border-gray-200 dark:border-zinc-700 p-4">
                            <h2 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-4">ข้อมูลตำแหน่ง</h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-regular text-gray-600 dark:text-gray-400 mb-2">
                                        เลขประจำตำแหน่ง
                                    </label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-2 font-light rounded-lg border-2 border-gray-300 dark:border-zinc-600 text-gray-600 dark:text-gray-400 focus:outline-none focus:border-blue-500 transition-colors"
                                        placeholder="6564XXXXXXX-X"
                                    />
                                </div>

                                <div className="flex flex-row gap-4">
                                    <div className='flex-1'>
                                        <label className="block text-sm font-regular text-gray-600 dark:text-gray-400 mb-2">
                                            ตำแหน่งวิชาการ
                                        </label>
                                        <div className="flex-1 relative" ref={positionDropdownRef}>
                                            <button
                                                type="button"
                                                onClick={() => setIsPositionDropdownOpen(!isPositionDropdownOpen)}
                                                className="w-full px-4 py-2 font-light rounded-lg border-2 border-gray-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-gray-400 dark:text-gray-400 focus:outline-none focus:border-blue-500 transition-colors flex items-center justify-between"
                                            >
                                                {positions ? positions.find(p => p.value === selectedPosition)?.label : "ตำแหน่งวิชาการ"}
                                                <ChevronDown
                                                    className={`w-4 h-4 text-gray-400 dark:text-zinc-600 transition-transform duration-200 ${isPositionDropdownOpen ? 'rotate-180' : ''}`}
                                                />
                                            </button>
                                            {isPositionDropdownOpen && (
                                                <div className="absolute w-full mt-2 bg-white dark:bg-zinc-900 border-2 border-gray-300 dark:border-zinc-600 rounded-md shadow-lg z-10">
                                                    {positions.map((position) => (
                                                        <div
                                                            key={position.value}
                                                            className="px-4 py-2 text-sm font-light text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-800 cursor-pointer dark:text-gray-400"
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
                                                className="w-full px-4 py-2 font-light rounded-lg border-2 border-gray-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-gray-400 dark:text-gray-400 focus:outline-none focus:border-blue-500 transition-colors flex items-center justify-between"
                                            >
                                                {ex_positions ? ex_positions.find(p => p.value === selectedExPosition)?.label : "ตำแหน่งบริหาร"}
                                                <ChevronDown
                                                    className={`w-4 h-4 text-gray-400 dark:text-zinc-600 transition-transform duration-200 ${isExPositionDropdownOpen ? 'rotate-180' : ''}`}
                                                />
                                            </button>
                                            {isExPositionDropdownOpen && (
                                                <div className="absolute w-full mt-2 bg-white dark:bg-zinc-900 border-2 border-gray-300 dark:border-zinc-600 rounded-md shadow-lg z-10">
                                                    {ex_positions.map((ex_position) => (
                                                        <div
                                                            key={ex_position.value}
                                                            className="px-4 py-2 text-sm font-light text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-800 cursor-pointer dark:text-gray-400"
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
                            </div>
                        </div>

                        <div className="flex justify-end pt-4">
                            <button className="px-6 py-2 bg-success hover:bg-success/80 text-white rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-success focus:ring-offset-2">
                                บันทึกข้อมูล
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}