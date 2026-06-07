'use client'
import { Plus } from 'lucide-react'

export default function SubtaskFormSkeleton() {
  return (
    <div className="animate-pulse">
      {/* Header skeleton */}
      <div className="rounded-t-lg bg-white p-4 shadow-lg dark:bg-zinc-900">
        <div className="space-y-6">
          {/* Title skeleton */}
          <div className="h-8 w-64 bg-gray-200 rounded dark:bg-zinc-700"></div>

          {/* Form items skeleton */}
          <div className="space-y-4">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="border-l-4 border-gray-200 bg-gray-50 p-4 shadow-sm dark:border-zinc-700 dark:bg-zinc-800"
              >
                {/* Form header skeleton */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <div className="h-5 w-5 bg-gray-200 rounded mr-2 dark:bg-zinc-700"></div>
                    <div className="h-6 w-48 bg-gray-200 rounded dark:bg-zinc-700"></div>
                  </div>
                  <div className="h-5 w-5 bg-gray-200 rounded dark:bg-zinc-700"></div>
                </div>

                {/* Form content skeleton */}
                <div className="ml-4 grid grid-cols-1 gap-2 rounded-xl bg-gray-50 dark:bg-gray-800 md:grid-cols-3">
                  <div className="grid gap-2 md:col-span-2">
                    {/* Description skeleton */}
                    <div className="rounded-lg bg-white p-4 dark:bg-gray-900">
                      <div className="h-4 w-16 bg-gray-200 rounded mb-2 dark:bg-zinc-700"></div>
                      <div className="h-4 w-full bg-gray-200 rounded dark:bg-zinc-700"></div>
                    </div>

                    {/* Workload and Quality skeleton */}
                    <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                      <div className="rounded-lg bg-white p-4 dark:bg-gray-900">
                        <div className="h-4 w-16 bg-gray-200 rounded mb-2 dark:bg-zinc-700"></div>
                        <div className="h-4 w-8 bg-gray-200 rounded dark:bg-zinc-700"></div>
                      </div>
                      <div className="rounded-lg bg-white p-4 dark:bg-gray-900">
                        <div className="h-4 w-12 bg-gray-200 rounded mb-2 dark:bg-zinc-700"></div>
                        <div className="h-4 w-8 bg-gray-200 rounded dark:bg-zinc-700"></div>
                      </div>
                    </div>

                    {/* Total workload skeleton */}
                    <div className="rounded-lg bg-white p-4 dark:bg-gray-900">
                      <div className="h-4 w-20 bg-gray-200 rounded mb-2 dark:bg-zinc-700"></div>
                      <div className="h-6 w-8 bg-gray-200 rounded dark:bg-zinc-700"></div>
                    </div>
                  </div>

                  {/* Evidence file skeleton */}
                  <div className="h-full">
                    <div className="flex flex-col gap-4 h-full rounded-lg bg-white p-4 dark:bg-gray-900">
                      <div className="">
                        <div className="h-4 w-20 bg-gray-200 rounded mb-2 dark:bg-zinc-700"></div>
                        <div className="space-y-2">
                          <div className="flex items-center">
                            <div className="h-5 w-5 bg-gray-200 rounded mr-2 dark:bg-zinc-700"></div>
                            <div className="h-4 w-32 bg-gray-200 rounded dark:bg-zinc-700"></div>
                          </div>
                        </div>
                      </div>
                      <div className="">
                        <div className="h-4 w-20 bg-gray-200 rounded mb-2 dark:bg-zinc-700"></div>
                        <div className="space-y-2">
                          <div className="flex items-center">
                            <div className="h-5 w-5 bg-gray-200 rounded mr-2 dark:bg-zinc-700"></div>
                            <div className="h-4 w-32 bg-gray-200 rounded dark:bg-zinc-700"></div>
                          </div>
                        </div>
                      </div>
                      <div className="">
                        <div className="h-4 w-20 bg-gray-200 rounded mb-2 dark:bg-zinc-700"></div>
                        <div className="space-y-2">
                          <div className="flex items-center">
                            <div className="h-5 w-5 bg-gray-200 rounded mr-2 dark:bg-zinc-700"></div>
                            <div className="h-4 w-32 bg-gray-200 rounded dark:bg-zinc-700"></div>
                          </div>
                        </div>
                      </div>
                      <div className="">
                        <div className="h-4 w-20 bg-gray-200 rounded mb-2 dark:bg-zinc-700"></div>
                        <div className="space-y-2">
                          <div className="flex items-center">
                            <div className="h-5 w-5 bg-gray-200 rounded mr-2 dark:bg-zinc-700"></div>
                            <div className="h-4 w-32 bg-gray-200 rounded dark:bg-zinc-700"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom section skeleton */}
      <div className="sticky bottom-0 flex w-full flex-col justify-end gap-4 rounded-b-lg bg-white p-4 shadow-lg dark:bg-zinc-900">
        <div className="bg-gray-100 rounded-lg px-4 py-3 dark:bg-zinc-700">
          <div className="h-5 w-48 bg-gray-200 rounded dark:bg-zinc-600"></div>
        </div>
        <label
          htmlFor={`modal-forminfo`}
          className="inline-flex w-full cursor-pointer items-center justify-center rounded-lg border border-gray-300 py-2.5 text-sm font-medium text-gray-600 transition-colors duration-150 hover:border-gray-400 hover:text-gray-700 dark:border-zinc-600 dark:bg-zinc-800 dark:text-gray-400 dark:hover:border-zinc-500"
        >
          <Plus className="mr-2 h-4 w-4" />
          เพิ่มรายละเอียดภาระงาน
        </label>
      </div>
    </div>
  )
}
