export default function Form1Skeleton() {
    return (
        <div className="z-10 rounded-md bg-white dark:bg-zinc-900 p-4 mb-28 dark:text-gray-400">
            <div className="animate-pulse">
                <div className="mb-8">
                    <div className="mb-2 h-7 w-full max-w-md mx-auto bg-gray-200 dark:bg-zinc-700 rounded"></div>
                    <div className="mb-4 h-7 w-full max-w-md mx-auto bg-gray-200 dark:bg-zinc-700 rounded"></div>
                    <div className="h-6 w-64 bg-gray-200 dark:bg-zinc-700 rounded"></div>
                </div>

                <div className="w-full">
                    <table className="w-full border-collapse border border-gray-300 dark:border-gray-700">
                        <thead className="bg-gray-50 dark:bg-zinc-900">
                            <tr>
                                {[...Array(8)].map((_, index) => (
                                    <th key={index} className="border border-gray-300 dark:border-gray-700 px-4 py-3">
                                        <div className="h-4 bg-gray-200 dark:bg-zinc-700 rounded"></div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-zinc-900">
                            <tr className="bg-business1">
                                <td colSpan={8} className="border border-gray-300 dark:border-gray-700 px-4 py-3">
                                    <div className="h-5 w-64 bg-white/20 rounded"></div>
                                </td>
                            </tr>

                            <tr className="bg-gray-50 dark:bg-zinc-900">
                                <td colSpan={8} className="border border-gray-300 dark:border-gray-700 px-4 py-2">
                                    <div className="ml-6 h-4 w-48 bg-gray-200 dark:bg-zinc-700 rounded"></div>
                                </td>
                            </tr>

                            {[...Array(3)].map((_, rowIndex) => (
                                <tr key={rowIndex}>
                                    {[...Array(8)].map((_, colIndex) => (
                                        <td key={colIndex} className="border border-gray-300 dark:border-gray-700 px-4 py-2">
                                            {colIndex === 0 ? (
                                                <div className="ml-12 h-4 w-32 bg-gray-200 dark:bg-zinc-700 rounded"></div>
                                            ) : colIndex === 1 ? (
                                                <div className="h-4 w-24 bg-gray-200 dark:bg-zinc-700 rounded"></div>
                                            ) : colIndex === 6 ? (
                                                <div className="mx-auto h-8 w-20 bg-gray-200 dark:bg-zinc-700 rounded"></div>
                                            ) : colIndex === 7 ? (
                                                <div className="h-16 w-full bg-gray-200 dark:bg-zinc-700 rounded"></div>
                                            ) : (
                                                <div className="h-4 w-12 bg-gray-200 dark:bg-zinc-700 rounded mx-auto"></div>
                                            )}
                                        </td>
                                    ))}
                                </tr>
                            ))}

                            <tr className="bg-gray-50 dark:bg-zinc-900">
                                <td colSpan={4} className="border border-gray-300 dark:border-gray-700 px-4 py-2">
                                    <div className="h-4 w-24 bg-gray-200 dark:bg-zinc-700 rounded ml-auto"></div>
                                </td>
                                <td className="border border-gray-300 dark:border-gray-700 px-4 py-2">
                                    <div className="h-4 w-16 bg-gray-200 dark:bg-zinc-700 rounded mx-auto"></div>
                                </td>
                                <td colSpan={3} className="border border-gray-300 dark:border-gray-700 px-4 py-2"></td>
                            </tr>
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
