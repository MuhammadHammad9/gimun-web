/**
 * Colour theme: light, dark, or follow the system.
 *
 * The choice lives in localStorage under `gimun-theme`. A blocking script in
 * the document head resolves it before first paint and writes two attributes
 * on <html>: `data-theme` (the resolved light | dark) and `data-theme-choice`
 * (what the visitor picked). CSS keys off `data-theme` only.
 */
export type ThemeChoice = 'light' | 'dark' | 'system';
export type ResolvedTheme = 'light' | 'dark';

export const THEME_STORAGE_KEY = 'gimun-theme';

/** Inlined in <head>. Kept tiny and dependency-free; falls back to dark. */
export const THEME_BOOT_SCRIPT = `(function(){var d=document.documentElement;try{var c=localStorage.getItem('${THEME_STORAGE_KEY}');if(c!=='light'&&c!=='dark')c='system';d.dataset.themeChoice=c;d.dataset.theme=c==='system'?(matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'):c}catch(e){d.dataset.themeChoice='system';d.dataset.theme='dark'}})();`;

function isChoice(value: unknown): value is ThemeChoice {
  return value === 'light' || value === 'dark' || value === 'system';
}

export function resolveTheme(choice: ThemeChoice): ResolvedTheme {
  if (choice !== 'system') return choice;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function readThemeChoice(): ThemeChoice {
  const value = document.documentElement.dataset.themeChoice;
  return isChoice(value) ? value : 'system';
}

export function applyTheme(choice: ThemeChoice): void {
  const root = document.documentElement;
  root.dataset.themeChoice = choice;
  root.dataset.theme = resolveTheme(choice);
}

export function saveThemeChoice(choice: ThemeChoice): void {
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, choice);
  } catch {
    // Private mode or blocked storage: the choice still applies to this page.
  }
  applyTheme(choice);
}

/**
 * Notifies when the effective theme may have changed: a new choice here or in
 * another tab, or the system preference flipping while on "system".
 */
export function subscribeTheme(callback: () => void): () => void {
  const root = document.documentElement;
  const observer = new MutationObserver(callback);
  observer.observe(root, { attributes: true, attributeFilter: ['data-theme', 'data-theme-choice'] });

  const media = window.matchMedia('(prefers-color-scheme: dark)');
  const onSystemChange = () => {
    if (readThemeChoice() === 'system') applyTheme('system');
  };
  const onStorage = (event: StorageEvent) => {
    if (event.key === THEME_STORAGE_KEY) applyTheme(isChoice(event.newValue) ? event.newValue : 'system');
  };
  media.addEventListener('change', onSystemChange);
  window.addEventListener('storage', onStorage);
  return () => {
    observer.disconnect();
    media.removeEventListener('change', onSystemChange);
    window.removeEventListener('storage', onStorage);
  };
}
