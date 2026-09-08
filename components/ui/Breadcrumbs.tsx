import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

export type Crumb = { name: string; path?: string }

/**
 * The visible breadcrumb trail. Its JSON-LD twin is built by
 * `breadcrumbJsonLd` from the same array, so the markup and the structured data
 * cannot describe different paths — which is what happened when both were
 * written by hand on each page.
 *
 * The last crumb is the current page and is deliberately not a link.
 */
export default function Breadcrumbs({
  items,
  tone = 'dark',
  className,
}: {
  items: Crumb[]
  /** `dark` = on a dark hero. `light` = on a white background. */
  tone?: 'dark' | 'light'
  className?: string
}) {
  const link = tone === 'dark' ? 'hover:text-white text-brand-200' : 'hover:text-brand-700 text-ink-muted'
  const current = tone === 'dark' ? 'text-white' : 'text-ink'

  return (
    <nav aria-label="Breadcrumb" className={className}>
      <ol className={cn('flex flex-wrap items-center gap-1.5 text-xs font-medium', link)}>
        {items.map((item, i) => {
          const isLast = i === items.length - 1
          return (
            <li key={item.name} className="flex items-center gap-1.5">
              {i > 0 && <ChevronRight aria-hidden="true" className="h-3.5 w-3.5 shrink-0 opacity-70" />}
              {isLast || !item.path ? (
                <span className={current} aria-current={isLast ? 'page' : undefined}>
                  {item.name}
                </span>
              ) : (
                <Link href={item.path} className="transition-colors">
                  {item.name}
                </Link>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
