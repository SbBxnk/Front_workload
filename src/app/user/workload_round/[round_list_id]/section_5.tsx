import React from 'react'

interface Section5Props {
  userName?: string | null
  userPosition?: string | null
  evaluatorName?: string | null
  evaluatorPosition?: string | null
}

function Section5({ 
  userName = null, 
  userPosition = null,
  evaluatorName = null,
  evaluatorPosition = null,
}: Section5Props) {
  return (
    <div>
      <p className="text-md mb-2 font-normal text-gray-800 dark:text-gray-200">
        ส่วนที่ 5 : การรับทราบผลการประเมิน
      </p>

      <div className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-zinc-900">
        {/* ส่วนที่ 1: ผู้รับการประเมิน */}
        <div className="border-b border-gray-300 dark:border-gray-700 bg-white dark:bg-zinc-900">
          <div className="grid grid-cols-2 divide-x divide-gray-300 dark:divide-gray-600">
            {/* คอลัมน์ซ้าย */}
            <div className="p-4">
              <p className="text-sm font-light text-gray-800 dark:text-gray-200 mb-3">
                ผู้รับการประเมิน :
              </p>
              <div className="flex items-start gap-2">
                <input
                  type="checkbox"
                  disabled
                  className="h-4 w-4 mt-1 cursor-default checkbox-business1"
                  style={{
                    accentColor: '#2E4497',
                  }}
                />
                <p className="text-sm font-light text-gray-800 dark:text-gray-200 flex-1">
                  ได้รับทราบผลการประเมินและแผนพัฒนาการปฏิบัติราชการรายบุคคลแล้ว
                </p>
              </div>
            </div>

            <div className="p-4 space-y-3">
              <div className="flex items-baseline gap-2">
                <span className="text-sm font-light text-gray-800 dark:text-gray-200 whitespace-nowrap">
                  ลงชื่อ
                </span>
                <div className="relative border-b border-dotted border-gray-500 dark:border-gray-400 pb-1 flex-1 min-h-[1.5rem]">
                  {userName && (
                    <span className="text-sm font-light text-gray-800 dark:text-gray-200 absolute bottom-1 left-0">
                      {userName}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-sm font-light text-gray-800 dark:text-gray-200 whitespace-nowrap">
                  ตำแหน่ง
                </span>
                <div className="relative border-b border-dotted border-gray-500 dark:border-gray-400 pb-1 flex-1 min-h-[1.5rem]">
                  {userPosition && (
                    <span className="text-sm font-light text-gray-800 dark:text-gray-200 absolute bottom-1 left-0">
                      {userPosition}
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

        {/* ส่วนที่ 2: ผู้ประเมิน */}
        <div>
          <div className="grid grid-cols-2 divide-x divide-gray-300 dark:divide-gray-600">
            {/* คอลัมน์ซ้าย */}
            <div className="p-4 space-y-4">
              <p className="text-sm font-light text-gray-800 dark:text-gray-200 mb-3">
                ผู้ประเมิน :
              </p>
              
              {/* Checkbox 1 */}
              <div className="flex items-start gap-2">
                <input
                  type="checkbox"
                  disabled
                  className="h-4 w-4 mt-1 cursor-default checkbox-business1"
                  style={{
                    accentColor: '#2E4497',
                  }}
                />
                <p className="text-sm font-light text-gray-800 dark:text-gray-200 flex-1">
                  ได้แจ้งผลการประเมินและผู้รับการประเมิน ได้ลงนาม รับทราบ
                </p>
              </div>

              {/* Checkbox 2 */}
              <div className="flex items-start gap-2">
                <input
                  type="checkbox"
                  disabled
                  className="h-4 w-4 mt-1 cursor-default checkbox-business1"
                  style={{
                    accentColor: '#2E4497',
                  }}
                />
                <div className="flex-1">
                  <p className="text-sm font-light text-gray-800 dark:text-gray-200">
                    ได้แจ้งผลการประเมินเมื่อวันที่
                    <span className="inline-block border-b border-dotted border-gray-500 dark:border-gray-400 mx-1 min-w-[8rem]">
                      {' '}
                    </span>
                    แต่ ผู้รับการประเมินไม่ลงนามรับทราบผลการประเมินโดย มี
                    <span className="inline-block border-b border-dotted border-gray-500 dark:border-gray-400 mx-1 min-w-[12rem]">
                      {' '}
                    </span>
                    เป็นพยาน
                  </p>
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
                  {evaluatorName && (
                    <span className="text-sm font-light text-gray-800 dark:text-gray-200 absolute bottom-1 left-0">
                      {evaluatorName}................................................
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-sm font-light text-gray-800 dark:text-gray-200 whitespace-nowrap">
                  ตำแหน่ง
                </span>
                <div className="relative border-b border-dotted border-gray-500 dark:border-gray-400 pb-1 flex-1 min-h-[1.5rem]">
                  {evaluatorPosition && (
                    <span className="text-sm font-light text-gray-800 dark:text-gray-200 absolute bottom-1 left-0">
                      {evaluatorPosition}
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
    </div>
  )
}

export default Section5

