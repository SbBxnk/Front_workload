export default function UserLoading() {
  return (
    <div className="rounded-md bg-white p-4 shadow dark:bg-zinc-900">
      <div className="mb-6 h-6 w-44 animate-pulse rounded bg-gray-200 dark:bg-zinc-700" />

      <div className="mb-3 flex items-center gap-3">
        <div className="h-9 w-52 animate-pulse rounded-lg bg-gray-200 dark:bg-zinc-700" />
        <div className="h-9 w-28 animate-pulse rounded-lg bg-gray-200 dark:bg-zinc-700" />
      </div>

      <div className="overflow-hidden rounded-lg border border-gray-100 dark:border-zinc-700">
        <div className="flex gap-4 border-b border-gray-100 bg-gray-50 px-4 py-3 dark:border-zinc-700 dark:bg-zinc-800">
          {[40, 120, 96, 80, 64].map((w, i) => (
            <div
              key={i}
              className="h-4 animate-pulse rounded bg-gray-200 dark:bg-zinc-700"
              style={{ width: w }}
            />
          ))}
        </div>

        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="flex gap-4 border-b border-gray-100 px-4 py-3 last:border-0 dark:border-zinc-700"
          >
            {[40, 120, 96, 80, 64].map((w, j) => (
              <div
                key={j}
                className="h-4 animate-pulse rounded bg-gray-100 dark:bg-zinc-800"
                style={{ width: w }}
              />
            ))}
          </div>
        ))}
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div className="h-4 w-32 animate-pulse rounded bg-gray-100 dark:bg-zinc-800" />
        <div className="flex gap-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-8 w-8 animate-pulse rounded-full bg-gray-100 dark:bg-zinc-800" />
          ))}
        </div>
      </div>
    </div>
  )
}
