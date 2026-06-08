import { getGrade } from './dashboardHelpers'

export function GradeDisplay({ label, score, title, disabled, colorClass, borderClass }: { label: string, score: number | null, title: string, disabled?: boolean, colorClass: string, borderClass: string }) {
  const grade = getGrade(score)

  if (disabled || !grade) {
    return (
      <div className="flex w-full flex-col gap-1 rounded-lg border border-gray-100 bg-gray-50/50 p-3 text-center transition-all dark:border-zinc-800 dark:bg-zinc-800/30">
        <div className="text-[10px] font-normal uppercase tracking-wider text-gray-400 dark:text-zinc-500">
          {label}
        </div>
        <div className="text-sm font-normal text-gray-300 dark:text-zinc-600">
          ยังไม่สรุปผล
        </div>
      </div>
    )
  }

  return (
    <div className={`flex w-full flex-col gap-1 rounded-lg border ${borderClass} ${colorClass} p-3 text-center transition-all shadow-sm`}>
      <div className="text-[10px] font-normal uppercase tracking-wider opacity-80">
        {label}
      </div>
      <div className="text-sm font-normal">
        {grade.label}
      </div>
    </div>
  )
}
