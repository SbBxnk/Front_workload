'use client'
import type React from 'react'
import { useState, useRef, useEffect } from 'react'
import SelectPrefix from './ProfileComponents/SelectPrefix'
import { useDropzone } from 'react-dropzone'
import Image from 'next/image'
import { jwtDecode } from 'jwt-decode'
import SelectPosition from './ProfileComponents/SelectPosition'
import SelectExPosition from './ProfileComponents/SelectExPosition'
import { useSession, signOut } from 'next-auth/react'
import AuthService from '@/services/authService'
import Swal from 'sweetalert2'

interface UserLoginData {
  id: string
  gender: string
  prefix_name: string
  prefix_id: number
  u_fname: string
  u_lname: string
  age: number
  branch_name: string
  course_name: string
  course_id: number
  ex_position_name: string
  ex_position_id: number
  exp: number
  iat: number
  level_name: string
  position_id: number
  position_name: string
  salary: number
  type_p_name: string
  type_p_id: number
  u_email: string
  u_id_card: string
  u_img: string
  u_tel: string
  work_start: string
}

// ฟังก์ชันแปลงวันที่เป็นรูปแบบภาษาไทย
const convertToThaiDate = (dateString: string) => {
  try {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return dateString
    
    const thaiMonths = [
      'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
      'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
    ]
    
    const day = date.getDate()
    const month = thaiMonths[date.getMonth()]
    const year = date.getFullYear() + 543 // แปลงเป็น พ.ศ.
    
    return `${day} ${month} ${year}`
  } catch (error) {
    return dateString
  }
}

