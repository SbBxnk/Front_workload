import { CircleHelp } from "lucide-react"
import { useState, useEffect } from "react"
import type React from "react"

interface EditModalProps {
    isLoading: boolean
    ex_position_id: number
    ex_position_name: string
    handleEdit: (
        e: React.FormEvent<HTMLFormElement> | React.MouseEvent,
        ex_position_id: number,
        updatedPrefixName: string
    ) => void
}

export default function EditModal({
    isLoading,
    ex_position_id,
    ex_position_name,
    handleEdit,
}: EditModalProps) {
    const [editedExPosition, setEditedExPosition] = useState(ex_position_name)
    useEffect(() => {
        setEditedExPosition(ex_position_name)
    }, [ex_position_name])

    if (isLoading) return null

    return (
        <div className="relative z-[100]">
            <input type="checkbox" id={`modal-edit${ex_position_id}`} className="modal-toggle" />
            <div className="modal" role={`modal-edit${ex_position_id}`}>
                <div className="modal-box rounded-md dark:bg-zinc-800">
                    <form onSubmit={(e) => { e.preventDefault(); handleEdit(e, ex_position_id, editedExPosition) }}>
                        <div className="flex items-center">
                            <CircleHelp className="text-business1 dark:text-blue-500/80 mr-2 w-7 h-7" />
                            <h3 className="flex text-2xl font-regular truncate text-start text-gray-600 dark:text-gray-400">
                                แก้ไขตำแหน่งวิชาการ&nbsp;
                                <span className="font-semibold text-business1 truncate dark:text-blue-500/80">
                                    {ex_position_name}
                                </span>
                            </h3>
                        </div>
                        <div className="py-4">
                            <label className="block text-sm font-regular text-gray-600 dark:text-gray-400 mb-2">
                                ตำแหน่งวิชาการ
                            </label>
                            <input
                                name="ex_position_name"
                                value={editedExPosition}
                                onChange={(e) => setEditedExPosition(e.target.value)}
                                type="text"
                                className="w-full px-4 py-2 font-light rounded-md text-sm border-2 border-gray-300 dark:border-zinc-600 text-gray-600 dark:bg-zinc-800 dark:text-gray-400 focus:outline-none focus:border-blue-500 transition-colors transition-all duration-300 ease-in-out"
                                placeholder="กรุณากรอกตำแหน่งวิชาการ"
                            />
                        </div>
                        <div className="flex justify-end gap-4">
                            <button
                                type="submit"
                                className="w-20 bg-yellow-500 flex items-center justify-center text-md text-white rounded-md py-2 px-4 hover:bg-yellow-500/80 transition ease-in-out duration-300 text-nowrap"
                            >
                                บันทึก
                            </button>
                            <label
                                htmlFor={`modal-edit${ex_position_id}`}
                                className="z-50 w-20 border border-2 border-gray-200 flex items-center justify-center bg-gray-200 text-md text-gray-600 rounded-md py-2 px-4 hover:bg-gray-300 hover:border-gray-300 dark:bg-zinc-700 dark:text-gray-400 dark:hover:bg-zinc-600 dark:hover:border-zinc-600 dark:border-zinc-700 transition ease-in-out duration-300 cursor-pointer"
                            >
                                ยกเลิก
                            </label>
                        </div>
                    </form>
                </div>
                <label className="modal-backdrop" htmlFor={`modal-edit${ex_position_id}`}>
                    Close
                </label>
            </div>
        </div>
    )
}
