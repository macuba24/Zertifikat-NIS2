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
  mode: 'api' | 'formsubmit' | 'mailto'
  checkoutUrl?: string
  confirmationEmailSent?: boolean
  /** Confirmation text shown on-page */
  confirmation?: {
    subject: string
    text: string
    to: string
  }
}

const contactEmail =
  (import.meta.env.VITE_CONTACT_EMAIL as string | undefined) ||
  'info@hampacorequality.de'

const BOOKING_ENDPOINT = '/api/booking'
const WORKSHOP_WHEN = 'Samstag, 15.08.2026, 09:00 – 12:00 Uhr (Live via Google Meet)'

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
    'Preis: 1.000 € netto zzgl. MwSt.',
    '',
    'Als Nächstes erhalten Sie Checkout-Link oder Rechnung von uns.',
    'Google-Meet-Zugang und Testat folgen erst nach Zahlungseingang',
    '(spätestens 1 Woche vor dem Termin).',
    '',
    'Mit freundlichen Grüßen',
    'HCQ Coaching and Compliant',
    'Rainer Hampicke',
    contactEmail,
  ].join('\n')
  return { subject, text, to: data.email }
}

type FallbackMeta = {
  to?: string
  ownerSubject?: string
  ownerText?: string
  confirmSubject?: string
  confirmText?: string
}

function defaultConfirmText(event: BookingEvent | LeadEvent): string {
  const name =
    'gfName' in event && event.gfName
      ? event.gfName
      : 'name' in event
        ? event.name
        : ''
  const greeting = name ? `Guten Tag ${name},` : 'Guten Tag,'
  if (event.event === 'lead.created') {
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
      contactEmail,
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
    contactEmail,
  ].join('\n')
}

function defaultOwnerText(event: BookingEvent | LeadEvent): string {
  if (event.event === 'lead.created') {
    return [
      '=== Lead Zertifikatsschulung ===',
      `Name des Teilnehmers: ${event.name}`,
      `Unternehmen: ${event.company}`,
      `E-Mail: ${event.email}`,
      `Telefon: ${event.phone || '—'}`,
      `Markt: ${event.market}`,
      `Zeitpunkt: ${event.createdAt}`,
    ].join('\n')
  }
  return [
    '=== Buchungsanfrage Zertifikatsschulung ===',
    `Name des Teilnehmers: ${event.gfName}`,
    `Unternehmen: ${event.company}`,
    `Rechtsform: ${event.legalForm}`,
    `USt-IdNr.: ${event.vatId || '—'}`,
    `E-Mail: ${event.email}`,
    `Telefon: ${event.phone || '—'}`,
    `Markt: ${event.market}`,
    `Zahlungsart: ${event.paymentMethod}`,
    `Bemerkung: ${event.notes || '—'}`,
    `Status: ${event.status}`,
    `Preis: ${event.priceNetEur} ${event.currency} netto`,
    `Zeitpunkt: ${event.createdAt}`,
  ].join('\n')
}

async function postFormSubmit(
  event: BookingEvent | LeadEvent,
  meta: FallbackMeta = {},
): Promise<SubmitResult> {
  const to = meta.to || contactEmail
  const participantName = 'gfName' in event ? event.gfName : event.name
  const ownerSubject =
    meta.ownerSubject ||
    (event.event === 'lead.created'
      ? `Lead Zertifikatsschulung – ${participantName} / ${event.company}`
      : `Buchung Zertifikatsschulung – ${participantName} / ${event.company}`)
  const ownerText = meta.ownerText || defaultOwnerText(event)

  const formData = new FormData()
  formData.append('_subject', ownerSubject)
  formData.append('_template', 'table')
  formData.append('_captcha', 'false')
  formData.append('name', participantName)
  formData.append('Name des Teilnehmers', participantName)
  formData.append('email', event.email)
  formData.append('company', event.company)
  formData.append('message', ownerText)
  formData.append('event', event.event)
  if (event.email.includes('@')) {
    formData.append('_replyto', event.email)
  }

  const response = await fetch(`https://formsubmit.co/ajax/${encodeURIComponent(to)}`, {
    method: 'POST',
    headers: { Accept: 'application/json' },
    body: formData,
  })

  const text = await response.text()
  let parsed: { success?: string | boolean; message?: string; error?: string } = {}
  if (text) {
    try {
      parsed = JSON.parse(text) as typeof parsed
    } catch {
      /* ignore */
    }
  }

  const ok =
    response.ok &&
    (parsed.success === true ||
      parsed.success === 'true' ||
      String(parsed.message || '')
        .toLowerCase()
        .includes('success'))

  if (!ok) {
    throw new Error(
      parsed.error ||
        parsed.message ||
        `FormSubmit fehlgeschlagen (${response.status})`,
    )
  }

  // FormSubmit liefert nur an HCQ; Bestätigung an Teilnehmer braucht Resend.
  if (event.event === 'booking.created' && event.email.includes('@')) {
    return {
      mode: 'formsubmit',
      confirmationEmailSent: false,
      confirmation: buildBookingConfirmation(event),
    }
  }

  return {
    mode: 'formsubmit',
    confirmationEmailSent: false,
    confirmation:
      event.event === 'lead.created'
        ? {
            subject: 'Anfrage eingegangen – Zertifikatsschulung',
            text: defaultConfirmText(event),
            to: event.email,
          }
        : undefined,
  }
}

