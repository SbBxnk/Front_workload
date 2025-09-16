import React, { useRef, useEffect } from 'react'
import { signOut } from 'next-auth/react'
import Image from 'next/image'

interface UserProfileDialogProps {
  isOpen: boolean
  onClose: () => void
  user: {
    name?: string
    email?: string
    position?: string
    image?: string
  }
}

const UserProfileDialog: React.FC<UserProfileDialogProps> = ({
  isOpen,
  onClose,
  user
}) => {
  const dialogRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dialogRef.current && !dialogRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  const handleLogout = () => {
    signOut({ callbackUrl: '/login' })
  }

  return (
    <div 
      ref={dialogRef}
      className="absolute right-0 top-full z-50 mt-2 w-80 transform overflow-hidden rounded-lg bg-white shadow-xl transition-all duration-300 dark:bg-zinc-800"
    >
      {/* Header */}
      <div className="bg-white dark:bg-zinc-800 p-4 border-b border-gray-200 dark:border-zinc-700">
        <h3 className="text-lg font-normal text-gray-600 dark:text-gray-400">ข้อมูลส่วนตัว</h3>
      </div>
      
      {/* Content */}
      <div className="px-6 py-6">
        <div className="flex flex-col items-center space-y-4">
          {/* Profile Image */}
          <div className="relative">
            <Image
              src={user.image || '/images/default.png'}
              alt="Profile"
              width={80}
              height={80}
              className="rounded-full border-2 border-blue-100"
            />
          </div>
          
          {/* User Info */}
          <div className="text-center">
            <h4 className="text-xl font-normal text-gray-600 dark:text-gray-400">
              {user.name || 'User Name'}
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {user.position || 'Position'}
            </p>
            <div className="mt-2 flex items-center justify-center space-x-2">
              <svg
                className="h-4 w-4 text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
              <span className="text-sm text-gray-600 dark:text-gray-300">
                {user.email || 'user@example.com'}
              </span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <div className="bg-white dark:bg-zinc-800 p-4 border-t border-gray-200 dark:border-zinc-700">
        <button
          onClick={handleLogout}
          className="w-full rounded-md bg-red-500 px-4 py-2 text-sm font-medium text-white transition-colors duration-200 hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
        >
          ออกจากระบบ
        </button>
      </div>
    </div>
  )
}

export default UserProfileDialog
