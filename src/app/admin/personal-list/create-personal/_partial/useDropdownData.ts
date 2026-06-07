'use client'

import { useQuery } from '@tanstack/react-query'
import type {
  Branch,
  Course,
  ExPosition,
  PersonalType,
  Position,
  Prefix,
  UserLevel,
} from '@/Types'
import PrefixServices from '@/services/prefixServices'
import PositionServices from '@/services/positionServices'
import ExPositionServices from '@/services/exPositionServices'
import PersonaltypeServices from '@/services/personaltypeServices'
import BranchServices from '@/services/branchServices'
import CourseServices from '@/services/courseServices'
import UserLevelServices from '@/services/userLevelServices'

// param มาตรฐานสำหรับ dropdown ที่รองรับ search/sort (โหลดทั้งหมด limit 100)
const listParams = (sort: string) => ({
  search: '',
  page: 1,
  limit: 100,
  sort,
  order: 'asc',
})

// คืน payload เป็น array เสมอ (กัน undefined)
const asArray = <T,>(payload: T[] | undefined | null): T[] =>
  Array.isArray(payload) ? payload : []

export function usePrefixes() {
  return useQuery({
    queryKey: ['prefixes'],
    queryFn: async (): Promise<Prefix[]> => {
      const res = await PrefixServices.getAllPrefixes(listParams('prefix_name'))
      return res.success ? asArray(res.payload) : []
    },
  })
}

export function usePositions() {
  return useQuery({
    queryKey: ['positions'],
    queryFn: async (): Promise<Position[]> => {
      const res = await PositionServices.getAllPositions(
        listParams('position_name')
      )
      return res.success ? asArray(res.payload) : []
    },
  })
}

export function useExPositions() {
  return useQuery({
    queryKey: ['exPositions'],
    queryFn: async (): Promise<ExPosition[]> => {
      const res = await ExPositionServices.getAllExpositions(
        listParams('ex_position_name')
      )
      return res.success ? asArray(res.payload) : []
    },
  })
}

export function usePersonalTypes() {
  return useQuery({
    queryKey: ['personalTypes'],
    queryFn: async (): Promise<PersonalType[]> => {
      const res = await PersonaltypeServices.getAllPersonalTypes(
        listParams('type_p_name')
      )
      return res.success ? asArray(res.payload) : []
    },
  })
}

export function useBranches() {
  return useQuery({
    queryKey: ['branches'],
    queryFn: async (): Promise<Branch[]> => {
      const res = await BranchServices.getAllBranches(listParams('branch_name'))
      return res.success ? asArray(res.payload) : []
    },
  })
}

export function useUserLevels() {
  return useQuery({
    queryKey: ['userLevels'],
    queryFn: async (): Promise<UserLevel[]> => {
      const res = await UserLevelServices.getAllUserLevels()
      return res.success ? asArray(res.payload) : []
    },
  })
}

/**
 * โหลดหลักสูตร: ถ้ามี branchId ดึงเฉพาะของสาขานั้น มิฉะนั้นดึงทั้งหมด
 * (รักษา behavior เดิม: เปลี่ยนสาขา → รายการหลักสูตรเปลี่ยนตาม)
 */
export function useCourses(branchId: number | null) {
  return useQuery({
    queryKey: ['courses', branchId ?? 'all'],
    queryFn: async (): Promise<Course[]> => {
      const res =
        branchId && branchId > 0
          ? await CourseServices.getCoursesByBranch(branchId)
          : await CourseServices.getAllCoursesSimple()
      return res.success ? asArray(res.payload) : []
    },
  })
}
