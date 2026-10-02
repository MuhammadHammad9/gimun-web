'use client';

import { useId, useState, type CSSProperties } from 'react';
import { useSiteConfig } from '@frontend/components/SiteConfigProvider';
import { ChapterHead } from '@frontend/components/sections/Chapter';
import { FilterBar } from '@frontend/components/ui/FilterBar';
import { fill, type Copy } from '@shared/lib/copy';
import '@frontend/styles/pages/moot-rules.css';

const WORD_LIMIT = 8000;

/**
 * The detailed rules, as the page's later chapters: the memorial format with
 * a word-count check, the courtroom timings, and the scoring for each part.
 */
export function MootRulesClient({
  format,
  court,
  scoring: scoringCopy,
  oral,
  chapters,
}: {
  format: Copy;
  court: Copy;
  scoring: Copy;
  oral: Copy;
  chapters: Record<string, number | undefined>;
}) {
  const scoring = useSiteConfig().mootScoring;
  const vars = {
    citation: scoring?.citationStyle ?? 'the standard confirmed with the rules',
    memorial: scoring?.memorialWeight ?? '',
    oral: scoring?.oralWeight ?? '',
  };
  // Points are stored as text in the admin; anything unreadable counts as 0.
  const criteria = (copy: Copy) =>
    (copy.items ?? []).map((item) => ({ points: Number(item.meta) || 0, title: fill(item.title, vars), body: fill(item.body, vars) }));
  const SCORING = { memorial: criteria(scoringCopy), oral: criteria(oral) };
  const [part, setPart] = useState<'memorial' | 'oral'>('memorial');
  const [words, setWords] = useState(7450);
  const inputId = useId();
  const over = Math.max(0, words - WORD_LIMIT);
  const deduction = Math.ceil(over / 100);

  return (
    <>
      {!format.hidden && (
      <section className="chapter" aria-labelledby="format-title">
        <div className="wrap">
          <ChapterHead
            id="format-title"
            chapter={chapters['moot-rules-format']}
            act={format.kicker}
            title={fill(format.title, vars)}
            lead={fill(format.lead, vars)}
          />
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
            <dl className="divide-y divide-line border-y border-line">
              {(format.items ?? []).map((item) => (
                <div key={item.title} className="grid gap-2 py-6 sm:grid-cols-[8rem_1fr] sm:gap-8">
                  <dt className="text-meta font-mono uppercase text-text-3">{fill(item.title, vars)}</dt>
                  <dd>
                    <p className="font-display text-2xl font-medium text-text">{fill(item.meta, vars)}</p>
                    <p className="mt-2 text-sm leading-relaxed text-text-2">{fill(item.body, vars)}</p>
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
      )}

      {!court.hidden && (
      <section className="sheet tone-inverse" aria-labelledby="court-title">
        <div className="sheet__ground" aria-hidden="true" />
        <div className="wrap">
          <ChapterHead
            id="court-title"
            chapter={chapters['moot-rules-court']}
            act={court.kicker}
            title={fill(court.title, vars)}
            lead={fill(court.lead, vars)}
          />
          <dl className="figures figures--three">
            {(court.items ?? []).map((item) => (
              <div key={item.title} className="figure">
                <dt className="sr-only">{fill(item.title, vars)}</dt>
                <dd className="figure__value">{fill(item.meta, vars)}</dd>
                <dd className="figure__label">{fill(item.title, vars)}</dd>
                <dd className="mt-3 max-w-xs text-sm leading-relaxed text-text-2">{fill(item.body, vars)}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>
      )}

      {!scoringCopy.hidden && (
      <section className="chapter" aria-labelledby="scoring-title">
        <div className="wrap">
          <ChapterHead
            id="scoring-title"
            chapter={chapters['moot-rules-scoring']}
            act={scoringCopy.kicker}
            title={fill(scoringCopy.title, vars)}
            lead={scoring ? fill(scoringCopy.lead, vars) : 'The weight of each part is confirmed with the published rules.'}
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
      )}
    </>
  );
}
