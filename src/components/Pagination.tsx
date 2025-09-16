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
  const [page, setPage] = useState(1)
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
          className="w-14 rounded border border-gray-300 bg-white px-3 py-1 text-sm text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          style={{
            backgroundColor: 'white',
            color: '#374151',
            border: '1px solid #d1d5db',
            borderRadius: '4px',
            padding: '4px 12px',
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '56px'
          }}
        >
          {ITEMS_PER_PAGE}
        </button>
        
        {isDropdownOpen && (
          <div 
            className="absolute top-full left-0 z-10 mt-1 rounded border border-gray-300 bg-white shadow-lg"
            style={{
              backgroundColor: 'white',
              border: '1px solid #d1d5db',
              borderRadius: '4px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              position: 'absolute',
              top: '100%',
              left: 0,
              zIndex: 10,
              marginTop: '4px',
              minWidth: '100%'
            }}
          >
            {rowsPerPageOptions.map((option) => (
              <button
                key={option}
                onClick={() => handleOptionClick(option)}
                className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-100 ${
                  option === ITEMS_PER_PAGE ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
                }`}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  textAlign: 'left',
                  fontSize: '14px',
                  backgroundColor: option === ITEMS_PER_PAGE ? '#eff6ff' : 'white',
                  color: option === ITEMS_PER_PAGE ? '#2563eb' : '#374151',
                  border: 'none',
                  cursor: 'pointer'
                }}
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
            <span className="text-sm text-gray-600">แสดง</span>
            <CustomDropdown />
            <span className="text-sm text-gray-600">รายการต่อหน้า</span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2">
        <button
          className={`rounded-full p-2 ${
            page <= 1
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
          className={`rounded-full p-2 ${
            page <= 1
              ? 'cursor-default text-gray-400'
              : 'cursor-pointer text-gray-600 hover:bg-gray-200'
          }`}
          onClick={() => changePage(page - 1)}
          disabled={page <= 1}
        >
          <MdKeyboardArrowLeft size={24} />
        </button>

        <span className="text-sm text-gray-600">
          หน้า <span className="font-light">{page}</span> จาก{' '}
          <span className="font-light">{totalPages}</span>
        </span>

        <button
          className={`rounded-full p-2 ${
            page >= totalPages
              ? 'cursor-default text-gray-400'
              : 'cursor-pointer text-gray-600 hover:bg-gray-200'
          }`}
          onClick={() => changePage(page + 1)}
          disabled={page >= totalPages}
        >
          <MdKeyboardArrowRight size={24} />
        </button>

        <button
          className={`rounded-full p-2 ${
            page >= totalPages
              ? 'cursor-default text-gray-400'
              : 'cursor-pointer text-gray-600 hover:bg-gray-200'
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
