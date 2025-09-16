'use client'
import type React from 'react'
import { useState, useRef, useEffect } from 'react'
import { Upload, X } from 'lucide-react'
import { useDropzone } from 'react-dropzone'
import Image from 'next/image'
import SelectUserLevel from './Create-personalComponents/SelectUserLevel'
import SelectBranch from './Create-personalComponents/SelectBranch'
import SelectPosition from './Create-personalComponents/SelectPosition'
import SelectPersonalType from './Create-personalComponents/SelectPersonalType'
import SelectCourse from './Create-personalComponents/SelectCourse'
import SelectExPosition from './Create-personalComponents/SelectExPosition'
import SelectPrefix from './Create-personalComponents/SelectPrefix'
import type { User } from '@/Types'
import axios from 'axios'
import Swal from 'sweetalert2'
import { useRouter } from 'next/navigation'
import useUtility from '@/hooks/useUtility'

const FormDataPersonal: User = {
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

export default function CreatePersonal() {
  const { setBreadcrumbs } = useUtility()
  const [formData, setFormData] = useState<User>(FormDataPersonal)
  const router = useRouter()
  const [selectPrefix, setSelectPrefix] = useState<string | null>(null)
  const [selectPosition, setSelectPosition] = useState<string | null>(null)
  const [selectExPosition, setSelectExPosition] = useState<string | null>(null)
  const [selectPersonalType, setSelectPersonalType] = useState<string | null>(
    null
  )
  const [selectBranch, setSelectedBranch] = useState<string | null>(null)
  const [selectCourse, setSelectedCourse] = useState<string | null>(null)
  const [selectLevel, setSelectedLevel] = useState<string | null>(null)
  const [selectedBranchId, setSelectedBranchId] = useState<number | null>(null)

  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  const prefixDropdownRef = useRef<HTMLDivElement>(null)
  const positionDropdownRef = useRef<HTMLDivElement>(null)
  const exPositionDropdownRef = useRef<HTMLDivElement>(null)
  const branchDropdownRef = useRef<HTMLDivElement>(null)
  const courseDropdownRef = useRef<HTMLDivElement>(null)
  const userLevelDropdownRef = useRef<HTMLDivElement>(null)
  const personalTypeDropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setBreadcrumbs([
      { text: "รายชื่อบุคลากร", path: "/admin/personal-list" },
      { text: "เพิ่มบุคลากร", path: "/admin/personal-list/create-personal" },
    ])
    const handleClickOutside = (event: MouseEvent) => {
      if (
        prefixDropdownRef.current &&
        !prefixDropdownRef.current.contains(event.target as Node) &&
        positionDropdownRef.current &&
        !positionDropdownRef.current.contains(event.target as Node) &&
        exPositionDropdownRef.current &&
        !exPositionDropdownRef.current.contains(event.target as Node) &&
        branchDropdownRef.current &&
        !branchDropdownRef.current.contains(event.target as Node) &&
        courseDropdownRef.current &&
        !courseDropdownRef.current.contains(event.target as Node) &&
        userLevelDropdownRef.current &&
        !userLevelDropdownRef.current.contains(event.target as Node) &&
        personalTypeDropdownRef.current &&
        !personalTypeDropdownRef.current.contains(event.target as Node)
      ) {
        setOpenDropdown(null)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles) => {
      const file = acceptedFiles[0]
      const imageUrl = URL.createObjectURL(file)
      setPreviewUrl(imageUrl)
      setFormData((prevData) => ({
        ...prevData,
        u_img: file,
      }))
    },
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif'],
    },
  })

  const handleRemoveImage = () => {
    setPreviewUrl(null)
    setFormData((prevData) => ({
      ...prevData,
      u_img: '',
    }))
  }

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, files } = e.target as HTMLInputElement
    if (name === 'u_img' && files && files.length > 0) {
      const file = files[0]
      const imageUrl = URL.createObjectURL(file)
      setPreviewUrl(imageUrl)
      setFormData((prevData) => ({
        ...prevData,
        [name]: file,
      }))
    } else {
      setFormData((prevData) => ({
        ...prevData,
        [name]: value,
      }))
    }
  }

  const handleOnChangePrefix = (prefix_id: number) => {
    setFormData((prevData) => ({
      ...prevData,
      prefix_id: Number(prefix_id),
    }))
  }

  const handleOnChangePosition = (position_id: number) => {
    setFormData((prevData) => ({
      ...prevData,
      position_id: Number(position_id),
    }))
  }
  const handleOnChangeExPosition = (ex_position_id: number) => {
    setFormData((prevData) => ({
      ...prevData,
      ex_position_id: Number(ex_position_id),
    }))
  }

  const handleOnChangePersonalType = (type_p_id: number) => {
    setFormData((prevData) => ({
      ...prevData,
      type_p_id: Number(type_p_id),
    }))
  }

  const handleOnChangeBranch = (branch_id: number, branch_name: string) => {
    setSelectedBranch(branch_name)
    setSelectedBranchId(branch_id)
    setFormData((prevData) => ({
      ...prevData,
      branch_id: Number(branch_id),
    }))
    // Reset course when branch changes
    setSelectedCourse(null)
    setFormData((prevData) => ({
      ...prevData,
      course_id: 0,
    }))
  }

  const handleOnChangeCourse = (course_id: number, course_name: string) => {
    setSelectedCourse(course_name)
    setFormData((prevData) => ({
      ...prevData,
      course_id: Number(course_id),
    }))
  }

  const handleOnChangeUserLevel = (level_id: number) => {
    setFormData((prevData) => ({
      ...prevData,
      level_id: Number(level_id),
    }))
  }
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const formDataToSend = new FormData()
      Object.entries(formData).forEach(([key, value]) => {
        if (key === 'u_img' && value instanceof File) {
          formDataToSend.append('u_img', value)
        } else {
          formDataToSend.append(key, String(value))
        }
      })

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API}/user/add`,
        formDataToSend,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      )
      console.log(response.data)
      Swal.fire({
        position: 'center',
        icon: 'success',
        title: 'สำเร็จ!',
        text: 'เพิ่มบุคลากรสำเร็จ!',
        showConfirmButton: false,
        timer: 1500,
      })
      router.push('/admin/personal-list')
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        console.log(error.response?.data || error)
        Swal.fire({
          position: 'center',
          icon: 'error',
          title: 'เกิดข้อผิดพลาด!',
          text:
            error.response?.data?.message || 'เกิดข้อผิดพลาดในการเพิ่มบุคลากร',
          showConfirmButton: false,
          timer: 1500,
        })
      }
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="w-full space-y-4">
        <div className="h-auto w-full rounded-md bg-white p-0 text-base-content shadow transition-all duration-300 ease-in-out dark:bg-zinc-900">
          <div className="flex flex-col p-4 lg:flex-row">
            <div className="h-full w-full">
              <div className="space-y-2">
                <div className="flex flex-col gap-0 md:flex-row md:gap-4">
                  <div className="flex flex-row items-center justify-center">
                    <div
                      {...getRootProps()}
                      className="h-48 w-48 cursor-pointer overflow-hidden rounded-md border-2 border-dashed border-gray-400 bg-gray-100 transition-all transition-colors duration-200 duration-300 ease-in-out hover:border-gray-500 dark:border-gray-600 dark:bg-zinc-700 dark:hover:border-gray-500"
                    >
                      <input
                        {...getInputProps()}
                        onChange={handleInputChange}
                        type="file"
                        name="u_img" // Ensure this is exactly "u_img"
                        accept="image/*" // Optional: add this to specify that only images should be uploaded
                      />

                      {previewUrl ? (
                        <div className="relative h-full w-full">
                          <Image
                            src={previewUrl || '/placeholder.svg'}
                            alt="Profile Preview"
                            layout="fill"
                            objectFit="cover"
                          />
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleRemoveImage()
                            }}
                            className="absolute right-2 top-2 rounded-full bg-red-600 p-1 text-white transition duration-300 hover:bg-red-700"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-gray-400">
                          {isDragActive ? (
                            <p className="text-center text-sm">
                              วางไฟล์ที่นี่ ...
                            </p>
                          ) : (
                            <div className="text-center">
                              <Upload className="mx-auto mb-0 h-10 w-10 md:mb-2 md:h-12 md:w-12" />
                              <p className="p-4 text-xs font-light md:text-sm">
                                ลากและวางรูปโปรไฟล์ หรือคลิกเพื่อเลือกไฟล์
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="mt-2 flex w-full flex-col justify-end gap-4 md:mt-0">
                    <div className="flex flex-col gap-4 md:flex-row">
                      <div className="flex-1">
                        <SelectPrefix
                          prefix_id={0}
                          prefix_name={''}
                          openDropdown={openDropdown}
                          setOpenDropdown={setOpenDropdown}
                          prefixDropdownRef={prefixDropdownRef}
                          selectPrefix={selectPrefix}
                          setSelectPrefix={setSelectPrefix}
                          handleOnChangePrefix={handleOnChangePrefix}
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
                                onChange={handleInputChange}
                                type="radio"
                                name="gender"
                                value="ชาย"
                                checked={formData.gender === 'ชาย'}
                                className="h-4 w-4 cursor-pointer border-gray-300 bg-gray-100 text-blue-600 focus:ring-blue-500"
                              />
                              <span className="font-light text-gray-600 dark:text-gray-400">
                                ชาย
                              </span>
                            </label>
                            <label className="flex cursor-pointer items-center space-x-2">
                              <input
                                onChange={handleInputChange}
                                type="radio"
                                name="gender"
                                value="หญิง"
                                checked={formData.gender === 'หญิง'}
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
                          value={formData.u_fname}
                          onChange={handleInputChange}
                          type="text"
                          className="w-full rounded-md border-2 border-gray-300 px-4 py-2 text-sm font-light text-gray-600 transition-all transition-colors duration-300 ease-in-out focus:border-blue-500 focus:outline-none dark:border-zinc-600 dark:bg-zinc-800 dark:text-gray-400"
                          placeholder="กรอกชื่อ"
                        />
                      </div>
                      <div className="flex-1">
                        <label className="font-regular mb-2 block text-sm text-gray-600 dark:text-gray-400">
                          นามสกุล
                        </label>
                        <input
                          name="u_lname"
                          value={formData.u_lname}
                          onChange={handleInputChange}
                          type="text"
                          className="w-full rounded-md border-2 border-gray-300 px-4 py-2 text-sm font-light text-gray-600 transition-all transition-colors duration-300 ease-in-out focus:border-blue-500 focus:outline-none dark:border-zinc-600 dark:bg-zinc-800 dark:text-gray-400"
                          placeholder="กรอกนามสกุล"
                        />
                      </div>
                      <div className="flex-1">
                        <label className="font-regular mb-2 block text-sm text-gray-600 dark:text-gray-400">
                          อายุ (ปี)
                        </label>
                        <input
                          name="age"
                          value={formData.age}
                          onChange={handleInputChange}
                          type="number"
                          className="w-full rounded-md border-2 border-gray-300 px-4 py-2 text-sm font-light text-gray-600 transition-all transition-colors duration-300 ease-in-out focus:border-blue-500 focus:outline-none dark:border-zinc-600 dark:bg-zinc-800 dark:text-gray-400"
                          placeholder="กรอกอายุ"
                          min="0"
                          step="0.01"
                        />
                      </div>
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
                      value={formData.u_id_card}
                      onChange={handleInputChange}
                      type="text"
                      className="w-full rounded-md border-2 border-gray-300 px-4 py-2 text-sm font-light text-gray-600 transition-all transition-colors duration-300 ease-in-out focus:border-blue-500 focus:outline-none dark:border-zinc-600 dark:bg-zinc-800 dark:text-gray-400"
                      placeholder="6564XXXXXXX-X"
                    />
                  </div>
                  <div className="flex-1">
                    <SelectPosition
                      position_id={0}
                      position_name={''}
                      openDropdown={openDropdown}
                      setOpenDropdown={setOpenDropdown}
                      positionDropdownRef={positionDropdownRef}
                      selectPosition={selectPosition}
                      setSelectPosition={setSelectPosition}
                      handleOnChangePosition={handleOnChangePosition}
                    />
                  </div>
                  <div className="flex-1">
                    <SelectExPosition
                      ex_position_id={0}
                      ex_position_name={''}
                      openDropdown={openDropdown}
                      setOpenDropdown={setOpenDropdown}
                      exPositionDropdownRef={exPositionDropdownRef}
                      selectExPosition={selectExPosition}
                      setSelectExPosition={setSelectExPosition}
                      handleOnChangeExPosition={handleOnChangeExPosition}
                    />
                  </div>
                  <div className="flex-1">
                    <SelectPersonalType
                      type_p_id={0}
                      type_p_name={''}
                      openDropdown={openDropdown}
                      setOpenDropdown={setOpenDropdown}
                      personalTypeDropdownRef={personalTypeDropdownRef}
                      selectPersonalType={selectPersonalType}
                      setSelectPersonalType={setSelectPersonalType}
                      handleOnChangePersonalType={handleOnChangePersonalType}
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-4 md:flex-row">
                  <div className="flex-1">
                    <label className="font-regular mb-2 block text-sm text-gray-600 dark:text-gray-400">
                      วันรับราขการ
                    </label>
                    <input
                      name="work_start"
                      value={formData.work_start}
                      onChange={handleInputChange}
                      type="date"
                      className="w-full rounded-md border-2 border-gray-300 px-4 py-[7px] text-sm font-light text-gray-600 transition-all transition-colors duration-300 ease-in-out focus:border-blue-500 focus:outline-none dark:border-zinc-600 dark:bg-zinc-800 dark:text-gray-400"
                      placeholder="กรอกวันรับราขการ"
                    />
                  </div>
                  <div className="flex-1">
                    <SelectBranch
                      openDropdown={openDropdown}
                      setOpenDropdown={setOpenDropdown}
                      branchDropdownRef={branchDropdownRef}
                      handleOnChangeBranch={handleOnChangeBranch}
                      selectBranch={selectBranch}
                      setSelectedBranch={setSelectedBranch}
                    />
                  </div>
                  <div className="flex-1">
                    <SelectCourse
                      openDropdown={openDropdown}
                      setOpenDropdown={setOpenDropdown}
                      courseDropdownRef={courseDropdownRef}
                      handleOnChangeCourse={handleOnChangeCourse}
                      selectCourse={selectCourse}
                      setSelectedCourse={setSelectedCourse}
                      branch_id={selectedBranchId}
                    />
                  </div>

                  {/* ระดับผู้ใช้งาน */}
                  <div className="flex-1">
                    <SelectUserLevel
                      userLevelDropdownRef={userLevelDropdownRef}
                      setOpenDropdown={setOpenDropdown}
                      openDropdown={openDropdown}
                      level_id={0}
                      level_name={''}
                      setSelectedLevel={setSelectedLevel}
                      selectLevel={selectLevel}
                      handleOnChangeUserLevel={handleOnChangeUserLevel}
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-4 md:flex-row">
                  <div className="flex-1">
                    <label className="font-regular mb-2 block text-sm text-gray-600 dark:text-gray-400">
                      เงินเดือน
                    </label>
                    <input
                      name="salary"
                      value={formData.salary}
                      onChange={handleInputChange}
                      type="number"
                      className="w-full rounded-md border-2 border-gray-300 px-4 py-2 text-sm font-light text-gray-600 transition-all transition-colors duration-300 ease-in-out focus:border-blue-500 focus:outline-none dark:border-zinc-600 dark:bg-zinc-800 dark:text-gray-400"
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
                      value={formData.u_tel}
                      onChange={handleInputChange}
                      type="number"
                      className="w-full rounded-md border-2 border-gray-300 px-4 py-2 text-sm font-light text-gray-600 transition-all transition-colors duration-300 ease-in-out focus:border-blue-500 focus:outline-none dark:border-zinc-600 dark:bg-zinc-800 dark:text-gray-400"
                      placeholder="กรอกเบอร์โทรศัพท์"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="font-regular mb-2 block text-sm text-gray-600 dark:text-gray-400">
                      RMUTL อีเมล
                    </label>
                    <input
                      name="u_email"
                      value={formData.u_email}
                      onChange={handleInputChange}
                      type="text"
                      className="w-full rounded-md border-2 border-gray-300 px-4 py-2 text-sm font-light text-gray-600 transition-all transition-colors duration-300 ease-in-out focus:border-blue-500 focus:outline-none dark:border-zinc-600 dark:bg-zinc-800 dark:text-gray-400"
                      placeholder="example.live.rmutl.ac.th"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="font-regular mb-2 block text-sm text-gray-600 dark:text-gray-400">
                      รหัสผ่าน
                    </label>
                    <input
                      name="u_pass"
                      value={formData.u_pass}
                      onChange={handleInputChange}
                      type="password"
                      className="w-full rounded-md border-2 border-gray-300 px-4 py-2 text-sm font-light text-gray-600 transition-all transition-colors duration-300 ease-in-out focus:border-blue-500 focus:outline-none dark:border-zinc-600 dark:bg-zinc-800 dark:text-gray-400"
                      placeholder="กรอกรหัสผ่าน"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="w-full rounded-b-md bg-white transition-all duration-300 ease-in-out dark:bg-zinc-900">
            <div className="flex justify-end px-4 pb-4 pt-2">
              <button
                type="submit"
                className="drawer-button w-full cursor-pointer rounded-md bg-success px-4 py-2.5 text-center text-sm font-light text-white transition duration-300 ease-in-out hover:bg-success/80 md:w-52"
              >
                เพิ่มบุคลากร
              </button>
            </div>
          </div>
        </div>
      </div>
    </form>
  )
}
