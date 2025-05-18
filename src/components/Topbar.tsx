"use client"

import { useState, useEffect } from "react"
import { useParams, usePathname } from "next/navigation"
import Image from "next/image"
import { jwtDecode } from "jwt-decode"
import { useTheme } from "../provider/themeContext"
import { Menu, Moon, SunMedium } from "lucide-react"
import Breadcrumb from "./Breadcrumb"
import axios from "axios"

interface UserLoginData {
  u_fname: string
  u_lname: string
  level_name: string
  u_img: string
}

interface TopbarProps {
  setOpenSidebar: (value: boolean) => void
  OpenSidebar: boolean
  handleProfile: () => void
}

interface MainTaskDetail {
  task_name: string
  task_id: number
}

export default function Topbar({ setOpenSidebar, OpenSidebar, handleProfile }: TopbarProps) {
  const [currentDateTime, setCurrentDateTime] = useState<Date | null>(null)
  const { isDarkMode, toggleTheme } = useTheme()
  const [user, setUser] = useState<UserLoginData | null>(null)

  const pathname = usePathname()
  const params = useParams()
  const task_id = params.task_id // รับ task_id จาก URL
  const round_list_id = params.round_list_id // รับ round_list_id จาก URL
  const ex_u_id = params.ex_u_id // รับ ex_u_id จาก URL
  const [taskName, setTaskName] = useState<MainTaskDetail>({ task_id: 0, task_name: "" })
  const [isLoading, setIsLoading] = useState(false)

  // Update the current time every second
  useEffect(() => {
    setCurrentDateTime(new Date())
    const timer = setInterval(() => setCurrentDateTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  // Fetch the task name based on the task_id
  useEffect(() => {
    const fetchTaskName = async () => {
      if (!task_id) {
        console.log("Task ID is not available")
        return
      }

      setIsLoading(true)
      try {
        const response = await axios.get<{ data: MainTaskDetail }>(
          `${process.env.NEXT_PUBLIC_API}/maintask/${task_id}`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          },
        )
        console.log("API response:", response)
        if (response.data && response.data.data.task_name) {
          setTaskName(response.data.data)
        } else {
          setTaskName({ task_id: 0, task_name: "ไม่พบข้อมูล" })
        }
      } catch (error) {
        console.error("Error fetching task name:", error)
        setTaskName({ task_id: 0, task_name: "ไม่สามารถโหลดข้อมูลได้" })
      } finally {
        setIsLoading(false)
      }
    }

    fetchTaskName()
  }, [task_id])

  // Fetch user info from JWT token
  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token")
      if (token) {
        try {
          const decoded: UserLoginData = jwtDecode(token)
          setUser(decoded)
        } catch (error) {
          console.error("JWT Decode Error:", error)
        }
      }
      setIsLoading(false)
    }
  }, [])

  // Format the current date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("th-TH", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const formattedDate = formatDate(String(currentDateTime))

  // Static page titles
  const TitlePage: Record<string, string> = {
    // ผู้ดูแลระบบ
    "/admin": "หน้าหลัก",
    "/admin/profile": "ข้อมูลส่วนตัว",
    "/admin/member": "สมาชิก",
    "/admin/settings": "การตั้งค่า",
    "/admin/topicpost": "จัดการไฟล์หลักฐานภาระงาน",
    "/admin/personal-list": "บุคลากร",
    "/admin/personal-list/create-personal": "เพิ่มบุคลากร",
    "/admin/prefix": "คำนำหน้า",
    "/admin/position": "ตำแหน่งวิชาการ",
    "/admin/exposition": "ตำแหน่งบริการ",
    "/admin/brnach": "สาขา",
    "/admin/course": "หลักสูตร",
    "/admin/round": "รอบการประเมิน",
    "/admin/personal-type": "ประเภทผู้ใชงาน",
    "/admin/user-level": "ระดับผู้ใช้งาน",
    "/admin/set-assessor": "รอบประเมินภาระงาน",

    // ผู้ใช้
    "/user": "หน้าหลัก",
    "/user/profile": "ข้อมูลส่วนตัว",
    "/user/workload_form": "แบบฟอร์มภาระงาน",
  }

  // Title for the page
  const Title =
    pathname.includes(`/user/workload_form/${task_id}`) && taskName.task_name
      ? taskName.task_name
      : pathname.includes(`/admin/set-assessor/${round_list_id}/${ex_u_id}`)
        ? "ผู้ตรวจประเมินภาระงาน"
        : pathname.includes(`/admin/set-assessor/${round_list_id}`)
          ? "ผู้ประเมินภาระงาน"
          : TitlePage[pathname] || "-"

  return (
    <div className="w-full bg-white sticky top-0 backdrop-blur-md dark:bg-zinc-900/75 dark:text-gray-200 border-b dark:border-zinc-800/25 bg-white/75 transition-all duration-300 ease-in-out z-20">
      <div className="border-b dark:border-zinc-800/80 px-4 py-2">
        <div className="flex justify-between items-center">
          <button onClick={() => setOpenSidebar(!OpenSidebar)} className="rounded-lg">
            {OpenSidebar ? (
              <Menu className="w-7 h-7 text-gray-800 dark:text-gray-200" />
            ) : (
              <Menu className="w-7 h-7 text-gray-800 dark:text-gray-200 rotate-180" />
            )}
          </button>
          <div className="flex items-center space-x-4">
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-full bg-gray-200 text-gray-800 dark:bg-gray-600 dark:text-yellow-500 transition-all duration-300 ${isDarkMode ? "" : "-rotate-180"
                }`}
            >
              {isDarkMode ? <Moon width={16} height={16} /> : <SunMedium width={16} height={16} />}
            </button>
            <button className="flex items-center" onClick={handleProfile}>
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse"></div>
                  <div className="space-y-2 hidden md:block">
                    <div className="w-24 h-4 bg-gray-200 animate-pulse"></div>
                    <div className="w-16 h-3 bg-gray-200 animate-pulse"></div>
                  </div>
                </div>
              ) : (
                <>
                  <div className="relative w-10 h-10 mx-auto overflow-hidden rounded-full border-2 border-gray-100 mr-2">
                    <Image
                      src={user?.u_img ? `/images/${user.u_img}` : "/images/default.png"}
                      fill
                      alt="User"
                      className="object-cover bg-white"
                      sizes="96px"
                    />
                  </div>
                  <div className="leading-6 flex-row hidden md:block">
                    <h4 className="text-start font-regular text-gray-600 truncate dark:text-gray-400">
                      {user?.u_fname} {user?.u_lname}
                    </h4>
                    <h4 className="text-start font-light text-xs text-gray-600 dark:text-gray-400 truncate">
                      {user?.level_name}
                    </h4>
                  </div>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
      <div className="px-4 py-2">
        <div className="flex flex-col md:flex-row justify-between items-left md:items-center">
          <div>
            <h1 className="text-xl md:text-xl text-medium bg-gradient-to-r from-cyan-500 to-blue-500 bg-clip-text text-transparent truncate">
              {Title}
            </h1>

            <Breadcrumb />
          </div>
          <div className="flex items-center gap-4">
            <p className="text-gray-600 text-sm mt-2 md:mt-0">วันที่: {formattedDate}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

