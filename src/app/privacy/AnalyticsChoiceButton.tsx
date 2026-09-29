'use client';

import { resetAnalyticsChoice } from '@/components/analytics/GoogleAnalytics';

export function AnalyticsChoiceButton() {
  return (
    <button
      type="button"
      onClick={resetAnalyticsChoice}
      className="text-link"
    >
      Change your analytics choice
    </button>
  );
}
