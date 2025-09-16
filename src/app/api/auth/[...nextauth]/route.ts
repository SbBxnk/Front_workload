import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { NextAuthOptions } from 'next-auth'
import { jwtDecode } from 'jwt-decode'
import AuthService from '@/services/authService'

// Define the decoded token interface
interface DecodedToken {
  level_name: string
  id: number
  user_email: string
  user_name: string
  iat: number
  exp: number
}

const authOptions: NextAuthOptions = {
  debug: process.env.NODE_ENV === 'development',
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
     

        if (!credentials?.email || !credentials?.password) {
          console.log('NextAuth: Missing credentials')
          return null
        }

        try {
          const result = await AuthService.SignIn({
            email: credentials.email,
            password: credentials.password,
          })


          if (result?.status === "ok" && result?.token) {
            const decodedToken: DecodedToken = jwtDecode(result.token)

            const user = {
              id: decodedToken.id.toString(),
              email: decodedToken.user_email,
              name: decodedToken.user_name,
              role: decodedToken.level_name,
              accessToken: result.token,
            }

            console.log('NextAuth: Returning user:', user)
            return user
          }

          console.log('NextAuth: Authentication failed - invalid credentials')
          return null
        } catch (error) {
          console.error('NextAuth: Authentication error:', error)
          return null
        }
      },
    }),
  ],
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async redirect({ url, baseUrl }) {
      console.log(
        'NextAuth: Redirect callback - url:',
        url,
        'baseUrl:',
        baseUrl
      )

      // If URL is provided and it's relative, use it
      if (url && url.startsWith('/')) {
        return `${baseUrl}${url}`
      }

      // If URL is provided and it's same origin, use it
      if (url && new URL(url).origin === baseUrl) {
        return url
      }

      // Always redirect to redirect page first
      return `${baseUrl}/auth/redirect`
    },
    async jwt({ token, user }) {
      console.log('NextAuth: JWT callback - user:', user, 'token:', token)
      if (user) {
        token.accessToken = (user as any).accessToken
        token.role = (user as any).role
      }
      return token
    },
    async session({ session, token }) {
      console.log(
        'NextAuth: Session callback - session:',
        session,
        'token:',
        token
      )
      if (token && session.user) {
        session.accessToken = token.accessToken
        session.user.role = token.role
      }
      return session
    },
  },
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 24 hours
    updateAge: 0, // Update session on every request
  },
  secret: process.env.NEXTAUTH_SECRET,
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
