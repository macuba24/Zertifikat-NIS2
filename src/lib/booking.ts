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
  priceNetEur: 1000
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
  mode: 'api' | 'mailto'
  checkoutUrl?: string
}

const contactEmail =
  (import.meta.env.VITE_CONTACT_EMAIL as string | undefined) ||
  'info@hampacorequality.de'

const BOOKING_ENDPOINT = '/api/booking'

async function postEvent(
  event: BookingEvent | LeadEvent,
  mailtoFallback: () => SubmitResult,
): Promise<SubmitResult> {
  const forceMailto = import.meta.env.VITE_FORCE_MAILTO === 'true'

  if (forceMailto) {
    return mailtoFallback()
  }

  try {
    const response = await fetch(BOOKING_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(event),
    })

    // Local Vite has no /api — mailto only in development.
    if (import.meta.env.DEV && (response.status === 404 || response.status === 405)) {
      return mailtoFallback()
    }

    if (!response.ok) {
      let detail = ''
      try {
        const json = (await response.json()) as { error?: string }
        if (json.error) detail = `: ${json.error}`
      } catch {
        /* ignore */
      }
      throw new Error(`Übermittlung fehlgeschlagen (${response.status})${detail}`)
    }

    let checkoutUrl: string | undefined
    const contentType = response.headers.get('content-type') ?? ''
    if (contentType.includes('application/json')) {
      const json = (await response.json()) as { checkoutUrl?: string }
      if (json.checkoutUrl) checkoutUrl = json.checkoutUrl
    }

    return { mode: 'api', checkoutUrl }
  } catch (error) {
    if (import.meta.env.DEV) {
      return mailtoFallback()
    }
    throw error
  }
}

function bookingMailto(data: BookingPayload): SubmitResult {
  const subject = encodeURIComponent(
    `Buchung Executive-Pflichtschulung – ${data.company}`,
  )
  const body = encodeURIComponent(
    [
      '=== Buchungsanfrage ===',
      `Unternehmen: ${data.company}`,
      `Rechtsform: ${data.legalForm}`,
      `USt-IdNr.: ${data.vatId || '—'}`,
      `Geschäftsführung / Teilnehmer: ${data.gfName}`,
      `E-Mail: ${data.email}`,
      `Telefon: ${data.phone || '—'}`,
      `Markt: ${data.market}`,
      '',
      '=== Rechnungsadresse ===',
      data.billingSame === 'on'
        ? 'Entspricht Unternehmenssitz'
        : [`Straße: ${data.street}`, `PLZ/Ort: ${data.zip} ${data.city}`, `Land: ${data.country}`].join(
            '\n',
          ),
      '',
      `Zahlungsart: ${data.paymentMethod}`,
      `Bemerkung: ${data.notes || '—'}`,
      '',
      'Status: pending_payment | 1.000 € zzgl. MwSt.',
    ].join('\n'),
  )
  window.location.href = `mailto:${contactEmail}?subject=${subject}&body=${body}`
  return { mode: 'mailto' }
}

function leadMailto(data: LeadPayload): SubmitResult {
  const subject = encodeURIComponent(`Lead Zertifikatsschulung – ${data.company}`)
  const body = encodeURIComponent(
    [
      '=== Lead ===',
      `Name: ${data.name}`,
      `Unternehmen: ${data.company}`,
      `E-Mail: ${data.email}`,
      `Telefon: ${data.phone || '—'}`,
      `Markt: ${data.market}`,
      '',
      'Anfrage: Termindetails / Nachweispflicht § 38 BSIG (DE) & NISG 2026 (AT)',
    ].join('\n'),
  )
  window.location.href = `mailto:${contactEmail}?subject=${subject}&body=${body}`
  return { mode: 'mailto' }
}

export async function submitBooking(data: BookingPayload): Promise<SubmitResult> {
  const event: BookingEvent = {
    ...data,
    event: 'booking.created',
    status: 'pending_payment',
    product: 'nis2-nisg2026-cra-executive-workshop',
    priceNetEur: 1000,
    currency: 'EUR',
    createdAt: new Date().toISOString(),
    source: 'landingpage',
  }
  return postEvent(event, () => bookingMailto(data))
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
  return postEvent(event, () => leadMailto(data))
}
