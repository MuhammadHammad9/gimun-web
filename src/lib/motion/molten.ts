/**
 * The MoltenMetal backdrop, ported from React Bits (reactbits.dev, by David
 * Haz; MIT + Commons Clause). The fragment shader is the published one,
 * unchanged; the React wrapper is replaced by the site's lazy runner
 * (ogl-backdrop.ts), and colours come from the theme's tokens rather than hex
 * props. On the light theme it runs in the component's own light mode, mixed
 * over the footer's ground.
 */
import type { RGB } from './colors';
import { FULLSCREEN_VERTEX, startBackdrop } from './ogl-backdrop';

const FRAGMENT = `#version 300 es
precision highp float;
uniform vec2 iResolution;
uniform float iTime;
uniform float uSpeed;
uniform float uScale;
uniform float uDetail;
uniform float uGlow;
uniform float uCoreSize;
uniform float uSwirl;
uniform float uFold;
uniform float uBlackPoint;
uniform float uBrightness;
uniform float uColorMode;
uniform float uGrain;
uniform float uGrainIntensity;
uniform float uOpacity;
uniform vec2 uMouse;
uniform float uMouseStrength;
uniform bool uEnableMouse;
uniform vec3 uColor1;
uniform vec3 uColor2;
uniform vec3 uColor3;
uniform vec3 uBackgroundColor;
uniform bool uLightMode;
out vec4 fragColor;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
}

void main() {
  float time = iTime * uSpeed;
  vec2 p = uScale * ((gl_FragCoord.xy - 0.5 * iResolution.xy) / iResolution.y) - 0.5;

  vec2 drift = vec2(0.0);
  if (uEnableMouse) {
    drift = (uMouse - 0.5) * uMouseStrength * 2.0;
  }
  p += drift;

  vec2 i = p;
  float c = 0.0;
  float r = length(p + vec2(sin(time), sin(time * 0.3 + 5.0)) * 0.5);
  float d = length(p);
  float rot = d + time + p.x * uSwirl;

  float cosRot = cos(rot);
  mat2 warp = mat2(cos(rot - sin(time / 5.0)), sin(rot), -sin(cosRot - time), cosRot) * uFold;
  float glowCore = uGlow * uCoreSize;

  for (float n = 0.0; n < 8.0; n++) {
    if (n >= uDetail) break;
    p *= warp;
    float t = r - time / (n + 3.0);
    i -= p + vec2(cos(t - i.x - r) + sin(t + i.y), sin(t - i.y) + cos(t + i.x) + r);
    c += glowCore / length(vec2(sin(i.x + t), cos(i.y + t)));
  }

  c /= 6.0;

  float intensity = max(c - uBlackPoint, 0.0) * uBrightness;

  float g = clamp(intensity, 0.0, 1.0);

  float mid = 0.5;
  if (uColorMode > 1.5) {
    mid = 0.65;
  } else if (uColorMode > 0.5) {
    mid = 0.35;
  }

  vec3 col = mix(uColor1, uColor2, smoothstep(0.0, mid, g));
  col = mix(col, uColor3, smoothstep(mid, 1.0, g));

  float a = g;
  if (uGrain > 0.5) {
    float gr = hash(gl_FragCoord.xy + iTime);
    a += (gr - 0.5) * uGrainIntensity;
  }
  a = clamp(a, 0.0, 1.0) * uOpacity;
  if (uLightMode) {
    float signal = 1.0 - exp(-max(c, 0.0) * 6.5);
    float body = smoothstep(0.075, 0.68, signal);
    float ridge = smoothstep(0.42, 0.92, signal);

    vec3 lightCol = mix(uColor1, uColor2, smoothstep(0.08, 0.52, signal));
    lightCol = mix(lightCol, uColor3, smoothstep(0.52, 0.96, signal));
    lightCol = mix(lightCol, lightCol * 0.72, ridge * 0.24);

    float coverage = body * mix(0.2, 0.86, signal) * uOpacity;
    if (uGrain > 0.5) {
      float gr = hash(gl_FragCoord.xy + iTime);
      coverage += (gr - 0.5) * uGrainIntensity * body * 0.16;
    }
    fragColor = vec4(mix(uBackgroundColor, lightCol, clamp(coverage, 0.0, 0.92)), 1.0);
  } else {
    fragColor = vec4(col * a, a);
  }
}
`;

export interface MoltenColors {
  color1: RGB;
  color2: RGB;
  color3: RGB;
  background: RGB;
  light: boolean;
  opacity: number;
}

export function startMolten(container: HTMLElement, colors: MoltenColors, onFirstFrame: () => void) {
  const mouse = { current: [0.5, 0.5], target: [0.5, 0.5] };
  // Settings from the component's published example ("molten" palette).
  const backdrop = startBackdrop(container, {
    vertex: FULLSCREEN_VERTEX,
    fragment: FRAGMENT,
    uniforms: {
      iTime: { value: 0 },
      iResolution: { value: new Float32Array([1, 1]) },
      uSpeed: { value: 0.3 },
      uScale: { value: 4 },
      uDetail: { value: 3 },
      uGlow: { value: 1.6 },
      uCoreSize: { value: 0.1 },
      uSwirl: { value: 1 },
      uFold: { value: -0.2 },
      uBlackPoint: { value: 0.05 },
      uBrightness: { value: 1.3 },
      uColorMode: { value: 0 },
      uGrain: { value: 1 },
      uGrainIntensity: { value: 0.05 },
      uOpacity: { value: colors.opacity },
      uMouse: { value: new Float32Array([0.5, 0.5]) },
      uMouseStrength: { value: 0.3 },
      uEnableMouse: { value: true },
      uColor1: { value: new Float32Array(colors.color1) },
      uColor2: { value: new Float32Array(colors.color2) },
      uColor3: { value: new Float32Array(colors.color3) },
      uBackgroundColor: { value: new Float32Array(colors.background) },
      uLightMode: { value: colors.light },
    },
    onPointer(point) {
      mouse.target = point ?? [0.5, 0.5];
    },
    onFrame() {
      if (!backdrop) return;
      mouse.current[0] += 0.05 * (mouse.target[0] - mouse.current[0]);
      mouse.current[1] += 0.05 * (mouse.target[1] - mouse.current[1]);
      const m = backdrop.uniforms.uMouse.value as Float32Array;
      m[0] = mouse.current[0];
      m[1] = mouse.current[1];
    },
    onFirstFrame,
  });
  if (!backdrop) return null;
  return {
    setColors(next: MoltenColors) {
      const u = backdrop.uniforms;
      (u.uColor1.value as Float32Array).set(next.color1);
      (u.uColor2.value as Float32Array).set(next.color2);
      (u.uColor3.value as Float32Array).set(next.color3);
      (u.uBackgroundColor.value as Float32Array).set(next.background);
      u.uLightMode.value = next.light;
      u.uOpacity.value = next.opacity;
    },
    destroy: backdrop.destroy,
  };
}
