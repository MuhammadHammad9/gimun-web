'use client';

import { useState } from 'react';
import { ClarificationForm } from '@frontend/components/forms/ClarificationForm';
import { EmptyState } from '@frontend/components/ui/EmptyState';
import { SearchInput } from '@frontend/components/ui/SearchInput';
import type { Clarification } from '@shared/lib/types';
import '@frontend/styles/pages/clarifications.css';

interface ClarificationsClientProps {
  initialClarifications: Clarification[];
}

export function ClarificationsClient({ initialClarifications }: ClarificationsClientProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const query = searchQuery.trim().toLowerCase();

  // Newest ruling first: teams check this log for what changed since their last visit.
  const rulings = [...initialClarifications]
    .sort((a, b) => b.number - a.number)
    .filter(
      (c) =>
        !query ||
        c.question.toLowerCase().includes(query) ||
        c.answer.toLowerCase().includes(query) ||
        c.number.toString().includes(query),
    );

  return (
    <div className="space-y-16">
      <section aria-labelledby="log-title" className="space-y-6">
        <div className="flex flex-col gap-4 border-b border-line pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl space-y-2">
            <h2 id="log-title" className="font-display text-2xl font-medium text-text sm:text-3xl">
              The log
            </h2>
            <p className="text-base leading-relaxed text-text-2">
              Every clarification is part of the case problem, binding on every team, and may be cited in memorials and
              oral rounds. No team receives a private answer.
            </p>
          </div>
          <div className="w-full sm:w-80">
            <SearchInput value={searchQuery} onChange={setSearchQuery} placeholder="Search by keyword or number" />
          </div>
        </div>

        <p className="font-mono text-xs text-text-3" aria-live="polite">
          {rulings.length} of {initialClarifications.length} clarifications
        </p>

        <ol className="ruling-list">
          {rulings.map((item) => (
            <li key={item.id} className="ruling" data-live-key={`clarification-${item.id}`}>
              <p className="ruling__num" aria-hidden="true">
                {String(item.number).padStart(2, '0')}
              </p>
              <div className="space-y-4">
                <p className="font-mono text-xs text-text-3">
                  <span className="sr-only">Clarification {item.number}, </span>
                  Published {item.submittedAt}
                </p>
                <div>
                  <p className="ruling__label">Question</p>
                  <p className="ruling__question">{item.question}</p>
                </div>
                <div className="ruling__answer">
                  <p className="ruling__label">Answer</p>
                  <p>{item.answer}</p>
                </div>
              </div>
            </li>
          ))}
        </ol>

        {rulings.length === 0 && (
          <EmptyState
            title="No clarifications match"
            description={`Nothing in the log matches "${searchQuery}". Try another word, or ask the bench below.`}
            actionLabel="Clear search"
            onAction={() => setSearchQuery('')}
          />
        )}
      </section>

      {/* The submission form is shared with the contact flow (ClarificationForm). */}
      <section aria-labelledby="ask-title" className="ask-bench">
        <div className="max-w-2xl space-y-2">
          <h2 id="ask-title" className="font-display text-2xl font-medium text-text sm:text-3xl">
            Ask the bench
          </h2>
          <p className="text-base leading-relaxed text-text-3">
            Registered teams can ask about anything ambiguous in the case problem. Answers are published here for every
            team at the same time.
          </p>
        </div>
        <div className="mt-8">
          <ClarificationForm />
        </div>
      </section>
    </div>
  );
}
