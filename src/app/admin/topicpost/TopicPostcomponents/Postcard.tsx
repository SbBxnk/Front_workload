'use client'
import React, { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import Avatar from '../../../../../public/images/peeps-avatar.png'
import { BsThreeDotsVertical } from 'react-icons/bs'
import { RiDeleteBin6Line } from 'react-icons/ri'
import { FaEdit } from 'react-icons/fa'
import { IoIosCalendar } from 'react-icons/io'
import { PiFileDuotone } from 'react-icons/pi'
function Postcard() {
  const [ActiveMenu, setActiveMenu] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  const handleMenu = () => {
    setActiveMenu((prev) => !prev)
  }

  const handleClickOutside = (e: MouseEvent) => {
    if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
      setActiveMenu(false)
    }
  }

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  return (
    <div className="w-full rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-all duration-300 ease-in-out hover:shadow-md dark:border-zinc-700 dark:bg-zinc-900 dark:text-gray-200">
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="align-center flex w-full justify-between gap-4">
          <div className="flex items-center justify-center sm:justify-start">
            <div className="h-16 w-16 flex-shrink-0 sm:h-20 sm:w-20">
              <Image
                src={Avatar}
                alt="avatar"
                className="rounded-full border-2 border-gray-100 bg-white object-cover dark:border-zinc-600"
              />
            </div>
          </div>

          <div className="flex-grow">
            <div className="flex flex-row items-center justify-between gap-2">
              <h1 className="truncate text-xl font-medium text-gray-600 dark:text-gray-200 md:text-xl">
                ชยากร ภูเขียว
              </h1>
              <div className="relative z-0">
                <button
                  className="rounded-full p-1 hover:bg-gray-100 dark:hover:bg-zinc-800"
                  onClick={handleMenu}
                  aria-label="เมนู"
                >
                  <BsThreeDotsVertical className="h-5 w-5" />
                </button>

                {ActiveMenu && (
                  <div
                    ref={menuRef}
                    className="absolute right-0 top-8 z-10 w-32 rounded-md border border-gray-200 bg-white shadow-lg dark:border-zinc-700 dark:bg-zinc-800"
                  >
                    <ul className="py-1">
                      <li className="flex cursor-pointer items-center gap-2 px-4 py-2 font-light hover:bg-gray-100 dark:hover:bg-zinc-700">
                        <FaEdit className="h-4 w-4" />
                        แก้ไข
                      </li>
                      <li className="flex cursor-pointer items-center gap-2 px-4 py-2 font-light text-red-600 hover:bg-gray-100 dark:text-red-400 dark:hover:bg-zinc-700">
                        <RiDeleteBin6Line className="h-4 w-4" /> ลบ
                      </li>
                    </ul>
                  </div>
                )}
              </div>
            </div>

            <p className="truncate text-xs text-gray-500 dark:text-gray-400 md:text-sm">
              chayakorn_po65@live.rmutl.ac.th
            </p>

            <div className="mt-2 flex flex-col items-start gap-2 sm:flex-row sm:items-center">
              <div className="order-2 flex items-center gap-1 whitespace-nowrap py-1 text-xs text-business1 dark:text-blue-500 sm:order-1">
                <IoIosCalendar />
                25 สิงหาคม 2567
              </div>
              <div className="order-1 w-full sm:order-2 sm:w-auto sm:min-w-0 sm:flex-1">
                <div className="w-full max-w-[140px] truncate rounded-full bg-business1 px-3 py-1 text-xs font-light text-white">
                  ภาระงานทำนุบำรุงศิลปวัฒนธรรม
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="divider-gray divider my-0"></div>
      <p className="mb-4 line-clamp-3 text-xs font-light text-gray-400 md:text-sm">
        Lorem ipsum dolor, sit amet consectetur adipisicing elit.
        Exercitationem, expedita quisquam nulla itaque amet veniam quae,
        reprehenderit consectetur quibusdam, dolorum quos ad iusto molestiae
        quasi. Ullam reprehenderit quibusdam minima beatae?
      </p>
      <div className="flex items-center justify-between rounded-b-md">
        <div className="flex items-center gap-1">
          <PiFileDuotone className="md:h-5 md:w-5" />
          <p className="flex items-center gap-2 text-xs font-light md:text-sm">
            จำนวนไฟล์ที่แนบแล้ว<span>22</span>
          </p>
        </div>
        <button className="rounded-md bg-business1 px-4 py-2 text-xs font-light text-white md:text-sm">
          ดูเพิ่มเติม
        </button>
      </div>
    </div>
  )
}

export default Postcard
