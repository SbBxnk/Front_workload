import type React from 'react';
import { ChevronDown } from 'lucide-react';
import useFetchData from "@/hooks/FetchAPI"
import { ExPosition } from "@/Types"


interface SelectExPositionProps {
    ex_position_id: number
    ex_position_name: string
    openDropdown: string | null;
    setOpenDropdown: React.Dispatch<React.SetStateAction<string | null>>;
    exPositionDropdownRef: React.RefObject<HTMLDivElement>;
    selectExPosition: string | null
    setSelectExPosition: React.Dispatch<React.SetStateAction<string | null>>
    handleOnChangeExPosition: (ex_position_id: number, ex_position_name: string) => void
}

function SelectExPosition({ openDropdown, setOpenDropdown, exPositionDropdownRef, selectExPosition, setSelectExPosition,handleOnChangeExPosition }: SelectExPositionProps) {
    const { data: expositions, error } = useFetchData<ExPosition[]>("/ex_position");

    const handleSelectExPosition = (ex_position_id: number, ex_position_name: string,) => {
        setSelectExPosition(ex_position_name);
        handleOnChangeExPosition(ex_position_id, ex_position_name);
        setOpenDropdown(null);
    };

    return (
        <div>
            <label className="block text-sm font-regular text-gray-600 dark:text-gray-400 mb-2">
                ตำแหน่งบริหาร
            </label>
            <div className="relative z-5" ref={exPositionDropdownRef}>
                <button
                    type="button"
                    onClick={() => setOpenDropdown(openDropdown === 'exposition' ? null : 'exposition')}
                    className="w-full px-4 py-2 font-light rounded-md text-sm border-2 border-gray-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-gray-600 dark:text-gray-400 focus:outline-none focus:border-blue-500 transition-colors flex items-center justify-between transition-all duration-300 ease-in-out">
                    {selectExPosition === null
                        ? "เลือกตำแหน่งบริหาร"
                        : expositions?.find(exposition => exposition.ex_position_name === selectExPosition)?.ex_position_name
                    }
                    <ChevronDown
                        className={`w-4 h-4 text-gray-600 dark:text-zinc-600 transition-transform duration-200 ${openDropdown === 'exposition' ? 'rotate-180' : ''}`}
                    />
                </button>
                {openDropdown === 'exposition' && (
                    <div
                        className="absolute z-10 overflow-y-auto max-h-36 w-full mt-2 bg-white dark:bg-zinc-900 border-2 border-gray-300 dark:border-zinc-600 rounded-md shadow-lg"
                    >
                        {expositions?.map((exposition) => (
                            <div
                                key={exposition.ex_position_id}
                                className="px-4 py-2 text-sm font-light text-gray-600 hover:bg-gray-100 dark:hover:bg-zinc-800 cursor-pointer dark:text-gray-400"
                                onClick={() => handleSelectExPosition(exposition.ex_position_id, exposition.ex_position_name)}
                            >
                                {exposition.ex_position_name}
                            </div>
                        ))}
                    </div>
                )}
            </div>
            {error && <div className="text-red-500 mt-2">เกิดข้อผิดพลาดในการเชื่อมต่อข้อมูล</div>}
        </div>
    );
}

export default SelectExPosition;
