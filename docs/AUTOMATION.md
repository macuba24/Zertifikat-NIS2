# Automatisierung: Resend → Postfach

Siehe **[`RESEND-SETUP.md`](./RESEND-SETUP.md)** — das ist der verbindliche Versandweg.

```mermaid
flowchart LR
  Form[Landingpage_Formular] --> Api["/api/booking"]
  Api --> Resend[Resend]
  Resend --> InboxHCQ[info@hampacorequality.de]
  Resend --> InboxUser[Bestätigung an Anmelder]
```

## Env (Vercel)

| Variable | Pflicht | Zweck |
| --- | --- | --- |
| `RESEND_API_KEY` | ja | Resend API Key |
| `BOOKING_TO_EMAIL` | nein | Default `info@hampacorequality.de` |
| `BOOKING_FROM_EMAIL` | nein | Default Resend-Onboarding-Absender |

Lokal (`npm run dev`) gibt es keine Vercel-Function — Buchungstest erfolgt gegen das Deploy oder `vercel dev`.
