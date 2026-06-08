export default function Form2Skeleton() {
    return (
        <div className="z-10 rounded-md bg-white dark:bg-zinc-900 p-4 mb-28 dark:text-gray-400">
            <div className="animate-pulse">
                <div className="mb-8">
                    <div className="mb-2 h-7 w-full max-w-md mx-auto bg-gray-200 dark:bg-zinc-700 rounded"></div>
                    <div className="mb-4 h-7 w-full max-w-md mx-auto bg-gray-200 dark:bg-zinc-700 rounded"></div>
                    <div className="h-6 w-80 bg-gray-200 dark:bg-zinc-700 rounded"></div>
                </div>

                <div className="w-full">
                    <table className="w-full border-collapse border border-gray-300 dark:border-gray-700">
                        <thead className="bg-gray-50 dark:bg-zinc-900">
                            <tr>
                                {[...Array(6)].map((_, index) => (
                                    <th key={index} className="border border-gray-300 dark:border-gray-700 px-4 py-3">
                                        <div className="h-4 bg-gray-200 dark:bg-zinc-700 rounded"></div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-zinc-900">
                            {[...Array(5)].map((_, rowIndex) => (
                                <tr key={rowIndex}>
                                    <td className="border border-gray-300 dark:border-gray-700 px-4 py-2">
                                        <div className="h-4 w-8 bg-gray-200 dark:bg-zinc-700 rounded mx-auto"></div>
                                    </td>
                                    <td className="border border-gray-300 dark:border-gray-700 px-4 py-2">
                                        <div className="h-4 w-32 bg-gray-200 dark:bg-zinc-700 rounded"></div>
                                    </td>
                                    <td className="border border-gray-300 dark:border-gray-700 px-4 py-2">
                                        <div className="h-4 w-12 bg-gray-200 dark:bg-zinc-700 rounded mx-auto"></div>
                                    </td>
                                    <td className="border border-gray-300 dark:border-gray-700 px-4 py-2">
                                        <div className="mx-auto h-8 w-20 bg-gray-200 dark:bg-zinc-700 rounded"></div>
                                    </td>
                                    <td className="border border-gray-300 dark:border-gray-700 px-4 py-2">
                                        <div className="mx-auto h-8 w-20 bg-gray-200 dark:bg-zinc-700 rounded"></div>
                                    </td>
                                    <td className="border border-gray-300 dark:border-gray-700 px-4 py-2">
                                        <div className="h-16 w-full bg-gray-200 dark:bg-zinc-700 rounded"></div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="mt-6 rounded-lg bg-white dark:bg-zinc-900">
                    <div className="mb-3 h-5 w-32 bg-gray-200 dark:bg-zinc-700 rounded"></div>
                    <div className="h-24 w-full bg-gray-200 dark:bg-zinc-700 rounded"></div>
                </div>
            </div>
        </div>
    )
}
