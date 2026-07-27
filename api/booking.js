/**
 * Landingpage → E-Mail an Postfach + Bestätigung an Anmelder.
 * Primär: Resend (RESEND_API_KEY). Fallback: FormSubmit (kein Key nötig).
 */

const DEFAULT_TO = 'info@hampacorequality.de'
const DEFAULT_FROM = 'HCQ Zertifikatsschulung <onboarding@resend.dev>'
const WORKSHOP_WHEN = 'Samstag, 15.08.2026, 09:00 – 12:00 Uhr (Live via Google Meet)'

function asString(value, fallback = '—') {
  if (typeof value === 'string' && value.trim()) return value.trim()
  if (typeof value === 'number') return String(value)
  return fallback
}

function isEmail(value) {
  return typeof value === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())
}

function buildOwnerSubject(body) {
  const event = asString(body.event, 'booking.created')
  const company = asString(body.company, 'Unbekannt')
  if (event === 'lead.created') {
    return `Lead Zertifikatsschulung – ${company}`
  }
  return `Buchung Zertifikatsschulung – ${company}`
}

function buildOwnerText(body) {
  const event = asString(body.event, 'booking.created')

  if (event === 'lead.created') {
    return [
      '=== Lead Zertifikatsschulung ===',
      `Name: ${asString(body.name)}`,
      `Unternehmen: ${asString(body.company)}`,
      `E-Mail: ${asString(body.email)}`,
      `Telefon: ${asString(body.phone)}`,
      `Markt: ${asString(body.market)}`,
      `Status: ${asString(body.status, 'new_lead')}`,
      `Produkt: ${asString(body.product)}`,
      `Quelle: ${asString(body.source)}`,
      `Zeitpunkt: ${asString(body.createdAt)}`,
    ].join('\n')
  }

  const billingSame = asString(body.billingSame) === 'on'
  const billing = billingSame
    ? 'Entspricht Unternehmenssitz'
    : [
        `Straße: ${asString(body.street)}`,
        `PLZ/Ort: ${asString(body.zip)} ${asString(body.city)}`,
        `Land: ${asString(body.country)}`,
      ].join('\n')

  return [
    '=== Buchungsanfrage Zertifikatsschulung ===',
    `Unternehmen: ${asString(body.company)}`,
    `Rechtsform: ${asString(body.legalForm)}`,
    `USt-IdNr.: ${asString(body.vatId)}`,
    `Geschäftsführung / Teilnehmer: ${asString(body.gfName)}`,
    `E-Mail: ${asString(body.email)}`,
    `Telefon: ${asString(body.phone)}`,
    `Markt: ${asString(body.market)}`,
    '',
    '=== Rechnungsadresse ===',
    billing,
    '',
    `Zahlungsart: ${asString(body.paymentMethod)}`,
    `Bemerkung: ${asString(body.notes)}`,
    '',
    `Status: ${asString(body.status, 'pending_payment')}`,
    `Preis: ${asString(body.priceNetEur, '1000')} ${asString(body.currency, 'EUR')} netto`,
    `Produkt: ${asString(body.product)}`,
    `Quelle: ${asString(body.source)}`,
    `Zeitpunkt: ${asString(body.createdAt)}`,
  ].join('\n')
}

function buildConfirmSubject(body) {
  const event = asString(body.event, 'booking.created')
  if (event === 'lead.created') {
    return 'Ihre Anfrage – Zertifikatsschulung NIS-2 / NISG 2026 / CRA'
  }
  return 'Anmeldung eingegangen – Zertifikatsschulung NIS-2 / NISG 2026 / CRA'
}

