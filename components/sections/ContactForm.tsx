'use client'

import { useRef, useState } from 'react'
import { Send, CheckCircle2, AlertCircle, Loader2, MessageCircle } from 'lucide-react'
import type { Service, Location } from '@/lib/content'
import { whatsappLink } from '@/lib/site'
import { cn } from '@/lib/utils'

type FormState = {
  name: string
  phone: string
  email: string
  emirate: string
  service: string
  message: string
}

type Errors = Partial<Record<keyof FormState, string>>

const EMPTY: FormState = {
  name: '',
  phone: '',
  email: '',
  emirate: '',
  service: '',
  message: '',
}

/** UAE mobile/landline: optional +971 or 0 prefix, then 8–9 digits. */
const UAE_PHONE = /^(?:\+?971|0)?[1-9]\d{7,8}$/
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

function validate(values: FormState): Errors {
  const errors: Errors = {}

  if (values.name.trim().length < 2) {
    errors.name = 'Please enter your name.'
  }

  const phone = values.phone.replace(/[\s()-]/g, '')
  if (!phone) {
    errors.phone = 'A contact number is required — it is how we reach you.'
  } else if (!UAE_PHONE.test(phone)) {
    errors.phone = 'Enter a valid UAE number, e.g. 050 123 4567 or +971 50 123 4567.'
  }

  // Email is optional, but must be valid if provided
  if (values.email.trim() && !EMAIL.test(values.email.trim())) {
    errors.email = 'That email address does not look right.'
  }

  if (!values.service) {
    errors.service = 'Let us know which service you need.'
  }

  return errors
}

