import React from 'react'

function SkeletonTable() {
  return (
    <div className="rounded-md bg-white p-4 shadow transition-all duration-300 ease-in-out dark:bg-zinc-900 dark:text-gray-400">
      {/* Search and Filter Skeletons */}
      <div className="pb-4 md:flex">
        <div className="flex w-full flex-wrap gap-4 md:w-full">
          <div className="h-10 w-full animate-pulse rounded-md bg-gray-200 dark:bg-zinc-800 md:w-72"></div>
          <div className="h-10 w-full animate-pulse rounded-md bg-gray-200 dark:bg-zinc-800 md:w-72"></div>
        </div>
        <div className="mt-4 h-10 w-full md:mt-0 md:w-1/5">
          <div className="h-full animate-pulse rounded-md bg-gray-200 dark:bg-zinc-800"></div>
        </div>
      </div>

      {/* Table Skeleton */}
      <div className="rounded-md border dark:border-zinc-600">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                {[...Array(5)].map((_, index) => (
                  <th key={index} className="p-4">
                    <div className="h-4 animate-pulse rounded bg-gray-200 dark:bg-zinc-800"></div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[...Array(5)].map((_, rowIndex) => (
                <tr key={rowIndex} className="border-t dark:border-zinc-600">
                  {[...Array(5)].map((_, colIndex) => (
                    <td key={colIndex} className="p-4">
                      <div className="h-4 animate-pulse rounded bg-gray-200 dark:bg-zinc-800"></div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="border-t p-4 dark:border-zinc-600">
          <div className="flex items-center justify-between">
            <div className="h-8 w-24 animate-pulse rounded bg-gray-200 dark:bg-zinc-800"></div>
            <div className="flex gap-2">
              {[...Array(3)].map((_, index) => (
                <div
                  key={index}
                  className="h-8 w-8 animate-pulse rounded bg-gray-200 dark:bg-zinc-800"
                ></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SkeletonTable
