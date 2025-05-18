import type React from 'react';
import { ChevronDown } from 'lucide-react';
import useFetchData from "@/hooks/FetchAPI"
import { Prefix } from "@/Types"
interface SelectPreifx {
    prefix_id: number
    prefix_name: string
    openDropdown: string | null;
    setOpenDropdown: React.Dispatch<React.SetStateAction<string | null>>;
    prefixDropdownRef: React.RefObject<HTMLDivElement>;
    setSelectPrefix: React.Dispatch<React.SetStateAction<string | null>>
    selectPrefix: string | null
    handleOnChangePrefix: (prefix_id: number, prefix_name: string) => void
}

function SelectCoruse({
    openDropdown,
    setOpenDropdown,
    prefixDropdownRef,
    handleOnChangePrefix,
    selectPrefix,
    setSelectPrefix
}: SelectPreifx) {
    const { data: prefixs, error } = useFetchData<Prefix[]>("/prefix?");

    const handleSelectPrefix = (prefix_id: number, prefix_name: string) => {
        // ส่งค่า id และชื่อไปยัง handleOnChangePrefix
        handleOnChangePrefix(prefix_id, prefix_name);

        // อัพเดท selectPrefix เพื่อแสดงชื่อในปุ่ม
        setSelectPrefix(prefix_name);

        // ปิด dropdown
        setOpenDropdown(null);
    };

    return (
        <div>
            <label className="block text-sm font-regular text-gray-600 dark:text-gray-400 mb-2">
                เลือกคำนำหน้า
            </label>
            <div className="relative z-5" ref={prefixDropdownRef}>
                <button
                    type="button"
                    onClick={() => setOpenDropdown(openDropdown === 'prefix' ? null : 'prefix')}
                    className="w-full px-4 py-2 font-light rounded-md text-sm border-2 border-gray-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-gray-600 dark:text-gray-400 focus:outline-none focus:border-blue-500 transition-colors flex items-center justify-between transition-all duration-300 ease-in-out"
                >
                    {selectPrefix === null
                        ? "เลือกคำนำหน้า"
                        : selectPrefix 
                    }
                    <ChevronDown
                        className={`w-4 h-4 text-gray-600 dark:text-zinc-600 transition-transform duration-200 ${openDropdown === 'prefix' ? 'rotate-180' : ''}`}
                    />
                </button>
                {openDropdown === 'prefix' && (
                    <div className="absolute z-10 overflow-y-auto max-h-36 w-full mt-2 bg-white dark:bg-zinc-900 border-2 border-gray-300 dark:border-zinc-600 rounded-md shadow-lg">
                        {prefixs?.map((prefix) => (
                            <div
                                key={prefix.prefix_id} // ใช้ prefix_id เป็น key
                                className="px-4 py-2 text-sm font-light text-gray-600 hover:bg-gray-100 dark:hover:bg-zinc-800 cursor-pointer dark:text-gray-400"
                                onClick={() => handleSelectPrefix(prefix.prefix_id, prefix.prefix_name)}
                            >
                                {prefix.prefix_name}
                            </div>
                        ))}
                    </div>
                )}
            </div>
            {error && <div className="text-red-500 mt-2">เกิดข้อผิดพลาดในการเชื่อมต่อข้อมูล</div>}
        </div>
    );
}

export default SelectCoruse;


