'use client'
import { useQuery } from '@tanstack/react-query'
import { useSession } from 'next-auth/react'
import UserServices from '@/services/userServices'
import type { Personal } from '@/Types'

export function useCurrentUser() {
  const { data: session, status } = useSession()
  return useQuery<Personal>({
    queryKey: ['currentUser'],
    queryFn: async () => {
      const res = await UserServices.getMe()
      // payload is Personal[] per ResponsePayload<T> — take first element
      const data = Array.isArray(res.payload) ? res.payload[0] : (res.payload as unknown as Personal)
      return data
    },
    enabled: status === 'authenticated' && !!session?.accessToken,
    staleTime: 5 * 60 * 1000, // 5 min cache — profile rarely changes mid-session
  })
}
