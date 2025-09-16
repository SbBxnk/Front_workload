import React from 'react'
import Link from 'next/link'
import { GraduationCap } from 'lucide-react'
import useFetchData from '@/hooks/FetchAPI'

interface CountMemberCradProps {
  branch_name: string
  total: number
}
const branchBgMapping: Record<string, string> = {
  สาขาบริหารธุรกิจ: 'bg-purple-500',
  สาขาการบัญชี: 'bg-green-500',
  สาขาศิลปศาสตร์: 'bg-yellow-500',
}

const branchTextMapping: Record<string, string> = {
  สาขาบริหารธุรกิจ: 'font-medium text-purple-500',
  สาขาการบัญชี: 'font-medium text-green-500',
  สาขาศิลปศาสตร์: 'font-medium text-yellow-500',
}

function CountMemberCrad() {
  const {
    data: countBranhs,
    loading,
    error,
  } = useFetchData<CountMemberCradProps[]>('/count-all-branch')

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error loading data.</div>

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-3">
      {countBranhs?.map((stat: CountMemberCradProps, index: number) => {
        // ดึงคลาสสีของสาขาจาก mapping หากไม่มี จะใช้สีม่วงเป็น default
        const bgColor = branchBgMapping[stat.branch_name] || 'bg-purple-500'
        const textColor = branchTextMapping[stat.branch_name] || 'bg-purple-500'
        return (
          <Link
            key={index}
            href={`/admin/personal-list?branch=${encodeURIComponent(stat.branch_name)}`}
            className="rounded-md bg-white p-4 shadow transition-all duration-300 ease-in-out hover:cursor-pointer dark:bg-zinc-900 dark:text-gray-200"
          >
            <div className="flex items-center justify-between">
              <div className="w-2/3">
                <p className="max-w-full truncate text-xl font-light text-gray-600 dark:text-gray-400">
                  {stat.branch_name}
                </p>
                <p className="mt-1 text-3xl font-light text-gray-900">
                  <span className={textColor}>{stat.total}</span>
                </p>
                <p className="text-md font-light text-gray-500">คน</p>
              </div>
              <div
                className={`${bgColor} flex h-[60px] w-[60px] items-center justify-center rounded-full p-2`}
              >
                <GraduationCap
                  width={50}
                  height={50}
                  className="text-xl text-white"
                />
              </div>
            </div>
          </Link>
        )
      })}
    </div>
  )
}

export default CountMemberCrad
