'use client';
import { createContext, useContext } from 'react';
import type { SiteConfig } from '@/lib/types';
const Context = createContext<SiteConfig | null>(null);
export function SiteConfigProvider({ value, children }: { value: SiteConfig; children: React.ReactNode }) { return <Context.Provider value={value}>{children}</Context.Provider>; }
export function useSiteConfig() { const value = useContext(Context); if (!value) throw new Error('SiteConfigProvider is missing'); return value; }
