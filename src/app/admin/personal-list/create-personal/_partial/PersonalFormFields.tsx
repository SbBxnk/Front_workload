'use client'

import type React from 'react'
import { Upload, X } from 'lucide-react'
import Image from 'next/image'
import type { useCreatePersonal } from './useCreatePersonal'
import SelectPrefix from './SelectPrefix'
import SelectPosition from './SelectPosition'
import SelectExPosition from './SelectExPosition'
import SelectPersonalType from './SelectPersonalType'
import SelectBranch from './SelectBranch'
import SelectCourse from './SelectCourse'
import SelectUserLevel from './SelectUserLevel'

type Form = ReturnType<typeof useCreatePersonal>

const inputClass =
  'w-full rounded-md border border-gray-300 px-4 py-2 text-sm font-light text-gray-600 transition-all duration-300 ease-in-out focus:border-blue-500 focus:outline-none dark:border-zinc-600 dark:bg-zinc-800 dark:text-gray-400'

const labelClass =
  'font-regular mb-2 block text-sm text-gray-600 dark:text-gray-400'

export default function PersonalFormFields({ form }: { form: Form }) {
  const {
    formData,
    labels,
    previewUrl,
    isDragActive,
    getRootProps,
    getInputProps,
    handleInputChange,
    handleRemoveImage,
    dropdown,
  } = form

  return (
    <>
      {/* ส่วนบน: รูป + ข้อมูลพื้นฐาน */}
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
                      name="u_img"
                      accept="image/*"
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
                          <p className="text-center text-sm">วางไฟล์ที่นี่ ...</p>
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
                      <label className={labelClass}>เลือกคำนำหน้า</label>
                      <SelectPrefix
                        selectedLabel={labels.prefix}
                        onSelect={dropdown.prefix.select}
                        onClear={dropdown.prefix.clear}
                      />
                    </div>

                    <div className="flex-1">
                      <div className="space-y-2">
                        <label className={labelClass}>เพศ</label>
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
                      <label className={labelClass}>ชื่อ</label>
                      <input
                        name="u_fname"
                        value={formData.u_fname}
                        onChange={handleInputChange}
                        type="text"
                        className={inputClass}
                        placeholder="กรอกชื่อ"
                      />
                    </div>
                    <div className="flex-1">
                      <label className={labelClass}>นามสกุล</label>
                      <input
                        name="u_lname"
                        value={formData.u_lname}
                        onChange={handleInputChange}
                        type="text"
                        className={inputClass}
                        placeholder="กรอกนามสกุล"
                      />
                    </div>
                    <div className="flex-1">
                      <label className={labelClass}>อายุ (ปี)</label>
                      <input
                        name="age"
                        value={formData.age}
                        onChange={handleInputChange}
                        type="number"
                        className={inputClass}
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

      {/* ส่วนล่าง: ข้อมูลตำแหน่ง/สังกัด/บัญชี */}
      <div className="h-full w-full bg-white p-0 pb-16 text-base-content shadow transition-all duration-300 ease-in-out dark:bg-zinc-900 md:rounded-md md:pb-0">
        <div className="flex flex-col p-4 lg:flex-row">
          <div className="h-full w-full">
            <div className="space-y-2">
              <div className="flex flex-col gap-4 md:flex-row">
                <div className="flex-1">
                  <label className={labelClass}>หรัสประจำตำแหน่ง</label>
                  <input
                    name="u_id_card"
                    value={formData.u_id_card}
                    onChange={handleInputChange}
                    type="text"
                    className={inputClass}
                    placeholder="6564XXXXXXX-X"
                  />
                </div>
                <div className="flex-1">
                  <label className={labelClass}>ตำแหน่งวิชาการ</label>
                  <SelectPosition
                    selectedLabel={labels.position}
                    onSelect={dropdown.position.select}
                    onClear={dropdown.position.clear}
                  />
                </div>
                <div className="flex-1">
                  <label className={labelClass}>ตำแหน่งบริหาร</label>
                  <SelectExPosition
                    selectedLabel={labels.exPosition}
                    onSelect={dropdown.exPosition.select}
                    onClear={dropdown.exPosition.clear}
                  />
                </div>
                <div className="flex-1">
                  <label className={labelClass}>ประเภทบุคลากร</label>
                  <SelectPersonalType
                    selectedLabel={labels.personalType}
                    onSelect={dropdown.personalType.select}
                    onClear={dropdown.personalType.clear}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-4 md:flex-row">
                <div className="flex-1">
                  <label className={labelClass}>วันรับราชการ</label>
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
                  <label className={labelClass}>สาขา</label>
                  <SelectBranch
                    selectedLabel={labels.branch}
                    onSelect={dropdown.branch.select}
                    onClear={dropdown.branch.clear}
                  />
                </div>
                <div className="flex-1">
                  <label className={labelClass}>หลักสูตร</label>
                  <SelectCourse
                    selectedLabel={labels.course}
                    branchId={formData.branch_id || null}
                    onSelect={dropdown.course.select}
                    onClear={dropdown.course.clear}
                  />
                </div>

                <div className="flex-1">
                  <label className={labelClass}>ระดับผู้ใช้งาน</label>
                  <SelectUserLevel
                    selectedLabel={labels.level}
                    onSelect={dropdown.level.select}
                    onClear={dropdown.level.clear}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-4 md:flex-row">
                <div className="flex-1">
                  <label className={labelClass}>เงินเดือน</label>
                  <input
                    name="salary"
                    value={formData.salary}
                    onChange={handleInputChange}
                    type="number"
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
                    value={formData.u_tel}
                    onChange={handleInputChange}
                    type="number"
                    className={inputClass}
                    placeholder="กรอกเบอร์โทรศัพท์"
                  />
                </div>
                <div className="flex-1">
                  <label className={labelClass}>RMUTL อีเมล</label>
                  <input
                    name="u_email"
                    value={formData.u_email}
                    onChange={handleInputChange}
                    type="text"
                    className={inputClass}
                    placeholder="example.live.rmutl.ac.th"
                  />
                </div>
                <div className="flex-1">
                  <label className={labelClass}>รหัสผ่าน</label>
                  <input
                    name="u_pass"
                    value={formData.u_pass}
                    onChange={handleInputChange}
                    type="password"
                    className={inputClass}
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
    </>
  )
}
