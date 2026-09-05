import Photo from '@/components/ui/Photo'
import { MapPin, Truck, Phone, MessageCircle } from 'lucide-react'
import SectionHeading from '@/components/ui/SectionHeading'
import Reveal from '@/components/ui/Reveal'
import type { Emirate } from '@/lib/content'
import { site, whatsappLink } from '@/lib/site'
import { images } from '@/lib/images'

export default function ServiceAreas({ emirates }: { emirates: Emirate[] }) {
  return (
    <section id="service-areas" className="relative overflow-hidden bg-brand-950 py-16 sm:py-20 lg:py-28">
      {/* Skyline backdrop */}
      <Photo
        src={images.dubaiSkyline}
        alt=""
        aria-hidden="true"
        fill
        loading="lazy"
        sizes="100vw"
        className="object-cover opacity-[0.18]"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-b from-brand-950 via-brand-950/85 to-brand-950"
      />

      <div className="container-page relative">
        <SectionHeading
          eyebrow="Service Areas"
          tone="dark"
          title="We cover every Emirate — all seven, not just Dubai"
          subtitle="Mobile teams based in Dubai, Abu Dhabi and Sharjah, with scheduled coverage of the northern Emirates. Tell us your area and we will confirm the next available slot."
        />

        <ul className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {emirates.map((emirate, i) => (
            <Reveal as="li" key={emirate.name} delay={(i % 3) * 0.07}>
              <div className="group h-full rounded-2xl border border-white/10 bg-white/[0.06] p-5 backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:border-aqua-400/40 hover:bg-white/[0.11]">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <span className="grid h-10 w-10 place-items-center rounded-xl bg-aqua-400/15 text-aqua-300 transition-colors group-hover:bg-aqua-400 group-hover:text-brand-950">
                      <MapPin className="h-5 w-5" />
                    </span>
                    <h3 className="text-base font-bold text-white">{emirate.name}</h3>
                  </div>
                  <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-eco-500/15 px-2.5 py-1 text-[0.6875rem] font-bold text-eco-400">
                    <Truck className="h-3 w-3" />
                    {emirate.response}
                  </span>
                </div>
                <p className="mt-4 text-sm leading-relaxed text-brand-200/85">
                  {emirate.areas.join(' · ')}
                </p>
              </div>
            </Reveal>
          ))}

          {/* CTA tile completes the grid */}
          <Reveal as="li" delay={0.2}>
            <div className="flex h-full flex-col justify-between rounded-2xl border border-cta-400/30 bg-gradient-to-br from-cta-500/20 to-brand-600/20 p-5 backdrop-blur">
              <div>
                <h3 className="text-base font-bold text-white">Not sure if we reach you?</h3>
                <p className="mt-2 text-sm leading-relaxed text-brand-100/85">
                  Send your location on WhatsApp and we will confirm coverage and timing right away.
                </p>
              </div>
              <div className="mt-5 flex flex-col gap-2.5 sm:flex-row">
                <a
                  href={whatsappLink('Hi, I want to check if you cover my area. My location is:')}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-analytics="whatsapp-click-areas"
                  className="btn-whatsapp !px-4 !py-2.5 !text-xs"
                >
                  <MessageCircle className="h-4 w-4" />
                  Check my area
                </a>
                <a
                  href={site.phone.href}
                  data-analytics="call-click-areas"
                  className="btn-ghost-light !px-4 !py-2.5 !text-xs"
                >
                  <Phone className="h-4 w-4" />
                  Call us
                </a>
              </div>
            </div>
          </Reveal>
        </ul>
      </div>
    </section>
  )
}
