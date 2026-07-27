# Zertifikatsschulung

Landingpage für die **Executive-Pflichtschulung NIS-2 & Cyber Resilience Act (CRA)** – rechtssicherer Haftungsschutz für Geschäftsführer und leitende Angestellte.

## Entwicklung

```bash
npm install
cp .env.example .env   # optional: VITE_FORCE_MAILTO / Kontakt-Mail
npm run dev
```

## Build / Vercel

```bash
npm run build
```

Statisches `dist/` auf Vercel. Server-Env: `RESEND_API_KEY`, optional `BOOKING_TO_EMAIL`. Details: [`docs/AUTOMATION.md`](docs/AUTOMATION.md).

## Anmeldungen

Formular → `/api/booking` → Resend → dein Postfach **plus** Bestätigungsmail an den Anmelder.

## Texte

Marketing-Copy: [`src/content.ts`](src/content.ts)

## Rechtliches vor Go-Live

Impressum, Datenschutz und AGB-Platzhalter im Footer durch echte Angaben ersetzen.
