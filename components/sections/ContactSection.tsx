import { Phone, MessageCircle, Mail, Clock, MapPin, ShieldCheck, Zap } from 'lucide-react'
import SectionHeading from '@/components/ui/SectionHeading'
import Reveal from '@/components/ui/Reveal'
import ContactForm from './ContactForm'
import { site, whatsappLink } from '@/lib/site'

export default function ContactSection() {
  return (
    <section id="contact" className="section relative overflow-hidden bg-white">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-40 top-40 h-96 w-96 rounded-full bg-brand-100/50 blur-3xl"
      />

      <div className="container-page relative">
        <SectionHeading
          eyebrow="Contact Us"
          title="Talk to a real technician, not a call centre"
          subtitle="Call, WhatsApp or send the form — whichever suits you. We answer in English, Arabic, Hindi, Urdu and Malayalam."
        />

        <div className="mt-14 grid gap-8 lg:grid-cols-12 lg:gap-10">
          {/* Contact details */}
          <div className="lg:col-span-5">
            <Reveal from="left">
              <div className="rounded-3xl bg-gradient-to-br from-brand-900 via-brand-800 to-brand-950 p-7 text-white shadow-card sm:p-8">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-aqua-300">
                  Fastest response
                </p>

                <a
                  href={site.phone.href}
                  data-analytics="call-click-contact"
                  className="group mt-4 block"
                >
                  <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-brand-200">
                    <Phone className="h-3.5 w-3.5" />
                    Call us 24/7
                  </span>
                  <span className="mt-1.5 block text-2xl font-extrabold tracking-tight transition-colors group-hover:text-aqua-300 sm:text-[1.75rem]">
                    {site.phone.display}
                  </span>
                </a>

                <div className="mt-6 space-y-3">
                  <a
                    href={whatsappLink()}
                    target="_blank"
                    rel="noopener noreferrer"
                    data-analytics="whatsapp-click-contact"
                    className="btn-whatsapp w-full"
                  >
                    <MessageCircle className="h-4 w-4" />
                    Message us on WhatsApp
                  </a>
                  <a href={site.emailHref} className="btn-ghost-light w-full">
                    <Mail className="h-4 w-4" />
                    {site.email}
                  </a>
                </div>

                <dl className="mt-8 space-y-5 border-t border-white/10 pt-7 text-sm">
                  <div className="flex gap-3">
                    <dt className="shrink-0">
                      <span className="grid h-9 w-9 place-items-center rounded-lg bg-white/10 text-aqua-300">
                        <Clock className="h-4 w-4" />
                      </span>
                      <span className="sr-only">Business hours</span>
                    </dt>
                    <dd>
                      <p className="font-bold text-white">Business hours</p>
                      <ul className="mt-1.5 space-y-1 text-brand-200">
                        {site.hours.map((h) => (
                          <li key={h.days}>
                            <span className="text-white/85">{h.days}:</span> {h.time}
                          </li>
                        ))}
                      </ul>
                    </dd>
                  </div>

                  <div className="flex gap-3">
                    <dt className="shrink-0">
                      <span className="grid h-9 w-9 place-items-center rounded-lg bg-white/10 text-aqua-300">
                        <MapPin className="h-4 w-4" />
                      </span>
                      <span className="sr-only">Service area</span>
                    </dt>
                    <dd>
                      <p className="font-bold text-white">Service area</p>
                      <p className="mt-1.5 text-brand-200">
                        All 7 Emirates — Dubai, Abu Dhabi, Sharjah, Ajman, Ras Al Khaimah, Fujairah
                        and Umm Al Quwain. Office: {site.address.street}, {site.address.city}.
                      </p>
                    </dd>
                  </div>

                  <div className="flex gap-3">
                    <dt className="shrink-0">
                      <span className="grid h-9 w-9 place-items-center rounded-lg bg-white/10 text-eco-400">
                        <Zap className="h-4 w-4" />
                      </span>
                      <span className="sr-only">Emergency service</span>
                    </dt>
                    <dd>
                      <p className="font-bold text-white">Emergency call-outs</p>
                      <p className="mt-1.5 text-brand-200">
                        Leaks and total loss of flow are treated as priority, 24 hours a day,
                        including Fridays and public holidays.
                      </p>
                    </dd>
                  </div>
                </dl>

                <p className="mt-7 flex items-start gap-2 rounded-xl bg-white/5 p-3.5 text-xs leading-relaxed text-brand-200">
                  <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-eco-400" />
                  Licensed UAE business · Dubai Municipality plumbing standards · fully insured,
                  uniformed technicians.
                </p>
              </div>
            </Reveal>

            {/* Map embed — swap the query for your real branch address */}
            <Reveal delay={0.1}>
              <div className="mt-6 overflow-hidden rounded-3xl border border-slate-200 shadow-soft">
                <iframe
                  title="AquaPure UAE service area map"
                  src="https://www.google.com/maps?q=Al%20Quoz%20Industrial%20Area%203%2C%20Dubai%2C%20UAE&output=embed"
                  width="100%"
                  height="280"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="block border-0"
                />
              </div>
            </Reveal>
          </div>

          {/* Form */}
          <div id="quote" className="scroll-mt-28 lg:col-span-7">
            <Reveal from="right">
              <ContactForm />
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  )
}
