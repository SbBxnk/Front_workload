'use client'

import { useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'

export default function NavigationProgress() {
  const pathname = usePathname()
  const [visible, setVisible] = useState(false)
  const [width, setWidth] = useState(0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const clearTimers = () => {
    if (intervalRef.current) clearInterval(intervalRef.current)
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current)
  }

  // แสดง bar ทันทีเมื่อ click link ภายใน app
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const anchor = (e.target as HTMLElement).closest('a')
      if (!anchor) return
      const href = anchor.getAttribute('href')
      if (
        !href ||
        href.startsWith('#') ||
        href.startsWith('http') ||
        href.startsWith('mailto') ||
        anchor.getAttribute('target') === '_blank'
      ) return

      clearTimers()
      setVisible(true)
      setWidth(15)

      // เพิ่ม width ทีละน้อยจนถึง 80% รอ navigation เสร็จ
      intervalRef.current = setInterval(() => {
        setWidth((prev) => {
          if (prev >= 80) {
            clearInterval(intervalRef.current!)
            return 80
          }
          return prev + Math.random() * 6 + 2
        })
      }, 120)
    }

    document.addEventListener('click', handleClick)
    return () => document.removeEventListener('click', handleClick)
  }, [])

  // navigation เสร็จ (pathname เปลี่ยน) → จบ bar
  useEffect(() => {
    clearTimers()
    setWidth(100)
    hideTimerRef.current = setTimeout(() => {
      setVisible(false)
      setWidth(0)
    }, 350)
  }, [pathname])

  if (!visible && width === 0) return null

  return (
    <div
      style={{ width: `${width}%`, opacity: visible ? 1 : 0 }}
      className="pointer-events-none fixed left-0 top-0 z-[9999] h-[3px] bg-business1 shadow-[0_0_6px_rgba(46,68,151,0.5)] transition-[width,opacity] duration-300 ease-out"
    />
  )
}
