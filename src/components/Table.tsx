'use client'
import type React from 'react'
import { Loader, ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react'
import Pagination from './Pagination'

export interface TableColumn<T = any> {
  key: string
  label: string
  width?: string
  align?: 'left' | 'center' | 'right'
  sortable?: boolean
  render?: (value: any, row: T, index: number) => React.ReactNode
}

export type SortOrder = 'asc' | 'desc' | null

export interface SortState {
  column: string | null
  order: SortOrder
}

export interface TableProps<T = any> {
  data: T[]
  columns: TableColumn<T>[]
  loading?: boolean
  total?: number
  currentPage?: number
  totalPages?: number
  rowsPerPage?: number
  onPageChange?: (page: number) => void
  onRowsPerPageChange?: (rowsPerPage: number) => void
  emptyMessage?: string
  searchPlaceholder?: string
  searchValue?: string
  onSearchChange?: (value: string) => void
  showSearch?: boolean
  stickyColumns?: number // Number of columns to make sticky from right
  className?: string
  skeletonRows?: number
  // Sorting props
  sortable?: boolean
  sortState?: SortState
  onSort?: (column: string, order: SortOrder) => void
  // Rows per page options
  rowsPerPageOptions?: number[]
}

function Table<T extends Record<string, any>>({
  data,
  columns,
  loading = true,
  total = 0,
  currentPage = 1,
  totalPages = 1,
  rowsPerPage = 10,
  onPageChange,
  onRowsPerPageChange,
  emptyMessage = 'ไม่พบข้อมูล',
  searchPlaceholder = 'ค้นหา...',
  searchValue = '',
  onSearchChange,
  showSearch = false,
  stickyColumns = 0,
  className = '',
  skeletonRows = 5,
  sortable = false,
  sortState = { column: null, order: null },
  onSort,
  rowsPerPageOptions = [10, 20, 50, 100, 200],
}: TableProps<T>) {
  const handleSort = (column: string) => {
    if (!sortable || !onSort) return
    
    const columnConfig = columns.find(col => col.key === column)
    if (!columnConfig?.sortable) return

    let newOrder: SortOrder = 'asc'
    if (sortState.column === column) {
      if (sortState.order === 'asc') {
        newOrder = 'desc'
      } else if (sortState.order === 'desc') {
        newOrder = null
      }
    }
    
    onSort(column, newOrder)
  }

  const getSortIcon = (column: string) => {
    if (!sortable) return null
    
    const columnConfig = columns.find(col => col.key === column)
    if (!columnConfig?.sortable) return null

    if (sortState.column === column) {
      if (sortState.order === 'asc') {
        return <ChevronUp className="h-4 w-4" />
      } else if (sortState.order === 'desc') {
        return <ChevronDown className="h-4 w-4" />
      }
    }
    return <ChevronsUpDown className="h-4 w-4 text-gray-400" />
  }

  const renderSkeletonRows = () => {
    return Array.from({ length: skeletonRows }, (_, index) => (
      <tr key={index} className="animate-pulse">
        {columns.map((column, colIndex) => (
          <td
            key={colIndex}
            className={`whitespace-nowrap border border-gray-300 border-opacity-40 p-4 text-center dark:border-zinc-600 ${
              stickyColumns > 0 && colIndex >= columns.length - stickyColumns
                ? 'sticky right-0 bg-white dark:bg-zinc-900'
                : ''
            }`}
          >
            <div className="h-4 bg-gray-200 rounded dark:bg-zinc-700"></div>
          </td>
        ))}
      </tr>
    ))
  }

  const renderCell = (column: TableColumn<T>, row: T, index: number) => {
    const value = row[column.key]
    
    if (column.render) {
      return column.render(value, row, index)
    }
    
    return (
      <span className="text-md font-light text-gray-500 dark:text-gray-400">
        {value || '-'}
      </span>
    )
  }

  return (
    <div className={`bg-white transition-all duration-300 ease-in-out dark:bg-zinc-900 dark:text-gray-400 ${className}`}>
      {showSearch && onSearchChange && (
        <div className="p-4 border-b border-gray-200 dark:border-zinc-600">
          <input
            className="w-full max-w-md rounded-md border-2 border-gray-300 px-4 py-2 text-sm font-light text-gray-600 transition-all duration-300 ease-in-out focus:border-blue-500 focus:outline-none dark:border-zinc-600 dark:bg-zinc-800 dark:text-gray-400"
            placeholder={searchPlaceholder}
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
      )}
      
      <div className="border transition-all duration-300 ease-in-out dark:border-zinc-600">
        <div className="overflow-x-auto">
          <table className="w-full overflow-x-auto md:table-auto">
            <thead className="bg-business1">
              <tr>
                {columns.map((column, index) => (
                  <th
                    key={column.key}
                    className={`text-nowrap border border-business1 px-4 py-3 text-sm font-normal text-white ${
                      column.align === 'center' ? 'text-center' : 
                      column.align === 'right' ? 'text-right' : 'text-left'
                    } ${
                      stickyColumns > 0 && index >= columns.length - stickyColumns
                        ? 'sticky right-0 bg-business1'
                        : ''
                    } ${
                      column.sortable && sortable
                        ? 'cursor-pointer select-none'
                        : ''
                    }`}
                    style={{ width: column.width }}
                    onClick={() => column.sortable && sortable ? handleSort(column.key) : undefined}
                  >
                    <div className={`flex items-center gap-1 ${
                      column.align === 'center' ? 'justify-center' : 
                      column.align === 'right' ? 'justify-end' : 'justify-start'
                    }`}>
                      <span>{column.label}</span>
                      {getSortIcon(column.key)}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white transition-all duration-300 ease-in-out dark:divide-zinc-600 dark:bg-zinc-900">
              {loading ? (
                renderSkeletonRows()
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="p-8 text-center">
                    <div className="text-gray-500 dark:text-gray-400 flex justify-center items-center h-40">
                      <div className="mb-2 text-md font-light">{emptyMessage}</div>
                    </div>
                  </td>
                </tr>
              ) : (
                data.map((row, index) => (
                  <tr
                    key={row.id || index}
                    className="even:bg-gray-50  dark:even:bg-zinc-800"
                  >
                    {columns.map((column, colIndex ) => (
                      <td
                        key={column.key}
                        className={`whitespace-nowrap ${column.key === 'actions' ? 'p-0' : 'p-4'} ${
                          column.align === 'center' ? 'text-center' : 
                          column.align === 'right' ? 'text-right' : 'text-left'
                        } ${
                          stickyColumns > 0 && colIndex >= columns.length - stickyColumns
                            ? `sticky right-0 ${index % 2 === 0 ? 'bg-white dark:bg-zinc-900' : 'bg-gray-50 dark:bg-zinc-800'}`
                            : ''
                        }`}
                      >
                        {renderCell(column, row, index)}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {(onPageChange || onRowsPerPageChange) && (
          <div className={`px-4 border-t border-gray-200 dark:border-zinc-600`}>
            <Pagination
              ITEMS_PER_PAGE={rowsPerPage}
              data={data}
              currentData={data}
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={(newPage) => onPageChange?.(newPage)}
              onRowsPerPageChange={onRowsPerPageChange}
              rowsPerPageOptions={rowsPerPageOptions}
              showRowsPerPageSelector={!!onRowsPerPageChange}
            />
          </div>
        )}
      </div>
    </div>
  )
}

export default Table
