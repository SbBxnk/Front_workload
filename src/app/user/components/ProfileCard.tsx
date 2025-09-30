'use client'

import { useState, useEffect } from 'react'
import { jwtDecode } from 'jwt-decode'
import Image from 'next/image'
import Link from 'next/link'
import { useSession } from 'next-auth/react'

interface UserLoginData {
  prefix: string
  u_email: string
  u_fname: string
  u_lname: string
  level_name: string
  position_name: string
  ex_position_name: string
  course_name: string
  branch_name: string
  type_p_name: string
  salary: number
  u_img: string
}

function ProfileCard() {
  const [user, setUser] = useState<UserLoginData | null>(null)
  const { data: session } = useSession()

  useEffect(() => {
    if (session?.accessToken) {
      try {
        const decoded: UserLoginData = jwtDecode(session.accessToken)
        setUser(decoded)
      } catch (error) {
        console.error('Error decoding token:', error)
      }
    }
  }, [session?.accessToken])

  return (
    <Link
      href="../user/profile"
      className="h-full w-full rounded-md bg-white p-4 shadow transition-all duration-300 ease-in-out dark:bg-zinc-900 lg:sticky lg:top-[8.6rem] lg:w-1/3"
    >
      <div className="mb-2 border-b border-gray-400 pb-2 pb-[16px] dark:border-zinc-400">
        <h2 className="font-regular text-center text-lg text-gray-600 dark:text-gray-400 md:text-2xl">
          ข้อมูลส่วนตัว
        </h2>
        <div className="relative mx-auto h-24 w-24 overflow-hidden rounded-full border-2 border-gray-100">
          <Image
            src={user?.u_img ? `/images/${user.u_img}` : '/images/default.png'}
            fill
            alt="avatar"
            className="bg-white object-cover"
            sizes="96px"
          />
        </div>
        <div className="font-regular bg-gradient-to-r from-cyan-500 to-blue-500 bg-clip-text text-center text-2xl text-transparent">
          <h1>
            {user?.prefix}
            {user?.u_fname} {user?.u_lname}
          </h1>
        </div>
        <p className="text-md text-center font-light text-gray-500">
          {user?.position_name || '-'}
        </p>
      </div>
      <div className="lg:text-md grid grid-cols-[3fr_4fr] gap-x-4 gap-y-2 text-sm text-gray-600">
        <div className="text-gray-600">ชื่อ-สกุล</div>
        <div className="font-light text-gray-400">
          {user?.prefix}
          {user?.u_fname} {user?.u_lname}
        </div>
        <div className="text-gray-600">สาขา</div>
        <div className="font-light text-gray-400">
          {user?.branch_name || '-'}
        </div>
        <div className="text-gray-600">หลักสูตร</div>
        <div className="font-light text-gray-400">
          {user?.course_name || '-'}
        </div>
        <div className="text-gray-600">ตำแหน่งวิชาการ</div>
        <div className="font-light text-gray-400">
          {user?.position_name || '-'}
        </div>
        <div className="text-gray-600">ตำแหน่งบริหาร</div>
        <div className="font-light text-gray-400">
          {user?.ex_position_name || '-'}
        </div>
      </div>
    </Link>
  )
}

export default ProfileCard
