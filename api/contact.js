/**
 * Kontakt-/Lead-Formular via Resend:
 * 1) Benachrichtigung an HCQ
 * 2) Bestätigungsmail an Absender
 *
 * Pflicht: RESEND_API_KEY
 */

const DEFAULT_TO = 'info@hampacorequality.de'
const DEFAULT_FROM = 'HCQ Hampa Core Quality <info@hampacorequality.de>'

function asString(value, fallback = '') {
  if (typeof value === 'string') return value.trim()
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

async function sendResend(apiKey, payload) {
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

  return { ok: upstream.ok, status: upstream.status, parsed }
}

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
    return res.status(204).end()
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Content-Type', 'application/json; charset=utf-8')

  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    return res.status(503).json({ error: 'RESEND_NOT_CONFIGURED', ok: false })
  }

  let body = req.body
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body)
    } catch {
      return res.status(400).json({ error: 'Invalid JSON' })
    }
  }
  body = body && typeof body === 'object' ? body : {}

  const name = asString(body.name)
  const company = asString(body.company)
  const email = asString(body.email)
  const phone = asString(body.phone)
  const message = asString(body.message)
  const source = asString(body.source, 'website')

  if (!name || !company || !isEmail(email) || !phone) {
    return res.status(400).json({ error: 'VALIDATION', ok: false })
  }

  const to = asString(process.env.CONTACT_TO_EMAIL || process.env.BOOKING_TO_EMAIL, DEFAULT_TO)
  const from = asString(process.env.CONTACT_FROM_EMAIL || process.env.BOOKING_FROM_EMAIL, DEFAULT_FROM)

  const ownerText = [
    '=== Website-Anfrage ===',
    `Quelle: ${source}`,
    `Name: ${name}`,
    `Unternehmen: ${company}`,
    `E-Mail: ${email}`,
    `Telefon: ${phone}`,
    '',
    'Nachricht:',
    message || '—',
  ].join('\n')

  const owner = await sendResend(apiKey, {
    from,
    to: [to],
    reply_to: email,
    subject: 'NIS2 Audit ready check',
    text: ownerText,
  })

  if (!owner.ok) {
    return res.status(502).json({
      error: 'OWNER_MAIL_FAILED',
      ok: false,
      detail: owner.parsed,
      status: owner.status,
    })
  }

  const greeting = name ? `Guten Tag ${name},` : 'Guten Tag,'
  const confirmText = [
    greeting,
    '',
    'vielen Dank für Ihre Anfrage an Hampa Core Quality.',
    'Wir haben Ihre Nachricht erhalten und melden uns innerhalb von 24 Stunden.',
    '',
    `Unternehmen: ${company}`,
    `Telefon: ${phone}`,
    message ? `Ihre Nachricht: ${message}` : '',
    '',
    'Mit freundlichen Grüßen',
    'HCQ Coaching and Compliant',
    'Rainer Hampicke',
    to,
  ]
    .filter(Boolean)
    .join('\n')

  const confirmHtml = `<!doctype html><html><body style="background:#f4f7fb;padding:24px;">
  <div style="max-width:560px;margin:0 auto;background:#fff;border:1px solid #d7e2ec;padding:24px;">
    <p style="margin:0 0 16px;font-family:Arial,sans-serif;font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:#1aa3a3;">HCQ Hampa Core Quality</p>
    ${confirmText
      .split('\n')
      .map(
        (line) =>
          `<p style="margin:0 0 8px;font-family:Arial,sans-serif;font-size:15px;line-height:1.5;color:#12283c;">${escapeHtml(line) || '&nbsp;'}</p>`,
      )
      .join('')}
  </div>
</body></html>`

  const confirmation = await sendResend(apiKey, {
    from,
    to: [email],
    subject: 'Ihre Anfrage – Hampa Core Quality',
    text: confirmText,
    html: confirmHtml,
  })

  if (!confirmation.ok) {
    return res.status(502).json({
      error: 'CONFIRM_MAIL_FAILED',
      ok: false,
      ownerId: owner.parsed.id ?? null,
      detail: confirmation.parsed,
      status: confirmation.status,
    })
  }

  return res.status(200).json({
    ok: true,
    ownerId: owner.parsed.id ?? null,
    confirmationId: confirmation.parsed.id ?? null,
    confirmationEmailSent: true,
  })
}
