'use client'

import Image from 'next/image'
import { Edit } from 'lucide-react'
import { convertToThaiDate, useUserProfile } from './useUserProfile'

type UserProfileState = ReturnType<typeof useUserProfile>

const labelClass =
  'font-regular mb-2 block text-sm text-gray-600 dark:text-gray-400'
const inputClass =
  'w-full rounded-md border-2 border-gray-300 px-4 py-2 text-sm font-light text-gray-600 transition-colors duration-300 ease-in-out focus:border-blue-500 focus:outline-none disabled:cursor-not-allowed disabled:bg-gray-100 disabled:opacity-50 dark:border-zinc-600 dark:bg-zinc-800 dark:text-gray-400 dark:disabled:bg-zinc-700'

type UserProfileFieldsProps = Pick<
  UserProfileState,
  | 'user'
  | 'previewImage'
  | 'isEditing'
  | 'getRootProps'
  | 'getInputProps'
  | 'isDragActive'
  | 'setUserField'
  | 'handleEditToggle'
>

export default function UserProfileFields({
  user,
  previewImage,
  isEditing,
  getRootProps,
  getInputProps,
  isDragActive,
  setUserField,
  handleEditToggle,
}: UserProfileFieldsProps) {
  if (!user) return null

  return (
    <div className="flex flex-col gap-4 h-auto w-full ">
      {/* การ์ดบน: รูป + คำนำหน้า/เพศ/ชื่อ/นามสกุล/อายุ */}
      <div className="bg-white rounded-md text-base-content shadow transition-all duration-300 ease-in-out dark:bg-zinc-900 flex flex-col p-4 lg:flex-row">
        <div className="h-full w-full">
          <div className="space-y-2">
            <div className="relative flex flex-col gap-0 md:flex-row md:gap-4">
              {!isEditing && (
                <button
                  type="button"
                  onClick={handleEditToggle}
                  className="absolute right-0 top-0 z-10 flex items-center gap-2 rounded-md bg-amber-500 px-4 py-2 text-sm font-normal text-white transition-colors duration-200 hover:bg-amber-600 "
                >
                  <Edit className="h-4 w-4 text-white" />
                  แก้ไข
                </button>
              )}
              <div className="flex flex-row items-center justify-center">
                <div
                  {...(isEditing ? getRootProps() : {})}
                  className={`relative h-36 w-36 overflow-hidden rounded-md border-2 border-dashed transition-colors duration-300 ease-in-out md:h-48 md:w-48 ${
                    isEditing
                      ? 'cursor-pointer border-amber-500 bg-gray-100 hover:border-amber-600 dark:border-amber-500 dark:bg-zinc-700 dark:hover:border-amber-600'
                      : 'cursor-not-allowed border-gray-200 bg-gray-50 dark:border-gray-600 dark:bg-zinc-800'
                  }`}
                >
                  <input {...getInputProps()} name="u_img" />
                  <div className="relative h-full w-full">
                    <Image
                      src={
                        previewImage
                          ? previewImage
                          : user.u_img
                            ? `/profile/${user.u_img}`
                            : '/profile/default.png'
                      }
                      alt="Profile Preview"
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 144px, 192px"
                    />
                    {isEditing && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 transition-opacity duration-300 hover:opacity-100">
                        <span className="text-sm text-white">
                          {isDragActive ? 'วางรูปภาพที่นี่' : 'เปลี่ยนรูปภาพ'}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex w-full flex-col justify-end gap-4">
                <div className="flex flex-col gap-4 md:flex-row">
                  <div className="flex-1">
                    <label className={labelClass}>คำนำหน้า</label>
                    <input
                      name="prefix_name"
                      value={user.prefix_name || ''}
                      type="text"
                      disabled={true}
                      className={inputClass}
                      placeholder="คำนำหน้า"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="space-y-2">
                      <label className={labelClass}>เพศ</label>
                      <div className="flex h-full items-center gap-6">
                        <label className="flex cursor-pointer items-center space-x-2">
                          <input
                            type="radio"
                            name="gender"
                            value="ชาย"
                            checked={user.gender === 'ชาย'}
                            disabled={true}
                            className="h-4 w-4 cursor-not-allowed border-gray-300 bg-gray-100 text-blue-600 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
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
                            disabled={true}
                            className="h-4 w-4 cursor-not-allowed border-gray-300 bg-gray-100 text-blue-600 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
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
                    <label className={labelClass}>ชื่อ</label>
                    <input
                      name="u_fname"
                      value={user.u_fname || ''}
                      onChange={(e) => setUserField({ u_fname: e.target.value })}
                      type="text"
                      disabled={true}
                      className={inputClass}
                      placeholder="กรอกชื่อ"
                    />
                  </div>
                  <div className="flex-1">
                    <label className={labelClass}>นามสกุล</label>
                    <input
                      name="u_lname"
                      value={user.u_lname || ''}
                      onChange={(e) => setUserField({ u_lname: e.target.value })}
                      type="text"
                      disabled={true}
                      className={inputClass}
                      placeholder="กรอกนามสกุล"
                    />
                  </div>
                  <div className="flex-1">
                    <label className={labelClass}>อายุ (ปี)</label>
                    <input
                      name="age"
                      value={user.age || ''}
                      onChange={(e) =>
                        setUserField({
                          age: Number.parseInt(e.target.value) || 0,
                        })
                      }
                      type="number"
                      disabled={true}
                      className={inputClass}
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

      {/* การ์ดล่าง: เลขประจำตำแหน่ง/ตำแหน่ง/วันเริ่มงาน/เงินเดือน/ติดต่อ/สังกัด */}
      <div className="h-full w-full bg-white p-0 pb-16 text-base-content shadow transition-all duration-300 ease-in-out dark:bg-zinc-900 md:rounded-md md:pb-0">
        <div className="flex flex-col p-4 lg:flex-row">
          <div className="h-full w-full">
            <div className="space-y-2">
              <div className="flex flex-col gap-4 md:flex-row">
                <div className="flex-1">
                  <label className={labelClass}>เลขประจำตำแหน่ง</label>
                  <input
                    name="u_id_card"
                    value={user.u_id_card || ''}
                    onChange={(e) => setUserField({ u_id_card: e.target.value })}
                    type="text"
                    disabled={true}
                    className={inputClass}
                    placeholder="6564XXXXXXX-X"
                  />
                </div>
                <div className="flex-1">
                  <label className={labelClass}>ตำแหน่งวิชาการ</label>
                  <input
                    name="position_name"
                    value={user.position_name || ''}
                    type="text"
                    disabled={true}
                    className={inputClass}
                    placeholder="ตำแหน่งวิชาการ"
                  />
                </div>
                <div className="flex-1">
                  <label className={labelClass}>ตำแหน่งบริหาร</label>
                  <input
                    name="ex_position_name"
                    value={user.ex_position_name || ''}
                    type="text"
                    disabled={true}
                    className={inputClass}
                    placeholder="ตำแหน่งบริหาร"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-4 md:flex-row">
                <div className="flex-1">
                  <label className={labelClass}>วันเริ่มทำงาน</label>
                  <input
                    name="work_start"
                    value={user.work_start ? convertToThaiDate(user.work_start) : ''}
                    type="text"
                    disabled={true}
                    className={inputClass}
                    placeholder="วันเริ่มทำงาน"
                  />
                </div>
                <div className="flex-1">
                  <label className={labelClass}>เงินเดือน</label>
                  <input
                    name="salary"
                    value={user.salary}
                    onChange={(e) =>
                      setUserField({ salary: parseFloat(e.target.value) || 0 })
                    }
                    type="number"
                    disabled={true}
                    className={inputClass}
                    placeholder="กรอกจำนวนเงินเดือน"
                    min="0"
                    step="0.01"
                  />
                </div>
                <div className="flex-1">
                  <label className={labelClass}>เบอร์ติดต่อ</label>
                  <input
                    name="u_tel"
                    value={user.u_tel}
                    onChange={(e) => setUserField({ u_tel: Number(e.target.value) || 0 })}
                    type="number"
                    disabled={!isEditing}
                    className={`w-full rounded-md border-2 ${isEditing ? 'border-amber-500' : 'border-gray-300'} px-4 py-2 text-sm font-light text-gray-600 transition-colors duration-300 ease-in-out focus:border-blue-500 focus:outline-none disabled:cursor-not-allowed disabled:bg-gray-100 disabled:opacity-50 dark:${isEditing ? 'border-amber-500' : 'border-zinc-600'} dark:bg-zinc-800 dark:text-gray-400 dark:disabled:bg-zinc-700`}
                    placeholder="กรอกเบอร์โทรศัพท์"
                  />
                </div>
                <div className="flex-1">
                  <label className={labelClass}>RMUTL อีเมล</label>
                  <input
                    name="u_email"
                    value={user.u_email}
                    onChange={(e) => setUserField({ u_email: e.target.value })}
                    type="text"
                    disabled={true}
                    className={inputClass}
                    placeholder="example.live.rmutl.ac.th"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-4 md:flex-row">
                <div className="flex-1">
                  <label className={labelClass}>สาขา</label>
                  <input
                    name="branch_name"
                    value={user.branch_name}
                    type="text"
                    disabled={true}
                    className={inputClass}
                    placeholder="สาขา"
                  />
                </div>
                <div className="flex-1">
                  <label className={labelClass}>หลักสูตร</label>
                  <input
                    name="course_name"
                    value={user.course_name}
                    type="text"
                    disabled={true}
                    className={inputClass}
                    placeholder="หลักสูตร"
                  />
                </div>
                <div className="flex-1">
                  <label className={labelClass}>ระดับผู้ใช้งาน</label>
                  <input
                    name="level_name"
                    value={user.level_name}
                    type="text"
                    disabled={true}
                    className={inputClass}
                    placeholder="ระดับผู้ใช้งาน"
                  />
                </div>
                <div className="flex-1">
                  <label className={labelClass}>ประเภทบุคลากร</label>
                  <input
                    name="type_p_name"
                    value={user.type_p_name}
                    type="text"
                    disabled={true}
                    className={inputClass}
                    placeholder="ประเภทบุคลากร"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
