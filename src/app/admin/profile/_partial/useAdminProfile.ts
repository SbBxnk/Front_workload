'use client'

import type React from 'react'
import { useEffect, useRef, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { signOut } from 'next-auth/react'
import { useMutation } from '@tanstack/react-query'
import Swal from 'sweetalert2'
import type { Personal } from '@/Types'
import useUtility from '@/hooks/useUtility'
import AuthService from '@/services/authService'
import { useCurrentUser } from '@/hooks/useCurrentUser'

// แปลงวันที่เป็นรูปแบบภาษาไทย (พ.ศ.)
export const convertToThaiDate = (dateString: string) => {
  try {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return dateString

    const thaiMonths = [
      'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
      'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม',
    ]

    const day = date.getDate()
    const month = thaiMonths[date.getMonth()]
    const year = date.getFullYear() + 543 // แปลงเป็น พ.ศ.

    return `${day} ${month} ${year}`
  } catch {
    return dateString
  }
}

// สร้าง FormData สำหรับอัปเดตโปรไฟล์ (ยกเว้น u_pass)
const buildProfileFormData = (
  user: Personal,
  form: HTMLFormElement
): FormData => {
  const formData = new FormData()
  formData.set('u_email', user.u_email || '')
  formData.set('u_fname', user.u_fname || '')
  formData.set('u_lname', user.u_lname || '')
  formData.set('u_id_card', user.u_id_card || '')
  formData.set('u_tel', user.u_tel?.toString() || '')
  formData.set('prefix_id', user.prefix_id?.toString() || '1')
  formData.set('level_id', user.level_id?.toString() || '1')
  formData.set('position_id', user.position_id?.toString() || '1')
  formData.set('ex_position_id', user.ex_position_id?.toString() || '0')
  formData.set('course_id', user.course_id?.toString() || '1')
  formData.set('branch_id', user.branch_id?.toString() || '1')
  formData.set('type_p_id', user.type_p_id?.toString() || '1')
  formData.set('gender', user.gender || 'ชาย')
  formData.set('age', user.age?.toString() || '0')
  formData.set('salary', user.salary?.toString() || '0')
  formData.set('work_start', user.work_start || '')

  // รูปโปรไฟล์ - ส่งเฉพาะเมื่อมีไฟล์ใหม่ (ไม่งั้น backend ใช้รูปเดิม)
  const imageInput = form.querySelector(
    'input[name="u_img"]'
  ) as HTMLInputElement | null
  if (imageInput && imageInput.files && imageInput.files.length > 0) {
    formData.set('u_img', imageInput.files[0])
  }

  return formData
}

/**
 * รวม logic ของหน้าโปรไฟล์แอดมิน:
 * - โหลดข้อมูลโปรไฟล์ปัจจุบันจาก GET /me (useCurrentUser)
 * - form state + การจัดการ/พรีวิวรูป (react-dropzone)
 * - useMutation อัปเดตโปรไฟล์ผ่าน AuthService.UpdateProfile + Swal
 * - handleSignOut (next-auth signOut) สำหรับปุ่ม logout
 */
export function useAdminProfile() {
  const { setBreadcrumbs } = useUtility()
  const { data: fetchedUser } = useCurrentUser()

  const [user, setUser] = useState<Personal | null>(null)
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState<boolean>(false)
  const formRef = useRef<HTMLFormElement>(null)

  // ---------- breadcrumbs ----------
  useEffect(() => {
    setBreadcrumbs([{ text: 'ข้อมูลส่วนตัว', path: '/admin/profile' }])
  }, [])

  // ---------- ซิงค์ข้อมูลโปรไฟล์จาก API ----------
  useEffect(() => {
    if (fetchedUser && !isEditing) {
      setUser(fetchedUser)
    }
  }, [fetchedUser, isEditing])

  // ---------- dropzone (อัปโหลด/พรีวิวรูป) ----------
  const onDrop = (acceptedFiles: File[]) => {
    if (acceptedFiles && acceptedFiles.length > 0) {
      const file = acceptedFiles[0]
      setPreviewImage(URL.createObjectURL(file))
    }
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },
    multiple: false,
    disabled: !isEditing, // ปิด dropzone เมื่อไม่ได้แก้ไข
  })

  // cleanup blob URL ของพรีวิว
  useEffect(() => {
    return () => {
      if (previewImage && previewImage.startsWith('blob:')) {
        URL.revokeObjectURL(previewImage)
      }
    }
  }, [previewImage])

  // ---------- mutation: update profile ----------
  const updateMutation = useMutation({
    mutationFn: (formData: FormData) => AuthService.UpdateProfile(formData),
    onSuccess: (response) => {
      if (response.success) {
        setIsEditing(false)
        if (previewImage && previewImage.startsWith('blob:')) {
          URL.revokeObjectURL(previewImage)
          setPreviewImage(null)
        }
        Swal.fire({
          title: 'สำเร็จ!',
          text: 'บันทึกข้อมูลส่วนตัวเรียบร้อยแล้ว กรุณาเข้าสู่ระบบอีกครั้ง',
          icon: 'success',
          confirmButtonText: 'ตกลง',
          confirmButtonColor: '#10b981',
        }).then(() => {
          signOut({ callbackUrl: '/login' })
        })
      } else {
        Swal.fire({
          title: 'เกิดข้อผิดพลาด!',
          text: response.message || 'ไม่สามารถบันทึกข้อมูลได้',
          icon: 'error',
          confirmButtonText: 'ตกลง',
          confirmButtonColor: '#ef4444',
        })
      }
    },
    onError: (error: any) => {
      Swal.fire({
        title: 'เกิดข้อผิดพลาด!',
        text:
          error?.response?.data?.message ||
          error?.message ||
          'เกิดข้อผิดพลาดในการเชื่อมต่อ',
        icon: 'error',
        confirmButtonText: 'ตกลง',
        confirmButtonColor: '#ef4444',
      })
    },
  })

  // ---------- handlers ----------
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formRef.current || !user) return
    const formData = buildProfileFormData(user, formRef.current)
    updateMutation.mutate(formData)
  }

  const handleEditToggle = () => {
    setIsEditing(!isEditing)
    if (isEditing) {
      // ยกเลิกการแก้ไข -> รีเซ็ตค่ากลับเป็นข้อมูลจาก API
      if (fetchedUser) {
        setUser(fetchedUser)
        setPreviewImage(null)
      }
    }
  }

  const handleSignOut = () => {
    signOut({ callbackUrl: '/login' })
  }

  const requestSubmit = () => {
    formRef.current?.requestSubmit()
  }

  return {
    user,
    setUser,
    previewImage,
    isEditing,
    formRef,
    isSubmitting: updateMutation.isPending,
    getRootProps,
    getInputProps,
    isDragActive,
    handleSubmit,
    handleEditToggle,
    handleSignOut,
    requestSubmit,
  }
}
