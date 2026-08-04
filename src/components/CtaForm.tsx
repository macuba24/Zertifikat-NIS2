import { useState, type FormEvent } from 'react'
import { cta } from '../content'
import {
  buildBookingConfirmation,
  submitBooking,
  type BookingPayload,
} from '../lib/booking'

type FormState = 'idle' | 'submitting' | 'success' | 'error'
type Step = 0 | 1 | 2

function collectPayload(form: HTMLFormElement): BookingPayload {
  const formData = new FormData(form)
  return {
    company: String(formData.get('company') ?? '').trim(),
    legalForm: String(formData.get('legalForm') ?? '').trim(),
    vatId: String(formData.get('vatId') ?? '').trim(),
    gfName: String(formData.get('gfName') ?? '').trim(),
    email: String(formData.get('email') ?? '').trim(),
    phone: String(formData.get('phone') ?? '').trim(),
    market: String(formData.get('market') ?? '').trim(),
    street: String(formData.get('street') ?? '').trim(),
    zip: String(formData.get('zip') ?? '').trim(),
    city: String(formData.get('city') ?? '').trim(),
    country: String(formData.get('country') ?? '').trim(),
    billingSame: formData.get('billingSame') ? 'on' : 'off',
    paymentMethod: String(formData.get('paymentMethod') ?? '').trim(),
    notes: String(formData.get('notes') ?? '').trim(),
  }
}

