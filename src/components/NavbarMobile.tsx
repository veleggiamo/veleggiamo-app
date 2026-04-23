'use client'
import { useState } from 'react'
import Link from 'next/link'
import { siteConfig } from '@/lib/config/site'

export function NavbarMobile() {
  const [open, setOpen] = useState(false)
  return (
    <div className="md:hidden">
      <button
        onClick={() => setOpen(!open)}
        className="p-2 text-gray-700 hover:text-sky-600"
        aria-label={open ? 'Chiudi menu' : 'Apri menu'}
      >
        {open ? (
          <span className="text-xl font-light">✕</span>
        ) : (
          <div className="space-y-1.5">
            <span className="block w-5 h-0.5 bg-current" />
            <span className="block w-5 h-0.5 bg-current" />
            <span className="block w-5 h-0.5 bg-current" />
          </div>
        )}
      </button>
      {open && (
        <div className="absolute top-16 left-0 right-0 bg-white border-b border-gray-100 px-6 py-4 space-y-4 shadow-sm">
          {siteConfig.nav.map(({ label, href }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className="block text-base font-medium text-gray-700 hover:text-sky-600"
            >
              {label}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
