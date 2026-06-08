'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import type { WorkloadGroup } from '@/Types'
import { useCurrentUser } from '@/hooks/useCurrentUser'
import WorkloadFormServices from '@/services/workloadFormServices'
import useUtility from '@/hooks/useUtility'
import SetAssessorServices from '@/services/setAssessorServices'
import WorkloadGroupServices from '@/services/workloadGroupServices'
import type {
  RoundLayoutCurrentRound,
  RoundLayoutWorkloadGroupInfo,
  RoundStatus,
  UseRoundLayoutResult,
} from './roundLayoutTypes'

export function useRoundLayout(): UseRoundLayoutResult {
  const { setBreadcrumbs } = useUtility()
  const { data: session } = useSession()
  const { data: currentUser } = useCurrentUser()

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

  const params = useParams()
  const round_list_id = params.round_list_id as string

  // ตรวจสอบสถานะของรอบ
  const getRoundStatus = (round: any | null): RoundStatus => {
    if (!round) {
      return 'not_found'
    }

    if (round.date_start) {
      const startDate = new Date(round.date_start)
      const now = new Date()
      if (!isNaN(startDate.getTime()) && now < startDate) {
        return 'not_started'
      }
    }

    return 'active'
  }

  // ยิง API ทั้งหมดครั้งเดียวเมื่อ currentUser และ session พร้อม
  useEffect(() => {
    const fetchAllData = async () => {
      if (!currentUser || !session?.accessToken) return

      try {
        setLoading(true)
        setIsCheckingAccess(true)

        const userId = currentUser.u_id

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
          SetAssessorServices.checkUserAccessToRound(userId, parseInt(round_list_id)),
          // ตรวจสอบ workload group
          WorkloadFormServices.checkWorkloadGroup(userId, parseInt(round_list_id)),
          // ตรวจสอบสถานะฟอร์ม
          WorkloadFormServices.checkWorkloadFormStatus(userId, parseInt(round_list_id)),
          // ดึงข้อมูล terms
          WorkloadFormServices.getTerms(),
          // ดึงข้อมูล workload groups
          WorkloadGroupServices.getAllWorkloadGroups({
            search: '',
            page: 1,
            limit: 1000,
            sort: 'workload_group_id',
            order: 'asc'
          }),
          // ดึงข้อมูล set assessor round
          SetAssessorServices.getAllRoundLists({
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

    if (currentUser && session?.accessToken) {
      fetchAllData()
    }
  }, [currentUser, session?.accessToken, round_list_id]) // dependencies ที่สำคัญ

  const targetRoundStatus = getRoundStatus(currentRound)

  return {
    currentRound: currentRound as RoundLayoutCurrentRound | null,
    workloadGroupInfo: workloadGroupInfo as RoundLayoutWorkloadGroupInfo | null,
    setWorkloadGroupInfo,
    workloadGroups,
    terms,
    selectedWorkloadGroup,
    setSelectedWorkloadGroup,
    hasFormInRound,
    loading,
    isCheckingAccess,
    user: currentUser ?? null,
    targetRoundStatus,
  }
}
