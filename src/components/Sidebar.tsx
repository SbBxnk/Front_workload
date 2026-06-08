'use client'

import { usePathname } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { useDispatch, useSelector } from 'react-redux'
import ppLogo from '../../public/busi.png'
import {
  LayoutDashboard,
  User,
  X,
  BookUser,
  Package,
  Armchair,
  Sofa,
  GraduationCap,
  LibraryBigIcon,
  PenIcon as UserPen,
  CircleUser,
  Calendar,
  CircleHelp,
  BookCopy,
  ListOrdered,
  CalendarClock,
  NotepadText,
  BarChartIcon as ChartColumn,
  ClipboardCheck,
  LayoutList,
  Logs,
  CheckSquare,
  BicepsFlexed,
  Sheet,
  ShieldCheck,
  type LucideIcon,
} from 'lucide-react'
import type { AppDispatch, RootState } from '@/stores'
import { setSidebarMode } from '@/stores/features/sidebar'
import { cn } from '@/lib/utils'

// ---------------------------------------------------------------------------
// Icon registry — maps Lucide name strings (from API) to icon components
// ---------------------------------------------------------------------------
const ICON_MAP: Record<string, LucideIcon> = {
  LayoutDashboard,
  User,
  X,
  BookUser,
  Package,
  Armchair,
  Sofa,
  GraduationCap,
  LibraryBigIcon,
  UserPen,
  CircleUser,
  Calendar,
  CircleHelp,
  BookCopy,
  ListOrdered,
  CalendarClock,
  NotepadText,
  ChartColumn,
  ClipboardCheck,
  LayoutList,
  Logs,
  CheckSquare,
  BicepsFlexed,
  Sheet,
  ShieldCheck,
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface SidebarProps {
  OpenSidebar: boolean
  setOpenSidebar: (value: boolean) => void
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export default function Sidebar({ OpenSidebar, setOpenSidebar }: SidebarProps) {
  const pathname = usePathname()
  const dispatch = useDispatch<AppDispatch>()

  const { menus, isAdmin, loaded: sidebarLoaded, sidebarMode } = useSelector(
    (state: RootState) => state.sidebar
  )

  const handleModeToggle = () => {
    dispatch(setSidebarMode(sidebarMode === 'workload' ? 'landing' : 'workload'))
  }

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 h-full overflow-x-hidden bg-white shadow transition-all duration-300 ease-in-out md:relative dark:bg-zinc-900 dark:text-gray-200',
        OpenSidebar ? 'w-64' : 'w-0 md:w-20',
        OpenSidebar ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      )}
    >
      <nav className="flex h-full flex-col overflow-x-hidden">
        {/* Header: logo + close button */}
        <div className="flex items-center justify-between overflow-x-hidden p-4">
          <Link href="/admin" className="flex items-center gap-2 overflow-hidden">
            <Image
              src={ppLogo || '/placeholder.svg'}
              alt="Logo"
              width={47}
              priority={true}
              className="min-w-[47px]"
            />
            <div
              className={cn(
                'transition-all',
                OpenSidebar ? 'w-full opacity-100' : 'w-0 opacity-0'
              )}
            >
              <p className="whitespace-nowrap text-[14px] font-light text-gray-600 dark:text-white">
                ระบบประเมินภาระงานบุคลากร
              </p>
              <p className="whitespace-nowrap text-[13px] font-light text-business1 dark:text-blue-500">
                คณะบริหารธุรกิจและศิลปศาสตร์
              </p>
            </div>
          </Link>

          {OpenSidebar && (
            <button
              onClick={() => setOpenSidebar(false)}
              className="flex-shrink-0 rounded-lg bg-gray-50 p-1.5 hover:bg-gray-300 dark:bg-zinc-900 md:hidden"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Admin mode toggle pill — only shown when isAdmin and sidebar is expanded */}
        {isAdmin && OpenSidebar && sidebarLoaded && (
          <div className="mx-4 mb-3">
            <button
              onClick={handleModeToggle}
              className={cn(
                'flex w-full items-center justify-center rounded-full px-3 py-1.5 text-xs font-medium transition-colors',
                sidebarMode === 'workload'
                  ? 'bg-business1 text-white hover:bg-business1/90'
                  : 'bg-business2 text-white hover:bg-business2/90'
              )}
            >
              {sidebarMode === 'workload' ? 'หน้าระบบ' : 'หน้าเว็บไซต์'}
            </button>
          </div>
        )}

        {/* Skeleton placeholder shown while menus haven't loaded */}
        {!sidebarLoaded && OpenSidebar && (
          <div className="mx-4 mb-2">
            <div className="h-6 w-24 animate-pulse rounded bg-gray-200 dark:bg-zinc-700"></div>
          </div>
        )}

        <ul className="no-scrollbar flex-1 space-y-2 overflow-y-auto overflow-x-hidden px-4 py-2">
          {!sidebarLoaded
            ? // Skeleton loading UI
              Array(5)
                .fill(0)
                .map((_, index) => (
                  <li key={`skeleton-${index}`}>
                    <div>
                      {OpenSidebar ? (
                        <div className="translate-x-0 transform py-1 opacity-100 transition-all duration-300 ease-in-out">
                          <div className="h-4 w-24 animate-pulse rounded bg-gray-200 dark:bg-zinc-700"></div>
                        </div>
                      ) : (
                        <div className="-translate-x-4 transform px-2 py-1 opacity-0 transition-all duration-300 ease-in-out md:translate-x-0 md:opacity-100">
                          <div className="mx-auto my-1.5 h-2 w-full max-w-[6rem] animate-pulse rounded-full bg-gray-200 dark:bg-zinc-700"></div>
                        </div>
                      )}
                    </div>

                    <ul>
                      {Array(3)
                        .fill(0)
                        .map((_, itemIndex) => (
                          <li key={`skeleton-item-${itemIndex}`}>
                            <div className="my-2 flex items-center overflow-hidden rounded-md border-2 border-transparent py-1 pl-3 pr-4 text-sm">
                              <div className="my-1 h-5 w-5 min-w-[20px] animate-pulse rounded bg-gray-200 dark:bg-zinc-700"></div>
                              {OpenSidebar && (
                                <div className="ml-3 h-4 w-24 animate-pulse rounded bg-gray-200 dark:bg-zinc-700"></div>
                              )}
                            </div>
                          </li>
                        ))}
                    </ul>
                  </li>
                ))
            : // Actual menu items from Redux
              menus.map((group, index) => {
                return (
                  <li key={index}>
                    <div>
                      {OpenSidebar ? (
                        <div className="translate-x-0 transform py-1 opacity-100 transition-all duration-300 ease-in-out">
                          <h2 className="truncate text-nowrap text-sm font-semibold text-gray-500">
                            {group.title}
                          </h2>
                        </div>
                      ) : (
                        <div className="-translate-x-4 transform px-2 py-1 opacity-0 transition-all duration-300 ease-in-out md:translate-x-0 md:opacity-100">
                          <div className="mx-auto my-1.5 h-2 w-full max-w-[6rem] rounded-full bg-zinc-500"></div>
                        </div>
                      )}
                    </div>

                    <ul>
                      {group.items.map((item) => {
                        const IconComp = ICON_MAP[item.icon] ?? CircleHelp
                        const isActive =
                          pathname === item.href ||
                          (item.href !== '/admin' &&
                            item.href !== '/user' &&
                            pathname.startsWith(`${item.href}/`))

                        return (
                          <li key={item.id}>
                            <Link
                              href={item.href}
                              onClick={() =>
                                window.innerWidth < 768 && setOpenSidebar(false)
                              }
                              className={cn(
                                'my-2 flex cursor-pointer items-center overflow-hidden rounded-md border-2 py-1 pl-3 pr-4 text-sm font-light transition-colors',
                                isActive
                                  ? 'bg-business1 text-white dark:border-white dark:text-white'
                                  : 'border-transparent text-gray-400 hover:text-business1 dark:hover:text-white'
                              )}
                            >
                              <IconComp
                                className={cn(
                                  'my-1 h-5 w-5 min-w-[20px]',
                                  isActive ? 'text-white dark:text-white' : ''
                                )}
                              />
                              <span
                                className={cn(
                                  'ml-3 truncate whitespace-nowrap',
                                  OpenSidebar ? 'w-40 opacity-100' : 'w-0 opacity-0'
                                )}
                              >
                                {item.label}
                              </span>
                            </Link>
                          </li>
                        )
                      })}
                    </ul>
                  </li>
                )
              })}
        </ul>
      </nav>
    </aside>
  )
}
