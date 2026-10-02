'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import { useEnhance } from '@frontend/components/motion/useEnhance';
import { cn } from '@frontend/lib/utils';

export interface GlobeMarker {
  country: string;
  lat: number;
  lon: number;
  /** Open seats glow; allocated ones are solid; reserved ones are faint. */
  status: 'available' | 'assigned' | 'reserved';
}

const TILT = (-18 * Math.PI) / 180;
const SPIN_DEG_PER_S = 7;
const DRAG_DEG_PER_PX = 0.35;
const RAD = Math.PI / 180;

/**
 * The committees globe: every seat on a turning sphere, open ones in
 * champagne, allocated ones in the GIMUN crimson. Drag to turn it (with
 * momentum); it keeps turning slowly on its own.
 *
 * Drawn on a 2D canvas in an orthographic projection, so it needs no WebGL
 * and no dependency. It starts after the visitor's first intent and only
 * draws while on screen. Until then, and under reduced motion, the server-
 * rendered `fallback` SVG is what shows. Markers come from props, so a live
 * refresh after an allocation moves them without restarting the globe.
 * Decorative: the same seats are listed in text on every committee page.
 */
export function LiveGlobe({ markers, fallback, className }: { markers: GlobeMarker[]; fallback: ReactNode; className?: string }) {
  const root = useRef<HTMLDivElement>(null);
  const markersRef = useRef(markers);
  useEffect(() => {
    markersRef.current = markers;
  }, [markers]);

  useEnhance(
    root,
    async (element, signal) => {
      const canvas = element.querySelector('canvas');
      const context = canvas?.getContext('2d');
      if (!canvas || !context) return;
      const { gsap, draggable } = await import('@frontend/motion/gsap');
      const Draggable = await draggable();
      if (signal.aborted) return;

      let colors = readColors(element);
      let size = 0;
      let rotation = 20; // degrees of longitude facing the viewer
      let dragging = false;
      let visible = true;
      let frame = 0;
      let last = performance.now();

      // Setting a canvas's size clears it, so resize only on a real change and
      // redraw at once (the observer's first call would otherwise blank a frame).
      const resize = () => {
        const ratio = Math.min(window.devicePixelRatio || 1, 2);
        const width = Math.round(canvas.clientWidth * ratio);
        if (width === canvas.width && width === canvas.height) return;
        size = canvas.clientWidth;
        canvas.width = width;
        canvas.height = width;
        context.setTransform(ratio, 0, 0, ratio, 0, 0);
        if ('live' in element.dataset) render(context, size, rotation * RAD, markersRef.current, colors, performance.now());
      };

      const draw = (now: number) => {
        frame = 0;
        const elapsed = Math.min(now - last, 64) / 1000;
        last = now;
        if (!dragging) rotation += SPIN_DEG_PER_S * elapsed;
        render(context, size, rotation * RAD, markersRef.current, colors, now);
        // Swap the drawing for the canvas only once the canvas has a frame,
        // so the globe never blinks empty on a busy page.
        if (!('live' in element.dataset)) element.dataset.live = '';
        if (visible && !document.hidden) frame = requestAnimationFrame(draw);
      };
      const start = () => {
        if (!frame && visible && !document.hidden) {
          last = performance.now();
          frame = requestAnimationFrame(draw);
        }
      };

      resize();
      start();

      const onScreen = new IntersectionObserver(([entry]) => {
        visible = entry.isIntersecting;
        start();
      });
      onScreen.observe(canvas);
      const sized = new ResizeObserver(resize);
      sized.observe(canvas);
      const onVisibility = () => start();
      document.addEventListener('visibilitychange', onVisibility);
      // Light and dark themes swap the tokens; read them again.
      const themed = new MutationObserver(() => {
        colors = readColors(element);
      });
      themed.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme', 'class'] });

      // Draggable moves an invisible proxy; its x becomes the globe's turn.
      const proxy = document.createElement('div');
      let base = rotation;
      const [drag] = Draggable.create(proxy, {
        type: 'x',
        trigger: canvas,
        inertia: true,
        allowNativeTouchScrolling: true,
        cursor: 'grab',
        activeCursor: 'grabbing',
        onPress() {
          gsap.set(proxy, { x: 0 });
          base = rotation;
          dragging = true;
        },
        onDrag() {
          rotation = base + this.x * DRAG_DEG_PER_PX;
        },
        onThrowUpdate() {
          rotation = base + this.x * DRAG_DEG_PER_PX;
        },
        onRelease() {
          if (!this.tween?.isActive()) dragging = false;
        },
        onThrowComplete() {
          dragging = false;
        },
      });

      return () => {
        cancelAnimationFrame(frame);
        drag.kill();
        onScreen.disconnect();
        sized.disconnect();
        themed.disconnect();
        document.removeEventListener('visibilitychange', onVisibility);
        delete element.dataset.live;
      };
    },
    { near: '25% 0px', tiers: ['lite', 'full'] },
  );

  return (
    <div ref={root} className={cn('live-globe', className)} aria-hidden="true">
      <div className="live-globe__fallback">{fallback}</div>
      <canvas className="live-globe__canvas" />
    </div>
  );
}

