import { icon } from '@/lib/icons'
import type { Credential } from '@/lib/content'

/**
 * The trust strip.
 *
 * Every badge here is backed by a claim in content/claims.json and is filtered
 * out at the content seam if that claim is not verified or self-asserted. That
 * is why the strip currently shows operational commitments — coverage, the
 * emergency line, the free water test, fixed written quotes — and not the
 * certification badges the site previously displayed. "NSF / WQA Certified
 * Media", "ESMA Approved" and "Licensed UAE Business" are still in
 * content/credentials.json, waiting on evidence; they will reappear here the
 * moment their claims are verified, with no code change.
 *
 * Renders nothing rather than an empty strip if every claim is unverified.
 */
export default function Credentials({ credentials }: { credentials: Credential[] }) {
  if (credentials.length === 0) return null

  return (
    <section
      aria-label="What you can expect"
      className="border-y border-slate-100 bg-white py-6"
    >
      <div className="container-page">
        <div className="mask-fade-x overflow-hidden">
          <ul className="flex w-max animate-marquee items-center gap-8 md:w-full md:animate-none md:flex-wrap md:justify-center md:gap-x-8 md:gap-y-5 lg:gap-x-10">
            {/* Duplicated only for the small-screen marquee, and hidden from
                assistive tech and from desktop, so the content is announced once. */}
            {[...credentials, ...credentials].map((credential, i) => {
              const Icon = icon(credential.icon)
              const isClone = i >= credentials.length
              return (
                <li
                  key={`${credential.claimId}-${i}`}
                  aria-hidden={isClone || undefined}
                  className={'flex shrink-0 items-center gap-2.5 ' + (isClone ? 'md:hidden' : '')}
                >
                  <Icon aria-hidden="true" className="h-5 w-5 shrink-0 text-eco-500" />
                  <span className="flex flex-col leading-tight">
                    <span className="whitespace-nowrap text-sm font-bold text-ink">
                      {credential.label}
                    </span>
                    <span className="whitespace-nowrap text-[0.6875rem] text-ink-muted">
                      {credential.sub}
                    </span>
                  </span>
                </li>
              )
            })}
          </ul>
        </div>
      </div>
    </section>
  )
}
