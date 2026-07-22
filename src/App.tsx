import { useEffect } from 'react'
import { Agenda } from './components/Agenda'
import { CtaForm } from './components/CtaForm'
import { Footer } from './components/Footer'
import { Hero } from './components/Hero'
import { Problem } from './components/Problem'
import { Rules } from './components/Rules'

export default function App() {
  useEffect(() => {
    const sections = document.querySelectorAll<HTMLElement>('.section')
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced) {
      sections.forEach((el) => el.classList.add('is-visible'))
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible')
            observer.unobserve(entry.target)
          }
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' },
    )

    sections.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  return (
    <div id="top" className="page">
      <Hero />
      <main>
        <Problem />
        <Agenda />
        <Rules />
        <CtaForm />
      </main>
      <Footer />
    </div>
  )
}
