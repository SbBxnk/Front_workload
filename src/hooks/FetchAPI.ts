'use client'

import axios from 'axios'
import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'

interface FetchResult<T> {
  data: T | null
  loading: boolean
  error: Error | null
  setData: React.Dispatch<React.SetStateAction<T | null>>
  postData: (body: Partial<T>) => Promise<{ data: T } | undefined>
  putData: (id: string, body: Partial<T>) => Promise<void>
  deleteData: (id: string) => Promise<void>
}

const useFetchData = <T>(endpoint: string): FetchResult<T> => {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<Error | null>(null)
  const { data: session } = useSession()
  const getToken = session?.accessToken

  useEffect(() => {
    const fetchData = async () => {
      const token = getToken
      if (!token) {
        setError(new Error('ไม่มี token เพื่อทำการเชื่อมต่อ'))
        return
      }

      try {
        setLoading(true)
        const response = await axios.get<{ data: T }>(
          `${process.env.NEXT_PUBLIC_API}${endpoint}`,
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
          }
        )

        setData(response.data.data)
      } catch (error) {
        if (axios.isAxiosError(error)) {
          setError(
            new Error(
              error.response?.data?.message || 'ไม่สามารถเชื่อมต่อกับข้อมูลได้'
            )
          )
        } else {
          setError(new Error('เกิดข้อผิดพลาด'))
        }
        console.error('เกิดข้อผิดพลาดในการเชื่อมต่อข้อมูล:', error)
      } finally {
        setLoading(false)
      }
    }

    if (session?.accessToken) {
      fetchData()
    }
  }, [endpoint, session?.accessToken])

  // ฟังก์ชัน create
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
      console.log(error)
      setError(new Error('POST ไม่สำเร็จ'))
      throw error // เพิ่ม throw เพื่อให้ component ที่เรียกใช้งานสามารถ handle error ได้
    } finally {
      setLoading(false)
    }
  }

  // ฟังก์ชัน Update
  const putData = async (id: string, body: Partial<T>) => {
    const token = getToken
    if (!token) {
      setError(new Error('ไม่มี token'))
      return
    }

    try {
      setLoading(true)
      await axios.put(`${process.env.NEXT_PUBLIC_API}${endpoint}/${id}`, body, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      })
      setData((prev) => (prev ? { ...prev, ...body } : prev))
    } catch (error) {
      console.log(error)
      setError(new Error('PUT ไม่สำเร็จ'))
    } finally {
      setLoading(false)
    }
  }

  // ฟังก์ชัน Delete
  const deleteData = async (id: string) => {
    const token = getToken
    if (!token) {
      setError(new Error('ไม่มี token'))
      return
    }

    try {
      setLoading(true)
      await axios.delete(`${process.env.NEXT_PUBLIC_API}${endpoint}/${id}`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      })

      setData(null)
    } catch (error) {
      setError(new Error('DELETE ไม่สำเร็จ'))
      console.log(error)
    } finally {
      setLoading(false)
    }
  }

  return { data, setData, loading, error, postData, putData, deleteData }
}

export default useFetchData
