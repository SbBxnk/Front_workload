// types/next-auth.d.ts
import type { Session as NextAuthSession } from 'next-auth'
import type { JWT as NextAuthJWT } from 'next-auth/jwt'

// ขยาย Session interface ของ NextAuth
declare module 'next-auth' {
  interface Session extends NextAuthSession {
    accessToken?: string
    refreshToken?: string
    expiredAt?: string
    user: {
      id?: string
      name?: string
      email?: string
      image?: string
      role?: string
      features?: Record<string, unknown> // หรือกำหนด type ที่เฉพาะเจาะจงมากขึ้น
    }
  }

  interface User {
    id?: string
    name?: string
    email?: string
    image?: string
    role?: string
    accessToken?: string
    refreshToken?: string
    expiredAt?: string
    features?: Record<string, unknown>
  }
}

// ขยาย JWT interface ของ NextAuth
declare module 'next-auth/jwt' {
  interface JWT extends NextAuthJWT {
    id?: string
    role?: string
    accessToken?: string
    refreshToken?: string
    expiredAt?: string
    features?: Record<string, unknown>
  }
}
