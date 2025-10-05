'use client'
import { useParams } from 'next/navigation'
import type React from 'react'
import { useEffect, useState } from 'react'
import axios from 'axios'
import useAuthHeaders from '@/hooks/Header'
import { useRouter } from 'next/navigation'
import useUtility from '@/hooks/useUtility'

interface SubTaskDetail {
  subtask_id: number
  subtask_name: string
  task_id: number
}

export default function WorkloadSubtask() {
  const params = useParams()
  const { setBreadcrumbs } = useUtility()
  const router = useRouter()
  const task_id = params.task_id
  const headers = useAuthHeaders()
  const round_list_id = params.round_list_id as string
  const [subtasks, setSubtasks] = useState<SubTaskDetail[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setBreadcrumbs(
      [{ text: 'รอบประเมินภาระงาน', path: '/user/workload_round' },
        { text: 'ภาระงานหลัก', path: `/user/workload_round/${round_list_id}/form` },
        { text: 'ภาระงานย่อย', path: `/user/workload_round/${round_list_id}/form/${task_id}` },
      ])
  }, [])

  useEffect(() => {
    const fetchTaskAndSubtasks = async () => {
      try {
        const subtaskResponse = await axios.get(
          `${process.env.NEXT_PUBLIC_API}/subtask/task/${task_id}`,
          { headers }
        )
        const fetchedSubtasks = subtaskResponse.data.data.map(
          (subtask: SubTaskDetail) => ({
            ...subtask,
            subsubtasks: [],
          })
        )
        setSubtasks(fetchedSubtasks)
      } catch (err) {
        console.error(err)
        setError('Failed to load task or subtasks')
      } finally {
        setLoading(false)
      }
    }

    if (task_id) fetchTaskAndSubtasks()
    //eslint-disable-next-line
  }, [task_id])

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="mb-4 rounded-md bg-white p-4 shadow dark:bg-zinc-900">
          <div className="space-y-4">
            {[1, 2, 3, 4,5,6,7].map((item) => (
              <div
                key={item}
                className="flex w-full items-center justify-start gap-4 rounded-md border border-gray-200 px-4 py-2"
              >
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gray-200 dark:bg-zinc-700">
                </div>
                <div className="h-4 w-48 bg-gray-200 rounded dark:bg-zinc-700"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }
  if (error) return <p className="text-red-500">{error}</p>

  const handleSubTaskClick = (subtask_id: number, round_list_id: string) => {
    router.push(`/user/workload_round/${round_list_id}/form/${task_id}/subtask/${subtask_id}`)
  }
  return (
    <div className="">
      <div className="mb-4 rounded-md bg-white p-4 shadow dark:bg-zinc-900 dark:text-gray-400">
        <div className="space-y-4">
          {subtasks.map((subtask, index) => (
            <button
              key={subtask.subtask_id}
              onClick={() => handleSubTaskClick(subtask.subtask_id, round_list_id)}
              className="flex w-full cursor-pointer items-center justify-start gap-4 text-nowrap rounded-md border border-gray-200 px-4 py-2 hover:bg-gray-50 dark:hover:bg-zinc-800"
            >
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-business1/60 text-white">
                <span className="flex h-full w-full items-center justify-center text-sm">
                  {index + 1}
                </span>
              </div>
              <p className="overflow-hidden truncate text-nowrap font-light text-gray-600 dark:text-gray-300">
                {subtask.subtask_name}
              </p>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
