'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Image from 'next/image'
import { useTheme } from '../provider/themeContext'
import { Menu } from 'lucide-react'
import BreadcrumbNav from './BreadcrumbNav'
import { useSession } from 'next-auth/react'
import UserProfileDialog from './UserProfileDialog'
import { useCurrentUser } from '@/hooks/useCurrentUser'
import http from '@/utils/http'

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
  const { data: currentUser } = useCurrentUser()
  const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false)
  const { data: session } = useSession()

  const params = useParams()
  const task_id = params.task_id // รับ task_id จาก URL
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

      // ตรวจสอบว่า task_id เป็นตัวเลขหรือไม่
      if (isNaN(Number(task_id))) {
        setTaskName({ task_id: 0, task_name: 'ไม่พบข้อมูล' })
        return
      }

      setIsLoading(true)
      try {
        const response = await http.get<{ payload: MainTaskDetail; data?: MainTaskDetail }>(
          `/maintask/${task_id}`
        )

        if (response.data?.payload?.task_name) {
          setTaskName(response.data.payload)
        } else if (response.data?.data?.task_name) {
          setTaskName(response.data.data)
        } else {
          setTaskName({ task_id: 0, task_name: 'ไม่พบข้อมูล' })
        }
      } catch {
        setTaskName({ task_id: 0, task_name: 'ไม่สามารถโหลดข้อมูลได้' })
      } finally {
        setIsLoading(false)
      }
    }

    fetchTaskName()
  }, [task_id, session?.accessToken])

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
    <div className="sticky top-0 z-20 w-full border-b bg-white backdrop-blur-md transition-all duration-300 ease-in-out dark:border-zinc-800/25 dark:bg-zinc-900/75 dark:text-gray-200">
      <div className="border-b px-4 py-2 dark:border-zinc-800/80">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setOpenSidebar(!OpenSidebar)}
              className="rounded-lg"
            >
              {OpenSidebar ? (
                <Menu className="h-5 w-5 text-gray-800 dark:text-gray-200" />
              ) : (
                <Menu className="h-5 w-5 rotate-180 text-gray-800 dark:text-gray-200" />
              )}
            </button>
            <BreadcrumbNav />
          </div>
          <div className="flex items-center space-x-4">
            {/* <button
              onClick={toggleTheme}
              className={`rounded-full bg-gray-200 p-2 text-gray-800 transition-all duration-300 dark:bg-gray-600 dark:text-yellow-500 ${isDarkMode ? '' : '-rotate-180'
                }`}
            >
              {isDarkMode ? (
                <Moon width={16} height={16} />
              ) : (
                <SunMedium width={16} height={16} />
              )}
            </button> */}
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
                          currentUser?.u_img
                            ? `/profile/${currentUser.u_img}`
                            : '/profile/default.png'
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
                        name: currentUser ? `${currentUser.u_fname} ${currentUser.u_lname}` : '',
                        email: currentUser?.u_email || '',
                        position: currentUser?.level_name || '',
                        image: currentUser?.u_img ? `/profile/${currentUser.u_img}` : '/profile/default.png'
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
