'use client'

import { useState } from 'react'
import {
  QueryClient,
  QueryClientProvider,
  type QueryClientConfig,
} from '@tanstack/react-query'

interface ReactQueryProviderProps {
  children: React.ReactNode
}

// ค่า default ของทั้งแอป — ปรับที่เดียวมีผลทุก useQuery/useMutation
const queryConfig: QueryClientConfig = {
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // ถือว่า fresh 1 นาที ลดการ refetch ซ้ำ
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
}

export default function ReactQueryProvider({
  children,
}: ReactQueryProviderProps) {
  // สร้าง QueryClient ครั้งเดียวต่อ client (กันสร้างใหม่ทุก render ใน App Router)
  const [queryClient] = useState(() => new QueryClient(queryConfig))

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}
