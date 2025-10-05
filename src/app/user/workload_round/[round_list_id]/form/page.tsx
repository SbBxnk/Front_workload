'use client'
import axios from 'axios'
import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import useAuthHeaders from '@/hooks/Header'
import useUtility from '@/hooks/useUtility'
import StickyFooter from '@/components/StickyFooter'
import ConfirmSubmitFormModal from './confirmSubmitModal'

interface Workload {
  task_id: number
  task_name: string
}

export default function WorkLoadForm() {
  const params = useParams()
  const {setBreadcrumbs} = useUtility()
  const round_list_id = params.round_list_id as string
  const [workload, setWorkload] = useState<Workload[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const headers = useAuthHeaders()
  const [confirmSubmitFormModal, setConfirmSubmitFormModal] = useState<boolean>(false)
  useEffect(() => {
    setBreadcrumbs(
      [{ text: 'รอบประเมินภาระงาน', path: '/user/workload_round' },
        { text: 'ภาระงานหลัก', path: `/user/workload_round/${round_list_id}/form` },
      ])
  }, [setBreadcrumbs])

  useEffect(() => {
    const fetchWorkloads = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API}/maintask`,
          { headers }
        )
        setWorkload(response.data.data)
      } catch (err) {
        console.error(err)
        setError('Failed to load tasks')
      } finally {
        setLoading(false)
      }
    }

    fetchWorkloads()
    //eslint-disable-next-line
  }, [])

  const handleTaskClick = (task_id: number, round_list_id: string) => {
    router.push(`/user/workload_round/${round_list_id}/form/${task_id}`)
  }

  if (loading) {
    return (
      <div className="rounded-md bg-white p-4 shadow transition-all duration-300 ease-in-out dark:bg-zinc-900 dark:text-gray-400">
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
    <div className="rounded-md bg-white p-4 shadow transition-all duration-300 ease-in-out dark:bg-zinc-900 dark:text-gray-400">
    
      <div className="flex flex-col gap-4">
        {workload.map((item, index) => (
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
              {item.task_name}
            </p>
          </button>
        ))}
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
        handleSelectWorkloadGroup={() => {
          // Handle submit logic here
          console.log('Form submitted')
          setConfirmSubmitFormModal(false)
        }}
        workload_group={null}
        onClose={() => setConfirmSubmitFormModal(false)}
      />
    </div>
  )
}
