'use client'
import type React from 'react'
import { useState, useEffect } from 'react'
import { Upload, X } from 'lucide-react'
import Image from 'next/image'
import SelectDropdown from '@/components/SelectDropdown'
import type { Personal, User } from '@/Types'
import Swal from 'sweetalert2'
import { useRouter, useParams } from 'next/navigation'
import useUtility from '@/hooks/useUtility'
import UserServices from '@/services/userServices'
import PrefixServices from '@/services/prefixServices'
import PositionServices from '@/services/positionServices'
import ExPositionServices from '@/services/exPositionServices'
import PersonaltypeServices from '@/services/personaltypeServices'
import BranchServices from '@/services/branchServices'
import CourseServices from '@/services/courseServices'
import UserLevelServices from '@/services/userLevelServices'
import { useSession } from 'next-auth/react'

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
  const params = useParams()
  const userId = params.id as string
  const [data, setData] = useState<Personal | null>(null)
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
  const [formData, setFormData] = useState<Personal | null>(null)
  
  // Data for dropdowns
  const [prefixes, setPrefixes] = useState<any[]>([])
  const [positions, setPositions] = useState<any[]>([])
  const [exPositions, setExPositions] = useState<any[]>([])
  const [personalTypes, setPersonalTypes] = useState<any[]>([])
  const [branches, setBranches] = useState<any[]>([])
  const [courses, setCourses] = useState<any[]>([])
  const [userLevels, setUserLevels] = useState<any[]>([])


  const getUserById = async () => {
    if (!session?.accessToken) {
      router.push('/login')
      return
    }
    try {
      const response = await UserServices.getUserById(
        Number(userId),
        session.accessToken
      )
      if (response.payload) {
        const data = Array.isArray(response.payload)
          ? response.payload[0]
          : response.payload
        setData(data)
        setFormData(data)
        // Set preview URL for existing image
        if (data.u_img) {
          setPreviewUrl(`/images/${data.u_img}`)
        }
      } else {
        console.log('No data in payload')
      }
    } catch (error) {
      console.error('Error fetching user:', error)
    }
  }

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

      // Load all courses
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


  useEffect(() => {
    setBreadcrumbs([
      { text: 'รายชื่อบุคลากร', path: '/admin/personal-list' },
      {
        text: 'แก้ไขบุคลากร',
        path: `/admin/personal-list/${userId}/edit-personal`,
      },
    ])
  }, [userId])

  useEffect(() => {
    if (session?.accessToken) {
      getUserById()
      loadDropdownData()
    }
  }, [session?.accessToken, userId])

  useEffect(() => {
    if (data) {
      setSelectPrefix(data.prefix_name || null)
      setSelectPosition(data.position_name || null)
      setSelectExPosition(data.ex_position_name || null)
      setSelectPersonalType(data.type_p_name || null)
      setSelectedBranch(data.branch_name || null)
      setSelectedCourse(data.course_name || null)
      setSelectedLevel(data.level_name || null)
      
      // Map name to id for formData
      const prefix = prefixes.find(p => p.prefix_name === data.prefix_name)
      const position = positions.find(p => p.position_name === data.position_name)
      const exPosition = exPositions.find(p => p.ex_position_name === data.ex_position_name)
      const personalType = personalTypes.find(p => p.type_p_name === data.type_p_name)
      const branch = branches.find(b => b.branch_name === data.branch_name)
      const course = courses.find(c => c.course_name === data.course_name)
      const userLevel = userLevels.find(l => l.level_name === data.level_name)
      
      
      // Update formData with mapped IDs
      setFormData(prev => prev ? {
        ...prev,
        prefix_id: prefix?.prefix_id || prev.prefix_id,
        position_id: position?.position_id || prev.position_id,
        ex_position_id: exPosition?.ex_position_id || prev.ex_position_id,
        type_p_id: personalType?.type_p_id || prev.type_p_id,
        branch_id: branch?.branch_id || prev.branch_id,
        course_id: course?.course_id || prev.course_id,
        level_id: userLevel?.level_id || prev.level_id
      } : null)
      
      // Set branch_id from data
      if (branch?.branch_id) {
        setSelectedBranchId(branch.branch_id)
      }
    }
  }, [data, prefixes, positions, exPositions, personalTypes, branches, courses, userLevels])


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    const input = e.target as HTMLInputElement
    
    if (type === 'file') {
      const file = input.files?.[0]
      if (file) {
        const url = URL.createObjectURL(file)
        setPreviewUrl(url)
        setFormData(prev => prev ? { ...prev, u_img: file } : null)
      }
    } else {
      setFormData(prev => prev ? { ...prev, [name]: value } : null)
    }
  }

  const handleOnChangePrefix = (prefix_id: number) => {
    setFormData(prev => prev ? { ...prev, prefix_id: Number(prefix_id) } : null)
  }

  const handleOnChangePosition = (position_id: number) => {
    setFormData(prev => prev ? { ...prev, position_id: Number(position_id) } : null)
  }

  const handleOnChangeExPosition = (ex_position_id: number) => {
    setFormData(prev => prev ? { ...prev, ex_position_id: Number(ex_position_id) } : null)
  }

  const handleOnChangePersonalType = (type_p_id: number) => {
    setFormData(prev => prev ? { ...prev, type_p_id: Number(type_p_id) } : null)
  }

  const handleOnChangeBranch = (branch_id: number, branch_name: string) => {
    setSelectedBranch(branch_name)
    setSelectedBranchId(branch_id)
    setFormData(prev => prev ? { ...prev, branch_id: Number(branch_id) } : null)
    // Reset course when branch changes
    setSelectedCourse(null)
    setFormData(prev => prev ? { ...prev, course_id: 0 } : null)
  }

  const handleOnChangeCourse = (course_id: number, course_name: string) => {
    setSelectedCourse(course_name)
    setFormData(prev => prev ? { ...prev, course_id: Number(course_id) } : null)
  }

  const handleOnChangeUserLevel = (level_id: number) => {
    setFormData(prev => prev ? { ...prev, level_id: Number(level_id) } : null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData || !session?.accessToken) return

    try {
      const formDataToSend = new FormData()
      
      // Add all fields except password
      formDataToSend.append('u_fname', formData.u_fname || '')
      formDataToSend.append('u_lname', formData.u_lname || '')
      formDataToSend.append('u_email', formData.u_email || '')
      formDataToSend.append('u_tel', formData.u_tel?.toString() || '')
      formDataToSend.append('u_id_card', formData.u_id_card || '')
      formDataToSend.append('age', formData.age?.toString() || '')
      formDataToSend.append('salary', formData.salary?.toString() || '')
      formDataToSend.append('gender', formData.gender || '')
      
      
      // Handle ID fields - use formData values if they exist and are not 0/undefined, otherwise use original data
      // Note: data object doesn't contain IDs, only names, so we need to map them
      const levelId = (formData.level_id !== undefined && formData.level_id !== 0) ? formData.level_id : (() => {
        const userLevel = userLevels.find(l => l.level_name === data?.level_name)
        return userLevel?.level_id
      })()
      
      const prefixId = (formData.prefix_id !== undefined && formData.prefix_id !== 0) ? formData.prefix_id : (() => {
        const prefix = prefixes.find(p => p.prefix_name === data?.prefix_name)
        return prefix?.prefix_id
      })()
      
      const positionId = (formData.position_id !== undefined && formData.position_id !== 0) ? formData.position_id : (() => {
        const position = positions.find(p => p.position_name === data?.position_name)
        return position?.position_id
      })()
      
      const courseId = (formData.course_id !== undefined && formData.course_id !== 0) ? formData.course_id : (() => {
        const course = courses.find(c => c.course_name === data?.course_name)
        return course?.course_id
      })()
      
      const typePId = (formData.type_p_id !== undefined && formData.type_p_id !== 0) ? formData.type_p_id : (() => {
        const personalType = personalTypes.find(p => p.type_p_name === data?.type_p_name)
        return personalType?.type_p_id
      })()
      
      const exPositionId = (formData.ex_position_id !== undefined && formData.ex_position_id !== 0) ? formData.ex_position_id : (() => {
        const exPosition = exPositions.find(p => p.ex_position_name === data?.ex_position_name)
        return exPosition?.ex_position_id
      })()
      
      const branchId = (formData.branch_id !== undefined && formData.branch_id !== 0) ? formData.branch_id : (() => {
        const branch = branches.find(b => b.branch_name === data?.branch_name)
        return branch?.branch_id
      })()
      
      
      // Only append ID fields if they have valid values (not 0, null, or undefined)
      if (levelId !== undefined && levelId !== null && levelId !== 0) formDataToSend.append('level_id', levelId.toString())
      if (prefixId !== undefined && prefixId !== null && prefixId !== 0) formDataToSend.append('prefix_id', prefixId.toString())
      if (positionId !== undefined && positionId !== null && positionId !== 0) formDataToSend.append('position_id', positionId.toString())
      if (courseId !== undefined && courseId !== null && courseId !== 0) formDataToSend.append('course_id', courseId.toString())
      if (typePId !== undefined && typePId !== null && typePId !== 0) formDataToSend.append('type_p_id', typePId.toString())
      if (exPositionId !== undefined && exPositionId !== null && exPositionId !== 0) formDataToSend.append('ex_position_id', exPositionId.toString())
      if (branchId !== undefined && branchId !== null && branchId !== 0) formDataToSend.append('branch_id', branchId.toString())
      formDataToSend.append('work_start', formData.work_start || '')
      
      
      // Add image - send new file if changed, or existing image name if not changed
      if (formData.u_img) {
        if (typeof formData.u_img === 'string') {
          // Existing image - send the filename
          formDataToSend.append('u_img', formData.u_img)
        } else {
          // New file - send the file
          formDataToSend.append('u_img', formData.u_img as File)
        }
      }

      const response = await UserServices.updateUser(
        Number(userId),
        formDataToSend,
        session.accessToken
      )

      console.log('Update response:', response)

      if (response.success) {
        Swal.fire({
          title: 'สำเร็จ!',
          text: 'อัปเดตข้อมูลบุคลากรเรียบร้อยแล้ว',
          icon: 'success',
          confirmButtonText: 'ตกลง'
        }).then(() => {
          router.push('/admin/personal-list')
        })
      } else {
        console.log('Update failed:', response)
        Swal.fire({
          title: 'เกิดข้อผิดพลาด!',
          text: response.message || 'ไม่สามารถอัปเดตข้อมูลได้',
          icon: 'error',
          confirmButtonText: 'ตกลง'
        })
      }
    } catch (error) {
      console.error('Error updating user:', error)
      Swal.fire({
        title: 'เกิดข้อผิดพลาด!',
        text: 'ไม่สามารถอัปเดตข้อมูลได้',
        icon: 'error',
        confirmButtonText: 'ตกลง'
      })
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
                    <div className="relative h-48 w-48 overflow-hidden rounded-md border border-dashed border-gray-400 bg-gray-100 transition-all duration-300 ease-in-out hover:border-gray-500 dark:border-gray-600 dark:bg-zinc-700 dark:hover:border-gray-500">
                      <input
                        type="file"
                        name="u_img"
                        accept="image/*"
                        onChange={handleInputChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      />

                      {previewUrl ? (
                        <div className="relative h-full w-full">
                          <Image
                            src={previewUrl}
                            alt="Profile Preview"
                            fill
                            className="object-cover"
                          />
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              setPreviewUrl(null)
                              setFormData(prev => prev ? { ...prev, u_img: '' } : null)
                            }}
                            className="absolute right-2 top-2 z-20 rounded-full bg-red-600 p-1 text-white transition duration-300 hover:bg-red-700"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-gray-400 pointer-events-none">
                          <div className="text-center">
                            <Upload className="mx-auto mb-0 h-10 w-10 md:mb-2 md:h-12 md:w-12" />
                            <p className="p-4 text-xs font-light md:text-sm">
                              ลากและวางรูปโปรไฟล์ หรือคลิกเพื่อเลือกไฟล์
                            </p>
                          </div>
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
                              setFormData(prev => prev ? { ...prev, prefix_id: 0 } : null)
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
                                checked={formData?.gender === 'ชาย'}
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
                                checked={formData?.gender === 'หญิง'}
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
                          value={formData?.u_fname || ''}
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
                          value={formData?.u_lname || ''}
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
                          value={formData?.age || ''}
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
                      value={formData?.u_id_card || ''}
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
                          setFormData(prev => prev ? { ...prev, position_id: 0 } : null)
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
                          setFormData(prev => prev ? { ...prev, ex_position_id: 0 } : null)
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
                          setFormData(prev => prev ? { ...prev, type_p_id: 0 } : null)
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
                      value={
                        formData?.work_start
                          ? new Date(formData.work_start)
                              .toISOString()
                              .split('T')[0]
                          : ''
                      }
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
                      handleSelect={(value) => {
                        if (value) {
                          const branch = branches.find(b => b.branch_id.toString() === value)
                          if (branch) {
                            handleOnChangeBranch(branch.branch_id, branch.branch_name)
                          }
                        } else {
                          setSelectedBranch(null)
                          setSelectedBranchId(null)
                          setFormData(prev => prev ? { ...prev, branch_id: 0 } : null)
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
                          setFormData(prev => prev ? { ...prev, course_id: 0 } : null)
                        }
                      }}
                      objects={courses}
                      valueKey="course_id"
                      labelKey="course_name"
                      placeholder="เลือกหลักสูตร"
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
                          setFormData(prev => prev ? { ...prev, level_id: 0 } : null)
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
                      value={formData?.salary || ''}
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
                      value={formData?.u_tel || ''}
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
                      value={formData?.u_email || ''}
                      onChange={handleInputChange}
                      type="text"
                      className="w-full rounded-md border border-gray-300 px-4 py-2 text-sm font-light text-gray-600 transition-all duration-300 ease-in-out focus:border-blue-500 focus:outline-none dark:border-zinc-600 dark:bg-zinc-800 dark:text-gray-400"
                      placeholder="example.live.rmutl.ac.th"
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
                อัปเดตข้อมูลบุคลากร
              </button>
            </div>
          </div>
        </div>
      </div>
    </form>
  )
}
