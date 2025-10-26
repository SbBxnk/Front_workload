

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
  CircleX
} from 'lucide-react'
import ConfirmModal from './confirmModal'
import InfoHoverModal from './infoTermModal'
import _successForm from '../_successForm'
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
  const [hasAssessorData, setHasAssessorData] = useState<boolean | null>(null)
  const [hasFormInRound, setHasFormInRound] = useState<boolean | null>(null)
  const infoIconRef = useRef<HTMLDivElement>(null)
  const { data: session } = useSession()
  const params = useParams()
  const roundId = params?.round_list_id ? parseInt(params.round_list_id as string) : null

  useEffect(() => {
    setBreadcrumbs([
      { text: 'ฟอร์มประเมินภาระงาน', path: '/user/workload_round' },
      { text: 'องค์ประกอบที่ 1 ผลสัมฤทธิ์ของงาน', path: `/user/workload_round/${roundId}` },
      { text: 'ภาระงานหลัก', path: `/user/workload_round/${roundId}/form` },
    ])
  }, [setBreadcrumbs, roundId])

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
      if (userId && roundId) {
        try {
          
          const response = await axios.get(
            `${process.env.NEXT_PUBLIC_API}/workload_form/check_workload_group/${userId}/${roundId}`,
            { headers }
          )
          
          
          const workloadGroupData = response.data.data[0] || null
          setWorkloadGroupInfo(workloadGroupData)
          
        } catch (error: unknown) {
          if (axios.isAxiosError(error) && error.response?.status === 404) {
            setWorkloadGroupInfo(null)
          } else {
            console.error('❌ Error checking workload group:', error)
            setWorkloadGroupInfo(null)
          }
        }
      }
    }

    checkWorkloadGroup()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, roundId])

  // ตรวจสอบว่าผู้ใช้มีสิทธิ์เข้าถึงรอบนี้หรือไม่
  useEffect(() => {
    const checkUserAccess = async () => {
      if (userId && roundId && session?.accessToken) {
        try {
          const response = await SetAssessorServices.checkUserAccessToRound(
            userId,
            roundId,
            session.accessToken
          )

          if (response.success) {
            // ตรวจสอบว่ามี payload หรือไม่ (มี ex_u_id หรือไม่)
            const hasAccess = response.payload !== null
            setHasAssessorData(hasAccess)
          } else {
            setHasAssessorData(false)
          }
        } catch (error) {
          console.error('Error checking user access:', error)
          setHasAssessorData(false)
        }
      }
    }

    checkUserAccess()
  }, [userId, roundId, session?.accessToken])

  // เช็ค status ของ workload form และว่าผู้ใช้มีฟอร์มในรอบนี้หรือไม่
  useEffect(() => {
    const checkFormStatus = async () => {
      if (userId && roundId && session?.accessToken) {
        try {
          const response = await WorkloadFormServices.checkWorkloadFormStatus(userId, roundId, session.accessToken)
          if (response.success) {
            if (response.payload === null) {
              // ยังไม่มีข้อมูล workload form ในระบบ
              console.log('No form status found - user may not have workload form data yet')
              setFormStatus(0) // ตั้งค่าเป็น 0 (ยังไม่ได้เริ่มต้น)
              setHasFormInRound(true) // ให้แสดงฟอร์มเพื่อให้ผู้ใช้เลือกภาระงาน
            } else if (response.payload) {
              const data = Array.isArray(response.payload) ? response.payload[0] : response.payload
              if (data) {
                setFormStatus(data.status)
                setHasFormInRound(true) // มีฟอร์มในรอบนี้
              }
            }
          }
        } catch (error) {
          console.error('Error checking form status:', error)
          setHasFormInRound(false) // เกิดข้อผิดพลาด ให้เป็น false
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

        const workloadGroupsData = responseWorkloadGroups.data.payload || []
        const termsData = responseTerms.data.data || []
        
        setWorkloadGroups(workloadGroupsData)
        setTerms(termsData)

        const fetchedRounds = Array.isArray(responseRounds.payload) ? responseRounds.payload : []
        setAllRounds(fetchedRounds as unknown as Round[])

        // หารอบที่ผู้ใช้พยายามเข้าถึง
        const targetRoundData = roundId ? fetchedRounds.find((round: any) => round.round_list_id === roundId) : null
        setTargetRound(targetRoundData as unknown as Round || null)
        // ใช้ targetRound เป็น currentRound เพื่อไม่เช็ควันที่
        setCurrentRound(targetRoundData as unknown as Round || null)
      } catch (error) {
        console.error('❌ Error fetching data:', error)
        
        if (axios.isAxiosError(error)) {
          console.error('❌ Axios Error Details:', {
            message: error.message,
            status: error.response?.status,
            statusText: error.response?.statusText,
            data: error.response?.data,
            url: error.config?.url
          })
        }
        
        setWorkloadGroups([])
        setTerms([])
        setAllRounds([])
      } finally {
        setLoading(false)
      }
    }

    if (userId) {
      fetchData()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId])

  // ดึงรายการภาระงานที่ไม่ซ้ำกันจากข้อมูล API 
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

  // ตรวจสอบสถานะของรอบ - ไม่เช็ควันที่แล้ว
  const getRoundStatus = (round: Round | null) => {
    if (!round) {
      return 'not_found'
    }
    
    // ไม่เช็ควันที่แล้ว - ให้แสดงฟอร์มเสมอ
    return 'active'
  }

  const handleSelectWorkloadGroup = async (workload_group: WorkloadGroup) => {
    if (!userId || !currentRound) {
      console.error('Missing userId or currentRound')
      alert('ไม่สามารถเลือกกลุ่มภาระงานได้ กรุณาลองใหม่')
      return
    }

    console.log('🔍 Selecting Workload Group:', {
      userId,
      roundId: currentRound.round_list_id,
      workloadGroupId: workload_group.workload_group_id,
      workloadGroupName: workload_group.workload_group_name
    })

    try {
      // Update workload_group_id ใน tb_set_assessorlist
      const response = await WorkloadFormServices.selectWorkloadFormGroup(
        userId, 
        workload_group.workload_group_id, 
        currentRound.round_list_id, 
        session?.accessToken || ''
      )

      console.log('🔍 API Response:', response)

      if (response.status) {
        // อัปเดต workloadGroupInfo และ selectedGroup
        setWorkloadGroupInfo({
          workload_group_id: workload_group.workload_group_id,
          workload_group_name: workload_group.workload_group_name,
        })
        setSelectedGroup(workload_group.workload_group_name)
        
      } else {
        console.error('❌ Error from API:', response.message)
        alert('ไม่สามารถเลือกกลุ่มภาระงานได้ กรุณาลองใหม่')
      }
    } catch (error) {
      console.error('❌ Error updating workload group:', error)
      alert('เกิดข้อผิดพลาดในการเลือกกลุ่มภาระงาน กรุณาลองใหม่')
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
            <CircleX className="h-12 w-12 text-red-500 md:h-24 md:w-24" />
            <div className="">
              <h2 className="mb-2 text-4xl font-medium text-gray-700 dark:text-gray-300">
                ไม่พบรอบการประเมิน
              </h2>
              <p className="text-gray-500 dark:text-gray-400">
                คุณไม่ได้ถูกกำหนดให้เป็นผู้ประเมินในรอบนี้
              </p>
              <p className="text-gray-500 dark:text-gray-400">
                กรุณาติดต่อผู้ดูแลระบบหากคิดว่านี่เป็นข้อผิดพลาด
              </p>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* เลือกกลุ่มภาระงาน - แสดงเมื่อ workload_group_id เป็น null ใน tb_set_assessorlist */}
          {(() => {
            // แสดงกลุ่มภาระงานเมื่อ:
            // 1. มีฟอร์มในรอบนี้ (hasFormInRound = true)
            // 2. workloadGroupInfo เป็น null หรือ workload_group_id เป็น null
            const shouldShowWorkloadSelection = hasFormInRound && (
              !workloadGroupInfo || 
              workloadGroupInfo.workload_group_id === null ||
              workloadGroupInfo.workload_group_id === 0
            )
            
            return shouldShowWorkloadSelection
          })() ? (
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
                    {(() => {
                      console.log('🔍 Workload Groups Debug:', {
                        workloadGroups,
                        isArray: Array.isArray(workloadGroups),
                        length: workloadGroups?.length || 0
                      })
                      
                      if (!Array.isArray(workloadGroups) || workloadGroups.length === 0) {
                        return (
                          <div className="w-full rounded bg-yellow-100 p-4 text-yellow-800">
                            <p className="font-medium">ไม่พบข้อมูลกลุ่มภาระงาน</p>
                            <p className="text-sm">กรุณาติดต่อผู้ดูแลระบบ</p>
                          </div>
                        )
                      }
                      
                      return workloadGroups.map((group: WorkloadGroup) => (
                        <label
                          key={group.workload_group_id}
                          htmlFor={`confirm-modal`}
                          onClick={() => setSelectedWorkloadGroup(group)}
                          className="cursor-pointer rounded bg-blue-500 px-4 py-2 text-white transition duration-300 ease-in-out hover:bg-blue-600"
                        >
                          {group.workload_group_name}
                        </label>
                      ))
                    })()}
                  </div>
                  <ConfirmModal
                    handleSelectWorkloadGroup={handleSelectWorkloadGroup}
                    workload_group={selectedWorkloadGroup}
                  />
                </div>
              </div>
            ) : !hasFormInRound ? (
              <div className="mb-4 rounded-md bg-white p-6 shadow dark:bg-zinc-900 dark:text-gray-400">
                <div className="flex flex-col items-center justify-center gap-4 py-8 text-center">
                  <TriangleAlertIcon className="h-12 w-12 text-red-500 md:h-24 md:w-24" />
                  <div className="">
                    <h2 className="mb-2 text-4xl font-medium text-gray-700 dark:text-gray-300">
                      การประเมินสิ้นสุดแล้ว
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400">
                      คุณไม่ได้ถูกกำหนดให้เป็นผู้ประเมินในรอบนี้
                    </p>
                    <p className="text-gray-500 dark:text-gray-400">
                      กรุณาติดต่อผู้ดูแลระบบหากคิดว่านี่เป็นข้อผิดพลาด
                    </p>
                  </div>
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
          }
        </>
      )}
    </>
  )
}

export default ClientLayout