export default function ContactForm({
  services,
  emirates,
}: {
  services: Pick<Service, 'slug' | 'title'>[]
  emirates: Pick<Location, 'name'>[]
}) {
  const [values, setValues] = useState<FormState>(EMPTY)
  const [errors, setErrors] = useState<Errors>({})
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')
  // Honeypot: hidden from people, irresistible to bots
  const [company, setCompany] = useState('')
  const startedAt = useRef(Date.now())

  const update = (field: keyof FormState) => (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    setValues((prev) => ({ ...prev, [field]: event.target.value }))
    // Clear the field error as soon as the user starts correcting it
    setErrors((prev) => (prev[field] ? { ...prev, [field]: undefined } : prev))
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const found = validate(values)
    setErrors(found)
    if (Object.keys(found).length > 0) {
      // Move focus to the first invalid field for keyboard/screen-reader users
      const firstField = Object.keys(found)[0]
      document.getElementById(`field-${firstField}`)?.focus()
      return
    }

    setStatus('submitting')

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...values, company, startedAt: startedAt.current }),
      })

      if (!response.ok) throw new Error(`Request failed with ${response.status}`)

      // Swap this for your CRM / email service (Resend, SendGrid, HubSpot…)
      console.log('Lead submitted:', values)

      setStatus('success')
      setValues(EMPTY)
    } catch (error) {
      console.error('Contact form submission failed:', error)
      setStatus('error')
    }
  }

  const fieldClass = (field: keyof FormState) =>
    cn(
      'w-full rounded-xl border bg-white px-4 py-3 text-sm text-ink transition-colors placeholder:text-ink-muted/70',
      'focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20',
      errors[field] ? 'border-red-300 bg-red-50/40' : 'border-slate-200 hover:border-slate-300',
    )

  if (status === 'success') {
    return (
      <div
        className="animate-fade-up rounded-3xl border border-eco-100 bg-eco-50 p-8 text-center sm:p-10"
        role="status"
      >
        <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-eco-500 text-white">
          <CheckCircle2 className="h-8 w-8" />
        </span>
        <h3 className="mt-5 text-2xl font-bold text-eco-700">Request received — thank you!</h3>
        <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-eco-700/80">
          One of our technicians will call you within 30 minutes during business hours. Need it
          sorted faster? Message us on WhatsApp and we will reply immediately.
        </p>
        <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
          <a
            href={whatsappLink('Hi, I just submitted a request on your website. My details are:')}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-whatsapp"
          >
            <MessageCircle className="h-4 w-4" />
            Continue on WhatsApp
          </a>
          <button type="button" onClick={() => setStatus('idle')} className="btn-outline">
            Send another request
          </button>
        </div>
      </div>
    )
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="relative rounded-3xl border border-slate-200/80 bg-white p-6 shadow-card sm:p-8"
    >
      <h3 className="text-xl font-bold sm:text-2xl">Request a free water test or quote</h3>
      <p className="mt-2 text-sm leading-relaxed text-ink-soft">
        Fill this in and we will call you back with availability and a fixed price in AED. No
        call-out charge, no obligation.
      </p>

      {/* Not display:none — some bots skip hidden inputs. Off-screen, untabbable
          and announced to nobody. */}
      <div aria-hidden="true" className="absolute left-[-9999px] top-0 h-0 w-0 overflow-hidden">
        <label htmlFor="field-company">Company (leave this empty)</label>
        <input
          id="field-company"
          name="company"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={company}
          onChange={(event) => setCompany(event.target.value)}
        />
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-1">
          <label htmlFor="field-name" className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-ink-soft">
            Full name <span className="text-cta-500">*</span>
          </label>
          <input
            id="field-name"
            name="name"
            type="text"
            autoComplete="name"
            value={values.name}
            onChange={update('name')}
            placeholder="e.g. Ahmed Khan"
            aria-invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? 'error-name' : undefined}
            className={fieldClass('name')}
          />
          {errors.name && (
            <p id="error-name" className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-red-600">
              <AlertCircle className="h-3.5 w-3.5" />
              {errors.name}
            </p>
          )}
        </div>

        <div className="sm:col-span-1">
          <label htmlFor="field-phone" className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-ink-soft">
            Mobile number <span className="text-cta-500">*</span>
          </label>
          <input
            id="field-phone"
            name="phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            value={values.phone}
            onChange={update('phone')}
            placeholder="+971 50 123 4567"
            aria-invalid={Boolean(errors.phone)}
            aria-describedby={errors.phone ? 'error-phone' : undefined}
            className={fieldClass('phone')}
          />
          {errors.phone && (
            <p id="error-phone" className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-red-600">
              <AlertCircle className="h-3.5 w-3.5" />
              {errors.phone}
            </p>
          )}
        </div>

        <div className="sm:col-span-1">
          <label htmlFor="field-email" className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-ink-soft">
            Email <span className="font-medium normal-case text-ink-muted">(optional)</span>
          </label>
          <input
            id="field-email"
            name="email"
            type="email"
            autoComplete="email"
            value={values.email}
            onChange={update('email')}
            placeholder="you@example.com"
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? 'error-email' : undefined}
            className={fieldClass('email')}
          />
          {errors.email && (
            <p id="error-email" className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-red-600">
              <AlertCircle className="h-3.5 w-3.5" />
              {errors.email}
            </p>
          )}
        </div>

        <div className="sm:col-span-1">
          <label htmlFor="field-emirate" className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-ink-soft">
            Emirate
          </label>
          <select
            id="field-emirate"
            name="emirate"
            value={values.emirate}
            onChange={update('emirate')}
            className={fieldClass('emirate')}
          >
            <option value="">Select your emirate</option>
            {emirates.map((e) => (
              <option key={e.name} value={e.name}>
                {e.name}
              </option>
            ))}
          </select>
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="field-service" className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-ink-soft">
            Service needed <span className="text-cta-500">*</span>
          </label>
          <select
            id="field-service"
            name="service"
            value={values.service}
            onChange={update('service')}
            aria-invalid={Boolean(errors.service)}
            aria-describedby={errors.service ? 'error-service' : undefined}
            className={fieldClass('service')}
          >
            <option value="">Choose a service</option>
            {services.map((s) => (
              <option key={s.slug} value={s.title}>
                {s.title}
              </option>
            ))}
            <option value="Emergency repair">Emergency repair (24hr)</option>
            <option value="Something else">Something else</option>
          </select>
          {errors.service && (
            <p id="error-service" className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-red-600">
              <AlertCircle className="h-3.5 w-3.5" />
              {errors.service}
            </p>
          )}
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="field-message" className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-ink-soft">
            Message <span className="font-medium normal-case text-ink-muted">(optional)</span>
          </label>
          <textarea
            id="field-message"
            name="message"
            rows={4}
            value={values.message}
            onChange={update('message')}
            placeholder="Tell us about your property, existing system or the problem you are facing…"
            className={cn(fieldClass('message'), 'resize-y')}
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={status === 'submitting'}
        className="btn-cta btn-lg mt-6 w-full"
        data-analytics="form-submit"
      >
        {status === 'submitting' ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            Sending your request…
          </>
        ) : (
          <>
            <Send className="h-5 w-5" />
            Send Request — We Call Back in 30 Minutes
          </>
        )}
      </button>

      {status === 'error' && (
        <p
          role="alert"
          className="mt-4 flex animate-fade-up items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3.5 text-sm text-red-700"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>
            Something went wrong sending your request. Please call or WhatsApp us instead — we will
            answer right away.
          </span>
        </p>
      )}

      <p className="mt-4 text-center text-xs leading-relaxed text-ink-muted">
        Your details are used only to contact you about this enquiry. We never share or sell your
        information.
      </p>
    </form>
  )
}
