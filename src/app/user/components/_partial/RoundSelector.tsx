import { ChevronDown, Calendar } from 'lucide-react'
import type { RoundList } from '@/Types/assessor'
import type { RefObject } from 'react'

interface RoundSelectorProps {
  rounds: RoundList[]
  selectedRoundId: number | null
  isDropdownOpen: boolean
  setIsDropdownOpen: (open: boolean) => void
  dropdownRef: RefObject<HTMLDivElement>
  onSelectRound: (roundId: number) => void
}

export function RoundSelector({
  rounds,
  selectedRoundId,
  isDropdownOpen,
  setIsDropdownOpen,
  dropdownRef,
  onSelectRound,
}: RoundSelectorProps) {
  return (
    <div className="relative w-full md:w-72" ref={dropdownRef}>
      <button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="flex w-full items-center justify-between gap-3 rounded-md border border-gray-200 bg-white px-4 py-2.5 text-sm font-normal text-gray-700 dark:border-zinc-800 dark:bg-zinc-900 dark:text-gray-100"
      >
        <div className="flex items-center gap-2.5 truncate">
          <Calendar className="h-4 w-4 text-blue-500" />
          <span className="truncate">
            {rounds.find(r => r.round_list_id === selectedRoundId)?.round_list_name || 'เลือกรอบการประเมิน'}
          </span>
        </div>
        <ChevronDown className={`h-4 w-4 text-gray-400 ${isDropdownOpen ? 'rotate-180' : ''}`} />
      </button>

      {isDropdownOpen && (
        <div className="absolute left-0 right-0 z-50 mt-2 max-h-64 overflow-y-auto rounded-xl border border-gray-100 bg-white p-1.5 shadow-xl dark:border-zinc-800 dark:bg-zinc-900">
          {rounds.length === 0 ? (
            <div className="px-4 py-3 text-sm text-gray-500">ไม่พบรอบการประเมิน</div>
          ) : (
            rounds.map((round) => (
              <button
                key={round.round_list_id}
                onClick={() => onSelectRound(round.round_list_id)}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm ${selectedRoundId === round.round_list_id
                  ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                  : 'text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-zinc-800'
                  }`}
              >
                <span className="truncate font-medium">{round.round_list_name}</span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  )
}
