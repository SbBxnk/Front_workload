'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { jwtDecode } from 'jwt-decode'
import useUtility from '@/hooks/useUtility'
import WorkloadForm from '../_workloadForm'
import type { Terms } from '@/Types'
import WorkloadFormServices from '@/services/workloadFormServices'

export default function PreviewPage() {
    const params = useParams()
    const { setBreadcrumbs } = useUtility()
    const { data: session } = useSession()
    const round_list_id = params.round_list_id as string
    const [user, setUser] = useState<any>(null)
    const [workloadGroupInfo, setWorkloadGroupInfo] = useState<any>(null)
    const [terms, setTerms] = useState<Terms[]>([])
    const [loading, setLoading] = useState<boolean>(true)

    useEffect(() => {
        setBreadcrumbs([
            { text: 'ฟอร์มประเมินภาระงาน', path: '/user/workload_round' },
            { text: 'องค์ประกอบภาระงาน', path: `/user/workload_round/${round_list_id}` },
            { text: 'ดูตัวอย่าง', path: `/user/workload_round/${round_list_id}/preview` },
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

                // ดึงข้อมูล terms ผ่าน service
                const termsResponse = await WorkloadFormServices.getTerms()
                setTerms(termsResponse.payload || [])

                // ตรวจสอบ workload group ของผู้ใช้
                const workloadGroupResponse = await WorkloadFormServices.checkWorkloadGroup(
                    user.id,
                    parseInt(round_list_id)
                )
                setWorkloadGroupInfo({
                    workload_group_id: workloadGroupResponse.data?.[0]?.workload_group_id || null,
                    workload_group_name: workloadGroupResponse.data?.[0]?.workload_group_name || null
                })

            } catch (error) {
                console.error('Error fetching data:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [user, session?.accessToken, round_list_id])

    if (loading) {
        return (
            <div className="rounded-md bg-white p-4 shadow">
                <div className="flex flex-col gap-4">
                    {[...Array(6)].map((_, index) => (
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

    return (
        <div className="rounded-md bg-white p-4 shadow">
           
            
            <WorkloadForm
                terms={terms}
                selectedGroupName={workloadGroupInfo?.workload_group_name || undefined}
                userId={user?.id || undefined}
                roundId={parseInt(round_list_id) || undefined}
                isPreview={true}
            />
        </div>
    )
}
