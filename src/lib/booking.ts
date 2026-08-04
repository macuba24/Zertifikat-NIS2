export type BookingPayload = {
  company: string
  legalForm: string
  vatId: string
  gfName: string
  email: string
  phone: string
  market: string
  street: string
  zip: string
  city: string
  country: string
  billingSame: string
  paymentMethod: string
  notes: string
}

export type LeadPayload = {
  name: string
  company: string
  email: string
  phone: string
  market: string
}

export type BookingEvent = BookingPayload & {
  event: 'booking.created'
  status: 'pending_payment'
  product: 'nis2-nisg2026-cra-executive-workshop'
  priceNetEur: 500
  currency: 'EUR'
  createdAt: string
  source: 'landingpage'
}

export type LeadEvent = LeadPayload & {
  event: 'lead.created'
  status: 'new_lead'
  product: 'nis2-nisg2026-cra-executive-workshop'
  createdAt: string
  source: 'landingpage-lead-gen'
}

export type SubmitResult = {
  mode: 'api'
  checkoutUrl?: string
  confirmationEmailSent: boolean
  confirmation: {
    subject: string
    text: string
    to: string
  }
}

const BOOKING_ENDPOINT = '/api/booking'
const WORKSHOP_WHEN = 'Samstag, 12.09.2026, 09:00 – 12:00 Uhr (Live-Online-Schulung)'
const contactEmail =
  (import.meta.env.VITE_CONTACT_EMAIL as string | undefined) ||
  'info@hampacorequality.de'

export function buildBookingConfirmation(data: BookingPayload): {
  subject: string
  text: string
  to: string
} {
  const subject = 'Buchungsbestätigung – Zertifikatsschulung NIS-2 / NISG 2026 / CRA'
  const text = [
    `Guten Tag ${data.gfName},`,
    '',
    'hiermit bestätigen wir Ihre Anmeldung zur Executive-Pflichtschulung.',
    '',
    `Teilnehmer: ${data.gfName}`,
    `Unternehmen: ${data.company}`,
    `E-Mail: ${data.email}`,
    `Telefon: ${data.phone || '—'}`,
    `Markt: ${data.market}`,
    `Zahlungsart: ${data.paymentMethod}`,
    '',
    `Termin: ${WORKSHOP_WHEN}`,
    'Preis: 500 € netto zzgl. MwSt.',
    '',
    'Als Nächstes erhalten Sie Checkout-Link oder Rechnung von uns.',
    'Zugang und Testat folgen erst nach Zahlungseingang',
    '(spätestens 1 Woche vor dem Termin).',
    '',
    'Mit freundlichen Grüßen',
    'HCQ Coaching and Compliant',
    'Rainer Hampicke',
    contactEmail,
  ].join('\n')
  return { subject, text, to: data.email }
}

async function postToApi(event: BookingEvent | LeadEvent): Promise<{
  checkoutUrl?: string
  confirmationEmailSent: boolean
}> {
  const response = await fetch(BOOKING_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(event),
  })

  let json: Record<string, unknown> = {}
  const contentType = response.headers.get('content-type') ?? ''
  if (contentType.includes('application/json')) {
    try {
      json = (await response.json()) as Record<string, unknown>
    } catch {
      /* ignore */
    }
  }

  if (!response.ok) {
    const code = typeof json.code === 'string' ? json.code : ''
    const error =
      typeof json.error === 'string'
        ? json.error
        : `Übermittlung fehlgeschlagen (${response.status})`
    const setup =
      typeof json.setup === 'string' ? ` ${json.setup}` : code === 'RESEND_NOT_CONFIGURED'
        ? ' Bitte RESEND_API_KEY in Vercel setzen und neu deployen (docs/RESEND-SETUP.md).'
        : ''
    throw new Error(`${error}${setup}`)
  }

  return {
    checkoutUrl: typeof json.checkoutUrl === 'string' ? json.checkoutUrl : undefined,
    confirmationEmailSent: json.confirmationEmailSent === true || Boolean(json.confirmationId),
  }
}

export async function submitBooking(data: BookingPayload): Promise<SubmitResult> {
  const event: BookingEvent = {
    ...data,
    event: 'booking.created',
    status: 'pending_payment',
    product: 'nis2-nisg2026-cra-executive-workshop',
    priceNetEur: 500,
    currency: 'EUR',
    createdAt: new Date().toISOString(),
    source: 'landingpage',
  }
  const result = await postToApi(event)
  return {
    mode: 'api',
    checkoutUrl: result.checkoutUrl,
    confirmationEmailSent: result.confirmationEmailSent,
    confirmation: buildBookingConfirmation(data),
  }
}

export async function submitLead(data: LeadPayload): Promise<SubmitResult> {
  const event: LeadEvent = {
    ...data,
    event: 'lead.created',
    status: 'new_lead',
    product: 'nis2-nisg2026-cra-executive-workshop',
    createdAt: new Date().toISOString(),
    source: 'landingpage-lead-gen',
  }
  const result = await postToApi(event)
  return {
    mode: 'api',
    checkoutUrl: result.checkoutUrl,
    confirmationEmailSent: result.confirmationEmailSent,
    confirmation: {
      subject: 'Anfrage eingegangen – Zertifikatsschulung',
      text: [
        `Guten Tag ${data.name},`,
        '',
        'vielen Dank für Ihre Anfrage. Wir melden uns zeitnah.',
        `Termin: ${WORKSHOP_WHEN}`,
        '',
        'HCQ Coaching and Compliant',
        contactEmail,
      ].join('\n'),
      to: data.email,
    },
  }
}
