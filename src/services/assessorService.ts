import axios from 'axios'

export interface AssessorData {
  isAssessor: boolean
  assessorId?: number
  roundListId?: number
  lastChecked: number
}

export interface CheckAssessorResponse {
  status: boolean
  data?: {
    assessor_id: number
    round_list_id: number
  }
}

class AssessorService {
  private static readonly STORAGE_KEY = 'assessor_data'
  private static readonly CACHE_DURATION = 5 * 60 * 1000 // 5 minutes
  private static pendingRequests = new Map<string, Promise<AssessorData>>()

  /**
   * ตรวจสอบว่า user เป็น assessor หรือไม่
   * @param userId - ID ของ user
   * @param accessToken - Access token สำหรับ authentication
   * @returns Promise<AssessorData>
   */
  static async checkAssessor(userId: number, accessToken: string): Promise<AssessorData> {
    try {
      const headers = {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      }

      const response = await axios.get<CheckAssessorResponse>(
        `${process.env.NEXT_PUBLIC_API}/check_assessor/${userId}`,
        { headers }
      )

      const assessorData: AssessorData = {
        isAssessor: response.data.status,
        assessorId: response.data.data?.assessor_id,
        roundListId: response.data.data?.round_list_id,
        lastChecked: Date.now(),
      }

      // เก็บข้อมูลใน session storage
      this.saveToSessionStorage(assessorData)
      
      return assessorData
    } catch (error) {
      console.error('Error checking assessor status:', error)
      
      // ถ้าเกิด error ให้ return default data
      const defaultData: AssessorData = {
        isAssessor: false,
        lastChecked: Date.now(),
      }
      
      this.saveToSessionStorage(defaultData)
      return defaultData
    }
  }

  /**
   * ดึงข้อมูล assessor จาก session storage
   * @returns AssessorData | null
   */
  static getFromSessionStorage(): AssessorData | null {
    if (typeof window === 'undefined') return null

    try {
      const stored = sessionStorage.getItem(this.STORAGE_KEY)
      if (!stored) return null

      const data: AssessorData = JSON.parse(stored)
      
      // ตรวจสอบว่า cache หมดอายุหรือไม่
      if (Date.now() - data.lastChecked > this.CACHE_DURATION) {
        this.clearSessionStorage()
        return null
      }

      return data
    } catch (error) {
      console.error('Error reading from session storage:', error)
      return null
    }
  }

  /**
   * เก็บข้อมูล assessor ใน session storage
   * @param data - ข้อมูล assessor
   */
  static saveToSessionStorage(data: AssessorData): void {
    if (typeof window === 'undefined') return

    try {
      sessionStorage.setItem(this.STORAGE_KEY, JSON.stringify(data))
    } catch (error) {
      console.error('Error saving to session storage:', error)
    }
  }

  /**
   * ลบข้อมูล assessor จาก session storage
   */
  static clearSessionStorage(): void {
    if (typeof window === 'undefined') return

    try {
      sessionStorage.removeItem(this.STORAGE_KEY)
    } catch (error) {
      console.error('Error clearing session storage:', error)
    }
  }

  /**
   * ตรวจสอบและดึงข้อมูล assessor (ใช้ cache ถ้ามี)
   * @param userId - ID ของ user
   * @param accessToken - Access token สำหรับ authentication
   * @param forceRefresh - บังคับให้ refresh ข้อมูลใหม่
   * @returns Promise<AssessorData>
   */
  static async getAssessorData(
    userId: number, 
    accessToken: string, 
    forceRefresh: boolean = false
  ): Promise<AssessorData> {
    const requestKey = `${userId}-${forceRefresh}`
    
    // ตรวจสอบว่ามี request ที่กำลังดำเนินการอยู่หรือไม่
    if (this.pendingRequests.has(requestKey)) {
      console.log('Request already in progress, waiting for result...')
      return await this.pendingRequests.get(requestKey)!
    }

    // ถ้าไม่บังคับ refresh และมีข้อมูลใน cache ให้ใช้ cache
    if (!forceRefresh) {
      const cachedData = this.getFromSessionStorage()
      if (cachedData) {
        return cachedData
      }
    }

    // สร้าง request ใหม่และเก็บไว้ใน pendingRequests
    const requestPromise = this.checkAssessor(userId, accessToken)
    this.pendingRequests.set(requestKey, requestPromise)

    try {
      const result = await requestPromise
      return result
    } finally {
      // ลบ request ออกจาก pendingRequests เมื่อเสร็จสิ้น
      this.pendingRequests.delete(requestKey)
    }
  }

  /**
   * ตรวจสอบว่า user เป็น assessor หรือไม่ (ใช้ cache)
   * @param userId - ID ของ user
   * @param accessToken - Access token สำหรับ authentication
   * @returns Promise<boolean>
   */
  static async isUserAssessor(userId: number, accessToken: string): Promise<boolean> {
    const data = await this.getAssessorData(userId, accessToken)
    return data.isAssessor
  }
}

export default AssessorService
