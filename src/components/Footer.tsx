import { useState } from 'react'
import { footer } from '../content'

type LegalPane = 'impressum' | 'datenschutz' | 'agb' | null

export function Footer() {
  const [open, setOpen] = useState<LegalPane>(null)

  const content =
    open === 'impressum'
      ? { title: footer.impressumTitle, blocks: footer.impressumBlocks }
      : open === 'datenschutz'
        ? { title: footer.datenschutzTitle, blocks: footer.datenschutzBlocks }
        : open === 'agb'
          ? { title: footer.termsTitle, blocks: footer.termsBlocks }
          : null

  function toggle(pane: LegalPane) {
    setOpen((current) => (current === pane ? null : pane))
  }

  return (
    <footer className="footer" id="rechtliches">
      <div className="footer__inner">
        <div className="footer__brand-block">
          <img
            className="footer__logo"
            src="/logo-hcq.png"
            alt="HCQ Coaching and Compliant – Structure | Guidance | Integrity"
          />
          <p className="footer__brand">{footer.brand}</p>
          <p className="footer__note">{footer.note}</p>
        </div>
        <nav className="footer__nav" aria-label="Rechtliches">
          <button type="button" className="footer__link" onClick={() => toggle('impressum')}>
            {footer.impressum}
          </button>
          <button type="button" className="footer__link" onClick={() => toggle('datenschutz')}>
            {footer.datenschutz}
          </button>
          <button type="button" className="footer__link" onClick={() => toggle('agb')}>
            {footer.agb}
          </button>
        </nav>
      </div>
      {content && (
        <div className="footer__legal" role="region" aria-live="polite">
          <h3 className="footer__legal-title">{content.title}</h3>
          {content.blocks.map((block) => (
            <p key={block}>{block}</p>
          ))}
        </div>
      )}
    </footer>
  )
}
