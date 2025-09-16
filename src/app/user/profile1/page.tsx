'use client'
import React, { useState, useEffect } from 'react'
import { jwtDecode } from 'jwt-decode'
import Image from 'next/image'
import { useSession } from 'next-auth/react'

interface UserLoginData {
  prefix: string
  u_email: string
  u_fname: string
  u_lname: string
  level_name: string
  u_id_card: string
  u_tel: number
  position_name: string
  ex_position_name: string
  course_name: string
  branch_name: string
  type_p_name: string
  gender: string
  age: number
  work_start: string
  work_length: string
  salary: number
  u_img: string
}

export default function Detail_profile() {
  const [user, setUser] = useState<UserLoginData | null>(null)
  const { data: session } = useSession()

  useEffect(() => {
    if (session?.accessToken) {
      const decoded: UserLoginData = jwtDecode(session.accessToken)
      setUser(decoded)
    }
  }, [session?.accessToken])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const calculateWorkDuration = (startDate: string) => {
    const start = new Date(startDate)
    const now = new Date()

    let years = now.getFullYear() - start.getFullYear()
    let months = now.getMonth() - start.getMonth()
    let days = now.getDate() - start.getDate()

    if (days < 0) {
      months -= 1
      days += new Date(now.getFullYear(), now.getMonth(), 0).getDate()
    }

    if (months < 0) {
      years -= 1
      months += 12
    }

    const duration = []
    if (years > 0) {
      duration.push(`${years} ปี`)
    }
    if (months > 0) {
      duration.push(`${months} เดือน`)
    }
    if (days > 0 || (years === 0 && months === 0)) {
      duration.push(`${days} วัน`)
    }
    return duration.join(' ')
  }

  const workDuration = user?.work_start
    ? calculateWorkDuration(user.work_start)
    : '-'

  return (
    <>
      <div className="space-y-4">
        <div className="flex h-full gap-4">
          <div className="h-full w-1/4 rounded-lg bg-white p-4 shadow dark:bg-zinc-900">
            <div className="">
              <Image
                src={
                  user?.u_img ? `/images/${user.u_img}` : '/images/default.png'
                }
                width={130}
                height={130}
                alt="avatar"
                className="mx-auto rounded-full border-2 border-gray-100 bg-white"
              />

              <div className="">
                <p className="w-full text-center text-xl font-semibold">
                  {user?.prefix || '-'}
                  {user?.u_fname || '-'} {user?.u_lname || '-'}
                </p>
                <p className="font-regular text-md w-full text-center">
                  {user?.position_name || '-'}
                </p>
                <div className="user?s-center flex w-full justify-evenly gap-4 py-4">
                  <p className="w-full bg-gray-400 text-center">1</p>
                  <p className="w-full bg-gray-400 text-center">1</p>
                </div>
              </div>
            </div>
          </div>

          <div className="h-full w-3/4 rounded-lg bg-white p-4 shadow dark:bg-zinc-900">
            <div className="grid grid-cols-3 gap-x-4 gap-y-12">
              <div className="col-1">
                <p className="font-regular w-full text-start text-lg text-gray-400">
                  ชื่อ
                </p>
                <p className="w-full text-start text-lg font-semibold text-gray-600">
                  {user?.u_fname || '-'}
                </p>
              </div>
              <div className="col-1">
                <p className="font-regular w-full text-start text-lg text-gray-400">
                  สกุล
                </p>
                <p className="w-full text-start text-lg font-semibold text-gray-600">
                  {user?.u_lname || '-'}
                </p>
              </div>
              <div className="col-1">
                <p className="font-regular w-full text-start text-lg text-gray-400">
                  อายุ
                </p>
                <p className="w-full text-start text-lg font-semibold text-gray-600">
                  {user?.age || '-'}
                </p>
              </div>
              <div className="col-1">
                <p className="font-regular w-full text-start text-lg text-gray-400">
                  เพศ
                </p>
                <p className="w-full text-start text-lg font-semibold text-gray-600">
                  {user?.gender || '-'}
                </p>
              </div>
              <div className="col-1">
                <p className="font-regular w-full text-start text-lg text-gray-400">
                  รหัสประจำตัว
                </p>
                <p className="w-full text-start text-lg font-semibold text-gray-600">
                  {user?.u_id_card || '-'}
                </p>
              </div>
              <div className="col-1">
                <p className="font-regular w-full text-start text-lg text-gray-400">
                  RMUTL email
                </p>
                <p className="w-full text-start text-lg font-semibold text-gray-600">
                  {user?.u_email || '-'}
                </p>
              </div>
              <div className="col-1">
                <p className="font-regular w-full text-start text-lg text-gray-400">
                  ตําแหน่งวิชาการ
                </p>
                <p className="w-full text-start text-lg font-semibold text-gray-600">
                  {user?.position_name || '-'}
                </p>
              </div>
              <div className="col-1">
                <p className="font-regular w-full text-start text-lg text-gray-400">
                  ตำแหน่งบริหาร
                </p>
                <p className="w-full text-start text-lg font-semibold text-gray-600">
                  {user?.ex_position_name || '-'}
                </p>
              </div>
              <div className="col-1">
                <p className="font-regular w-full text-start text-lg text-gray-400">
                  สาขา
                </p>
                <p className="w-full text-start text-lg font-semibold text-gray-600">
                  {user?.branch_name || '-'}
                </p>
              </div>
              <div className="col-1">
                <p className="font-regular w-full text-start text-lg text-gray-400">
                  หลักสูตร
                </p>
                <p className="w-full text-start text-lg font-semibold text-gray-600">
                  {user?.course_name || '-'}
                </p>
              </div>
              <div className="col-1">
                <p className="font-regular w-full text-start text-lg text-gray-400">
                  เริ่มรับราชการเมื่อวันที่
                </p>
                <p className="w-full text-start text-lg font-semibold text-gray-600">
                  {user?.work_start ? formatDate(user.work_start) : '-'}
                </p>
              </div>
              <div className="col-1">
                <p className="font-regular w-full text-start text-lg text-gray-400">
                  รวมเวลารับราชการ
                </p>
                <p className="w-full text-start text-lg font-semibold text-gray-600">
                  {workDuration}
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-col rounded-xl bg-white dark:bg-zinc-900">
          <div className="user?s-center flex flex-wrap justify-between gap-4 px-4 pb-4 first:pt-4">
            <div className="user?s-center flex flex-wrap gap-4">
              <div className="user?s-center flex text-2xl font-semibold">
                <div>
                  <div>Change password</div>
                  <div className="text-lg font-normal text-zinc-500">
                    Here you can set your new password
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="grow px-4 pb-4 first:pt-4">
            <div className="grid grid-cols-12 gap-4">
              {/* Old Password */}
              <div className="col-span-12">
                <label
                  className="mb-2 inline-block w-full cursor-pointer text-sm"
                  htmlFor="oldPassword"
                >
                  Old Password
                </label>
                <div className="relative">
                  <input
                    className="w-full appearance-none rounded-lg border-2 border-zinc-100 bg-zinc-100 px-1.5 py-1.5 text-base text-black outline-0 transition-all duration-300 ease-in-out hover:border-blue-500 focus:border-zinc-300 focus:bg-transparent disabled:border-zinc-500 disabled:opacity-25 dark:border-zinc-800 dark:bg-zinc-800 dark:text-white dark:hover:border-blue-500 dark:focus:border-zinc-800 dark:focus:bg-transparent"
                    name="oldPassword"
                    type="password"
                    id="oldPassword"
                    autoComplete="current-password"
                  />
                  <div className="user?s-center absolute bottom-[2px] end-px top-[2px] flex justify-center rounded px-1">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="svg-icon mx-2"
                    >
                      <path
                        d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              {/* New Password */}
              <div className="col-span-12">
                <label
                  className="mb-2 inline-block w-full cursor-pointer text-sm"
                  htmlFor="newPassword"
                >
                  New Password
                </label>
                <div className="relative">
                  <input
                    className="w-full appearance-none rounded-lg border-2 border-zinc-100 bg-zinc-100 px-1.5 py-1.5 text-base text-black outline-0 transition-all duration-300 ease-in-out hover:border-blue-500 focus:border-zinc-300 focus:bg-transparent disabled:border-zinc-500 disabled:opacity-25 dark:border-zinc-800 dark:bg-zinc-800 dark:text-white dark:hover:border-blue-500 dark:focus:border-zinc-800 dark:focus:bg-transparent"
                    name="newPassword"
                    type="password"
                    id="newPassword"
                    autoComplete="new-password"
                  />
                  <div className="user?s-center absolute bottom-[2px] end-px top-[2px] flex justify-center rounded px-1">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="svg-icon mx-2"
                    >
                      <path
                        d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="col-span-12">
                <label
                  className="mb-2 inline-block w-full cursor-pointer text-sm"
                  htmlFor="newPasswordConfirmation"
                >
                  New Password Confirmation
                </label>
                <div className="relative">
                  <input
                    className="w-full appearance-none rounded-lg border-2 border-zinc-100 bg-zinc-100 px-1.5 py-1.5 text-base text-black outline-0 transition-all duration-300 ease-in-out hover:border-blue-500 focus:border-zinc-300 focus:bg-transparent disabled:border-zinc-500 disabled:opacity-25 dark:border-zinc-800 dark:bg-zinc-800 dark:text-white dark:hover:border-blue-500 dark:focus:border-zinc-800 dark:focus:bg-transparent"
                    name="newPasswordConfirmation"
                    type="password"
                    id="newPasswordConfirmation"
                    autoComplete="new-password"
                  />
                  <div className="user?s-center absolute bottom-[2px] end-px top-[2px] flex justify-center rounded px-1">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="svg-icon mx-2"
                    >
                      <path
                        d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
