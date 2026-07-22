import { agenda } from '../content'

export function Agenda() {
  return (
    <section className="section section--agenda" id="ablauf" aria-labelledby="agenda-title">
      <div className="section__inner">
        <h2 id="agenda-title" className="section__title">
          {agenda.title}
        </h2>
        <ol className="agenda-list">
          {agenda.items.map((item) => (
            <li key={item.time} className="agenda-list__item">
              <span className="agenda-list__time">{item.time}</span>
              <div>
                <h3 className="agenda-list__title">{item.title}</h3>
                <p className="agenda-list__text">{item.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
