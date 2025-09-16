import type React from 'react'
import { ChevronDown } from 'lucide-react'
import useFetchData from '@/hooks/FetchAPI'
import { Prefix } from '@/Types'
interface SelectPreifx {
  prefix_id: number
  prefix_name: string
  openDropdown: string | null
  setOpenDropdown: React.Dispatch<React.SetStateAction<string | null>>
  prefixDropdownRef: React.RefObject<HTMLDivElement>
  setSelectPrefix: React.Dispatch<React.SetStateAction<string | null>>
  selectPrefix: string | null
  handleOnChangePrefix: (prefix_id: number, prefix_name: string) => void
}

function SelectCoruse({
  openDropdown,
  setOpenDropdown,
  prefixDropdownRef,
  handleOnChangePrefix,
  selectPrefix,
  setSelectPrefix,
}: SelectPreifx) {
  const { data: prefixs, error } = useFetchData<Prefix[]>('/prefix?')

  const handleSelectPrefix = (prefix_id: number, prefix_name: string) => {
    // ส่งค่า id และชื่อไปยัง handleOnChangePrefix
    handleOnChangePrefix(prefix_id, prefix_name)

    // อัพเดท selectPrefix เพื่อแสดงชื่อในปุ่ม
    setSelectPrefix(prefix_name)

    // ปิด dropdown
    setOpenDropdown(null)
  }

  return (
    <div>
      <label className="font-regular mb-2 block text-sm text-gray-600 dark:text-gray-400">
        เลือกคำนำหน้า
      </label>
      <div className="z-5 relative" ref={prefixDropdownRef}>
        <button
          type="button"
          onClick={() =>
            setOpenDropdown(openDropdown === 'prefix' ? null : 'prefix')
          }
          className="flex w-full items-center justify-between rounded-md border-2 border-gray-300 bg-white px-4 py-2 text-sm font-light text-gray-600 transition-all transition-colors duration-300 ease-in-out focus:border-blue-500 focus:outline-none dark:border-zinc-600 dark:bg-zinc-800 dark:text-gray-400"
        >
          {selectPrefix === null ? 'เลือกคำนำหน้า' : selectPrefix}
          <ChevronDown
            className={`h-4 w-4 text-gray-600 transition-transform duration-200 dark:text-zinc-600 ${openDropdown === 'prefix' ? 'rotate-180' : ''}`}
          />
        </button>
        {openDropdown === 'prefix' && (
          <div className="absolute z-10 mt-2 max-h-36 w-full overflow-y-auto rounded-md border-2 border-gray-300 bg-white shadow-lg dark:border-zinc-600 dark:bg-zinc-900">
            {prefixs?.map((prefix) => (
              <div
                key={prefix.prefix_id} // ใช้ prefix_id เป็น key
                className="cursor-pointer px-4 py-2 text-sm font-light text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-zinc-800"
                onClick={() =>
                  handleSelectPrefix(prefix.prefix_id, prefix.prefix_name)
                }
              >
                {prefix.prefix_name}
              </div>
            ))}
          </div>
        )}
      </div>
      {error && (
        <div className="mt-2 text-red-500">
          เกิดข้อผิดพลาดในการเชื่อมต่อข้อมูล
        </div>
      )}
    </div>
  )
}

export default SelectCoruse
