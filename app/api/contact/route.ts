import { NextResponse } from 'next/server'
import { appendFile } from 'node:fs/promises'

/**
 * Lead intake.
 *
 * Design brief: losing a lead is worse than duplicating one. So the order is
 *   validate → persist → acknowledge → deliver (best effort)
 * and the endpoint only reports failure when every sink has failed. Duplicates
 * are acceptable; silence is not.
 *
 * Configure in .env.local:
 *   LEAD_STORE_URL    durable sink, tried first (Apps Script → Sheet, or an API)
 *   LEAD_WEBHOOK_URL  notification sink (Slack / Discord / Zapier)
 *   LEAD_LOG_FILE     optional local JSONL append; only durable on a host with
 *                     a writable disk (a VPS, not serverless)
 *   LEAD_SHARED_SECRET  optional; echoed to sinks so a public relay URL can
 *                     verify the request came from this site
 */

type Lead = {
  name?: string
  phone?: string
  email?: string
  emirate?: string
  service?: string
  message?: string
  /** Honeypot — a real person never sees or fills this. */
  company?: string
  /** Client timestamp used to reject superhuman submissions. */
  startedAt?: number
}

const UAE_PHONE = /^(?:\+?971|0)?[1-9]\d{7,8}$/
const MIN_HUMAN_FILL_MS = 800

/** Send to one sink. Returns true only on a confirmed 2xx. */
async function deliver(url: string, payload: unknown, label: string): Promise<boolean> {
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(8000),
    })
    if (!response.ok) throw new Error(`responded ${response.status}`)
    return true
  } catch (error) {
    console.error(`[contact] ${label} sink failed:`, error)
    return false
  }
}

export async function POST(request: Request) {
  let body: Lead

  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid JSON payload.' }, { status: 400 })
  }

  // --- Bot filtering ---------------------------------------------------------
  // A honeypot beats IP rate limiting here: UAE mobile traffic sits behind
  // carrier-grade NAT, so thousands of real Etisalat/du customers share egress
  // IPs. Throttling by IP would drop genuine leads — the exact failure we care
  // most about. Bots get a 200 so they have nothing to probe against.
  const elapsed = typeof body.startedAt === 'number' ? Date.now() - body.startedAt : Infinity
  if (body.company || elapsed < MIN_HUMAN_FILL_MS) {
    console.warn('[contact] Dropped suspected bot submission', {
      honeypot: Boolean(body.company),
      elapsed,
    })
    return NextResponse.json({ ok: true, message: 'Thanks — we will call you back shortly.' })
  }

  // --- Validation ------------------------------------------------------------
  const name = body.name?.trim() ?? ''
  const phone = (body.phone ?? '').replace(/[\s()-]/g, '')

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

  // Always log first: the server log is the last line of defence and costs
  // nothing. Everything after this can fail without the lead disappearing.
  console.info('[contact] New lead received:', lead)

  const summary = `New ${lead.service} lead — ${lead.name}, ${lead.phone}${
    lead.emirate ? `, ${lead.emirate}` : ''
  }${lead.message ? `\n"${lead.message}"` : ''}`
  // `text` satisfies Slack, `content` satisfies Discord, `lead` is the record.
  // `secret` lets a public relay endpoint (an Apps Script web app must be
  // world-reachable to receive our POST) reject anything that isn't us.
  const payload = {
    text: summary,
    content: summary,
    lead,
    ...(process.env.LEAD_SHARED_SECRET ? { secret: process.env.LEAD_SHARED_SECRET } : {}),
  }

  // --- Persist, then notify --------------------------------------------------
  let stored = false

  if (process.env.LEAD_LOG_FILE) {
    try {
      await appendFile(process.env.LEAD_LOG_FILE, JSON.stringify(lead) + '\n', 'utf8')
      stored = true
    } catch (error) {
      console.error('[contact] file sink failed:', error)
    }
  }

  if (process.env.LEAD_STORE_URL) {
    stored = (await deliver(process.env.LEAD_STORE_URL, payload, 'store')) || stored
  }

  const notified = process.env.LEAD_WEBHOOK_URL
    ? await deliver(process.env.LEAD_WEBHOOK_URL, payload, 'webhook')
    : false

  const configured = Boolean(
    process.env.LEAD_STORE_URL || process.env.LEAD_WEBHOOK_URL || process.env.LEAD_LOG_FILE,
  )

  // Only fail when every configured sink failed. A lead safely stored but not
  // announced is a success — the business still has it.
  if (configured && !stored && !notified) {
    console.error('[contact] LEAD_LOST — every sink failed for:', lead)
    return NextResponse.json(
      { ok: false, error: 'Could not deliver your request. Please call or WhatsApp us.' },
      { status: 502 },
    )
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
