"use client"

import { useState, useEffect } from "react"
import { jwtDecode } from "jwt-decode"
import Image from "next/image"
import Link from "next/link"

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

  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token")
      if (token) {
        const decoded: UserLoginData = jwtDecode(token)
        setUser(decoded)
      }
    }
  }, [])

  return (
    <Link
      href="../user/profile"
      className="lg:sticky lg:top-[8.6rem] bg-white dark:bg-zinc-900 p-4 rounded-md h-full shadow w-full lg:w-1/3 transition-all duration-300 ease-in-out"
    >
      <div className="border-b pb-2 mb-2 border-gray-400 dark:border-zinc-400 pb-[16px]">
        <h2 className="text-lg md:text-2xl text-center text-gray-600 dark:text-gray-400 font-regular">ข้อมูลส่วนตัว</h2>
        <div className="relative w-24 h-24 mx-auto overflow-hidden rounded-full border-2 border-gray-100">
          <Image
            src={user?.u_img ? `/images/${user.u_img}` : "/images/default.png"}
            fill
            alt="avatar"
            className="object-cover bg-white"
            sizes="96px"
          />
        </div>
        <div className="text-2xl font-regular text-center bg-gradient-to-r from-cyan-500 to-blue-500 bg-clip-text text-transparent">
          <h1>
            {user?.prefix}
            {user?.u_fname} {user?.u_lname}
          </h1>
        </div>
        <p className="text-center text-md text-gray-500 font-light">{user?.position_name || "-"}</p>
      </div>
      <div className="grid grid-cols-[3fr_4fr] gap-x-4 gap-y-2 text-sm lg:text-md text-gray-600">
        <div className="text-gray-600">ชื่อ-สกุล</div>
        <div className="text-gray-400 font-light ">
          {user?.prefix}
          {user?.u_fname} {user?.u_lname}
        </div>
        <div className="text-gray-600">สาขา</div>
        <div className="text-gray-400 font-light ">{user?.branch_name || "-"}</div>
        <div className="text-gray-600">หลักสูตร</div>
        <div className="text-gray-400 font-light ">{user?.course_name || "-"}</div>
        <div className="text-gray-600">ตำแหน่งวิชาการ</div>
        <div className="text-gray-400 font-light ">{user?.position_name || "-"}</div>
        <div className="text-gray-600">ตำแหน่งบริหาร</div>
        <div className="text-gray-400 font-light ">{user?.ex_position_name || "-"}</div>
      </div>
    </Link>
  )
}

export default ProfileCard
