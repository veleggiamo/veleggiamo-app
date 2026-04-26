import type { Metadata } from 'next'
import { Suspense } from 'react'
import { Inter } from 'next/font/google'
import Script from 'next/script'
import { ClerkProvider } from '@clerk/nextjs'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import { Analytics } from '@/components/Analytics'
import { CookieBanner } from '@/components/CookieBanner'
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
          
          {/* GA4 — carica solo dopo consenso utente (GDPR) */}
          {GA4_ID && process.env.NODE_ENV === 'production' && (
            <>
              <Script id="ga4-consent-default" strategy="afterInteractive">
                {`
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('consent', 'default', {
                    analytics_storage: 'denied'
                  });
                  gtag('js', new Date());
                  const consent = localStorage.getItem('cookie_consent');
                  if (consent === 'accepted') {
                    gtag('consent', 'update', { analytics_storage: 'granted' });
                  }
                `}
              </Script>
              <Script
                src={`https://www.googletagmanager.com/gtag/js?id=${GA4_ID}`}
                strategy="afterInteractive"
              />
              <Script id="ga4-init" strategy="afterInteractive">
                {`
                  gtag('config', '${GA4_ID}', { send_page_view: false });
                `}
              </Script>
            </>
          )}

          <Suspense fallback={null}>
            <Analytics />
          </Suspense>

          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
          <Suspense fallback={null}>
            <CookieBanner />
          </Suspense>

        </body>
      </html>
    </ClerkProvider>
  )
}
