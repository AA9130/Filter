import Link from 'next/link'
import { Home, Phone, MessageCircle, Droplets } from 'lucide-react'
import { site, whatsappLink } from '@/lib/site'

export default function NotFound() {
  return (
    <section className="relative overflow-hidden bg-hero-radial py-24 sm:py-32">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-grid-light bg-grid opacity-[0.07]"
      />
      <div className="container-page relative text-center">
        <span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-white/10 text-aqua-300 backdrop-blur">
          <Droplets className="h-8 w-8" />
        </span>
        <p className="mt-6 text-sm font-bold uppercase tracking-[0.2em] text-aqua-300">Error 404</p>
        <h1 className="mt-4 text-3xl text-white sm:text-4xl">This page has run dry</h1>
        <p className="mx-auto mt-4 max-w-lg text-base leading-relaxed text-brand-100/85">
          The page you are looking for does not exist — but our technicians are still one tap away.
        </p>

        <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link href="/" className="btn-ghost-light btn-lg">
            <Home className="h-5 w-5" />
            Back to homepage
          </Link>
          <a href={site.phone.href} className="btn-cta btn-lg">
            <Phone className="h-5 w-5" />
            Call {site.phone.display}
          </a>
          <a
            href={whatsappLink()}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-whatsapp btn-lg"
          >
            <MessageCircle className="h-5 w-5" />
            WhatsApp Us
          </a>
        </div>
      </div>
    </section>
  )
}
