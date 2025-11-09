'use client'
import { useEffect, useState } from 'react'
import { useRouter, useParams, useSearchParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { jwtDecode } from 'jwt-decode'
import useUtility from '@/hooks/useUtility'
import StickyFooter from '@/components/StickyFooter'
import ConfirmSubmitFormModal from './_partial/confirmSubmitModal'
import WorkloadFormServices from '@/services/workloadFormServices'
import SnapshotService from '@/services/snapshotService'
import _successForm from './_successForm'

export default function ExpositionSelection() {
    const params = useParams()
    const searchParams = useSearchParams()
    const { setBreadcrumbs } = useUtility()
    const { data: session } = useSession()
    const round_list_id = params.round_list_id as string
    const router = useRouter()
    const [confirmSubmitFormModal, setConfirmSubmitFormModal] = useState<boolean>(false)
    const [user, setUser] = useState<any>(null)
    const [formStatus, setFormStatus] = useState<number | null>(null)
    const [workloadGroupInfo, setWorkloadGroupInfo] = useState<any>(null)
    const [loading, setLoading] = useState<boolean>(true)
    
    // ตรวจสอบ query parameter success
    const isSuccess = searchParams.get('success') === 'true'

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

    // ดึงข้อมูลครั้งเดียวเมื่อ user พร้อม
    useEffect(() => {
        const fetchData = async () => {
            if (!user || !session?.accessToken) return

            try {
                setLoading(true)

                // ตรวจสอบ workload group ของผู้ใช้ผ่าน service
                const workloadGroupResponse = await WorkloadFormServices.checkWorkloadGroup(
                    user.id,
                    parseInt(round_list_id),
                    session.accessToken
                )
                setWorkloadGroupInfo({
                    workload_group_id: workloadGroupResponse.data?.[0]?.workload_group_id || null,
                    workload_group_name: workloadGroupResponse.data?.[0]?.workload_group_name || null
                })

                // ตรวจสอบสถานะฟอร์มผ่าน service
                try {
                    const formStatusResponse = await WorkloadFormServices.checkWorkloadFormStatus(
                        user.id,
                        parseInt(round_list_id),
                        session.accessToken
                    )

                    // API response มีโครงสร้าง: { success: true, payload: [{ status: 1 }] }
                    if (formStatusResponse.success && formStatusResponse.payload && formStatusResponse.payload.length > 0) {
                        setFormStatus(formStatusResponse.payload[0].status || 0)
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
    }, [user, session?.accessToken, round_list_id]) // dependencies ที่สำคัญ

    const handleSubmitForm = async () => {
        if (!user || !round_list_id) {
            console.error('❌ Missing user data or round_list_id')
            return
        }

        try {
            // ดึง formlist_id จากฐานข้อมูล
            const formlistResponse = await SnapshotService.getFormlistId(
                user.id,
                parseInt(round_list_id)
            )

            if (!formlistResponse.success || !formlistResponse.payload) {
                alert('ไม่พบข้อมูลฟอร์มสำหรับผู้ใช้และรอบนี้')
                return
            }

            const formlist_id = formlistResponse.payload[0].formlist_id
            const set_asses_list_id = formlistResponse.payload[0].set_asses_list_id
            
            console.log('Formlist response:', formlistResponse)
            console.log('Formlist payload:', formlistResponse.payload)
            console.log('Formlist ID:', formlist_id)
            console.log('Set Assessor List ID:', set_asses_list_id)
            console.log('User ID:', user.id)
            console.log('Round ID:', round_list_id)
            
            if (!formlist_id || !set_asses_list_id) {
                alert('ไม่พบ formlist_id หรือ set_asses_list_id ใน response')
                return
            }
            
            const submitData = {
                formlist_id: formlist_id,
                as_u_id: user.id,
                round_list_id: parseInt(round_list_id)
            }

            console.log('Submitting form with snapshot:', submitData)
            
            // 1. อัปเดต status จาก 0 เป็น 1 (API เดิม)
            const updateStatusResponse = await WorkloadFormServices.updateWorkloadFormStatus(
                set_asses_list_id, // ใช้ set_asses_list_id แทน formlist_id
                1, // status = 1 (ส่งแล้ว)
                session?.accessToken || ''
            )

            if (!updateStatusResponse.success) {
                alert('เกิดข้อผิดพลาดในการอัปเดตสถานะฟอร์ม: ' + updateStatusResponse.message)
                return
            }

            // 2. สร้าง snapshot (API ใหม่)
            const snapshotResponse = await SnapshotService.submitFormWithSnapshot(
                submitData
            )

            if (snapshotResponse.success) {
                alert('ส่งฟอร์มสำเร็จ! ข้อมูลถูกเก็บเป็น snapshot แล้ว')
                // Redirect กลับไปหน้า workload_round
                router.push('/user/workload_round')
            } else {
                alert('เกิดข้อผิดพลาดในการสร้าง snapshot: ' + snapshotResponse.message)
            }
        } catch (error) {
            console.error('❌ Error submitting form:', error)
            alert('เกิดข้อผิดพลาดในการส่งฟอร์ม')
        }
    }

    const handleExpositionClick = (expositionNumber: number) => {
        if (expositionNumber === 1) {
            // ตัวเลือกที่ 1 ไปหน้า maintask
            router.push(`/user/workload_round/${round_list_id}/form`)
        } else if (expositionNumber === 2) {
            // ตัวเลือกที่ 2 ไปหน้าว่างเปล่า
            router.push(`/user/workload_round/${round_list_id}/performance`)
        }
    }

    // if (loading) {
    //     console.log('🔍 Loading state:', loading)
    //     return (
    //         <div className="rounded-md bg-white p-4 shadow">
    //             <div className="flex flex-col gap-4">
    //                 {[...Array(2)].map((_, index) => (
    //                     <div
    //                         key={index}
    //                         className="flex w-full animate-pulse items-center justify-start gap-4 rounded-md border border-gray-200 px-4 py-2"
    //                     >
    //                         <div className="h-8 w-8 flex-shrink-0 rounded-full bg-gray-200 dark:bg-zinc-700"></div>
    //                         <div className="h-4 w-3/4 rounded bg-gray-200 dark:bg-zinc-700"></div>
    //                     </div>
    //                 ))}
    //             </div>
    //         </div>
    //     )
    // }

    // แสดง _successForm เมื่อฟอร์มถูกส่งแล้ว (สถานะ = 1)
    // หรือเมื่อมี query parameter success=true
    if (formStatus === 1 || isSuccess) {
        return (
            <div className="">
                {isSuccess && (
                    <div className="mb-6">
                        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-2">
                            ส่งฟอร์มภาระงานสำเร็จ
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400">
                            ข้อมูลภาระงานของคุณถูกเก็บเป็น snapshot แล้ว และจะไม่เปลี่ยนแปลงแม้ว่าจะมีการแก้ไขข้อมูลหลักในระบบ
                        </p>
                    </div>
                )}
                <_successForm 
                    selectedGroupName={workloadGroupInfo?.workload_group_name || undefined}
                    userId={user?.id || undefined}
                    roundId={parseInt(round_list_id) || undefined}
                />
            </div>
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
