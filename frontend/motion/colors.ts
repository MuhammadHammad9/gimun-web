/**
 * Theme colours for shaders: reads design tokens from an element's computed
 * style (so a tone's own tokens win) and returns them as 0–1 RGB, through a
 * one-pixel canvas that accepts any CSS colour syntax.
 */
export type RGB = [number, number, number];

let probe: CanvasRenderingContext2D | null | undefined;

export function toRGB(color: string, fallback: RGB = [0, 0, 0]): RGB {
  if (probe === undefined) probe = document.createElement('canvas').getContext('2d', { willReadFrequently: true });
  if (!probe || !color) return fallback;
  probe.clearRect(0, 0, 1, 1);
  probe.fillStyle = '#000';
  probe.fillStyle = color;
  probe.fillRect(0, 0, 1, 1);
  const [r, g, b] = probe.getImageData(0, 0, 1, 1).data;
  return [r / 255, g / 255, b / 255];
}

export function token(element: Element, name: string, fallback: string): RGB {
  const value = getComputedStyle(element).getPropertyValue(name).trim() || fallback;
  return toRGB(value);
}

export function mixRGB(a: RGB, b: RGB, amount: number): RGB {
  return [a[0] + (b[0] - a[0]) * amount, a[1] + (b[1] - a[1]) * amount, a[2] + (b[2] - a[2]) * amount];
}

export function isLight(color: RGB): boolean {
  return 0.2126 * color[0] + 0.7152 * color[1] + 0.0722 * color[2] > 0.5;
}

/** Calls back when the theme changes (the switch, or the system scheme). */
export function onThemeChange(callback: () => void): () => void {
  const themed = new MutationObserver(callback);
  themed.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme', 'class'] });
  const scheme = window.matchMedia('(prefers-color-scheme: dark)');
  scheme.addEventListener('change', callback);
  return () => {
    themed.disconnect();
    scheme.removeEventListener('change', callback);
  };
}
