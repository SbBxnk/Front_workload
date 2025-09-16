import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const { pathname } = req.nextUrl

    console.log(
      'Middleware: Checking path:',
      pathname,
      'token:',
      !!token,
      'role:',
      token?.role
    )

    // If no token and not on login page, redirect to login
    if (!token && pathname !== '/login') {
      console.log('Middleware: No token, redirecting to login')
      return NextResponse.redirect(new URL('/login', req.url))
    }

    // If no token and on login page, allow access
    if (!token && pathname === '/login') {
      console.log('Middleware: No token on login page, allowing access')
      return NextResponse.next()
    }

    // Check if user is trying to access admin routes
    if (pathname.startsWith('/admin')) {
      if (token && token.role !== 'ผู้ดูแลระบบ') {
        console.log(
          'Middleware: Wrong role for admin, redirecting to appropriate page'
        )
        // Redirect to appropriate page based on user role
        if (token.role === 'ผู้ใช้งานทั่วไป') {
          return NextResponse.redirect(new URL('/user', req.url))
        } else if (token.role === 'ผู้ประเมินภาระงาน') {
          return NextResponse.redirect(new URL('/assessor', req.url))
        } else if (token.role === 'เลขาณุการ') {
          return NextResponse.redirect(new URL('/secretary', req.url))
        } else {
          return NextResponse.redirect(new URL('/login', req.url))
        }
      }
    }

    // Check if user is trying to access user routes
    if (pathname.startsWith('/user')) {
      if (token && token.role !== 'ผู้ใช้งานทั่วไป') {
        console.log(
          'Middleware: Wrong role for user, redirecting to appropriate page'
        )
        // Redirect to appropriate page based on user role
        if (token.role === 'ผู้ดูแลระบบ') {
          return NextResponse.redirect(new URL('/admin', req.url))
        } else if (token.role === 'ผู้ประเมินภาระงาน') {
          return NextResponse.redirect(new URL('/assessor', req.url))
        } else if (token.role === 'เลขาณุการ') {
          return NextResponse.redirect(new URL('/secretary', req.url))
        } else {
          return NextResponse.redirect(new URL('/login', req.url))
        }
      }
    }

    // Check if user is trying to access assessor routes
    if (pathname.startsWith('/assessor')) {
      if (token && token.role !== 'ผู้ประเมินภาระงาน') {
        console.log(
          'Middleware: Wrong role for assessor, redirecting to appropriate page'
        )
        // Redirect to appropriate page based on user role
        if (token.role === 'ผู้ดูแลระบบ') {
          return NextResponse.redirect(new URL('/admin', req.url))
        } else if (token.role === 'ผู้ใช้งานทั่วไป') {
          return NextResponse.redirect(new URL('/user', req.url))
        } else if (token.role === 'เลขาณุการ') {
          return NextResponse.redirect(new URL('/secretary', req.url))
        } else {
          return NextResponse.redirect(new URL('/login', req.url))
        }
      }
    }

    // Check if user is trying to access secretary routes
    if (pathname.startsWith('/secretary')) {
      if (token && token.role !== 'เลขาณุการ') {
        console.log(
          'Middleware: Wrong role for secretary, redirecting to appropriate page'
        )
        // Redirect to appropriate page based on user role
        if (token.role === 'ผู้ดูแลระบบ') {
          return NextResponse.redirect(new URL('/admin', req.url))
        } else if (token.role === 'ผู้ใช้งานทั่วไป') {
          return NextResponse.redirect(new URL('/user', req.url))
        } else if (token.role === 'ผู้ประเมินภาระงาน') {
          return NextResponse.redirect(new URL('/assessor', req.url))
        } else {
          return NextResponse.redirect(new URL('/login', req.url))
        }
      }
    }

    console.log('Middleware: Access allowed')
    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl

        console.log(
          'Middleware: authorized callback - path:',
          pathname,
          'hasToken:',
          !!token
        )

        // Allow access to login page always
        if (pathname === '/login') {
          return true
        }

        // Allow access to public pages
        if (
          pathname === '/' ||
          pathname === '/register' ||
          pathname === '/test-auth' ||
          pathname === '/auth/redirect'
        ) {
          return true
        }

        // Require authentication for protected routes
        return !!token
      },
    },
  }
)

export const config = {
  matcher: [
    '/admin/:path*',
    '/user/:path*',
    '/assessor/:path*',
    '/secretary/:path*',
  ],
}
