import { guarantee, hero, urgency } from '../content'

const LOGO_SRC = '/logo-hcq.png'
const LOGO_ALT = 'HCQ Coaching and Compliant – Structure | Guidance | Integrity'

export function Hero() {
  return (
    <header className="hero">
      <div className="urgency-bar" role="status">
        <p className="urgency-bar__text">{urgency.text}</p>
      </div>
      <div className="hero__backdrop" aria-hidden="true" />
      <div className="hero__grain" aria-hidden="true" />
      <nav className="hero__nav">
        <a className="hero__nav-cta" href="#anmeldung">
          {hero.primaryCta}
        </a>
      </nav>
      <div className="hero__brand-banner reveal reveal--1">
        <img className="hero__logo hero__logo--hero" src={LOGO_SRC} alt={LOGO_ALT} />
      </div>
      <div className="hero__content">
        <h1 className="hero__headline reveal reveal--2">{hero.headline}</h1>
        <p className="hero__price-line reveal reveal--2">{hero.priceLine}</p>
        <p className="hero__subline reveal reveal--3">{hero.subline}</p>
        <ul className="hero__facts reveal reveal--4">
          {hero.facts.map((fact) => (
            <li key={fact.label} className="hero__fact">
              <span className="hero__fact-label">{fact.label}</span>
              <span className="hero__fact-text">{fact.text}</span>
            </li>
          ))}
          <li className="hero__fact hero__fact--speaker">
            <span className="hero__fact-label">{hero.speaker.label}</span>
            <div className="speaker">
              <img
                className="speaker__photo"
                src={hero.speaker.photo}
                alt={hero.speaker.photoAlt}
                width={88}
                height={88}
              />
              <div className="speaker__meta">
                <span className="speaker__name">{hero.speaker.name}</span>
                <span className="speaker__title">{hero.speaker.title}</span>
              </div>
            </div>
          </li>
        </ul>
        <div className="hero__actions reveal reveal--4">
          <a className="btn btn--primary" href="#anmeldung">
            {hero.primaryCta} – {hero.price}
          </a>
        </div>
      </div>
      <aside className="guarantee reveal reveal--4" aria-labelledby="guarantee-title">
        <p className="guarantee__eyebrow">Garantie</p>
        <h2 id="guarantee-title" className="guarantee__title">
          {guarantee.title}
        </h2>
        <p className="guarantee__text">{guarantee.text}</p>
        <p className="guarantee__why">{guarantee.why}</p>
        <a className="btn btn--primary" href="#anmeldung">
          {guarantee.cta}
        </a>
      </aside>
    </header>
  )
}
