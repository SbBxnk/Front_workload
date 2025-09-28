'use client'

import { useState, useEffect } from 'react'
import { useParams, usePathname } from 'next/navigation'
import Image from 'next/image'
import { jwtDecode } from 'jwt-decode'
import { useTheme } from '../provider/themeContext'
import { Menu, Moon, SunMedium } from 'lucide-react'
import BreadcrumbNav from './BreadcrumbNav'
import axios from 'axios'
import { useSession } from 'next-auth/react'
import UserProfileDialog from './UserProfileDialog'

interface UserLoginData {
  u_fname: string
  u_lname: string
  level_name: string
  u_img: string
}

interface TopbarProps {
  setOpenSidebar: (value: boolean) => void
  OpenSidebar: boolean
}

interface MainTaskDetail {
  task_name: string
  task_id: number
}

export default function Topbar({
  setOpenSidebar,
  OpenSidebar,
}: TopbarProps) {
  const [currentDateTime, setCurrentDateTime] = useState<Date | null>(null)
  const { isDarkMode, toggleTheme } = useTheme()
  const [user, setUser] = useState<UserLoginData | null>(null)
  const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false)
  const { data: session } = useSession()

  const pathname = usePathname()
  const params = useParams()
  const task_id = params.task_id // รับ task_id จาก URL
  const round_list_id = params.round_list_id // รับ round_list_id จาก URL
  const ex_u_id = params.ex_u_id // รับ ex_u_id จาก URL
  const [taskName, setTaskName] = useState<MainTaskDetail>({
    task_id: 0,
    task_name: '',
  })
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
      if (!task_id || !session?.accessToken) {
        return
      }

      setIsLoading(true)
      try {
        const response = await axios.get<{ data: MainTaskDetail }>(
          `${process.env.NEXT_PUBLIC_API}/maintask/${task_id}`,
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${session.accessToken}`,
            },
          }
        )
        console.log('API response:', response)
        if (response.data && response.data.data.task_name) {
          setTaskName(response.data.data)
        } else {
          setTaskName({ task_id: 0, task_name: 'ไม่พบข้อมูล' })
        }
      } catch (error) {
        console.error('Error fetching task name:', error)
        setTaskName({ task_id: 0, task_name: 'ไม่สามารถโหลดข้อมูลได้' })
      } finally {
        setIsLoading(false)
      }
    }

    fetchTaskName()
  }, [task_id, session?.accessToken])

  // Fetch user info from JWT token
  useEffect(() => {
    if (session?.accessToken) {
      try {
        const decoded: UserLoginData = jwtDecode(session.accessToken)
        setUser(decoded)
      } catch (error) {
        console.error('JWT Decode Error:', error)
      }
      setIsLoading(false)
    }
  }, [session?.accessToken])

  // Format the current date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const formattedDate = formatDate(String(currentDateTime))

  return (
    <div className="sticky top-0 z-20 w-full border-b bg-white bg-white/75 backdrop-blur-md transition-all duration-300 ease-in-out dark:border-zinc-800/25 dark:bg-zinc-900/75 dark:text-gray-200">
      <div className="border-b px-4 py-2 dark:border-zinc-800/80">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setOpenSidebar(!OpenSidebar)}
              className="rounded-lg"
            >
              {OpenSidebar ? (
                <Menu className="h-7 w-7 text-gray-800 dark:text-gray-200" />
              ) : (
                <Menu className="h-7 w-7 rotate-180 text-gray-800 dark:text-gray-200" />
              )}
            </button>
            <BreadcrumbNav />
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={toggleTheme}
              className={`rounded-full bg-gray-200 p-2 text-gray-800 transition-all duration-300 dark:bg-gray-600 dark:text-yellow-500 ${
                isDarkMode ? '' : '-rotate-180'
              }`}
            >
              {isDarkMode ? (
                <Moon width={16} height={16} />
              ) : (
                <SunMedium width={16} height={16} />
              )}
            </button>
            <div className="flex items-center">
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="h-8 w-8 animate-pulse rounded-full bg-gray-200"></div>
                  <div className="hidden space-y-2 md:block">
                    <div className="h-4 w-24 animate-pulse bg-gray-200"></div>
                    <div className="h-3 w-16 animate-pulse bg-gray-200"></div>
                  </div>
                </div>
              ) : (
                <>
                  <div className="relative">
                    <div 
                      className="relative mx-auto mr-2 h-10 w-10 overflow-hidden rounded-full border-2 border-gray-100 cursor-pointer hover:border-gray-300 transition-colors duration-200"
                      onClick={() => setIsProfileDialogOpen(!isProfileDialogOpen)}
                    >
                      <Image
                        src={
                          user?.u_img
                            ? `/images/${user.u_img}`
                            : '/images/default.png'
                        }
                        fill
                        alt="User"
                        className="bg-white object-cover"
                        sizes="96px"
                      />
                    </div>
                    
                    {/* User Profile Dialog */}
                    <UserProfileDialog
                      isOpen={isProfileDialogOpen}
                      onClose={() => setIsProfileDialogOpen(false)}
                      user={{
                        name: user ? `${user.u_fname} ${user.u_lname}` : '',
                        email: session?.user?.email || '',
                        position: user?.level_name || '',
                        image: user?.u_img ? `/images/${user.u_img}` : '/images/default.png'
                      }}
                    />
                  </div>
                  
                  {/* <div className="hidden flex-row leading-6 md:block">
                    <h4 className="font-regular truncate text-start text-gray-600 dark:text-gray-400">
                      {user?.u_fname} {user?.u_lname}
                    </h4>
                    <h4 className="truncate text-start text-xs font-light text-gray-600 dark:text-gray-400">
                      {user?.level_name}
                    </h4>
                  </div> */}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
