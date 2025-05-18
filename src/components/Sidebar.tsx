"use client"
import { usePathname } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { jwtDecode } from "jwt-decode"
import { useState, useEffect } from "react"
import ppLogo from "../../public/busi.png"
import { useRouter } from "next/navigation"
import { LayoutDashboard, User, X, LogOut, BookUser, Package, Armchair, Sofa, GraduationCap, LibraryBigIcon, UserPen, CircleUser, Calendar, CircleHelp, BookCopy, ListOrdered, CalendarClock, NotepadText, ChartColumn } from "lucide-react"

interface DecodedToken {
  level_name: string
}

const adminMenuItems = [
  {
    title: "หน้าหลัก",
    items: [
      { id: 1, label: "แดชบอร์ด", icon: LayoutDashboard, href: "/admin" },
      { id: 2, label: "ข้อมูลส่วนตัว", icon: User, href: "/admin/profile" },
    ],
  },
  {
    title: "หลักฐานภาระงาน",
    items: [
      { id: 1, label: "ไฟล์หลักฐานภาระงาน", icon: Package, href: "/admin/topicpost" },
    ],
  },
  {
    title: "บุคลากร",
    items: [
      { id: 1, label: "รายชื่อบุคลากร", icon: BookUser, href: "/admin/personal-list" },
    ],
  },
  {
    title: "ข้อมูลรอบการประเมินภาระงาน",
    items: [
      { id: 1, label: "รอบประเมินภาระงาน", icon: CalendarClock, href: "/admin/set-assessor" },
    ],
    // ผู้ตรวจประเมินภาระงาน
  },
  {
    title: "ข้อมูลมาสเตอร์",
    items: [
      { id: 1, label: "คำนำหน้า", icon: CircleHelp, href: "/admin/prefix" },
      { id: 2, label: "ตำแหน่งวิชาการ", icon: Armchair, href: "/admin/position" },
      { id: 3, label: "ตำแหน่งบริหาร", icon: Sofa, href: "/admin/ex-position" },
      { id: 4, label: "สาขา", icon: GraduationCap, href: "/admin/branch" },
      { id: 5, label: "หลักสูตร", icon: LibraryBigIcon, href: "/admin/course" },
      { id: 6, label: "ประเภทบุคลากร", icon: UserPen, href: "/admin/personal-type" },
      { id: 7, label: "ระดับผู้ใช้งาน", icon: CircleUser, href: "/admin/user-level" },
      { id: 8, label: "รอบการประเมิน", icon: Calendar, href: "/admin/round" },
    ],
  },
  {
    title: "ฟอร์มประเมินภาระงาน",
    items: [
      { id: 1, label: "ฟอร์มประเมินภาระงาน", icon: BookCopy, href: "/admin" },
    ],
  },
  {
    title: "อันดับ",
    items: [
      { id: 1, label: "อันดับคะแนนภาระงาน", icon: ListOrdered, href: "/admin" },
    ],
  },
]

const userMenuItems = [
  {
    title: "หน้าหลัก",
    items: [
      { id: 1, label: "แดชบอร์ด", icon: LayoutDashboard, href: "/user" },
      { id: 2, label: "ข้อมูลส่วนตัว", icon: User, href: "/user/profile" },
      { id: 3, label: "ฟอร์มประเมินภาระงาน", icon: NotepadText, href: "/user/workload_form" },
      { id: 4, label: "ประวัติการประเมิน", icon: ChartColumn, href: "/user/workload_form_history" },
    ],
  },
]

const assessorMenuItems = [
  {
    title: "หน้าหลัก",
    items: [
      { id: 1, label: "แดชบอร์ด", icon: LayoutDashboard, href: "/user" },
      { id: 2, label: "ข้อมูลส่วนตัว", icon: User, href: "/user/profile" },
    ],
  },
]

const secretaryMenuItems = [
  {
    title: "หน้าหลัก",
    items: [
      { id: 1, label: "แดชบอร์ด", icon: LayoutDashboard, href: "/user" },
      { id: 2, label: "ข้อมูลส่วนตัว", icon: User, href: "/user/profile" },
    ],
  },
]

interface SidebarProps {
  OpenSidebar: boolean
  setOpenSidebar: (value: boolean) => void
}

