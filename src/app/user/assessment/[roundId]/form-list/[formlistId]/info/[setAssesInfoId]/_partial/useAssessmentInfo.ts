'use client'

import { useSession } from 'next-auth/react'
import { useParams, useRouter } from 'next/navigation'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useAssessor } from '@/hooks/useAssessor'
import useUtility from '@/hooks/useUtility'
import WorkloadEvaluationService from '@/services/workloadEvaluationService'
import SetAssessorServices from '@/services/setAssessorServices'
import type { AssesseeSummary, RoundList } from '@/Types/setAssessor'
import type { UseAssessmentInfoResult } from './types'

export function useAssessmentInfo(): UseAssessmentInfoResult {
    const params = useParams()
    const router = useRouter()
    const { setBreadcrumbs } = useUtility()
    const { data: session, status } = useSession()
    const { isAssessor, loading: assessorLoading, isInitialized: isAssessorInitialized } = useAssessor()
    const isSessionLoading = status === 'loading'

    const roundIdParam = params?.roundId as string | undefined
    const formlistIdParam = params?.formlistId as string | undefined
    const setAssesInfoIdParam = params?.setAssesInfoId as string | undefined

    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [assesseeInfo, setAssesseeInfo] = useState<AssesseeSummary | null>(null)
    const [roundInfo, setRoundInfo] = useState<RoundList | null>(null)
    const [selectedComponent, setSelectedComponent] = useState<number | null>(null)
    const fetchDataKeyRef = useRef<string>('')
    const isFetchingDataRef = useRef(false)

    const assesseeDisplayName = useMemo(() => {
        if (!assesseeInfo) return ''
        const parts = [assesseeInfo.prefix_name, assesseeInfo.u_fname, assesseeInfo.u_lname]
            .filter((part): part is string => !!part && part.trim().length > 0)
        return parts.join(' ').replace(/\s+/g, ' ').trim()
    }, [assesseeInfo])

    const academicPositionDisplay = assesseeInfo?.position_name?.trim() || '-'
    const managementPositionDisplay = assesseeInfo?.ex_position_name?.trim() || '-'
    const combinedPositionDisplay = useMemo(() => {
        const values = [academicPositionDisplay, managementPositionDisplay].filter((value, index, self) => {
            const normalized = value?.trim() || '-'
            return normalized !== '-' && self.indexOf(value) === index
        })

        if (values.length === 0) return '-'
        return values.join(' / ')
    }, [academicPositionDisplay, managementPositionDisplay])

    const workloadGroupDisplay = assesseeInfo?.workload_group_name ?? '-'

    const roundTitle = useMemo(() => {
        if (roundInfo?.round_list_name) return roundInfo.round_list_name
        if (roundIdParam) return `รอบที่ ${roundIdParam}`
        return 'รอบการประเมิน'
    }, [roundInfo?.round_list_name, roundIdParam])

    useEffect(() => {
        if (!roundIdParam || isSessionLoading || assessorLoading || isLoading) return
        const breadcrumbs = [
            { text: 'ตรวจประเมินภาระงาน', path: '/user/assessment' },
            { text: roundTitle, path: `/user/assessment/${roundIdParam}/form-list` },
            { text: assesseeDisplayName || 'การประเมิน', path: selectedComponent !== null ? 'back-to-selection' : '#' },
        ]
        if (selectedComponent === 1) {
            breadcrumbs.push({ text: 'องค์ประกอบที่ 1 ผลสัมฤทธิ์ของงาน', path: '#' })
        } else if (selectedComponent === 2) {
            breadcrumbs.push({ text: 'องค์ประกอบที่ 2 พฤติกรรมการปฏิบัติงาน', path: '#' })
        }
        setBreadcrumbs(breadcrumbs)
    }, [roundIdParam, assesseeDisplayName, roundTitle, setBreadcrumbs, isSessionLoading, assessorLoading, isLoading, selectedComponent])

    const fetchData = useCallback(async () => {
        if (!session?.accessToken || !formlistIdParam || !setAssesInfoIdParam || isSessionLoading || assessorLoading) {
            return
        }

        // Create unique key for this fetch request
        const currentFetchKey = `${formlistIdParam}-${setAssesInfoIdParam}-${session.accessToken}`

        // Prevent duplicate API calls with same key or if already fetching
        if (fetchDataKeyRef.current === currentFetchKey || isFetchingDataRef.current) {
            return
        }

        // Set fetch key and flag
        fetchDataKeyRef.current = currentFetchKey
        isFetchingDataRef.current = true

        setIsLoading(true)
        setError(null)

        try {
            const data = await WorkloadEvaluationService.getEvaluation(
                Number(formlistIdParam),
                Number(setAssesInfoIdParam)
            )

            const evaluationPayload = Array.isArray(data) ? data[0] : data
            const setAssesListId = evaluationPayload.evaluation.set_asses_list_id
            const roundListId = evaluationPayload.evaluation.round_list_id

            const fetchPromises: Promise<void>[] = []

            if (setAssesListId) {
                fetchPromises.push(
                    SetAssessorServices.getAssesseeBySetAssesListId(setAssesListId)
                        .then((response) => {
                            const payload = Array.isArray(response.payload) ? response.payload[0] : response.payload
                            setAssesseeInfo(payload ?? null)
                        })
                        .catch((assesseeError) => {
                            console.error('Error fetching assessee info:', assesseeError)
                            setAssesseeInfo(null)
                        })
                )
            } else {
                setAssesseeInfo(null)
            }

            if (roundListId) {
                fetchPromises.push(
                    SetAssessorServices.getRoundListById(roundListId)
                        .then((response) => {
                            const payload = Array.isArray(response.payload) ? response.payload[0] : response.payload
                            setRoundInfo(payload ?? null)
                        })
                        .catch((roundError) => {
                            console.error('Error fetching round info:', roundError)
                            setRoundInfo(null)
                        })
                )
            } else {
                setRoundInfo(null)
            }

            if (fetchPromises.length > 0) {
                await Promise.all(fetchPromises)
            }
        } catch (err) {
            // Reset fetch key and flag on error so it can retry
            const currentFetchKey = `${formlistIdParam}-${setAssesInfoIdParam}-${session.accessToken}`
            if (fetchDataKeyRef.current === currentFetchKey) {
                fetchDataKeyRef.current = ''
            }
            isFetchingDataRef.current = false
            console.error('Error loading evaluation data:', err)
            setError('ไม่สามารถโหลดข้อมูลการประเมินได้')
        } finally {
            setIsLoading(false)
            isFetchingDataRef.current = false
        }
    }, [session?.accessToken, formlistIdParam, setAssesInfoIdParam, isSessionLoading, assessorLoading])

    useEffect(() => {
        if (!formlistIdParam || !setAssesInfoIdParam) {
            setError('ไม่พบข้อมูลสำหรับการประเมิน')
            setIsLoading(false)
            return
        }

        if (status === 'loading' || assessorLoading || !isAssessorInitialized) return

        if (status === 'unauthenticated') {
            router.replace('/login')
            return
        }

        if (!isAssessor) {
            router.replace('/user')
            return
        }

        // Create unique key for this fetch request
        const currentFetchKey = `${formlistIdParam}-${setAssesInfoIdParam}-${session?.accessToken}`

        // Only fetch if the key has changed (new params or remount)
        if (fetchDataKeyRef.current !== currentFetchKey) {
            void fetchData()
        }
    }, [status, assessorLoading, isAssessorInitialized, isAssessor, fetchData, router, formlistIdParam, setAssesInfoIdParam, session?.accessToken])

    const handleComponentClick = (componentNumber: number) => {
        setSelectedComponent(componentNumber)
    }

    useEffect(() => {
        const handleBackToSelection = () => {
            setSelectedComponent(null)
        }

        window.addEventListener('breadcrumb-back-to-selection', handleBackToSelection)
        return () => {
            window.removeEventListener('breadcrumb-back-to-selection', handleBackToSelection)
        }
    }, [])

    return {
        formlistIdParam,
        setAssesInfoIdParam,
        accessToken: session?.accessToken as string | undefined,
        isSessionLoading,
        assessorLoading,
        assesseeInfo,
        roundInfo,
        assesseeDisplayName,
        combinedPositionDisplay,
        workloadGroupDisplay,
        roundTitle,
        selectedComponent,
        handleComponentClick,
        isLoading,
        error,
    }
}
