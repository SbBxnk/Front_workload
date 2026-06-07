'use client'
import { useEffect, useState, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { jwtDecode } from 'jwt-decode'
import useUtility from '@/hooks/useUtility'
import WorkloadFormServices from '@/services/workloadFormServices'
import MainTaskServices from '@/services/mainTaskServices'

interface Workload {
  task_id: number
  task_name: string
}

interface UserLoginData {
  id: number
  u_fname: string
  u_lname: string
  u_email: string
  level_name: string
  prefix_id: number
  position_id: number
  course_id: number
  ex_position_id: number
  type_p_id: number
  u_id_card: string
  u_img: string
  u_tel: string
  work_start: string
}

export default function WorkLoadForm() {
  const params = useParams()
  const {setBreadcrumbs} = useUtility()
  const { data: session } = useSession()
  const round_list_id = params.round_list_id as string
  const [workload, setWorkload] = useState<Workload[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [user, setUser] = useState<UserLoginData | null>(null)
  const router = useRouter()
  const hasFetched = useRef(false)

  useEffect(() => {
    setBreadcrumbs([
      { text: 'ฟอร์มประเมินภาระงาน', path: '/user/workload_round' },
      { text: 'องค์ประกอบที่ 1 ผลสัมฤทธิ์ของงาน', path: `/user/workload_round/${round_list_id}` },
      { text: 'ภาระงานหลัก', path: `/user/workload_round/${round_list_id}/form` },
    ])
  }, [setBreadcrumbs, round_list_id])

  // ดึงข้อมูล user จาก session
  useEffect(() => {
    if (session?.accessToken) {
      try {
        const decoded: UserLoginData = jwtDecode(session.accessToken)
        setUser(decoded)
      } catch (error) {
        console.error('JWT Decode Error:', error)
      }
    }
  }, [session?.accessToken])

  useEffect(() => {
    // ป้องกันการเรียก API ซ้ำใน React Strict Mode
    if (hasFetched.current) return
    hasFetched.current = true

    const fetchWorkloads = async () => {
      try {
        const response = await MainTaskServices.getAllMainTasks(
          session?.accessToken ?? '',
          { sort: 'task_id', order: 'asc', limit: 100 }
        )

        const workloadData = response.payload || []
        
        // เรียงลำดับใน frontend เป็น fallback
        const sortedWorkloadData = workloadData.sort((a: Workload, b: Workload) => a.task_id - b.task_id)
        
        setWorkload(sortedWorkloadData)
      } catch (err) {
        console.error('❌ Error fetching workload:', err)
        setError('Failed to load tasks')
        setWorkload([]) // Set empty array as fallback
      } finally {
        setLoading(false)
      }
    }

    fetchWorkloads()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleTaskClick = (task_id: number, round_list_id: string) => {
    router.push(`/user/workload_round/${round_list_id}/form/${task_id}`)
  }


  if (loading) {
    return (
      <div className="rounded-md bg-white p-4 shadow ">
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

  if (error) return <p className="text-red-500">{error}</p>

  return (
    <div className="rounded-md bg-white p-4 shadow ">
    
      <div className="flex flex-col gap-4">
        {Array.isArray(workload) && workload.length > 0 ? (
          workload.map((item, index) => (
            <button
              key={item.task_id}
              onClick={() => handleTaskClick(item.task_id, round_list_id)}
              className="flex w-full cursor-pointer items-center justify-start gap-4 text-nowrap rounded-md border border-gray-200 px-4 py-2 hover:bg-gray-50 dark:hover:bg-zinc-800"
            >
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-blue-600 text-white">
                <span className="flex h-full w-full items-center justify-center text-sm">
                  {index + 1}
                </span>
              </div>
              <p className="overflow-hidden truncate text-nowrap font-light text-gray-600 dark:text-gray-300">
                {item?.task_name || 'Unknown Task'}
              </p>
            </button>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="text-lg font-medium text-gray-500 dark:text-gray-400 mb-2">
              ไม่พบข้อมูลภาระงาน
            </div>
            <div className="text-sm text-gray-400 dark:text-gray-500">
              กรุณาติดต่อผู้ดูแลระบบ
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
