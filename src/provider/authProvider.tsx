'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import Swal from 'sweetalert2'
import type React from 'react'
import { jwtDecode } from 'jwt-decode'
import axios from 'axios'
import type { DecodedToken } from '@/Types'
// import AssessorService from '@/services/assessorService' // ไม่ใช้แล้ว เพราะใช้ global context

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [userRole, setUserRole] = useState<string | null>(null)
  const router = useRouter()
  const pathname = usePathname()
  const { data: session, status } = useSession()

  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response && error.response.status === 403) {
          Swal.fire({
            title: 'ไม่มีสิทธิ์เข้าถึง',
            text: 'กรุณาเข้าสู่ระบบใหม่อีกครั้ง',
            icon: 'error',
            confirmButtonText: 'OK',
          }).then(() => {
            signOut({ callbackUrl: '/login' })
          })
        }
        return Promise.reject(error)
      }
    )

    return () => {
      axios.interceptors.response.eject(interceptor)
    }
  }, [])

  useEffect(() => {
    // รอให้ session โหลดเสร็จก่อน
    if (status === 'loading') {
      return
    }

    // ถ้าไม่มี session หรือ session หมดอายุ
    if (status === 'unauthenticated' || !session?.accessToken) {
      router.push('/login')
      return
    }

    try {
      const decodedToken = jwtDecode<DecodedToken>(session.accessToken)

      const currentTime = Math.floor(Date.now() / 1000)
      if (decodedToken.exp < currentTime) {
        handleTokenExpired()
        return
      }

      setUserRole(decodedToken.level_name)
      setIsAuthenticated(true)
      checkAuthorization(decodedToken.level_name, pathname)
      
      // assessor status จะถูกจัดการโดย AssessorProvider แล้ว
    } catch (error) {
      console.error('Invalid token:', error)
      signOut({ callbackUrl: '/login' })
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, status, pathname])

  const handleTokenExpired = () => {
    Swal.fire({
      title: 'เซสชันหมดอายุ',
      text: 'กรุณาเข้าสู่ระบบใหม่อีกครั้ง',
      icon: 'warning',
      confirmButtonText: 'OK',
    }).then(() => {
      signOut({ callbackUrl: '/login' })
    })
  }

  const showUnauthorizedAlert = (redirectPath: string) => {
    router.push(redirectPath)
  }

  const checkAuthorization = (role: string, path: string) => {
    if (
      role === 'ผู้ดูแลระบบ' &&
      (path.startsWith('/user') || path.startsWith('/examiner'))
    ) {
      showUnauthorizedAlert('/admin')
      setIsAuthorized(false)
    } else if (
      role === 'ผู้ใช้งานทั่วไป' &&
      (path.startsWith('/admin') || path.startsWith('/examiner'))
    ) {
      showUnauthorizedAlert('/user')
      setIsAuthorized(false)
    } else if (
      role === 'ผู้ตรวจประเมิน' &&
      (path.startsWith('/admin') || path.startsWith('/user'))
    ) {
      showUnauthorizedAlert('/examiner')
      setIsAuthorized(false)
    } else {
      setIsAuthorized(true)
    }
  }

  // checkAssessorStatus function removed - now handled by AssessorProvider

  if (!isAuthenticated || !isAuthorized) {
    return null
  }

  return <>{children}</>
}
