import Link from 'next/link'
import { site } from '@/lib/site'
import { cn } from '@/lib/utils'

/** Inline SVG mark — no image request, crisp at every size. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="aqp-drop" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#60b6fa" />
          <stop offset="55%" stopColor="#2579eb" />
          <stop offset="100%" stopColor="#06b6d4" />
        </linearGradient>
      </defs>
      <rect width="40" height="40" rx="12" fill="url(#aqp-drop)" />
      <path
        d="M20 9.5c3.9 4.2 6.6 7.6 6.6 11.3A6.6 6.6 0 0 1 20 27.4a6.6 6.6 0 0 1-6.6-6.6c0-3.7 2.7-7.1 6.6-11.3Z"
        fill="#fff"
        fillOpacity="0.95"
      />
      <path
        d="M16.6 21.4c0 1.9 1.5 3.4 3.4 3.4"
        stroke="#2579eb"
        strokeWidth="1.6"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  )
}

export default function Logo({
  className,
  tone = 'light',
}: {
  className?: string
  tone?: 'light' | 'dark'
}) {
  return (
    <Link
      href="/"
      className={cn('group flex items-center gap-2.5', className)}
      aria-label={`${site.name} — home`}
    >
      <LogoMark className="h-10 w-10 shrink-0 transition-transform duration-300 group-hover:scale-105" />
      <span className="flex flex-col leading-none">
        <span
          className={cn(
            'text-[1.0625rem] font-extrabold tracking-tight',
            tone === 'dark' ? 'text-white' : 'text-ink',
          )}
        >
          Aqua<span className="text-brand-600">Pure</span>
          <span className={tone === 'dark' ? 'text-aqua-300' : 'text-aqua-500'}> UAE</span>
        </span>
        <span
          className={cn(
            'mt-1 text-[0.6875rem] font-medium uppercase tracking-[0.16em]',
            tone === 'dark' ? 'text-brand-200/80' : 'text-ink-muted',
          )}
        >
          Water Filtration
        </span>
      </span>
    </Link>
  )
}
