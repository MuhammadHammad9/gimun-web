/**
 * The Scanner backdrop, ported from React Bits (reactbits.dev, by David Haz;
 * MIT + Commons Clause). The fragment shader is the published one, unchanged;
 * the React wrapper is replaced by the site's lazy runner (ogl-backdrop.ts),
 * and colours come from the theme's tokens rather than hex props.
 */
import type { RGB } from './colors';
import { FULLSCREEN_VERTEX, startBackdrop } from './ogl-backdrop';

const FRAGMENT = `#version 300 es
precision highp float;
uniform vec2 iResolution;
uniform float iTime;
uniform float uSpeed;
uniform float uSweepSpeed;
uniform float uSweepWidth;
uniform float uSweepFalloff;
uniform float uScale;
uniform float uFrequency;
uniform float uRipple;
uniform float uBandDensity;
uniform float uLineSharpness;
uniform float uGlow;
uniform float uColorSpread;
uniform float uBrightness;
uniform float uContrast;
uniform float uSoftness;
uniform float uVignette;
uniform float uOpacity;
uniform float uScanline;
uniform float uGrain;
uniform float uGrainIntensity;
uniform float uDirection;
uniform vec2 uMouse;
uniform float uMouseEnabled;
uniform float uMouseRadius;
uniform float uMouseStrength;
uniform float uMouseActive;
uniform vec3 uColor1;
uniform vec3 uColor2;
uniform vec3 uColor3;
out vec4 fragColor;

const float TAU = 6.2831853;

float signalField(vec2 p, float t) {
  float w = sin(p.x * 1.3 + t * 0.7);
  w += sin(p.y * 1.7 - t * 0.52) * 0.8;
  w += sin((p.x + p.y) * 0.9 + t * 0.91) * 0.6;
  w += sin((p.x - p.y) * 1.53 - t * 0.63) * 0.42;
  return w * 0.35;
}

vec3 palette(float f) {
  f = clamp(f, 0.0, 1.0);
  f = pow(f, uContrast);
  vec3 c = mix(uColor1, uColor2, smoothstep(0.08, 0.6, f));
  return mix(c, uColor3, smoothstep(0.68, 1.0, f));
}

float scanBand(float x, float aa, float sharp) {
  float v = mix(0.5, 0.5 + 0.5 * cos(x * TAU), aa);
  return pow(v, sharp);
}

void main() {
  float aspect = iResolution.x / iResolution.y;
  vec2 uv0 = (gl_FragCoord.xy * 2.0 - iResolution.xy) / iResolution.y;
  vec2 p = uv0 / max(uScale, 0.001);

  float t = iTime * uSpeed;

  float mouseBoost = 0.0;
  if (uMouseEnabled > 0.5) {
    vec2 mUv = vec2((uMouse.x * 2.0 - 1.0) * aspect, uMouse.y * 2.0 - 1.0);
    vec2 md = uv0 - mUv;
    float r = max(uMouseRadius, 0.001);
    mouseBoost = exp(-dot(md, md) / (r * r)) * uMouseStrength * uMouseActive;
  }

  float axis;
  if (uDirection < 0.5) axis = p.y;
  else if (uDirection < 1.5) axis = p.x;
  else axis = (p.x + p.y) * 0.70710678;

  float sig = signalField(p * uFrequency, t);
  float coord = axis + sig * uRipple;

  float phase = coord / max(uSweepWidth, 0.05) - t * uSweepSpeed;
  float sweep = pow(0.5 + 0.5 * cos(phase * TAU), max(uSweepFalloff, 0.1));

  float lc = coord * uBandDensity;
  float aa = 1.0 / (1.0 + uSoftness * fwidth(lc) * 3.0);
  aa = clamp(aa * (1.0 + mouseBoost * 0.6), 0.0, 1.0);

  float bodyBase = clamp(0.5 + 0.5 * sig, 0.0, 1.0);
  float body = bodyBase * bodyBase * uGlow * sweep;

  float sharp = max(uLineSharpness, 0.1);
  float split = uColorSpread * 0.16;
  float fr = clamp(scanBand(lc + split, aa, sharp) * sweep + body, 0.0, 1.0);
  float fg = clamp(scanBand(lc, aa, sharp) * sweep + body, 0.0, 1.0);
  float fb = clamp(scanBand(lc - split, aa, sharp) * sweep + body, 0.0, 1.0);

  vec3 col = vec3(palette(fr).r, palette(fg).g, palette(fb).b);

  float inten = (fr + fg + fb) * 0.3333333 * uBrightness;
  inten *= 1.0 + mouseBoost * 0.9;

  if (uScanline > 0.5) {
    inten *= 1.0 - 0.18 * (0.5 + 0.5 * cos(gl_FragCoord.y * 1.7));
  }

  if (uGrain > 0.5) {
    float g = fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233)) + iTime) * 43758.5453);
    inten += (g - 0.5) * uGrainIntensity;
  }

  inten *= clamp(1.0 - uVignette * smoothstep(0.55, 1.65, length(uv0)), 0.0, 1.0);
  inten = clamp(inten, 0.0, 1.0);

  float a = clamp(inten * uOpacity, 0.0, 1.0);
  fragColor = vec4(clamp(col, 0.0, 1.0) * a, a);
}
`;

