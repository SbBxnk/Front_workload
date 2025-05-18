"use client"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import Swal from "sweetalert2"
import type React from "react"
import { jwtDecode } from "jwt-decode"
import type { DecodedToken } from "@/Types"



export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [userRole, setUserRole] = useState<string | null>(null)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const token = localStorage.getItem("token")

    if (!token) {
      router.push("/login") // ถ้าไม่มี token ให้ไปหน้า login ทันที
      return
    }

    try {
      const decodedToken = jwtDecode<DecodedToken>(token)

      // ตรวจสอบว่า token หมดอายุหรือไม่
      const currentTime = Math.floor(Date.now() / 1000) // เวลาปัจจุบันเป็นวินาที
      if (decodedToken.exp < currentTime) {
        handleTokenExpired()
        return
      }

      setUserRole(decodedToken.level_name)
      setIsAuthenticated(true)
      checkAuthorization(decodedToken.level_name, pathname)
    } catch (error) {
      console.error("Invalid token:", error)
      router.push("/login") // ถ้า token ไม่ถูกต้องให้ logout
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, userRole])

  // ฟังก์ชันเมื่อ token หมดอายุ
  const handleTokenExpired = () => {
    localStorage.removeItem("token") // ลบ token ออกจาก localStorage
    Swal.fire({
      title: "เซสชันหมดอายุ",
      text: "กรุณาเข้าสู่ระบบใหม่อีกครั้ง",
      icon: "warning",
      confirmButtonText: "OK",
    }).then(() => {
      router.push("/login")
    })
  }

  const showUnauthorizedAlert = (redirectPath: string) => {
    router.push(redirectPath)
  }

  const checkAuthorization = (role: string, path: string) => {
    if (role === "ผู้ดูแลระบบ" && (path.startsWith("/user") || path.startsWith("/examiner"))) {
      showUnauthorizedAlert("/admin")
      setIsAuthorized(false)
    } else if (role === "ผู้ใช้งานทั่วไป" && (path.startsWith("/admin") || path.startsWith("/examiner"))) {
      showUnauthorizedAlert("/user")
      setIsAuthorized(false)
    } else if (role === "ผู้ตรวจประเมิน" && (path.startsWith("/admin") || path.startsWith("/user"))) {
      showUnauthorizedAlert("/examiner")
      setIsAuthorized(false)
    } else {
      setIsAuthorized(true)
    }
  }

  if (!isAuthenticated || !isAuthorized) {
    return null
  }

  return <>{children}</>
}
