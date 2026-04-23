import Link from 'next/link'
import { siteConfig } from '@/lib/config/site'
import { NavbarLinks } from './NavbarLinks'
import { NavbarMobile } from './NavbarMobile'

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-100">
      <nav className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="font-bold text-xl text-sky-600 tracking-tight">
          {siteConfig.name}
        </Link>
        <NavbarLinks className="hidden md:flex items-center gap-8" />
        <NavbarMobile />
      </nav>
    </header>
  )
}
