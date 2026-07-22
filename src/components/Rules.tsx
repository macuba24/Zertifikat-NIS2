import { rules } from '../content'

export function Rules() {
  return (
    <section className="section section--rules" id="spielregeln" aria-labelledby="rules-title">
      <div className="section__inner">
        <h2 id="rules-title" className="section__title">
          {rules.title}
        </h2>
        <ul className="rules-list">
          {rules.items.map((item) => (
            <li key={item.title} className="rules-list__item">
              <h3 className="rules-list__title">{item.title}</h3>
              <p className="rules-list__text">{item.text}</p>
            </li>
          ))}
        </ul>
        <p className="rules-disclaimer">{rules.disclaimer}</p>
      </div>
    </section>
  )
}
