# Zertifikatsschulung

Landingpage für die **Executive-Pflichtschulung NIS-2 & Cyber Resilience Act (CRA)** – rechtssicherer Haftungsschutz für Geschäftsführer und leitende Angestellte.

## Entwicklung

```bash
npm install
cp .env.example .env   # optional: Make-Webhook eintragen
npm run dev
```

## Build / Vercel

```bash
npm run build
```

Statisches `dist/` auf Vercel deployen. Server-Env: `BOOKING_WEBHOOK_URL` (Make-Webhook). Details: [`docs/AUTOMATION.md`](docs/AUTOMATION.md).

## Automatisierung (Make.com)

Kein eigener Server. Flow: Formular → Make → Stripe/Mollie → grüner Haken → Zoom → Testat → Wochenend-Briefing.

Details: [`docs/AUTOMATION.md`](docs/AUTOMATION.md)

## Texte

Marketing-Copy: [`src/content.ts`](src/content.ts)

## Rechtliches vor Go-Live

Impressum, Datenschutz und AGB-Platzhalter im Footer durch echte Angaben ersetzen.
