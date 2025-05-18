import React from 'react'

function page() {
    return (
        <div className="overflow-x-auto">
            <table className="min-w-full">
                <thead className="bg-gray-800 text-white">
                    <tr>
                        <th className="px-4 py-2">หัวข้อ 1</th>
                        <th className="px-4 py-2">หัวข้อ 2</th>
                        <th className="px-4 py-2">หัวข้อ 3</th>
                        <th className="px-4 py-2">หัวข้อ 4</th>
                        <th className="px-4 py-2">หัวข้อ 4</th>
                        <th className="px-4 py-2">หัวข้อ 4</th>
                        <th className="px-4 py-2">หัวข้อ 4</th>

                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td className="px-4 py-2">ข้อมูล 1</td>
                        <td className="px-4 py-2">ข้อมูล 2</td>
                        <td className="px-4 py-2">ข้อมูล 3</td>
                        <td className="px-4 py-2">ข้อมูล 4</td>
                        <td className="px-4 py-2">ข้อมูล 4</td>
                        <td className="px-4 py-2">ข้อมูล 4</td>
                        <td className="px-4 py-2">ข้อมูล 4</td>
                    </tr>
                </tbody>
            </table>
        </div>

    )
}

export default page