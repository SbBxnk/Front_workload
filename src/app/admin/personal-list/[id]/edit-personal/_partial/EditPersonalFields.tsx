'use client'

import { Upload, X } from 'lucide-react'
import Image from 'next/image'
import SelectDropdown from '@/components/SelectDropdown'
import type { useEditPersonal } from './useEditPersonal'

type EditPersonalState = ReturnType<typeof useEditPersonal>

const labelClass =
  'font-regular mb-2 block text-sm text-gray-600 dark:text-gray-400'
const inputClass =
  'w-full rounded-md border border-gray-300 px-4 py-2 text-sm font-light text-gray-600 transition-all duration-300 ease-in-out focus:border-blue-500 focus:outline-none dark:border-zinc-600 dark:bg-zinc-800 dark:text-gray-400'

export default function EditPersonalFields({
  formData,
  previewUrl,
  prefixes,
  positions,
  exPositions,
  personalTypes,
  branches,
  courses,
  userLevels,
  selectPrefix,
  selectPosition,
  selectExPosition,
  selectPersonalType,
  selectBranch,
  selectCourse,
  selectLevel,
  handleInputChange,
  clearImage,
  handleSelectPrefix,
  handleSelectPosition,
  handleSelectExPosition,
  handleSelectPersonalType,
  handleSelectBranch,
  handleSelectCourse,
  handleSelectLevel,
}: EditPersonalState) {
  return (
    <>
      {/* การ์ดบน: รูป + คำนำหน้า/เพศ/ชื่อ/นามสกุล/อายุ */}
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
                      className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0"
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
                            clearImage()
                          }}
                          className="absolute right-2 top-2 z-20 rounded-full bg-red-600 p-1 text-white transition duration-300 hover:bg-red-700"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="pointer-events-none flex h-full w-full items-center justify-center text-gray-400">
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
                      <label className={labelClass}>เลือกคำนำหน้า</label>
                      <SelectDropdown
                        selectedLabel={selectPrefix || ''}
                        handleSelect={handleSelectPrefix}
                        objects={prefixes}
                        valueKey="prefix_id"
                        labelKey="prefix_name"
                        placeholder="เลือกคำนำหน้า"
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
                      <label className={labelClass}>ชื่อ</label>
                      <input
                        name="u_fname"
                        value={formData?.u_fname || ''}
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
                        value={formData?.u_lname || ''}
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
                        value={formData?.age || ''}
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

      {/* การ์ดล่าง: ข้อมูลตำแหน่ง/สาขา/หลักสูตร/ระดับ/เงินเดือน/ติดต่อ */}
      <div className="h-full w-full bg-white p-0 pb-16 text-base-content shadow transition-all duration-300 ease-in-out dark:bg-zinc-900 md:rounded-md md:pb-0">
        <div className="flex flex-col p-4 lg:flex-row">
          <div className="h-full w-full">
            <div className="space-y-2">
              <div className="flex flex-col gap-4 md:flex-row">
                <div className="flex-1">
                  <label className={labelClass}>หรัสประจำตำแหน่ง</label>
                  <input
                    name="u_id_card"
                    value={formData?.u_id_card || ''}
                    onChange={handleInputChange}
                    type="text"
                    className={inputClass}
                    placeholder="6564XXXXXXX-X"
                  />
                </div>
                <div className="flex-1">
                  <label className={labelClass}>ตำแหน่งวิชาการ</label>
                  <SelectDropdown
                    selectedLabel={selectPosition || ''}
                    handleSelect={handleSelectPosition}
                    objects={positions}
                    valueKey="position_id"
                    labelKey="position_name"
                    placeholder="เลือกตำแหน่งวิชาการ"
                  />
                </div>
                <div className="flex-1">
                  <label className={labelClass}>ตำแหน่งบริหาร</label>
                  <SelectDropdown
                    selectedLabel={selectExPosition || ''}
                    handleSelect={handleSelectExPosition}
                    objects={exPositions}
                    valueKey="ex_position_id"
                    labelKey="ex_position_name"
                    placeholder="เลือกตำแหน่งบริหาร"
                  />
                </div>
                <div className="flex-1">
                  <label className={labelClass}>ประเภทบุคลากร</label>
                  <SelectDropdown
                    selectedLabel={selectPersonalType || ''}
                    handleSelect={handleSelectPersonalType}
                    objects={personalTypes}
                    valueKey="type_p_id"
                    labelKey="type_p_name"
                    placeholder="เลือกประเภทบุคลากร"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-4 md:flex-row">
                <div className="flex-1">
                  <label className={labelClass}>วันรับราชการ</label>
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
                  <label className={labelClass}>สาขา</label>
                  <SelectDropdown
                    selectedLabel={selectBranch || ''}
                    handleSelect={handleSelectBranch}
                    objects={branches}
                    valueKey="branch_id"
                    labelKey="branch_name"
                    placeholder="เลือกสาขา"
                  />
                </div>
                <div className="flex-1">
                  <label className={labelClass}>หลักสูตร</label>
                  <SelectDropdown
                    selectedLabel={selectCourse || ''}
                    handleSelect={handleSelectCourse}
                    objects={courses}
                    valueKey="course_id"
                    labelKey="course_name"
                    placeholder="เลือกหลักสูตร"
                  />
                </div>

                <div className="flex-1">
                  <label className={labelClass}>ระดับผู้ใช้งาน</label>
                  <SelectDropdown
                    selectedLabel={selectLevel || ''}
                    handleSelect={handleSelectLevel}
                    objects={userLevels}
                    valueKey="level_id"
                    labelKey="level_name"
                    placeholder="เลือกระดับผู้ใช้งาน"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-4 md:flex-row">
                <div className="flex-1">
                  <label className={labelClass}>เงินเดือน</label>
                  <input
                    name="salary"
                    value={formData?.salary || ''}
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
                    value={formData?.u_tel || ''}
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
                    value={formData?.u_email || ''}
                    onChange={handleInputChange}
                    type="text"
                    className={inputClass}
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
    </>
  )
}
