import { useSession } from 'next-auth/react'

const useAuthHeaders = () => {
  const { data: session } = useSession()
  const token = session?.accessToken || null

  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  }
}

export default useAuthHeaders
