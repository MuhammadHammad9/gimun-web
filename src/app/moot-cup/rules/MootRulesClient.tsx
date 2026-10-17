'use client';

import { useState, type CSSProperties } from 'react';
import { useSiteConfig } from '@/components/SiteConfigProvider';
import { ChapterHead } from '@/components/sections/Chapter';
import { FilterBar } from '@/components/ui/FilterBar';
import { fill, type Copy } from '@/lib/copy';
import '@/styles/pages/moot-rules.css';

/**
 * The detailed rules, as the page's later chapters: the memorial format with
 * the cover colours, the courtroom timings, and the scoring for each part.
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
    citation: scoring?.citationStyle ?? 'the 20th edition of the Bluebook',
    memorial: scoring?.memorialWeight ?? '',
    oral: scoring?.oralWeight ?? '',
  };
  // Points are stored as text in the admin; anything unreadable counts as 0.
  const criteria = (copy: Copy) =>
    (copy.items ?? []).map((item) => ({ points: Number(item.meta) || 0, title: fill(item.title, vars), body: fill(item.body, vars) }));
  const SCORING = { memorial: criteria(scoringCopy), oral: criteria(oral) };
  const [part, setPart] = useState<'memorial' | 'oral'>('memorial');
  const top = Math.max(1, ...SCORING[part].map((criterion) => criterion.points));
  const total = SCORING[part].reduce((sum, criterion) => sum + criterion.points, 0);

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

            <div className="word-check self-start">
              <p className="font-display text-xl font-medium text-text">Covers and copies</p>
              <ul className="mt-6 grid gap-4 sm:grid-cols-2">
                <li className="flex items-center gap-3">
                  <span aria-hidden="true" className="h-12 w-9 shrink-0 rounded-sm border border-line-2" style={{ background: '#1f4fa3' }} />
                  <span className="text-sm text-text-2"><strong className="block font-medium text-text">Blue cover</strong>Petitioner memorial</span>
                </li>
                <li className="flex items-center gap-3">
                  <span aria-hidden="true" className="h-12 w-9 shrink-0 rounded-sm border border-line-2" style={{ background: '#a3221f' }} />
                  <span className="text-sm text-text-2"><strong className="block font-medium text-text">Red cover</strong>Respondent memorial</span>
                </li>
              </ul>
              <p className="word-check__result">Three hard copies of each side on arrival, matching the soft copy exactly.</p>
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
            lead={fill(scoringCopy.lead, vars)}
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
          <p className="mt-4 text-small text-text-3">
            {part === 'memorial' ? `Memorials are marked out of ${total}.` : `Each speaker is marked out of ${total} by each judge.`}
          </p>
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
                <span className="score-row__bar" aria-hidden="true" style={{ '--share': criterion.points / top } as CSSProperties} />
              </li>
            ))}
          </ol>
        </div>
      </section>
      )}
    </>
  );
}
