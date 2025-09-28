import React from 'react'
import { PiNewspaperClippingBold } from 'react-icons/pi'

interface DeleteModalProps {
  currentData: {
    u_id: number
    prefix_name: string
    u_fname: string
    u_lname: string
  }[]
  isLoading: boolean
  handleDeletePost: (e: React.MouseEvent, userId: number, userName: string) => void
}
export default function DeletePersonalModal({
  currentData,
  isLoading,
  handleDeletePost,
}: DeleteModalProps) {
  return (
    <>
      {!isLoading ? (
        <>
          {currentData.map(
            (item, u_id: number) =>
              !isLoading && (
                <div key={u_id} className="relative z-[100]">
                  <input
                    type="checkbox"
                    id={`modal-delete${item.u_id}`}
                    className="modal-toggle"
                  />
                  <div className="modal" role={`modal-delete${item.u_id}`}>
                    <div className="modal-box rounded-md dark:bg-zinc-800">
                      <div className="flex items-center">
                        <PiNewspaperClippingBold className="mr-2 h-7 w-7 text-business1 dark:text-blue-500/80" />
                        <h3 className="font-regular flex truncate text-start text-2xl text-gray-600 dark:text-gray-400">
                          ยืนยันการลบข้อมูล&nbsp;
                          <span className="truncate font-semibold text-business1 dark:text-blue-500/80">
                            {item.prefix_name}
                            {item.u_fname} {item.u_lname}
                          </span>
                        </h3>
                      </div>
                      <p className="font-regular text-wrap py-8 text-start text-lg text-gray-500">
                        เมื่อยืนยันการลบข้อมูลนี้
                        ข้อมูลจะไม่สามารถกลับมาแก้ไขได้ คุณแน่ใจหรือไม่?
                      </p>
                      <div className="flex justify-end gap-4">
                        <label
                          htmlFor={`modal-delete${item.u_id}`}
                          className="text-md z-50 flex w-20 cursor-pointer items-center justify-center rounded-md  border-gray-200 bg-gray-200 px-4 py-2 text-gray-600 transition duration-300 ease-in-out hover:border-gray-300 hover:bg-gray-300 dark:border-zinc-700 dark:bg-zinc-700 dark:text-gray-400 dark:hover:border-zinc-600 dark:hover:bg-zinc-600"
                        >
                          ยกเลิก
                        </label>
                        <button
                          onClick={(e) => handleDeletePost(e, item.u_id, item.prefix_name + item.u_fname + item.u_lname)}
                          className="text-md flex h-10 w-20 items-center justify-center text-nowrap rounded-md bg-red-500 px-4 text-white transition duration-300 ease-in-out hover:bg-red-500/80"
                        >
                          ยืนยัน
                        </button>


                      </div>
                    </div>
                    <label
                      className="modal-backdrop"
                      htmlFor={`modal-delete${item.u_id}`}
                    >
                      Close
                    </label>
                  </div>
                </div>
              )
          )}
        </>
      ) : null}
    </>
  )
}
