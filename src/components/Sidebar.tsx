'use client'
import { usePathname } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { jwtDecode } from 'jwt-decode'
import { useState, useEffect } from 'react'
import ppLogo from '../../public/busi.png'
import { useRouter } from 'next/navigation'
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
} from 'lucide-react'
import { useSession } from 'next-auth/react'
import { useAssessor } from '@/hooks/useAssessor'

interface DecodedToken {
  level_name: string
  id: number
}
interface Round {
  round_list_id: number
  round_list_name: string
  year: number
  round: number
  date_start: string
  date_end: string
}

interface Assessor {
  as_id: number
  as_u_id: number
  as_round_list_id: number
  as_status: string
  ex_u_id: number
  ex_u_fname: string
  ex_u_lname: string
}
const adminMenuItems = [
  {
    title: 'หน้าหลัก',
    items: [
      { id: 1, label: 'แดชบอร์ด', icon: LayoutDashboard, href: '/admin' },
      { id: 2, label: 'ข้อมูลส่วนตัว', icon: User, href: '/admin/profile' },
    ],
  },
  {
    title: 'หลักฐานภาระงาน',
    items: [
      {
        id: 1,
        label: 'ไฟล์หลักฐานภาระงาน',
        icon: Package,
        href: '/admin/topicpost',
      },
    ],
  },
  {
    title: 'บุคลากร',
    items: [
      {
        id: 1,
        label: 'รายชื่อบุคลากร',
        icon: BookUser,
        href: '/admin/personal-list',
      },
    ],
  },
  {
    title: 'ข้อมูลรอบการประเมินภาระงาน',
    items: [
      {
        id: 1,
        label: 'รอบประเมินภาระงาน',
        icon: CalendarClock,
        href: '/admin/set-assessor',
      },
    ],
    // ผู้ตรวจประเมินภาระงาน
  },
  {
    title: 'ข้อมูลมาสเตอร์',
    items: [
      { id: 1, label: 'คำนำหน้า', icon: CircleHelp, href: '/admin/prefix' },
      { id: 2, label: 'ตำแหน่งวิชาการ', icon: Armchair, href: '/admin/position' },
      { id: 3, label: 'ตำแหน่งบริหาร', icon: Sofa, href: '/admin/ex-position' },
      { id: 4, label: 'สาขา', icon: GraduationCap, href: '/admin/branch' },
      { id: 5, label: 'หลักสูตร', icon: LibraryBigIcon, href: '/admin/course' },
      { id: 6, label: 'ประเภทบุคลากร', icon: UserPen,href: '/admin/personal-type' },
      // { id: 7, label: 'ระดับผู้ใช้งาน', icon: CircleUser, href: '/admin/user-level' },
      // { id: 8, label: 'รอบการประเมิน', icon: Calendar, href: '/admin/round' },
    ],
  },
  {
    title: 'ฟอร์มประเมินภาระงาน',
    items: [
      { id: 1, label: 'ฟอร์มประเมินภาระงาน', icon: BookCopy, href: '/admin' },
    ],
  },
  {
    title: 'อันดับ',
    items: [
      { id: 1, label: 'อันดับคะแนนภาระงาน', icon: ListOrdered, href: '/admin' },
    ],
  },
]

// Base user menu items without assessor-specific items
const baseUserMenuItems = [
  {
    title: 'หน้าหลัก',
    items: [
      { id: 1, label: 'แดชบอร์ด', icon: LayoutDashboard, href: '/user' },
      { id: 2, label: 'ข้อมูลส่วนตัว', icon: User, href: '/user/profile' },
      {
        id: 3,
        label: 'ฟอร์มประเมินภาระงาน',
        icon: NotepadText,
        href: '/user/workload_round',
      },
      {
        id: 4,
        label: 'ประวัติการประเมิน',
        icon: ChartColumn,
        href: '/user/workload_form_history',
      },
    ],
  },
]

const assessorMenuItem = {
  title: 'การประเมิน',
  items: [
    {
      id: 1,
      label: 'ตรวจประเมินภาระงาน',
      icon: ClipboardCheck,
      href: '/user/assessment',
    },
  ],
}

interface SidebarProps {
  OpenSidebar: boolean
  setOpenSidebar: (value: boolean) => void
}

