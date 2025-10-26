'use client'
import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { jwtDecode } from 'jwt-decode'
import useUtility from '@/hooks/useUtility'
import StickyFooter from '@/components/StickyFooter'
import ConfirmSubmitFormModal from './confirmSubmitModal'
import WorkloadFormServices from '@/services/workloadFormServices'
import _successForm from './_successForm'
import _workloadForm from './_workloadForm'
import type { Terms, WorkloadGroup } from '@/Types'
import axios from 'axios'

export default function ExpositionSelection() {
    const params = useParams()
    const { setBreadcrumbs } = useUtility()
    const { data: session } = useSession()
    const round_list_id = params.round_list_id as string
    const router = useRouter()
    const [confirmSubmitFormModal, setConfirmSubmitFormModal] = useState<boolean>(false)
    const [user, setUser] = useState<any>(null)
    const [formStatus, setFormStatus] = useState<number | null>(null)
    const [workloadGroupInfo, setWorkloadGroupInfo] = useState<any>(null)
    const [terms, setTerms] = useState<Terms[]>([])
    const [loading, setLoading] = useState<boolean>(true)

    useEffect(() => {
        setBreadcrumbs([
            { text: 'ฟอร์มประเมินภาระงาน', path: '/user/workload_round' },
            { text: 'องค์ประกอบภาระงาน', path: `/user/workload_round/${round_list_id}` },
        ])
    }, [setBreadcrumbs, round_list_id])

    useEffect(() => {
        if (session?.accessToken) {
            try {
                const decoded = jwtDecode(session.accessToken) as any
                setUser(decoded)
            } catch (error) {
                console.error('Error decoding token:', error)
            }
        }
    }, [session?.accessToken])

    useEffect(() => {
        const fetchData = async () => {
            if (!user || !session?.accessToken) return

            try {
                setLoading(true)

                // ดึงข้อมูล terms
                const termsResponse = await axios.get(
                    `${process.env.NEXT_PUBLIC_API}/workload_form/terms`,
                    {
                        headers: {
                            Authorization: `Bearer ${session.accessToken}`
                        }
                    }
                )
                setTerms(termsResponse.data.payload || [])

                // ตรวจสอบ workload group ของผู้ใช้
                const workloadGroupResponse = await WorkloadFormServices.checkWorkloadGroup(
                    user.id,
                    parseInt(round_list_id),
                    session.accessToken
                )
                setWorkloadGroupInfo({
                    workload_group_id: workloadGroupResponse.data?.[0]?.workload_group_id || null,
                    workload_group_name: workloadGroupResponse.data?.[0]?.workload_group_name || null
                })

                // ตรวจสอบสถานะฟอร์ม
                try {
                    const formStatusResponse = await axios.get(
                        `${process.env.NEXT_PUBLIC_API}/workload_form/status/${user.id}/${round_list_id}`,
                        {
                            headers: {
                                Authorization: `Bearer ${session.accessToken}`
                            }
                        }
                    )
                    console.log('🔍 Form Status Response:', formStatusResponse.data)

                    // API response มีโครงสร้าง: { success: true, payload: [{ status: 1 }] }
                    if (formStatusResponse.data.success && formStatusResponse.data.payload && formStatusResponse.data.payload.length > 0) {
                        setFormStatus(formStatusResponse.data.payload[0].status || 0)
                    } else {
                        setFormStatus(0) // ไม่มีข้อมูล = ยังไม่ส่ง
                    }
                } catch (statusError) {
                    console.error('Error fetching form status:', statusError)
                    setFormStatus(0)
                }

            } catch (error) {
                console.error('Error fetching data:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [user, session?.accessToken, round_list_id])

    const handleSubmitForm = async () => {
        if (!user || !round_list_id) {
            console.error('❌ Missing user data or round_list_id')
            return
        }

        try {
            const response = await WorkloadFormServices.submitWorkloadForm(user.id, parseInt(round_list_id), session?.accessToken || '')

            if (response.success) {
                // อัปเดต status เป็น 1
                setFormStatus(1)
                router.push('/user/workload_round')
            } else {
                console.error('❌ Failed to submit form:', response.message)
            }
        } catch (error) {
            console.error('❌ Error submitting form:', error)
        }
    }

    const handleExpositionClick = (expositionNumber: number) => {
        if (expositionNumber === 1) {
            // ตัวเลือกที่ 1 ไปหน้า maintask
            router.push(`/user/workload_round/${round_list_id}/form`)
        } else if (expositionNumber === 2) {
            // ตัวเลือกที่ 2 ไปหน้าว่างเปล่า
            router.push(`/user/workload_round/${round_list_id}/coming-soon`)
        }
    }

    if (loading) {
        console.log('🔍 Loading state:', loading)
        return (
            <div className="rounded-md bg-white p-4 shadow">
                <div className="flex flex-col gap-4">
                    {[...Array(2)].map((_, index) => (
                        <div
                            key={index}
                            className="flex w-full animate-pulse items-center justify-start gap-4 rounded-md border border-gray-200 px-4 py-2"
                        >
                            <div className="h-8 w-8 flex-shrink-0 rounded-full bg-gray-200 dark:bg-zinc-700"></div>
                            <div className="h-4 w-3/4 rounded bg-gray-200 dark:bg-zinc-700"></div>
                        </div>
                    ))}
                </div>
            </div>
        )
    }

    console.log('🔍 Current state:', { formStatus, loading, user: user?.id, round_list_id })

    // แสดง _successForm เมื่อ status = 1
    if (formStatus === 1) {
        console.log('🔍 Showing _successForm because formStatus = 1')
        return (
            <_successForm
                terms={terms}
                selectedGroupName={workloadGroupInfo?.workload_group_name || undefined}
                userId={user?.id || undefined}
                roundId={parseInt(round_list_id) || undefined}
            />
        )
    }

    return (
        <>
            <div className="rounded-md bg-white p-4 shadow flex flex-col gap-4">
                <div className="flex flex-col gap-4">
                    {/* สมรรถนะที่ 1 */}
                    <button
                        onClick={() => handleExpositionClick(1)}
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

                    {/* สมรรถนะที่ 2 */}
                    <button
                        onClick={() => handleExpositionClick(2)}
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

                <StickyFooter
                    onSubmit={() => {
                        console.log('Submit button clicked, opening modal')
                        setConfirmSubmitFormModal(true)
                    }}
                    onPreview={() => {
                        router.push(`/user/workload_round/${round_list_id}/preview`)
                    }}
                    showSubmitOnly={true}
                    showPreview={true}
                    submitText="ส่งข้อมูล"
                    previewText="ดูตัวอย่าง"
                />
                <ConfirmSubmitFormModal
                    isOpen={confirmSubmitFormModal}
                    onConfirm={() => {
                        handleSubmitForm()
                        setConfirmSubmitFormModal(false)
                    }}
                    onClose={() => setConfirmSubmitFormModal(false)}
                />
            </div>
        </>
    )
}
