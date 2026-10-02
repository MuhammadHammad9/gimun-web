import type { Metadata } from 'next';
import { TransitionLink as Link } from '@/components/motion/TransitionLink';
import { PageHero } from '@/components/ui/PageHero';
import { getCopy, getSiteConfig, getTeamMembers } from '@/lib/content';
import { fill, nextSteps } from '@/lib/copy';
import { constructMetadata } from '@/lib/metadata';
import { getEventYear } from '@/lib/site-config';
import { TeamClient } from './TeamClient';
import { NextSteps } from '@/components/story/NextSteps';

export async function generateMetadata(): Promise<Metadata> {
  return await constructMetadata({
    title: `Organizing Team | GIMUN & GMC ${getEventYear(await getSiteConfig())}`,
    path: '/about/team',
    description:
      'The GIKI students who run GIMUN and the GIKI Moot Court: the secretariat and committee chairs, the moot convening committee and the logistics team.',
  });
}

export default async function TeamPage() {
  const copy = await getCopy('team');
  const hero = copy('team-hero');
  const next = copy('team-next');
  const [members, site] = await Promise.all([getTeamMembers(), getSiteConfig()]);

  return (
    <>
      <PageHero
        variant="utility"
        breadcrumbs={[{ label: 'About', href: '/about' }, { label: 'Team' }]}
        meta={[`${getEventYear(site)} edition`, 'Run by GIKI students']}
        title={fill(hero.title)}
        accentPhrase={hero.accentPhrase}
        description={fill(hero.lead)}
        actionsSlot={
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
            <Link href="/contact" className="text-link">
              Contact the team
            </Link>
            <Link href="/gimun/committees" className="text-link">
              Committee chairs
            </Link>
          </div>
        }
      />
      <section className="handoff__sheet tone-deep chapter chapter--flush-top" aria-label="Team members">
        <div className="wrap">
          <TeamClient initialMembers={members} />
        </div>
      </section>
      {!next.hidden && <NextSteps steps={nextSteps(next)} />}
    </>
  );
}
