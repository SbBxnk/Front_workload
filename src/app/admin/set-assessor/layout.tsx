'use client';
import React, { Suspense } from 'react'
import Skeleton from './set-assessorComponents/Skeleton'

function Layout({ children }: { children: React.ReactNode }) {

  return (
    <>
      <Suspense fallback={<Skeleton />}>
        {children}
      </Suspense>
    </>
  )
}

export default Layout