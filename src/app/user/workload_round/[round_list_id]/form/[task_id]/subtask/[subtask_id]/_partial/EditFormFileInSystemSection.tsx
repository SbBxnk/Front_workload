'use client'

interface EditFormFileInSystemSectionProps {
  fileName: string
  setFileName: (value: string) => void
  fileInSystem: string
  setFileInSystem: (value: string) => void
}

export default function EditFormFileInSystemSection({
  fileName,
  setFileName,
  fileInSystem,
  setFileInSystem,
}: EditFormFileInSystemSectionProps) {
  return (
    <>
      <div className="mb-4">
        <input
          type="text"
          placeholder="ชื่อที่ต้องการแสดง"
          value={fileName}
          onChange={(e) => setFileName(e.target.value)}
          className="w-full rounded-md border-2 border-gray-300 px-4 py-2 text-sm font-light text-gray-600 transition-all duration-300 ease-in-out focus:border-blue-500 focus:outline-none dark:border-zinc-600 dark:bg-zinc-800 dark:text-gray-400"
        />
      </div>
      <input
        name="workload_file"
        type="text"
        placeholder="Enter file path or ID"
        value={fileInSystem}
        onChange={(e) => setFileInSystem(e.target.value)}
        className="w-full rounded-md border-2 border-gray-300 px-4 py-2 text-sm font-light text-gray-600 transition-all duration-300 ease-in-out focus:border-blue-500 focus:outline-none dark:border-zinc-600 dark:bg-zinc-800 dark:text-gray-400"
      />
    </>
  )
}
