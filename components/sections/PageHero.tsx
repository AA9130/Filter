import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import ContactButtons from '@/components/ui/ContactButtons'

/** Compact hero used by the inner pages, with breadcrumbs and the CTA pair. */
export default function PageHero({
  eyebrow,
  title,
  subtitle,
  breadcrumb,
}: {
  eyebrow: string
  title: string
  subtitle: string
  breadcrumb: string
}) {
  return (
    <section className="relative overflow-hidden bg-hero-radial pb-16 pt-12 sm:pb-20 sm:pt-16">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-grid-light bg-grid opacity-[0.07]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-20 -top-32 h-96 w-96 rounded-full bg-aqua-500/20 blur-3xl"
      />

      <div className="container-page relative">
        <nav aria-label="Breadcrumb">
          <ol className="flex items-center gap-1.5 text-xs font-medium text-brand-200">
            <li>
              <Link href="/" className="transition-colors hover:text-white">
                Home
              </Link>
            </li>
            <li aria-hidden="true">
              <ChevronRight className="h-3.5 w-3.5" />
            </li>
            <li className="text-white">{breadcrumb}</li>
          </ol>
        </nav>

        <div className="mt-7 max-w-3xl">
          <span className="eyebrow-dark">{eyebrow}</span>
          <h1 className="mt-5 text-3xl leading-[1.1] text-white sm:text-4xl lg:text-5xl">{title}</h1>
          <p className="mt-5 text-base leading-relaxed text-brand-100/90 sm:text-lg">{subtitle}</p>

          <ContactButtons
            className="mt-8"
            whatsappMessage={`Hi, I'm looking at your ${breadcrumb} page. Please share details.`}
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
