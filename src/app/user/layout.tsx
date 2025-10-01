'use client'
import React, { useState, useEffect } from 'react'
import Sidebar from '../../components/Sidebar'
import Topbar from '../../components/Topbar'
import { ThemeProvider } from '../../provider/themeContext' //ดึง ThemeContext
import { AuthProvider } from '../../provider/authProvider'
import { AssessorProvider } from '../../provider/AssessorProvider'

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const [OpenSidebar, setOpenSidebar] = useState(true)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
    }
    window.addEventListener('resize', handleResize)
    handleResize()
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return (
    <ThemeProvider>
      <AuthProvider>
        <AssessorProvider>
          <div className="no-scrollbar flex h-screen w-full overflow-hidden">
            <div className="flex-none bg-[#EBEFF3] p-0 dark:bg-zinc-900">
              <Sidebar
                OpenSidebar={OpenSidebar}
                setOpenSidebar={setOpenSidebar}
              />
            </div>
            {OpenSidebar && isMobile && (
              <div className="fixed left-0 top-0 z-30 h-full w-full bg-gray-600 bg-opacity-20 backdrop-blur-md md:static"></div>
            )}
            <div className="flex flex-1 flex-col overflow-auto bg-[#EBEFF3] dark:bg-black">
              <main className="no-scrollbar flex-1 overflow-y-auto bg-transparent">
                <Topbar
                  setOpenSidebar={setOpenSidebar}
                  OpenSidebar={OpenSidebar}
                />
                <div className="mx-auto gap-5 bg-[#EBEFF3] p-[16px] dark:bg-black">
                  {children}
                </div>
              </main>
            </div>
          </div>
        </AssessorProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}
