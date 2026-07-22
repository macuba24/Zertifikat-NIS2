import type { VercelRequest, VercelResponse } from '@vercel/node'

/**
 * Thin proxy: Landingpage → this function → Make.com / Zapier.
 * Avoids browser CORS against Make webhooks. No business logic here.
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

  const webhook = process.env.BOOKING_WEBHOOK_URL
  if (!webhook) {
    res.status(500).json({ error: 'BOOKING_WEBHOOK_URL is not configured' })
    return
  }

  try {
    const upstream = await fetch(webhook, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body ?? {}),
    })

    const text = await upstream.text()
    let payload: Record<string, unknown> = { ok: upstream.ok }

    if (text) {
      try {
        const parsed = JSON.parse(text) as Record<string, unknown>
        payload = { ok: upstream.ok, ...parsed }
      } catch {
        payload = { ok: upstream.ok, raw: text }
      }
    }

    if (!upstream.ok) {
      res.status(502).json({
        error: 'Upstream webhook failed',
        status: upstream.status,
        ...payload,
      })
      return
    }

    res.status(200).json(payload)
  } catch (error) {
    res.status(502).json({
      error: error instanceof Error ? error.message : 'Proxy request failed',
    })
  }
}
