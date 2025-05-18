import React, { useState, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import axios from 'axios';
import {jwtDecode} from 'jwt-decode';

interface UserLoginData {
    course_name: string;
}

interface Course {
    course_id: number;
    course_name: string;
}

interface SelectCourseProps {
    openDropdown: string | null;
    setOpenDropdown: React.Dispatch<React.SetStateAction<string | null>>;
    courseDropdownRef: React.RefObject<HTMLDivElement>;
    selectCourse: string | null;
    setSelectedCourse: React.Dispatch<React.SetStateAction<string | null>>;
    handleOnChangeCourse: (course_id: number, course_name: string) => void;
}

function SelectCourse({
    openDropdown,
    setOpenDropdown,
    courseDropdownRef,
    selectCourse,
    setSelectedCourse,
    handleOnChangeCourse,
}: SelectCourseProps) {
    const [courses, setCourses] = useState<Course[]>([]);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // Decode token and set the default course
        const token = localStorage.getItem('token');
        if (token) {
            const decoded: UserLoginData = jwtDecode(token);
            setSelectedCourse(decoded.course_name); // Set default course based on token
        }
    }, [setSelectedCourse]);

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    throw new Error('No token found. Please log in.');
                }

                const response = await axios.get(process.env.NEXT_PUBLIC_API + 'course', {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (response.status === 200) {
                    if (response.data.status) {
                        setCourses(response.data.data);
                    } else {
                        throw new Error('No data found');
                    }
                } else {
                    throw new Error('Failed to fetch data');
                }
            } catch (error) {
                if (axios.isAxiosError(error)) {
                    setError(error.response?.data?.message || 'Error fetching courses');
                    console.error('Axios error:', error.response || error.message);
                } else {
                    setError('An unknown error occurred');
                    console.error('Unknown error:', error);
                }
            }
        };

        fetchCourses();
    }, []);

    const handleSelectCourse = (course_name: string, course_id: number) => {
        setSelectedCourse(course_name);
        handleOnChangeCourse(course_id, course_name);
        setOpenDropdown(null);
    };

    return (
        <div>
            <label className="block text-sm font-regular text-gray-600 dark:text-gray-400 mb-2">
                หลักสูตร
            </label>
            <div className="relative z-5" ref={courseDropdownRef}>
                <button
                    type="button"
                    onClick={() => setOpenDropdown(openDropdown === 'course' ? null : 'course')}
                    className="w-full px-4 py-2 font-light rounded-md text-sm border-2 border-gray-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-gray-600 dark:text-gray-400 focus:outline-none focus:border-blue-500 transition-colors flex items-center justify-between transition-all duration-300 ease-in-out"
                >
                    {selectCourse || 'เลือกหลักสูตร'}
                    <ChevronDown
                        className={`w-4 h-4 text-gray-600 dark:text-zinc-600 transition-transform duration-200 ${
                            openDropdown === 'course' ? 'rotate-180' : ''
                        }`}
                    />
                </button>
                {openDropdown === 'course' && (
                    <div className="absolute z-10 overflow-y-auto max-h-36 w-full mt-2 bg-white dark:bg-zinc-900 border-2 border-gray-300 dark:border-zinc-600 rounded-md shadow-lg">
                        {courses.map((course) => (
                            <div
                                key={course.course_id}
                                className="px-4 py-2 text-sm font-light text-gray-600 hover:bg-gray-100 dark:hover:bg-zinc-800 cursor-pointer dark:text-gray-400"
                                onClick={() => handleSelectCourse(course.course_name, course.course_id)}
                            >
                                {course.course_name}
                            </div>
                        ))}
                    </div>
                )}
            </div>
            {error && <div className="text-red-500 mt-2">{error}</div>}
        </div>
    );
}

export default SelectCourse;
