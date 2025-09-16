'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function AuthRedirect() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    console.log('AuthRedirect: Status:', status, 'Session:', session)

    if (status === 'loading') return // Still loading

    if (!session) {
      console.log('AuthRedirect: No session, redirecting to login')
      router.push('/login')
      return
    }

    // Redirect based on user role
    const role = session.user?.role
    console.log('AuthRedirect: User role:', role)

    switch (role) {
      case 'ผู้ดูแลระบบ':
        console.log('AuthRedirect: Redirecting to admin')
        router.push('/admin')
        break
      case 'ผู้ใช้งานทั่วไป':
        console.log('AuthRedirect: Redirecting to user')
        router.push('/user')
        break
      case 'ผู้ประเมินภาระงาน':
        console.log('AuthRedirect: Redirecting to assessor')
        router.push('/assessor')
        break
      case 'เลขาณุการ':
        console.log('AuthRedirect: Redirecting to secretary')
        router.push('/secretary')
        break
      default:
        console.log('AuthRedirect: Unknown role, redirecting to login')
        router.push('/login')
        break
    }
  }, [session, status, router])

  // Show loading while redirecting
  return null
}
