'use client'
import React from 'react'
import Link from 'next/link'
import useUtility from '@/hooks/useUtility'
import { Breadcrumb } from '@/Types/breadcrumb'
import { ChevronRight } from 'lucide-react'

export default function BreadcrumbNav() {
  const { breadcrumbs } = useUtility()

  if (!breadcrumbs || breadcrumbs.length === 0) {
    return null
  }

  const getDisplayBreadcrumbs = () => {
    if (breadcrumbs.length <= 3) {
      return breadcrumbs
    }
    // ถ้ามีมากกว่า 3 อัน ให้แสดง: first / ... / second-to-last / last
    const first = breadcrumbs[0]
    const secondToLast = breadcrumbs[breadcrumbs.length - 2]
    const last = breadcrumbs[breadcrumbs.length - 1]
    return [
      first,
      { text: "...", path: "", isEllipsis: true },
      secondToLast,
      last
    ]
  }

  const displayBreadcrumbs = getDisplayBreadcrumbs()
  const currentBreadcrumb = breadcrumbs[breadcrumbs.length - 1]
  const previousBreadcrumb =
    breadcrumbs.length > 1 ? breadcrumbs[breadcrumbs.length - 2] : null

  return (
    <div className="breadcrumbs truncate p-0 text-sm dark:text-gray-200">
      {/* แสดงแค่ currentBreadcrumb บนหน้าจอขนาดเล็ก */}
      <div className="flex items-center justify-center space-x-2 md:hidden">
        {previousBreadcrumb && (
          previousBreadcrumb.path === 'back-to-selection' ? (
            <button
              onClick={() => {
                window.dispatchEvent(new CustomEvent('breadcrumb-back-to-selection'))
              }}
            >
              <ChevronRight className="h-5 w-5 rotate-180 text-business1 dark:text-blue-500" />
            </button>
          ) : (
            <Link href={previousBreadcrumb.path}>
              <ChevronRight className="h-5 w-5 rotate-180 text-business1 dark:text-blue-500" />
            </Link>
          )
        )}
        <p className="text-lg text-business1 dark:text-blue-500 max-w-[180px] truncate">
          {currentBreadcrumb?.text}
        </p>

      </div>

      {/* แสดง breadcrumb เต็มบนหน้าจอขนาด md */}
      <div className="hidden md:block">
        <ul className="flex items-center space-x-0">
          {displayBreadcrumbs.map((item, index) => (
            <li key={item.text + index} className="flex items-center">
              {index > 0 && <span className="text-gray-400"><ChevronRight />{' '}</span>}
              {/* ถ้าเป็น ellipsis ให้แสดงเป็นข้อความธรรมดา */}
              {(item as any).isEllipsis ? (
                <span className="text-lg text-gray-400">{item.text}</span>
              ) : item.path && index < displayBreadcrumbs.length - 1 ? (
                item.path === 'back-to-selection' ? (
                  <button
                    onClick={() => {
                      window.dispatchEvent(new CustomEvent('breadcrumb-back-to-selection'))
                    }}
                    className="text-lg text-gray-500 hover:underline dark:text-gray-400 cursor-pointer"
                  >
                    {item.text}
                  </button>
                ) : (
                  <Link href={item.path}>
                    <p className="text-lg text-gray-500 hover:underline dark:text-gray-400 cursor-pointer">
                      {item.text}
                    </p>
                  </Link>
                )
              ) : (
                <p className="text-lg text-business1 dark:text-blue-500">{item.text}</p>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
