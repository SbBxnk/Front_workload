"use client"
import { useParams } from "next/navigation"
import type React from "react"
import { useEffect, useState } from "react"
import axios from "axios"
import useAuthHeaders from "@/hooks/Header"
import { useRouter } from "next/navigation"
import { Loader } from "lucide-react"

interface SubTaskDetail {
  subtask_id: number;
  subtask_name: string;
  task_id: number;
}


export default function WorkloadSubtask() {
  const params = useParams();
  const router = useRouter();
  const task_id = params.task_id;
  const headers = useAuthHeaders();
  const [subtasks, setSubtasks] = useState<SubTaskDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);


  useEffect(() => {
    const fetchTaskAndSubtasks = async () => {
      try {
        const subtaskResponse = await axios.get(`${process.env.NEXT_PUBLIC_API}/subtask/task/${task_id}`, { headers });
        const fetchedSubtasks = subtaskResponse.data.data.map((subtask: SubTaskDetail) => ({
          ...subtask,
          subsubtasks: [],
        }));
        setSubtasks(fetchedSubtasks);
      } catch (err) {
        console.error(err);
        setError("Failed to load task or subtasks");
      } finally {
        setLoading(false);
      }
    };

    if (task_id) fetchTaskAndSubtasks();
    //eslint-disable-next-line
  }, [task_id]);



  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-base-100 rounded-md">
        <div className="flex justify-center items-center space-x-4">
          <Loader className="animate-spin text-primary h-12 w-12 font-semibold" />
          <p className="text-4xl font-regular text-primary">Loading...</p>
        </div>
      </div>
    )
  }
  if (error) return <p className="text-red-500">{error}</p>;

  const handleSubTaskClick = (subtask_id: number) => {
      router.push(`/user/workload_form/${task_id}/${subtask_id}`);
  }
  return (
    <div className="">
      <div className="bg-white p-4 rounded-md shadow dark:bg-zinc-900 dark:text-gray-400 mb-4">
          <div className="space-y-4">
            {subtasks.map((subtask, index) => (
              <button
                key={subtask.subtask_id}
                onClick={() => handleSubTaskClick(subtask.subtask_id)}
                className="flex justify-start items-center w-full border border-gray-200 px-4 py-2 rounded-md gap-4 text-nowrap cursor-pointer hover:bg-gray-50 dark:hover:bg-zinc-800"
              >
                <div className="flex-shrink-0 w-8 h-8 flex justify-center items-center rounded-full text-white bg-business1">
                  <span className="flex items-center justify-center w-full h-full text-sm">{index + 1}</span>
                </div>
                <p className="text-gray-600 dark:text-gray-300 font-light text-nowrap overflow-hidden truncate">
                  {subtask.subtask_name}
                </p>
              </button>
            ))}
          </div>
      </div>
    </div>
  );
}
