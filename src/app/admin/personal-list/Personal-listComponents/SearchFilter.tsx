import React from 'react';
import { useRouter } from 'next/navigation';
import Select, { ClearIndicatorProps, components, StylesConfig } from 'react-select';
import { HiPlus } from 'react-icons/hi';
import { FiX } from 'react-icons/fi';

interface SearchFilterProps {
    searchName: string;
    setSearchName: React.Dispatch<React.SetStateAction<string>>;
    selectedLabel: string;
    handleSelect: (value: string) => void;
    objects: { position_id: number; position_name: string }[];
}

interface Option {
    value: string;
    label: string;
}

export default function SearchFilter({
    searchName,
    setSearchName,
    selectedLabel,
    handleSelect,
    objects,
}: SearchFilterProps) {
    const router = useRouter();

    const options = objects.map((position) => ({
        value: position.position_name,
        label: position.position_name,
    }));

    const createPersonal = () => {
        router.push('/admin/personal-list/create-personal');
    };

    const clearSearch = () => {
        setSearchName('');
    };

    const CustomClearIndicator = (props: ClearIndicatorProps<Option, false>) => {
        return (
            <components.ClearIndicator {...props}>
                <FiX className="w-4 h-4 text-gray-400 hover:text-red-500 transition duration-200 cursor-pointer" />
            </components.ClearIndicator>
        );
    };


    const customStyles: StylesConfig<Option, false> = {
        control: (provided) => ({
            ...provided,
            fontSize: '0.875rem',
            fontWeight: '300',
            color: '#d1d5db',
            borderRadius: '0.375rem',
            border: '2px solid',
            padding: '0px 4px',
        }),
        placeholder: (provided) => ({
            ...provided,
            fontSize: '0.875rem',
            fontWeight: '300',
            color: '#9CA3AF',
        }),
        option: (provided) => ({
            ...provided,
            fontSize: '0.875rem',
            fontWeight: '300',
            padding: '10px',
        }),
        dropdownIndicator: (provided) => ({
            ...provided,
            fontSize: '1rem',
            padding: '4px',
        }),
    };

    return (
        <div className="pb-4 md:flex">


            <div className="flex flex-wrap gap-4 w-full md:w-full items-center">
                <div className="relative flex items-center w-full md:w-52">
                    <input
                        className="w-full px-4 py-2 font-light rounded-md text-sm border-2 border-gray-300 dark:border-zinc-600 text-gray-600 dark:bg-zinc-800 dark:text-gray-400 focus:outline-none focus:border-blue-500 focus:border-blue-500 transition-colors transition-all duration-300 ease-in-out"
                        placeholder="ค้นหาด้วยชื่อบุคคล"
                        value={searchName}
                        onChange={(e) => setSearchName(e.target.value)}
                    />
                    {searchName && (
                        <button
                            onClick={clearSearch}
                            className="absolute right-3 text-gray-400 hover:text-red-500 transition duration-200"
                        >
                            <FiX className="w-4 h-4" />
                        </button>
                    )}
                </div>



                <div className="w-full md:w-52">
                    <Select<Option, false>
                        placeholder="ค้นหาตำแหน่ง"
                        options={options}
                        onChange={(selectedOption) => {
                            if (selectedOption && 'value' in selectedOption) {
                                handleSelect(selectedOption.value);
                            } else {
                                handleSelect('');
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
                    />
                </div>
            </div>
            <div className="pt-4 md:pt-0">
                <button
                    onClick={createPersonal}
                    className="w-full md:w-52 bg-success text-sm font-light text-white rounded-md py-2.5 px-4 hover:bg-success/80 transition ease-in-out duration-300 flex items-center gap-2 justify-between"
                >
                    เพิ่มบุคลากร
                    <HiPlus className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}

