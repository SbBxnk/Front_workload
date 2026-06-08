'use client'
import type React from 'react'
import { useRef, useState } from 'react'
import {
  CalendarClock,
  Book,
  Calendar,
  ClockIcon as ClockAlert,
  TriangleAlertIcon,
  AlertCircle,
  CircleX,
  Armchair
} from 'lucide-react'
import InfoHoverModal from './form/infoTermModal'
import type { WorkloadGroup } from '@/Types'
import WorkloadFormServices from '@/services/workloadFormServices'
import { useRoundLayout } from './_partial/useRoundLayout'
import WorkloadGroupModal from './_partial/WorkloadGroupModal'

const formatThaiDate = (dateString: string) => {
  const date = new Date(dateString)
  const thaiMonths = [
    'มกราคม',
    'กุมภาพันธ์',
    'มีนาคม',
    'เมษายน',
    'พฤษภาคม',
    'มิถุนายน',
    'กรกฎาคม',
    'สิงหาคม',
    'กันยายน',
    'ตุลาคม',
    'พฤศจิกายน',
    'ธันวาคม',
  ]

  const day = date.getDate()
  const month = thaiMonths[date.getMonth()]
  const year = date.getFullYear() + 543

  return `${day} ${month} ${year}`
}

function ClientLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const infoIconRef = useRef<HTMLDivElement>(null)

  const {
    currentRound,
    workloadGroupInfo,
    setWorkloadGroupInfo,
    workloadGroups,
    terms,
    selectedWorkloadGroup,
    setSelectedWorkloadGroup,
    hasFormInRound,
    loading,
    isCheckingAccess,
    user,
    targetRoundStatus,
  } = useRoundLayout()

  if (loading || isCheckingAccess || hasFormInRound === null) {
    return (
      <div className="space-y-4">
        <div className="rounded-md bg-white p-4 shadow dark:bg-zinc-900 dark:text-gray-400">
          <h2 className="mb-4 text-lg font-medium text-gray-700 dark:text-gray-300">
            รอบการประเมินปัจจุบัน
          </h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            {[...Array(4)].map((_, index) => (
              <div key={index} className="space-y-4">
                <div className="h-4 w-24 animate-pulse rounded bg-gray-200 dark:bg-zinc-700"></div>
                <div className="h-8 w-full animate-pulse rounded bg-gray-200 dark:bg-zinc-700"></div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-md bg-white px-4 pt-4 pb-1 shadow dark:bg-zinc-900 dark:text-gray-400">
          <h2 className="text-lg font-medium text-gray-700 dark:text-gray-300">เกณฑ์การประเมินภาระงานของแต่ละด้านภาระงาน</h2>
          <div className="my-4 overflow-x-auto" style={{ minHeight: 'calc(5 * 3rem + 3.5rem)' }}>
            <table className="w-full border border-gray-300 bg-white dark:border-gray-700 dark:bg-zinc-900">
              <thead className="bg-gray-100 dark:bg-zinc-800">
                <tr>
                  <th className="font-normal border-b border-r border-gray-300 px-4 py-3 text-center text-gray-700 dark:text-gray-300">
                    <div className="h-6 w-24 bg-gray-200 dark:bg-zinc-700 rounded animate-pulse mx-auto" />
                  </th>
                  {[...Array(4)].map((_, i) => (
                    <th key={i} className="font-normal border-b border-r border-gray-300 px-4 py-3 text-center text-gray-700 dark:text-gray-300">
                      <div className="h-6 w-28 bg-gray-200 dark:bg-zinc-700 rounded mx-auto animate-pulse" />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[...Array(5)].map((_, r) => (
                  <tr key={r} className="hover:bg-gray-50 dark:hover:bg-zinc-800">
                    <td className="font-light border-b border-r border-gray-300 px-4 py-3 text-gray-700">
                      <div className="h-6 w-48 bg-gray-200 dark:bg-zinc-700 rounded animate-pulse" />
                    </td>
                    {[...Array(4)].map((_, c) => (
                      <td key={`${r}-${c}`} className="font-light border-b border-r border-gray-300 px-4 py-3 text-center text-gray-700">
                        <div className="h-6 w-8 bg-gray-200 dark:bg-zinc-700 rounded mx-auto animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))}
                <tr className="bg-gray-50 dark:bg-zinc-800">
                  <td className="font-normal border-b border-r border-gray-300 px-4 py-3 text-right text-gray-700">
                    <div className="h-6 w-20 bg-gray-200 dark:bg-zinc-700 rounded ml-auto animate-pulse" />
                  </td>
                  {[...Array(4)].map((_, c) => (
                    <td key={`total-${c}`} className="border-b border-r border-gray-300 px-4 py-3 text-center text-business1 font-normal">
                      <div className="h-6 w-8 bg-gray-200 dark:bg-zinc-700 rounded mx-auto animate-pulse" />
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <div className="rounded-md bg-white p-4 shadow dark:bg-zinc-900 dark:text-gray-400">
          <h2 className="text-lg font-medium text-gray-700 dark:text-gray-300">กรุณาเลือกภาระงานก่อน</h2>
          <div className="mt-4 flex flex-wrap gap-2 min-h-[2.5rem]">
            {[...Array(4)].map((_, index) => (
              <div
                key={index}
                className="h-10 w-28 animate-pulse rounded bg-gray-200 dark:bg-zinc-700"
              />
            ))}
          </div>
          {/* รองรับพื้นที่ของ ConfirmModal */}
          <div className="h-0" />
        </div>
      </div>
    )
  }

  return (
    <>
      {targetRoundStatus === 'not_found' ? (
        <div className="mb-4 rounded-md bg-white p-6 shadow dark:bg-zinc-900 dark:text-gray-400">
          <div className="flex flex-col items-center justify-center gap-4 py-8 text-center">
            <CircleX className="h-12 w-12 text-red-500 md:h-24 md:w-24" />
            <div className="">
              <h2 className="mb-2 text-4xl font-medium text-gray-700 dark:text-gray-300">
                ไม่พบรอบการประเมิน
              </h2>
              <p className="text-gray-500 dark:text-gray-400">
                คุณไม่ได้ถูกกำหนดให้เป็นผู้ประเมินในรอบนี้
              </p>
              <p className="text-gray-500 dark:text-gray-400">
                กรุณาติดต่อผู้ดูแลระบบหากคิดว่านี่เป็นข้อผิดพลาด
              </p>
            </div>
          </div>
        </div>
      ) : targetRoundStatus === 'not_started' ? (
        <div className="mb-4 rounded-md bg-white p-6 shadow dark:bg-zinc-900 dark:text-gray-400">
          <div className="flex flex-col items-center justify-center gap-4 py-8 text-center">
            <ClockAlert className="h-12 w-12 text-amber-500 md:h-24 md:w-24" />
            <div className="">
              <h2 className="mb-2 text-4xl font-medium text-gray-700 dark:text-gray-300">
                รอบการประเมินยังไม่เปิด
              </h2>
              <p className="text-gray-500 dark:text-gray-400">
                กรุณากลับมาอีกครั้งเมื่อถึงช่วงเวลาเริ่มต้นของรอบนี้
              </p>
            </div>
          </div>
        </div>
      ) : hasFormInRound === false ? (
        <div className="mb-4 rounded-md bg-white p-6 shadow dark:bg-zinc-900 dark:text-gray-400">
          <div className="flex flex-col items-center justify-center gap-4 py-8 text-center">
            <TriangleAlertIcon className="h-12 w-12 text-red-500 md:h-24 md:w-24" />
            <div className="">
              <h2 className="mb-2 text-4xl font-medium text-gray-700 dark:text-gray-300">
                การประเมินสิ้นสุดแล้ว
              </h2>
              <p className="text-gray-500 dark:text-gray-400">
                คุณไม่ได้ถูกกำหนดให้เป็นผู้ประเมินในรอบนี้
              </p>
              <p className="text-gray-500 dark:text-gray-400">
                กรุณาติดต่อผู้ดูแลระบบหากคิดว่านี่เป็นข้อผิดพลาด
              </p>
            </div>
          </div>
        </div>
      ) : hasFormInRound === true ? (
        <div className="space-y-4 mb-24">
          {currentRound && (
            <div className="z-10 rounded-md bg-white p-4 shadow dark:bg-zinc-900 dark:text-gray-400">
              <h2 className="mb-4 text-lg font-medium text-gray-700 dark:text-gray-300">
                รอบการประเมินปัจจุบัน
              </h2>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                <div className="">
                  <p className="flex items-center gap-2 text-sm font-light text-gray-500">
                    <Armchair className="h-4 w-4" />
                    ตำแหน่งผู้รับการประเมิน
                  </p>
                  <p className="text-md text-md p-2 font-normal">
                    {user?.position_name || '-'}
                  </p>
                </div>
                <div className="">
                  <p className="flex items-center gap-2 text-sm font-light text-gray-500">
                    <Calendar className="h-4 w-4" />
                    รอบ / ปีงบประมาณ
                  </p>
                  <p className="text-md text-md p-2 font-normal">
                    {currentRound.round} / {currentRound.year}
                  </p>
                </div>
                <div className="">
                  <p className="flex items-center gap-2 text-sm font-light text-gray-500">
                    <CalendarClock className="h-4 w-4" />
                    ระยะเวลา
                  </p>
                  <p className="text-md text-md p-2 font-normal">
                    {formatThaiDate(currentRound.date_start)} -{' '}
                    {formatThaiDate(currentRound.date_end)}
                  </p>
                </div>
                <div className="">
                  <p className="flex items-center gap-2 text-sm font-light text-gray-500">
                    <Book className="h-4 w-4" />
                    กลุ่มภาระงาน
                  </p>
                  <div className="text-md text-md relative flex items-center gap-2 p-2 font-normal">
                    {workloadGroupInfo?.workload_group_name || '-'}
                    {/* หากไม่มีการเลือก workload_group_id จะไม่แสดง info */}
                    {workloadGroupInfo?.workload_group_id && (
                      <div
                        ref={infoIconRef}
                        className="cursor-pointer text-gray-400 hover:text-gray-500"
                        onClick={(e) => { e.stopPropagation(); setIsModalOpen(true) }}
                      >
                        <AlertCircle className="h-4 w-4" />
                        {isModalOpen && (
                          <InfoHoverModal
                            workloadGroupInfo={workloadGroupInfo}
                            isOpen={isModalOpen}
                            onClose={() => setIsModalOpen(false)}
                          />
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* เลือกกลุ่มภาระงาน + ตารางเกณฑ์ เมื่อยังไม่เลือกกลุ่ม */}
          {(!workloadGroupInfo || !workloadGroupInfo.workload_group_id) ? (
            <WorkloadGroupModal
              terms={terms}
              workloadGroups={workloadGroups}
              selectedWorkloadGroup={selectedWorkloadGroup}
              setSelectedWorkloadGroup={setSelectedWorkloadGroup}
              handleSelectWorkloadGroup={async (group: WorkloadGroup) => {
                if (!user || !currentRound) return
                try {
                  const resp = await WorkloadFormServices.selectWorkloadFormGroup(
                    user.id,
                    group.workload_group_id,
                    currentRound.round_list_id
                  )
                  if (resp.status) {
                    setWorkloadGroupInfo({
                      workload_group_id: group.workload_group_id,
                      workload_group_name: group.workload_group_name,
                    })
                    setSelectedWorkloadGroup(null)
                  }
                } catch (e) {
                  console.error('Error selecting workload group:', e)
                }
              }}
            />
          ) : (
            // เลือกกลุ่มแล้ว แสดงเนื้อหาหลัก
            children
          )}
        </div>
      ) : null}
    </>
  )
}

export default ClientLayout
