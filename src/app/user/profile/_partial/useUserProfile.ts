'use client'

import type React from 'react'
import { useEffect, useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { useDropzone } from 'react-dropzone'
import { useSession, signOut } from 'next-auth/react'
import { jwtDecode } from 'jwt-decode'
import Swal from 'sweetalert2'
import type { UserLoginData } from '@/Types'
import useUtility from '@/hooks/useUtility'
import AuthService from '@/services/authService'

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
  } catch (error) {
    return dateString
  }
}

// สร้าง FormData สำหรับอัปเดตโปรไฟล์ (ทุก field ยกเว้น u_pass)
const buildProfileFormData = (
  user: UserLoginData,
  imageFile: File | null
): FormData => {
  const formData = new FormData()

  formData.set('u_email', user.u_email || '')
  formData.set('u_fname', user.u_fname || '')
  formData.set('u_lname', user.u_lname || '')
  formData.set('u_id_card', user.u_id_card || '')
  formData.set('u_tel', user.u_tel || '')
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

  // แนบรูปใหม่เฉพาะเมื่อมีการอัปโหลด — ไม่งั้นให้ backend ใช้รูปเดิม
  if (imageFile) {
    formData.set('u_img', imageFile)
  }

  return formData
}

/**
 * รวม logic ของหน้าโปรไฟล์ผู้ใช้:
 * - decode ข้อมูลผู้ใช้จาก session.accessToken
 * - form state + edit toggle + การจัดการรูป (dropzone)
 * - useMutation เรียก AuthService.UpdateProfile + Swal + signOut
 * - handleSignOut (logout จาก next-auth)
 */
export function useUserProfile() {
  const { setBreadcrumbs } = useUtility()
  const { data: session } = useSession()

  const [user, setUser] = useState<UserLoginData | null>(null)
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [isEditing, setIsEditing] = useState<boolean>(false)

  // ---------- breadcrumbs + decode user จาก token ----------
  useEffect(() => {
    setBreadcrumbs([{ text: 'ข้อมูลส่วนตัว', path: '/user/profile' }])

    if (session?.accessToken) {
      const decoded: UserLoginData = jwtDecode(session.accessToken)
      setUser(decoded)
    }
  }, [session?.accessToken])

  // ---------- cleanup blob url ของ preview ----------
  useEffect(() => {
    return () => {
      if (previewImage && previewImage.startsWith('blob:')) {
        URL.revokeObjectURL(previewImage)
      }
    }
  }, [previewImage])

  // ---------- dropzone (เปิดเฉพาะตอนแก้ไข) ----------
  const onDrop = (acceptedFiles: File[]) => {
    if (acceptedFiles && acceptedFiles.length > 0) {
      const file = acceptedFiles[0]
      setImageFile(file)
      setPreviewImage(URL.createObjectURL(file))
    }
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },
    multiple: false,
    disabled: !isEditing,
  })

  // ---------- field change ----------
  const setUserField = (patch: Partial<UserLoginData>) =>
    setUser((prev) => (prev ? { ...prev, ...patch } : null))

  // ---------- mutation: update profile ----------
  const updateMutation = useMutation({
    mutationFn: (payload: UserLoginData) =>
      AuthService.UpdateProfile(buildProfileFormData(payload, imageFile)),
    onSuccess: (response) => {
      if (response.success) {
        setIsEditing(false)
        if (previewImage && previewImage.startsWith('blob:')) {
          URL.revokeObjectURL(previewImage)
        }
        setPreviewImage(null)
        setImageFile(null)

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
    if (!user) return
    updateMutation.mutate(user)
  }

  const handleEditToggle = () => {
    setIsEditing((prev) => {
      const next = !prev
      // ยกเลิกแก้ไข -> reset ค่าเดิมจาก token + ล้าง preview
      if (prev && session?.accessToken) {
        const decoded: UserLoginData = jwtDecode(session.accessToken)
        setUser(decoded)
        if (previewImage && previewImage.startsWith('blob:')) {
          URL.revokeObjectURL(previewImage)
        }
        setPreviewImage(null)
        setImageFile(null)
      }
      return next
    })
  }

  const handleSignOut = () => {
    signOut({ callbackUrl: '/login' })
  }

  return {
    user,
    previewImage,
    isEditing,
    isSubmitting: updateMutation.isPending,
    // dropzone
    getRootProps,
    getInputProps,
    isDragActive,
    // handlers
    setUserField,
    handleSubmit,
    handleEditToggle,
    handleSignOut,
  }
}
