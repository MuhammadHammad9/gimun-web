'use client';

import { forwardRef, useContext, type AnchorHTMLAttributes, type MouseEvent } from 'react';
import Link, { type LinkProps } from 'next/link';
import { TransitionContext } from './TransitionProvider';
import { motionTier } from '@frontend/motion/policy';
import { isTransitionable } from '@frontend/motion/routes';

type TransitionLinkProps = LinkProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof LinkProps | 'href'> & {
    /**
     * Skip the curtain and let a shared element morph into the next page
     * (React <ViewTransition> pairs by name). Falls back to the curtain where
     * the browser has no view transitions.
     */
    morph?: boolean;
  };

function canMorph(): boolean {
  return typeof document !== 'undefined' && 'startViewTransition' in document && motionTier() !== 'none';
}

function hrefString(href: LinkProps['href']): string {
  if (typeof href === 'string') return href;
  const query = href.query ? `?${new URLSearchParams(href.query as Record<string, string>).toString()}` : '';
  return `${href.pathname ?? ''}${query}${href.hash ?? ''}`;
}

/** Next Link with the same API, enhanced only for ordinary internal page clicks. */
export const TransitionLink = forwardRef<HTMLAnchorElement, TransitionLinkProps>(function TransitionLink(
  { href, onClick, replace, scroll, target, download, morph = false, ...props },
  ref,
) {
  const transition = useContext(TransitionContext);

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(event);
    if (
      event.defaultPrevented ||
      !transition ||
      event.button !== 0 ||
      event.metaKey || event.ctrlKey || event.shiftKey || event.altKey ||
      target === '_blank' ||
      download
    ) return;

    // Next's own navigation runs as a transition, which is what lets the
    // named elements on both pages morph. The provider still moves focus.
    if (morph && canMorph()) return;

    const value = hrefString(href);
    if (!isTransitionable(value, new URL(window.location.href))) return;
    event.preventDefault();
    transition.navigate(value, { replace, scroll });
  };

  return (
    <Link
      {...props}
      ref={ref}
      href={href}
      replace={replace}
      scroll={scroll}
      target={target}
      download={download}
      onClick={handleClick}
    />
  );
});

