'use client'

import { useState, useEffect } from 'react'
import { jwtDecode } from 'jwt-decode'
import Image from 'next/image'
import Link from 'next/link'
import { useSession } from 'next-auth/react'

interface UserLoginData {
  id: string
  gender: string
  prefix_name: string
  prefix_id: number
  u_fname: string
  u_lname: string
  age: number
  branch_name: string
  branch_id: number
  course_name: string
  course_id: number
  ex_position_name: string
  ex_position_id: number
  exp: number
  iat: number
  level_name: string
  level_id: number
  position_id: number
  position_name: string
  salary: number
  type_p_name: string
  type_p_id: number
  u_email: string
  u_id_card: string
  u_img: string
  u_tel: string
  work_start: string
}

function ProfileCard() {
  const [user, setUser] = useState<UserLoginData | null>(null)
  const { data: session } = useSession()

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = session?.accessToken
      if (token) {
        const decoded: UserLoginData = jwtDecode(token)
        setUser(decoded)
      }
    }
  }, [session])

  return (
    <Link
      href="../admin/profile"
      className="h-full w-full rounded-md bg-white p-4 shadow transition-all duration-300 ease-in-out dark:bg-zinc-900 lg:sticky lg:top-[4.7rem] lg:w-1/3"
    >
      <div className="mb-2 border-b border-gray-400 pb-[16px] dark:border-zinc-400">
      
        <div className="relative mx-auto h-24 w-24 overflow-hidden rounded-full border-2 border-gray-100">
          <Image
            src={user?.u_img ? `/images/${user.u_img}` : '/images/default.png'}
            fill
            alt="avatar"
            className="bg-white object-cover"
            sizes="96px"
          />
        </div>
        <div className="font-regular text-center text-2xl text-business1 mt-2">
          <h1>
            {user?.prefix_name}
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
          {user?.prefix_name}
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
