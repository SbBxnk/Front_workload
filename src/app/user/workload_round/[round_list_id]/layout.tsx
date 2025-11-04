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
  CircleX,
  FileText
} from 'lucide-react'
import InfoHoverModal from './form/infoTermModal'
import type { WorkloadGroup } from '@/Types'
import WorkloadFormServices from '@/services/workloadFormServices'
import useUtility from '@/hooks/useUtility'
import SetAssessorServices from '@/services/setAssessorServices'
import WorkloadGroupServices from '@/services/workloadGroupServices'
import ConfirmModal from './confirmWorkloadModal'

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
  const [workloadGroups, setWorkloadGroups] = useState<WorkloadGroup[]>([])
  const [terms, setTerms] = useState<any[]>([])
  const [selectedWorkloadGroup, setSelectedWorkloadGroup] = useState<WorkloadGroup | null>(null)
  const [hasFormInRound, setHasFormInRound] = useState<boolean | null>(null)
  const [formStatus, setFormStatus] = useState<number | null>(null) // เพิ่ม state สำหรับเก็บสถานะฟอร์ม
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
            sort: 'workload_group_id',
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
        // เช็คว่า as_u_id อยู่ใน tb_set_assessorlist หรือไม่
        if (userAccessResponse.status === 'fulfilled') {
          const accessData = userAccessResponse.value
          // เช็คว่า success เป็น true และมี payload (ไม่เป็น null และไม่ว่าง)
          hasAccess = accessData.success && accessData.payload !== null &&
            Array.isArray(accessData.payload) && accessData.payload.length > 0 &&
            accessData.payload.some((record: any) => record.ex_u_id !== null)
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

        // เก็บ terms จาก API
        if (termsResponse.status === 'fulfilled') {
          const tPayload = (termsResponse.value as any).data || (termsResponse.value as any).payload || []
          setTerms(Array.isArray(tPayload) ? tPayload : [])
        } else {
          console.error('Failed to fetch terms:', termsResponse.status === 'rejected' ? termsResponse.reason : 'unknown')
          setTerms([])
        }

        // เก็บรายการ workload groups สำหรับให้ผู้ใช้เลือกเมื่อยังไม่เลือกกลุ่ม
        if (workloadGroupsResponse.status === 'fulfilled') {
          const wgPayload = workloadGroupsResponse.value.payload || []
          setWorkloadGroups(Array.isArray(wgPayload) ? (wgPayload as unknown as WorkloadGroup[]) : [])
        } else {
          console.error('Failed to fetch workload groups:', workloadGroupsResponse.status === 'rejected' ? workloadGroupsResponse.reason : 'unknown')
          setWorkloadGroups([])
        }

        // อัปเดต state
        setCurrentRound(roundInfo)
        setWorkloadGroupInfo(groupInfo)
        setHasFormInRound(hasAccess)

      } catch (error) {
        console.error('Error fetching data:', error)
        // ตั้งค่า default values เมื่อเกิด error
        setTerms([])
        setWorkloadGroups([])
        setCurrentRound(null)
        setWorkloadGroupInfo({ workload_group_id: null, workload_group_name: null })
        setHasFormInRound(false)
      } finally {
        setLoading(false)
        setIsCheckingAccess(false)
      }
    }

    if (user && session?.accessToken) {
      fetchAllData()
    }
  }, [user, session?.accessToken, round_list_id]) // dependencies ที่สำคัญ

  if (loading || isCheckingAccess || hasFormInRound === null) {
    return (
      <div className="space-y-4">
        <div className="rounded-md bg-white p-4 shadow dark:bg-zinc-900 dark:text-gray-400">
          <h2 className="mb-4 text-lg font-medium text-gray-700 dark:text-gray-300">
            รอบการประเมินปัจจุบัน
          </h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            {[...Array(4)].map((_, index) => (
              <div key={index} className="space-y-4">
                <div className="h-4 w-24 animate-pulse rounded bg-gray-200 dark:bg-zinc-700"></div>
                <div className="h-8 w-full animate-pulse rounded bg-gray-200 dark:bg-zinc-700"></div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-md bg-white px-4 pt-4 pb-1 shadow dark:bg-zinc-900 dark:text-gray-400">
          <h2 className="text-lg font-medium text-gray-700 dark:text-gray-300">เกณฑ์การประเมินภาระงานของแต่ละด้านภาระงาน</h2>
          <div className="my-4 overflow-x-auto" style={{ minHeight: 'calc(5 * 3rem + 3.5rem)' }}>
            <table className="w-full border border-gray-300 bg-white dark:border-gray-700 dark:bg-zinc-900">
              <thead className="bg-gray-100 dark:bg-zinc-800">
                <tr>
                  <th className="font-normal border-b border-r border-gray-300 px-4 py-3 text-center text-gray-700 dark:text-gray-300">
                    <div className="h-6 w-24 bg-gray-200 dark:bg-zinc-700 rounded animate-pulse mx-auto" />
                  </th>
                  {[...Array(4)].map((_, i) => (
                    <th key={i} className="font-normal border-b border-r border-gray-300 px-4 py-3 text-center text-gray-700 dark:text-gray-300">
                      <div className="h-6 w-28 bg-gray-200 dark:bg-zinc-700 rounded mx-auto animate-pulse" />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[...Array(5)].map((_, r) => (
                  <tr key={r} className="hover:bg-gray-50 dark:hover:bg-zinc-800">
                    <td className="font-light border-b border-r border-gray-300 px-4 py-3 text-gray-700">
                      <div className="h-6 w-48 bg-gray-200 dark:bg-zinc-700 rounded animate-pulse" />
                    </td>
                    {[...Array(4)].map((_, c) => (
                      <td key={`${r}-${c}`} className="font-light border-b border-r border-gray-300 px-4 py-3 text-center text-gray-700">
                        <div className="h-6 w-8 bg-gray-200 dark:bg-zinc-700 rounded mx-auto animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))}
                <tr className="bg-gray-50 dark:bg-zinc-800">
                  <td className="font-normal border-b border-r border-gray-300 px-4 py-3 text-right text-gray-700">
                    <div className="h-6 w-20 bg-gray-200 dark:bg-zinc-700 rounded ml-auto animate-pulse" />
                  </td>
                  {[...Array(4)].map((_, c) => (
                    <td key={`total-${c}`} className="border-b border-r border-gray-300 px-4 py-3 text-center text-business1 font-normal">
                      <div className="h-6 w-8 bg-gray-200 dark:bg-zinc-700 rounded mx-auto animate-pulse" />
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <div className="rounded-md bg-white p-4 shadow dark:bg-zinc-900 dark:text-gray-400">
          <h2 className="text-lg font-medium text-gray-700 dark:text-gray-300">กรุณาเลือกภาระงานก่อน</h2>
          <div className="mt-4 flex flex-wrap gap-2 min-h-[2.5rem]">
            {[...Array(4)].map((_, index) => (
              <div
                key={index}
                className="h-10 w-28 animate-pulse rounded bg-gray-200 dark:bg-zinc-700"
              />
            ))}
          </div>
          {/* รองรับพื้นที่ของ ConfirmModal */}
          <div className="h-0" />
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
            <div className="md:sticky md:top-14 md:z-10 rounded-md bg-white p-4 shadow dark:bg-zinc-900 dark:text-gray-400">
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
                        onClick={(e) => { e.stopPropagation(); setIsModalOpen(true) }}
                      >
                        <AlertCircle className="h-4 w-4" />
                        {isModalOpen && (
                          <InfoHoverModal
                            workloadGroupInfo={workloadGroupInfo}
                            isOpen={isModalOpen}
                            onClose={() => setIsModalOpen(false)}
                          />
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* เลือกกลุ่มภาระงาน + ตารางเกณฑ์ เมื่อยังไม่เลือกกลุ่ม */}
          {(!workloadGroupInfo || !workloadGroupInfo.workload_group_id) ? (
            <div className="space-y-4">
              <div className="rounded-md bg-white px-4 pt-4 pb-1 shadow dark:bg-zinc-900 dark:text-gray-400">
                <h2 className="text-lg font-medium text-gray-700 dark:text-gray-300">เกณฑ์การประเมินภาระงานของแต่ละด้านภาระงาน</h2>
                <div className="my-4 overflow-x-auto" style={{ minHeight: 'calc(5 * 3rem + 3.5rem)' }}>
                  {Array.isArray(terms) && terms.length > 0 ? (() => {
                    // กรอง terms ให้เหลือเฉพาะคู่ task-group ที่มีค่า minimum จริง (quantity > 0 หรือไม่เป็น null/ว่าง)
                    const effectiveTerms = terms.filter((t: any) => t && t.workload_group_name && t.task_name && t.quantity_workload_hours != null && String(t.quantity_workload_hours).trim() !== '' && Number(t.quantity_workload_hours) > 0)

                    // ลำดับคอลัมน์กลุ่มภาระงานตามลำดับจาก database (workload_group_id)
                    // ใช้ลำดับจาก workloadGroups ที่เรียงแล้วตาม workload_group_id
                    const presentGroupSet = new Set(effectiveTerms.map((t: any) => t.workload_group_name))
                    
                    // สร้าง Map สำหรับเก็บลำดับ workload_group_id จาก workloadGroups
                    const groupOrderMap = new Map<number, string>()
                    if (Array.isArray(workloadGroups) && workloadGroups.length > 0) {
                      workloadGroups.forEach((g: any) => {
                        if (presentGroupSet.has(g.workload_group_name)) {
                          groupOrderMap.set(g.workload_group_id, g.workload_group_name)
                        }
                      })
                    }
                    
                    // เรียง groups ตาม workload_group_id จาก database
                    let groups: string[] = []
                    if (groupOrderMap.size > 0) {
                      groups = Array.from(groupOrderMap.entries())
                        .sort((a, b) => a[0] - b[0]) // เรียงตาม workload_group_id
                        .map(([, name]) => name)
                    } else {
                      // ถ้าไม่มี groups จาก workloadGroups ให้ใช้จาก terms โดยเรียงตาม workload_group_id
                      const groupMap = new Map<number, string>()
                      effectiveTerms.forEach((t: any) => {
                        if (t.workload_group_id && !groupMap.has(t.workload_group_id)) {
                          groupMap.set(t.workload_group_id, t.workload_group_name)
                        }
                      })
                      groups = Array.from(groupMap.entries())
                        .sort((a, b) => a[0] - b[0])
                        .map(([, name]) => name)
                    }

                    // ลำดับแถวภาระงาน: เรียงตาม task_id จาก database
                    const taskMap = new Map<number, string>()
                    effectiveTerms.forEach((t: any) => {
                      if (t.task_id && !taskMap.has(t.task_id)) {
                        taskMap.set(t.task_id, t.task_name)
                      }
                    })
                    
                    // เรียง tasks ตาม task_id จาก database
                    const tasks = Array.from(taskMap.entries())
                      .sort((a, b) => a[0] - b[0]) // เรียงตาม task_id
                      .map(([, name]) => name)
                    const getQty = (taskName: string, groupName: string) => {
                      const found = effectiveTerms.find((t: any) => t.task_name === taskName && t.workload_group_name === groupName)
                      return found?.quantity_workload_hours ?? ''
                    }
                    // คำนวณผลรวมต่อกลุ่ม
                    const groupTotals: Record<string, number> = {}
                    groups.forEach((g) => {
                      groupTotals[g as string] = effectiveTerms
                        .filter((t: any) => t.workload_group_name === g)
                        .reduce((sum: number, t: any) => sum + (Number(t.quantity_workload_hours) || 0), 0)
                    })
                    return (
                      <table className="w-full border border-gray-300 bg-white dark:border-gray-700 dark:bg-zinc-900">
                        <thead className="bg-gray-100 dark:bg-zinc-800">
                          <tr>
                            <th className="font-normal border-b border-r border-gray-300 px-4 py-3 text-center text-gray-700 dark:text-gray-300">ภาระงาน</th>
                            {groups.map((g) => (
                              <th key={g} className="font-normal border-b border-r border-gray-300 px-4 py-3 text-center text-gray-700 dark:text-gray-300">{g}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {tasks.map((task) => (
                            <tr key={task} className="hover:bg-gray-50 dark:hover:bg-zinc-800">
                              <td className="font-light border-b border-r border-gray-300 px-4 py-3 text-gray-700">{task}</td>
                              {groups.map((g) => (
                                <td key={`${task}-${g}`} className="font-light border-b border-r border-gray-300 px-4 py-3 text-center text-gray-700">{getQty(task as string, g as string)}</td>
                              ))}
                            </tr>
                          ))}
                          <tr className="bg-gray-50 dark:bg-zinc-800">
                            <td className="font-normal border-b border-r border-gray-300 px-4 py-3 text-right text-gray-700">รวม</td>
                            {groups.map((g) => (
                              <td key={`total-${g}`} className="border-b border-r border-gray-300 px-4 py-3 text-center text-business1 font-normal">{groupTotals[g as string]}</td>
                            ))}
                          </tr>
                        </tbody>
                      </table>
                    )
                  })() : (
                    <div className="p-4 text-center text-gray-500">ไม่มีข้อมูล terms</div>
                  )}
                </div>
              </div>

              <div className="rounded-md bg-white p-4 shadow dark:bg-zinc-900 dark:text-gray-400">
                <h2 className="text-lg font-medium text-gray-700 dark:text-gray-300">กรุณาเลือกภาระงานก่อน</h2>
                <div className="mt-4 flex flex-wrap gap-2 min-h-[2.5rem]">
                  {Array.isArray(workloadGroups) && workloadGroups.length > 0 ? (
                    // เรียงลำดับตาม workload_group_id ก่อนแสดง
                    [...workloadGroups]
                      .sort((a, b) => a.workload_group_id - b.workload_group_id)
                      .map((group: WorkloadGroup) => (
                      <label
                        key={group.workload_group_id}
                        htmlFor={`confirm-modal`}
                        onClick={() => setSelectedWorkloadGroup(group)}
                        className="cursor-pointer rounded bg-business1 px-4 py-2 text-white hover:bg-business1/90"
                      >
                        {group.workload_group_name}
                      </label>
                    ))
                  ) : (
                    <div className="w-full rounded bg-yellow-100 p-4 text-yellow-800">
                      <p className="font-medium">ไม่พบข้อมูลกลุ่มภาระงาน</p>
                      <p className="text-sm">กรุณาติดต่อผู้ดูแลระบบ</p>
                    </div>
                  )}
                </div>
                <ConfirmModal
                  workload_group={selectedWorkloadGroup}
                  handleSelectWorkloadGroup={async (group: WorkloadGroup) => {
                    if (!user || !currentRound) return
                    try {
                      const resp = await WorkloadFormServices.selectWorkloadFormGroup(
                        user.id,
                        group.workload_group_id,
                        currentRound.round_list_id,
                        session?.accessToken || ''
                      )
                      if (resp.status) {
                        setWorkloadGroupInfo({
                          workload_group_id: group.workload_group_id,
                          workload_group_name: group.workload_group_name,
                        })
                        setSelectedWorkloadGroup(null)
                      }
                    } catch (e) {
                      console.error('Error selecting workload group:', e)
                    }
                  }}
                />
              </div>
            </div>
          ) : (
            // เลือกกลุ่มแล้ว แสดงเนื้อหาหลัก
            children
          )}
        </div>
      ) : null}
    </>
  )
}

export default ClientLayout
