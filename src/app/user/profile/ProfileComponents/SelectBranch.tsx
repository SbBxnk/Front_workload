import React, { useState, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import axios from 'axios';
import {jwtDecode} from 'jwt-decode';

interface UserLoginData {
    branch_name: string;
}

interface Branch {
    branch_id: number;
    branch_name: string;
}

interface SelectBranchProps {
    openDropdown: string | null;
    setOpenDropdown: React.Dispatch<React.SetStateAction<string | null>>;
    branchDropdownRef: React.RefObject<HTMLDivElement>;
    selectBranch: string | null;
    setSelectedBranch: React.Dispatch<React.SetStateAction<string | null>>;
    handleOnChangeBranch: (branch_id: number, branch_name: string) => void;
}

function SelectBranch({
    openDropdown,
    setOpenDropdown,
    branchDropdownRef,
    selectBranch,
    setSelectedBranch,
    handleOnChangeBranch,
}: SelectBranchProps) {
    const [branchs, setBranchs] = useState<Branch[]>([]);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const decoded: UserLoginData = jwtDecode(token);
                setSelectedBranch(decoded.branch_name);
            } catch (decodeError) {
                console.error('Error decoding token:', decodeError);
            }
        }
    }, [setSelectedBranch]);

    useEffect(() => {
        const fetchBranch = async () => {
            setError(null); // Clear previous errors
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    throw new Error('No token found. Please log in.');
                }

                const response = await axios.get(process.env.NEXT_PUBLIC_API + '/branch', {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (response.status === 200 && response.data.status) {
                    setBranchs(response.data.data);
                } else {
                    throw new Error('No data found');
                }
            } catch (error) {
                if (axios.isAxiosError(error)) {
                    setError(error.response?.data?.message || 'Error fetching branchs');
                    console.error('Axios error:', error.response || error.message);
                } else {
                    setError('An unknown error occurred');
                    console.error('Unknown error:', error);
                }
            }
        };

        fetchBranch();
    }, []);

    const handleSelectBranch = (branch_id: number, branch_name: string) => {
        setSelectedBranch(branch_name);
        handleOnChangeBranch(branch_id, branch_name);
        setOpenDropdown(null);
    };

    return (
        <div>
            <label className="block text-sm font-regular text-gray-600 dark:text-gray-400 mb-2">
                หลักสูตร
            </label>
            <div className="relative z-5" ref={branchDropdownRef}>
                <button
                    type="button"
                    onClick={() => setOpenDropdown(openDropdown === 'branch' ? null : 'branch')}
                    aria-expanded={openDropdown === 'branch'}
                    className="w-full px-4 py-2 font-light rounded-md text-sm border-2 border-gray-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-gray-600 dark:text-gray-400 focus:outline-none focus:border-blue-500 transition-colors flex items-center justify-between transition-all duration-300 ease-in-out"
                >
                    {selectBranch || 'เลือกสาขา'}
                    <ChevronDown
                        className={`w-4 h-4 text-gray-600 dark:text-zinc-600 transition-transform duration-200 ${openDropdown === 'branch' ? 'rotate-180' : ''
                            }`}
                    />
                </button>
                {openDropdown === 'branch' && (
                    <div className="absolute z-10 overflow-y-auto max-h-36 w-full mt-2 bg-white dark:bg-zinc-900 border-2 border-gray-300 dark:border-zinc-600 rounded-md shadow-lg">
                        {branchs.map((branch) => (
                            <div
                                key={branch.branch_id}
                                className="px-4 py-2 text-sm font-light text-gray-600 hover:bg-gray-100 dark:hover:bg-zinc-800 cursor-pointer dark:text-gray-400"
                                onClick={() => handleSelectBranch(branch.branch_id, branch.branch_name)}
                            >
                                {branch.branch_name}
                            </div>
                        ))}
                    </div>
                )}
            </div>
            {error && <div className="text-red-500 mt-2">{error}</div>}
        </div>
    );
}

export default SelectBranch;