'use client'

import type React from 'react'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useMutation } from '@tanstack/react-query'
import { useDropzone } from 'react-dropzone'
import Swal from 'sweetalert2'
import type { User } from '@/Types'
import UserServices from '@/services/userServices'
import useUtility from '@/hooks/useUtility'

const initialFormData: User = {
  u_id: 0,
  prefix_id: 0,
  u_fname: '',
  u_lname: '',
  age: '',
  gender: '',
  level_id: 0,
  u_id_card: '',
  position_id: 0,
  ex_position_id: 0,
  type_p_id: 0,
  course_id: 0,
  branch_id: 0,
  salary: '',
  work_start: '',
  u_tel: '',
  u_img: '' as string | File,
  u_email: '',
  u_pass: '',
  prefix_name: '',
  ex_position_name: '',
  level_name: '',
  position_name: '',
  type_p_name: '',
  course_name: '',
  branch_name: '',
}

// แปลง formData เป็น FormData สำหรับส่งไฟล์รูป (รักษา behavior เดิม)
const toFormData = (formData: User): FormData => {
  const fd = new FormData()
  Object.entries(formData).forEach(([key, value]) => {
    if (key === 'u_img' && value instanceof File) {
      fd.append('u_img', value)
    } else {
      fd.append(key, String(value))
    }
  })
  return fd
}

/**
 * รวม logic ฟอร์มเพิ่มบุคลากร: state, รูปภาพ (dropzone), การเลือก dropdown,
 * และ mutation สร้าง user + แจ้งผล + redirect
 */
export function useCreatePersonal() {
  const { setBreadcrumbs } = useUtility()
  const router = useRouter()

  const [formData, setFormData] = useState<User>(initialFormData)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  // ป้ายชื่อที่แสดงบน dropdown (selected label)
  const [labels, setLabels] = useState({
    prefix: '',
    position: '',
    exPosition: '',
    personalType: '',
    branch: '',
    course: '',
    level: '',
  })

  useEffect(() => {
    setBreadcrumbs([
      { text: 'รายชื่อบุคลากร', path: '/admin/personal-list' },
      { text: 'เพิ่มบุคลากร', path: '/admin/personal-list/create-personal' },
    ])
  }, [])

  const setField = (name: keyof User, value: User[keyof User]) =>
    setFormData((prev) => ({ ...prev, [name]: value }))

  // ---------- รูปภาพ ----------
  const setImageFile = (file: File) => {
    setPreviewUrl(URL.createObjectURL(file))
    setFormData((prev) => ({ ...prev, u_img: file }))
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles: File[]) => {
      if (acceptedFiles[0]) setImageFile(acceptedFiles[0])
    },
    accept: { 'image/*': ['.jpeg', '.jpg', '.png', '.gif'] },
  })

  const handleRemoveImage = () => {
    setPreviewUrl(null)
    setFormData((prev) => ({ ...prev, u_img: '' }))
  }

  // ---------- input ทั่วไป ----------
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, files } = e.target as HTMLInputElement
    if (name === 'u_img' && files && files.length > 0) {
      setImageFile(files[0])
    } else {
      setField(name as keyof User, value)
    }
  }

  // ---------- dropdown ----------
  const handleSelectPrefix = (id: number, name: string) => {
    setField('prefix_id', Number(id))
    setLabels((l) => ({ ...l, prefix: name }))
  }
  const clearPrefix = () => {
    setField('prefix_id', 0)
    setLabels((l) => ({ ...l, prefix: '' }))
  }

  const handleSelectPosition = (id: number, name: string) => {
    setField('position_id', Number(id))
    setLabels((l) => ({ ...l, position: name }))
  }
  const clearPosition = () => {
    setField('position_id', 0)
    setLabels((l) => ({ ...l, position: '' }))
  }

  const handleSelectExPosition = (id: number, name: string) => {
    setField('ex_position_id', Number(id))
    setLabels((l) => ({ ...l, exPosition: name }))
  }
  const clearExPosition = () => {
    setField('ex_position_id', 0)
    setLabels((l) => ({ ...l, exPosition: '' }))
  }

  const handleSelectPersonalType = (id: number, name: string) => {
    setField('type_p_id', Number(id))
    setLabels((l) => ({ ...l, personalType: name }))
  }
  const clearPersonalType = () => {
    setField('type_p_id', 0)
    setLabels((l) => ({ ...l, personalType: '' }))
  }

  // เปลี่ยนสาขา → reset หลักสูตร (รักษา behavior เดิม)
  const handleSelectBranch = (id: number, name: string) => {
    setFormData((prev) => ({ ...prev, branch_id: Number(id), course_id: 0 }))
    setLabels((l) => ({ ...l, branch: name, course: '' }))
  }
  const clearBranch = () => {
    setFormData((prev) => ({ ...prev, branch_id: 0, course_id: 0 }))
    setLabels((l) => ({ ...l, branch: '', course: '' }))
  }

  const handleSelectCourse = (id: number, name: string) => {
    setField('course_id', Number(id))
    setLabels((l) => ({ ...l, course: name }))
  }
  const clearCourse = () => {
    setField('course_id', 0)
    setLabels((l) => ({ ...l, course: '' }))
  }

  const handleSelectUserLevel = (id: number, name: string) => {
    setField('level_id', Number(id))
    setLabels((l) => ({ ...l, level: name }))
  }
  const clearUserLevel = () => {
    setField('level_id', 0)
    setLabels((l) => ({ ...l, level: '' }))
  }

  // ---------- submit ----------
  const createMutation = useMutation({
    mutationFn: () => UserServices.createUser(toFormData(formData)),
    onSuccess: () => {
      Swal.fire({
        position: 'center',
        icon: 'success',
        title: 'สำเร็จ!',
        text: 'เพิ่มบุคลากรสำเร็จ!',
        showConfirmButton: false,
        timer: 1500,
      })
      router.push('/admin/personal-list')
    },
    onError: (error: unknown) => {
      const axiosError = error as {
        response?: { data?: { message?: string } }
      }
      Swal.fire({
        position: 'center',
        icon: 'error',
        title: 'เกิดข้อผิดพลาด!',
        text:
          axiosError.response?.data?.message ||
          'เกิดข้อผิดพลาดในการเพิ่มบุคลากร',
        showConfirmButton: false,
        timer: 1500,
      })
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    createMutation.mutate()
  }

  return {
    formData,
    labels,
    previewUrl,
    isDragActive,
    getRootProps,
    getInputProps,
    handleInputChange,
    handleRemoveImage,
    handleSubmit,
    isSubmitting: createMutation.isPending,
    dropdown: {
      prefix: { select: handleSelectPrefix, clear: clearPrefix },
      position: { select: handleSelectPosition, clear: clearPosition },
      exPosition: { select: handleSelectExPosition, clear: clearExPosition },
      personalType: {
        select: handleSelectPersonalType,
        clear: clearPersonalType,
      },
      branch: { select: handleSelectBranch, clear: clearBranch },
      course: { select: handleSelectCourse, clear: clearCourse },
      level: { select: handleSelectUserLevel, clear: clearUserLevel },
    },
  }
}