function buildConfirmText(body) {
  const event = asString(body.event, 'booking.created')
  const name = asString(body.gfName || body.name, '')
  const greeting = name && name !== '—' ? `Guten Tag ${name},` : 'Guten Tag,'

  if (event === 'lead.created') {
    return [
      greeting,
      '',
      'vielen Dank für Ihre Anfrage zur Executive-Pflichtschulung NIS-2, NISG 2026 & CRA.',
      'Wir haben Ihre Nachricht erhalten und melden uns zeitnah bei Ihnen.',
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
    'vielen Dank – Ihre Anmeldung zur Executive-Pflichtschulung ist bei uns eingegangen.',
    '',
    `Termin: ${WORKSHOP_WHEN}`,
    'Preis: 1.000 € netto zzgl. MwSt.',
    '',
    'Als Nächstes erhalten Sie Checkout-Link oder Rechnung.',
    'Google-Meet-Zugang und Testat folgen erst nach Zahlungseingang',
    '(spätestens 1 Woche vor dem Termin).',
    '',
    'Fragen? Einfach auf diese E-Mail antworten.',
    '',
    'Mit freundlichen Grüßen',
    'HCQ Coaching and Compliant',
    'Rainer Hampicke',
    DEFAULT_TO,
  ].join('\n')
}

async function sendResend(apiKey, payload) {
  const upstream = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  const text = await upstream.text()
  let parsed = {}
  if (text) {
    try {
      parsed = JSON.parse(text)
    } catch {
      parsed = { raw: text }
    }
  }

  return { ok: upstream.ok, status: upstream.status, parsed }
}

/** Key-freier Fallback: FormSubmit → Postfach + Autoresponse an Anmelder. */
async function sendFormSubmit(toEmail, body) {
  const applicantEmail = asString(body.email, '')
  const payload = {
    _subject: buildOwnerSubject(body),
    _template: 'table',
    message: buildOwnerText(body),
    company: asString(body.company),
    name: asString(body.gfName || body.name),
    email: isEmail(applicantEmail) ? applicantEmail.trim() : toEmail,
    event: asString(body.event, 'booking.created'),
    _autoresponse: buildConfirmText(body),
  }
  if (isEmail(applicantEmail)) {
    payload._replyto = applicantEmail.trim()
  }

  const upstream = await fetch(`https://formsubmit.co/ajax/${encodeURIComponent(toEmail)}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(payload),
  })

  const text = await upstream.text()
  let parsed = {}
  if (text) {
    try {
      parsed = JSON.parse(text)
    } catch {
      parsed = { raw: text }
    }
  }

  const ok =
    upstream.ok &&
    (parsed.success === 'true' ||
      parsed.success === true ||
      String(parsed.message || '')
        .toLowerCase()
        .includes('success') ||
      !parsed.error)

  return { ok, status: upstream.status, parsed }
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
  const to = process.env.BOOKING_TO_EMAIL?.trim() || DEFAULT_TO
  const from = process.env.BOOKING_FROM_EMAIL?.trim() || DEFAULT_FROM
  const body = req.body ?? {}
  const applicantEmail = asString(body.email, '')

  try {
    // Preferred path: Resend
    if (apiKey) {
      const ownerPayload = {
        from,
        to: [to],
        subject: buildOwnerSubject(body),
        text: buildOwnerText(body),
      }
      if (isEmail(applicantEmail)) {
        ownerPayload.reply_to = applicantEmail
      }

      const owner = await sendResend(apiKey, ownerPayload)
      if (!owner.ok) {
        res.status(502).json({
          error: 'Resend email failed',
          status: owner.status,
          ...owner.parsed,
        })
        return
      }

      let confirmationId = null
      let confirmationError = null

      if (isEmail(applicantEmail)) {
        const confirm = await sendResend(apiKey, {
          from,
          to: [applicantEmail.trim()],
          reply_to: to,
          subject: buildConfirmSubject(body),
          text: buildConfirmText(body),
        })
        if (confirm.ok) {
          confirmationId = confirm.parsed.id ?? null
        } else {
          confirmationError =
            confirm.parsed.error || confirm.parsed.message || 'confirmation failed'
        }
      }

      res.status(200).json({
        ok: true,
        provider: 'resend',
        id: owner.parsed.id ?? null,
        confirmationId,
        confirmationError,
      })
      return
    }

    // Fallback without Resend key
    const submitted = await sendFormSubmit(to, body)
    if (!submitted.ok) {
      res.status(502).json({
        error: 'FormSubmit email failed',
        status: submitted.status,
        hint: 'Prüfen Sie Spam oder aktivieren Sie FormSubmit per Bestätigungslink in der ersten Mail an das Postfach.',
        ...submitted.parsed,
      })
      return
    }

    res.status(200).json({
      ok: true,
      provider: 'formsubmit',
      id: null,
      confirmationId: isEmail(applicantEmail) ? 'autoresponse' : null,
      confirmationError: null,
    })
  } catch (error) {
    res.status(502).json({
      error: error instanceof Error ? error.message : 'Email send failed',
    })
  }
}
