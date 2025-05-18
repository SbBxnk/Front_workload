"use client"
import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Avatar from "../../../../../public/images/peeps-avatar.png";
import { BsThreeDotsVertical } from "react-icons/bs";
import { RiDeleteBin6Line } from "react-icons/ri";
import { FaEdit } from "react-icons/fa";
import { IoIosCalendar } from "react-icons/io";
import { PiFileDuotone } from "react-icons/pi";
function Postcard() {
    const [ActiveMenu, setActiveMenu] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    const handleMenu = () => {
        setActiveMenu((prev) => !prev);
    };

    const handleClickOutside = (e: MouseEvent) => {
        if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
            setActiveMenu(false);
        }
    };

    useEffect(() => {
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    return (
        <div className="w-full p-4 bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md dark:bg-zinc-900 dark:border-zinc-700 dark:text-gray-200 transition-all duration-300 ease-in-out">
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex justify-between w-full align-center gap-4">
                    <div className="flex justify-center items-center sm:justify-start">
                        <div className="w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0">
                            <Image
                                src={Avatar}
                                alt="avatar"
                                className="bg-white rounded-full object-cover border-2 border-gray-100 dark:border-zinc-600"
                            />
                        </div>
                    </div>

                    <div className="flex-grow">
                        <div className="flex flex-row justify-between items-center gap-2">
                            <h1 className="text-xl md:text-xl font-medium text-gray-600 dark:text-gray-200 truncate">
                                ชยากร ภูเขียว
                            </h1>
                            <div className="relative z-0">
                                <button
                                    className="p-1 hover:bg-gray-100 rounded-full dark:hover:bg-zinc-800"
                                    onClick={handleMenu}
                                    aria-label="เมนู"
                                >
                                    <BsThreeDotsVertical className="w-5 h-5" />
                                </button>

                                {ActiveMenu && (
                                    <div
                                        ref={menuRef}
                                        className="absolute right-0 top-8 z-10 w-32 bg-white rounded-md shadow-lg border border-gray-200 dark:bg-zinc-800 dark:border-zinc-700"
                                    >
                                        <ul className="py-1">
                                            <li className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-zinc-700 font-light cursor-pointer flex items-center gap-2">
                                                <FaEdit className="w-4 h-4" />แก้ไข
                                            </li>
                                            <li className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-zinc-700 cursor-pointer text-red-600 font-light dark:text-red-400 flex items-center gap-2">
                                                <RiDeleteBin6Line className="w-4 h-4" /> ลบ
                                            </li>
                                        </ul>
                                    </div>
                                )}
                            </div>
                        </div>

                        <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 truncate">
                            chayakorn_po65@live.rmutl.ac.th
                        </p>

                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 mt-2">
                            <div className="flex items-center gap-1 text-xs text-business1 py-1 dark:text-blue-500 whitespace-nowrap order-2 sm:order-1">
                                <IoIosCalendar />25 สิงหาคม 2567
                            </div>
                            <div className="w-full sm:w-auto sm:flex-1 sm:min-w-0 order-1 sm:order-2">
                                <div className="w-full bg-business1 text-white text-xs font-light px-3 py-1 rounded-full truncate max-w-[140px]">
                                    ภาระงานทำนุบำรุงศิลปวัฒนธรรม
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="divider divider-gray my-0"></div>
            <p className="text-xs md:text-sm font-light text-gray-400 line-clamp-3 mb-4">
                Lorem ipsum dolor, sit amet consectetur adipisicing elit. Exercitationem, expedita quisquam nulla itaque amet veniam quae, reprehenderit consectetur quibusdam, dolorum quos ad iusto molestiae quasi. Ullam reprehenderit quibusdam minima beatae?</p>
            <div className=" rounded-b-md flex justify-between items-center">
                <div className="flex items-center gap-1">
                    <PiFileDuotone className="md:w-5 md:h-5" />
                    <p className="text-xs md:text-sm font-light flex items-center gap-2">จำนวนไฟล์ที่แนบแล้ว<span>22</span></p>
                </div>
                <button className="text-xs md:text-sm font-light bg-business1 text-white px-4 py-2 rounded-md">ดูเพิ่มเติม</button>
            </div>
        </div>
    );
}

export default Postcard;