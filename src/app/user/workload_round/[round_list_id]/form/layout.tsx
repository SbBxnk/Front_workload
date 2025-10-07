

'use client'
import axios from 'axios'
import type React from 'react'
import { useEffect, useState, useRef } from 'react'
import type { Terms, WorkloadGroup } from '@/Types'
import useAuthHeaders from '@/hooks/Header'
import { jwtDecode } from 'jwt-decode'
import { useSession } from 'next-auth/react'
import { useAssessor } from '@/hooks/useAssessor'
import SetAssessorServices from '@/services/setAssessorServices'
import { useParams } from 'next/navigation'
import {
  CalendarClock,
  Book,
  Calendar,
  Tag,
  ClockIcon as ClockAlert,
  TriangleAlertIcon,
  AlertCircle,
} from 'lucide-react'
import ConfirmModal from './confirmModal'
import InfoHoverModal from './infoTermModal'
import _successForm from './_successForm'
import useUtility from '@/hooks/useUtility'
import WorkloadFormServices from '@/services/workloadFormServices'

interface Round {
  round_list_id: number
  round_list_name: string
  year: string
  round: number
  date_start: string
  date_end: string
}

interface Assessor {
  as_id: number
  as_u_id: number
  as_round_list_id: number
  as_status: string
  ex_u_id: number
  ex_u_fname: string
  ex_u_lname: string
}

interface DecodedToken {
  id: number
}

interface CheckWorkloadGroupResponse {
  workload_group_id: number | null
  workload_group_name: string | null
}

const formatThaiDate = (dateString: string) => {
  const date = new Date(dateString)
  const thaiMonths = [
    'มกราคม',
    'กุมภาพันธ์',
    'มีนาคม',
    'เมษายน',
    'พฤษภาคม',
    'มิถุนายน',
    'กรกฎาคม',
    'สิงหาคม',
    'กันยายน',
    'ตุลาคม',
    'พฤศจิกายน',
    'ธันวาคม',
  ]

  const day = date.getDate()
  const month = thaiMonths[date.getMonth()]
  const year = date.getFullYear() + 543

  return `${day} ${month} ${year}`
}

function ClientLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const [, setSelectedGroup] = useState<string | null>(null)
  const [terms, setTerms] = useState<Terms[]>([])
  const { setBreadcrumbs } = useUtility()
  const [workloadGroups, setWorkloadGroups] = useState<WorkloadGroup[]>([])
  const [allRounds, setAllRounds] = useState<Round[]>([])
  const [currentRound, setCurrentRound] = useState<Round | null>(null)
  const [targetRound, setTargetRound] = useState<Round | null>(null)
  const [loading, setLoading] = useState(true)
  // ใช้ useAssessor hook แทน state และ API call
  const { isAssessor: isUserAssessor } = useAssessor()
  const [workloadGroupInfo, setWorkloadGroupInfo] = useState<CheckWorkloadGroupResponse | null>(null)
  const [userId, setUserId] = useState<number | null>(null)
  const headers = useAuthHeaders()
  const [selectedWorkloadGroup, setSelectedWorkloadGroup] =
    useState<WorkloadGroup | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [formStatus, setFormStatus] = useState<number | null>(null)
  const infoIconRef = useRef<HTMLDivElement>(null)
  const { data: session } = useSession()
  const params = useParams()
  const roundId = params?.round_list_id ? parseInt(params.round_list_id as string) : null

  useEffect(() => {
    setBreadcrumbs(
      [{ text: 'รอบประเมินภาระงาน', path: '/user/workload_round' },
        { text: 'ภาระงานหลัก', path: `/user/workload_round/${roundId}/form` },
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
      if (userId) {
        try {
          const response = await axios.get(
            `${process.env.NEXT_PUBLIC_API}/workload_form/check_workload_group/${userId}`,
            { headers }
          )
          setWorkloadGroupInfo(response.data.data[0] || null)
        } catch (error: unknown) {
          if (axios.isAxiosError(error) && error.response?.status === 404) {
            setWorkloadGroupInfo(null)
          } else {
            console.error('Error checking workload group:', error)
          }
        }
      }
    }

    checkWorkloadGroup()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId])

  // เช็ค status ของ workload form
  useEffect(() => {
    const checkFormStatus = async () => {
      if (userId && roundId && session?.accessToken) {
        try {
          const response = await WorkloadFormServices.checkWorkloadFormStatus(userId, roundId, session.accessToken)
          if (response.success && response.payload) {
            const data = Array.isArray(response.payload) ? response.payload[0] : response.payload
            if (data) {
              setFormStatus(data.status)
            }
          }
        } catch (error) {
          console.error('Error checking form status:', error)
        }
      }
    }

    checkFormStatus()
  }, [userId, roundId, session?.accessToken])

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const responseTerms = await axios.get(
          `${process.env.NEXT_PUBLIC_API}/workload_form/terms`,
          { headers }
        )
        const responseWorkloadGroups = await axios.get(
          `${process.env.NEXT_PUBLIC_API}/workload_group`,
          { headers }
        )
        const responseRounds = await SetAssessorServices.getAllRounds(session?.accessToken || '')

        setWorkloadGroups(responseWorkloadGroups.data.data)
        setTerms(responseTerms.data.data)

        const fetchedRounds = Array.isArray(responseRounds.payload) ? responseRounds.payload : []
        setAllRounds(fetchedRounds as unknown as Round[])

        const currentDate = new Date()
        const activeRound = fetchedRounds.find((round: any) => {
          const startDate = new Date(round.date_start)
          const endDate = new Date(round.date_end)
          return currentDate >= startDate && currentDate <= endDate
        })

         // หารอบที่ผู้ใช้พยายามเข้าถึง
         const targetRoundData = roundId ? fetchedRounds.find((round: any) => round.round_list_id === roundId) : null
         setTargetRound(targetRoundData as unknown as Round || null)
        setCurrentRound(activeRound as unknown as Round || null)
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }

    if (userId) {
      fetchData()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId])

  // ดึงรายการภาระงานที่ไม่ซ้ำกันจากข้อมูล API (เรียงจากล่างขึ้นบน)
  const uniqueTasks = Array.isArray(terms)
    ? [...new Set(terms.map((term) => term.task_name))].reverse()
    : []

  // ดึงกลุ่มงานที่ไม่ซ้ำกันจากข้อมูล API
  const uniqueGroups = Array.isArray(terms)
    ? [...new Set(terms.map((term) => term.workload_group_name))]
    : []

  // ฟังก์ชันหาจำนวนชั่วโมงตามภาระงานและกลุ่มงาน
  const getWorkloadHours = (taskName: string, groupName: string) => {
    if (!Array.isArray(terms)) return 0

    const item = terms.find(
      (term) =>
        term.task_name === taskName && term.workload_group_name === groupName
    )
    return item ? item.quantity_workload_hours : 0
  }

  // คำนวณผลรวมของแต่ละกลุ่ม
  const calculateGroupTotal = (groupName: string) => {
    if (!Array.isArray(terms)) return 0

    let total = 0
    uniqueTasks.forEach((taskName) => {
      total += getWorkloadHours(taskName, groupName)
    })
    return total
  }

  // ตรวจสอบสถานะของรอบ
  const getRoundStatus = (round: Round | null) => {
    if (!round) {
      return 'not_found'
    }
    
    const currentDate = new Date()
    const startDate = new Date(round.date_start)
    const endDate = new Date(round.date_end)
    
   
    
    if (currentDate < startDate) {
      return 'not_started'
    }
    if (currentDate > endDate) {
      return 'ended'
    }
    return 'active'
  }

  const handleSelectWorkloadGroup = async (workload_group: WorkloadGroup) => {
    if (!userId || !currentRound) {
      console.error('Missing userId or currentRound')
      alert('ไม่สามารถเลือกกลุ่มภาระงานได้ กรุณาลองใหม่')
      return
    }

    const payload = {
      workload_group_id: workload_group.workload_group_id,
      round_id: currentRound.round_list_id,
    }

    try {
      const response = await WorkloadFormServices.selectWorkloadFormGroup(userId, workload_group.workload_group_id, currentRound.round_list_id, session?.accessToken || '')
      

      if (response.status) {
        // อัปเดต workloadGroupInfo และ selectedGroup
        setWorkloadGroupInfo({
          workload_group_id: workload_group.workload_group_id,
          workload_group_name: workload_group.workload_group_name,
        })
        setSelectedGroup(workload_group.workload_group_name)
      } else {
        console.error('Error from API:', response.message)
      }
    } catch (error) {
      console.error('Error updating workload group:', error)
    }
  }

  // Close modal when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        infoIconRef.current &&
        !infoIconRef.current.contains(event.target as Node)
      ) {
        setIsModalOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [infoIconRef])

  if (loading) {
    return (
      <div className="rounded-md transition-all duration-300 ease-in-out dark:text-gray-400">
        <div className="flex flex-col gap-4">
          {/* Skeleton for round info */}
          <div className="rounded-md bg-white p-4 shadow dark:bg-zinc-900 dark:text-gray-400">
            <div className="mb-4 h-6 w-48 animate-pulse rounded bg-gray-200 dark:bg-zinc-700"></div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
              {[...Array(4)].map((_, index) => (
                <div key={index} className="space-y-4">
                  <div className="h-4 w-24 animate-pulse rounded bg-gray-200 dark:bg-zinc-700"></div>
                  <div className="h-8 w-full animate-pulse rounded bg-gray-200 dark:bg-zinc-700"></div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Skeleton for workload criteria table */}
          <div className="rounded-md bg-white px-4 pt-4 pb-1 shadow dark:bg-zinc-900 dark:text-gray-400">
            <div className="mb-4 h-6 w-80 animate-pulse rounded bg-gray-200 dark:bg-zinc-700"></div>
            <div className="my-4 overflow-x-auto">
              <table className="w-full overflow-x-auto border border-gray-300 bg-white dark:border-gray-700 dark:bg-zinc-900 md:table-auto">
                <thead className="bg-gray-100 dark:bg-zinc-800">
                  <tr>
                    <th className="border-b border-r border-gray-300 px-4 py-3 text-left text-gray-700 dark:text-gray-300">
                      <div className="h-4 w-20 animate-pulse rounded bg-gray-200 dark:bg-zinc-700"></div>
                    </th>
                    {[...Array(4)].map((_, index) => (
                      <th key={index} className="text-md text-nowrap border-b border-r border-gray-300 px-4 py-2 text-center font-normal text-gray-600 dark:text-gray-300">
                        <div className="h-4 w-24 animate-pulse rounded bg-gray-200 dark:bg-zinc-700 mx-auto"></div>
                        <div className="mt-1 h-3 w-20 animate-pulse rounded bg-gray-200 dark:bg-zinc-700 mx-auto"></div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[...Array(5)].map((_, taskIndex) => (
                    <tr key={taskIndex} className="hover:bg-gray-50 dark:hover:bg-zinc-800">
                      <td className="text-md text-nowrap border-b border-r border-gray-300 px-4 py-3 font-normal text-gray-700">
                        <div className="h-4 w-48 animate-pulse rounded bg-gray-200 dark:bg-zinc-700"></div>
                      </td>
                      {[...Array(4)].map((_, groupIndex) => (
                        <td key={groupIndex} className="border-b border-r border-gray-300 px-4 py-2 text-center text-gray-500">
                          <div className="h-4 w-8 animate-pulse rounded bg-gray-200 dark:bg-zinc-700 mx-auto"></div>
                        </td>
                      ))}
                    </tr>
                  ))}
                  <tr className="bg-gray-100 font-bold dark:bg-zinc-800">
                    <td className="border-b border-r border-gray-300 px-4 py-2 text-center font-normal text-gray-600">
                      <div className="h-4 w-32 animate-pulse rounded bg-gray-200 dark:bg-zinc-700 mx-auto"></div>
                    </td>
                    {[...Array(4)].map((_, groupIndex) => (
                      <td key={groupIndex} className="border-b border-r border-gray-300 px-4 py-2 text-center font-normal text-business1">
                        <div className="h-4 w-8 animate-pulse rounded bg-gray-200 dark:bg-zinc-700 mx-auto"></div>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          
          {/* Skeleton for workload group selection */}
          <div className="rounded-md bg-white p-4 shadow dark:bg-zinc-900 dark:text-gray-400">
            <div className="mb-4 h-6 w-48 animate-pulse rounded bg-gray-200 dark:bg-zinc-700"></div>
            <div className="flex flex-wrap gap-2">
              {[...Array(4)].map((_, index) => (
                <div key={index} className="h-10 w-24 animate-pulse rounded bg-gray-200 dark:bg-zinc-700"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  const targetRoundStatus = getRoundStatus(targetRound)

  return (
    <>
      {targetRoundStatus === 'not_found' ? (
        <div className="mb-4 rounded-md bg-white p-6 shadow dark:bg-zinc-900 dark:text-gray-400">
          <div className="flex flex-col items-center justify-center gap-4 py-8 text-center">
            <ClockAlert className="h-12 w-12 text-blue-500 md:h-24 md:w-24" />
            <div className="">
              <h2 className="mb-2 text-4xl font-medium text-gray-700 dark:text-gray-300">
                ไม่พบรอบการประเมิน
              </h2>
              <p className="text-gray-500 dark:text-gray-400">
                ไม่พบรอบการประเมินที่คุณพยายามเข้าถึง
                กรุณาตรวจสอบ URL หรือติดต่อผู้ดูแลระบบ
              </p>
            </div>
          </div>
        </div>
      ) : targetRoundStatus === 'not_started' ? (
        <div className="h-[calc(100vh-6rem)] rounded-md bg-white p-6 shadow dark:bg-zinc-900 dark:text-gray-400">
          <div className="flex flex-col items-center justify-center gap-4 py-8 text-center">
            <ClockAlert className="h-12 w-12 text-amber-500 md:h-24 md:w-24" />
            <div className="">
              <h2 className="mb-2 text-4xl font-medium text-gray-700 dark:text-gray-300">
                กำลังรอดำเนินการ
              </h2>
              <p className="text-gray-500 dark:text-gray-400">
                รอบการประเมินนี้ยังไม่เริ่มต้น
                กรุณาตรวจสอบอีกครั้งในภายหลัง
              </p>
            </div>
          </div>
        </div>
      ) : targetRoundStatus === 'ended' ? (
        <div className="h-[calc(100vh-6rem)] rounded-md bg-white p-6 shadow dark:bg-zinc-900 dark:text-gray-400">
          <div className="flex flex-col items-center justify-center gap-4 py-8 text-center">
            <TriangleAlertIcon className="h-12 w-12 text-red-500 md:h-24 md:w-24" />
            <div className="">
              <h2 className="mb-2 text-4xl font-medium text-gray-700 dark:text-gray-300">
                การประเมินสิ้นสุด
              </h2>
              <p className="text-gray-500 dark:text-gray-400">
                รอบการประเมินนี้สิ้นสุดแล้ว
                ไม่สามารถเข้าถึงได้อีกต่อไป
              </p>
            </div>
          </div>
        </div>
      ) : !currentRound ? (
        <div className="h-[calc(100vh-6rem)] rounded-md bg-white p-6 shadow dark:bg-zinc-900 dark:text-gray-400">
          <div className="flex flex-col items-center justify-center gap-4 py-8 text-center">
            <ClockAlert className="h-12 w-12 text-blue-500 md:h-24 md:w-24" />
            <div className="">
              <h2 className="mb-2 text-4xl font-medium text-gray-700 dark:text-gray-300">
                ยังไม่มีรอบการประเมิน
              </h2>
              <p className="text-gray-500 dark:text-gray-400">
                ไม่พบรอบการประเมินที่ตรงกับวันที่ปัจจุบัน
                กรุณาตรวจสอบอีกครั้งในภายหลัง
              </p>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* รอบปัจจุบัน - แสดงเฉพาะเมื่อมีสิทธิในการประเมิน */}
          {isUserAssessor && (
            <div className="mb-4 rounded-md bg-white p-4 shadow dark:bg-zinc-900 dark:text-gray-400">
              <h2 className="mb-4 text-lg font-medium text-gray-700 dark:text-gray-300">
                รอบการประเมินปัจจุบัน
              </h2>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                <div className="">
                  <p className="flex items-center gap-2 text-sm font-light text-gray-500">
                    <Tag className="h-4 w-4" />
                    ชื่อรอบการประเมิน
                  </p>
                  <p className="text-md text-md p-2 font-normal">
                    {currentRound.round_list_name}
                  </p>
                </div>
                <div className="">
                  <p className="flex items-center gap-2 text-sm font-light text-gray-500">
                    <Calendar className="h-4 w-4" />
                    รอบ / ปีงบประมาณ
                  </p>
                  <p className="text-md text-md p-2 font-normal">
                    {currentRound.round} / {currentRound.year}
                  </p>
                </div>
                <div className="">
                  <p className="flex items-center gap-2 text-sm font-light text-gray-500">
                    <CalendarClock className="h-4 w-4" />
                    ระยะเวลา
                  </p>
                  <p className="text-md text-md p-2 font-normal">
                    {formatThaiDate(currentRound.date_start)} -{' '}
                    {formatThaiDate(currentRound.date_end)}
                  </p>
                </div>
                <div className="">
                  <p className="flex items-center gap-2 text-sm font-light text-gray-500">
                    <Book className="h-4 w-4" />
                    กลุ่มภาระงาน
                  </p>
                  <div className="text-md text-md relative flex items-center gap-2 p-2 font-normal">
                    {workloadGroupInfo?.workload_group_name || '-'}
                    {/* หากไม่มีการเลือก workload_group_id จะไม่แสดง info */}
                    {workloadGroupInfo?.workload_group_id && (
                      <div
                        ref={infoIconRef}
                        className="cursor-pointer text-gray-400 hover:text-gray-500"
                        onMouseEnter={() => setIsModalOpen(true)}
                        onMouseLeave={() => setIsModalOpen(false)}
                      >
                        <AlertCircle className="h-4 w-4" />
                        {isModalOpen && (
                          <InfoHoverModal
                            workloadGroupInfo={workloadGroupInfo}
                            isOpen={isModalOpen}
                          />
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* เลือกกลุ่มภาระงาน - แสดงเฉพาะเมื่อเป็นผู้ประเมิน */}
          {isUserAssessor ? (
            !workloadGroupInfo ||
            workloadGroupInfo.workload_group_id === 0 ||
            workloadGroupInfo.workload_group_id === null ||
            !workloadGroupInfo.workload_group_name ? (
              <div className="space-y-4">
                {Array.isArray(terms) && terms.length > 0 && (
                  <div className="rounded-md bg-white px-4 pt-4 pb-1 shadow transition-all duration-300 ease-in-out dark:bg-zinc-900 dark:text-gray-400">
                    <h2 className="text-lg font-medium text-gray-700">
                      เกณฑ์การประเมินภาระงานของแต่ละด้านภาระงาน
                    </h2>
                    <div className="my-4 overflow-x-auto">
                      <table className="w-full overflow-x-auto border border-gray-300 bg-white dark:border-gray-700 dark:bg-zinc-900 md:table-auto">
                        <thead className="bg-gray-100 dark:bg-zinc-800">
                          <tr>
                            <th className="border-b border-r border-gray-300 px-4 py-3 text-left text-gray-700 dark:text-gray-300"></th>
                            {uniqueGroups.map((group, index) => (
                              <th
                                key={index}
                                className="text-md text-nowrap border-b border-r border-gray-300 px-4 py-2 text-center font-normal text-gray-600 dark:text-gray-300"
                              >
                                {group}
                                <div className="text-nowrap text-xs text-gray-500 dark:text-gray-400">
                                  (ภาระงานต่อสัปดาห์)
                                </div>
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {uniqueTasks.map((taskName, taskIndex) => (
                            <tr
                              key={taskIndex}
                              className="hover:bg-gray-50 dark:hover:bg-zinc-800"
                            >
                              <td className="text-md md:max-w-[450px] break-words border-b border-r border-gray-300 px-4 py-2 font-normal text-gray-700">
                                {taskIndex + 1}. {taskName}
                              </td>
                              {uniqueGroups.map((group, groupIndex) => (
                                <td
                                  key={groupIndex}
                                  className="border-b border-r border-gray-300 px-4 py-2 text-center text-gray-500"
                                >
                                  {getWorkloadHours(taskName, group)}
                                </td>
                              ))}
                            </tr>
                          ))}
                          <tr className="bg-gray-100 font-bold dark:bg-zinc-800">
                            <td className="border-b border-r border-gray-300 px-4 py-2 text-center font-normal text-gray-600">
                              ผลรวม (ไม่น้อยกว่า)
                            </td>
                            {uniqueGroups.map((group, groupIndex) => (
                              <td
                                key={groupIndex}
                                className="border-b border-r border-gray-300 px-4 py-2 text-center font-normal text-business1"
                              >
                                {calculateGroupTotal(group)}
                              </td>
                            ))}
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
                <div className="rounded-md bg-white p-4 shadow transition-all duration-300 ease-in-out dark:bg-zinc-900 dark:text-gray-400">
                  <h2 className="text-lg font-medium text-gray-700">
                    กรุณาเลือกภาระงานก่อน:
                  </h2>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {workloadGroups.map((group: WorkloadGroup) => (
                      <label
                        key={group.workload_group_id}
                        htmlFor={`confirm-modal`}
                        onClick={() => setSelectedWorkloadGroup(group)}
                        className="cursor-pointer rounded bg-blue-500 px-4 py-2 text-white transition duration-300 ease-in-out hover:bg-blue-600"
                      >
                        {group.workload_group_name}
                      </label>
                    ))}
                  </div>
                  <ConfirmModal
                    handleSelectWorkloadGroup={handleSelectWorkloadGroup}
                    workload_group={selectedWorkloadGroup}
                  />
                </div>
              </div>
            ) : formStatus === 1 ? (
              <_successForm 
                terms={terms} 
                selectedGroupName={workloadGroupInfo?.workload_group_name || undefined}
                userId={userId || undefined}
                roundId={roundId || undefined}
              />
            ) : (
              <div>{children}</div>
            )
          ) : (
            <div className="mb-4 rounded-md bg-white p-6 shadow dark:bg-zinc-900 dark:text-gray-400">
              <div className="flex flex-col items-center justify-center gap-4 py-8 text-center">
                <TriangleAlertIcon className="h-12 w-12 text-red-500 md:h-24 md:w-24" />
                <div className="">
                  <h2 className="mb-2 text-4xl font-medium text-gray-700 dark:text-gray-300">
                    ไม่พบสิทธิในการประเมินภาระงาน
                  </h2>
                  <p className="text-gray-500 dark:text-gray-400">
                    คุณไม่ได้ถูกกำหนดให้เป็นผู้ประเมินในรอบนี้
                    กรุณาติดต่อผู้ดูแลระบบหากคิดว่านี่เป็นข้อผิดพลาด
                  </p>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </>
  )
}

export default ClientLayout

