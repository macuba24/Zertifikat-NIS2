import { problem } from '../content'

export function Problem() {
  return (
    <section className="section section--problem" id="problem" aria-labelledby="problem-title">
      <div className="section__inner section__inner--narrow">
        <h2 id="problem-title" className="section__title">
          {problem.title}
        </h2>
        <div className="problem-sentences">
          {problem.sentences.map((sentence) => (
            <p key={sentence} className="problem-sentences__item">
              {sentence}
            </p>
          ))}
        </div>
      </div>
    </section>
  )
}
