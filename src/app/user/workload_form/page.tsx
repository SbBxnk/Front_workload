"use client"
import axios from "axios"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import useAuthHeaders from "@/hooks/Header"

interface Workload {
  task_id: number
  task_name: string
}

export default function WorkLoadForm() {
  const [workload, setWorkload] = useState<Workload[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const headers = useAuthHeaders()

  useEffect(() => {
    const fetchWorkloads = async () => {
      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API}/maintask`, { headers })
        setWorkload(response.data.data)
      } catch (err) {
        console.error(err)
        setError("Failed to load tasks")
      } finally {
        setLoading(false)
      }
    }

    fetchWorkloads()
    //eslint-disable-next-line
  }, [])

  const handleTaskClick = (task_id: number) => {
    router.push(`/user/workload_form/${task_id}`)
  }

  if (loading) {
    return (
      <div className="bg-white p-4 rounded-md shadow dark:bg-zinc-900 dark:text-gray-400 transition-all duration-300 ease-in-out">
        <div className="flex flex-col gap-4">
          {[...Array(6)].map((_, index) => (
            <div
              key={index}
              className="flex justify-start items-center w-full border border-gray-200 px-4 py-2 rounded-md gap-4 animate-pulse"
            >
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-200 dark:bg-zinc-700"></div>
              <div className="h-4 bg-gray-200 dark:bg-zinc-700 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) return <p className="text-red-500">{error}</p>

  return (
    <div className="bg-white p-4 rounded-md shadow dark:bg-zinc-900 dark:text-gray-400 transition-all duration-300 ease-in-out">
      <div className="flex flex-col gap-4">
        {workload.map((item, index) => (
          <button
            key={item.task_id}
            onClick={() => handleTaskClick(item.task_id)}
            className="flex justify-start items-center w-full border border-gray-200 px-4 py-2 rounded-md gap-4 text-nowrap cursor-pointer hover:bg-gray-50 dark:hover:bg-zinc-800"
          >
            <div className="flex-shrink-0 w-8 h-8 flex justify-center items-center rounded-full text-white bg-business1">
              <span className="flex items-center justify-center w-full h-full text-sm">{index + 1}</span>
            </div>
            <p className="text-gray-600 dark:text-gray-300 font-light text-nowrap overflow-hidden truncate">
              {item.task_name}
            </p>
          </button>
        ))}
      </div>
    </div>
  )
}