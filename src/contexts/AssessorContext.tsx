'use client'

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { jwtDecode } from 'jwt-decode'
import AssessorService, { AssessorData } from '@/services/assessorService'
import type { DecodedToken } from '@/Types/decodetoken'

interface AssessorContextType {
  isAssessor: boolean
  assessorId?: number
  roundListId?: number
  loading: boolean
  error: string | null
  refreshAssessorData: () => Promise<void>
  clearAssessorData: () => void
}

const AssessorContext = createContext<AssessorContextType | undefined>(undefined)

interface AssessorProviderProps {
  children: React.ReactNode
}

export function AssessorProvider({ children }: AssessorProviderProps) {
  const { data: session, status } = useSession()
  const [assessorData, setAssessorData] = useState<AssessorData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isInitialized, setIsInitialized] = useState(false)

  /**
   * ดึงข้อมูล assessor จาก cache หรือ API
   */
  const fetchAssessorData = useCallback(async (forceRefresh: boolean = false) => {
    if (!session?.accessToken || status !== 'authenticated') {
      setAssessorData(null)
      return
    }

    // ตรวจสอบว่ามีข้อมูลใน cache หรือไม่ ถ้ามีและไม่บังคับ refresh ให้ใช้ cache
    if (!forceRefresh) {
      const cachedData = AssessorService.getFromSessionStorage()
      if (cachedData) {
        setAssessorData(cachedData)
        return
      }
    }

    try {
      setLoading(true)
      setError(null)

      const decoded: DecodedToken = jwtDecode(session.accessToken)
      const data = await AssessorService.getAssessorData(
        decoded.id,
        session.accessToken,
        forceRefresh
      )

      setAssessorData(data)
    } catch (err) {
      console.error('Error fetching assessor data:', err)
      setError('เกิดข้อผิดพลาดในการดึงข้อมูล assessor')
      
      // ถ้าเกิด error ให้ลองดึงจาก cache
      const cachedData = AssessorService.getFromSessionStorage()
      if (cachedData) {
        setAssessorData(cachedData)
      }
    } finally {
      setLoading(false)
    }
  }, [session?.accessToken, status])

  /**
   * Refresh ข้อมูล assessor ใหม่
   */
  const refreshAssessorData = useCallback(async () => {
    await fetchAssessorData(true)
  }, [fetchAssessorData])

  /**
   * ลบข้อมูล assessor
   */
  const clearAssessorData = useCallback(() => {
    AssessorService.clearSessionStorage()
    setAssessorData(null)
    setError(null)
    setIsInitialized(false)
  }, [])

  // ดึงข้อมูลเมื่อ session เปลี่ยน
  useEffect(() => {
    if (status === 'authenticated' && session?.accessToken && !isInitialized) {
      // ลองดึงจาก cache ก่อน
      const cachedData = AssessorService.getFromSessionStorage()
      if (cachedData) {
        setAssessorData(cachedData)
        setIsInitialized(true)
      } else {
        // ถ้าไม่มี cache ให้ดึงจาก API
        fetchAssessorData().then(() => {
          setIsInitialized(true)
        })
      }
    } else if (status === 'unauthenticated') {
      // ถ้า logout ให้ลบข้อมูล
      clearAssessorData()
    }
  }, [session?.accessToken, status, fetchAssessorData, clearAssessorData, isInitialized])

  const value: AssessorContextType = {
    isAssessor: assessorData?.isAssessor || false,
    assessorId: assessorData?.assessorId,
    roundListId: assessorData?.roundListId,
    loading,
    error,
    refreshAssessorData,
    clearAssessorData,
  }

  return (
    <AssessorContext.Provider value={value}>
      {children}
    </AssessorContext.Provider>
  )
}

export function useAssessorContext(): AssessorContextType {
  const context = useContext(AssessorContext)
  if (context === undefined) {
    throw new Error('useAssessorContext must be used within an AssessorProvider')
  }
  return context
}

export default AssessorProvider
