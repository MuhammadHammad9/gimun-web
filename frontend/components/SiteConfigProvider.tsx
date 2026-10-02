'use client';
import { createContext, useContext } from 'react';
import type { SiteConfig } from '@shared/lib/types';
const Context = createContext<{ site: SiteConfig; renderedAt: number } | null>(null);
// `renderedAt` is the server's clock for this render. Client components derive
// date-driven state (phase, registration open) from it instead of Date.now(),
// so the hydrated markup always matches the cached server HTML.
export function SiteConfigProvider({ value, renderedAt, children }: { value: SiteConfig; renderedAt: number; children: React.ReactNode }) { return <Context.Provider value={{ site: value, renderedAt }}>{children}</Context.Provider>; }
function useSiteContext() { const value = useContext(Context); if (!value) throw new Error('SiteConfigProvider is missing'); return value; }
export function useSiteConfig() { return useSiteContext().site; }
export function useRenderedAt() { return useSiteContext().renderedAt; }
