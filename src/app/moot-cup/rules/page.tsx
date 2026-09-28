import { getSiteConfig } from '@/lib/content';
import type { Metadata } from "next";
import { constructMetadata } from "@/lib/metadata";
import { MootRulesClient } from "./MootRulesClient";
import { TrackBadge } from "@/components/ui/TrackBadge";
import { Button } from "@/components/ui/Button";
import { Download } from "lucide-react";
import { formatEventDate, getEventYear } from "@/lib/site-config";
import { getDocuments } from "@/lib/content";
import { PageHero } from '@/components/ui/PageHero';

export async function generateMetadata(): Promise<Metadata> { return await constructMetadata({
  title: `Rules & Memorial Guidelines | GMC ${getEventYear(await getSiteConfig())}`,
  path: '/moot-cup/rules',
  description: `Comprehensive competition rules, memorial drafting specifications, oral pleading rounds structure, and scoring criteria for the ${getEventYear(await getSiteConfig())} GMC.`,
}); }

export default async function MootRulesPage() {
  const rulesDocument = (await getDocuments()).find(
    (document) => document.track === "moot-cup" && document.type === "rules",
  );
  const site = await getSiteConfig();
  const memorialDue = site.memorialDeadline ? formatEventDate(site.memorialDeadline) : 'the date announced on this page';

  return (
    <div className="space-y-12">
      {/* Modern Supreme Court Appellate Hero */}
      <PageHero
        variant="moot"
        breadcrumbs={[{ label: 'GMC', href: '/moot-cup' }, { label: 'Rules & Memorials' }]}
        title={'Rules & Written arguments'}
        eyebrow={
          <div className="flex items-center gap-2">
                      <TrackBadge track="moot-cup" />
                      <span className="text-xs font-mono text-text-3 uppercase tracking-widest">
                        Competition Rules &amp; Standards
                      </span>
                    </div>
        }
        actionsSlot={
          <>
            <p className="text-sm sm:text-base text-text-2 max-w-3xl leading-relaxed">
                        The GIKI Moot Court (GMC) follows national standards of appellate advocacy and courtroom argument. Review brief length limits, courtroom timing allocations, citation guidelines, and scoring criteria below.
                      </p>

                      <div className="pt-2 flex flex-wrap items-center gap-4">
                        {rulesDocument && (
                          <Button
                            variant="track-moot"
                            href={rulesDocument.fileUrl}
                            icon={<Download className="w-4 h-4" />}
                          >
                            Download Official Rules PDF
                          </Button>
                        )}
                        <Button variant="secondary" href="/moot-cup/clarifications">
                          Clarifications Log
                        </Button>
                      </div>
          </>
        }
      />

      {/* Submission and competition structure: the two things teams plan around. */}
      <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
        <section aria-labelledby="submission-heading">
          <h2 id="submission-heading" className="text-h2 font-display font-medium text-text">
            Submitting memorials
          </h2>
          <p className="mt-3 text-sm text-text-3">
            Deadline: <strong className="text-text">{memorialDue}, 23:59 Pakistan time.</strong> Late
            memorials are not scored.
          </p>
          <ol className="mt-6 space-y-4">
            {[
              'Prepare one memorial for the Applicant and one for the Respondent, each as a PDF.',
              'Identify your team only by the team code in your acceptance email; names or institutions in the file lead to a penalty.',
              `Name the files TEAMCODE_Applicant.pdf and TEAMCODE_Respondent.pdf and email both to ${site.contactEmails.mootCup || site.contactEmails.general}.`,
              'You will receive a confirmation reply within one working day. If you do not, email again before the deadline.',
            ].map((step, i) => (
              <li key={step} className="flex gap-4 text-sm leading-relaxed text-text-2">
                <span className="font-mono text-xs text-champagne tabular-nums pt-0.5">{String(i + 1).padStart(2, '0')}</span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </section>
        <section aria-labelledby="rounds-heading">
          <h2 id="rounds-heading" className="text-h2 font-display font-medium text-text">
            How the rounds work
          </h2>
          <dl className="mt-6 border-b border-line">
            {[
              ['Preliminary rounds', 'Every team argues twice, once for each side. These two rounds are guaranteed.'],
              ['Quarter-finals', 'The top eight teams by combined memorial and oral scores advance.'],
              ['Semi-finals', 'Knockout; winners of each quarter-final advance.'],
              ['Grand Final', 'The two finalists argue before an expanded bench in the AHA Auditorium.'],
            ].map(([stage, detail]) => (
              <div key={stage} className="grid gap-1 border-t border-line py-4 sm:grid-cols-[10rem_1fr] sm:gap-6">
                <dt className="font-display font-medium text-text">{stage}</dt>
                <dd className="text-sm leading-relaxed text-text-3">{detail}</dd>
              </div>
            ))}
          </dl>
        </section>
      </div>

      {/* Main Interactive Body */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <MootRulesClient rulesDocumentUrl={rulesDocument?.fileUrl} />
      </div>
    </div>
  );
}
