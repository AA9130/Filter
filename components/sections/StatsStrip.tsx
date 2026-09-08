import Reveal from '@/components/ui/Reveal'
import AnimatedCounter from '@/components/ui/AnimatedCounter'
import type { PublishedStat } from '@/lib/content'

/**
 * Verified figures only.
 *
 * `getPublishedStats()` returns the stats whose claims are verified — which is
 * currently none, so this renders nothing at all. That is the intended
 * behaviour, not a placeholder: an unevidenced customer count is worse than an
 * absent one, and a zeroed one is worse again.
 *
 * Verify `customers_served`, `average_rating`, `review_count` or
 * `years_in_business` in content/claims.json and the strip appears, with no
 * code change.
 */
export default function StatsStrip({ stats }: { stats: PublishedStat[] }) {
  if (stats.length === 0) return null

  return (
    <Reveal delay={0.1}>
      <dl className="mt-5 grid grid-cols-2 gap-4 rounded-3xl border border-brand-100 bg-white p-6 shadow-soft">
        {stats.map((stat) => (
          <div key={stat.claimId} className="text-center">
            <dd className="text-2xl font-extrabold text-gradient-brand sm:text-3xl">
              <AnimatedCounter value={stat.value} />
            </dd>
            <dt className="mt-1 text-xs font-medium uppercase tracking-wide text-ink-muted">
              {stat.label}
            </dt>
          </div>
        ))}
      </dl>
    </Reveal>
  )
}
