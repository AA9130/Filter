import Link from 'next/link'
import {
  Phone,
  MessageCircle,
  Mail,
  MapPin,
  Clock,
  Facebook,
  Instagram,
  Linkedin,
  Youtube,
  ShieldCheck,
} from 'lucide-react'
import { LogoMark } from '@/components/ui/Logo'
import { site, navLinks, whatsappLink } from '@/lib/site'
import type { Business, Credential, Service, Location } from '@/lib/content'

const socialIcons = { facebook: Facebook, instagram: Instagram, linkedin: Linkedin, youtube: Youtube }

export default function Footer({
  business,
  services,
  locations,
  credentials,
}: {
  business: Business
  services: Pick<Service, 'slug' | 'title'>[]
  locations: Pick<Location, 'name' | 'slug'>[]
  credentials: Credential[]
}) {
  const year = new Date().getFullYear()
  // `business.social` has already been filtered to real profile URLs at the
  // content seam — a bare `https://facebook.com/` never reaches here, because it
  // identifies Facebook rather than AquaPure. With none configured, the row of
  // icons simply does not render.
  const socials = business.social
    .filter((entry) => entry.platform in socialIcons)
    .map((entry) => ({
      href: entry.url,
      label: entry.platform.charAt(0).toUpperCase() + entry.platform.slice(1),
      icon: socialIcons[entry.platform as keyof typeof socialIcons],
    }))

  return (
    <footer className="relative overflow-hidden bg-brand-950 text-brand-100">
      {/* Ambient water glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-32 top-0 h-72 w-72 rounded-full bg-aqua-500/10 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-20 bottom-0 h-80 w-80 rounded-full bg-brand-600/20 blur-3xl"
      />

      <div className="container-page relative py-14 lg:py-20">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-8">
          {/* Brand + contact */}
          <div className="lg:col-span-4">
            <Link href="/" className="flex items-center gap-2.5" aria-label={`${site.name} home`}>
              <LogoMark className="h-11 w-11" />
              <span className="flex flex-col leading-none">
                <span className="text-lg font-extrabold tracking-tight text-white">
                  Aqua<span className="text-aqua-300">Pure</span> UAE
                </span>
                <span className="mt-1 text-[0.6875rem] font-medium uppercase tracking-[0.16em] text-brand-300">
                  Water Filtration
                </span>
              </span>
            </Link>

            <p className="mt-5 max-w-sm text-sm leading-relaxed text-brand-200/85">
              {business.tagline} — installation, maintenance, repair and Annual Maintenance Contracts
              for homes and businesses across all seven Emirates. Trained technicians, genuine
              parts, 24-hour emergency support.
            </p>

            <div className="mt-6 space-y-3">
              <a
                href={site.phone.href}
                data-analytics="call-click-footer"
                className="group flex items-center gap-3 text-sm font-semibold text-white transition-colors hover:text-aqua-300"
              >
                <span className="grid h-9 w-9 place-items-center rounded-lg bg-white/10 transition-colors group-hover:bg-cta-500">
                  <Phone className="h-4 w-4" />
                </span>
                {site.phone.display}
              </a>
              <a
                href={whatsappLink()}
                target="_blank"
                rel="noopener noreferrer"
                data-analytics="whatsapp-click-footer"
                className="group flex items-center gap-3 text-sm font-semibold text-white transition-colors hover:text-whatsapp"
              >
                <span className="grid h-9 w-9 place-items-center rounded-lg bg-white/10 transition-colors group-hover:bg-whatsapp">
                  <MessageCircle className="h-4 w-4" />
                </span>
                WhatsApp us — replies in minutes
              </a>
              <a
                href={site.emailHref}
                className="group flex items-center gap-3 text-sm text-brand-200 transition-colors hover:text-white"
              >
                <span className="grid h-9 w-9 place-items-center rounded-lg bg-white/10 transition-colors group-hover:bg-brand-600">
                  <Mail className="h-4 w-4" />
                </span>
                {site.email}
              </a>
              <p className="flex items-start gap-3 text-sm text-brand-200">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-white/10">
                  <MapPin className="h-4 w-4" />
                </span>
                <span className="pt-2">
                  {business.address.street}, {business.address.city}, {business.address.countryName}
                </span>
              </p>
            </div>

            {socials.length > 0 && (
            <div className="mt-6 flex gap-2.5">
              {socials.map(({ href, icon: Icon, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-white/5 text-brand-200 transition-all hover:-translate-y-0.5 hover:border-aqua-400/40 hover:bg-white/10 hover:text-white"
                >
                  <Icon aria-hidden="true" className="h-4 w-4" />
                </a>
              ))}
            </div>
            )}
          </div>

          {/* Quick links */}
          <nav className="lg:col-span-2" aria-label="Quick links">
            <h3 className="text-sm font-bold uppercase tracking-[0.14em] text-white">Quick Links</h3>
            <ul className="mt-5 space-y-3 text-sm">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-brand-200 transition-colors hover:text-aqua-300">
                    {link.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/services/water-filter-amc" className="text-brand-200 transition-colors hover:text-aqua-300">
                  AMC Plans
                </Link>
              </li>
              <li>
                <Link href="/faqs" className="text-brand-200 transition-colors hover:text-aqua-300">
                  FAQs
                </Link>
              </li>
              <li>
                <Link href="/contact#quote" className="text-brand-200 transition-colors hover:text-aqua-300">
                  Free Demo
                </Link>
              </li>
            </ul>
          </nav>

          {/* Services */}
          <nav className="lg:col-span-3" aria-label="Services">
            <h3 className="text-sm font-bold uppercase tracking-[0.14em] text-white">Our Services</h3>
            <ul className="mt-5 space-y-3 text-sm">
              {services.slice(0, 8).map((service) => (
                <li key={service.slug}>
                  <Link
                    href={`/services/${service.slug}`}
                    className="text-brand-200 transition-colors hover:text-aqua-300"
                  >
                    {service.title}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Areas + hours */}
          <div className="lg:col-span-3">
            <h3 className="text-sm font-bold uppercase tracking-[0.14em] text-white">Service Areas</h3>
            <ul className="mt-5 flex flex-wrap gap-2 text-xs">
              {locations.map((location) => (
                <li key={location.slug}>
                  <Link
                    href={`/locations/${location.slug}`}
                    className="block rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-brand-200 transition-colors hover:border-aqua-400/40 hover:text-aqua-300"
                  >
                    {location.name}
                  </Link>
                </li>
              ))}
            </ul>

            <h3 className="mt-8 flex items-center gap-2 text-sm font-bold uppercase tracking-[0.14em] text-white">
              <Clock className="h-4 w-4 text-aqua-300" />
              Business Hours
            </h3>
            <ul className="mt-4 space-y-2 text-sm text-brand-200">
              {business.hours.map((h) => (
                <li key={h.days} className="flex flex-col">
                  <span className="font-semibold text-white/90">{h.days}</span>
                  <span className="text-brand-300">{h.time}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/*
          This strip used to read "Dubai Municipality plumbing standards · NSF /
          WQA certified filtration media · ESMA approved equipment · Fully
          insured technicians". Four certification and regulatory claims, none
          with evidence on file — and repeated in the footer of every page,
          which is the worst place for an unevidenced claim to live. It now
          renders the same claim-gated credentials as the rest of the site, so
          it says only what can be stood behind, everywhere at once.
        */}
        {credentials.length > 0 && (
          <div className="mt-12 flex flex-wrap items-center gap-x-6 gap-y-3 rounded-2xl border border-white/10 bg-white/5 p-5 text-xs text-brand-200">
            <span className="inline-flex items-center gap-2 font-semibold text-white">
              <ShieldCheck aria-hidden="true" className="h-4 w-4 text-eco-400" />
              What you can expect
            </span>
            {credentials.map((credential, i) => (
              <span key={credential.claimId} className="inline-flex items-center gap-2">
                {i > 0 && (
                  <span aria-hidden="true" className="hidden text-brand-400/40 sm:inline">
                    •
                  </span>
                )}
                {credential.label}
              </span>
            ))}
          </div>
        )}

        <div className="mt-8 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 text-xs text-brand-300 sm:flex-row">
          <p>
            © {year} {business.legalName}. All rights reserved.
          </p>
          <p className="flex items-center gap-1.5">
            Made with <span className="text-base leading-none text-red-400">❤</span> in the UAE
          </p>
        </div>
      </div>
    </footer>
  )
}
