import { useState } from 'react'
import axios from 'axios'
import { useSession } from 'next-auth/react'

interface FetchResult<T> {
  data: T | null
  loading: boolean
  error: Error | null
  postData: (body: Partial<T>) => Promise<{ data: T } | undefined>
}

const usePostData = <T>(endpoint: string): FetchResult<T> => {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<Error | null>(null)
  const { data: session } = useSession()
  const getToken = session?.accessToken

  const postData = async (body: Partial<T>) => {
    const token = getToken
    if (!token) {
      setError(new Error('ไม่มี token'))
      return
    }

    try {
      setLoading(true)
      const response = await axios.post<{ data: T }>(
        `${process.env.NEXT_PUBLIC_API}/${endpoint}`,
        body,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      )
      setData(response.data.data)
      return response.data
    } catch (error) {
      setError(new Error('POST ไม่สำเร็จ'))
      throw error
    } finally {
      setLoading(false)
    }
  }

  return { data, loading, error, postData }
}

export default usePostData
