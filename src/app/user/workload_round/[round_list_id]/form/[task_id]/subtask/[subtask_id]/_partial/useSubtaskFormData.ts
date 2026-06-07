'use client'
import { useEffect, useState, useRef } from 'react'
import { useParams } from 'next/navigation'
import { jwtDecode } from 'jwt-decode'
import { useSession } from 'next-auth/react'
import useUtility from '@/hooks/useUtility'
import WorkloadFormServices from '@/services/workloadFormServices'
import SubTaskServices from '@/services/subTaskServices'
import type {
  ApiFormData,
  DecodedToken,
  FileData,
  FileInfo,
  FormInfo,
  LinkData,
  Subtask,
  WorkloadGroup,
} from './types'

export function useSubtaskFormData() {
  const { subtask_id, task_id, round_list_id } = useParams()
  const { data: session } = useSession()
  const [subtask, setSubtask] = useState<Subtask | null>(null)
  const [subtaskIndex, setSubtaskIndex] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [userId, setUserId] = useState<number | null>(null)
  const [workloadGroupInfo, setWorkloadGroupInfo] =
    useState<WorkloadGroup | null>(null)
  const [formList, setFormList] = useState<
    (FormInfo & { total_score: number })[]
  >([])
  const [fileInfos, setFileInfos] = useState<{ [form_id: number]: FileInfo[] }>(
    {}
  )
  const [formFiles, setFormFiles] = useState<{ [form_id: number]: FileData[] }>(
    {}
  )
  const [formLinks, setFormLinks] = useState<{ [form_id: number]: LinkData[] }>(
    {}
  )
  const [formSystemFiles, setFormSystemFiles] = useState<{
    [form_id: number]: FileData
  }>({})
  const [, setFormFileNames] = useState<{ [form_id: number]: string }>({})
  const [isOpen, setIsOpen] = useState<{ [index: number]: boolean }>({})
  const { setBreadcrumbs } = useUtility()
  const hasFetched = useRef(false)
  useEffect(() => {
    setBreadcrumbs(
      [
        { text: 'ฟอร์มประเมินภาระงาน', path: '/user/workload_round' },
        { text: 'องค์ประกอบที่ 1 ผลสัมฤทธิ์ของงาน', path: `/user/workload_round/${round_list_id}` },
        { text: 'ภาระงานหลัก', path: `/user/workload_round/${round_list_id}/form` },
        { text: 'ภาระงานย่อย', path: `/user/workload_round/${round_list_id}/form/${task_id}` },
        { text: 'ฟอร์มภาระงานย่อย', path: `/user/workload_round/${round_list_id}/form/${task_id}/subtask/${subtask_id}` },
      ])
  }, [setBreadcrumbs])

  useEffect(() => {
    if (session?.accessToken) {
      try {
        const decoded = jwtDecode<DecodedToken>(session.accessToken)
        setUserId(decoded.id)
      } catch (error) {
        console.error('Error decoding token:', error)
      }
    }
  }, [session?.accessToken])

  useEffect(() => {
    const checkWorkloadGroup = async () => {
      if (userId && round_list_id && session?.accessToken) {
        try {
          const response = await WorkloadFormServices.checkWorkloadGroup(userId, parseInt(round_list_id as string))

          // ใช้ legacy format เหมือนเดิม
          const data = response.data
          setWorkloadGroupInfo(data?.[0] || null)
        } catch (error: unknown) {
          console.error('checkWorkloadGroup error:', error)
          if (
            (error as { response?: { status?: number } })?.response?.status ===
            404
          ) {
            setWorkloadGroupInfo(null)
          }
        }
      }
    }

    checkWorkloadGroup()
    // eslint-disable-next-line
  }, [userId, round_list_id, session?.accessToken])

  useEffect(() => {
    // ป้องกันการเรียก API ซ้ำใน React Strict Mode
    if (hasFetched.current) return
    if (!subtask_id || !task_id) return

    hasFetched.current = true

    const fetchData = async () => {
      try {
        const [subtaskResponse, taskSubtasksResponse] = await Promise.all([
          SubTaskServices.getSubTaskById(
            Number(subtask_id)
          ),
          SubTaskServices.getSubTasksByTask(
            Number(task_id)
          ),
        ])

        const subtaskData: Subtask =
          (subtaskResponse as any)?.data ||
          (subtaskResponse as any)?.payload ||
          (subtaskResponse as any)
        const taskSubtasks: Subtask[] =
          (taskSubtasksResponse as any)?.data ||
          (taskSubtasksResponse as any)?.payload ||
          (Array.isArray(taskSubtasksResponse)
            ? (taskSubtasksResponse as any)
            : [])


        if (subtaskData && subtaskData.subtask_id) {
          setSubtask(subtaskData)
        } else {
          setSubtask({ subtask_id: 0, subtask_name: 'ไม่พบข้อมูล' })
        }

        if (Array.isArray(taskSubtasks) && taskSubtasks.length > 0) {
          const sortedSubtasks = taskSubtasks.sort(
            (a, b) => a.subtask_id - b.subtask_id
          )
          const index = sortedSubtasks.findIndex(
            (st) => st.subtask_id === Number(subtask_id)
          )

          setSubtaskIndex(
            index !== -1 ? `${task_id}.${index + 1}` : 'Subtask ไม่พบ'
          )
        } else {
          setSubtaskIndex('Subtask ไม่พบ')
        }
      } catch (err: any) {
        console.error('❌ Error fetching data:', err)
        console.error('❌ Error details:', err.response?.data)
        setError('เกิดข้อผิดพลาดในการโหลดข้อมูล')
        setSubtask({ subtask_id: 0, subtask_name: 'ไม่พบข้อมูล' })
        setSubtaskIndex('Subtask ไม่พบ')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subtask_id, task_id])

  useEffect(() => {
    const fetchFormInfo = async () => {
      if (workloadGroupInfo?.formlist_id && subtask_id && session?.accessToken) {
        try {
          // เพิ่ม userId ในการเรียก API
          const response = await WorkloadFormServices.getFormInfo(
            workloadGroupInfo.formlist_id,
            Number(subtask_id),
            userId || 0
          )


          // ใช้ legacy format เหมือนเดิม
          const data = response.data
          const apiForms: ApiFormData[] = (data || []) as ApiFormData[]

          const newForms: (FormInfo & { total_score: number })[] = apiForms.map(
            (apiForm) => ({
              form_id: apiForm.form_id,
              as_u_id: apiForm.as_u_id,
              formlist_id: apiForm.formlist_id,
              form_title: apiForm.form_title,
              description: apiForm.description,
              quality: apiForm.quality,
              workload: apiForm.workload,
              file_type: apiForm.file_type,
              ex_score: apiForm.ex_score,
              subtask_id: Number(subtask_id),
              total_score: apiForm.quality * apiForm.workload,
            })
          )

          const initialOpenState = newForms.reduce(
            (acc, _, index) => {
              acc[index] = true
              return acc
            },
            {} as { [index: number]: boolean }
          )
          setIsOpen(initialOpenState)

          const newFormFiles: { [form_id: number]: FileData[] } = {}
          apiForms.forEach((apiForm) => {
            if (
              apiForm.file_type === 'external file' &&
              apiForm.files.length > 0
            ) {
              newFormFiles[apiForm.form_id] = apiForm.files
            }
          })

          // Update to handle multiple links per form
          const newFormLinks: { [form_id: number]: LinkData[] } = {}
          apiForms.forEach((apiForm) => {
            if (apiForm.file_type === 'link') {
              // Check if the API response has links in a specific format
              if (apiForm.links && Array.isArray(apiForm.links)) {
                newFormLinks[apiForm.form_id] = apiForm.links.map((link) => ({
                  link_id: link.link_id,
                  link_path: link.link_path,
                  link_name: link.link_name || link.link_path,
                  form_id: apiForm.form_id,
                }))
              }
              // Fallback to the old format if needed
              else if (apiForm.link && apiForm.link !== '-') {
                newFormLinks[apiForm.form_id] = [
                  {
                    link_path: apiForm.link,
                    link_name: apiForm.link_name || apiForm.link,
                    form_id: apiForm.form_id,
                  },
                ]
              } else {
                // Initialize with empty array if no links
                newFormLinks[apiForm.form_id] = []
              }
            }
          })

          setFormList(newForms)
          setFormFiles(newFormFiles)
          setFormLinks(newFormLinks)

          apiForms.forEach((apiForm) => {
            fetchFilesForForm(apiForm.form_id)
          })
        } catch (error) {
          if (
            (error as { response?: { status?: number } })?.response?.status ===
            404
          ) {
            setFormList([])
            setFormFiles({})
            setFormLinks({})
            setIsOpen({})
          } else {
            console.error('Error fetching form info:', error)
            setError('เกิดข้อผิดพลาดในการโหลดข้อมูลฟอร์ม')
          }
        }
      }
    }

    fetchFormInfo()
    // eslint-disable-next-line
  }, [workloadGroupInfo?.formlist_id, subtask_id, userId, session?.accessToken])


  const fetchFilesForForm = async (formlist_id: number) => {
    if (!session?.accessToken) return

    try {
      const response = await WorkloadFormServices.getFileInfo(workloadGroupInfo?.formlist_id || 0)
      // ใช้ legacy format เหมือนเดิม
      const data = response.data
      const files: FileInfo[] = data || []
      setFileInfos((prev) => ({ ...prev, [formlist_id]: files }))
    } catch (error) {
      if (
        (error as { response?: { status?: number } })?.response?.status === 404
      ) {
        setFileInfos((prev) => ({ ...prev, [formlist_id]: [] }))
      } else {
        console.error(`Error fetching files for form ${formlist_id}:`, error)
      }
    }
  }

  return {
    subtask_id,
    session,
    subtask,
    subtaskIndex,
    loading,
    error,
    userId,
    workloadGroupInfo,
    formList,
    setFormList,
    fileInfos,
    formFiles,
    setFormFiles,
    formLinks,
    setFormLinks,
    formSystemFiles,
    setFormSystemFiles,
    setFormFileNames,
    isOpen,
    setIsOpen,
  }
}
