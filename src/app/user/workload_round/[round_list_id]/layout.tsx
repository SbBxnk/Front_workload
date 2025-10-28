'use client'
import type React from 'react'
import { useRef, useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { jwtDecode } from 'jwt-decode'
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
import SetAssessorServices from '@/services/setAssessorServices'
import WorkloadGroupServices from '@/services/workloadGroupServices'

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
  const { setBreadcrumbs } = useUtility()
  const { data: session } = useSession()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const infoIconRef = useRef<HTMLDivElement>(null)
  
  // State สำหรับข้อมูล
  const [currentRound, setCurrentRound] = useState<any>(null)
  const [workloadGroupInfo, setWorkloadGroupInfo] = useState<any>(null)
  const [hasFormInRound, setHasFormInRound] = useState<boolean | null>(null)
  const [loading, setLoading] = useState(false)
  const [isCheckingAccess, setIsCheckingAccess] = useState(false)
  const [user, setUser] = useState<any>(null)

  const params = useParams()
  const round_list_id = params.round_list_id as string

  // ตรวจสอบสถานะของรอบ - ไม่เช็ควันที่แล้ว
  const getRoundStatus = (round: any | null) => {
    if (!round) {
      return 'not_found'
    }
    
    // ไม่เช็ควันที่แล้ว - ให้แสดงฟอร์มเสมอ
    return 'active'
  }

  // ดึงข้อมูล user จาก token
  useEffect(() => {
    if (session?.accessToken) {
      try {
        const decoded = jwtDecode(session.accessToken) as any
        setUser(decoded)
      } catch (error) {
        console.error('Error decoding token:', error)
      }
    }
  }, [session?.accessToken])

  // ยิง API ทั้งหมดครั้งเดียวเมื่อ user และ session พร้อม
  useEffect(() => {
    const fetchAllData = async () => {
      if (!user || !session?.accessToken) return

      try {
        setLoading(true)
        setIsCheckingAccess(true)

        const userId = user.id

        // ยิง API ทั้งหมดพร้อมกันผ่าน service
        const [
          userAccessResponse,
          workloadGroupResponse,
          formStatusResponse,
          termsResponse,
          workloadGroupsResponse,
          setAssessorResponse
        ] = await Promise.allSettled([
          // ตรวจสอบสิทธิ์การเข้าถึง
          SetAssessorServices.checkUserAccessToRound(userId, parseInt(round_list_id), session.accessToken),
          // ตรวจสอบ workload group
          WorkloadFormServices.checkWorkloadGroup(userId, parseInt(round_list_id), session.accessToken),
          // ตรวจสอบสถานะฟอร์ม
          WorkloadFormServices.checkWorkloadFormStatus(userId, parseInt(round_list_id), session.accessToken),
          // ดึงข้อมูล terms
          WorkloadFormServices.getTerms(session.accessToken),
          // ดึงข้อมูล workload groups
          WorkloadGroupServices.getAllWorkloadGroups(session.accessToken, {
            search: '',
            page: 1,
            limit: 1000,
            sort: 'workload_group_name',
            order: 'asc'
          }),
          // ดึงข้อมูล set assessor round
          SetAssessorServices.getAllRoundLists(session.accessToken, {
            search: '',
            page: 1,
            limit: 1000,
            sort: 'date_save',
            order: 'desc',
            year: ''
          })
        ])

        // ประมวลผลผลลัพธ์
        let roundInfo: any = null
        let hasAccess = false

        // ประมวลผล user access
        if (userAccessResponse.status === 'fulfilled') {
          hasAccess = userAccessResponse.value.success
        }

        // ประมวลผล set assessor round เพื่อหา round info
        if (setAssessorResponse.status === 'fulfilled') {
          const rounds = setAssessorResponse.value.payload || []
          const foundRound = rounds.find((round: any) => round.round_list_id === parseInt(round_list_id))
          if (foundRound) {
            roundInfo = {
              round_list_id: foundRound.round_list_id,
              round_list_name: foundRound.round_list_name,
              round: foundRound.round,
              year: foundRound.year,
              date_start: foundRound.date_start,
              date_end: foundRound.date_end
            }
          }
        }

        // ประมวลผล workload group
        let groupInfo: any = { workload_group_id: null, workload_group_name: null }
        if (workloadGroupResponse.status === 'fulfilled') {
          const groupData = workloadGroupResponse.value.data || []
          if (groupData.length > 0) {
            groupInfo = {
              workload_group_id: groupData[0].workload_group_id || null,
              workload_group_name: groupData[0].workload_group_name || null
            }
          }
        }

        // อัปเดต state
        setCurrentRound(roundInfo)
        setWorkloadGroupInfo(groupInfo)
        setHasFormInRound(hasAccess)

      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
        setIsCheckingAccess(false)
      }
    }

    fetchAllData()
  }, [user, session?.accessToken, round_list_id]) // dependencies ที่สำคัญ

  if (loading || isCheckingAccess || hasFormInRound === null) {
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

  const targetRoundStatus = getRoundStatus(currentRound)

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
      ) : hasFormInRound === false ? (
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
      ) : hasFormInRound === true ? (
        <div className="space-y-4">
          {currentRound && (
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
      ) : null}
    </>
  )
}

export default ClientLayout
