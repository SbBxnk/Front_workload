'use client'
import React, { useEffect } from 'react'
import Link from 'next/link'
import TableCard from './components/TablePostcard'
import ProfileCard from './components/ProfileCard'
import CountMemberCard from './components/CountMemberCard'
import LoginChart from './components/MemberLoginChart'
import useUtility from '@/hooks/useUtility'

export default function MemberLoginChart() {
  const { setBreadcrumbs } = useUtility()
  useEffect(() => {
    setBreadcrumbs([
      { text: "แดชบอร์ด", path: "/admin" },
    ])
  }, [setBreadcrumbs])
  return (
    <>
      <div className="flex w-full flex-col-reverse gap-4 lg:flex-row">
        <div className="flex w-full flex-col gap-4">
          <CountMemberCard />
          <div className="flex min-w-full flex-col gap-4">
            <div className="rounded-lg bg-white p-4 shadow transition-all duration-300 ease-in-out dark:bg-zinc-900">
              <div className="flex items-center">
                <Link
                  href="/admin/topicpost"
                  className="text-xl font-semibold text-gray-600 dark:text-gray-400 hover:underline"
                >
                  อนุมัติหลักฐานภาระงาน
                </Link>
              </div>
              <TableCard />
            </div>
            <div className="rounded-lg bg-white p-4 shadow transition-all duration-300 ease-in-out dark:bg-zinc-900">
              <LoginChart />
            </div>
          </div>
        </div>
        <ProfileCard />
      </div>
    </>
  )
}