interface Colors {
  line: string;
  faint: string;
  open: string;
  taken: string;
}

function readColors(element: Element): Colors {
  const style = getComputedStyle(element);
  const token = (name: string, fallback: string) => style.getPropertyValue(name).trim() || fallback;
  return {
    line: token('--color-line-2', 'rgba(128,128,128,0.4)'),
    faint: token('--color-line', 'rgba(128,128,128,0.2)'),
    open: token('--color-champagne', '#ecd8b7'),
    taken: token('--color-accent-gimun', '#bd123c'),
  };
}

/** Orthographic projection; `null` for points on the far side. */
function project(lat: number, lon: number, spin: number, radius: number, centre: number): [number, number] | null {
  const phi = lat * RAD;
  const lambda = lon * RAD + spin;
  const cosC = Math.sin(TILT) * Math.sin(phi) + Math.cos(TILT) * Math.cos(phi) * Math.cos(lambda);
  if (cosC < 0) return null;
  const x = radius * Math.cos(phi) * Math.sin(lambda);
  const y = radius * (Math.cos(TILT) * Math.sin(phi) - Math.sin(TILT) * Math.cos(phi) * Math.cos(lambda));
  return [centre + x, centre - y];
}

function polyline(context: CanvasRenderingContext2D, points: ([number, number] | null)[]) {
  let pen = false;
  for (const point of points) {
    if (!point) {
      pen = false;
      continue;
    }
    if (pen) context.lineTo(point[0], point[1]);
    else context.moveTo(point[0], point[1]);
    pen = true;
  }
}

function render(context: CanvasRenderingContext2D, size: number, spin: number, markers: GlobeMarker[], colors: Colors, now: number) {
  const centre = size / 2;
  const radius = size * 0.44;
  context.clearRect(0, 0, size, size);
  context.lineWidth = 1;

  // A soft light from the upper left gives the sphere its volume.
  const shade = context.createRadialGradient(centre - radius * 0.4, centre - radius * 0.45, radius * 0.05, centre, centre, radius);
  shade.addColorStop(0, colors.open);
  shade.addColorStop(1, 'transparent');
  context.globalAlpha = 0.12;
  context.fillStyle = shade;
  context.beginPath();
  context.arc(centre, centre, radius, 0, Math.PI * 2);
  context.fill();
  context.globalAlpha = 1;

  context.strokeStyle = colors.line;
  context.beginPath();
  context.arc(centre, centre, radius, 0, Math.PI * 2);
  context.stroke();

  context.strokeStyle = colors.faint;
  context.beginPath();
  for (let lon = -180; lon < 180; lon += 30) {
    const points: ([number, number] | null)[] = [];
    for (let lat = -90; lat <= 90; lat += 6) points.push(project(lat, lon, spin, radius, centre));
    polyline(context, points);
  }
  for (let lat = -60; lat <= 60; lat += 30) {
    const points: ([number, number] | null)[] = [];
    for (let lon = -180; lon <= 180; lon += 6) points.push(project(lat, lon, spin, radius, centre));
    polyline(context, points);
  }
  context.stroke();

  const pulse = (now / 1600) % 1;
  for (const marker of markers) {
    const point = project(marker.lat, marker.lon, spin, radius, centre);
    if (!point) continue;
    const [x, y] = point;
    if (marker.status === 'available') {
      context.globalAlpha = 0.5 * (1 - pulse);
      context.strokeStyle = colors.open;
      context.beginPath();
      context.arc(x, y, 3 + pulse * 9, 0, Math.PI * 2);
      context.stroke();
      context.globalAlpha = 1;
    }
    context.globalAlpha = marker.status === 'reserved' ? 0.45 : 1;
    context.fillStyle = marker.status === 'available' ? colors.open : colors.taken;
    context.beginPath();
    context.arc(x, y, 3.2, 0, Math.PI * 2);
    context.fill();
    context.globalAlpha = 1;
  }
}
