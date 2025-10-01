import type { Metadata } from 'next'
import localFont from 'next/font/local'
import './globals.css'
import { SessionProvider } from '@/components/SessionProvider'
import ReduxProvider from '@/provider/reduxProvider'
import { AssessorProvider } from '@/provider/AssessorProvider'

const geistSans = localFont({
  src: './fonts/GeistVF.woff',
  variable: '--font-geist-sans',
  weight: '100 900',
})
const geistMono = localFont({
  src: './fonts/GeistMonoVF.woff',
  variable: '--font-geist-mono',
  weight: '100 900',
})

export const metadata: Metadata = {
  title: 'ระบบประเมินภาระงานบุคลากร',
  description: 'ระบบประเมินภาระงานบุคลากร',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="no-scrollbar scroll-smooth">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ReduxProvider>
          <SessionProvider>
            <AssessorProvider>
              {children}
            </AssessorProvider>
          </SessionProvider>
        </ReduxProvider>
      </body>
    </html>
  )
}