export default function EditProfile() {
  const [user, setUser] = useState<UserLoginData | null>(null)
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)
  const { data: session } = useSession()

  const prefixDropdownRef = useRef<HTMLDivElement>(null)
  const positionDropdownRef = useRef<HTMLDivElement>(null)
  const expositionDropdownRef = useRef<HTMLDivElement>(null)

  const [selectPrefix, setSelectPrefix] = useState<number | null>(null)
  const [selectPosition, setSelectPosition] = useState<number | null>(null)
  const [selectExPosition, setSelectExPosition] = useState<number | null>(null)

  useEffect(() => {
    if (session?.accessToken) {
      const decoded: UserLoginData = jwtDecode(session.accessToken)
      setUser(decoded)
      setSelectPrefix(decoded.prefix_id)
      setSelectPosition(decoded.position_id)
      setSelectExPosition(decoded.ex_position_id)
    }
  }, [session?.accessToken])

  const onDrop = (acceptedFiles: File[]) => {
    if (acceptedFiles && acceptedFiles.length > 0) {
      const file = acceptedFiles[0]
      const objectUrl = URL.createObjectURL(file)
      setPreviewImage(objectUrl)
    }
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': [],
    },
    multiple: false,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Form submitted - Full edit mode (all fields except password)')
    console.log('User data:', user)
    
    if (formRef.current && user) {
      const formData = new FormData()

      // ส่งข้อมูลที่สามารถแก้ไขได้ทั้งหมด (ยกเว้น u_pass)
      formData.set('u_email', user.u_email || '')
      formData.set('u_fname', user.u_fname || '')
      formData.set('u_lname', user.u_lname || '')
      formData.set('u_id_card', user.u_id_card || '')
      formData.set('u_tel', user.u_tel || '')
      formData.set('prefix_id', user.prefix_id?.toString() || '1')
      formData.set('level_id', (user as any).level_id?.toString() || '1')
      formData.set('position_id', user.position_id?.toString() || '1')
      formData.set('ex_position_id', user.ex_position_id?.toString() || '0')
      formData.set('course_id', user.course_id?.toString() || '1')
      formData.set('type_p_id', user.type_p_id?.toString() || '1')
      formData.set('gender', user.gender || 'ชาย')
      formData.set('age', user.age?.toString() || '0')
      formData.set('salary', user.salary?.toString() || '0')
      formData.set('work_start', user.work_start || '')

      // จัดการรูปโปรไฟล์ - ถ้ามีการอัปโหลดไฟล์ใหม่
      const imageInput = formRef.current.querySelector('input[name="u_img"]') as HTMLInputElement
      if (imageInput && imageInput.files && imageInput.files.length > 0) {
        const imageFile = imageInput.files[0]
        formData.set('u_img', imageFile)
        console.log('Uploading new profile image:', imageFile.name, imageFile.size, 'bytes')
      } else {
        // ถ้าไม่มีไฟล์ใหม่ ไม่ต้องส่ง u_img (ให้ backend ใช้รูปเดิม)
        console.log('Using existing profile image:', user.u_img)
      }

      console.log('FormData contents:')
      for (let [key, value] of formData.entries()) {
        console.log(key, value)
      }

      try {
        const response = await AuthService.UpdateProfile(session?.accessToken as string, formData)
        
        if (response.success) {
          console.log('Profile updated successfully:', response.payload)
          
          // รีเซ็ต preview image หลังจากอัปเดตสำเร็จ
          if (previewImage && previewImage.startsWith('blob:')) {
            URL.revokeObjectURL(previewImage)
            setPreviewImage(null)
          }

          
          // แสดง SweetAlert สำเร็จ
          Swal.fire({
            title: 'สำเร็จ!',
            text: 'บันทึกข้อมูลส่วนตัวเรียบร้อยแล้ว กรุณาเข้าสู่ระบบอีกครั้ง',
            icon: 'success',
            confirmButtonText: 'ตกลง',
            confirmButtonColor: '#10b981'
          }).then(() => {
            signOut({ callbackUrl: '/login' })
          })
        } else {
          console.error('Failed to update profile:', response.message)
          
          // แสดง SweetAlert error จาก message
          Swal.fire({
            title: 'เกิดข้อผิดพลาด!',
            text: response.message || 'ไม่สามารถบันทึกข้อมูลได้',
            icon: 'error',
            confirmButtonText: 'ตกลง',
            confirmButtonColor: '#ef4444'
          })
        }
      } catch (error: any) {
        console.error('Error updating profile:', error)
        
        // แสดง SweetAlert error จาก catch
        Swal.fire({
          title: 'เกิดข้อผิดพลาด!',
          text: error?.response?.data?.message || error?.message || 'เกิดข้อผิดพลาดในการเชื่อมต่อ',
          icon: 'error',
          confirmButtonText: 'ตกลง',
          confirmButtonColor: '#ef4444'
        })
      }
    } else {
      console.log('Form reference is null or user data is not available')
    }
  }

  const logFormData = (formData: FormData) => {
    console.log('Saving user data:')
    for (const [key, value] of formData.entries()) {
      if (value instanceof File) {
        console.log(`${key}: File - ${value.name} (${value.size} bytes)`)
      } else {
        console.log(`${key}: ${value}`)
      }
    }
  }

  useEffect(() => {
    return () => {
      if (previewImage && previewImage.startsWith('blob:')) {
        URL.revokeObjectURL(previewImage)
      }
    }
  }, [previewImage])

  if (!user) {
    return <div>Loading...</div>
  }

  return (
    <form onSubmit={handleSubmit} ref={formRef}>
      <div className="h-auto w-full rounded-md bg-white p-0 text-base-content shadow transition-all duration-300 ease-in-out dark:bg-zinc-900">
        <div className="flex flex-col p-4 lg:flex-row">
          <div className="h-full w-full">
            <div className="space-y-2">
              <div className="flex flex-col gap-0 md:flex-row md:gap-4">
                <div className="flex flex-row items-center justify-center">
                  <div
                    {...getRootProps()}
                    className="relative h-36 w-36 cursor-pointer overflow-hidden rounded-md border-2 border-dashed border-gray-400 bg-gray-100 transition-all transition-colors duration-200 duration-300 ease-in-out hover:border-gray-500 dark:border-gray-600 dark:bg-zinc-700 dark:hover:border-gray-500 md:h-48 md:w-48"
                  >
                    <input {...getInputProps()} name="u_img" />
                    <div className="relative h-full w-full">
                      <Image
                        src={
                          previewImage
                            ? previewImage
                            : user.u_img
                              ? `/images/${user.u_img}`
                              : '/images/default.png'
                        }
                        alt="Profile Preview"
                        layout="fill"
                        objectFit="cover"
                        unoptimized={!!previewImage}
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 transition-opacity duration-300 hover:opacity-100">
                        <span className="text-sm text-white">
                          {isDragActive ? 'วางรูปภาพที่นี่' : 'เปลี่ยนรูปภาพ'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex w-full flex-col justify-end gap-4">
                  <div className="flex flex-col gap-4 md:flex-row">
                    <div className="flex-1">
                      <SelectPrefix
                        openDropdown={openDropdown}
                        setOpenDropdown={setOpenDropdown}
                        prefixDropdownRef={prefixDropdownRef}
                        setSelectPrefix={setSelectPrefix}
                        handleOnChangePrefix={(prefix_id: number) =>
                          setSelectPrefix(prefix_id)
                        }
                        initialPrefixName={user.prefix_name}
                      />
                    </div>
                    <div className="flex-1">
                      <div className="space-y-2">
                        <label className="font-regular mb-2 block text-sm text-gray-600 dark:text-gray-400">
                          เพศ
                        </label>
                        <div className="flex h-full items-center gap-6">
                          <label className="flex cursor-pointer items-center space-x-2">
                            <input
                              type="radio"
                              name="gender"
                              value="ชาย"
                              checked={user.gender === 'ชาย'}
                              onChange={(e) =>
                                setUser({ ...user, gender: e.target.value })
                              }
                              className="h-4 w-4 cursor-pointer border-gray-300 bg-gray-100 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="font-light text-gray-600 dark:text-gray-400">
                              ชาย
                            </span>
                          </label>
                          <label className="flex cursor-pointer items-center space-x-2">
                            <input
                              type="radio"
                              name="gender"
                              value="หญิง"
                              checked={user.gender === 'หญิง'}
                              onChange={(e) =>
                                setUser({ ...user, gender: e.target.value })
                              }
                              className="h-4 w-4 cursor-pointer border-gray-300 bg-gray-100 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="font-light text-gray-600 dark:text-gray-400">
                              หญิง
                            </span>
                          </label>
                        </div>
                      </div>
                    </div>
                    <div className="flex-1"></div>
                  </div>
                  <div className="flex flex-col gap-4 md:flex-row">
                    <div className="flex-1">
                      <label className="font-regular mb-2 block text-sm text-gray-600 dark:text-gray-400">
                        ชื่อ
                      </label>
                      <input
                        name="u_fname"
                        value={user.u_fname}
                        onChange={(e) =>
                          setUser({ ...user, u_fname: e.target.value })
                        }
                        type="text"
                        disabled={!isEditing}
                        className="w-full rounded-md border-2 border-gray-300 px-4 py-2 text-sm font-light text-gray-600 transition-all transition-colors duration-300 ease-in-out focus:border-blue-500 focus:outline-none disabled:bg-gray-100 disabled:cursor-not-allowed dark:border-zinc-600 dark:bg-zinc-800 dark:text-gray-400 dark:disabled:bg-zinc-700"
                        placeholder="กรอกชื่อ"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="font-regular mb-2 block text-sm text-gray-600 dark:text-gray-400">
                        นามสกุล
                      </label>
                      <input
                        name="u_lname"
                        value={user.u_lname}
                        onChange={(e) =>
                          setUser({ ...user, u_lname: e.target.value })
                        }
                        type="text"
                        disabled={!isEditing}
                        className="w-full rounded-md border-2 border-gray-300 px-4 py-2 text-sm font-light text-gray-600 transition-all transition-colors duration-300 ease-in-out focus:border-blue-500 focus:outline-none disabled:bg-gray-100 disabled:cursor-not-allowed dark:border-zinc-600 dark:bg-zinc-800 dark:text-gray-400 dark:disabled:bg-zinc-700"
                        placeholder="กรอกนามสกุล"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="font-regular mb-2 block text-sm text-gray-600 dark:text-gray-400">
                        อายุ (ปี)
                      </label>
                      <input
                        name="age"
                        value={user.age}
                        onChange={(e) =>
                          setUser({
                            ...user,
                            age: Number.parseInt(e.target.value) || 0,
                          })
                        }
                        type="number"
                        disabled={!isEditing}
                        className="w-full rounded-md border-2 border-gray-300 px-4 py-2 text-sm font-light text-gray-600 transition-all transition-colors duration-300 ease-in-out focus:border-blue-500 focus:outline-none disabled:bg-gray-100 disabled:cursor-not-allowed dark:border-zinc-600 dark:bg-zinc-800 dark:text-gray-400 dark:disabled:bg-zinc-700"
                        placeholder="กรอกอายุ"
                        min="0"
                        step="1"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="h-full w-full bg-white p-0 pb-16 text-base-content shadow transition-all duration-300 ease-in-out dark:bg-zinc-900 md:rounded-md md:pb-0">
          <div className="flex flex-col p-4 lg:flex-row">
            <div className="h-full w-full">
              <div className="space-y-2">
                <div className="flex flex-col gap-4 md:flex-row">
                  <div className="flex-1">
                    <label className="font-regular mb-2 block text-sm text-gray-600 dark:text-gray-400">
                      หรัสประจำตำแหน่ง
                    </label>
                    <input
                      name="u_id_card"
                      value={user.u_id_card}
                      onChange={(e) =>
                        setUser({ ...user, u_id_card: e.target.value })
                      }
                      type="text"
                      disabled={!isEditing}
                      className="w-full rounded-md border-2 border-gray-300 px-4 py-2 text-sm font-light text-gray-600 transition-all transition-colors duration-300 ease-in-out focus:border-blue-500 focus:outline-none disabled:bg-gray-100 disabled:cursor-not-allowed dark:border-zinc-600 dark:bg-zinc-800 dark:text-gray-400 dark:disabled:bg-zinc-700"
                      placeholder="6564XXXXXXX-X"
                    />
                  </div>
                  <div className="flex-1">
                    <SelectPosition
                      openDropdown={openDropdown}
                      setOpenDropdown={setOpenDropdown}
                      positionDropdownRef={positionDropdownRef}
                      setSelectPosition={setSelectPosition}
                      handleOnChangePosition={(position_id: number) =>
                        setSelectPosition(position_id)
                      }
                      initialPositionName={user.position_name}
                    />
                  </div>
                  <div className="flex-1">
                    <SelectExPosition
                      openDropdown={openDropdown}
                      setOpenDropdown={setOpenDropdown}
                      expositionDropdownRef={expositionDropdownRef}
                      setSelectExPosition={setSelectExPosition}
                      handleOnChangeExPosition={(ex_position_id: number) =>
                        setSelectPosition(ex_position_id)
                      }
                      initialExPositionName={user.ex_position_name}
                    />
                  </div>
                  <div className="flex-1">
                    {/* <SelectPersonalType
                      type_p_id={0}
                      type_p_name={''}
                      openDropdown={openDropdown}
                      setOpenDropdown={setOpenDropdown}
                      personalTypeDropdownRef={personalTypeDropdownRef}
                      selectPersonalType={selectPersonalType}
                      setSelectPersonalType={setSelectPersonalType}
                      handleOnChangePersonalType={handleOnChangePersonalType}
                    /> */}
                  </div>
                </div>

                <div className="flex flex-col gap-4 md:flex-row">
                  <div className="flex-1">
                    <label className="font-regular mb-2 block text-sm text-gray-600 dark:text-gray-400">
                      วันรับราขการ
                    </label>
                    <input
                      name="work_start"
                      value={user.work_start ? convertToThaiDate(user.work_start) : ''}
                      type="text"
                      disabled={true}
                      className="w-full rounded-md border-2 border-gray-300 px-4 py-2 text-sm font-light text-gray-600 transition-all transition-colors duration-300 ease-in-out focus:border-blue-500 focus:outline-none disabled:bg-gray-100 disabled:cursor-not-allowed dark:border-zinc-600 dark:bg-zinc-800 dark:text-gray-400 dark:disabled:bg-zinc-700"
                      placeholder="วันรับราขการ"
                    />
                  </div>
                  <div className="flex-1">
                    {/* <SelectBranch
                      setOpenDropdown={setOpenDropdown}
                      openDropdown={openDropdown}
                      branch_id={0}
                      branch_name={''}
                      branchDropdownRef={branchDropdownRef}
                      setSelectedBranch={setSelectedBranch}
                      selectBranch={selectBranch}
                      handleOnChangeBranch={handleOnChangeBranch}

                    /> */}
                  </div>
                  <div className="flex-1">
                    {/* <SelectCourse
                      openDropdown={openDropdown}
                      setOpenDropdown={setOpenDropdown}
                      courseDropdownRef={courseDropdownRef}
                      course_id={0}
                      course_name=''
                      setSelectedCourse={setSelectedCourse}
                      selectCourse={selectCourse}
                      handleOnChangeCourse={handleOnChangeCourse}
                    /> */}
                  </div>

                  {/* ระดับผู้ใช้งาน */}
                  <div className="flex-1">
                    {/* <SelectUserLevel
                      userLevelDropdownRef={userLevelDropdownRef}
                      setOpenDropdown={setOpenDropdown}
                      openDropdown={openDropdown}
                      level_id={0}
                      level_name={''}
                      setSelectedLevel={setSelectedLevel}
                      selectLevel={selectLevel}
                      handleOnChangeUserLevel={handleOnChangeUserLevel}
                    /> */}
                  </div>
                </div>

                <div className="flex flex-col gap-4 md:flex-row">
                  <div className="flex-1">
                    <label className="font-regular mb-2 block text-sm text-gray-600 dark:text-gray-400">
                      เงินเดือน
                    </label>
                    <input
                      name="salary"
                      value={user.salary}
                      onChange={(e) =>
                        setUser({ ...user, salary: parseFloat(e.target.value) || 0 })
                      }
                      type="number"
                      disabled={!isEditing}
                      className="w-full rounded-md border-2 border-gray-300 px-4 py-2 text-sm font-light text-gray-600 transition-all transition-colors duration-300 ease-in-out focus:border-blue-500 focus:outline-none disabled:bg-gray-100 disabled:cursor-not-allowed dark:border-zinc-600 dark:bg-zinc-800 dark:text-gray-400 dark:disabled:bg-zinc-700"
                      placeholder="กรอกจำนวนเงินเดือน"
                      min="0"
                      step="0.01"
                    />
                  </div>

                  <div className="flex-1">
                    <label className="font-regular mb-2 block text-sm text-gray-600 dark:text-gray-400">
                      เบอร์ติดต่อ
                    </label>
                    <input
                      name="u_tel"
                      value={user.u_tel}
                      onChange={(e) =>
                        setUser({ ...user, u_tel: e.target.value })
                      }
                      type="number"
                      disabled={!isEditing}
                      className="w-full rounded-md border-2 border-gray-300 px-4 py-2 text-sm font-light text-gray-600 transition-all transition-colors duration-300 ease-in-out focus:border-blue-500 focus:outline-none disabled:bg-gray-100 disabled:cursor-not-allowed dark:border-zinc-600 dark:bg-zinc-800 dark:text-gray-400 dark:disabled:bg-zinc-700"
                      placeholder="กรอกเบอร์โทรศัพท์"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="font-regular mb-2 block text-sm text-gray-600 dark:text-gray-400">
                      RMUTL อีเมล
                    </label>
                    <input
                      name="u_email"
                      value={user.u_email}
                      onChange={(e) =>
                        setUser({ ...user, u_email: e.target.value })
                      }
                      type="text"
                      disabled={!isEditing}
                      className="w-full rounded-md border-2 border-gray-300 px-4 py-2 text-sm font-light text-gray-600 transition-all transition-colors duration-300 ease-in-out focus:border-blue-500 focus:outline-none disabled:bg-gray-100 disabled:cursor-not-allowed dark:border-zinc-600 dark:bg-zinc-800 dark:text-gray-400 dark:disabled:bg-zinc-700"
                      placeholder="example.live.rmutl.ac.th"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="w-full rounded-b-md bg-white transition-all duration-300 ease-in-out dark:bg-zinc-900">
            <div className="flex justify-end gap-2 px-4 pb-4 pt-2">
              {!isEditing ? (
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="drawer-button w-full cursor-pointer rounded-md bg-blue-500 px-4 py-2.5 text-center text-sm font-light text-white transition duration-300 ease-in-out hover:bg-blue-600 md:w-32"
                >
                  แก้ไข
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="drawer-button w-full cursor-pointer rounded-md bg-gray-500 px-4 py-2.5 text-center text-sm font-light text-white transition duration-300 ease-in-out hover:bg-gray-600 md:w-32"
                  >
                    ยกเลิก
                  </button>
                  <button
                    type="submit"
                    className="drawer-button w-full cursor-pointer rounded-md bg-success px-4 py-2.5 text-center text-sm font-light text-white transition duration-300 ease-in-out hover:bg-success/80 md:w-32"
                  >
                    บันทึก
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </form>
  )
}
