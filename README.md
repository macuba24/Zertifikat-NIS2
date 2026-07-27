# Zertifikatsschulung

Landingpage für die **Executive-Pflichtschulung NIS-2 & Cyber Resilience Act (CRA)**.

## Entwicklung

```bash
npm install
cp .env.example .env
npm run dev
```

API-Mails lokal testen: `npx vercel dev` (mit `RESEND_API_KEY` in `.env`).

## Build / Vercel

```bash
npm run build
```

**Pflicht für Bestätigungsmails:** `RESEND_API_KEY` in Vercel — Anleitung [`docs/RESEND-SETUP.md`](docs/RESEND-SETUP.md).

## Anmeldungen

Formular → `/api/booking` → Resend:

1. Mail an `info@hampacorequality.de`
2. Bestätigungsmail an den Anmelder

## Texte

[`src/content.ts`](src/content.ts)
