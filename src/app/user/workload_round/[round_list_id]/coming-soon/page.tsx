'use client'
import { useEffect } from 'react'
import { useParams } from 'next/navigation'
import useUtility from '@/hooks/useUtility'

export default function ComingSoon() {
  const params = useParams()
  const { setBreadcrumbs } = useUtility()
  const round_list_id = params.round_list_id as string

  useEffect(() => {
    setBreadcrumbs([
      { text: 'ฟอร์มประเมินภาระงาน', path: '/user/workload_round' },
      { text: 'องค์ประกอบที่ 2 พฤติกรรมการปฏิบัติงาน', path: `/user/workload_round/${round_list_id}` },
      { text: 'พฤติกรรมการปฏิบัติงาน', path: `/user/workload_round/${round_list_id}/coming-soon` },
    ])
  }, [setBreadcrumbs, round_list_id])

  return (
    <div className="rounded-md bg-white p-4 shadow">
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
          <span className="text-2xl">🚧</span>
        </div>
        <h2 className="mb-2 text-xl font-semibold text-gray-800 dark:text-gray-200">
          กำลังพัฒนา
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          สมรรถนะที่ 2 กำลังอยู่ในระหว่างการพัฒนา
        </p>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-500">
          กรุณาเลือกสมรรถนะที่ 1 เพื่อประเมินภาระงาน
        </p>
      </div>
    </div>
  )
}