export default function Sidebar({ OpenSidebar, setOpenSidebar }: SidebarProps) {
  const pathname = usePathname()
  const [menuItems, setMenuItems] = useState(adminMenuItems)
  const router = useRouter()
  useEffect(() => {
    const token = localStorage.getItem("token")
    if (token) {
      try {
        const decoded: DecodedToken = jwtDecode(token)
        if (decoded.level_name === "ผู้ใช้งานทั่วไป") setMenuItems(userMenuItems)
        if (decoded.level_name === "ผู้ดูแลระบบ") setMenuItems(adminMenuItems)
        if (decoded.level_name === "ผู้ประเมินภาระงาน") setMenuItems(assessorMenuItems)
        if (decoded.level_name === "เลขาณุการ") setMenuItems(secretaryMenuItems)
      } catch (error) {
        console.error("Invalid token", error)
      }
    }
  }, [])

  const habdleLogout = async () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    localStorage.removeItem("level")
    router.push("/")
  }

  return (
    <aside
      className={`fixed top-0 left-0 h-full z-40 bg-white shadow md:relative
        transition-all duration-300 ease-in-out overflow-x-hidden
        ${OpenSidebar ? "w-64" : "w-0 md:w-20"}
        ${OpenSidebar ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        dark:bg-zinc-900 dark:text-gray-200`}
    >
      <nav className="h-full flex flex-col overflow-x-hidden">
        <div className="flex items-center justify-between p-4 overflow-x-hidden">
          <Link href="/admin" className="flex items-center gap-2 overflow-hidden">
            <Image src={ppLogo || "/placeholder.svg"} alt="Logo" width={47} priority={true} className="min-w-[47px]" />
            <div className={`transition-all ${OpenSidebar ? "opacity-100 w-full" : "opacity-0 w-0"}`}>
              <p className="text-[14px] font-light text-gray-600 dark:text-white whitespace-nowrap">
                ระบบประเมินภาระงานบุคลากร
              </p>
              <p className="text-[13px] font-light text-business1 dark:text-blue-500 whitespace-nowrap">
                คณะบริหารธุรกิจและศิลปศาสตร์
              </p>
            </div>
          </Link>
          {OpenSidebar && (
            <button
              onClick={() => setOpenSidebar(false)}
              className="p-1.5 rounded-lg bg-gray-50 hover:bg-gray-300 md:hidden dark:bg-zinc-900 flex-shrink-0"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        <ul className="flex-1 px-4 py-2 space-y-2 overflow-y-auto overflow-x-hidden no-scrollbar">
          {menuItems.map((item, index) => (
            <li key={index}>
              <div className={`${OpenSidebar ? "" : ""}`}>
                {OpenSidebar ? (
                  <div className="py-1 transition-all duration-300 ease-in-out opacity-100 transform translate-x-0">
                    <h2 className="text-sm font-semibold text-gray-500 text-nowrap truncate">{item.title}</h2>
                  </div>
                ) : (
                  <div className="px-2 py-1 transition-all duration-300 ease-in-out opacity-0 transform -translate-x-4 md:opacity-100 md:translate-x-0">
                    <div className="my-1.5 h-2 w-full max-w-[6rem] rounded-full bg-zinc-500 mx-auto"></div>
                  </div>
                )}
              </div>

              <ul>
                {item.items.map((item) => (
                  <li key={item.id}>
                    <Link
                      href={item.href}
                      onClick={() => window.innerWidth < 768 && setOpenSidebar(false)}
                      className={`flex text-sm items-center pl-3 pr-4 py-1 my-2 rounded-md cursor-pointer overflow-hidden border-2 ransition-colors font-light
                        ${pathname === item.href || (item.href !== "/admin" && item.href !== "/user" && pathname.startsWith(`${item.href}/`))
                          ? "text-white bg-business1 dark:text-white dark:border-white"
                          : "text-gray-400 hover:text-business1 dark:hover:text-white border-transparent"
                        }`}
                    >
                      <item.icon
                        className={`w-5 h-5 min-w-[20px] my-1 ${pathname === item.href || (item.href !== "/admin" && item.href !== "/user" && pathname.startsWith(`${item.href}/`))
                          ? "text-white dark:text-white"
                          : ""
                          }`}
                      />
                      <span
                        className={`ml-3 whitespace-nowrap truncate
                          ${OpenSidebar ? "opacity-100 w-40" : "opacity-0 w-0"}`}
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

        <div className="border-t px-4 my-2 overflow-x-hidden">
          <div className="item relative">
            <button onClick={habdleLogout} className="block">
              <div className="flex items-center pl-3 pr-4 py-2 text-gray-400 hover:text-red-500 rounded-md cursor-pointer overflow-hidden">
                <LogOut className="w-5 h-5 min-w-[20px] rotate-180" />
                <span
                  className={`pl-3 text-left  whitespace-nowrap transition-all  
                  ${OpenSidebar ? "opacity-100 w-40 " : "opacity-0 w-0"}`}
                >
                  ออกจากระบบ
                </span>
              </div>
            </button>
          </div>
        </div>
      </nav>
    </aside>
  )
}

