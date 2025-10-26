'use client'
import axios from 'axios'
import type React from 'react'
import { useEffect, useState, useRef } from 'react'
import type { Terms, WorkloadGroup } from '@/Types'
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
import InfoHoverModal from './form/infoTermModal'
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
  const [selectedWorkloadGroup, setSelectedWorkloadGroup] =
    useState<WorkloadGroup | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [formStatus, setFormStatus] = useState<number | null>(null)
  const [hasAssessorData, setHasAssessorData] = useState<boolean | null>(null)
  const [hasFormInRound, setHasFormInRound] = useState<boolean>(false)
  const infoIconRef = useRef<HTMLDivElement>(null)

  const params = useParams()
  const round_list_id = params.round_list_id as string
  const { data: session } = useSession()

  useEffect(() => {
    if (session?.accessToken) {
      try {
        const decoded: DecodedToken = jwtDecode(session.accessToken)
        setUserId(decoded.id)
      } catch (error) {
        console.error('JWT Decode Error:', error)
      }
    }
  }, [session?.accessToken])

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!session?.accessToken) return

        // ดึงข้อมูลรอบการประเมินทั้งหมด
        const roundsResponse = await SetAssessorServices.getAllRoundLists(session.accessToken, {
          limit: 1000
        })

        if (roundsResponse.payload && Array.isArray(roundsResponse.payload)) {
          setAllRounds(roundsResponse.payload)
          
          // หารอบปัจจุบัน
          const currentRoundData = roundsResponse.payload.find(
            (round: Round) => round.round_list_id === parseInt(round_list_id)
          )
          
          if (currentRoundData) {
            setCurrentRound(currentRoundData)
            setTargetRound(currentRoundData)
            setHasFormInRound(true)
          }
        }

        // ดึงข้อมูล workload groups
        try {
          const workloadGroupsResponse = await axios.get(
            `${process.env.NEXT_PUBLIC_API}/workload_group`,
            { 
              headers: {
                Authorization: `Bearer ${session.accessToken}`
              }
            }
          )
          setWorkloadGroups(workloadGroupsResponse.data.payload || [])
        } catch (error) {
          console.error('Error fetching workload groups:', error)
          setWorkloadGroups([])
        }

        // ดึงข้อมูล terms
        try {
          const termsResponse = await axios.get(
            `${process.env.NEXT_PUBLIC_API}/workload_form/terms`,
            { 
              headers: {
                Authorization: `Bearer ${session.accessToken}`
              }
            }
          )
          setTerms(termsResponse.data.payload || [])
        } catch (error) {
          console.error('Error fetching terms:', error)
          setTerms([])
        }

        // ตรวจสอบ workload group ของผู้ใช้
        if (userId) {
          try {
            const workloadGroupResponse = await WorkloadFormServices.checkWorkloadGroup(
              userId,
              parseInt(round_list_id),
              session.accessToken
            )
            setWorkloadGroupInfo({
              workload_group_id: workloadGroupResponse.data?.[0]?.workload_group_id || null,
              workload_group_name: workloadGroupResponse.data?.[0]?.workload_group_name || null
            })
          } catch (error) {
            console.error('Error fetching workload group:', error)
            setWorkloadGroupInfo(null)
          }
        }

        // ตรวจสอบสถานะฟอร์ม
        if (userId) {
          try {
            const formStatusResponse = await axios.get(
              `${process.env.NEXT_PUBLIC_API}/workload_form/status/${userId}/${round_list_id}`,
              { 
                headers: {
                  Authorization: `Bearer ${session.accessToken}`
                }
              }
            )
            setFormStatus(formStatusResponse.data.status || 0)
          } catch (error) {
            console.error('Error fetching form status:', error)
            setFormStatus(0)
          }
        }

        // ตรวจสอบว่ามี assessor data หรือไม่
        if (userId) {
          try {
            const assessorDataResponse = await SetAssessorServices.getSetAssessorListByRound(
              parseInt(round_list_id),
              session.accessToken
            )
            setHasAssessorData(assessorDataResponse.payload && assessorDataResponse.payload.length > 0)
          } catch (error) {
            console.error('Error fetching assessor data:', error)
            setHasAssessorData(false)
          }
        }

      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [session?.accessToken, userId, round_list_id])

  const handleSubmitForm = async () => {
    // ไม่ต้องใช้ในหน้าเลือกสมรรถนะ
    console.log('Submit form not needed in exposition selection')
  }

  if (loading) {
    return (
      <div className="space-y-4">
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

        {/* Skeleton for exposition selection */}
        <div className="rounded-md bg-white p-4 shadow">
          <div className="mb-4">
            <div className="h-6 w-32 animate-pulse rounded bg-gray-200 dark:bg-zinc-700"></div>
            <div className="mt-2 h-4 w-64 animate-pulse rounded bg-gray-200 dark:bg-zinc-700"></div>
          </div>
          <div className="flex flex-col gap-4">
            {[...Array(2)].map((_, index) => (
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
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {hasFormInRound && currentRound && (
        <div className="rounded-md bg-white p-4 shadow dark:bg-zinc-900 dark:text-gray-400">
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

      {/* แสดงเนื้อหาหลัก */}
      {children}
    </div>
  )
}

export default ClientLayout
