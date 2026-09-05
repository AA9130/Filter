import { ShieldCheck } from 'lucide-react'
import { trustBadges } from '@/lib/content'

/**
 * Compliance / certification strip. Duplicated once and animated as a marquee
 * on small screens so all badges are readable without horizontal scrolling.
 */
export default function TrustBar() {
  return (
    <section aria-label="Certifications and compliance" className="border-y border-slate-100 bg-white py-6">
      <div className="container-page">
        <div className="mask-fade-x overflow-hidden">
          <ul className="flex w-max animate-marquee items-center gap-8 md:w-full md:animate-none md:flex-wrap md:justify-center md:gap-x-8 md:gap-y-5 lg:gap-x-12">
            {[...trustBadges, ...trustBadges].map((badge, i) => (
              <li
                key={`${badge.label}-${i}`}
                className={
                  'flex shrink-0 items-center gap-2.5 ' +
                  (i >= trustBadges.length ? 'md:hidden' : '')
                }
              >
                <ShieldCheck className="h-5 w-5 shrink-0 text-eco-500" />
                <span className="flex flex-col leading-tight">
                  <span className="whitespace-nowrap text-sm font-bold text-ink">{badge.label}</span>
                  <span className="whitespace-nowrap text-[0.6875rem] text-ink-muted">
                    {badge.sub}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
