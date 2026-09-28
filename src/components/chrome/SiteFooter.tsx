import { FaFacebookF, FaInstagram, FaLinkedinIn, FaXTwitter } from 'react-icons/fa6';
import { TransitionLink as Link } from '@/components/motion/TransitionLink';
import { SponsorStrip } from '@/components/ui/SponsorStrip';
import { footerColumns } from '@/lib/navigation';
import { getEventYear } from '@/lib/site-config';
import type { SiteConfig, Sponsor } from '@/lib/types';
import { formatDateRange } from '@/lib/utils';
import { BrandMark } from './BrandMark';
import { BackToTop, HideOnPaths } from './FooterBits';
import { ThemeSwitch } from './ThemeSwitch';

/**
 * The back cover. A server component: no JavaScript beyond the theme switch
 * and the back-to-top button, which keeps the footer (and its icon set) out
 * of every page's client bundle.
 */
export function SiteFooter({ site, sponsors }: { site: SiteConfig; sponsors: Sponsor[] }) {
  const year = getEventYear(site);
  const general = site.contactEmails?.general;
  // Only accounts the organizers have configured: a guessed handle can send
  // visitors to someone else's profile.
  const socials = [
    { Icon: FaInstagram, label: 'Instagram', href: site.socialLinks?.instagram },
    { Icon: FaFacebookF, label: 'Facebook', href: site.socialLinks?.facebook },
    { Icon: FaXTwitter, label: 'X', href: site.socialLinks?.twitter },
    { Icon: FaLinkedinIn, label: 'LinkedIn', href: site.socialLinks?.linkedin },
  ].filter((item): item is typeof item & { href: string } => Boolean(item.href));

  return (
    <footer className="site-footer" aria-labelledby="site-footer-title">
      <div className="site-footer__inner">
        <div className="site-footer__top">
          <div>
            <BrandMark className="size-11" />
            <h2 id="site-footer-title" className="site-footer__statement mt-6">
              Two rooms, one campus, four days in Topi.
            </h2>
            <div className="site-footer__facts">
              <span>{formatDateRange(site.eventDates.start, site.eventDates.end)}</span>
              <span>{site.venue}</span>
              {general && (
                <a href={`mailto:${general}`} className="w-fit underline decoration-line-2 underline-offset-4 hover:text-text">
                  {general}
                </a>
              )}
            </div>
          </div>

          <nav aria-label="Footer navigation" className="site-footer__cols">
            {footerColumns.map((column) => (
              <div key={column.title}>
                <h3 className="site-footer__col-title">{column.title}</h3>
                <ul>
                  {column.links.map((link) => (
                    <li key={link.href}>
                      <Link href={link.href} className="site-footer__link">
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>

        {sponsors.length > 0 && (
          <HideOnPaths paths={['/', '/about/sponsors']}>
            <div className="mt-16 border-t border-line pt-10">
              <SponsorStrip sponsors={sponsors} title="Partners" />
            </div>
          </HideOnPaths>
        )}

        <div className="site-footer__bottom">
          <p>
            &copy; {year} GIMUN &amp; GMC Organizing Committee, GIKI. No online payment is collected at any stage.
          </p>
          <div className="site-footer__legal">
            <Link href="/about/faq#fees" className="hover:text-text">
              Fees and payment
            </Link>
            <Link href="/contact" className="hover:text-text">
              Contact
            </Link>
            <Link href="/privacy" className="hover:text-text">
              Privacy
            </Link>
          </div>
          {socials.length > 0 && (
            <ul className="flex gap-2" aria-label="Social media">
              {socials.map(({ Icon, label, href }) => (
                <li key={label}>
                  <a href={href} target="_blank" rel="noopener noreferrer" className="site-footer__social" aria-label={`${label} (opens in a new tab)`}>
                    <Icon aria-hidden="true" className="size-4" />
                  </a>
                </li>
              ))}
            </ul>
          )}
          <div className="flex flex-wrap items-center gap-3">
            <ThemeSwitch variant="segmented" />
            <BackToTop />
          </div>
        </div>
      </div>
      <span className="site-footer__wordmark" aria-hidden="true">
        GIMUN &amp; GMC
      </span>
    </footer>
  );
}
