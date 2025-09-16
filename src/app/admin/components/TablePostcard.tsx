import React, { useState } from 'react'
import { DataPost } from './data'
// import { IoIosSearch } from 'react-icons/io';
import { RiDeleteBin6Line } from 'react-icons/ri'
import { HiPlus } from 'react-icons/hi'
import { FaSpinner, FaCheck } from 'react-icons/fa'
import Pagination from '../../../components/Pagination'
import { Bounce, toast, ToastContainer } from 'react-toastify'
import { ChevronDown } from 'lucide-react'

const ITEMS_PER_PAGE = 10
export default function TableCard() {
  const [data, setData] = useState(DataPost)
  const [isLoading, setIsLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const totalPages = Math.ceil(data.length / ITEMS_PER_PAGE)
  const currentData = data.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  const handleDeletePost = (e: React.MouseEvent, title: string, id: number) => {
    const filteredPosts = data.filter((post) => post.id !== id)
    e.preventDefault()
    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
      setData(filteredPosts)
      setCurrentPage(1)
      toast.success(`ลบข้อมูล ${title} สำเร็จ!`, {
        position: 'top-right',
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: 'light',
        transition: Bounce,
      })
    }, 1000)
  }

  const HandleApprove = (e: React.MouseEvent, title: string, id: number) => {
    const filteredPosts = data.filter((post) => post.id !== id)
    e.preventDefault()
    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
      setData(filteredPosts)
      setCurrentPage(1)
      toast.success(`อนุมัติหลักฐานภาระงาน ${title} สำเร็จ!`, {
        position: 'top-right',
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: 'light',
        transition: Bounce,
      })
    }, 1000)
  }

  return (
    <div className="">
      <div className="py-4 md:flex">
        <div className="flex w-full flex-wrap gap-4 md:w-full">
          <div className="flex w-full items-center rounded-md border-2 border-gray-300 bg-white px-4 py-2 transition-all duration-300 ease-in-out focus-within:ring-2 focus-within:ring-gray-300 dark:border-zinc-600 dark:bg-zinc-900 dark:focus-within:ring-zinc-600 md:w-52">
            <input
              placeholder="ค้นหาด้วยชื่อโครงการ"
              className="flex-grow bg-transparent text-sm font-light outline-none dark:bg-transparent dark:text-gray-400"
            />
          </div>
          <div className="flex w-full items-center rounded-sm border-2 border-gray-300 bg-white px-4 py-2 transition-all duration-300 ease-in-out focus-within:ring-2 focus-within:ring-gray-300 dark:border-zinc-600 dark:bg-zinc-900 dark:focus-within:ring-zinc-600 md:w-52">
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
            {/* ปุ่มเปิด drawer */}
            <label
              htmlFor="my-drawer-4"
              className="drawer-button flex w-full cursor-pointer items-center justify-between gap-2 rounded-md bg-success px-4 py-2.5 text-sm font-light text-white transition duration-300 ease-in-out hover:bg-success/80 md:w-52"
            >
              เพิ่มไฟล์หลักฐานภาระงาน
              <HiPlus className="h-4 w-4" />
            </label>
          </div>
        </div>
      </div>
      <div className="rounded-md border dark:border-zinc-600">
        <div className="">
          {isLoading && (
            <div className="absolute inset-0 z-50 flex items-center justify-center bg-gray-100 bg-opacity-80">
              <FaSpinner className="h-12 w-12 animate-spin text-gray-600" />
            </div>
          )}
          <div className="overflow-x-auto">
            <table className="w-full overflow-x-auto md:table-auto">
              <thead className="bg-gray-100 transition-all duration-300 ease-in-out dark:bg-zinc-800">
                <tr>
                  <th className="p-4 py-4 text-center text-sm font-light text-gray-600 dark:text-gray-300">
                    ลำดับ
                  </th>
                  <th className="p-4 py-4 text-center text-sm font-light text-gray-600 dark:text-gray-300">
                    ชื่อโครงการ
                  </th>
                  <th className="p-4 py-4 text-center text-sm font-light text-gray-600 dark:text-gray-300">
                    ชื่อผู้สร้าง
                  </th>
                  <th className="p-4 py-4 text-center text-sm font-light text-gray-600 dark:text-gray-300">
                    วันที่สร้าง
                  </th>
                  <th className="p-4 py-4 text-center text-sm font-light text-gray-600 dark:text-gray-300">
                    จัดการ
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white transition-all duration-300 ease-in-out dark:divide-zinc-600 dark:bg-zinc-900">
                {currentData.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-gray-50 dark:hover:bg-zinc-800"
                  >
                    <td className="text-md whitespace-nowrap p-4 text-center font-light text-gray-500 dark:text-gray-400">
                      {item.id}
                    </td>
                    <td className="text-md whitespace-nowrap p-4 text-start font-light text-gray-500 dark:text-gray-400">
                      {item.title}
                    </td>

                    <td className="text-md whitespace-nowrap p-4 text-start font-light text-gray-500 dark:text-gray-400">
                      {item.creator}
                    </td>
                    <td className="text-md whitespace-nowrap p-4 text-center font-light text-gray-500 dark:text-gray-400">
                      {item.date}
                    </td>
                    <td className="text-md flex justify-center gap-2 whitespace-nowrap p-4 text-center font-light">
                      <button
                        onClick={(e) => HandleApprove(e, item.title, item.id)}
                        className="rounded-md border-none border-green-500 p-1 text-green-500 transition duration-300 ease-in-out hover:bg-green-500 hover:text-white"
                      >
                        <FaCheck className="h-4 w-4" />
                      </button>
                      <label
                        htmlFor={`modal-delete${item.id}`}
                        className="cursor-pointer rounded-md border-none border-red-500 p-1 text-red-500 transition duration-300 ease-in-out hover:bg-red-500 hover:text-white"
                      >
                        <RiDeleteBin6Line className="h-4 w-4" />
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
          {currentData.map(
            (item) =>
              !isLoading && (
                <div key={`modal-${item.id}`} className="relative z-[100]">
                  <input
                    type="checkbox"
                    id={`modal-delete${item.id}`}
                    className="modal-toggle"
                  />
                  <div className="modal" role={`modal-delete${item.id}`}>
                    <div className="modal-box rounded-md dark:bg-zinc-800">
                      <div className="flex items-center">
                        <h3 className="flex truncate text-start text-2xl font-light text-gray-600 dark:text-gray-400">
                          ยืนยันการลบหลักฐานภาระงาน&nbsp;
                          <span className="truncate font-light text-business1 dark:text-blue-500/80">
                            {item.title}
                          </span>
                        </h3>
                      </div>
                      <p className="text-wrap py-8 text-start text-lg font-light text-gray-500">
                        เมื่อยืนยันการลบข้อมูลนี้
                        ข้อมูลจะไม่สามารถกลับมาแก้ไขได้ คุณแน่ใจหรือไม่?
                      </p>
                      <div className="flex justify-end gap-4">
                        <button
                          onClick={(e) =>
                            handleDeletePost(e, item.title, item.id)
                          }
                          className="text-md flex w-20 items-center justify-center rounded-md border border-2 border-red-500 bg-transparent px-4 py-2 font-light text-red-500 transition duration-300 ease-in-out hover:border-red-500 hover:bg-red-500 hover:text-white"
                        >
                          ยืนยัน
                        </button>
                        <label
                          htmlFor={`modal-delete${item.id}`}
                          className="text-md z-50 flex w-20 cursor-pointer items-center justify-center rounded-md border border-2 border-gray-200 bg-gray-200 px-4 py-2 font-light text-gray-600 transition duration-300 ease-in-out hover:border-gray-300 hover:bg-gray-300 dark:border-zinc-700 dark:bg-zinc-700 dark:text-gray-400 dark:hover:border-zinc-600 dark:hover:bg-zinc-600"
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
          )}
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
  )
}
