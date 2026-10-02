/**
 * Shared runner for the ogl shader backdrops (the seat's scanner, the
 * footer's molten light): one full-screen triangle, a program, a pointer
 * eased toward the cursor, and a loop that draws at most 30 frames a second,
 * only while on screen and the tab is visible. Loaded lazily with ogl, so
 * neither is ever part of a page's first load.
 */
import { Mesh, Program, Renderer, Triangle } from 'ogl';

export type Uniforms = Record<string, { value: unknown }>;

export interface Backdrop {
  uniforms: Uniforms;
  destroy(): void;
}

const FRAME_MS = 1000 / 30;

export function startBackdrop(
  container: HTMLElement,
  {
    vertex,
    fragment,
    uniforms,
    onPointer,
    onFrame,
    onFirstFrame,
  }: {
    vertex: string;
    fragment: string;
    uniforms: Uniforms;
    /** Pointer as 0–1 across the canvas (y up), or null when it leaves. */
    onPointer?: (point: [number, number] | null) => void;
    onFrame?: (time: number) => void;
    onFirstFrame?: () => void;
  },
): Backdrop | null {
  let renderer: Renderer;
  try {
    renderer = new Renderer({ webgl: 2, alpha: true, premultipliedAlpha: true, antialias: false, dpr: Math.min(window.devicePixelRatio || 1, 1.5) });
  } catch {
    return null;
  }
  const gl = renderer.gl;
  if (!gl || !(typeof WebGL2RenderingContext !== 'undefined' && gl instanceof WebGL2RenderingContext)) return null;
  gl.clearColor(0, 0, 0, 0);
  const canvas = gl.canvas as HTMLCanvasElement;
  canvas.style.width = '100%';
  canvas.style.height = '100%';
  canvas.style.display = 'block';
  container.appendChild(canvas);

  let program: Program;
  try {
    program = new Program(gl, { vertex, fragment, uniforms });
  } catch {
    container.removeChild(canvas);
    return null;
  }
  const mesh = new Mesh(gl, { geometry: new Triangle(gl), program });
  const resolution = program.uniforms.iResolution?.value as Float32Array | undefined;

  const setSize = () => {
    const rect = container.getBoundingClientRect();
    renderer.setSize(Math.max(1, Math.floor(rect.width)), Math.max(1, Math.floor(rect.height)));
    if (resolution) {
      resolution[0] = gl.drawingBufferWidth;
      resolution[1] = gl.drawingBufferHeight;
    }
  };
  const sized = new ResizeObserver(setSize);
  sized.observe(container);
  setSize();

  // The backdrop sits under the section's content, so the pointer is read
  // from the window and mapped onto the canvas.
  const onMove = (event: PointerEvent) => {
    if (!onPointer || event.pointerType !== 'mouse') return;
    const rect = canvas.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width;
    const y = 1 - (event.clientY - rect.top) / rect.height;
    onPointer(x >= 0 && x <= 1 && y >= 0 && y <= 1 ? [x, y] : null);
  };
  window.addEventListener('pointermove', onMove, { passive: true });

  let raf = 0;
  let last = 0;
  let visible = true;
  let started = false;
  const t0 = performance.now();
  const loop = (now: number) => {
    raf = 0;
    schedule();
    if (now - last < FRAME_MS) return;
    last = now;
    const time = (now - t0) / 1000;
    if (program.uniforms.iTime) program.uniforms.iTime.value = time;
    onFrame?.(time);
    renderer.render({ scene: mesh });
    if (!started) {
      started = true;
      onFirstFrame?.();
    }
  };
  const schedule = () => {
    if (!raf && visible && !document.hidden) raf = requestAnimationFrame(loop);
  };
  const seen = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    schedule();
  });
  seen.observe(container);
  const onVisibility = () => schedule();
  document.addEventListener('visibilitychange', onVisibility);
  schedule();

  return {
    uniforms: program.uniforms as Uniforms,
    destroy() {
      cancelAnimationFrame(raf);
      sized.disconnect();
      seen.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('pointermove', onMove);
      if (canvas.parentNode === container) container.removeChild(canvas);
      gl.getExtension('WEBGL_lose_context')?.loseContext();
    },
  };
}

export const FULLSCREEN_VERTEX = `#version 300 es
in vec2 position;
void main() {
  gl_Position = vec4(position, 0.0, 1.0);
}
`;