export interface ScannerColors {
  color1: RGB;
  color2: RGB;
  color3: RGB;
  opacity: number;
}

export function startScanner(container: HTMLElement, colors: ScannerColors, onFirstFrame: () => void) {
  const mouse = { current: [0.5, 0.5], target: [0.5, 0.5], active: 0, targetActive: 0 };
  // From the component's published example, tuned for the seat: a calm but
  // clearly moving sweep (a band crosses in about 6-7 s; the published 0.2
  // speed took over half a minute and read as frozen), and a clean surface
  // without the CRT raster or heavy grain.
  const backdrop = startBackdrop(container, {
    vertex: FULLSCREEN_VERTEX,
    fragment: FRAGMENT,
    uniforms: {
      iTime: { value: 0 },
      iResolution: { value: new Float32Array([1, 1]) },
      uSpeed: { value: 0.55 },
      uSweepSpeed: { value: 0.45 },
      uSweepWidth: { value: 1.6 },
      uSweepFalloff: { value: 5.7 },
      uScale: { value: 1.5 },
      uFrequency: { value: 3 },
      uRipple: { value: 0.22 },
      uBandDensity: { value: 11 },
      uLineSharpness: { value: 3.1 },
      uGlow: { value: 0.22 },
      uColorSpread: { value: 0.22 },
      uBrightness: { value: 1.55 },
      uContrast: { value: 1.15 },
      uSoftness: { value: 1.4 },
      uVignette: { value: 0.84 },
      uOpacity: { value: colors.opacity },
      uScanline: { value: 0 },
      uGrain: { value: 1 },
      uGrainIntensity: { value: 0.04 },
      uDirection: { value: 0 },
      uMouse: { value: new Float32Array([0.5, 0.5]) },
      uMouseEnabled: { value: 1 },
      uMouseRadius: { value: 0.31 },
      uMouseStrength: { value: 0.5 },
      uMouseActive: { value: 0 },
      uColor1: { value: new Float32Array(colors.color1) },
      uColor2: { value: new Float32Array(colors.color2) },
      uColor3: { value: new Float32Array(colors.color3) },
    },
    onPointer(point) {
      if (point) {
        mouse.target = point;
        mouse.targetActive = 1;
      } else mouse.targetActive = 0;
    },
    onFrame() {
      if (!backdrop) return;
      mouse.current[0] += 0.08 * (mouse.target[0] - mouse.current[0]);
      mouse.current[1] += 0.08 * (mouse.target[1] - mouse.current[1]);
      mouse.active += 0.08 * (mouse.targetActive - mouse.active);
      const u = backdrop.uniforms;
      const m = u.uMouse.value as Float32Array;
      m[0] = mouse.current[0];
      m[1] = mouse.current[1];
      u.uMouseActive.value = mouse.active;
    },
    onFirstFrame,
  });
  if (!backdrop) return null;
  return {
    setColors(next: ScannerColors) {
      const u = backdrop.uniforms;
      (u.uColor1.value as Float32Array).set(next.color1);
      (u.uColor2.value as Float32Array).set(next.color2);
      (u.uColor3.value as Float32Array).set(next.color3);
      u.uOpacity.value = next.opacity;
    },
    destroy: backdrop.destroy,
  };
}
