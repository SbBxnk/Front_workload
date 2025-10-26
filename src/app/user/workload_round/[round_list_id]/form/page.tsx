'use client'
import axios from 'axios'
import { useEffect, useState, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { jwtDecode } from 'jwt-decode'
import useAuthHeaders from '@/hooks/Header'
import useUtility from '@/hooks/useUtility'
import StickyFooter from '@/components/StickyFooter'
import ConfirmSubmitFormModal from './confirmSubmitModal'
import WorkloadFormServices from '@/services/workloadFormServices'

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
  const headers = useAuthHeaders()
  const [confirmSubmitFormModal, setConfirmSubmitFormModal] = useState<boolean>(false)
  const hasFetched = useRef(false)
  useEffect(() => {
    setBreadcrumbs(
      [{ text: 'รอบประเมินภาระงาน', path: '/user/workload_round' },
        { text: 'ภาระงานหลัก', path: `/user/workload_round/${round_list_id}/form` },
      ])
  }, [setBreadcrumbs])

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
        console.log('🔍 Fetching workload data...')
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API}/maintask`,
          { 
            headers,
            params: {
              sort: 'task_id',  // เรียงตาม task_id
              order: 'asc',     // เรียงจากน้อยไปมาก
              limit: 100        // เพิ่ม limit เพื่อให้ได้ข้อมูลทั้งหมด
            }
          }
        )
        
        console.log('🔍 Workload API Response:', response.data)
        
        const workloadData = response.data.payload || []
        console.log('🔍 Setting workload data:', workloadData)
        console.log('🔍 Task IDs order:', workloadData.map((item: Workload) => item.task_id))
        
        // เรียงลำดับใน frontend เป็น fallback
        const sortedWorkloadData = workloadData.sort((a: Workload, b: Workload) => a.task_id - b.task_id)
        console.log('🔍 Sorted Task IDs:', sortedWorkloadData.map((item: Workload) => item.task_id))
        
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

  const handleSubmitForm = async () => {
    
    if (!user || !round_list_id) {
      console.error('❌ Missing user data or round_list_id')
      return
    }

    try {
      const response = await WorkloadFormServices.submitWorkloadForm(user.id, parseInt(round_list_id), session?.accessToken || '')

      if (response.success) {
        router.push('/user/workload_round')
      } else {
        console.error('❌ Failed to submit form:', response.message)
      }
    } catch (error) {
      console.error('❌ Error submitting form:', error)
    }
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
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-business1 text-white">
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
      <StickyFooter
        onSubmit={() => {
          console.log('Submit button clicked, opening modal')
          setConfirmSubmitFormModal(true)
        }}
        showSubmitOnly={true}
        submitText="ส่งข้อมูล"
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
  )
}
