import React from 'react';
import Link from 'next/link';
import { GraduationCap } from 'lucide-react';
import useFetchData from '@/hooks/FetchAPI';

interface CountMemberCradProps {
  branch_name: string
  total: number
}
const branchBgMapping: Record<string, string> = {
  "สาขาบริหารธุรกิจ": 'bg-purple-500',
  "สาขาการบัญชี": 'bg-green-500',
  "สาขาศิลปศาสตร์": 'bg-yellow-500',
};

const branchTextMapping: Record<string, string> = {
  "สาขาบริหารธุรกิจ": 'font-medium text-purple-500',
  "สาขาการบัญชี": 'font-medium text-green-500',
  "สาขาศิลปศาสตร์": 'font-medium text-yellow-500',
};

function CountMemberCrad() {
  const { data: countBranhs, loading, error } = useFetchData<CountMemberCradProps[]>('/count-all-branch');

  if (loading ) return <div>Loading...</div>;
  if (error) return <div>Error loading data.</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-4">
      {countBranhs?.map((stat:CountMemberCradProps , index:number) => {
        // ดึงคลาสสีของสาขาจาก mapping หากไม่มี จะใช้สีม่วงเป็น default
        const bgColor = branchBgMapping[stat.branch_name] || 'bg-purple-500';
        const textColor = branchTextMapping[stat.branch_name] || 'bg-purple-500';
        return (
          <Link
            key={index}
            href={`/admin/personal-list?branch=${encodeURIComponent(stat.branch_name)}`}
            className="bg-white rounded-md shadow p-4 hover:cursor-pointer dark:bg-zinc-900 dark:text-gray-200 transition-all duration-300 ease-in-out"
          >
            <div className="flex items-center justify-between">
              <div className="w-2/3">
                <p className="text-xl text-gray-600 font-light truncate max-w-full dark:text-gray-400">
                  {stat.branch_name}
                </p>
                <p className="text-3xl font-light text-gray-900 mt-1">
                  <span className={textColor}>{stat.total}</span>
                </p>
                <p className="text-md text-gray-500 font-light">คน</p>
              </div>
              <div className={`${bgColor} rounded-full p-2 w-[60px] h-[60px] flex items-center justify-center`}>
                <GraduationCap width={50} height={50} className="text-xl text-white" />
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}

export default CountMemberCrad;