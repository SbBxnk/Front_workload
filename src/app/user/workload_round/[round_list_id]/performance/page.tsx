'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { jwtDecode } from 'jwt-decode'
import useUtility from '@/hooks/useUtility'
import PerformanceForm from './_performanceForm'
import SnapshotService from '@/services/snapshotService'

export default function PerformancePage() {
  const params = useParams()
  const { setBreadcrumbs } = useUtility()
  const { data: session } = useSession()
  const round_list_id = params.round_list_id as string
  const [user, setUser] = useState<any>(null)
  const [formlist_id, setFormlistId] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setBreadcrumbs([
      { text: 'ฟอร์มประเมินภาระงาน', path: '/user/workload_round' },
      { text: 'องค์ประกอบที่ 2 พฤติกรรมการปฏิบัติงาน', path: `/user/workload_round/${round_list_id}` },
      { text: 'พฤติกรรมการปฏิบัติงาน', path: `/user/workload_round/${round_list_id}/performance` },
    ])
  }, [setBreadcrumbs, round_list_id])

  // ดึงข้อมูล user จาก session
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

  // ดึง formlist_id
  useEffect(() => {
    const fetchFormlistId = async () => {
      if (!user?.id || !round_list_id) return

      try {
        setLoading(true)
        const response = await SnapshotService.getFormlistId(
          user.id,
          parseInt(round_list_id)
        )
        if (response.success && response.payload && response.payload.length > 0) {
          setFormlistId(response.payload[0].formlist_id)
        }
      } catch (error) {
        console.error('Error fetching formlist_id:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchFormlistId()
  }, [user?.id, round_list_id])

  if (loading) {
    return (
      <div className="rounded-md bg-white p-4 shadow dark:bg-zinc-900">
        <div className="flex items-center justify-center py-16">
          <div className="text-gray-600 dark:text-gray-400">กำลังโหลดข้อมูล...</div>
        </div>
      </div>
    )
  }

  return (
    <PerformanceForm
      userId={user?.id}
      roundId={parseInt(round_list_id)}
      formlist_id={formlist_id || undefined}
    />
  )
}
