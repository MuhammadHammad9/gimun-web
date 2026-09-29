/**
 * Geometry for the line art. Everything here runs once at module load on the
 * server and produces plain path strings, so the drawings are computed rather
 * than eyeballed and cost nothing in the browser.
 */

export type Pt = readonly [number, number];

const round = (n: number) => Math.round(n * 10) / 10;
const deg = (d: number) => (d * Math.PI) / 180;

/** A smooth path through the points (Catmull-Rom, as cubic Béziers). */
export function smoothPath(points: readonly Pt[]): string {
  if (points.length < 2) return '';
  if (points.length === 2) {
    return `M${round(points[0][0])} ${round(points[0][1])}L${round(points[1][0])} ${round(points[1][1])}`;
  }
  let d = `M${round(points[0][0])} ${round(points[0][1])}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] ?? points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] ?? p2;
    const c1: Pt = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2: Pt = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += `C${round(c1[0])} ${round(c1[1])} ${round(c2[0])} ${round(c2[1])} ${round(p2[0])} ${round(p2[1])}`;
  }
  return d;
}

interface SpherePoint {
  x: number;
  y: number;
  /** Depth toward the viewer; the point is on the visible face when z >= 0. */
  z: number;
}

/**
 * Orthographic projection of a unit-sphere point at latitude/longitude,
 * seen from `elevation` degrees above the equator.
 */
function project(lat: number, lon: number, elevation: number): SpherePoint {
  const x = Math.cos(deg(lat)) * Math.sin(deg(lon));
  const y = Math.sin(deg(lat));
  const z = Math.cos(deg(lat)) * Math.cos(deg(lon));
  const e = deg(elevation);
  return { x, y: y * Math.cos(e) - z * Math.sin(e), z: y * Math.sin(e) + z * Math.cos(e) };
}

/**
 * Splits a sampled curve on the sphere into its visible runs, adding the
 * exact point where each run meets the limb, and returns smooth paths.
 */
function visibleRuns(samples: SpherePoint[], cx: number, cy: number, r: number): string[] {
  const runs: Pt[][] = [];
  let current: Pt[] = [];
  const toScreen = (p: SpherePoint): Pt => [cx + r * p.x, cy - r * p.y];
  for (let i = 0; i < samples.length; i++) {
    const p = samples[i];
    const prev = samples[i - 1];
    if (prev && prev.z >= 0 !== p.z >= 0) {
      const t = prev.z / (prev.z - p.z);
      const edge: SpherePoint = { x: prev.x + (p.x - prev.x) * t, y: prev.y + (p.y - prev.y) * t, z: 0 };
      if (p.z >= 0) current.push(toScreen(edge));
      else {
        current.push(toScreen(edge));
        runs.push(current);
        current = [];
      }
    }
    if (p.z >= 0) current.push(toScreen(p));
  }
  if (current.length) runs.push(current);
  return runs.filter((run) => run.length > 1).map(smoothPath);
}

export interface GlobeGeometry {
  meridians: string;
  parallels: string;
  equator: string;
}

/**
 * A globe drawn as a cartographer would: meridians and parallels projected
 * orthographically from slightly above, with the far side removed.
 */
export function globe(
  cx: number,
  cy: number,
  r: number,
  { elevation = 16, meridians = [-60, -30, 0, 30, 60], parallels = [-50, -25, 25, 50] } = {},
): GlobeGeometry {
  const meridianPaths = meridians.flatMap((lon) => {
    const samples: SpherePoint[] = [];
    for (let lat = -90; lat <= 90; lat += 15) samples.push(project(lat, lon, elevation));
    return visibleRuns(samples, cx, cy, r);
  });
  const parallel = (lat: number) => {
    const samples: SpherePoint[] = [];
    for (let lon = -180; lon <= 180; lon += 15) samples.push(project(lat, lon, elevation));
    // Start the loop on the far side so the visible arc is one run.
    const start = samples.findIndex((p) => p.z < 0);
    const ordered = start > 0 ? [...samples.slice(start), ...samples.slice(1, start + 1)] : samples;
    return visibleRuns(ordered, cx, cy, r);
  };
  return {
    meridians: meridianPaths.join(''),
    parallels: parallels.flatMap(parallel).join(''),
    equator: parallel(0).join(''),
  };
}

/** One elliptical ring around a sphere, split into the arc behind it and the arc in front. */
export function orbit(cx: number, cy: number, rx: number, ry: number, tilt: number) {
  const point = (t: number): Pt => {
    const x = rx * Math.cos(t);
    const y = ry * Math.sin(t);
    const a = deg(tilt);
    return [cx + x * Math.cos(a) - y * Math.sin(a), cy + x * Math.sin(a) + y * Math.cos(a)];
  };
  const arc = (from: number, to: number) => {
    const pts: Pt[] = [];
    for (let i = 0; i <= 12; i++) pts.push(point(from + ((to - from) * i) / 12));
    return smoothPath(pts);
  };
  // The upper half of the ring (screen space) passes behind the sphere.
  return { back: arc(Math.PI, 2 * Math.PI), front: arc(0, Math.PI) };
}
