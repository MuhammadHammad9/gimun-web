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
      'The SOPHEP host team behind GIMUN 26 and GMC VII at GIK Institute, Topi.',
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
        meta={['GIMUN 26 · GMC VII', 'Hosted by SOPHEP']}
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
          <TeamClient initialMembers={members} phones={phonesByMember(members, site.contacts ?? [])} />
        </div>
      </section>
      {!next.hidden && <NextSteps steps={nextSteps(next)} />}
    </>
  );
}

/**
 * Each member's number from Settings › Phone contacts. Names match exactly, or
 * by surname with an initial in place of the first name ("M. Hammad" is
 * "Muhammad Hammad"), so a short form in the contacts still finds its card.
 */
function phonesByMember(members: { name: string }[], contacts: { name: string; phone?: string }[]) {
  const parts = (name: string) => name.toLowerCase().replace(/\./g, ' ').split(/\s+/).filter(Boolean);
  const same = (a: string, b: string) => {
    const [x, y] = [parts(a), parts(b)];
    if (x.join(' ') === y.join(' ')) return true;
    if (x.length < 2 || y.length < 2 || x.at(-1) !== y.at(-1)) return false;
    return x[0][0] === y[0][0] && (x[0].length === 1 || y[0].length === 1);
  };
  return Object.fromEntries(
    members.flatMap((member) => {
      const contact = contacts.find((c) => c.phone && same(c.name, member.name));
      return contact?.phone ? [[member.name, contact.phone]] : [];
    }),
  );
}
