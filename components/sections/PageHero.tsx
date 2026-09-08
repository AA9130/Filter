import Breadcrumbs, { type Crumb } from '@/components/ui/Breadcrumbs'
import ContactButtons from '@/components/ui/ContactButtons'

/**
 * Compact hero for hub pages, with the breadcrumb trail and the CTA pair.
 *
 * Takes the same `Crumb[]` the page passes to `breadcrumbJsonLd`, so the
 * visible trail and the structured data are built from one array and cannot
 * describe different paths.
 */
export default function PageHero({
  eyebrow,
  title,
  subtitle,
  breadcrumbs,
}: {
  eyebrow: string
  title: string
  subtitle: string
  breadcrumbs: Crumb[]
}) {
  const current = breadcrumbs[breadcrumbs.length - 1]?.name ?? title

  return (
    <section className="relative overflow-hidden bg-hero-radial pb-0 pt-12 sm:pt-16">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-grid-light bg-grid opacity-[0.07]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-20 -top-32 h-96 w-96 rounded-full bg-aqua-500/20 blur-3xl"
      />

      <div className="container-page relative">
        <Breadcrumbs items={breadcrumbs} />

        <div className="mt-7 max-w-3xl">
          <span className="eyebrow-dark">{eyebrow}</span>
          <h1 className="mt-5 text-3xl leading-[1.1] text-white sm:text-4xl lg:text-5xl">{title}</h1>
          <p className="mt-5 text-base leading-relaxed text-brand-100/90 sm:text-lg">{subtitle}</p>

          <ContactButtons
            className="mt-8"
            whatsappMessage={`Hi, I'm looking at your ${current} page. Please share details.`}
          />
        </div>
      </div>

      <div aria-hidden="true" className="pointer-events-none relative -mb-px mt-12">
        <svg viewBox="0 0 1440 60" className="block h-10 w-full" preserveAspectRatio="none">
          <path d="M0 30c240-26 480-26 720 0s480 26 720 0V60H0V30Z" fill="#ffffff" />
        </svg>
      </div>
    </section>
  )
}
