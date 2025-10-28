'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function AuthRedirect() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {

    if (status === 'loading') return // Still loading

    if (!session) {
      router.push('/login')
      return
    }

    // Redirect based on user role
    const role = session.user?.role

    switch (role) {
      case 'ผู้ดูแลระบบ':
        router.push('/admin')
        break
      case 'ผู้ใช้งานทั่วไป':
        router.push('/user')
        break
      case 'ผู้ประเมินภาระงาน':
        router.push('/assessor')
        break
      case 'เลขาณุการ':
        router.push('/secretary')
        break
      default:
        router.push('/login')
        break
    }
  }, [session, status, router])

  // Show loading while redirecting
  return null
}