async function postEvent(
  event: BookingEvent | LeadEvent,
  mailtoFallback: () => SubmitResult,
): Promise<SubmitResult> {
  const forceMailto = import.meta.env.VITE_FORCE_MAILTO === 'true'

  if (forceMailto) {
    return mailtoFallback()
  }

  let fallbackMeta: FallbackMeta = {}

  try {
    const response = await fetch(BOOKING_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(event),
    })

    if (import.meta.env.DEV && (response.status === 404 || response.status === 405)) {
      return await postFormSubmit(event).catch(() => mailtoFallback())
    }

    const contentType = response.headers.get('content-type') ?? ''
    let json: Record<string, unknown> = {}
    if (contentType.includes('application/json')) {
      try {
        json = (await response.json()) as Record<string, unknown>
      } catch {
        /* ignore */
      }
    }

    if (response.ok) {
      const confirmation =
        event.event === 'booking.created'
          ? buildBookingConfirmation(event)
          : event.email.includes('@')
            ? {
                subject: 'Anfrage eingegangen – Zertifikatsschulung',
                text: defaultConfirmText(event),
                to: event.email,
              }
            : undefined
      return {
        mode: 'api',
        checkoutUrl: typeof json.checkoutUrl === 'string' ? json.checkoutUrl : undefined,
        confirmationEmailSent: Boolean(json.confirmationId) && !json.confirmationError,
        confirmation,
      }
    }

    if (json.clientFallback) {
      fallbackMeta = {
        to: typeof json.to === 'string' ? json.to : contactEmail,
        ownerSubject: typeof json.ownerSubject === 'string' ? json.ownerSubject : undefined,
        ownerText: typeof json.ownerText === 'string' ? json.ownerText : undefined,
        confirmSubject:
          typeof json.confirmSubject === 'string' ? json.confirmSubject : undefined,
        confirmText: typeof json.confirmText === 'string' ? json.confirmText : undefined,
      }
      return await postFormSubmit(event, fallbackMeta)
    }

    throw new Error(
      typeof json.error === 'string'
        ? `Übermittlung fehlgeschlagen: ${json.error}`
        : `Übermittlung fehlgeschlagen (${response.status})`,
    )
  } catch (error) {
    console.error('booking primary path failed, trying FormSubmit', error)
    try {
      return await postFormSubmit(event, fallbackMeta)
    } catch (fallbackError) {
      console.error('formsubmit failed, mailto fallback', fallbackError)
      return mailtoFallback()
    }
  }
}

function bookingMailto(data: BookingPayload): SubmitResult {
  const confirmation = buildBookingConfirmation(data)
  const subject = encodeURIComponent(
    `Buchung Executive-Pflichtschulung – ${data.gfName} / ${data.company}`,
  )
  const body = encodeURIComponent(
    [
      '=== Buchungsanfrage ===',
      `Name des Teilnehmers: ${data.gfName}`,
      `Unternehmen: ${data.company}`,
      `Rechtsform: ${data.legalForm}`,
      `USt-IdNr.: ${data.vatId || '—'}`,
      `E-Mail: ${data.email}`,
      `Telefon: ${data.phone || '—'}`,
      `Markt: ${data.market}`,
      '',
      '=== Rechnungsadresse ===',
      data.billingSame === 'on'
        ? 'Entspricht Unternehmenssitz'
        : [`Strasse: ${data.street}`, `PLZ/Ort: ${data.zip} ${data.city}`, `Land: ${data.country}`].join(
            '\n',
          ),
      '',
      `Zahlungsart: ${data.paymentMethod}`,
      `Bemerkung: ${data.notes || '—'}`,
      '',
      'Status: pending_payment | 1.000 € zzgl. MwSt.',
    ].join('\n'),
  )
  // Anfrage an HCQ + Bestätigung an Teilnehmer (BCC an HCQ).
  window.location.href = `mailto:${contactEmail}?subject=${subject}&body=${body}&cc=${encodeURIComponent(data.email)}`
  return { mode: 'mailto', confirmationEmailSent: false, confirmation }
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
