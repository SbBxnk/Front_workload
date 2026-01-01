import React from 'react'

interface Section4Props {
    userName?: string | null
    evaluatorName?: string | null
}

function Section4({ userName = null, evaluatorName = null }: Section4Props) {
    return (
        <div>
            <p className="text-md mb-2 font-normal text-gray-800 dark:text-gray-200">
                ส่วนที่ 4 : แผนพัฒนาการปฏิบัติราชการรายบุคคล
            </p>

            <div className="w-full overflow-x-auto">
                <table className="min-w-[640px] w-full border-collapse border border-gray-300 dark:border-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-800">
                        <tr>
                            <th className="w-2/5 border border-gray-300 dark:border-gray-700 px-3 py-2 text-center text-sm font-normal text-gray-700 dark:text-gray-300">
                                ความรู้/ทักษะ/สมรรถนะที่ต้องได้รับการพัฒนา
                            </th>
                            <th className="w-1/4 border border-gray-300 dark:border-gray-700 px-3 py-2 text-center text-sm font-normal text-gray-700 dark:text-gray-300">
                                วิธีการพัฒนา
                            </th>
                            <th className="w-1/3 border border-gray-300 dark:border-gray-700 px-3 py-2 text-center text-sm font-normal text-gray-700 dark:text-gray-300">
                                ช่วงเวลาที่ต้องการพัฒนา
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-zinc-900">
                        {/* ไม่มีข้อมูลในตาราง */}
                        <tr>
                            <td className="border border-gray-300 dark:border-gray-700 px-3 py-20 text-start text-sm font-light text-gray-800 dark:text-gray-200" />
                            <td className="border border-gray-300 dark:border-gray-700 px-3 py-20 text-start text-sm font-light text-gray-800 dark:text-gray-200" />
                            <td className="border border-gray-300 dark:border-gray-700 px-3 py-20 text-start text-sm font-light text-gray-800 dark:text-gray-200" />
                        </tr>
                    </tbody>
                </table>
            </div>

            {/* ส่วนที่ 10: ความเห็นเพิ่มเติมของผู้ประเมิน */}
            <div className="w-full mt-6">


                <div className="border border-gray-300 dark:border-gray-700 bg-white dark:bg-zinc-900 space-y-4">
                    <div className="bg-gray-50 border-b border-gray-300 dark:border-gray-700 dark:bg-zinc-900 p-3 mb-3">
                        <p className="text-sm font-light text-gray-800 dark:text-gray-200">
                            (10) ความเห็นเพิ่มเติมของผู้ประเมิน (ระบุข้อมูลเมื่อสิ้นรอบการประเมิน)
                        </p>
                    </div>
                    <div className="p-3">
                        <p className="text-sm font-light text-gray-800 dark:text-gray-200 mb-2">
                            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; 1) จุดเด่น และ/หรือ สิ่งที่ควรปรับปรุงแก้ไข
                        </p>
                        <div className="space-y-1">
                            <div className="border-b border-dotted border-gray-500 dark:border-gray-400 pb-1 min-h-[1.5rem]" />
                            <div className="border-b border-dotted border-gray-500 dark:border-gray-400 pb-1 min-h-[1.5rem]" />
                        </div>
                    </div>

                    <div className="p-3">
                        <p className="text-sm font-light text-gray-800 dark:text-gray-200 mb-2">
                            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; 2) ข้อเสนอแนะเกี่ยวกับวิธีส่งเสริมและพัฒนา
                        </p>
                        <div className="space-y-1">
                            <div className="border-b border-dotted border-gray-500 dark:border-gray-400 pb-1 min-h-[1.5rem]" />
                            <div className="border-b border-dotted border-gray-500 dark:border-gray-400 pb-1 min-h-[1.5rem]" />
                        </div>
                    </div>
                </div>
            </div>

            {/* ส่วนที่ 11: ลายมือชื่อและวันที่ (สิ้นรอบการประเมิน) */}
            <div className="w-full mt-6">

                <div className="border border-gray-300 dark:border-gray-700 bg-white dark:bg-zinc-900">
                    <div className="bg-gray-50 border-b border-gray-300 dark:border-gray-700 dark:bg-zinc-900 p-3 mb-3">
                        <p className="text-sm font-light text-gray-800 dark:text-gray-200 mb-1">
                            (11) ผู้ประเมินและผู้รับการประเมินได้ตกลงร่วมกันและเห็นพ้องกันแล้ว (ระบุข้อมูล (1) - (10) ให้ครบ)
                        </p>
                        <p className="text-sm font-light text-gray-800 dark:text-gray-200 text-left">
                            จึงลงลายมือชื่อไว้เป็นหลักฐาน (ลงนามเมื่อสิ้นรอบการประเมิน)
                        </p>
                    </div>
                    <div className="grid grid-cols-2 divide-x divide-gray-300 dark:divide-gray-600">
                        {/* คอลัมน์ซ้าย - ผู้ประเมิน */}
                        <div className="p-3 space-y-3">
                            <div>
                                <p className="text-sm font-light text-gray-800 dark:text-gray-200 mb-1">
                                    ลายมือชื่อ
                                </p>
                                <div className="relative border-b-2 border-dotted border-gray-500 dark:border-gray-400 pb-1 min-h-[1.5rem] "></div>
                                <p className="text-xs text-center font-light text-gray-600 dark:text-gray-400 mt-0.5">
                                    (ผู้ประเมิน)
                                </p>
                            </div>
                            <div className="flex items-baseline gap-1.5 mt-3">
                                <span className="text-sm font-light text-gray-800 dark:text-gray-200 whitespace-nowrap">วันที่</span>
                                <div className="relative border-b border-dotted border-gray-500 dark:border-gray-400 flex-1 pb-0.5 min-h-[1.2rem]">
                                </div>
                                <span className="text-sm font-light text-gray-800 dark:text-gray-200 whitespace-nowrap ml-1">เดือน</span>
                                <div className="relative border-b border-dotted border-gray-500 dark:border-gray-400 flex-1 pb-0.5 min-h-[1.2rem]">
                                </div>
                                <span className="text-sm font-light text-gray-800 dark:text-gray-200 whitespace-nowrap ml-1">พ.ศ.</span>
                                <div className="relative border-b border-dotted border-gray-500 dark:border-gray-400 flex-1 pb-0.5 min-h-[1.2rem]">
                                </div>
                            </div>
                        </div>

                        {/* คอลัมน์ขวา - ผู้รับการประเมิน */}
                        <div className="p-3 space-y-3">
                        <div>
                                <p className="text-sm font-light text-gray-800 dark:text-gray-200 mb-1">
                                    ลายมือชื่อ
                                </p>
                                <div className="relative border-b-2 border-dotted border-gray-500 dark:border-gray-400 pb-1 min-h-[1.5rem] ">
                                    {userName && (
                                        <span className="text-sm font-light text-gray-800 dark:text-gray-200 absolute left-1/2 -translate-x-1/2 bottom-1">
                                            {userName}
                                        </span>
                                    )}
                                </div>
                                <p className="text-xs text-center font-light text-gray-600 dark:text-gray-400 mt-0.5">
                                    (ผู้รับการประเมิน)
                                </p>
                            </div>
                            <div className="flex items-baseline gap-1.5 mt-3">
                                <span className="text-sm font-light text-gray-800 dark:text-gray-200 whitespace-nowrap">วันที่</span>
                                <div className="relative border-b border-dotted border-gray-500 dark:border-gray-400 flex-1 pb-0.5 min-h-[1.2rem]">
                                </div>
                                <span className="text-sm font-light text-gray-800 dark:text-gray-200 whitespace-nowrap ml-1">เดือน</span>
                                <div className="relative border-b border-dotted border-gray-500 dark:border-gray-400 flex-1 pb-0.5 min-h-[1.2rem]">
                                </div>
                                <span className="text-sm font-light text-gray-800 dark:text-gray-200 whitespace-nowrap ml-1">พ.ศ.</span>
                                <div className="relative border-b border-dotted border-gray-500 dark:border-gray-400 flex-1 pb-0.5 min-h-[1.2rem]">
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Section4

