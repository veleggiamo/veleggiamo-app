import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Script from 'next/script'
import { ClerkProvider } from '@clerk/nextjs'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import { Analytics } from '@/components/Analytics'
import { siteConfig } from '@/lib/config/site'
import './globals.css'

const GA4_ID = process.env.NEXT_PUBLIC_GA4_ID

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  metadataBase: new URL('https://veleggiamo.com'),
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.tagline,
  openGraph: {
    images: [siteConfig.defaultOgImage],
    siteName: siteConfig.name,
    locale: 'it_IT',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="it" className={inter.variable}>
        <body className="min-h-screen flex flex-col font-sans antialiased">
          {GA4_ID && (
            <>
              <Script
                src={`https://www.googletagmanager.com/gtag/js?id=${GA4_ID}`}
                strategy="afterInteractive"
              />
              <Script id="ga4-init" strategy="afterInteractive">{`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${GA4_ID}', { send_page_view: false });
              `}</Script>
            </>
          )}
          <Analytics />
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </body>
      </html>
    </ClerkProvider>
  )
}
