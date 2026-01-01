import React from 'react'
import Definitions from './definitions'

interface Section6Props {
  superior1Name?: string | null
  superior1Position?: string | null
  superior2Name?: string | null
  superior2Position?: string | null
}

function Section6({
  superior1Name = null,
  superior1Position = null,
  superior2Name = null,
  superior2Position = null,
}: Section6Props) {
  return (
    <div>
      <p className="text-md mb-2 font-normal text-gray-800 dark:text-gray-200">
        ส่วนที่ 6 : ความเห็นของผู้บังคับบัญชาเหนือขึ้นไป
      </p>

      <div className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-zinc-900">
        {/* ส่วนที่ 1: ผู้บังคับบัญชาเหนือขึ้นไป */}
        <div className="border-b border-gray-300 dark:border-gray-700">
          <div className="grid grid-cols-2 divide-x divide-gray-300 dark:divide-gray-600">
            {/* คอลัมน์ซ้าย */}
            <div className="p-4 space-y-4">
              <p className="text-sm font-light text-gray-800 dark:text-gray-200 mb-3">
                ผู้บังคับบัญชาเหนือขึ้นไป
              </p>
              
              {/* Checkbox 1 */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  className="h-4 w-4 cursor-default checkbox-business1"
                  style={{
                    accentColor: '#2E4497',
                  }}
                />
                <p className="text-sm font-light text-gray-800 dark:text-gray-200 flex-1">
                  เห็นด้วยกับผลการประเมิน
                </p>
              </div>

              {/* Checkbox 2 */}
              <div className="flex items-baseline gap-2">
                <input
                  type="checkbox"
                  className="h-4 w-4 mt-0.5 cursor-default checkbox-business1"
                  style={{
                    accentColor: '#2E4497',
                  }}
                />
                <div className="flex-1">
                  <div className="flex items-baseline gap-2">
                    <span className="text-sm font-light text-gray-800 dark:text-gray-200 whitespace-nowrap">
                      มีความเห็นแตกต่าง ดังนี้
                    </span>
                    <div className="relative border-b border-dotted border-gray-500 dark:border-gray-400 pb-1 flex-1 min-h-[1.5rem]" />
                  </div>
                </div>
              </div>
            </div>

            {/* คอลัมน์ขวา */}
            <div className="p-4 space-y-3">
              <div className="flex items-baseline gap-2">
                <span className="text-sm font-light text-gray-800 dark:text-gray-200 whitespace-nowrap">
                  ลงชื่อ
                </span>
                <div className="relative border-b border-dotted border-gray-500 dark:border-gray-400 pb-1 flex-1 min-h-[1.5rem]">
                  {superior1Name && (
                    <span className="text-sm font-light text-gray-800 dark:text-gray-200 absolute bottom-1 left-0">
                      {superior1Name}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-sm font-light text-gray-800 dark:text-gray-200 whitespace-nowrap">
                  ตำแหน่ง
                </span>
                <div className="relative border-b border-dotted border-gray-500 dark:border-gray-400 pb-1 flex-1 min-h-[1.5rem]">
                  {superior1Position && (
                    <span className="text-sm font-light text-gray-800 dark:text-gray-200 absolute bottom-1 left-0">
                      {superior1Position}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-sm font-light text-gray-800 dark:text-gray-200 whitespace-nowrap">
                  วันที่
                </span>
                <div className="relative border-b border-dotted border-gray-500 dark:border-gray-400 pb-1 flex-1 min-h-[1.5rem]" />
              </div>
            </div>
          </div>
        </div>

        {/* ส่วนที่ 2: ผู้บังคับบัญชาเหนือขึ้นไปอีกชั้นหนึ่ง (ถ้ามี) */}
        <div>
          <div className="grid grid-cols-2 divide-x divide-gray-300 dark:divide-gray-600">
            {/* คอลัมน์ซ้าย */}
            <div className="p-4 space-y-4">
              <p className="text-sm font-light text-gray-800 dark:text-gray-200 mb-3">
                ผู้บังคับบัญชาเหนือขึ้นไปอีกชั้นหนึ่ง (ถ้ามี)
              </p>
              
              {/* Checkbox 1 */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  className="h-4 w-4 cursor-default checkbox-business1"
                  style={{
                    accentColor: '#2E4497',
                  }}
                />
                <p className="text-sm font-light text-gray-800 dark:text-gray-200 flex-1">
                  เห็นด้วยกับผลการประเมิน
                </p>
              </div>

              {/* Checkbox 2 */}
              <div className="flex items-baseline gap-2">
                <input
                  type="checkbox"
                  className="h-4 w-4 mt-0.5 cursor-default checkbox-business1"
                  style={{
                    accentColor: '#2E4497',
                  }}
                />
                <div className="flex-1">
                  <div className="flex items-baseline gap-2">
                    <span className="text-sm font-light text-gray-800 dark:text-gray-200 whitespace-nowrap">
                      มีความเห็นแตกต่าง ดังนี้
                    </span>
                    <div className="relative border-b border-dotted border-gray-500 dark:border-gray-400 pb-1 flex-1 min-h-[1.5rem]" />
                  </div>
                </div>
              </div>
            </div>

            {/* คอลัมน์ขวา */}
            <div className="p-4 space-y-3">
              <div className="flex items-baseline gap-2">
                <span className="text-sm font-light text-gray-800 dark:text-gray-200 whitespace-nowrap">
                  ลงชื่อ
                </span>
                <div className="relative border-b border-dotted border-gray-500 dark:border-gray-400 pb-1 flex-1 min-h-[1.5rem]">
                  {superior2Name && (
                    <span className="text-sm font-light text-gray-800 dark:text-gray-200 absolute bottom-1 left-0">
                      {superior2Name}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-sm font-light text-gray-800 dark:text-gray-200 whitespace-nowrap">
                  ตำแหน่ง
                </span>
                <div className="relative border-b border-dotted border-gray-500 dark:border-gray-400 pb-1 flex-1 min-h-[1.5rem]">
                  {superior2Position && (
                    <span className="text-sm font-light text-gray-800 dark:text-gray-200 absolute bottom-1 left-0">
                      {superior2Position}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-sm font-light text-gray-800 dark:text-gray-200 whitespace-nowrap">
                  วันที่
                </span>
                <div className="relative border-b border-dotted border-gray-500 dark:border-gray-400 pb-1 flex-1 min-h-[1.5rem]" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <Definitions />
      </div>
    </div>
  )
}

export default Section6
