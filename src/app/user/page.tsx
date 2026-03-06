'use client'

import React from 'react'
import ProfileCard from './components/ProfileCard'
import WorkloadDashboard from './components/WorkloadDashboard'

export default function Page() {
  return (
    <>
      <div className="flex w-full flex-col-reverse gap-4 lg:flex-row">
        <div className="flex w-full flex-col gap-4">
          <div className="flex min-w-full flex-col gap-4">
            <div className="">
              <WorkloadDashboard />
            </div>
          </div>
        </div>
        <ProfileCard />
      </div>
    </>
  )
}
