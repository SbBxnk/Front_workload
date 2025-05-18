import React, { useState } from 'react';
import Postcard from './Postcard';
import Pagination from '../../../../components/Pagination';
import { HiPlus } from "react-icons/hi";
import { ChevronDown } from 'lucide-react';
function Card() {
    const ITEMS_PER_PAGE = 6;
    const allData = Array.from({ length: 50 }, (_, index) => ({
        id: index + 1,
        content: `Card ${index + 1}`,
    }));

    const [currentPage, setCurrentPage] = useState(1); 
    const totalPages = Math.ceil(allData.length / ITEMS_PER_PAGE); 

    const handlePageChange = (page: React.SetStateAction<number>) => {
        setCurrentPage(page);
    };

    const currentData = allData.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    return (
        <>
              <div className="py-4 md:flex">
                <div className="flex flex-wrap gap-4 w-full md:w-full">
                    <div className="flex items-center border-2 border-gray-300 bg-white dark:bg-zinc-900 dark:border-zinc-600 rounded-md px-4 py-2 focus-within:ring-2 focus-within:ring-gray-300 dark:focus-within:ring-zinc-600 w-full md:w-52 transition-all duration-300 ease-in-out">
                        <input
                            placeholder="ค้นหาด้วยชื่อโครงการ"
                            className="flex-grow outline-none font-light text-sm dark:bg-transparent dark:text-gray-400 bg-transparent"
                        />
                    </div>
                    <div className="flex items-center border-2 border-gray-300 bg-white dark:bg-zinc-900 dark:border-zinc-600 rounded-md px-4 py-2 focus-within:ring-2 focus-within:ring-gray-300 dark:focus-within:ring-zinc-600 w-full md:w-52 transition-all duration-300 ease-in-out">
                        <input
                            placeholder="ค้นหาด้วยชื่อบุคคล"
                            className="flex-grow outline-none font-light text-sm dark:bg-transparent dark:text-gray-400 bg-transparent"
                        />
                    </div>
                    <div className="flex items-center border-2 border-gray-300 bg-white dark:bg-zinc-900 dark:border-zinc-600 rounded-md px-4 py-2 focus-within:ring-2 focus-within:ring-gray-300 dark:focus-within:ring-zinc-600 w-full md:w-52 transition-all duration-300 ease-in-out">
                        <input
                            placeholder="ค้นหาด้วยชื่อบุคคล"
                            className="flex-grow outline-none font-light text-sm dark:bg-transparent dark:text-gray-400 bg-transparent"
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
                </div>


                <div className="drawer-end pt-4 md:pt-0">
                    <input id="my-drawer-4" type="checkbox" className="drawer-toggle" />
                    <div className="drawer-content">
                        <label
                            htmlFor="my-drawer-4"
                            className="w-full md:w-52 bg-success text-sm font-light text-white rounded-md py-2.5 px-4 hover:bg-success/80 transition ease-in-out duration-300 drawer-button flex items-center gap-2 justify-between cursor-pointer">
                            เพิ่มบุคลากร
                            <HiPlus className="w-4 h-4" />
                        </label>
                    </div>
                </div>

            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
                {currentData.map((item) => (
                    <Postcard key={item.id} />
                ))}
            </div>
            <Pagination
                totalPages={totalPages}
                currentPage={currentPage}
                onPageChange={handlePageChange}
                currentData={currentData}
                data={allData}
                ITEMS_PER_PAGE={ITEMS_PER_PAGE}
            />
        </>
    );
}

export default Card;
