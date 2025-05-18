import type React from 'react';
import { ChevronDown } from 'lucide-react';
import useFetchData from "@/hooks/FetchAPI"
import { Position } from "@/Types"

interface SelectPositionProps {
    position_id: number
    position_name: string
    openDropdown: string | null;
    setOpenDropdown: React.Dispatch<React.SetStateAction<string | null>>;
    positionDropdownRef: React.RefObject<HTMLDivElement>;
    selectPosition: string | null
    setSelectPosition: React.Dispatch<React.SetStateAction<string | null>>
    handleOnChangePosition: (position_id: number, position_name: string) => void
}

function SelectPosition({ openDropdown, setOpenDropdown, positionDropdownRef, selectPosition, setSelectPosition, handleOnChangePosition }: SelectPositionProps) {
    const { data: positions, error } = useFetchData<Position[]>("/position");

    const handleSelectPosition = (position_name: string, position_id: number) => {
        setSelectPosition(position_name);
        handleOnChangePosition(position_id, position_name);
        setOpenDropdown(null);
    };

    return (
        <div>
            <label className="block text-sm font-regular text-gray-600 dark:text-gray-400 mb-2">
                ตำแหน่งวิชาการ
            </label>
            <div className="relative z-5" ref={positionDropdownRef}>
                <button
                    type="button"
                    onClick={() => setOpenDropdown(openDropdown === 'position' ? null : 'position')}
                    className="w-full px-4 py-2 font-light rounded-md text-sm border-2 border-gray-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-gray-600 dark:text-gray-400 focus:outline-none focus:border-blue-500 transition-colors flex items-center justify-between transition-all duration-300 ease-in-out">
                    {selectPosition === null
                        ? "เลือกตำแหน่งวิชาการ"
                        : positions?.find(position => position.position_name === selectPosition)?.position_name
                    }
                    <ChevronDown
                        className={`w-4 h-4 text-gray-600 dark:text-zinc-600 transition-transform duration-200 ${openDropdown === 'position' ? 'rotate-180' : ''}`}
                    />
                </button>
                {openDropdown === 'position' && (
                    <div
                        className="absolute z-10 overflow-y-auto max-h-36 w-full mt-2 bg-white dark:bg-zinc-900 border-2 border-gray-300 dark:border-zinc-600 rounded-md shadow-lg"

                    >
                        {positions?.map((position) => (
                            <div
                                key={position.position_id}
                                className="px-4 py-2 text-sm font-light text-gray-600 hover:bg-gray-100 dark:hover:bg-zinc-800 cursor-pointer dark:text-gray-400"
                                onClick={() => handleSelectPosition(position.position_name, position.position_id)}
                            >
                                {position.position_name}
                            </div>
                        ))}
                    </div>
                )}
            </div>
            {error && <div className="text-red-500 mt-2">เกิดข้อผิดพลาดในการเชื่อมต่อข้อมูล</div>}
        </div>
    );
}

export default SelectPosition;
