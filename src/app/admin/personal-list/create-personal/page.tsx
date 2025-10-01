'use client'
import type React from 'react'
import { useState, useEffect } from 'react'
import { Upload, X } from 'lucide-react'
import Image from 'next/image'
import SelectDropdown from '@/components/SelectDropdown'
import type { User } from '@/Types'
import Swal from 'sweetalert2'
import { useRouter } from 'next/navigation'
import useUtility from '@/hooks/useUtility'
import { useSession } from 'next-auth/react'
import PrefixServices from '@/services/prefixServices'
import PositionServices from '@/services/positionServices'
import ExPositionServices from '@/services/exPositionServices'
import PersonaltypeServices from '@/services/personaltypeServices'
import BranchServices from '@/services/branchServices'
import CourseServices from '@/services/courseServices'
import UserLevelServices from '@/services/userLevelServices'
import axios from 'axios'
import { useDropzone } from 'react-dropzone'

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
  const { data: session } = useSession()
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

  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  
  // Data for dropdowns
  const [prefixes, setPrefixes] = useState<any[]>([])
  const [positions, setPositions] = useState<any[]>([])
  const [exPositions, setExPositions] = useState<any[]>([])
  const [personalTypes, setPersonalTypes] = useState<any[]>([])
  const [branches, setBranches] = useState<any[]>([])
  const [courses, setCourses] = useState<any[]>([])
  const [userLevels, setUserLevels] = useState<any[]>([])
  const [loadingCourses, setLoadingCourses] = useState<boolean>(false)

  const loadDropdownData = async () => {
    if (!session?.accessToken) return

    try {
      // Load prefixes
      const prefixResponse = await PrefixServices.getAllPrefixes(session.accessToken, {
        search: '',
        page: 1,
        limit: 100,
        sort: 'prefix_name',
        order: 'asc'
      })
      if (prefixResponse.success) {
        setPrefixes(Array.isArray(prefixResponse.payload) ? prefixResponse.payload : [])
      }

      // Load positions
      const positionResponse = await PositionServices.getAllPositions(session.accessToken, {
        search: '',
        page: 1,
        limit: 100,
        sort: 'position_name',
        order: 'asc'
      })
      if (positionResponse.success) {
        setPositions(Array.isArray(positionResponse.payload) ? positionResponse.payload : [])
      }

      // Load ex positions
      const exPositionResponse = await ExPositionServices.getAllExpositions(session.accessToken, {
        search: '',
        page: 1,
        limit: 100,
        sort: 'ex_position_name',
        order: 'asc'
      })
      if (exPositionResponse.success) {
        setExPositions(Array.isArray(exPositionResponse.payload) ? exPositionResponse.payload : [])
      }

      // Load personal types
      const personalTypeResponse = await PersonaltypeServices.getAllPersonalTypes(session.accessToken, {
        search: '',
        page: 1,
        limit: 100,
        sort: 'type_p_name',
        order: 'asc'
      })
      if (personalTypeResponse.success) {
        setPersonalTypes(Array.isArray(personalTypeResponse.payload) ? personalTypeResponse.payload : [])
      }

      // Load branches
      const branchResponse = await BranchServices.getAllBranches(session.accessToken, {
        search: '',
        page: 1,
        limit: 100,
        sort: 'branch_name',
        order: 'asc'
      })
      if (branchResponse.success) {
        setBranches(Array.isArray(branchResponse.payload) ? branchResponse.payload : [])
      }

      // Load all courses initially
      const courseResponse = await CourseServices.getAllCoursesSimple(session.accessToken)
      if (courseResponse.success && courseResponse.payload) {
        setCourses(Array.isArray(courseResponse.payload) ? courseResponse.payload : [])
      } else {
        setCourses([])
      }

      // Load user levels
      const userLevelResponse = await UserLevelServices.getAllUserLevels(session.accessToken)
      if (userLevelResponse.success && userLevelResponse.payload) {
        setUserLevels(Array.isArray(userLevelResponse.payload) ? userLevelResponse.payload : [])
      } else {
        setUserLevels([])
      }
    } catch (error) {
      console.error('Error loading dropdown data:', error)
    }
  }

  const loadCoursesByBranch = async (branchId: number) => {
    setLoadingCourses(true)
    
    try {
      if (!session?.accessToken || !branchId) {
        // If no branch selected, load all courses
        const courseResponse = await CourseServices.getAllCoursesSimple(session?.accessToken || '')
        if (courseResponse.success && courseResponse.payload) {
          setCourses(Array.isArray(courseResponse.payload) ? courseResponse.payload : [])
        } else {
          setCourses([])
        }
        return
      }

      const courseResponse = await CourseServices.getCoursesByBranch(branchId, session.accessToken)
      if (courseResponse.success && courseResponse.payload) {
        setCourses(Array.isArray(courseResponse.payload) ? courseResponse.payload : [])
      } else {
        setCourses([])
      }
    } catch (error) {
      console.error('Error loading courses by branch:', error)
      setCourses([])
    } finally {
      setLoadingCourses(false)
    }
  }

  useEffect(() => {
    setBreadcrumbs([
      { text: "รายชื่อบุคลากร", path: "/admin/personal-list" },
      { text: "เพิ่มบุคลากร", path: "/admin/personal-list/create-personal" },
    ])
  }, [])

  useEffect(() => {
    if (session?.accessToken) {
      loadDropdownData()
    }
  }, [session?.accessToken])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles: File[]) => {
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

  const handleOnChangeBranch = async (branch_id: number, branch_name: string) => {
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
    
    // Load courses for the selected branch
    await loadCoursesByBranch(branch_id)
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
                      className="h-48 w-48 cursor-pointer overflow-hidden rounded-md border-2 border-dashed border-gray-400 bg-gray-100 transition-all duration-300 ease-in-out hover:border-gray-500 dark:border-gray-600 dark:bg-zinc-700 dark:hover:border-gray-500"
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
                        <label className="font-regular mb-2 block text-sm text-gray-600 dark:text-gray-400">
                          เลือกคำนำหน้า
                        </label>
                        <SelectDropdown
                          selectedLabel={selectPrefix || ''}
                          handleSelect={(value) => {
                            if (value) {
                              const prefix = prefixes.find(p => p.prefix_id.toString() === value)
                              if (prefix) {
                                handleOnChangePrefix(prefix.prefix_id)
                                setSelectPrefix(prefix.prefix_name)
                              }
                            } else {
                              setSelectPrefix(null)
                              setFormData(prev => ({ ...prev, prefix_id: 0 }))
                            }
                          }}
                          objects={prefixes}
                          valueKey="prefix_id"
                          labelKey="prefix_name"
                          placeholder="เลือกคำนำหน้า"
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
                          className="w-full rounded-md border border-gray-300 px-4 py-2 text-sm font-light text-gray-600 transition-all duration-300 ease-in-out focus:border-blue-500 focus:outline-none dark:border-zinc-600 dark:bg-zinc-800 dark:text-gray-400"
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
                          className="w-full rounded-md border border-gray-300 px-4 py-2 text-sm font-light text-gray-600 transition-all duration-300 ease-in-out focus:border-blue-500 focus:outline-none dark:border-zinc-600 dark:bg-zinc-800 dark:text-gray-400"
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
                          className="w-full rounded-md border border-gray-300 px-4 py-2 text-sm font-light text-gray-600 transition-all duration-300 ease-in-out focus:border-blue-500 focus:outline-none dark:border-zinc-600 dark:bg-zinc-800 dark:text-gray-400"
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
                      className="w-full rounded-md border border-gray-300 px-4 py-2 text-sm font-light text-gray-600 transition-all duration-300 ease-in-out focus:border-blue-500 focus:outline-none dark:border-zinc-600 dark:bg-zinc-800 dark:text-gray-400"
                      placeholder="6564XXXXXXX-X"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="font-regular mb-2 block text-sm text-gray-600 dark:text-gray-400">
                      ตำแหน่ง
                    </label>
                    <SelectDropdown
                      selectedLabel={selectPosition || ''}
                      handleSelect={(value) => {
                        if (value) {
                          const position = positions.find(p => p.position_id.toString() === value)
                          if (position) {
                            handleOnChangePosition(position.position_id)
                            setSelectPosition(position.position_name)
                          }
                        } else {
                          setSelectPosition(null)
                          setFormData(prev => ({ ...prev, position_id: 0 }))
                        }
                      }}
                      objects={positions}
                      valueKey="position_id"
                      labelKey="position_name"
                      placeholder="เลือกตำแหน่ง"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="font-regular mb-2 block text-sm text-gray-600 dark:text-gray-400">
                      ตำแหน่งพิเศษ
                    </label>
                    <SelectDropdown
                      selectedLabel={selectExPosition || ''}
                      handleSelect={(value) => {
                        if (value) {
                          const exPosition = exPositions.find(p => p.ex_position_id.toString() === value)
                          if (exPosition) {
                            handleOnChangeExPosition(exPosition.ex_position_id)
                            setSelectExPosition(exPosition.ex_position_name)
                          }
                        } else {
                          setSelectExPosition(null)
                          setFormData(prev => ({ ...prev, ex_position_id: 0 }))
                        }
                      }}
                      objects={exPositions}
                      valueKey="ex_position_id"
                      labelKey="ex_position_name"
                      placeholder="เลือกตำแหน่งพิเศษ"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="font-regular mb-2 block text-sm text-gray-600 dark:text-gray-400">
                      ประเภทบุคลากร
                    </label>
                    <SelectDropdown
                      selectedLabel={selectPersonalType || ''}
                      handleSelect={(value) => {
                        if (value) {
                          const personalType = personalTypes.find(p => p.type_p_id.toString() === value)
                          if (personalType) {
                            handleOnChangePersonalType(personalType.type_p_id)
                            setSelectPersonalType(personalType.type_p_name)
                          }
                        } else {
                          setSelectPersonalType(null)
                          setFormData(prev => ({ ...prev, type_p_id: 0 }))
                        }
                      }}
                      objects={personalTypes}
                      valueKey="type_p_id"
                      labelKey="type_p_name"
                      placeholder="เลือกประเภทบุคลากร"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-4 md:flex-row">
                  <div className="flex-1">
                    <label className="font-regular mb-2 block text-sm text-gray-600 dark:text-gray-400">
                      วันรับราชการ
                    </label>
                    <input
                      name="work_start"
                      value={formData.work_start}
                      onChange={handleInputChange}
                      type="date"
                      className="w-full rounded-md border border-gray-300 px-4 py-[7px] text-sm font-light text-gray-600 transition-all duration-300 ease-in-out focus:border-blue-500 focus:outline-none dark:border-zinc-600 dark:bg-zinc-800 dark:text-gray-400"
                      placeholder="กรอกวันรับราชการ"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="font-regular mb-2 block text-sm text-gray-600 dark:text-gray-400">
                      สาขา
                    </label>
                    <SelectDropdown
                      selectedLabel={selectBranch || ''}
                      handleSelect={async (value) => {
                        if (value) {
                          const branch = branches.find(b => b.branch_id.toString() === value)
                          if (branch) {
                            await handleOnChangeBranch(branch.branch_id, branch.branch_name)
                          }
                        } else {
                          setSelectedBranch(null)
                          setSelectedBranchId(null)
                          setFormData(prev => ({ ...prev, branch_id: 0 }))
                          // Load all courses when no branch is selected
                          await loadCoursesByBranch(0)
                        }
                      }}
                      objects={branches}
                      valueKey="branch_id"
                      labelKey="branch_name"
                      placeholder="เลือกสาขา"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="font-regular mb-2 block text-sm text-gray-600 dark:text-gray-400">
                      หลักสูตร
                    </label>
                    <SelectDropdown
                      selectedLabel={selectCourse || ''}
                      handleSelect={(value) => {
                        if (value) {
                          const course = courses.find(c => c.course_id.toString() === value)
                          if (course) {
                            handleOnChangeCourse(course.course_id, course.course_name)
                          }
                        } else {
                          setSelectedCourse(null)
                          setFormData(prev => ({ ...prev, course_id: 0 }))
                        }
                      }}
                      objects={courses}
                      valueKey="course_id"
                      labelKey="course_name"
                      placeholder={loadingCourses ? "กำลังโหลด..." : "เลือกหลักสูตร"}
                    />
                  </div>

                  {/* ระดับผู้ใช้งาน */}
                  <div className="flex-1">
                    <label className="font-regular mb-2 block text-sm text-gray-600 dark:text-gray-400">
                      ระดับผู้ใช้งาน
                    </label>
                    <SelectDropdown
                      selectedLabel={selectLevel || ''}
                      handleSelect={(value) => {
                        if (value) {
                          const userLevel = userLevels.find(l => l.level_id.toString() === value)
                          if (userLevel) {
                            handleOnChangeUserLevel(userLevel.level_id)
                            setSelectedLevel(userLevel.level_name)
                          }
                        } else {
                          setSelectedLevel(null)
                          setFormData(prev => ({ ...prev, level_id: 0 }))
                        }
                      }}
                      objects={userLevels}
                      valueKey="level_id"
                      labelKey="level_name"
                      placeholder="เลือกระดับผู้ใช้งาน"
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
                      className="w-full rounded-md border border-gray-300 px-4 py-2 text-sm font-light text-gray-600 transition-all duration-300 ease-in-out focus:border-blue-500 focus:outline-none dark:border-zinc-600 dark:bg-zinc-800 dark:text-gray-400"
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
                      className="w-full rounded-md border border-gray-300 px-4 py-2 text-sm font-light text-gray-600 transition-all duration-300 ease-in-out focus:border-blue-500 focus:outline-none dark:border-zinc-600 dark:bg-zinc-800 dark:text-gray-400"
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
                      className="w-full rounded-md border border-gray-300 px-4 py-2 text-sm font-light text-gray-600 transition-all duration-300 ease-in-out focus:border-blue-500 focus:outline-none dark:border-zinc-600 dark:bg-zinc-800 dark:text-gray-400"
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
                      className="w-full rounded-md border border-gray-300 px-4 py-2 text-sm font-light text-gray-600 transition-all duration-300 ease-in-out focus:border-blue-500 focus:outline-none dark:border-zinc-600 dark:bg-zinc-800 dark:text-gray-400"
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
