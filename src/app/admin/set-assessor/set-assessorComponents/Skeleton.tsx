"use client"

export default function SkeletonLoading() {
  return (
    <div className="bg-white p-4 rounded-md shadow dark:bg-zinc-900 dark:text-gray-400 transition-all duration-300 ease-in-out">
      {/* Search and Filter Section Skeleton */}
      <div className="py-4 md:flex">
        <div className="flex flex-wrap gap-4 w-full md:w-full">
          {/* Search Input Skeleton */}
          <div className="relative flex items-center w-full md:w-52">
            <div className="w-full h-10 rounded-md bg-gray-200 dark:bg-zinc-800 animate-pulse"></div>
          </div>
          {/* Filter Dropdown Skeleton */}
          <div className="relative w-full md:w-52">
            <div className="w-full h-10 rounded-md bg-gray-200 dark:bg-zinc-800 animate-pulse"></div>
          </div>
        </div>
        {/* Add Button Skeleton */}
        <div className="w-full md:w-auto pt-4 md:pt-0">
          <div className="w-full md:w-52 h-10 rounded-md bg-gray-200 dark:bg-zinc-800 animate-pulse"></div>
        </div>
      </div>

      {/* Table Skeleton */}
      <div className="border rounded-md dark:border-zinc-600 transition-all duration-300 ease-in-out">
        <div className="overflow-x-auto">
          <table className="w-full overflow-x-auto md:table-auto">
            {/* Table Header Skeleton */}
            <thead className="bg-gray-100 dark:bg-zinc-800 transition-all duration-300 ease-in-out">
              <tr>
                <td className="p-4 border border-gray-300 dark:border-zinc-600 border-opacity-40">
                  <div className="h-5 bg-gray-200 dark:bg-zinc-700 rounded animate-pulse"></div>
                </td>
                <td className="p-4 border border-gray-300 dark:border-zinc-600 border-opacity-40">
                  <div className="h-5 bg-gray-200 dark:bg-zinc-700 rounded animate-pulse"></div>
                </td>
                <td colSpan={3} className="p-4 border border-gray-300 dark:border-zinc-600 border-opacity-40">
                  <div className="h-5 bg-gray-200 dark:bg-zinc-700 rounded animate-pulse"></div>
                </td>
                <td className="p-4 sticky right-0 bg-gray-100 dark:bg-zinc-800 border border-gray-300 dark:border-zinc-600 border-opacity-40">
                  <div className="h-5 bg-gray-200 dark:bg-zinc-700 rounded animate-pulse"></div>
                </td>
              </tr>
            </thead>
            {/* Table Body Skeleton */}
            <tbody className="bg-white dark:bg-zinc-900 divide-y divide-gray-200 dark:divide-zinc-600">
              {[...Array(5)].map((_, index) => (
                <tr key={index} className="hover:bg-gray-50 dark:hover:bg-zinc-800">
                  <td className="p-4 border border-gray-300 dark:border-zinc-600 border-opacity-40">
                    <div className="h-5 w-5 mx-auto bg-gray-200 dark:bg-zinc-700 rounded animate-pulse"></div>
                  </td>
                  <td className="p-4 border border-gray-300 dark:border-zinc-600 border-opacity-40">
                    <div className="h-5 w-full bg-gray-200 dark:bg-zinc-700 rounded animate-pulse"></div>
                  </td>
                  <td className="p-4 border border-gray-300 dark:border-zinc-600 border-opacity-40">
                    <div className="h-5 w-32 bg-gray-200 dark:bg-zinc-700 rounded animate-pulse"></div>
                  </td>
                  <td className="p-4 text-center border border-gray-300 dark:border-zinc-600 border-opacity-40">
                    <div className="h-5 w-8 mx-auto bg-gray-200 dark:bg-zinc-700 rounded animate-pulse"></div>
                  </td>
                  <td className="p-4 border border-gray-300 dark:border-zinc-600 border-opacity-40">
                    <div className="h-5 w-32 bg-gray-200 dark:bg-zinc-700 rounded animate-pulse"></div>
                  </td>
                  <td className="p-4 sticky right-0 bg-white dark:bg-zinc-900 border border-gray-300 dark:border-zinc-600 border-opacity-40">
                    <div className="flex justify-center gap-2">
                      <div className="h-6 w-6 bg-gray-200 dark:bg-zinc-700 rounded animate-pulse"></div>
                      <div className="h-6 w-6 bg-gray-200 dark:bg-zinc-700 rounded animate-pulse"></div>
                      <div className="h-6 w-6 bg-gray-200 dark:bg-zinc-700 rounded animate-pulse"></div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Skeleton */}
        <div className="p-4 flex justify-between items-center">
          <div className="h-8 w-20 bg-gray-200 dark:bg-zinc-700 rounded animate-pulse"></div>
          <div className="flex gap-2">
            {[...Array(3)].map((_, index) => (
              <div key={index} className="h-8 w-8 bg-gray-200 dark:bg-zinc-700 rounded animate-pulse"></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

