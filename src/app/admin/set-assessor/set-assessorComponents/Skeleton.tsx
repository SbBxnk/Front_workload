'use client'

export default function SkeletonLoading() {
  return (
    <div className="rounded-md bg-white p-4 shadow transition-all duration-300 ease-in-out dark:bg-zinc-900 dark:text-gray-400">
      {/* Search and Filter Section Skeleton */}
      <div className="py-4 md:flex">
        <div className="flex w-full flex-wrap gap-4 md:w-full">
          {/* Search Input Skeleton */}
          <div className="relative flex w-full items-center md:w-52">
            <div className="h-10 w-full animate-pulse rounded-md bg-gray-200 dark:bg-zinc-800"></div>
          </div>
          {/* Filter Dropdown Skeleton */}
          <div className="relative w-full md:w-52">
            <div className="h-10 w-full animate-pulse rounded-md bg-gray-200 dark:bg-zinc-800"></div>
          </div>
        </div>
        {/* Add Button Skeleton */}
        <div className="w-full pt-4 md:w-auto md:pt-0">
          <div className="h-10 w-full animate-pulse rounded-md bg-gray-200 dark:bg-zinc-800 md:w-52"></div>
        </div>
      </div>

      {/* Table Skeleton */}
      <div className="rounded-md border transition-all duration-300 ease-in-out dark:border-zinc-600">
        <div className="overflow-x-auto">
          <table className="w-full overflow-x-auto md:table-auto">
            {/* Table Header Skeleton */}
            <thead className="bg-gray-100 transition-all duration-300 ease-in-out dark:bg-zinc-800">
              <tr>
                <td className="border border-gray-300 border-opacity-40 p-4 dark:border-zinc-600">
                  <div className="h-5 animate-pulse rounded bg-gray-200 dark:bg-zinc-700"></div>
                </td>
                <td className="border border-gray-300 border-opacity-40 p-4 dark:border-zinc-600">
                  <div className="h-5 animate-pulse rounded bg-gray-200 dark:bg-zinc-700"></div>
                </td>
                <td
                  colSpan={3}
                  className="border border-gray-300 border-opacity-40 p-4 dark:border-zinc-600"
                >
                  <div className="h-5 animate-pulse rounded bg-gray-200 dark:bg-zinc-700"></div>
                </td>
                <td className="sticky right-0 border border-gray-300 border-opacity-40 bg-gray-100 p-4 dark:border-zinc-600 dark:bg-zinc-800">
                  <div className="h-5 animate-pulse rounded bg-gray-200 dark:bg-zinc-700"></div>
                </td>
              </tr>
            </thead>
            {/* Table Body Skeleton */}
            <tbody className="divide-y divide-gray-200 bg-white dark:divide-zinc-600 dark:bg-zinc-900">
              {[...Array(5)].map((_, index) => (
                <tr
                  key={index}
                  className="hover:bg-gray-50 dark:hover:bg-zinc-800"
                >
                  <td className="border border-gray-300 border-opacity-40 p-4 dark:border-zinc-600">
                    <div className="mx-auto h-5 w-5 animate-pulse rounded bg-gray-200 dark:bg-zinc-700"></div>
                  </td>
                  <td className="border border-gray-300 border-opacity-40 p-4 dark:border-zinc-600">
                    <div className="h-5 w-full animate-pulse rounded bg-gray-200 dark:bg-zinc-700"></div>
                  </td>
                  <td className="border border-gray-300 border-opacity-40 p-4 dark:border-zinc-600">
                    <div className="h-5 w-32 animate-pulse rounded bg-gray-200 dark:bg-zinc-700"></div>
                  </td>
                  <td className="border border-gray-300 border-opacity-40 p-4 text-center dark:border-zinc-600">
                    <div className="mx-auto h-5 w-8 animate-pulse rounded bg-gray-200 dark:bg-zinc-700"></div>
                  </td>
                  <td className="border border-gray-300 border-opacity-40 p-4 dark:border-zinc-600">
                    <div className="h-5 w-32 animate-pulse rounded bg-gray-200 dark:bg-zinc-700"></div>
                  </td>
                  <td className="sticky right-0 border border-gray-300 border-opacity-40 bg-white p-4 dark:border-zinc-600 dark:bg-zinc-900">
                    <div className="flex justify-center gap-2">
                      <div className="h-6 w-6 animate-pulse rounded bg-gray-200 dark:bg-zinc-700"></div>
                      <div className="h-6 w-6 animate-pulse rounded bg-gray-200 dark:bg-zinc-700"></div>
                      <div className="h-6 w-6 animate-pulse rounded bg-gray-200 dark:bg-zinc-700"></div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Skeleton */}
        <div className="flex items-center justify-between p-4">
          <div className="h-8 w-20 animate-pulse rounded bg-gray-200 dark:bg-zinc-700"></div>
          <div className="flex gap-2">
            {[...Array(3)].map((_, index) => (
              <div
                key={index}
                className="h-8 w-8 animate-pulse rounded bg-gray-200 dark:bg-zinc-700"
              ></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
