import type { VercelRequest, VercelResponse } from '@vercel/node'

const DEFAULT_TO = 'info@hampacorequality.de'
const DEFAULT_FROM = 'HCQ Zertifikatsschulung <onboarding@resend.dev>'

type BookingBody = Record<string, unknown>

function asString(value: unknown, fallback = '—'): string {
  if (typeof value === 'string' && value.trim()) return value.trim()
  if (typeof value === 'number') return String(value)
  return fallback
}

function buildSubject(body: BookingBody): string {
  const event = asString(body.event, 'booking.created')
  const company = asString(body.company, 'Unbekannt')
  if (event === 'lead.created') {
    return `Lead Zertifikatsschulung – ${company}`
  }
  return `Buchung Zertifikatsschulung – ${company}`
}

function buildText(body: BookingBody): string {
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

/**
 * Landingpage → Resend → Postfach (BOOKING_TO_EMAIL).
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
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
    res.status(500).json({ error: 'RESEND_API_KEY is not configured' })
    return
  }

  const to = process.env.BOOKING_TO_EMAIL?.trim() || DEFAULT_TO
  const from = process.env.BOOKING_FROM_EMAIL?.trim() || DEFAULT_FROM
  const body = (req.body ?? {}) as BookingBody
  const replyTo = asString(body.email, '')

  try {
    const payload: Record<string, unknown> = {
      from,
      to: [to],
      subject: buildSubject(body),
      text: buildText(body),
    }
    if (replyTo.includes('@')) {
      payload.reply_to = replyTo
    }

    const upstream = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    const text = await upstream.text()
    let parsed: Record<string, unknown> = {}
    if (text) {
      try {
        parsed = JSON.parse(text) as Record<string, unknown>
      } catch {
        parsed = { raw: text }
      }
    }

    if (!upstream.ok) {
      res.status(502).json({
        error: 'Resend email failed',
        status: upstream.status,
        ...parsed,
      })
      return
    }

    res.status(200).json({ ok: true, id: parsed.id ?? null })
  } catch (error) {
    res.status(502).json({
      error: error instanceof Error ? error.message : 'Email send failed',
    })
  }
}
