'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useCurrentUser } from '@/hooks/useCurrentUser'

function ProfileCard() {
  const { data: currentUser } = useCurrentUser()

  return (
    <Link
      href="../user/profile"
      className="h-full w-full rounded-md bg-white p-4 shadow transition-all duration-300 ease-in-out dark:bg-zinc-900 lg:sticky lg:top-[4.7rem] lg:w-1/3"
    >
      <div className="mb-2 border-b border-gray-400 pb-2 dark:border-zinc-400">
        <h2 className="font-regular text-center text-lg text-gray-600 dark:text-gray-400 md:text-2xl pb-2">
          ข้อมูลส่วนตัว
        </h2>
        <div className="relative mx-auto h-24 w-24 overflow-hidden rounded-full border-2 border-gray-100">
          <Image
            src={currentUser?.u_img ? `/profile/${currentUser.u_img}` : '/profile/default.png'}
            fill
            alt="avatar"
            className="bg-white object-cover"
            sizes="96px"
          />
        </div>
        <div className="font-regular bg-gradient-to-r from-cyan-500 to-blue-500 bg-clip-text text-center text-2xl text-transparent">
          <h1>
            {currentUser?.prefix_name}
            {currentUser?.u_fname} {currentUser?.u_lname}
          </h1>
        </div>
        <p className="text-md text-center font-light text-gray-500">
          {currentUser?.position_name || '-'}
        </p>
      </div>
      <div className="lg:text-md grid grid-cols-[3fr_4fr] gap-x-4 gap-y-2 text-sm text-gray-600">
        {/* <div className="text-gray-600">ชื่อ-สกุล</div>
        <div className="font-light text-gray-400">
          {currentUser?.prefix_name}
          {currentUser?.u_fname} {currentUser?.u_lname}
        </div> */}
        <div className="text-gray-600">เลขประจำตำแหน่ง</div>
        <div className="font-light text-gray-400">
          {currentUser?.u_id_card || '-'}
        </div>
        <div className="text-gray-600">สาขา</div>
        <div className="font-light text-gray-400">
          {currentUser?.branch_name || '-'}
        </div>
        <div className="text-gray-600">หลักสูตร</div>
        <div className="font-light text-gray-400">
          {currentUser?.course_name || '-'}
        </div>
        {/* <div className="text-gray-600">ตำแหน่งวิชาการ</div>
        <div className="font-light text-gray-400">
          {currentUser?.position_name || '-'}
        </div> */}
        <div className="text-gray-600">ตำแหน่งบริหาร</div>
        <div className="font-light text-gray-400">
          {currentUser?.ex_position_name || '-'}
        </div>
        <div className="text-gray-600">อีเมล</div>
        <div className="font-light text-gray-400">
          {currentUser?.u_email || '-'}
        </div>

      </div>
    </Link>
  )
}

export default ProfileCard
