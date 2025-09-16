'use client'
import React from 'react'
import Link from 'next/link'
import useUtility from '@/hooks/useUtility'
import { Breadcrumb } from '@/Types/breadcrumb'

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

  return (
    <div className="breadcrumbs truncate p-0 text-sm dark:text-gray-200">
      <ul className="flex items-center space-x-2">
        {displayBreadcrumbs.map((item, index) => (
          <li key={item.text + index} className="flex items-center">
            {/* ถ้าเป็น ellipsis ให้แสดงเป็นข้อความธรรมดา */}
            {(item as any).isEllipsis ? (
              <span className="text-lg text-gray-400">{item.text}</span>
            ) : item.path && index < displayBreadcrumbs.length - 1 ? (
              <Link href={item.path}>
                <p className="text-lg text-gray-500 hover:underline dark:text-gray-400 cursor-pointer">
                  {item.text}
                </p>
              </Link>
            ) : (
              <p className="text-lg text-business1 dark:text-blue-500">{item.text}</p>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}
