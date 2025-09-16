'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, ReactNode } from 'react'

interface AuthGuardProps {
  children: ReactNode
  requiredRole?: string
  fallbackUrl?: string
}

export default function AuthGuard({
  children,
  requiredRole,
  fallbackUrl = '/login',
}: AuthGuardProps) {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    console.log(
      'AuthGuard: Status:',
      status,
      'Session:',
      session,
      'RequiredRole:',
      requiredRole
    )

    if (status === 'loading') return // Still loading

    if (!session) {
      console.log('AuthGuard: No session, redirecting to login')
      router.push(fallbackUrl)
      return
    }

    if (requiredRole && session.user?.role !== requiredRole) {
      console.log(
        'AuthGuard: Wrong role. Required:',
        requiredRole,
        'User role:',
        session.user?.role
      )
      // Wrong role, redirect to appropriate page
      const role = session.user?.role
      if (role === 'ผู้ใช้งานทั่วไป') {
        router.push('/user/')
      } else if (role === 'ผู้ดูแลระบบ') {
        router.push('/admin/')
      } else if (role === 'ผู้ประเมินภาระงาน') {
        router.push('/assessor/')
      } else if (role === 'เลขาณุการ') {
        router.push('/secretary/')
      } else {
        router.push(fallbackUrl)
      }
      return
    }

    console.log('AuthGuard: Access allowed')
  }, [session, status, requiredRole, fallbackUrl, router])

  // Show loading while checking authentication
  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-32 w-32 animate-spin rounded-full border-b-2 border-gray-900"></div>
      </div>
    )
  }

  // Show nothing while redirecting
  if (!session || (requiredRole && session.user?.role !== requiredRole)) {
    return null
  }

  // Show protected content
  return <>{children}</>
}
