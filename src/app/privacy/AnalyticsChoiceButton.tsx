'use client';

import { resetAnalyticsChoice } from '@/components/analytics/GoogleAnalytics';

export function AnalyticsChoiceButton() {
  return (
    <button
      type="button"
      onClick={resetAnalyticsChoice}
      className="font-semibold text-champagne underline underline-offset-2 hover:text-text"
    >
      Change your analytics choice
    </button>
  );
}
