import { Check, X, Phone, MessageCircle, ShieldCheck, Sparkles } from 'lucide-react'
import SectionHeading from '@/components/ui/SectionHeading'
import Reveal from '@/components/ui/Reveal'
import type { AmcPlan } from '@/lib/content'
import { site, whatsappLink } from '@/lib/site'
import { cn } from '@/lib/utils'

export default function AmcPlans({ plans }: { plans: AmcPlan[] }) {
  return (
    <section id="amc-plans" className="section relative overflow-hidden bg-slate-50">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-40 top-20 h-96 w-96 rounded-full bg-aqua-200/40 blur-3xl"
      />

      <div className="container-page relative">
        <SectionHeading
          eyebrow="AMC Plans"
          title="Annual Maintenance Contracts"
          subtitle="Scheduled visits, genuine consumables, labour and priority response bundled into one predictable yearly fee. Tell us what you run and we will quote the right tier — we contact you when a service is due."
        />

        <ul className="mt-14 grid items-start gap-6 lg:grid-cols-3">
          {plans.map((plan, i) => (
            <Reveal as="li" key={plan.name} delay={i * 0.1} className="h-full">
              <div
                className={cn(
                  'relative flex h-full flex-col rounded-3xl border bg-white p-7 transition-all duration-300',
                  plan.featured
                    ? 'border-brand-300 shadow-lift lg:-mt-4 lg:pb-9 lg:pt-9 ring-1 ring-brand-200'
                    : 'border-slate-200/80 shadow-soft hover:-translate-y-1 hover:border-brand-200 hover:shadow-card',
                )}
              >
                {plan.featured && (
                  <span className="absolute -top-3.5 left-1/2 inline-flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-gradient-to-r from-brand-700 to-aqua-500 px-4 py-1.5 text-[0.6875rem] font-bold uppercase tracking-wider text-white shadow-lg">
                    <Sparkles className="h-3.5 w-3.5" />
                    Most popular
                  </span>
                )}

                <div className="flex items-center gap-2.5">
                  <span
                    className={cn(
                      'grid h-11 w-11 place-items-center rounded-xl',
                      plan.featured
                        ? 'bg-gradient-to-br from-brand-700 to-aqua-500 text-white'
                        : 'bg-brand-50 text-brand-700',
                    )}
                  >
                    <ShieldCheck className="h-5 w-5" />
                  </span>
                  <h3 className="text-xl font-bold">{plan.name}</h3>
                </div>

                <p className="mt-3 min-h-[2.75rem] text-sm leading-relaxed text-ink-soft">
                  {plan.tagline}
                </p>

                <div className="mt-5 border-b border-slate-100 pb-6">
                  <p className="text-sm font-semibold text-brand-700">
                    Annual contract · quoted per property
                  </p>
                </div>

                <ul className="mt-6 flex-1 space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2.5 text-sm text-ink-soft">
                      <span className="mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full bg-eco-100">
                        <Check className="h-3 w-3 text-eco-600" />
                      </span>
                      {feature}
                    </li>
                  ))}
                  {plan.excluded.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-start gap-2.5 text-sm text-ink-muted/70 line-through decoration-slate-300"
                    >
                      <span className="mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full bg-slate-100">
                        <X className="h-3 w-3 text-slate-400" />
                      </span>
                      {feature}
                    </li>
                  ))}
                </ul>

                <div className="mt-7 space-y-2.5">
                  <a
                    href={whatsappLink(
                      `Hi, I am interested in the ${plan.name} AMC plan. Please share details.`,
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    data-analytics="whatsapp-click-amc"
                    className={cn('w-full', plan.featured ? 'btn-cta' : 'btn-brand')}
                  >
                    <MessageCircle className="h-4 w-4" />
                    Contact for Custom Quote
                  </a>
                  <a href={site.phone.href} className="btn-outline w-full !py-2.5 !text-xs">
                    <Phone className="h-3.5 w-3.5" />
                    Or call {site.phone.display}
                  </a>
                </div>
              </div>
            </Reveal>
          ))}
        </ul>

        <Reveal delay={0.15}>
          <p className="mx-auto mt-10 max-w-3xl text-center text-sm leading-relaxed text-ink-muted">
            Running multiple systems, a villa compound or a commercial kitchen? We build custom
            contracts with pooled visits and volume pricing — including water-quality logs for
            municipality inspections.
          </p>
        </Reveal>
      </div>
    </section>
  )
}
