'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { siteConfig } from '@/lib/config/site'
import { cn } from '@/lib/utils'

export function NavbarLinks({ className }: { className?: string }) {
  const pathname = usePathname()
  return (
    <ul className={className}>
      {siteConfig.nav.map(({ label, href }) => (
        <li key={href}>
          <Link
            href={href}
            className={cn(
              'text-sm font-medium transition-colors hover:text-sky-600',
              pathname.startsWith(href)
                ? 'text-sky-600 underline underline-offset-4 decoration-sky-300'
                : 'text-gray-700'
            )}
          >
            {label}
          </Link>
        </li>
      ))}
    </ul>
  )
}
