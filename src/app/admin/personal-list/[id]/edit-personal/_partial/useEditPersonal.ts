'use client'

import type React from 'react'
import { useEffect, useMemo, useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { useRouter, useParams } from 'next/navigation'
import Swal from 'sweetalert2'
import type { Personal } from '@/Types'
import useUtility from '@/hooks/useUtility'
import UserServices from '@/services/userServices'
import PrefixServices from '@/services/prefixServices'
import PositionServices from '@/services/positionServices'
import ExPositionServices from '@/services/exPositionServices'
import PersonaltypeServices from '@/services/personaltypeServices'
import BranchServices from '@/services/branchServices'
import CourseServices from '@/services/courseServices'
import UserLevelServices from '@/services/userLevelServices'

// param มาตรฐานสำหรับ dropdown ที่รองรับ search/page/limit/sort/order
const listParam = (sort: string) => ({
  search: '',
  page: 1,
  limit: 100,
  sort,
  order: 'asc' as const,
})

// แปลง response payload ให้เป็น array เสมอ
const toArray = <T,>(payload: unknown): T[] =>
  Array.isArray(payload) ? (payload as T[]) : []

/**
 * รวม logic ของหน้าแก้ไขบุคลากร:
 * - โหลด user ตาม id (React Query)
 * - โหลด dropdown options ทั้ง 7 (React Query)
 * - form state + การจัดการรูป
 * - useMutation อัปเดต user + Swal + redirect
 */
export function useEditPersonal() {
  const { setBreadcrumbs } = useUtility()
  const router = useRouter()
  const params = useParams()
  const userId = params.id as string

  // ---------- form state ----------
  const [formData, setFormData] = useState<Personal | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  // selected label ของแต่ละ dropdown (ให้ SelectDropdown แสดงค่าเดิม)
  const [selectPrefix, setSelectPrefix] = useState<string | null>(null)
  const [selectPosition, setSelectPosition] = useState<string | null>(null)
  const [selectExPosition, setSelectExPosition] = useState<string | null>(null)
  const [selectPersonalType, setSelectPersonalType] = useState<string | null>(
    null
  )
  const [selectBranch, setSelectBranch] = useState<string | null>(null)
  const [selectCourse, setSelectCourse] = useState<string | null>(null)
  const [selectLevel, setSelectLevel] = useState<string | null>(null)

  // ---------- queries: user ----------
  const { data: user } = useQuery({
    queryKey: ['user', userId],
    enabled: !!userId,
    queryFn: async () => {
      const res = await UserServices.getUserById(Number(userId))
      const payload = res.payload
      const data = Array.isArray(payload) ? payload[0] : payload
      return (data as Personal) ?? null
    },
  })

  // ---------- queries: dropdown options ----------
  const { data: prefixes = [] } = useQuery({
    queryKey: ['prefixes'],
    queryFn: async () =>
      toArray<any>((await PrefixServices.getAllPrefixes(listParam('prefix_name'))).payload),
  })
  const { data: positions = [] } = useQuery({
    queryKey: ['positions'],
    queryFn: async () =>
      toArray<any>(
        (await PositionServices.getAllPositions(listParam('position_name'))).payload
      ),
  })
  const { data: exPositions = [] } = useQuery({
    queryKey: ['exPositions'],
    queryFn: async () =>
      toArray<any>(
        (await ExPositionServices.getAllExpositions(listParam('ex_position_name')))
          .payload
      ),
  })
  const { data: personalTypes = [] } = useQuery({
    queryKey: ['personalTypes'],
    queryFn: async () =>
      toArray<any>(
        (await PersonaltypeServices.getAllPersonalTypes(listParam('type_p_name')))
          .payload
      ),
  })
  const { data: branches = [] } = useQuery({
    queryKey: ['branches'],
    queryFn: async () =>
      toArray<any>((await BranchServices.getAllBranches(listParam('branch_name'))).payload),
  })
  const { data: userLevels = [] } = useQuery({
    queryKey: ['userLevels'],
    queryFn: async () => toArray<any>((await UserLevelServices.getAllUserLevels()).payload),
  })

  // branch ที่เลือกอยู่ — ใช้คุม course ตาม branch
  const selectedBranchId = useMemo(() => {
    if (!formData?.branch_id) return null
    return formData.branch_id || null
  }, [formData?.branch_id])

  // courses: ถ้ามี branch ที่เลือก -> โหลดตาม branch, ไม่งั้นโหลดทั้งหมด (simple)
  const { data: courses = [] } = useQuery({
    queryKey: ['courses', selectedBranchId],
    queryFn: async () => {
      const res = selectedBranchId
        ? await CourseServices.getCoursesByBranch(selectedBranchId)
        : await CourseServices.getAllCoursesSimple()
      return toArray<any>(res.payload)
    },
  })

  // ---------- breadcrumbs ----------
  useEffect(() => {
    setBreadcrumbs([
      { text: 'รายชื่อบุคลากร', path: '/admin/personal-list' },
      {
        text: 'แก้ไขบุคลากร',
        path: `/admin/personal-list/${userId}/edit-personal`,
      },
    ])
  }, [userId])

  // ---------- เติม form state เมื่อ user โหลดเสร็จ ----------
  useEffect(() => {
    if (user) {
      setFormData(user)
      if (user.u_img && typeof user.u_img === 'string') {
        setPreviewUrl(`/profile/${user.u_img}`)
      }
    }
  }, [user])

  // ---------- map ชื่อ -> id เมื่อ user + dropdown พร้อม ----------
  useEffect(() => {
    if (!user) return

    setSelectPrefix(user.prefix_name || null)
    setSelectPosition(user.position_name || null)
    setSelectExPosition(user.ex_position_name || null)
    setSelectPersonalType(user.type_p_name || null)
    setSelectBranch(user.branch_name || null)
    setSelectCourse(user.course_name || null)
    setSelectLevel(user.level_name || null)

    const prefix = prefixes.find((p) => p.prefix_name === user.prefix_name)
    const position = positions.find((p) => p.position_name === user.position_name)
    const exPosition = exPositions.find(
      (p) => p.ex_position_name === user.ex_position_name
    )
    const personalType = personalTypes.find(
      (p) => p.type_p_name === user.type_p_name
    )
    const branch = branches.find((b) => b.branch_name === user.branch_name)
    const course = courses.find((c) => c.course_name === user.course_name)
    const userLevel = userLevels.find((l) => l.level_name === user.level_name)

    setFormData((prev) =>
      prev
        ? {
            ...prev,
            prefix_id: prefix?.prefix_id || prev.prefix_id,
            position_id: position?.position_id || prev.position_id,
            ex_position_id: exPosition?.ex_position_id || prev.ex_position_id,
            type_p_id: personalType?.type_p_id || prev.type_p_id,
            branch_id: branch?.branch_id || prev.branch_id,
            course_id: course?.course_id || prev.course_id,
            level_id: userLevel?.level_id || prev.level_id,
          }
        : null
    )
  }, [
    user,
    prefixes,
    positions,
    exPositions,
    personalTypes,
    branches,
    courses,
    userLevels,
  ])

  // ---------- handlers: input / image ----------
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target
    const input = e.target as HTMLInputElement

    if (type === 'file') {
      const file = input.files?.[0]
      if (file) {
        setPreviewUrl(URL.createObjectURL(file))
        setFormData((prev) => (prev ? { ...prev, u_img: file } : null))
      }
    } else {
      setFormData((prev) => (prev ? { ...prev, [name]: value } : null))
    }
  }

  const clearImage = () => {
    setPreviewUrl(null)
    setFormData((prev) => (prev ? { ...prev, u_img: '' } : null))
  }

  // ---------- handlers: dropdown ----------
  const setField = (patch: Partial<Personal>) =>
    setFormData((prev) => (prev ? { ...prev, ...patch } : null))

  const handleSelectPrefix = (value: string) => {
    if (value) {
      const prefix = prefixes.find((p) => p.prefix_id.toString() === value)
      if (prefix) {
        setField({ prefix_id: Number(prefix.prefix_id) })
        setSelectPrefix(prefix.prefix_name)
      }
    } else {
      setSelectPrefix(null)
      setField({ prefix_id: 0 })
    }
  }

  const handleSelectPosition = (value: string) => {
    if (value) {
      const position = positions.find((p) => p.position_id.toString() === value)
      if (position) {
        setField({ position_id: Number(position.position_id) })
        setSelectPosition(position.position_name)
      }
    } else {
      setSelectPosition(null)
      setField({ position_id: 0 })
    }
  }

  const handleSelectExPosition = (value: string) => {
    if (value) {
      const exPosition = exPositions.find(
        (p) => p.ex_position_id.toString() === value
      )
      if (exPosition) {
        setField({ ex_position_id: Number(exPosition.ex_position_id) })
        setSelectExPosition(exPosition.ex_position_name)
      }
    } else {
      setSelectExPosition(null)
      setField({ ex_position_id: 0 })
    }
  }

  const handleSelectPersonalType = (value: string) => {
    if (value) {
      const personalType = personalTypes.find(
        (p) => p.type_p_id.toString() === value
      )
      if (personalType) {
        setField({ type_p_id: Number(personalType.type_p_id) })
        setSelectPersonalType(personalType.type_p_name)
      }
    } else {
      setSelectPersonalType(null)
      setField({ type_p_id: 0 })
    }
  }

  const handleSelectBranch = (value: string) => {
    if (value) {
      const branch = branches.find((b) => b.branch_id.toString() === value)
      if (branch) {
        setSelectBranch(branch.branch_name)
        // เปลี่ยนสาขา -> reset หลักสูตร
        setSelectCourse(null)
        setField({ branch_id: Number(branch.branch_id), course_id: 0 })
      }
    } else {
      setSelectBranch(null)
      setField({ branch_id: 0 })
    }
  }

  const handleSelectCourse = (value: string) => {
    if (value) {
      const course = courses.find((c) => c.course_id.toString() === value)
      if (course) {
        setSelectCourse(course.course_name)
        setField({ course_id: Number(course.course_id) })
      }
    } else {
      setSelectCourse(null)
      setField({ course_id: 0 })
    }
  }

  const handleSelectLevel = (value: string) => {
    if (value) {
      const userLevel = userLevels.find((l) => l.level_id.toString() === value)
      if (userLevel) {
        setField({ level_id: Number(userLevel.level_id) })
        setSelectLevel(userLevel.level_name)
      }
    } else {
      setSelectLevel(null)
      setField({ level_id: 0 })
    }
  }

  // ---------- mutation: update user ----------
  const updateMutation = useMutation({
    mutationFn: (payload: Personal) => {
      const fd = new FormData()
      fd.append('u_fname', payload.u_fname || '')
      fd.append('u_lname', payload.u_lname || '')
      fd.append('u_email', payload.u_email || '')
      fd.append('u_tel', payload.u_tel?.toString() || '')
      fd.append('u_id_card', payload.u_id_card || '')
      fd.append('age', payload.age?.toString() || '')
      fd.append('salary', payload.salary?.toString() || '')
      fd.append('gender', payload.gender || '')

      // id fields — ใช้ค่าใน form ถ้ามี ไม่งั้น map จากชื่อเดิมของ user
      const pick = (
        id: number | undefined,
        list: any[],
        nameKey: string,
        idKey: string,
        currentName?: string
      ) =>
        id && id !== 0
          ? id
          : list.find((x) => x[nameKey] === currentName)?.[idKey]

      const levelId = pick(
        payload.level_id,
        userLevels,
        'level_name',
        'level_id',
        user?.level_name
      )
      const prefixId = pick(
        payload.prefix_id,
        prefixes,
        'prefix_name',
        'prefix_id',
        user?.prefix_name
      )
      const positionId = pick(
        payload.position_id,
        positions,
        'position_name',
        'position_id',
        user?.position_name
      )
      const courseId = pick(
        payload.course_id,
        courses,
        'course_name',
        'course_id',
        user?.course_name
      )
      const typePId = pick(
        payload.type_p_id,
        personalTypes,
        'type_p_name',
        'type_p_id',
        user?.type_p_name
      )
      const exPositionId = pick(
        payload.ex_position_id,
        exPositions,
        'ex_position_name',
        'ex_position_id',
        user?.ex_position_name
      )
      const branchId = pick(
        payload.branch_id,
        branches,
        'branch_name',
        'branch_id',
        user?.branch_name
      )

      const appendId = (key: string, val: number | undefined | null) => {
        if (val !== undefined && val !== null && val !== 0) {
          fd.append(key, val.toString())
        }
      }
      appendId('level_id', levelId)
      appendId('prefix_id', prefixId)
      appendId('position_id', positionId)
      appendId('course_id', courseId)
      appendId('type_p_id', typePId)
      appendId('ex_position_id', exPositionId)
      appendId('branch_id', branchId)
      fd.append('work_start', payload.work_start || '')

      if (payload.u_img) {
        fd.append('u_img', payload.u_img as string | File)
      }

      return UserServices.updateUser(Number(userId), fd)
    },
    onSuccess: (res) => {
      if (res.success) {
        Swal.fire({
          title: 'สำเร็จ!',
          text: 'อัปเดตข้อมูลบุคลากรเรียบร้อยแล้ว',
          icon: 'success',
          confirmButtonText: 'ตกลง',
        }).then(() => router.push('/admin/personal-list'))
      } else {
        Swal.fire({
          title: 'เกิดข้อผิดพลาด!',
          text: res.message || 'ไม่สามารถอัปเดตข้อมูลได้',
          icon: 'error',
          confirmButtonText: 'ตกลง',
        })
      }
    },
    onError: () => {
      Swal.fire({
        title: 'เกิดข้อผิดพลาด!',
        text: 'ไม่สามารถอัปเดตข้อมูลได้',
        icon: 'error',
        confirmButtonText: 'ตกลง',
      })
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData) return
    updateMutation.mutate(formData)
  }

  return {
    // state
    formData,
    previewUrl,
    isSubmitting: updateMutation.isPending,
    // dropdown data
    prefixes,
    positions,
    exPositions,
    personalTypes,
    branches,
    courses,
    userLevels,
    // selected labels
    selectPrefix,
    selectPosition,
    selectExPosition,
    selectPersonalType,
    selectBranch,
    selectCourse,
    selectLevel,
    // handlers
    handleInputChange,
    clearImage,
    handleSelectPrefix,
    handleSelectPosition,
    handleSelectExPosition,
    handleSelectPersonalType,
    handleSelectBranch,
    handleSelectCourse,
    handleSelectLevel,
    handleSubmit,
  }
}
