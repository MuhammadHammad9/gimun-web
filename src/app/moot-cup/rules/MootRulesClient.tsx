'use client';

import { useId, useState, type CSSProperties } from 'react';
import { useSiteConfig } from '@/components/SiteConfigProvider';
import { ChapterHead } from '@/components/sections/Chapter';
import { FilterBar } from '@/components/ui/FilterBar';
import '@/styles/pages/moot-rules.css';

const WORD_LIMIT = 8000;

const FORMAT = [
  {
    term: 'Length',
    value: '8,000 words at most',
    note: 'Counts the pleadings and prayer for relief only. The contents, index of authorities and statement of facts do not count.',
  },
  {
    term: 'Type',
    value: 'Times New Roman',
    note: 'Body 12pt at 1.5 spacing, footnotes 10pt single-spaced, 1-inch (2.54 cm) margins on every side.',
  },
];

const TIMING = [
  { value: '30 min', term: 'per side', note: 'Applicant and Respondent each have thirty minutes, kept by the clerk.' },
  { value: '12 to 18', term: 'minutes per oralist', note: 'Both registered oralists speak; neither for less than 12 or more than 18 minutes.' },
  { value: '3 min', term: 'rebuttal', note: 'Reserved at the start. The Applicant may rebut and the Respondent may reply.' },
];

const SCORING = {
  memorial: [
    { points: 12, title: 'Knowledge of the law', body: 'Command of the case law, treaties and customary rules that decide the problem.' },
    { points: 10, title: 'Structure and persuasion', body: 'A clear roadmap, sound reasoning and facts applied to law.' },
    { points: 10, title: 'Research and sources', body: 'Primary sources, state practice, scholarship and arbitral awards.' },
    { points: 8, title: 'Style and citation', body: 'Consistent footnotes, accurate cross-references, clean grammar and layout.' },
  ],
  oral: [
    { points: 20, title: 'Answering the bench', body: 'Direct, concise answers to the judges’ questions, without evasion.' },
    { points: 18, title: 'Legal argument', body: 'Command of the facts, the burden of proof and the law in issue.' },
    { points: 12, title: 'Courtroom manner', body: 'Formal address, clear delivery and composure under questioning.' },
    { points: 10, title: 'Time and rebuttal', body: 'Keeping to time, a clean prayer and a rebuttal aimed at what was said.' },
  ],
} as const;

/**
 * The detailed rules, as the page's later chapters: the memorial format with
 * a word-count check, the courtroom timings, and the scoring for each part.
 */
export function MootRulesClient() {
  const scoring = useSiteConfig().mootScoring;
  const [part, setPart] = useState<'memorial' | 'oral'>('memorial');
  const [words, setWords] = useState(7450);
  const inputId = useId();
  const over = Math.max(0, words - WORD_LIMIT);
  const deduction = Math.ceil(over / 100);

  return (
    <>
      <section className="chapter" aria-labelledby="format-title">
        <div className="wrap">
          <ChapterHead
            id="format-title"
            chapter={3}
            act="The format"
            title="What a memorial must look like."
            lead={`Citations follow ${scoring?.citationStyle ?? 'the standard confirmed with the rules'}. A team code is the only identity a memorial may carry: a name, crest or institution in the file is penalised.`}
          />
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
            <dl className="divide-y divide-line border-y border-line">
              {FORMAT.map((item) => (
                <div key={item.term} className="grid gap-2 py-6 sm:grid-cols-[8rem_1fr] sm:gap-8">
                  <dt className="text-meta font-mono uppercase text-text-3">{item.term}</dt>
                  <dd>
                    <p className="font-display text-2xl font-medium text-text">{item.value}</p>
                    <p className="mt-2 text-sm leading-relaxed text-text-2">{item.note}</p>
                  </dd>
                </div>
              ))}
            </dl>

            <div className="word-check" data-over={over > 0 ? '' : undefined}>
              <label htmlFor={inputId} className="font-display text-xl font-medium text-text">
                Check a word count
              </label>
              <p className="mt-2 text-sm text-text-2">One point is deducted for every 100 words over the limit.</p>
              <div className="mt-6 flex items-center gap-4">
                <input
                  id={inputId}
                  type="range"
                  min={5000}
                  max={9500}
                  step={50}
                  value={words}
                  onChange={(event) => setWords(Number(event.target.value))}
                  className="word-check__range"
                  aria-describedby={`${inputId}-result`}
                />
                <output htmlFor={inputId} className="w-20 text-right font-mono text-lg tabular-nums text-text">
                  {words.toLocaleString('en-US')}
                </output>
              </div>
              <p id={`${inputId}-result`} className="word-check__result" aria-live="polite">
                {over === 0
                  ? `Within the limit, ${(WORD_LIMIT - words).toLocaleString('en-US')} words to spare.`
                  : `${over.toLocaleString('en-US')} words over: ${deduction} ${deduction === 1 ? 'point' : 'points'} deducted.`}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="sheet tone-inverse" aria-labelledby="court-title">
        <div className="sheet__ground" aria-hidden="true" />
        <div className="wrap">
          <ChapterHead
            id="court-title"
            chapter={4}
            act="In the courtroom"
            title="Thirty minutes a side."
            lead="The judges may interrupt at any point, and the clock keeps running while they do. Address the bench as “Your Honour”, answer, then return to your roadmap."
          />
          <dl className="figures figures--three">
            {TIMING.map((item) => (
              <div key={item.term} className="figure">
                <dt className="sr-only">{item.term}</dt>
                <dd className="figure__value">{item.value}</dd>
                <dd className="figure__label">{item.term}</dd>
                <dd className="mt-3 max-w-xs text-sm leading-relaxed text-text-2">{item.note}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="chapter" aria-labelledby="scoring-title">
        <div className="wrap">
          <ChapterHead
            id="scoring-title"
            chapter={5}
            act="The scoring"
            title="How you are scored, out of 100."
            lead={
              scoring
                ? `The memorial counts for ${scoring.memorialWeight}% and the oral rounds for ${scoring.oralWeight}%.`
                : 'The weight of each part is confirmed with the published rules.'
            }
          />
          <FilterBar
            label="Scoring part"
            activeValue={part}
            onChange={setPart}
            options={[
              { label: 'Written memorial', value: 'memorial' },
              { label: 'Oral rounds', value: 'oral' },
            ]}
          />
          <ol className="mt-8 divide-y divide-line border-y border-line" key={part}>
            {SCORING[part].map((criterion) => (
              <li key={criterion.title} className="score-row">
                <span className="score-row__points">
                  {criterion.points}
                  <span className="sr-only"> points</span>
                  <span aria-hidden="true" className="score-row__unit">
                    pts
                  </span>
                </span>
                <div>
                  <p className="font-display text-lg font-medium text-text">{criterion.title}</p>
                  <p className="mt-1 text-sm leading-relaxed text-text-2">{criterion.body}</p>
                </div>
                <span className="score-row__bar" aria-hidden="true" style={{ '--share': criterion.points / 20 } as CSSProperties} />
              </li>
            ))}
          </ol>
        </div>
      </section>
    </>
  );
}
