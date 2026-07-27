# Anmeldungen: Vercel + Resend → Postfach

Schlanke Architektur: Landingpage auf Vercel, Buchungen per E-Mail ins Postfach (kein Make nötig).

```mermaid
flowchart LR
  Form[Landingpage_Formular] --> Api["/api/booking"]
  Api --> Resend[Resend]
  Resend --> Inbox[Postfach BOOKING_TO_EMAIL]
```

## Umgebungsvariablen (Vercel)

| Variable | Pflicht | Zweck |
| --- | --- | --- |
| `RESEND_API_KEY` | ja | API-Key von [resend.com](https://resend.com) |
| `BOOKING_TO_EMAIL` | nein | Empfänger (Default: `info@hampacorequality.de`) |
| `BOOKING_FROM_EMAIL` | nein | Absender; Default Resend-Onboarding `onboarding@resend.dev` |
| `VITE_CONTACT_EMAIL` | nein | Mailto-Fallback nur lokal |
| `VITE_FORCE_MAILTO=true` | nein | Lokal: Formular nur per Mailto testen |

### Vercel einrichten

1. Account auf https://resend.com → **API Key** erzeugen
2. Vercel Project → **Settings → Environment Variables**:
   - `RESEND_API_KEY` = `re_…`
   - `BOOKING_TO_EMAIL` = deine Zieladresse (optional)
3. Redeploy (damit die Function die Env sieht)
4. Testbuchung auf der Live-Seite → Mail im Postfach prüfen

> Mit dem Default-Absender `onboarding@resend.dev` liefert Resend oft nur an die **Account-E-Mail** bei Resend. Für Zustellung an `info@…` Domain in Resend verifizieren und `BOOKING_FROM_EMAIL` setzen.

## Payload

Die Landingpage POSTet JSON auf **`/api/booking`**. Die Function sendet:

1. **interne Mail** an `BOOKING_TO_EMAIL` (dein Postfach)
2. **Bestätigungsmail** an die E-Mail-Adresse des Anmelders (Buchung oder Lead)

Antwort bei Erfolg: `{ "ok": true, "id": "…", "confirmationId": "…" }`.

Lokal (`npm run dev`) gibt es keine Vercel-Function — dann Mailto-Fallback an `VITE_CONTACT_EMAIL`.

## Später optional (Zahlung / Testat)

Checkout, Google-Meet-Freigabe und Testat können später wieder per Make/Sheet ergänzt werden. Der aktuelle Go-Live-Pfad ist: **Formular → E-Mail ins Postfach**.
