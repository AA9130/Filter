import { NextResponse } from 'next/server'

/**
 * Lead intake endpoint.
 *
 * Right now it validates the payload and logs the lead to the server console,
 * which is enough to test the funnel end to end. To go live, drop your provider
 * call in where marked — e.g.:
 *
 *   const resend = new Resend(process.env.RESEND_API_KEY)
 *   await resend.emails.send({ to: 'sales@yourdomain.ae', subject: …, html: … })
 *
 * or POST it to a CRM (HubSpot, Zoho, Salesforce) / Google Sheet / Slack webhook.
 */

type Lead = {
  name?: string
  phone?: string
  email?: string
  emirate?: string
  service?: string
  message?: string
}

const UAE_PHONE = /^(?:\+?971|0)?[1-9]\d{7,8}$/

export async function POST(request: Request) {
  let body: Lead

  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid JSON payload.' }, { status: 400 })
  }

  const name = body.name?.trim() ?? ''
  const phone = (body.phone ?? '').replace(/[\s()-]/g, '')

  // Server-side validation mirrors the client rules — never trust the browser.
  const errors: Record<string, string> = {}
  if (name.length < 2) errors.name = 'Name is required.'
  if (!UAE_PHONE.test(phone)) errors.phone = 'A valid UAE phone number is required.'
  if (!body.service?.trim()) errors.service = 'Service selection is required.'

  if (Object.keys(errors).length > 0) {
    return NextResponse.json({ ok: false, errors }, { status: 422 })
  }

  const lead = {
    name,
    phone,
    email: body.email?.trim() || null,
    emirate: body.emirate?.trim() || null,
    service: body.service?.trim(),
    message: body.message?.trim() || null,
    receivedAt: new Date().toISOString(),
    source: 'website-contact-form',
  }

  console.info('[contact] New lead received:', lead)

  // Delivery is one POST to whatever URL you put in LEAD_WEBHOOK_URL: a Slack
  // or Discord webhook, Zapier/Make/n8n, or a Google Apps Script that appends
  // to a Sheet. No SDK, no API key in the codebase, no vendor to migrate off.
  // `text` satisfies Slack, `content` satisfies Discord, `lead` carries the
  // structured record for everything else.
  if (process.env.LEAD_WEBHOOK_URL) {
    const summary = `New ${lead.service} lead — ${lead.name}, ${lead.phone}${
      lead.emirate ? `, ${lead.emirate}` : ''
    }${lead.message ? `\n"${lead.message}"` : ''}`

    try {
      const delivery = await fetch(process.env.LEAD_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: summary, content: summary, lead }),
        signal: AbortSignal.timeout(8000),
      })
      if (!delivery.ok) throw new Error(`Webhook responded ${delivery.status}`)
    } catch (error) {
      // Report the failure rather than showing a false success — the form then
      // tells the customer to call or WhatsApp instead, so the lead is not lost.
      console.error('[contact] Lead delivery FAILED (lead logged above):', error)
      return NextResponse.json(
        { ok: false, error: 'Could not deliver your request. Please call or WhatsApp us.' },
        { status: 502 },
      )
    }
  }

  return NextResponse.json(
    { ok: true, message: 'Thanks — we will call you back shortly.' },
    { status: 200 },
  )
}

export function GET() {
  return NextResponse.json(
    { ok: false, error: 'Method not allowed. Submit the contact form with POST.' },
    { status: 405 },
  )
}
