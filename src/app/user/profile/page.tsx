"use client"
import type React from "react"
import { useState, useRef, useEffect } from "react"
import SelectPrefix from "./ProfileComponents/SelectPrefix"
import { useDropzone } from "react-dropzone"
import Image from "next/image"
import { jwtDecode } from "jwt-decode"
import SelectPosition from "./ProfileComponents/SelectPosition"
import SelectExPosition from "./ProfileComponents/SelectExPosition"

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

export default function EditProfile() {
  const [user, setUser] = useState<UserLoginData | null>(null)
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const formRef = useRef<HTMLFormElement>(null)

  const prefixDropdownRef = useRef<HTMLDivElement>(null)
  const positionDropdownRef = useRef<HTMLDivElement>(null)
  const expositionDropdownRef = useRef<HTMLDivElement>(null)

  const [selectPrefix, setSelectPrefix] = useState<number | null>(null)
  const [selectPosition, setSelectPosition] = useState<number | null>(null)
  const [selectExPosition, setSelectExPosition] = useState<number | null>(null)

  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token")
      if (token) {
        const decoded: UserLoginData = jwtDecode(token)
        setUser(decoded)
        setSelectPrefix(decoded.prefix_id)
        setSelectPosition(decoded.position_id)
        setSelectExPosition(decoded.ex_position_id)        

      }
    }
  }, [])

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
      "image/*": [],
    },
    multiple: false,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Form submitted")
    if (formRef.current && user) {
      const formData = new FormData(formRef.current)

      // ใช้ข้อมูลจาก user state
      Object.entries(user).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          formData.set(key, value.toString())
        }
      })

      // จัดการกับ 
      if (selectPrefix) {
        formData.set("prefix_id", selectPrefix.toString())
      }
      if (selectPosition) {
        formData.set("position_id", selectPosition.toString())
      }
      if (selectExPosition) {
        formData.set("ex_position_id", selectExPosition.toString())
      }

      logFormData(formData)
    } else {
      console.log("Form reference is null or user data is not available")
    }
  }

  const logFormData = (formData: FormData) => {
    console.log("Saving user data:")
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
      if (previewImage && previewImage.startsWith("blob:")) {
        URL.revokeObjectURL(previewImage)
      }
    }
  }, [previewImage])

  if (!user) {
    return <div>Loading...</div>
  }

  return (
    <form onSubmit={handleSubmit} ref={formRef}>
      <div className="bg-white shadow dark:bg-zinc-900 text-base-content h-auto w-full p-0 rounded-md  transition-all duration-300 ease-in-out">
        <div className="flex flex-col lg:flex-row p-4">
          <div className="h-full w-full ">
            <div className="space-y-2">
              <div className="flex flex-col md:flex-row gap-0 md:gap-4">
                <div className="flex flex-row justify-center items-center">
                  <div
                    {...getRootProps()}
                    className="w-36 h-36 md:w-48 md:h-48 rounded-md overflow-hidden bg-gray-100 dark:bg-zinc-700 cursor-pointer border-2 border-dashed border-gray-400 dark:border-gray-600 hover:border-gray-500 dark:hover:border-gray-500 transition-colors duration-200 transition-all duration-300 ease-in-out relative"
                  >
                    <input {...getInputProps()} name="u_img" />
                    <div className="relative w-full h-full">
                      <Image
                        src={previewImage ? previewImage : user.u_img ? `/images/${user.u_img}` : "/images/default.png"}
                        alt="Profile Preview"
                        layout="fill"
                        objectFit="cover"
                        unoptimized={!!previewImage}
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300">
                        <span className="text-white text-sm">{isDragActive ? "วางรูปภาพที่นี่" : "เปลี่ยนรูปภาพ"}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-4 w-full justify-end">
                  <div className="flex flex-col md:flex-row gap-4 ">
                    <div className="flex-1">
                      <SelectPrefix
                        openDropdown={openDropdown}
                        setOpenDropdown={setOpenDropdown}
                        prefixDropdownRef={prefixDropdownRef}
                        setSelectPrefix={setSelectPrefix}
                        handleOnChangePrefix={(prefix_id: number) => setSelectPrefix(prefix_id)}
                        initialPrefixName={user.prefix_name}
                      />
                    </div>
                    <div className="flex-1">
                      <div className="space-y-2">
                        <label className="block text-sm font-regular text-gray-600 dark:text-gray-400 mb-2">เพศ</label>
                        <div className="flex items-center h-full gap-6">
                          <label className="flex items-center space-x-2 cursor-pointer">
                            <input
                              type="radio"
                              name="gender"
                              value="ชาย"
                              checked={user.gender === "ชาย"}
                              onChange={(e) => setUser({ ...user, gender: e.target.value })}
                              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 cursor-pointer"
                            />
                            <span className="text-gray-600 font-light dark:text-gray-400">ชาย</span>
                          </label>
                          <label className="flex items-center space-x-2 cursor-pointer">
                            <input
                              type="radio"
                              name="gender"
                              value="หญิง"
                              checked={user.gender === "หญิง"}
                              onChange={(e) => setUser({ ...user, gender: e.target.value })}
                              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 cursor-pointer"
                            />
                            <span className="text-gray-600 font-light dark:text-gray-400">หญิง</span>
                          </label>
                        </div>
                      </div>
                    </div>
                    <div className="flex-1"></div>
                  </div>
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                      <label className="block text-sm font-regular text-gray-600 dark:text-gray-400 mb-2">ชื่อ</label>
                      <input
                        name="u_fname"
                        value={user.u_fname}
                        onChange={(e) => setUser({ ...user, u_fname: e.target.value })}
                        type="text"
                        className="w-full px-4 py-2 font-light rounded-md text-sm border-2 border-gray-300 dark:border-zinc-600 text-gray-600 dark:bg-zinc-800 dark:text-gray-400 focus:outline-none focus:border-blue-500 transition-colors  transition-all duration-300 ease-in-out"
                        placeholder="กรอกชื่อ"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-sm font-regular text-gray-600 dark:text-gray-400 mb-2">นามสกุล</label>
                      <input
                        name="u_lname"
                        value={user.u_lname}
                        onChange={(e) => setUser({ ...user, u_lname: e.target.value })}
                        type="text"
                        className="w-full px-4 py-2 font-light rounded-md text-sm border-2 border-gray-300 dark:border-zinc-600 text-gray-600 dark:bg-zinc-800 dark:text-gray-400 focus:outline-none focus:border-blue-500 transition-colors  transition-all duration-300 ease-in-out"
                        placeholder="กรอกนามสกุล"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-sm font-regular text-gray-600 dark:text-gray-400 mb-2">
                        อายุ (ปี)
                      </label>
                      <input
                        name="age"
                        value={user.age}
                        onChange={(e) => setUser({ ...user, age: Number.parseInt(e.target.value) || 0 })}
                        type="number"
                        className="w-full px-4 py-2 font-light rounded-md text-sm border-2 border-gray-300 dark:border-zinc-600 text-gray-600 dark:bg-zinc-800 dark:text-gray-400 focus:outline-none focus:border-blue-500 transition-colors transition-all duration-300 ease-in-out"
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
        <div className="bg-white shadow dark:bg-zinc-900 text-base-content h-full w-full p-0 md:rounded-md pb-16 md:pb-0  transition-all duration-300 ease-in-out">
          <div className="flex flex-col lg:flex-row p-4">
            <div className="h-full w-full ">
              <div className="space-y-2">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <label className="block text-sm font-regular text-gray-600 dark:text-gray-400 mb-2">
                      หรัสประจำตำแหน่ง
                    </label>
                    <input
                      name="u_id_card"
                      value={user.u_id_card}
                      onChange={(e) => setUser({ ...user, u_id_card: e.target.value })}
                      type="text"
                      className="w-full px-4 py-2 font-light rounded-md text-sm border-2 border-gray-300 dark:border-zinc-600 text-gray-600 dark:bg-zinc-800 dark:text-gray-400 focus:outline-none focus:border-blue-500 transition-colors  transition-all duration-300 ease-in-out"
                      placeholder="6564XXXXXXX-X"
                    />
                  </div>
                  <div className='flex-1'>
                    <SelectPosition
                      openDropdown={openDropdown}
                      setOpenDropdown={setOpenDropdown}
                      positionDropdownRef={positionDropdownRef}
                      setSelectPosition={setSelectPosition}
                      handleOnChangePosition={(position_id: number) => setSelectPosition(position_id)}
                      initialPositionName={user.position_name}
                    />
                  </div>
                  <div className='flex-1'>
                  <SelectExPosition
                      openDropdown={openDropdown}
                      setOpenDropdown={setOpenDropdown}
                      expositionDropdownRef={expositionDropdownRef}
                      setSelectExPosition={setSelectExPosition}
                      handleOnChangeExPosition={(ex_position_id: number) => setSelectPosition(ex_position_id)}
                      initialExPositionName={user.ex_position_name}
                    />
                  </div>
                  <div className='flex-1'>
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

                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <label className="block text-sm font-regular text-gray-600 dark:text-gray-400 mb-2">
                      วันรับราขการ
                    </label>
                    <input
                      name="work_start"
                      value={user.work_start}
                      // onChange={handleInputChange}
                      type="date"
                      className="w-full px-4 py-[7px] font-light rounded-md text-sm border-2 border-gray-300 dark:border-zinc-600 text-gray-600 dark:bg-zinc-800 dark:text-gray-400 focus:outline-none focus:border-blue-500 transition-colors  transition-all duration-300 ease-in-out"
                      placeholder="กรอกวันรับราขการ"
                    />
                  </div>
                  <div className='flex-1'>
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
                  <div className='flex-1'>
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
                  <div className='flex-1'>
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


                <div className="flex md:flex-row flex-col gap-4">
                  <div className="flex-1">
                    <label className="block text-sm font-regular text-gray-600 dark:text-gray-400 mb-2">
                      เงินเดือน
                    </label>
                    <input
                      name="salary"
                      value={user.salary}
                      // onChange={handleInputChange}
                      type="number"
                      className="w-full px-4 py-2 font-light rounded-md text-sm border-2 border-gray-300 dark:border-zinc-600 text-gray-600 dark:bg-zinc-800 dark:text-gray-400 focus:outline-none focus:border-blue-500 transition-colors transition-all duration-300 ease-in-out"
                      placeholder="กรอกจำนวนเงินเดือน"
                      min="0"
                      step="0.01"

                    />
                  </div>

                  <div className="flex-1">
                    <label className="block text-sm font-regular text-gray-600 dark:text-gray-400 mb-2">
                      เบอร์ติดต่อ
                    </label>
                    <input
                      name="u_tel"
                      value={user.u_tel}
                      onChange={(e) => setUser({ ...user, u_tel: e.target.value })}
                      type="number"
                      className="w-full px-4 py-2 font-light rounded-md text-sm border-2 border-gray-300 dark:border-zinc-600 text-gray-600 dark:bg-zinc-800 dark:text-gray-400 focus:outline-none focus:border-blue-500 transition-colors transition-all duration-300 ease-in-out"
                      placeholder="กรอกเบอร์โทรศัพท์"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-regular text-gray-600 dark:text-gray-400 mb-2">
                      RMUTL อีเมล
                    </label>
                    <input
                      name="u_email"
                      value={user.u_email}
                      onChange={(e) => setUser({ ...user, u_email: e.target.value })}
                      type="text"
                      className="w-full px-4 py-2 font-light rounded-md text-sm border-2 border-gray-300 dark:border-zinc-600 text-gray-600 dark:bg-zinc-800 dark:text-gray-400 focus:outline-none focus:border-blue-500 transition-colors transition-all duration-300 ease-in-out"
                      placeholder="example.live.rmutl.ac.th"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-regular text-gray-600 dark:text-gray-400 mb-2">
                      รหัสผ่าน
                    </label>
                    <input
                      name="u_pass"
                      value=""
                     
                      type="password"
                      className="w-full px-4 py-2 font-light rounded-md text-sm border-2 border-gray-300 dark:border-zinc-600 text-gray-600 dark:bg-zinc-800 dark:text-gray-400 focus:outline-none focus:border-blue-500 transition-colors transition-all duration-300 ease-in-out"
                      placeholder="กรอกรหัสผ่าน"
                    />
                  </div>
                </div>

              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-zinc-900 w-full rounded-b-md transition-all duration-300 ease-in-out">
            <div className="px-4 pb-4 pt-2 flex justify-end">
              <button
                type="submit"
                className="w-full md:w-52 bg-success text-sm font-light text-white rounded-md py-2.5 px-4 hover:bg-success/80 transition ease-in-out duration-300 drawer-button text-center cursor-pointer">
                เพิ่มบุคลากร
              </button>
            </div>
          </div>
        </div>
      </div>
    </form >
  )
}

