"use client"
import React, { useState, useEffect } from 'react'
import { jwtDecode } from 'jwt-decode';
import Image from 'next/image'

interface UserLoginData {
  prefix: string;
  u_email: string;
  u_fname: string;
  u_lname: string;
  level_name: string;
  u_id_card: string;
  u_tel: number;
  position_name: string;
  ex_position_name: string;
  course_name: string;
  branch_name: string;
  type_p_name: string;
  gender: string;
  age: number;
  work_start: string;
  work_length: string;
  salary: number;
  u_img: string;
}

export default function Detail_profile() {
  const [user, setUser] = useState<UserLoginData | null>(null);

  useEffect(() => {

    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      if (token) {
        const decoded: UserLoginData = jwtDecode(token);
        setUser(decoded);
      }
    }
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const calculateWorkDuration = (startDate: string) => {
    const start = new Date(startDate);
    const now = new Date();

    let years = now.getFullYear() - start.getFullYear();
    let months = now.getMonth() - start.getMonth();
    let days = now.getDate() - start.getDate();

    if (days < 0) {
      months -= 1;
      days += new Date(now.getFullYear(), now.getMonth(), 0).getDate();
    }

    if (months < 0) {
      years -= 1;
      months += 12;
    }

    const duration = [];
    if (years > 0) {
      duration.push(`${years} ปี`);
    }
    if (months > 0) {
      duration.push(`${months} เดือน`);
    }
    if (days > 0 || (years === 0 && months === 0)) {
      duration.push(`${days} วัน`);
    }
    return duration.join(" ");
  };

  const workDuration = user?.work_start ? calculateWorkDuration(user.work_start) : "-";

  return (

    <>
      <div className="space-y-4">

        <div className="flex gap-4 h-full">
          <div className="bg-white p-4 rounded-lg h-full shadow dark:bg-zinc-900 w-1/4">
            <div className="" >
              <Image
                src={user?.u_img ? `/images/${user.u_img}` : '/images/default.png'}
                width={130}
                height={130}
                alt="avatar"
                className="mx-auto rounded-full bg-white border-2 border-gray-100"
              />

              <div className="">
                <p className='text-center w-full font-semibold text-xl'>{user?.prefix || "-"}{user?.u_fname || "-"} {user?.u_lname || "-"}</p>
                <p className='text-center w-full font-regular text-md'>{user?.position_name || "-"}</p>
                <div className="w-full flex justify-evenly user?s-center gap-4 py-4">
                  <p className='w-full text-center bg-gray-400'>1</p>
                  <p className='w-full text-center bg-gray-400'>1</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg h-full shadow dark:bg-zinc-900 w-3/4">

            <div className="grid grid-cols-3 gap-x-4 gap-y-12">
              <div className="col-1" >
                <p className='text-start w-full font-regular text-lg text-gray-400'>ชื่อ</p>
                <p className='text-start w-full font-semibold text-lg text-gray-600'>{user?.u_fname || "-"}</p>
              </div>
              <div className="col-1" >
                <p className='text-start w-full font-regular text-lg text-gray-400'>สกุล</p>
                <p className='text-start w-full font-semibold text-lg text-gray-600'>{user?.u_lname || "-"}</p>
              </div>
              <div className="col-1" >
                <p className='text-start w-full font-regular text-lg text-gray-400'>อายุ</p>
                <p className='text-start w-full font-semibold text-lg text-gray-600'>{user?.age || "-"}</p>
              </div>
              <div className="col-1" >
                <p className='text-start w-full font-regular text-lg text-gray-400'>เพศ</p>
                <p className='text-start w-full font-semibold text-lg text-gray-600'>{user?.gender || "-"}</p>
              </div>
              <div className="col-1" >
                <p className='text-start w-full font-regular text-lg text-gray-400'>รหัสประจำตัว</p>
                <p className='text-start w-full font-semibold text-lg text-gray-600'>{user?.u_id_card || "-"}</p>
              </div>
              <div className="col-1" >
                <p className='text-start w-full font-regular text-lg text-gray-400'>RMUTL email</p>
                <p className='text-start w-full font-semibold text-lg text-gray-600'>{user?.u_email || "-"}</p>
              </div>
              <div className="col-1" >
                <p className='text-start w-full font-regular text-lg text-gray-400'>ตําแหน่งวิชาการ</p>
                <p className='text-start w-full font-semibold text-lg text-gray-600'>{user?.position_name || "-"}</p>
              </div>
              <div className="col-1" >
                <p className='text-start w-full font-regular text-lg text-gray-400'>ตำแหน่งบริหาร</p>
                <p className='text-start w-full font-semibold text-lg text-gray-600'>{user?.ex_position_name || "-"}</p>
              </div>
              <div className="col-1" >
                <p className='text-start w-full font-regular text-lg text-gray-400'>สาขา</p>
                <p className='text-start w-full font-semibold text-lg text-gray-600'>{user?.branch_name || "-"}</p>
              </div>
              <div className="col-1" >
                <p className='text-start w-full font-regular text-lg text-gray-400'>หลักสูตร</p>
                <p className='text-start w-full font-semibold text-lg text-gray-600'>{user?.course_name || "-"}</p>
              </div>
              <div className="col-1" >
                <p className='text-start w-full font-regular text-lg text-gray-400'>เริ่มรับราชการเมื่อวันที่</p>
                <p className='text-start w-full font-semibold text-lg text-gray-600'>{user?.work_start ? formatDate(user.work_start) : "-"}</p>
              </div>
              <div className="col-1" >
                <p className='text-start w-full font-regular text-lg text-gray-400'>รวมเวลารับราชการ</p>
                <p className='text-start w-full font-semibold text-lg text-gray-600'>{workDuration}</p>
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-col bg-white dark:bg-zinc-900 rounded-xl">
          <div className="flex flex-wrap user?s-center justify-between gap-4 px-4 pb-4 first:pt-4">
            <div className="flex flex-wrap user?s-center gap-4">
              <div className="flex user?s-center text-2xl font-semibold">
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
                    className="w-full appearance-none outline-0 text-black dark:text-white disabled:opacity-25 transition-all duration-300 ease-in-out border-2 border-zinc-100 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-800 hover:border-blue-500 dark:hover:border-blue-500 disabled:border-zinc-500 focus:border-zinc-300 dark:focus:border-zinc-800 focus:bg-transparent dark:focus:bg-transparent px-1.5 py-1.5 text-base rounded-lg"
                    name="oldPassword"
                    type="password"
                    id="oldPassword"
                    autoComplete="current-password"
                  />
                  <div className="absolute top-[2px] bottom-[2px] flex justify-center user?s-center px-1 rounded end-px">
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
                    className="w-full appearance-none outline-0 text-black dark:text-white disabled:opacity-25 transition-all duration-300 ease-in-out border-2 border-zinc-100 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-800 hover:border-blue-500 dark:hover:border-blue-500 disabled:border-zinc-500 focus:border-zinc-300 dark:focus:border-zinc-800 focus:bg-transparent dark:focus:bg-transparent px-1.5 py-1.5 text-base rounded-lg"
                    name="newPassword"
                    type="password"
                    id="newPassword"
                    autoComplete="new-password"
                  />
                  <div className="absolute top-[2px] bottom-[2px] flex justify-center user?s-center px-1 rounded end-px">
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
                    className="w-full appearance-none outline-0 text-black dark:text-white disabled:opacity-25 transition-all duration-300 ease-in-out border-2 border-zinc-100 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-800 hover:border-blue-500 dark:hover:border-blue-500 disabled:border-zinc-500 focus:border-zinc-300 dark:focus:border-zinc-800 focus:bg-transparent dark:focus:bg-transparent px-1.5 py-1.5 text-base rounded-lg"
                    name="newPasswordConfirmation"
                    type="password"
                    id="newPasswordConfirmation"
                    autoComplete="new-password"
                  />
                  <div className="absolute top-[2px] bottom-[2px] flex justify-center user?s-center px-1 rounded end-px">
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