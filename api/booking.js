/**
 * Robuster Buchungsversand: nur Resend.
 * 1) Mail an HCQ (BOOKING_TO_EMAIL)
 * 2) Bestätigungsmail an Anmelder
 *
 * Pflicht: RESEND_API_KEY in Vercel.
 */

const DEFAULT_TO = 'info@hampacorequality.de'
const DEFAULT_FROM = 'HCQ Zertifikatsschulung <info@hampacorequality.de>'
const WORKSHOP_WHEN = 'Samstag, 15.08.2026, 09:00 – 12:00 Uhr (Live via Google Meet)'

function asString(value, fallback = '—') {
  if (typeof value === 'string' && value.trim()) return value.trim()
  if (typeof value === 'number') return String(value)
  return fallback
}

function isEmail(value) {
  return typeof value === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())
}

function escapeHtml(value) {
  return asString(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
}

function buildOwnerSubject(body) {
  const event = asString(body.event, 'booking.created')
  const participant = asString(body.gfName || body.name, 'Unbekannt')
  const company = asString(body.company, '—')
  if (event === 'lead.created') {
    return `Lead Zertifikatsschulung – ${participant} / ${company}`
  }
  return `Buchung Zertifikatsschulung – ${participant} / ${company}`
}

function buildOwnerText(body) {
  const event = asString(body.event, 'booking.created')
  if (event === 'lead.created') {
    return [
      '=== Lead Zertifikatsschulung ===',
      `Name des Teilnehmers: ${asString(body.name)}`,
      `Unternehmen: ${asString(body.company)}`,
      `E-Mail: ${asString(body.email)}`,
      `Telefon: ${asString(body.phone)}`,
      `Markt: ${asString(body.market)}`,
      `Zeitpunkt: ${asString(body.createdAt)}`,
    ].join('\n')
  }

  const billingSame = asString(body.billingSame) === 'on'
  const billing = billingSame
    ? 'Entspricht Unternehmenssitz'
    : [
        `Strasse: ${asString(body.street)}`,
        `PLZ/Ort: ${asString(body.zip)} ${asString(body.city)}`,
        `Land: ${asString(body.country)}`,
      ].join('\n')

  return [
    '=== Buchungsanfrage Zertifikatsschulung ===',
    `Name des Teilnehmers: ${asString(body.gfName)}`,
    `Unternehmen: ${asString(body.company)}`,
    `Rechtsform: ${asString(body.legalForm)}`,
    `USt-IdNr.: ${asString(body.vatId)}`,
    `E-Mail: ${asString(body.email)}`,
    `Telefon: ${asString(body.phone)}`,
    `Markt: ${asString(body.market)}`,
    '',
    '=== Rechnungsadresse ===',
    billing,
    '',
    `Zahlungsart: ${asString(body.paymentMethod)}`,
    `Bemerkung: ${asString(body.notes)}`,
    `Status: ${asString(body.status, 'pending_payment')}`,
    `Preis: ${asString(body.priceNetEur, '1000')} ${asString(body.currency, 'EUR')} netto`,
    `Termin: ${WORKSHOP_WHEN}`,
    `Zeitpunkt: ${asString(body.createdAt)}`,
  ].join('\n')
}

function buildConfirmSubject(body) {
  if (asString(body.event) === 'lead.created') {
    return 'Ihre Anfrage – Zertifikatsschulung NIS-2 / NISG 2026 / CRA'
  }
  return 'Buchungsbestätigung – Zertifikatsschulung NIS-2 / NISG 2026 / CRA'
}

function buildConfirmText(body) {
  const name = asString(body.gfName || body.name, '')
  const greeting = name && name !== '—' ? `Guten Tag ${name},` : 'Guten Tag,'
  const event = asString(body.event, 'booking.created')

  if (event === 'lead.created') {
    return [
      greeting,
      '',
      'vielen Dank für Ihre Anfrage zur Executive-Pflichtschulung NIS-2, NISG 2026 & CRA.',
      'Wir haben Ihre Nachricht erhalten und melden uns zeitnah.',
      '',
      `Nächster Termin: ${WORKSHOP_WHEN}`,
      '',
      'Mit freundlichen Grüßen',
      'HCQ Coaching and Compliant',
      'Rainer Hampicke',
      DEFAULT_TO,
    ].join('\n')
  }

  return [
    greeting,
    '',
    'hiermit bestätigen wir Ihre Anmeldung zur Executive-Pflichtschulung.',
    '',
    `Teilnehmer: ${asString(body.gfName)}`,
    `Unternehmen: ${asString(body.company)}`,
    `E-Mail: ${asString(body.email)}`,
    `Markt: ${asString(body.market)}`,
    `Zahlungsart: ${asString(body.paymentMethod)}`,
    '',
    `Termin: ${WORKSHOP_WHEN}`,
    'Preis: 1.000 € netto zzgl. MwSt.',
    '',
    'Als Nächstes erhalten Sie Checkout-Link oder Rechnung.',
    'Google-Meet-Zugang und Testat folgen erst nach Zahlungseingang',
    '(spätestens 1 Woche vor dem Termin).',
    '',
    'Mit freundlichen Grüßen',
    'HCQ Coaching and Compliant',
    'Rainer Hampicke',
    DEFAULT_TO,
  ].join('\n')
}

function buildConfirmHtml(body) {
  const text = buildConfirmText(body)
  const rows = text
    .split('\n')
    .map((line) => `<p style="margin:0 0 8px;font-family:Arial,sans-serif;font-size:15px;line-height:1.5;color:#12283c;">${escapeHtml(line) || '&nbsp;'}</p>`)
    .join('')
  return `<!doctype html><html><body style="background:#f4f7fb;padding:24px;">
  <div style="max-width:560px;margin:0 auto;background:#fff;border:1px solid #d7e2ec;padding:24px;">
    <p style="margin:0 0 16px;font-family:Arial,sans-serif;font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:#1aa3a3;">HCQ Coaching and Compliant</p>
    ${rows}
  </div>
</body></html>`
}

async function sendResend(apiKey, payload, attempt = 1) {
  const upstream = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  const raw = await upstream.text()
  let parsed = {}
  if (raw) {
    try {
      parsed = JSON.parse(raw)
    } catch {
      parsed = { raw }
    }
  }

  if (!upstream.ok && attempt < 2 && upstream.status >= 500) {
    await new Promise((r) => setTimeout(r, 400))
    return sendResend(apiKey, payload, attempt + 1)
  }

  return { ok: upstream.ok, status: upstream.status, parsed }
}

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.status(204).end()
    return
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  const apiKey = process.env.RESEND_API_KEY?.trim()
  if (!apiKey) {
    res.status(503).json({
      error: 'E-Mail-Versand ist nicht konfiguriert (RESEND_API_KEY fehlt in Vercel).',
      code: 'RESEND_NOT_CONFIGURED',
      setup: 'https://resend.com → API Key → Vercel Environment Variable RESEND_API_KEY → Redeploy',
    })
    return
  }

  const to = process.env.BOOKING_TO_EMAIL?.trim() || DEFAULT_TO
  const from = process.env.BOOKING_FROM_EMAIL?.trim() || DEFAULT_FROM
  const body = req.body ?? {}
  const applicantEmail = asString(body.email, '')

  if (!isEmail(applicantEmail)) {
    res.status(400).json({ error: 'Gültige E-Mail-Adresse des Anmelders ist erforderlich.' })
    return
  }

  try {
    const owner = await sendResend(apiKey, {
      from,
      to: [to],
      reply_to: applicantEmail,
      subject: buildOwnerSubject(body),
      text: buildOwnerText(body),
    })

    if (!owner.ok) {
      res.status(502).json({
        error: 'Benachrichtigung an HCQ fehlgeschlagen.',
        code: 'OWNER_MAIL_FAILED',
        status: owner.status,
        detail: owner.parsed,
      })
      return
    }

    const confirm = await sendResend(apiKey, {
      from,
      to: [applicantEmail],
      reply_to: to,
      subject: buildConfirmSubject(body),
      text: buildConfirmText(body),
      html: buildConfirmHtml(body),
    })

    if (!confirm.ok) {
      res.status(502).json({
        error: 'Bestätigungsmail an Anmelder fehlgeschlagen.',
        code: 'CONFIRM_MAIL_FAILED',
        status: confirm.status,
        ownerId: owner.parsed.id ?? null,
        detail: confirm.parsed,
      })
      return
    }

    res.status(200).json({
      ok: true,
      provider: 'resend',
      ownerId: owner.parsed.id ?? null,
      confirmationId: confirm.parsed.id ?? null,
      confirmationEmailSent: true,
    })
  } catch (error) {
    res.status(502).json({
      error: error instanceof Error ? error.message : 'E-Mail-Versand fehlgeschlagen',
      code: 'MAIL_EXCEPTION',
    })
  }
}
