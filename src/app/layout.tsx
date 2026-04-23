import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { ClerkProvider } from '@clerk/nextjs'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import { siteConfig } from '@/lib/config/site'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.tagline,
  openGraph: {
    images: [siteConfig.defaultOgImage],
    siteName: siteConfig.name,
    locale: 'it_IT',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="it" className={inter.variable}>
        <body className="min-h-screen flex flex-col font-sans antialiased">
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </body>
      </html>
    </ClerkProvider>
  )
}
