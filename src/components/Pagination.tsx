"use client";
import React, { useState, useEffect } from "react";
import {
    MdKeyboardArrowRight,
    MdKeyboardArrowLeft,
    MdKeyboardDoubleArrowLeft,
    MdKeyboardDoubleArrowRight,
} from "react-icons/md";

interface PaginationProps {
    totalPages: number;
    currentPage: number;
    onPageChange: (page: number) => void;
    currentData: unknown[];
    data: unknown[];
    ITEMS_PER_PAGE: number;
}

export default function Pagination({totalPages,onPageChange,currentData,data,currentPage,ITEMS_PER_PAGE}: PaginationProps) {
    const [page, setPage] = useState(1);

    const changePage = (newPage: number) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setPage(newPage);
            onPageChange(newPage);
        }
    };



    useEffect(() => {
        if (page > totalPages) {
            setPage(1);
        }
    }, [currentData, page, totalPages]);


    return (
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 pb-4 first:pt-4 w-full">
            <div className="text-md text-gray-700 dark:text-gray-400 font-light">
                แสดง {currentPage === 1 ? 1 : (currentPage - 1) * ITEMS_PER_PAGE + 1} ถึง {currentPage * ITEMS_PER_PAGE > data.length ? data.length : currentPage * ITEMS_PER_PAGE} จาก {data.length} รายการ
            </div>
            
            <div className="flex items-center gap-2">
                <button
                    className={`p-2 rounded-full ${page <= 1
                        ? "text-gray-400 dark:text-gray-600 cursor-default"
                        : "hover:bg-gray-200 text-gray-600 dark:text-gray-400 cursor-pointer"
                        }`}
                    onClick={() => changePage(1)}
                    disabled={page <= 1}
                >
                    <MdKeyboardDoubleArrowLeft size={24} />
                </button>
                <button
                    className={`p-2 rounded-full ${page <= 1
                           ? "text-gray-400 dark:text-gray-600 cursor-default"
                        : "hover:bg-gray-200 text-gray-600 dark:text-gray-400 cursor-pointer"
                        }`}
                    onClick={() => changePage(page - 1)}
                    disabled={page <= 1}
                >
                    <MdKeyboardArrowLeft size={24} />
                </button>

                <span className="text-sm text-gray-600 dark:text-gray-400">
                    หน้า <span className="font-light">{page}</span> จาก{" "}
                    <span className="font-light">{totalPages}</span>
                </span>

                <button className={`p-2 rounded-full
                    ${page >= totalPages 
                        ? "text-gray-400 dark:text-gray-600 cursor-default"
                        : "hover:bg-gray-200 text-gray-600 dark:text-gray-400 cursor-pointer"
                    }`}
                    onClick={() => changePage(page + 1)}
                    disabled={page >= totalPages}>
                    <MdKeyboardArrowRight size={24} />
                </button>

                <button className={`p-2 rounded-full ${page >= totalPages
                    ? "text-gray-400 dark:text-gray-600 cursor-default"
                    : "hover:bg-gray-200 text-gray-600 dark:text-gray-400 cursor-pointer"
                    }`}
                    onClick={() => changePage(totalPages)}
                    disabled={page >= totalPages}
                >
                    <MdKeyboardDoubleArrowRight size={24} />
                </button>
            </div>
        </div>
    );
}
