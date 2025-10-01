'use client'

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { jwtDecode } from 'jwt-decode'
import AssessorServices, { AssessorData } from '@/services/assessorService'
import AssessorEvaluationService, { AssessorEvaluation } from '@/services/assessorEvaluationService'
import type { DecodedToken } from '@/Types/decodetoken'

interface AssessorContextType {
  isAssessor: boolean
  assessorId?: number
  roundListId?: number
  evaluations: AssessorEvaluation[]
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
  const [evaluations, setEvaluations] = useState<AssessorEvaluation[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isInitialized, setIsInitialized] = useState(false)

  // Load data from sessionStorage on mount
  useEffect(() => {
    const storedAssessorData = sessionStorage.getItem('assessorData')
    const storedEvaluations = sessionStorage.getItem('assessorEvaluations')
    
    if (storedAssessorData) {
      try {
        const parsedData = JSON.parse(storedAssessorData)
        setAssessorData(parsedData)
      } catch (error) {
        console.error('❌ AssessorProvider - Error parsing stored data:', error)
        sessionStorage.removeItem('assessorData')
      }
    }
    
    if (storedEvaluations) {
      try {
        const parsedEvaluations = JSON.parse(storedEvaluations)
        setEvaluations(parsedEvaluations)
      } catch (error) {
        console.error('❌ AssessorProvider - Error parsing stored evaluations:', error)
        sessionStorage.removeItem('assessorEvaluations')
      }
    }
  }, [])

  const fetchAssessorData = useCallback(async (forceRefresh: boolean = false) => {
    if (!session?.accessToken || status !== 'authenticated') {
      setAssessorData(null)
      return
    }

    try {
      setLoading(true)
      setError(null)

      const decoded: DecodedToken = jwtDecode(session.accessToken)
      
      const data = await AssessorServices.checkAssessor(
        decoded.id,
        session.accessToken
      )

      setAssessorData(data)
      
      // เก็บข้อมูลใน sessionStorage
      sessionStorage.setItem('assessorData', JSON.stringify(data))

      // ถ้าเป็น assessor ให้ดึงรายการการประเมินด้วย
      if (data.isAssessor) {
        try {
          const evaluationsData = await AssessorEvaluationService.getAssessorEvaluations(
            decoded.id,
            session.accessToken
          )
          setEvaluations(evaluationsData)
          
          // เก็บข้อมูล evaluations ใน sessionStorage
          sessionStorage.setItem('assessorEvaluations', JSON.stringify(evaluationsData))
        } catch (evalError) {
          console.error('❌ AssessorContext - Error fetching evaluations:', evalError)
          setEvaluations([])
          sessionStorage.removeItem('assessorEvaluations')
        }
      } else {
        setEvaluations([])
        sessionStorage.removeItem('assessorEvaluations')
      }
    } catch (err) {
      console.error('❌ AssessorContext - Error fetching assessor data:', err)
      setError('เกิดข้อผิดพลาดในการดึงข้อมูล assessor')
    } finally {
      setLoading(false)
    }
  }, [session?.accessToken, status])

  const refreshAssessorData = useCallback(async () => {
    await fetchAssessorData(true)
  }, [fetchAssessorData])

  const clearAssessorData = useCallback(() => {
    setAssessorData(null)
    setEvaluations([])
    setError(null)
    setIsInitialized(false)
  }, [])

  // ดึงข้อมูลเมื่อ session เปลี่ยน
  useEffect(() => {
    if (status === 'authenticated' && session?.accessToken && !isInitialized) {
      const hasStoredData = sessionStorage.getItem('assessorData')
      
      if (hasStoredData) {
        setIsInitialized(true)
      } else {
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
    evaluations,
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
