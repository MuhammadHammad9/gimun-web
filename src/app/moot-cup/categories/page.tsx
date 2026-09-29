import type { Metadata } from 'next';
import { ScalesArt } from '@/components/art/LineArt';
import { TransitionLink as Link } from '@/components/motion/TransitionLink';
import { ChapterHead } from '@/components/sections/Chapter';
import { HelpCallout } from '@/components/ui/HelpCallout';
import { PageHero } from '@/components/ui/PageHero';
import { getDocuments, getMootCategories, getSiteConfig } from '@/lib/content';
import { constructMetadata } from '@/lib/metadata';
import { canRegister } from '@/lib/phase';
import { formatEventDate, formatPublishedDate, getEventYear } from '@/lib/site-config';

export async function generateMetadata(): Promise<Metadata> {
  return await constructMetadata({
    title: `Problem Categories & Compromis | GMC ${getEventYear(await getSiteConfig())}`,
    path: '/moot-cup/categories',
    description: `The areas of law for GMC ${getEventYear(await getSiteConfig())} and the official case problem (compromis).`,
  });
}

export default async function MootCategoriesPage() {
  const [categories, documents, site] = await Promise.all([getMootCategories(), getDocuments(), getSiteConfig()]);
  const open = canRegister(site, 'mootCup');
  const problem = documents.find((d) => d.track === 'moot-cup' && d.type === 'proposition');

  return (
    <>
      <PageHero
        variant="moot"
        breadcrumbs={[{ label: 'GMC', href: '/moot-cup' }, { label: 'Problem categories' }]}
        meta={[`${categories.length} categories`, `GMC ${getEventYear(site)}`]}
        title="The case categories."
        accentPhrase="categories."
        description="Choose the area of law your team prefers when you register. Every team argues from the same compromis, and is bound by its facts."
        actionsSlot={
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
            {problem && (
              <a href={problem.fileUrl} className="text-link" data-no-transition="">
                The compromis ({problem.fileSize}, revised {formatEventDate(problem.versionDate, { month: 'short' })})
              </a>
            )}
            <Link href="/moot-cup/clarifications" className="text-link">
              Clarifications log
            </Link>
          </div>
        }
        art={<ScalesArt className="mx-auto hidden w-full max-w-[18rem] text-accent-gmc opacity-50 lg:block" />}
      />

      <section className="handoff__sheet tone-deep chapter" aria-labelledby="categories-title">
        <div className="wrap">
          <ChapterHead
            id="categories-title"
            title="Areas of law."
            lead="Questions about an unclear paragraph of the compromis go through the clarifications log, where the answer is published for every team at once."
          />
          <ol className="motions">
            {categories.map((category, index) => (
              <li key={category.id} id={category.id} className="motion-row scroll-mt-28">
                <span className="motion-row__rank text-accent-gmc!">{String(index + 1).padStart(2, '0')}</span>
                <div className="min-w-0">
                  <h3 className="motion-row__name">{category.name}</h3>
                  <p className="motion-row__purpose">{category.description}</p>
                </div>
                <dl className="motion-row__facts">
                  <div>
                    <dt>Area</dt>
                    <dd>{category.areaOfLaw}</dd>
                  </div>
                  <div>
                    <dt>Revised</dt>
                    <dd>{formatPublishedDate(category.lastUpdated)}</dd>
                  </div>
                  {open && (
                    <div>
                      <dt>Enter</dt>
                      <dd>
                        <Link href={`/register?track=moot-cup&category=${category.id}`} className="text-link">
                          Register in this category
                        </Link>
                      </dd>
                    </div>
                  )}
                </dl>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="chapter" aria-label="More help">
        <div className="wrap">
          <HelpCallout
            question="Unsure which category suits your team?"
            actions={[
              { label: 'Rules & memorials', href: '/moot-cup/rules' },
              { label: 'Clarifications', href: '/moot-cup/clarifications' },
            ]}
          />
        </div>
      </section>
    </>
  );
}
