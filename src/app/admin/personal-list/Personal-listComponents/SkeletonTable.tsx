import React from 'react'

function SkeletonTable() {
  return (
<div className="bg-white p-4 rounded-md shadow dark:bg-zinc-900 dark:text-gray-400 transition-all duration-300 ease-in-out">
            {/* Search and Filter Skeletons */}
            <div className="pb-4 md:flex">
                <div className="flex flex-wrap gap-4 w-full md:w-full">
                    <div className="w-full md:w-72 h-10 bg-gray-200 dark:bg-zinc-800 rounded-md animate-pulse"></div>
                    <div className="w-full md:w-72 h-10 bg-gray-200 dark:bg-zinc-800 rounded-md animate-pulse"></div>
                </div>
                <div className="w-full md:w-1/5 h-10 mt-4 md:mt-0">
                    <div className="h-full bg-gray-200 dark:bg-zinc-800 rounded-md animate-pulse"></div>
                </div>
            </div>

            {/* Table Skeleton */}
            <div className="border rounded-md dark:border-zinc-600">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr>
                                {[...Array(5)].map((_, index) => (
                                    <th key={index} className="p-4">
                                        <div className="h-4 bg-gray-200 dark:bg-zinc-800 rounded animate-pulse"></div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {[...Array(5)].map((_, rowIndex) => (
                                <tr key={rowIndex} className="border-t dark:border-zinc-600">
                                    {[...Array(5)].map((_, colIndex) => (
                                        <td key={colIndex} className="p-4">
                                            <div className="h-4 bg-gray-200 dark:bg-zinc-800 rounded animate-pulse"></div>
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="p-4 border-t dark:border-zinc-600">
                    <div className="flex justify-between items-center">
                        <div className="w-24 h-8 bg-gray-200 dark:bg-zinc-800 rounded animate-pulse"></div>
                        <div className="flex gap-2">
                            {[...Array(3)].map((_, index) => (
                                <div key={index} className="w-8 h-8 bg-gray-200 dark:bg-zinc-800 rounded animate-pulse"></div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
  )
}

export default SkeletonTable