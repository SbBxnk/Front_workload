'use client'

import { useSession } from 'next-auth/react'
import { useParams, useRouter } from 'next/navigation'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Loader2, Armchair, Calendar, User, Book } from 'lucide-react'
import { useAssessor } from '@/hooks/useAssessor'
import useUtility from '@/hooks/useUtility'
import WorkloadEvaluationService from '@/services/workloadEvaluationService'
import SetAssessorServices, { AssesseeSummary, RoundList } from '@/services/setAssessorServices'
import Component1Content from './form/form1'
import Component2Content from './form/form2'

export default function AssessmentComponentSelectionPage() {
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
                session.accessToken as string,
                Number(formlistIdParam),
                Number(setAssesInfoIdParam)
            )

            const evaluationPayload = Array.isArray(data) ? data[0] : data
            const accessToken = session.accessToken as string
            const setAssesListId = evaluationPayload.evaluation.set_asses_list_id
            const roundListId = evaluationPayload.evaluation.round_list_id

            const fetchPromises: Promise<void>[] = []

            if (setAssesListId) {
                fetchPromises.push(
                    SetAssessorServices.getAssesseeBySetAssesListId(setAssesListId, accessToken)
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
                    SetAssessorServices.getRoundListById(roundListId, accessToken)
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

    if (isSessionLoading || assessorLoading || isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <Loader2 className="h-10 w-10 animate-spin text-business1" />
            </div>
        )
    }

    if (error) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="rounded-lg border border-red-300 bg-red-50 p-6 text-red-700">
                    <h2 className="text-xl font-semibold mb-2">เกิดข้อผิดพลาด</h2>
                    <p>{error}</p>
                </div>
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-4">
            <div className="z-10 rounded-md bg-white p-4 shadow dark:bg-zinc-900 dark:text-gray-400">
                <h2 className="mb-4 text-lg font-medium text-gray-700 dark:text-gray-300">
                    รอบการประเมินปัจจุบัน
                </h2>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                    {/* ตำแหน่งผู้รับการประเมิน */}
                    <div>
                        <p className="flex items-center gap-2 text-sm font-light text-gray-500">
                            <Armchair className="h-4 w-4" />
                            ตำแหน่งผู้รับการประเมิน
                        </p>
                        <p className="text-md p-2 font-normal">
                            {combinedPositionDisplay}
                        </p>
                    </div>
                    {/* ชื่อ-สกุลผู้รับการประเมิน */}
                    <div>
                        <p className="flex items-center gap-2 text-sm font-light text-gray-500">
                            <User className="h-4 w-4" />
                            ชื่อ-สกุล
                        </p>
                        <p className="text-md p-2 font-normal">
                            {assesseeDisplayName || '-'}
                        </p>
                    </div>
                    {/* รอบ / ปีงบประมาณ */}
                    <div>
                        <p className="flex items-center gap-2 text-sm font-light text-gray-500">
                            <Calendar className="h-4 w-4" />
                            รอบ / ปีงบประมาณ
                        </p>
                        <p className="text-md p-2 font-normal">
                            {roundInfo?.round ?? '-'} / {roundInfo?.year ?? '-'}
                        </p>
                    </div>
                    {/* กลุ่มภาระงาน */}
                    <div>
                        <p className="flex items-center gap-2 text-sm font-light text-gray-500">
                            <Book className="h-4 w-4" />
                            กลุ่มภาระงาน
                        </p>
                        <div className="text-md relative flex items-center gap-2 p-2 font-normal">
                            {workloadGroupDisplay || '-'}
                        </div>
                    </div>
                </div>
            </div>

            {selectedComponent === null ? (
                <div className="rounded-md bg-white p-4 shadow flex flex-col gap-4">
                    <div className="flex flex-col gap-4">
                        {/* องค์ประกอบที่ 1 */}
                        <button
                            onClick={() => handleComponentClick(1)}
                            className="flex w-full cursor-pointer items-center justify-start gap-4 text-nowrap rounded-md border border-gray-200 px-4 py-2 hover:bg-gray-50 dark:hover:bg-zinc-800"
                        >
                            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-business1 text-white">
                                <span className="flex h-full w-full items-center justify-center text-sm">
                                    1
                                                                </span>
                                                        </div>
                            <p className="overflow-hidden truncate text-nowrap font-light text-gray-600 dark:text-gray-300">
                                องค์ประกอบที่ 1 ผลสัมฤทธิ์ของงาน
                            </p>
                        </button>

                        {/* องค์ประกอบที่ 2 */}
                        <button
                            onClick={() => handleComponentClick(2)}
                            className="flex w-full cursor-pointer items-center justify-start gap-4 text-nowrap rounded-md border border-gray-200 px-4 py-2 hover:bg-gray-50 dark:hover:bg-zinc-800"
                        >
                            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-business1 text-white">
                                <span className="flex h-full w-full items-center justify-center text-sm">
                                    2
                                                                    </span>
                                                                </div>
                            <p className="overflow-hidden truncate text-nowrap font-light text-gray-600 dark:text-gray-300">
                                องค์ประกอบที่ 2 พฤติกรรมการปฏิบัติงาน
                            </p>
                                                                                        </button>
                    </div>
                </div>
            ) : (
                <div className="flex flex-col gap-4">
                    {selectedComponent === 1 && session?.accessToken && (
                        <Component1Content
                            formlistIdParam={formlistIdParam!}
                            setAssesInfoIdParam={setAssesInfoIdParam!}
                            accessToken={session.accessToken as string}
                        />
                    )}

                    {selectedComponent === 2 && session?.accessToken && (
                        <Component2Content
                            formlistIdParam={formlistIdParam!}
                            setAssesInfoIdParam={setAssesInfoIdParam!}
                            accessToken={session.accessToken as string}
                            roundListId={roundInfo?.round_list_id}
                            assesseeUserId={assesseeInfo?.as_u_id}
                        />
                    )}
                </div>
            )}
        </div>
    )
}
