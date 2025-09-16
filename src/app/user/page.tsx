'use client'
import React from 'react'
import ProfileCard from './components/ProfileCard'

export default function Page() {
  return (
    <>
      <div className="flex w-full flex-col-reverse gap-4 lg:flex-row">
        <div className="flex w-full flex-col gap-4">
          {/* <CountMemberCard /> */}
          <div className="flex min-w-full flex-col gap-4">
            <div className="rounded-lg bg-white p-4 shadow transition-all duration-300 ease-in-out dark:bg-zinc-900">
              <div className="flex items-center">
                <h2 className="cursor-pointer text-xl font-semibold text-gray-600 dark:text-gray-400">
                  อนุมัติหลักฐานภาระงาน
                </h2>
              </div>
              {/* <TableCard /> */}
            </div>
            <div className="rounded-lg bg-white p-4 shadow transition-all duration-300 ease-in-out dark:bg-zinc-900">
              {/* <LoginChart /> */}
            </div>
          </div>
        </div>
        <ProfileCard />
      </div>
    </>
  )
}
