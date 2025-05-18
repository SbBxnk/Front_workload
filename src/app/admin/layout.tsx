"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Sidebar from "../../components/Sidebar"
import Topbar from "../../components/Topbar"
import { ThemeProvider } from "../../provider/themeContext"
import { useRouter } from "next/navigation"
import { AuthProvider } from "../../provider/authProvider"

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const [OpenSidebar, setOpenSidebar] = useState(true)
  const [isMobile, setIsMobile] = useState(false)
  const router = useRouter()

  const handleProfile = async () => {
    router.push("/admin/profile")
  }

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
    }

    window.addEventListener("resize", handleResize)
    handleResize()
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  return (
    <ThemeProvider>
      <AuthProvider>
        <div className="flex h-screen w-full overflow-hidden no-scrollbar">
          <div className="flex-none p-0 bg-[#EBEFF3] dark:bg-zinc-900 transition-all duration-300 ease-in-out">
            <Sidebar OpenSidebar={OpenSidebar} setOpenSidebar={setOpenSidebar} />
          </div>

          {OpenSidebar && isMobile && (
            <div className="fixed md:static top-0 left-0 w-full h-full bg-gray-600 bg-opacity-20 backdrop-blur-md z-30"></div>
          )}

          <div className="flex-1 flex flex-col bg-[#EBEFF3] dark:bg-black overflow-auto transition-all duration-300 ease-in-out">
            <main className="flex-1 overflow-y-auto bg-transparent no-scrollbar">
              <Topbar setOpenSidebar={setOpenSidebar} OpenSidebar={OpenSidebar} handleProfile={handleProfile} />
              <div className="bg-[#EBEFF3] dark:bg-black mx-auto p-[16px] gap-5 transition-all duration-300 ease-in-out">
                {children}
              </div>
            </main>
          </div>
        </div>
      </AuthProvider>
    </ThemeProvider>
  )
}

