export const BASE_URL_API = process.env.NEXT_PUBLIC_API || 'http://localhost:3333'
// origin ของเซิร์ฟเวอร์ (ตัด /api ออก) สำหรับโหลดไฟล์/รูปอัปโหลด เช่น <img src> หรือรูปใน PDF
export const BASE_URL_FILE =
  process.env.NEXT_PUBLIC_API?.replace('/api', '') || 'http://localhost:3333'
export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || ''
export const NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET || 'your-secret-key'
