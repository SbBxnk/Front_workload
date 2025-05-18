import React, { useState, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import axios from 'axios';
interface SelectPersonalTypeProps {
    type_p_id: number
    type_p_name: string
    openDropdown: string | null;
    setOpenDropdown: React.Dispatch<React.SetStateAction<string | null>>;
    personalTypeDropdownRef: React.RefObject<HTMLDivElement>;
    selectPersonalType: string | null
    setSelectPersonalType: React.Dispatch<React.SetStateAction<string | null>>
    handleOnChangePersonalType: (type_p_id: number,type_p_name:string) => void
}

function SelectPersonalType({ openDropdown, setOpenDropdown, personalTypeDropdownRef,handleOnChangePersonalType,selectPersonalType, setSelectPersonalType }: SelectPersonalTypeProps,) {
    const [personalTypes, setPersonalType] = useState<SelectPersonalTypeProps[]>([]);
    const [, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
   

    useEffect(() => {
        const fetchPersonalType = async () => {
            try {
                const token = localStorage.getItem("token");
                if (!token) {
                    throw new Error("No token found. Please log in.");
                }

                const response = await axios.get(process.env.NEXT_PUBLIC_API + "/personalType", {
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`,
                    },
                });

                if (response.status === 200) {
                    if (response.data.status) {
                        setPersonalType(response.data.data);
                    } else {
                        throw new Error("No data found");
                    }
                } else {
                    throw new Error("Failed to fetch data");
                }
            } catch (error) {
                if (axios.isAxiosError(error)) {
                    setError(error.response?.data?.message || "Error fetching PersonalType");
                    console.error("Axios error:", error.response || error.message);
                } else {
                    setError("An unknown error occurred");
                    console.error("Unknown error:", error);
                }
            } finally {
                setLoading(false);
            }
        };

        fetchPersonalType();
    }, []);

    const handleSelectPersonalType = (type_p_id: number,type_p_name:string) => {
        setSelectPersonalType(type_p_name);
        handleOnChangePersonalType(type_p_id,type_p_name);
        setOpenDropdown(null);
    };
    

    return (
        <div>
            <label className="block text-sm font-regular text-gray-600 dark:text-gray-400 mb-2">
                ประเภทบุคลากร
            </label>
            <div className="relative z-5" ref={personalTypeDropdownRef}>
                <button
                    type="button"
                    onClick={() => setOpenDropdown(openDropdown === 'personalType' ? null : 'personalType')}
                    className="w-full px-4 py-2 font-light rounded-md text-sm border-2 border-gray-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-gray-600 dark:text-gray-400 focus:outline-none focus:border-blue-500 transition-colors flex items-center justify-between transition-all duration-300 ease-in-out">
                    {selectPersonalType === null
                        ? "เลือกประเภทบุคลากร"
                        : personalTypes.find(personalType => personalType.type_p_name === selectPersonalType)?.type_p_name
                    }
                    <ChevronDown
                        className={`w-4 h-4 text-gray-600 dark:text-zinc-600 transition-transform duration-200 ${openDropdown === 'personalType' ? 'rotate-180' : ''}`}
                    />
                </button>
                {openDropdown === 'personalType' && (
                    <div
                        className="absolute z-10 overflow-y-auto max-h-36 w-full mt-2 bg-white dark:bg-zinc-900 border-2 border-gray-300 dark:border-zinc-600 rounded-md shadow-lg"
                    >
                        {personalTypes.map((personalType) => (
                            <div
                                key={personalType.type_p_id}
                                className="px-4 py-2 text-sm font-light text-gray-600 hover:bg-gray-100 dark:hover:bg-zinc-800 cursor-pointer dark:text-gray-400"
                                onClick={() => handleSelectPersonalType(personalType.type_p_id, personalType.type_p_name)}
                            >
                                {personalType.type_p_name}
                            </div>
                        ))}
                    </div>
                )}
            </div>
            {error && <div className="text-red-500 mt-2">{error}</div>}
        </div>
    );
}

export default SelectPersonalType;
