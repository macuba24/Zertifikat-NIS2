# Resend einrichten (Bestätigungsmail an Anmelder)

Damit die Buchungsbestätigung **automatisch im Postfach des Anmelders** landet:

## 1. Account

1. https://resend.com öffnen → Sign up (kostenlos)
2. **API Keys** → Create API Key → Key kopieren (`re_…`)

## 2. Vercel

1. https://vercel.com → Projekt **Zertifikat-NIS2** (oder euer Deploy)
2. **Settings → Environment Variables**
3. Neu:
   - Name: `RESEND_API_KEY`
   - Value: `re_…`
   - Environments: Production (+ Preview)
4. Optional:
   - `BOOKING_TO_EMAIL` = `info@hampacorequality.de`
   - `BOOKING_FROM_EMAIL` = `HCQ Zertifikatsschulung <onboarding@resend.dev>`  
     (oder nach Domain-Verifizierung z. B. `anmeldung@hampacorequality.de`)

## 3. Redeploy

Deployments → **Redeploy** (ohne Cache), damit die Function den Key sieht.

## 4. Test

Buchung mit eigener E-Mail absenden → Bestätigung sollte im Posteingang (und ggf. Spam) liegen.

> Mit Absender `onboarding@resend.dev` kann Resend anfangs nur an die **Resend-Account-E-Mail** zustellen. Für echte Kunden-Mails: Domain in Resend verifizieren und `BOOKING_FROM_EMAIL` setzen.
