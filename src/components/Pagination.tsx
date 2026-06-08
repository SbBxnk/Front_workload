'use client'
import React, { useState, useEffect, useRef } from 'react'
import {
  MdKeyboardArrowRight,
  MdKeyboardArrowLeft,
  MdKeyboardDoubleArrowLeft,
  MdKeyboardDoubleArrowRight,
  MdKeyboardArrowDown,
} from 'react-icons/md'

interface PaginationProps {
  totalPages: number
  currentPage: number
  onPageChange: (page: number) => void
  currentData: unknown[]
  data: unknown[]
  ITEMS_PER_PAGE: number
  onRowsPerPageChange?: (rowsPerPage: number) => void
  rowsPerPageOptions?: number[]
  showRowsPerPageSelector?: boolean
}

export default function Pagination({
  totalPages,
  onPageChange,
  currentData,
  data,
  currentPage,
  ITEMS_PER_PAGE,
  onRowsPerPageChange,
  rowsPerPageOptions = [5, 10, 20, 50, 100],
  showRowsPerPageSelector = false,
}: PaginationProps) {
  const [page, setPage] = useState(currentPage || 1)

  useEffect(() => {
    if (currentPage !== page) {
      setPage(currentPage)
    }
  }, [currentPage])
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const CustomDropdown = () => {
    const handleOptionClick = (value: number) => {
      onRowsPerPageChange?.(value)
      setIsDropdownOpen(false)
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
    }

    useEffect(() => {
      document.addEventListener('mousedown', handleClickOutside)
      return () => {
        document.removeEventListener('mousedown', handleClickOutside)
      }
    }, [])

    return (
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="flex w-14 items-center justify-center rounded border border-gray-300 bg-white px-3 py-1 text-sm text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-zinc-800 dark:text-white dark:hover:bg-zinc-700"
        >
          {ITEMS_PER_PAGE}
        </button>

        {isDropdownOpen && (
          <div className="absolute top-full left-0 z-10 mt-1 min-w-full rounded border border-gray-300 bg-white shadow-lg dark:border-gray-700 dark:bg-zinc-800">
            {rowsPerPageOptions.map((option) => (
              <button
                key={option}
                onClick={() => handleOptionClick(option)}
                className={`w-full px-3 py-2 text-left text-sm ${option === ITEMS_PER_PAGE
                    ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                    : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-zinc-700'
                  }`}
              >
                {option}
              </button>
            ))}
          </div>
        )}
      </div>
    )
  }

  const changePage = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage)
      onPageChange(newPage)
    }
  }

  useEffect(() => {
    if (page > totalPages) {
      setPage(1)
    }
  }, [currentData, page, totalPages])

  return (
    <div className="flex w-full flex-col items-center justify-between gap-4 pb-4 first:pt-4 md:flex-row">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-4">
        {showRowsPerPageSelector && onRowsPerPageChange && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600 dark:text-white">แสดง</span>
            <CustomDropdown />
            <span className="text-sm text-gray-600 dark:text-white">รายการต่อหน้า</span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2">
        <button
          className={`rounded-full p-2 ${page <= 1
              ? 'cursor-default text-gray-400'
              : 'cursor-pointer text-gray-600 hover:bg-gray-200'
            }`}
          style={{
            color: page <= 1 ? '#9ca3af' : '#4b5563',
            backgroundColor: 'transparent'
          }}
          onClick={() => changePage(1)}
          disabled={page <= 1}
        >
          <MdKeyboardDoubleArrowLeft size={24} />
        </button>
        <button
          className={`rounded-full p-2 ${page <= 1
              ? 'cursor-default text-gray-400'
              : 'cursor-pointer text-gray-600 hover:bg-gray-200'
            }`}
          onClick={() => changePage(page - 1)}
          disabled={page <= 1}
        >
          <MdKeyboardArrowLeft size={24} />
        </button>

        <span className="text-sm text-gray-600 dark:text-white">
          หน้า <span className="font-light">{page}</span> จาก{' '}
          <span className="font-light">{totalPages}</span>
        </span>

        <button
          className={`rounded-full p-2 ${page >= totalPages
              ? 'cursor-default text-gray-400 dark:text-white'
              : 'cursor-pointer text-gray-600 hover:bg-gray-200 dark:text-white'
            }`}
          onClick={() => changePage(page + 1)}
          disabled={page >= totalPages}
        >
          <MdKeyboardArrowRight size={24} />
        </button>

        <button
          className={`rounded-full p-2 ${page >= totalPages
              ? 'cursor-default text-gray-400 dark:text-white'
              : 'cursor-pointer text-gray-600 hover:bg-gray-200 dark:text-white'
            }`}
          onClick={() => changePage(totalPages)}
          disabled={page >= totalPages}
        >
          <MdKeyboardDoubleArrowRight size={24} />
        </button>
      </div>
    </div>
  )
}
