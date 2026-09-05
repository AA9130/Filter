/**
 * ============================================================================
 *  LEAD RELAY — Google Apps Script
 *  Delivers website leads to a Google Sheet + your email (+ optional WhatsApp)
 * ============================================================================
 *
 *  Why this one: it is free, needs no packages or credit card, and it is BOTH
 *  the durable store and the notification — a Sheet the owner can read, sort
 *  and filter, plus an instant email. That satisfies "losing a lead is worse
 *  than duplicating one" with a single endpoint.
 *
 *  SETUP (5 minutes)
 *  -----------------
 *  1. Create a Google Sheet. Name the first tab "Leads".
 *  2. Extensions → Apps Script. Delete the placeholder, paste this file.
 *  3. Edit the CONFIG block below.
 *  4. Deploy → New deployment → type "Web app"
 *       Execute as:      Me
 *       Who has access:  Anyone            ← required; the secret protects it
 *     Deploy, authorise, and copy the /exec URL.
 *  5. Put that URL in .env.local as LEAD_STORE_URL, set the same
 *     LEAD_SHARED_SECRET in both places, and restart the dev server.
 *
 *  Re-deploy as a NEW VERSION after any edit, or the old code keeps running.
 * ============================================================================
 */

const CONFIG = {
  // Must match LEAD_SHARED_SECRET in .env.local. Use a long random string.
  SHARED_SECRET: 'change-me-to-a-long-random-string',

  // Where lead emails go. Comma-separate for several recipients.
  EMAIL_TO: 'you@yourdomain.ae',

  SHEET_NAME: 'Leads',

  // --- Optional WhatsApp alert ---------------------------------------------
  // CallMeBot is a free unofficial relay that messages YOUR OWN number.
  // Get a key: message +34 644 71 81 99 on WhatsApp with:  I allow callmebot
  // to send me messages
  // Leave WHATSAPP_PHONE empty to skip WhatsApp entirely.
  WHATSAPP_PHONE: '',        // e.g. '971569712464' (digits only, no +)
  WHATSAPP_APIKEY: '',
}

function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents)

    // Reject anything that is not our website
    if (CONFIG.SHARED_SECRET && body.secret !== CONFIG.SHARED_SECRET) {
      return json({ ok: false, error: 'unauthorized' })
    }

    const lead = body.lead || {}

    // 1. Durable record first — this is the part that must not fail
    const sheet =
      SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CONFIG.SHEET_NAME) ||
      SpreadsheetApp.getActiveSpreadsheet().insertSheet(CONFIG.SHEET_NAME)

    if (sheet.getLastRow() === 0) {
      sheet.appendRow(['Received', 'Name', 'Phone', 'Email', 'Emirate', 'Service', 'Message', 'Source'])
      sheet.getRange(1, 1, 1, 8).setFontWeight('bold')
      sheet.setFrozenRows(1)
    }

    sheet.appendRow([
      lead.receivedAt || new Date().toISOString(),
      lead.name || '',
      // Leading apostrophe keeps Sheets from mangling +971… into a formula
      lead.phone ? "'" + lead.phone : '',
      lead.email || '',
      lead.emirate || '',
      lead.service || '',
      lead.message || '',
      lead.source || 'website',
    ])

    // 2. Notify. Failures here must not lose the lead — it is already saved.
    try {
      notifyEmail(lead)
    } catch (err) {
      console.error('email failed: ' + err)
    }

    try {
      notifyWhatsApp(lead)
    } catch (err) {
      console.error('whatsapp failed: ' + err)
    }

    return json({ ok: true })
  } catch (err) {
    console.error(err)
    return json({ ok: false, error: String(err) })
  }
}

function notifyEmail(lead) {
  if (!CONFIG.EMAIL_TO) return

  const phone = lead.phone || ''
  // International format for the click-to-chat link
  const wa = phone.replace(/[^0-9]/g, '').replace(/^0/, '971')

  MailApp.sendEmail({
    to: CONFIG.EMAIL_TO,
    subject: 'New lead: ' + (lead.service || 'enquiry') + ' — ' + (lead.name || ''),
    replyTo: lead.email || undefined,
    htmlBody:
      '<h2 style="margin:0 0 12px">New website lead</h2>' +
      '<table cellpadding="6" style="border-collapse:collapse;font-family:sans-serif;font-size:14px">' +
      row('Name', lead.name) +
      row('Phone', '<a href="tel:+' + wa + '">' + phone + '</a> &nbsp;·&nbsp; ' +
          '<a href="https://wa.me/' + wa + '">WhatsApp</a>') +
      row('Email', lead.email) +
      row('Emirate', lead.emirate) +
      row('Service', lead.service) +
      row('Message', lead.message) +
      row('Received', lead.receivedAt) +
      '</table>',
  })
}

function notifyWhatsApp(lead) {
  if (!CONFIG.WHATSAPP_PHONE || !CONFIG.WHATSAPP_APIKEY) return

  const text =
    'New lead: ' + (lead.service || '') + '\n' +
    (lead.name || '') + '\n' + (lead.phone || '') +
    (lead.emirate ? '\n' + lead.emirate : '') +
    (lead.message ? '\n"' + lead.message + '"' : '')

  UrlFetchApp.fetch(
    'https://api.callmebot.com/whatsapp.php?phone=' + CONFIG.WHATSAPP_PHONE +
      '&text=' + encodeURIComponent(text) +
      '&apikey=' + CONFIG.WHATSAPP_APIKEY,
    { muteHttpExceptions: true },
  )
}

function row(label, value) {
  if (!value) return ''
  return '<tr><td style="color:#64748b">' + label + '</td><td><b>' + value + '</b></td></tr>'
}

function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(
    ContentService.MimeType.JSON,
  )
}
