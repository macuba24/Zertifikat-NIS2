import { useState, type FormEvent } from 'react'
import { lead } from '../content'
import { submitLead } from '../lib/booking'

type FormState = 'idle' | 'submitting' | 'success' | 'error'

export function LeadGen() {
  const [state, setState] = useState<FormState>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    const formData = new FormData(form)
    const payload = {
      name: String(formData.get('name') ?? '').trim(),
      company: String(formData.get('company') ?? '').trim(),
      email: String(formData.get('email') ?? '').trim(),
      phone: String(formData.get('phone') ?? '').trim(),
      market: String(formData.get('market') ?? '').trim(),
    }

    setState('submitting')
    setErrorMessage('')

    try {
      await submitLead(payload)
      setState('success')
      form.reset()
    } catch (error) {
      setState('error')
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Senden fehlgeschlagen. Bitte später erneut versuchen.',
      )
    }
  }

  return (
    <section className="section section--lead" id={lead.id} aria-labelledby="lead-title">
      <div className="section__inner section__inner--cta">
        <div className="cta-intro">
          <p className="section__eyebrow">Lead-Generator</p>
          <h2 id="lead-title" className="section__title">
            {lead.title}
          </h2>
          <p className="section__lead">{lead.lead}</p>
        </div>

        {state === 'success' ? (
          <div className="form-success" role="status">
            <h3 className="form-success__title">{lead.successTitle}</h3>
            <p className="form-success__text">{lead.successText}</p>
            <div className="funnel-actions">
              <button type="button" className="btn btn--ghost" onClick={() => setState('idle')}>
                Weiteren Lead
              </button>
              <a className="btn btn--primary" href="#anmeldung">
                {lead.bookCta}
              </a>
            </div>
          </div>
        ) : (
          <form className="cta-form lead-form" onSubmit={handleSubmit}>
            <div className="cta-form__grid">
              <label className="field">
                <span className="field__label">{lead.fields.name}</span>
                <input className="field__input" name="name" required autoComplete="name" />
              </label>
              <label className="field">
                <span className="field__label">{lead.fields.company}</span>
                <input
                  className="field__input"
                  name="company"
                  required
                  autoComplete="organization"
                />
              </label>
              <label className="field">
                <span className="field__label">{lead.fields.email}</span>
                <input
                  className="field__input"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                />
              </label>
              <label className="field">
                <span className="field__label">{lead.fields.phone}</span>
                <input className="field__input" name="phone" type="tel" autoComplete="tel" />
              </label>
              <label className="field field--full">
                <span className="field__label">{lead.fields.market}</span>
                <select className="field__input" name="market" required defaultValue="">
                  <option value="" disabled>
                    Bitte wählen
                  </option>
                  {lead.marketOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <label className="field field--check">
              <input type="checkbox" name="consent" required />
              <span>{lead.consent}</span>
            </label>
            {state === 'error' && (
              <p className="form-error" role="alert">
                {errorMessage}
              </p>
            )}
            <div className="funnel-actions">
              <button className="btn btn--primary" type="submit" disabled={state === 'submitting'}>
                {state === 'submitting' ? lead.submitting : lead.submit}
              </button>
              <a className="btn btn--ghost" href="#anmeldung">
                {lead.bookCta}
              </a>
            </div>
          </form>
        )}
      </div>
    </section>
  )
}
