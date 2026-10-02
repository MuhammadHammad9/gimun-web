import type { CSSProperties } from 'react';

/**
 * A process in order: large numerals (the order is the point), a title and
 * a line of explanation, each step rising slightly as it scrolls in. The
 * list itself carries the numbering for assistive tech.
 */
export function Steps({ steps, accent }: { steps: { title: string; body: string }[]; accent: 'gimun' | 'gmc' }) {
  const style = { '--step-accent': accent === 'gimun' ? 'var(--color-accent-gimun)' : 'var(--color-accent-gmc)' } as CSSProperties;
  return (
    <ol className="steps" style={style}>
      {steps.map((step, index) => (
        <li key={step.title} className="step rise">
          <span className="step__num" aria-hidden="true">
            {String(index + 1).padStart(2, '0')}
          </span>
          <div>
            <h3 className="step__title">{step.title}</h3>
            <p className="step__body">{step.body}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}