export default function Sidebar({ OpenSidebar, setOpenSidebar }: SidebarProps) {
  const pathname = usePathname()
  const { data: session } = useSession()
  const [menuItems, setMenuItems] = useState(adminMenuItems)
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  
  // ใช้ hook สำหรับจัดการ assessor data
  const { isAssessor, loading: assessorLoading } = useAssessor()

  useEffect(() => {
    const token = session?.accessToken
    if (token) {
      try {
        const decoded: DecodedToken = jwtDecode(token)
        
        console.log('🔍 Sidebar - User Info:', {
          userId: decoded.id,
          levelName: decoded.level_name,
          isAssessor: isAssessor,
          assessorLoading: assessorLoading
        })

        // ใช้ข้อมูลจาก useAssessor hook แทนการเรียก API
        if (decoded.level_name === 'ผู้ดูแลระบบ') {
          console.log('✅ User is Admin - showing admin menu')
          setMenuItems(adminMenuItems)
        } else if (decoded.level_name === 'ผู้ใช้งานทั่วไป') {
          if (isAssessor) {
            console.log('✅ User is Assessor - showing assessor menu')
            setMenuItems([...baseUserMenuItems, assessorMenuItem])
          } else {
            console.log('❌ User is not Assessor - showing basic user menu')
            setMenuItems(baseUserMenuItems)
          }
        } else {
          console.log('❓ Unknown user level:', decoded.level_name)
          setMenuItems(baseUserMenuItems)
        }
        
        setLoading(false)
      } catch (error) {
        console.error('❌ Invalid token', error)
        setLoading(false)
      }
    } else {
      console.log('❌ No access token found')
    }
  }, [session, isAssessor])

  // useEffect สำหรับ check current round (ถ้าต้องการ)
  // ตอนนี้ใช้ข้อมูลจาก useAssessor hook แทน


  return (
    <aside
      className={`fixed left-0 top-0 z-40 h-full overflow-x-hidden bg-white shadow transition-all duration-300 ease-in-out md:relative ${OpenSidebar ? 'w-64' : 'w-0 md:w-20'} ${OpenSidebar ? 'translate-x-0' : '-translate-x-full md:translate-x-0'} dark:bg-zinc-900 dark:text-gray-200`}
    >
      <nav className="flex h-full flex-col overflow-x-hidden">
        <div className="flex items-center justify-between overflow-x-hidden p-4">
          <Link
            href="/admin"
            className="flex items-center gap-2 overflow-hidden"
          >
            <Image
              src={ppLogo || '/placeholder.svg'}
              alt="Logo"
              width={47}
              priority={true}
              className="min-w-[47px]"
            />
            <div
              className={`transition-all ${OpenSidebar ? 'w-full opacity-100' : 'w-0 opacity-0'}`}
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

        {loading && OpenSidebar && (
          <div className="mx-4 mb-2">
            <div className="h-6 w-24 animate-pulse rounded bg-gray-200 dark:bg-zinc-700"></div>
          </div>
        )}

        <ul className="no-scrollbar flex-1 space-y-2 overflow-y-auto overflow-x-hidden px-4 py-2">
          {loading
            ? // Skeleton loading UI
              Array(5)
                .fill(0)
                .map((_, index) => (
                  <li key={`skeleton-${index}`}>
                    <div className={`${OpenSidebar ? '' : ''}`}>
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
            : // Actual menu items
              menuItems.map((item, index) => (
                <li key={index}>
                  <div className={`${OpenSidebar ? '' : ''}`}>
                    {OpenSidebar ? (
                      <div className="translate-x-0 transform py-1 opacity-100 transition-all duration-300 ease-in-out">
                        <h2 className="truncate text-nowrap text-sm font-semibold text-gray-500">
                          {item.title}
                        </h2>
                      </div>
                    ) : (
                      <div className="-translate-x-4 transform px-2 py-1 opacity-0 transition-all duration-300 ease-in-out md:translate-x-0 md:opacity-100">
                        <div className="mx-auto my-1.5 h-2 w-full max-w-[6rem] rounded-full bg-zinc-500"></div>
                      </div>
                    )}
                  </div>

                  <ul>
                    {item.items.map((item) => (
                      <li key={item.id}>
                        <Link
                          href={item.href}
                          onClick={() =>
                            window.innerWidth < 768 && setOpenSidebar(false)
                          }
                          className={`ransition-colors my-2 flex cursor-pointer items-center overflow-hidden rounded-md border-2 py-1 pl-3 pr-4 text-sm font-light ${
                            pathname === item.href ||
                            (item.href !== '/admin' &&
                              item.href !== '/user' &&
                              pathname.startsWith(`${item.href}/`))
                              ? 'bg-business1 text-white dark:border-white dark:text-white'
                              : 'border-transparent text-gray-400 hover:text-business1 dark:hover:text-white'
                          }`}
                        >
                          <item.icon
                            className={`my-1 h-5 w-5 min-w-[20px] ${
                              pathname === item.href ||
                              (item.href !== '/admin' &&
                                item.href !== '/user' &&
                                pathname.startsWith(`${item.href}/`))
                                ? 'text-white dark:text-white'
                                : ''
                            }`}
                          />
                          <span
                            className={`ml-3 truncate whitespace-nowrap ${OpenSidebar ? 'w-40 opacity-100' : 'w-0 opacity-0'}`}
                          >
                            {item.label}
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
        </ul>

        <div className="my-2 overflow-x-hidden border-t px-4">
          {loading ? (
            <div className="item relative">
              <div className="flex items-center overflow-hidden rounded-md py-2 pl-3 pr-4">
                <div className="h-5 w-5 min-w-[20px] animate-pulse rounded bg-gray-200 dark:bg-zinc-700"></div>
                {OpenSidebar && (
                  <div className="ml-3 h-4 w-16 animate-pulse rounded bg-gray-200 dark:bg-zinc-700"></div>
                )}
              </div>
            </div>
          ) : null}
        </div>
      </nav>
    </aside>
  )
}
