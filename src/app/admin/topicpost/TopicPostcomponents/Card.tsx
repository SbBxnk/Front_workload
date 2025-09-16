import React, { useState } from 'react'
import Postcard from './Postcard'
import Pagination from '../../../../components/Pagination'
import { HiPlus } from 'react-icons/hi'
import { ChevronDown } from 'lucide-react'
function Card() {
  const ITEMS_PER_PAGE = 6
  const allData = Array.from({ length: 50 }, (_, index) => ({
    id: index + 1,
    content: `Card ${index + 1}`,
  }))

  const [currentPage, setCurrentPage] = useState(1)
  const totalPages = Math.ceil(allData.length / ITEMS_PER_PAGE)

  const handlePageChange = (page: React.SetStateAction<number>) => {
    setCurrentPage(page)
  }

  const currentData = allData.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  return (
    <>
      <div className="py-4 md:flex">
        <div className="flex w-full flex-wrap gap-4 md:w-full">
          <div className="flex w-full items-center rounded-md border-2 border-gray-300 bg-white px-4 py-2 transition-all duration-300 ease-in-out focus-within:ring-2 focus-within:ring-gray-300 dark:border-zinc-600 dark:bg-zinc-900 dark:focus-within:ring-zinc-600 md:w-52">
            <input
              placeholder="ค้นหาด้วยชื่อโครงการ"
              className="flex-grow bg-transparent text-sm font-light outline-none dark:bg-transparent dark:text-gray-400"
            />
          </div>
          <div className="flex w-full items-center rounded-md border-2 border-gray-300 bg-white px-4 py-2 transition-all duration-300 ease-in-out focus-within:ring-2 focus-within:ring-gray-300 dark:border-zinc-600 dark:bg-zinc-900 dark:focus-within:ring-zinc-600 md:w-52">
            <input
              placeholder="ค้นหาด้วยชื่อบุคคล"
              className="flex-grow bg-transparent text-sm font-light outline-none dark:bg-transparent dark:text-gray-400"
            />
          </div>
          <div className="flex w-full items-center rounded-md border-2 border-gray-300 bg-white px-4 py-2 transition-all duration-300 ease-in-out focus-within:ring-2 focus-within:ring-gray-300 dark:border-zinc-600 dark:bg-zinc-900 dark:focus-within:ring-zinc-600 md:w-52">
            <input
              placeholder="ค้นหาด้วยชื่อบุคคล"
              className="flex-grow bg-transparent text-sm font-light outline-none dark:bg-transparent dark:text-gray-400"
            />
          </div>
          <div className="relative w-full md:w-52">
            <div className="flex cursor-pointer items-center justify-between rounded-md border-2 border-gray-300 bg-white px-4 py-2 text-gray-400 transition-all duration-300 ease-in-out hover:bg-gray-50 dark:border-zinc-600 dark:bg-zinc-900 dark:hover:bg-zinc-800">
              <span className="text-sm font-light text-gray-400">
                selectedLabel
              </span>
              <ChevronDown
                className={`h-4 w-4 text-gray-400 transition-transform duration-200 dark:text-zinc-600`}
              />
            </div>
          </div>
        </div>

        <div className="drawer-end pt-4 md:pt-0">
          <input id="my-drawer-4" type="checkbox" className="drawer-toggle" />
          <div className="drawer-content">
            <label
              htmlFor="my-drawer-4"
              className="drawer-button flex w-full cursor-pointer items-center justify-between gap-2 rounded-md bg-success px-4 py-2.5 text-sm font-light text-white transition duration-300 ease-in-out hover:bg-success/80 md:w-52"
            >
              เพิ่มบุคลากร
              <HiPlus className="h-4 w-4" />
            </label>
          </div>
        </div>
      </div>
      <div className="grid w-full grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
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
  )
}

export default Card
