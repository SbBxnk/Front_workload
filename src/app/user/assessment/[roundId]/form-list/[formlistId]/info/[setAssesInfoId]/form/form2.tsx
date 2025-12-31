'use client'

import PerformanceForm from '@/app/user/workload_round/[round_list_id]/performance/_performanceForm'

interface Component2ContentProps {
    formlistIdParam: string
    setAssesInfoIdParam: string
    accessToken: string
    roundListId?: number
    assesseeUserId?: number
}

export default function Component2Content({
    formlistIdParam,
    setAssesInfoIdParam,
    accessToken,
    roundListId,
    assesseeUserId,
}: Component2ContentProps) {
    if (!assesseeUserId || !roundListId) {
        return (
            <div className="rounded-md bg-white p-4 shadow dark:bg-zinc-900">
                <div className="flex items-center justify-center py-16">
                    <div className="text-gray-600 dark:text-gray-400">กำลังโหลดข้อมูล...</div>
                </div>
            </div>
        )
    }

    return (
        <PerformanceForm
            userId={assesseeUserId}
            roundId={roundListId}
            formlist_id={formlistIdParam ? parseInt(formlistIdParam) : undefined}
        />
    )
}

