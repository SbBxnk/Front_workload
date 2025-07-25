import React, { useState } from 'react';
import { DataPost } from './data';
// import { IoIosSearch } from 'react-icons/io';
import { RiDeleteBin6Line } from "react-icons/ri";
import { HiPlus } from "react-icons/hi";
import { FaSpinner, FaCheck } from "react-icons/fa";
import Pagination from '../../../components/Pagination';
import { Bounce, toast, ToastContainer } from 'react-toastify';
import { ChevronDown } from 'lucide-react';


const ITEMS_PER_PAGE = 10;
export default function TableCard() {
    const [data, setData] = useState(DataPost);
    const [isLoading, setIsLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);


    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const totalPages = Math.ceil(data.length / ITEMS_PER_PAGE);
    const currentData = data.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);


    const handleDeletePost = (e: React.MouseEvent, title: string, id: number) => {
        const filteredPosts = data.filter((post) => post.id !== id);
        e.preventDefault();
        setIsLoading(true);
        setTimeout(() => {
            setIsLoading(false);
            setData(filteredPosts);
            setCurrentPage(1);
            toast.success(`ลบข้อมูล ${title} สำเร็จ!`, {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: false,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "light",
                transition: Bounce,
            });
        }, 1000);
    }


    const HandleApprove = (e: React.MouseEvent, title: string, id: number) => {
        const filteredPosts = data.filter((post) => post.id !== id);
        e.preventDefault();
        setIsLoading(true);
        setTimeout(() => {
            setIsLoading(false);
            setData(filteredPosts);
            setCurrentPage(1);
            toast.success(`อนุมัติหลักฐานภาระงาน ${title} สำเร็จ!`, {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: false,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "light",
                transition: Bounce,
            });
        }, 1000);
    }


    return (
        <div className="">
            <div className="py-4 md:flex">
                <div className="flex flex-wrap gap-4 w-full md:w-full">
                    <div className="flex items-center border-2 border-gray-300 bg-white dark:bg-zinc-900 dark:border-zinc-600 rounded-md px-4 py-2 focus-within:ring-2 focus-within:ring-gray-300 dark:focus-within:ring-zinc-600 w-full md:w-52 transition-all duration-300 ease-in-out">
                        <input
                            placeholder="ค้นหาด้วยชื่อโครงการ"
                            className="flex-grow outline-none text-sm font-light dark:bg-transparent dark:text-gray-400 bg-transparent"
                        />
                    </div>
                    <div className="flex items-center border-2 border-gray-300 bg-white dark:bg-zinc-900 dark:border-zinc-600 rounded-sm px-4 py-2 focus-within:ring-2 focus-within:ring-gray-300 dark:focus-within:ring-zinc-600 w-full md:w-52 transition-all duration-300 ease-in-out">
                        <input
                            placeholder="ค้นหาด้วยชื่อบุคคล"
                            className="flex-grow outline-none text-sm font-light dark:bg-transparent dark:text-gray-400 bg-transparent"
                        />
                    </div>
                    <div className="flex items-center border-2 border-gray-300 bg-white dark:bg-zinc-900 dark:border-zinc-600 rounded-md px-4 py-2 focus-within:ring-2 focus-within:ring-gray-300 dark:focus-within:ring-zinc-600 w-full md:w-52 transition-all duration-300 ease-in-out">
                        <input
                            placeholder="ค้นหาด้วยชื่อบุคคล"
                            className="flex-grow outline-none text-sm font-light dark:bg-transparent dark:text-gray-400 bg-transparent"
                        />
                    </div>
                    <div className="relative w-full md:w-52" >
                        <div
                            className="flex items-center justify-between text-gray-400 border-2 border-gray-300 bg-white dark:bg-zinc-900 dark:border-zinc-600 rounded-md px-4 py-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-zinc-800 transition-all duration-300 ease-in-out">
                            <span className="text-sm text-gray-400 font-light">selectedLabel</span>
                            <ChevronDown
                                className={`w-4 h-4 text-gray-400 dark:text-zinc-600 transition-transform duration-200`}
                            />
                        </div>
                    </div>
                    <div className="relative w-full md:w-52" >
                        <div
                            className="flex items-center justify-between text-gray-400 border-2 border-gray-300 bg-white dark:bg-zinc-900 dark:border-zinc-600 rounded-md px-4 py-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-zinc-800 transition-all duration-300 ease-in-out">
                            <span className="text-sm text-gray-400 font-light">selectedLabel</span>
                            <ChevronDown
                                className={`w-4 h-4 text-gray-400 dark:text-zinc-600 transition-transform duration-200`}
                            />
                        </div>
                    </div>
                </div>


                <div className="drawer-end pt-4 md:pt-0">
                    <input id="my-drawer-4" type="checkbox" className="drawer-toggle" />
                    <div className="drawer-content">
                        {/* ปุ่มเปิด drawer */}
                        <label
                            htmlFor="my-drawer-4"
                            className="w-full md:w-52 bg-success text-sm font-light text-white rounded-md py-2.5 px-4 hover:bg-success/80 transition ease-in-out duration-300 drawer-button flex items-center gap-2 justify-between cursor-pointer">
                            เพิ่มไฟล์หลักฐานภาระงาน
                            <HiPlus className="w-4 h-4" />
                        </label>
                    </div>
                </div>

            </div>
            <div className="border rounded-md dark:border-zinc-600">
                <div className="">
                    {isLoading && (
                        <div className="absolute inset-0 bg-gray-100 bg-opacity-80 flex items-center justify-center z-50">
                            <FaSpinner className="animate-spin text-gray-600 w-12 h-12" />
                        </div>
                    )}
                    <div className="overflow-x-auto">
                        <table className="w-full overflow-x-auto md:table-auto">
                            <thead className="bg-gray-100 dark:bg-zinc-800 transition-all duration-300 ease-in-out">
                                <tr>
                                    <th className="p-4 text-sm text-gray-600 text-center py-4 dark:text-gray-300 font-light">ลำดับ</th>
                                    <th className="p-4 text-sm text-gray-600 text-center py-4 dark:text-gray-300 font-light">ชื่อโครงการ</th>
                                    <th className="p-4 text-sm text-gray-600 text-center py-4 dark:text-gray-300 font-light">ชื่อผู้สร้าง</th>
                                    <th className="p-4 text-sm text-gray-600 text-center py-4 dark:text-gray-300 font-light">วันที่สร้าง</th>
                                    <th className="p-4 text-sm text-gray-600 text-center py-4 dark:text-gray-300 font-light">จัดการ</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-zinc-900 divide-y divide-gray-200 dark:divide-zinc-600 transition-all duration-300 ease-in-out">
                                {currentData.map((item) => (
                                    <tr
                                        key={item.id}
                                        className="hover:bg-gray-50 dark:hover:bg-zinc-800"
                                    >
                                        <td className="p-4 whitespace-nowrap text-center text-md font-light text-gray-500 dark:text-gray-400">
                                            {item.id}
                                        </td>
                                        <td className="p-4 whitespace-nowrap text-start text-md font-light text-gray-500 dark:text-gray-400">
                                            {item.title}
                                        </td>

                                        <td className="p-4 whitespace-nowrap text-start text-md font-light text-gray-500 dark:text-gray-400">
                                            {item.creator}
                                        </td>
                                        <td className="p-4 whitespace-nowrap text-center text-md font-light text-gray-500 dark:text-gray-400">
                                            {item.date}
                                        </td>
                                        <td className="p-4 whitespace-nowrap text-center text-md font-light flex justify-center gap-2">
                                            <button
                                                onClick={(e) => HandleApprove(e, item.title, item.id)}
                                                className="text-green-500 border-none border-green-500 rounded-md p-1 hover:bg-green-500 hover:text-white transition ease-in-out duration-300"
                                            >
                                                <FaCheck className="w-4 h-4" />
                                            </button>
                                            <label
                                                htmlFor={`modal-delete${item.id}`}
                                                className="text-red-500 border-none border-red-500 rounded-md p-1 hover:bg-red-500 hover:text-white transition ease-in-out duration-300 cursor-pointer"
                                            >
                                                <RiDeleteBin6Line className="w-4 h-4" />
                                            </label>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
                <div className="px-4">
                    <Pagination
                        totalPages={totalPages}
                        currentPage={currentPage}
                        onPageChange={handlePageChange}
                        currentData={currentData}
                        data={data}
                        ITEMS_PER_PAGE={ITEMS_PER_PAGE}
                    />
                </div>
            </div>
            {!isLoading ? (
                <>
                    {currentData.map((item) => (
                        !isLoading && (
                            <div key={`modal-${item.id}`} className="relative z-[100]">
                                <input type="checkbox" id={`modal-delete${item.id}`} className="modal-toggle" />
                                <div className="modal" role={`modal-delete${item.id}`}>
                                    <div className="modal-box rounded-md dark:bg-zinc-800">
                                        <div className="flex items-center">
                                            <h3 className="flex text-2xl font-light truncate text-start text-gray-600 dark:text-gray-400">
                                                ยืนยันการลบหลักฐานภาระงาน&nbsp;
                                                <span className="font-light text-business1 truncate dark:text-blue-500/80">
                                                    {item.title}
                                                </span>
                                            </h3>
                                        </div>
                                        <p className="py-8 text-wrap text-gray-500 text-start text-lg font-light">
                                            เมื่อยืนยันการลบข้อมูลนี้ ข้อมูลจะไม่สามารถกลับมาแก้ไขได้ คุณแน่ใจหรือไม่?
                                        </p>
                                        <div className="flex justify-end gap-4">
                                            <button
                                                onClick={(e) => handleDeletePost(e, item.title, item.id)}
                                                className="w-20 border border-2 border-red-500 flex items-center justify-center bg-transparent font-light text-md text-red-500 rounded-md py-2 px-4 hover:bg-red-500 hover:text-white hover:border-red-500 transition ease-in-out duration-300"
                                            >
                                                ยืนยัน
                                            </button>
                                            <label
                                                htmlFor={`modal-delete${item.id}`}
                                                className="z-50 w-20 border border-2 border-gray-200 flex items-center justify-center bg-gray-200 font-light text-md text-gray-600 rounded-md py-2 px-4 hover:bg-gray-300 hover:border-gray-300 dark:bg-zinc-700 dark:text-gray-400 dark:hover:bg-zinc-600 dark:hover:border-zinc-600 dark:border-zinc-700 transition ease-in-out duration-300 cursor-pointer"
                                            >
                                                ยกเลิก
                                            </label>
                                        </div>
                                    </div>
                                    <label
                                        className="modal-backdrop"
                                        htmlFor={`modal-delete${item.id}`}
                                    >
                                        Close
                                    </label>
                                </div>
                            </div>
                        )
                    ))}
                </>
            ) : null}
            <ToastContainer
                position="top-right"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick={false}
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="dark"
                transition={Bounce}
                style={{ fontFamily: 'kanit, sans-serif' }}
            />
        </div>
    );
}
