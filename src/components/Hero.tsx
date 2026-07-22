import { hero } from '../content'

export function Hero() {
  return (
    <header className="hero">
      <div className="hero__backdrop" aria-hidden="true" />
      <div className="hero__grain" aria-hidden="true" />
      <nav className="hero__nav">
        <a className="hero__brand" href="#top">
          {hero.brand}
        </a>
        <a className="hero__nav-cta" href="#anmeldung">
          {hero.primaryCta}
        </a>
      </nav>
      <div className="hero__content">
        <p className="hero__brand-mark reveal reveal--1">{hero.brand}</p>
        <h1 className="hero__headline reveal reveal--2">{hero.headline}</h1>
        <p className="hero__subline reveal reveal--3">{hero.subline}</p>
        <ul className="hero__facts reveal reveal--4">
          {hero.facts.map((fact) => (
            <li key={fact.label} className="hero__fact">
              <span className="hero__fact-label">{fact.label}</span>
              <span className="hero__fact-text">{fact.text}</span>
            </li>
          ))}
        </ul>
        <div className="hero__actions reveal reveal--4">
          <a className="btn btn--primary" href="#anmeldung">
            {hero.primaryCta} – {hero.price}
          </a>
          <span className="hero__seats">{hero.seats}</span>
        </div>
      </div>
    </header>
  )
}
