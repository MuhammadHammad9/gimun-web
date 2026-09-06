'use client';

import React from 'react';
import type { SiteConfig, Sponsor } from '@/lib/types';
import { Footer27 } from './Footer27';

export interface FooterProps {
  siteConfig?: SiteConfig;
  sponsors?: Sponsor[];
}

export function Footer({ siteConfig, sponsors }: FooterProps) {
  return <Footer27 siteConfig={siteConfig} sponsors={sponsors} />;
}

export { Footer27 };
export default Footer;
