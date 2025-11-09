

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
import WorkloadFormServices from '@/services/workloadFormServices'
import WorkloadGroupServices from '@/services/workloadGroupServices'
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
import ConfirmModal from '../_partial/confirmWorkloadModal'
import InfoHoverModal from './infoTermModal'
import _successForm from '../_successForm'
import useUtility from '@/hooks/useUtility'

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

  // useEffect(() => {
  //   setBreadcrumbs([
  //     { text: 'ฟอร์มประเมินภาระงาน', path: '/user/workload_round' },
  //     { text: 'องค์ประกอบที่ 1 ผลสัมฤทธิ์ของงาน', path: `/user/workload_round/${roundId}` },
  //     { text: 'ภาระงานหลัก', path: `/user/workload_round/${roundId}/form` },
  //   ])
  // }, [setBreadcrumbs, roundId])

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
        
        const responseWorkloadGroups = await WorkloadGroupServices.getAllWorkloadGroups(session?.accessToken || '', {
          search: '',
          page: 1,
          limit: 1000,
          sort: 'workload_group_name',
          order: 'asc'
        })
        
        const responseRounds = await SetAssessorServices.getAllRounds(session?.accessToken || '')

        const workloadGroupsData = responseWorkloadGroups.payload || []
        
        setWorkloadGroups(workloadGroupsData)

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
        setWorkloadGroups([])
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

  // เงื่อนไขเลือกกลุ่มภาระงานและตารางเกณฑ์ ถูกย้ายไปที่ layout.tsx ระดับรอบแล้ว
  return <div>{children}</div>
}

export default ClientLayout

