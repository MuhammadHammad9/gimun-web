/**
 * The lacquer light: a slow field of silk folds catching light, drawn by one
 * fragment shader. Folds take the room's colour (crimson), the sheen along
 * their ridges takes champagne, and a soft lamp follows the pointer.
 *
 * Plain WebGL 1, no dependency. The field is smooth, so it renders at half
 * the canvas's CSS size and the browser scales it up; it draws at most 30
 * times a second, and only while its canvas is on screen and the tab is
 * visible. Output is premultiplied alpha over the page ground, so the same
 * code reads correctly on the dark and the light theme.
 *
 * Loaded lazily by LacquerLight after the visitor's first intent.
 */

const VERTEX = `
attribute vec2 position;
void main() { gl_Position = vec4(position, 0.0, 1.0); }
`;

const FRAGMENT = `
precision mediump float;
uniform vec2 uRes;
uniform float uTime;
uniform vec2 uLamp;
uniform vec3 uFold;
uniform vec3 uSheen;
uniform float uStrength;

float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}

float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  mat2 m = mat2(1.6, 1.2, -1.2, 1.6);
  for (int i = 0; i < 5; i++) {
    v += a * noise(p);
    p = m * p;
    a *= 0.5;
  }
  return v;
}

void main() {
  vec2 p = (gl_FragCoord.xy - 0.5 * uRes) / uRes.y;
  float t = uTime * 0.04;
  // Domain warping: noise displaced by noise reads as cloth, not cloud.
  vec2 q = vec2(fbm(p * 1.3 + vec2(0.0, t)), fbm(p * 1.3 + vec2(5.2, -t)));
  vec2 r = vec2(fbm(p * 1.1 + 2.0 * q + vec2(1.7, 9.2) + 0.6 * t), fbm(p * 1.1 + 2.0 * q + vec2(8.3, 2.8) - 0.4 * t));
  float f = fbm(p * 1.05 + 2.1 * r);

  vec2 lamp = (uLamp - 0.5 * uRes) / uRes.y;
  float lit = exp(-2.6 * length(p - lamp));

  // Folds: the deep parts of the cloth. Ridges: thin bands where it turns
  // toward the light; brighter near the lamp.
  float fold = smoothstep(0.32, 0.78, f) * 0.42;
  float ridge = smoothstep(0.46, 0.6, f) * (1.0 - smoothstep(0.6, 0.74, f));
  float sheen = ridge * (0.16 + 0.6 * lit) + lit * 0.07;

  float alpha = clamp((fold + sheen) * uStrength, 0.0, 0.6);
  vec3 color = (uFold * fold + uSheen * sheen) / max(fold + sheen, 0.0001);
  gl_FragColor = vec4(color * alpha, alpha);
}
`;

export interface LacquerColors {
  fold: [number, number, number];
  sheen: [number, number, number];
  /** Overall intensity; the light theme needs less to read the same. */
  strength: number;
}

export interface Lacquer {
  setColors(colors: LacquerColors): void;
  /** Where the lamp should drift to, in CSS pixels from the canvas's top left. */
  aim(x: number, y: number): void;
  resize(): void;
  destroy(): void;
}

const SCALE = 0.5;
const FRAME_MS = 1000 / 30;

function compile(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

/** Starts the light on `canvas`, or returns null where WebGL is unavailable. */
export function startLacquer(canvas: HTMLCanvasElement, colors: LacquerColors, onFirstFrame: () => void): Lacquer | null {
  const gl = canvas.getContext('webgl', { premultipliedAlpha: true, alpha: true, antialias: false, depth: false, powerPreference: 'low-power' });
  if (!gl) return null;
  const vertex = compile(gl, gl.VERTEX_SHADER, VERTEX);
  const fragment = compile(gl, gl.FRAGMENT_SHADER, FRAGMENT);
  const program = gl.createProgram();
  if (!vertex || !fragment || !program) return null;
  gl.attachShader(program, vertex);
  gl.attachShader(program, fragment);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return null;
  gl.useProgram(program);

  // One triangle that covers the viewport.
  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const position = gl.getAttribLocation(program, 'position');
  gl.enableVertexAttribArray(position);
  gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);

  const uniform = (name: string) => gl.getUniformLocation(program, name);
  const uRes = uniform('uRes');
  const uTime = uniform('uTime');
  const uLamp = uniform('uLamp');
  const uFold = uniform('uFold');
  const uSheen = uniform('uSheen');
  const uStrength = uniform('uStrength');

  let width = 0;
  let height = 0;
  // The lamp rests to the right of centre, where the hero art sits.
  const target = { x: 0.72, y: 0.45 };
  const lamp = { x: 0.72, y: 0.45 };
  let frame = 0;
  let last = 0;
  let visible = true;
  let started = false;
  const origin = performance.now();

  const apply = (next: LacquerColors) => {
    gl.uniform3fv(uFold, next.fold);
    gl.uniform3fv(uSheen, next.sheen);
    gl.uniform1f(uStrength, next.strength);
  };
  apply(colors);

  const resize = () => {
    width = Math.max(1, Math.round(canvas.clientWidth * SCALE));
    height = Math.max(1, Math.round(canvas.clientHeight * SCALE));
    canvas.width = width;
    canvas.height = height;
    gl.viewport(0, 0, width, height);
    gl.uniform2f(uRes, width, height);
  };
  resize();

  const draw = (now: number) => {
    frame = 0;
    schedule();
    if (now - last < FRAME_MS) return;
    last = now;
    // Ease toward the pointer so the light drifts rather than follows.
    lamp.x += (target.x - lamp.x) * 0.06;
    lamp.y += (target.y - lamp.y) * 0.06;
    gl.uniform1f(uTime, (now - origin) / 1000);
    gl.uniform2f(uLamp, lamp.x * width, (1 - lamp.y) * height);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    if (!started) {
      started = true;
      onFirstFrame();
    }
  };

  const schedule = () => {
    if (!frame && visible && !document.hidden) frame = requestAnimationFrame(draw);
  };

  const observer = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    schedule();
  });
  observer.observe(canvas);
  const onVisibility = () => schedule();
  document.addEventListener('visibilitychange', onVisibility);
  schedule();

  return {
    setColors: apply,
    aim(x, y) {
      if (!canvas.clientWidth || !canvas.clientHeight) return;
      target.x = Math.min(1.1, Math.max(-0.1, x / canvas.clientWidth));
      target.y = Math.min(1.1, Math.max(-0.1, y / canvas.clientHeight));
    },
    resize,
    destroy() {
      cancelAnimationFrame(frame);
      observer.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
      gl.deleteShader(vertex);
      gl.deleteShader(fragment);
      gl.getExtension('WEBGL_lose_context')?.loseContext();
    },
  };
}
