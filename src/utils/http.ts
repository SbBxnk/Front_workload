import { BASE_URL_API } from '@/provider/config'
import axios, { type AxiosResponse } from 'axios'
import { getSession } from 'next-auth/react'

// ฟังก์ชันสำหรับล้าง NextAuth cookies
export const clearNextAuthCookies = () => {
  if (typeof window === 'undefined') return

  const cookies = [
    '_Secure-next-auth.session-token',
    '_Secure-next-auth.callback-url',
    '_Host-next-auth.csrf-token',
  ]

  cookies.forEach((cookieName) => {
    document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; secure; samesite=lax;`
  })
}

// ฟังก์ชันสำหรับตรวจสอบขนาด cookie
export const checkCookieSize = () => {
  if (typeof window === 'undefined') return { totalSize: 0, cookies: {} }

  const cookies = document.cookie.split(';')
  let totalSize = 0
  const cookieSizes: Record<string, number> = {}

  cookies.forEach((cookie) => {
    const [cookieName, value] = cookie.trim().split('=')
    if (cookieName && value) {
      const size = encodeURIComponent(value).length
      cookieSizes[cookieName] = size
      totalSize += size
    }
  })

  // ตรวจสอบ cookie ที่มีขนาดใหญ่ (เกิน 4KB)
  const largeCookies = Object.entries(cookieSizes)
    .filter(([, size]) => size > 4096)
    .map(([cookieName, size]) => ({ name: cookieName, size }))

  if (largeCookies.length > 0) {
    console.warn('Large cookies detected:', largeCookies)
  }

  return { totalSize, cookies: cookieSizes, largeCookies }
}

// ฟังก์ชันสำหรับล้าง cookie ที่มีขนาดใหญ่
export const clearLargeCookies = () => {
  if (typeof window === 'undefined') return

  const { largeCookies } = checkCookieSize()

  if (largeCookies && largeCookies.length > 0) {
    largeCookies.forEach(({ name }) => {
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`
      console.log(`Cleared large cookie: ${name}`)
    })
  }
}

const checkError = (error: unknown) => {
  if (error) {
    // ตรวจสอบ error code 431 (Request Header Fields Too Large)
    if ((error as any).response?.status === 431) {
      console.error('Request Header Fields Too Large - clearing cookies')
      clearNextAuthCookies()
      // Redirect ไปหน้า login
      if (typeof window !== 'undefined') {
        window.location.href = '/login'
        return Promise.reject(new Error('Session expired - please login again'))
      }
    }

    // ไม่ทำการ redirect อัตโนมัติเมื่อได้ 401; ให้ผู้เรียกจัดการเอง
    // เดิม: มีการเปลี่ยนหน้าไป /login ทำให้ refresh แล้วเด้งหน้า login
    return Promise.reject(error)
  }
  return Promise.reject(new Error('Network timeout'))
}

const onSuccessRequest = (response: AxiosResponse) => response.data
const onSuccessRequestServer = (response: AxiosResponse) => response.data

export const server = axios.create({
  baseURL: BASE_URL_API,
  timeout: 30000,
})

server.interceptors.request.use(async (config) => {
  config.headers['Accept-Language'] = 'en'

  return config
})

export const client = axios.create({
  baseURL: BASE_URL_API,
  timeout: 60000, // เพิ่ม timeout เป็น 60 วินาที
  maxContentLength: 10 * 1024 * 1024, // 10MB
  maxBodyLength: 10 * 1024 * 1024, // 10MB
})

client.interceptors.request.use(async (config) => {
  if (typeof window === 'undefined') {
    return config
  }

  // มองข้าม path ไม่ใช้ auth header
  const ignorePaths = ['/register-activity', '/register-activity/check-in']
  if (ignorePaths.includes(window.location.pathname)) {
    return config
  }

  try {
    // ตรวจสอบขนาด cookie ก่อนส่ง request
    const { totalSize, largeCookies } = checkCookieSize()

    // ถ้า cookie มีขนาดใหญ่เกินไป (เกิน 8KB) ให้ล้าง
    if (totalSize > 8192 || (largeCookies && largeCookies.length > 0)) {
      console.warn('Large cookies detected before request, clearing...')
      clearNextAuthCookies()
      // Redirect ไปหน้า login
      window.location.href = '/login'
      return Promise.reject(new Error('Session expired - please login again'))
    }

    // ถ้ามีการตั้งค่า Authorization ไว้จากผู้เรียกอยู่แล้ว จะไม่เขียนทับ
    const hasAuthorizationHeader = Boolean(
      config.headers &&
        (config.headers as Record<string, string>)['Authorization']
    )

    if (!hasAuthorizationHeader) {
      const session = await getSession()
      if (session?.accessToken) {
        config.headers['Authorization'] = `Bearer ${session.accessToken}`
      }
    }

    // เพิ่ม Accept-Language header จาก localStorage
    const selectedLanguage = 'en'
    config.headers['Accept-Language'] = selectedLanguage

    // สำหรับ FormData requests ให้ให้ axios จัดการ Content-Type เอง
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type']
    }
  } catch (error) {
    console.error('Error setting request headers:', error)
  }

  return config
})

server.interceptors.response.use(onSuccessRequestServer, checkError)
client.interceptors.response.use(onSuccessRequest, checkError)

export default client