export function CtaForm() {
  const [state, setState] = useState<FormState>('idle')
  const [step, setStep] = useState<Step>(0)
  const [billingSame, setBillingSame] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [confirmation, setConfirmation] = useState<ReturnType<
    typeof buildBookingConfirmation
  > | null>(null)
  const [emailSent, setEmailSent] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (step < 2) {
      setStep((step + 1) as Step)
      return
    }

    const form = event.currentTarget
    const payload = collectPayload(form)
    setState('submitting')
    setErrorMessage('')

    try {
      const result = await submitBooking(payload)
      if (result.checkoutUrl) {
        window.location.assign(result.checkoutUrl)
        return
      }

      const conf = result.confirmation ?? buildBookingConfirmation(payload)
      setConfirmation(conf)
      setEmailSent(Boolean(result.confirmationEmailSent))
      setState('success')
      setStep(0)
      form.reset()
      setBillingSame(true)
    } catch (error) {
      setState('error')
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Anmeldung fehlgeschlagen. Bitte später erneut versuchen.',
      )
    }
  }

  return (
    <section className="section section--cta" id={cta.id} aria-labelledby="cta-title">
      <div className="section__inner section__inner--cta">
        <div className="cta-intro">
          <h2 id="cta-title" className="section__title">
            {cta.title}
          </h2>
          <p className="section__lead">{cta.lead}</p>
        </div>

        {state === 'success' ? (
          <div className="form-success" role="status">
            <h3 className="form-success__title">{cta.successTitle}</h3>
            <p className="form-success__text">
              {emailSent
                ? cta.successTextEmailSent
                : cta.successTextOnPageOnly}
            </p>
            {confirmation && (
              <div className="form-success__receipt">
                <h4 className="form-success__receipt-title">Ihre Buchungsbestätigung</h4>
                <pre className="form-success__receipt-body">{confirmation.text}</pre>
              </div>
            )}
            <button
              type="button"
              className="btn btn--ghost"
              onClick={() => {
                setState('idle')
                setConfirmation(null)
                setEmailSent(false)
              }}
            >
              Weitere Buchung
            </button>
          </div>
        ) : (
          <form className="cta-form" onSubmit={handleSubmit}>
            <ol className="funnel-steps" aria-label="Buchungsschritte">
              {cta.steps.map((label, index) => (
                <li
                  key={label}
                  className={`funnel-steps__item${step === index ? ' is-active' : ''}${step > index ? ' is-done' : ''}`}
                >
                  <span className="funnel-steps__num">{index + 1}</span>
                  <span className="funnel-steps__label">{label}</span>
                </li>
              ))}
            </ol>

            <div hidden={step !== 0}>
              <div className="cta-form__grid">
                <label className="field field--full">
                  <span className="field__label">{cta.fields.gfName}</span>
                  <input
                    className="field__input"
                    name="gfName"
                    required={step === 0}
                    autoComplete="name"
                    placeholder="Vor- und Nachname"
                  />
                </label>
                <label className="field field--full">
                  <span className="field__label">{cta.fields.company}</span>
                  <input className="field__input" name="company" required={step === 0} autoComplete="organization" />
                </label>
                <label className="field">
                  <span className="field__label">{cta.fields.legalForm}</span>
                  <input className="field__input" name="legalForm" required={step === 0} placeholder="z. B. GmbH / GmbH (AT)" />
                </label>
                <label className="field">
                  <span className="field__label">{cta.fields.vatId}</span>
                  <input className="field__input" name="vatId" autoComplete="off" />
                </label>
                <label className="field">
                  <span className="field__label">{cta.fields.email}</span>
                  <input className="field__input" name="email" type="email" required={step === 0} autoComplete="email" />
                </label>
                <label className="field field--full">
                  <span className="field__label">{cta.fields.phone}</span>
                  <input className="field__input" name="phone" type="tel" autoComplete="tel" />
                </label>
                <label className="field field--full">
                  <span className="field__label">{cta.fields.market}</span>
                  <select className="field__input" name="market" required={step === 0} defaultValue="">
                    <option value="" disabled>
                      Bitte wählen
                    </option>
                    {cta.marketOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            </div>

            <div hidden={step !== 1}>
              <label className="field field--check">
                <input
                  type="checkbox"
                  name="billingSame"
                  checked={billingSame}
                  onChange={(e) => setBillingSame(e.target.checked)}
                />
                <span>{cta.fields.billingSame}</span>
              </label>
              {!billingSame && (
                <div className="cta-form__grid">
                  <label className="field field--full">
                    <span className="field__label">{cta.fields.street}</span>
                    <input className="field__input" name="street" required={step === 1 && !billingSame} autoComplete="street-address" />
                  </label>
                  <label className="field">
                    <span className="field__label">{cta.fields.zip}</span>
                    <input className="field__input" name="zip" required={step === 1 && !billingSame} autoComplete="postal-code" />
                  </label>
                  <label className="field">
                    <span className="field__label">{cta.fields.city}</span>
                    <input className="field__input" name="city" required={step === 1 && !billingSame} autoComplete="address-level2" />
                  </label>
                  <label className="field field--full">
                    <span className="field__label">{cta.fields.country}</span>
                    <input
                      className="field__input"
                      name="country"
                      required={step === 1 && !billingSame}
                      placeholder="Deutschland oder Österreich"
                      autoComplete="country-name"
                    />
                  </label>
                </div>
              )}
            </div>

            <div hidden={step !== 2}>
              <p className="funnel-hint">
                Zahlungseingang erforderlich: Testat und Zugang werden nach Bezahlung freigeschaltet
                (spätestens 1 Woche vor Termin).
              </p>
              <div className="cta-form__grid">
                <label className="field field--full">
                  <span className="field__label">{cta.fields.paymentMethod}</span>
                  <select className="field__input" name="paymentMethod" required={step === 2} defaultValue="">
                    <option value="" disabled>
                      Bitte wählen
                    </option>
                    {cta.paymentOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="field field--full">
                  <span className="field__label">{cta.fields.notes}</span>
                  <textarea className="field__input field__input--area" name="notes" rows={3} />
                </label>
                <label className="field field--check field--full">
                  <input type="checkbox" name="acceptTerms" required={step === 2} />
                  <span>{cta.fields.acceptTerms}</span>
                </label>
              </div>
            </div>

            {state === 'error' && (
              <p className="form-error" role="alert">
                {errorMessage}
              </p>
            )}

            <div className="funnel-actions">
              {step > 0 && (
                <button
                  type="button"
                  className="btn btn--ghost"
                  onClick={() => setStep((step - 1) as Step)}
                >
                  {cta.back}
                </button>
              )}
              <button type="submit" className="btn btn--primary btn--wide" disabled={state === 'submitting'}>
                {state === 'submitting' ? cta.submitting : step < 2 ? cta.next : cta.submit}
              </button>
            </div>
          </form>
        )}
      </div>
    </section>
  )
}
