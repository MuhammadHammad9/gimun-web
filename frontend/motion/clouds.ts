/**
 * Drifting clouds for the home hero, drawn by one fragment shader.
 *
 * Two layers of cloud (a small, slow far bank and a large near one) built
 * from domain-warped fractal noise, the usual recipe for procedural clouds.
 * Each is lit from one sun direction: the density a little way toward the
 * sun is sampled, so faces turned to the light brighten and the far side
 * falls into shade, and thin edges glow (a Beer-Lambert style falloff gives
 * the silver lining). The wind carries both layers at different speeds, the
 * shapes keep changing as they go, and the pointer shifts the layers a
 * little for depth.
 *
 * Plain WebGL 1, no dependency. It renders at half the canvas's CSS size (the
 * clouds are soft), at most 30 frames a second, and only while on screen and
 * the tab is visible. Output is premultiplied alpha over the page ground, so
 * the theme's own background shows between the clouds.
 *
 * Loaded lazily by HeroClouds after the visitor's first intent.
 */

const VERTEX = `
attribute vec2 position;
void main() { gl_Position = vec4(position, 0.0, 1.0); }
`;

const FRAGMENT = `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
uniform vec2 uRes;
uniform float uTime;
uniform vec2 uPointer;
uniform vec3 uLit;
uniform vec3 uShade;
uniform vec3 uSky;
uniform float uSkyAlpha;
uniform float uStrength;

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}

const mat2 TURN = mat2(1.6, 1.2, -1.2, 1.6);

float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 5; i++) {
    v += a * noise(p);
    p = TURN * p;
    a *= 0.5;
  }
  return v;
}

// Cloud density at p: noise displaced by noise, then cut at the cover level.
float cloud(vec2 p, float t, float cover) {
  vec2 warp = vec2(fbm(p * 0.65 + vec2(0.0, t * 0.05)), fbm(p * 0.65 + vec2(5.2, -t * 0.04)));
  float n = fbm(p + 0.95 * warp + vec2(-t * 0.05, 0.0));
  return clamp((n - cover) * 3.4, 0.0, 1.0);
}

// One lit layer, premultiplied.
vec4 layer(vec2 p, float t, float cover, float weight) {
  float d = cloud(p, t, cover);
  if (d <= 0.002) return vec4(0.0);
  // Toward the sun (upper left): less cloud there means this face is lit.
  float toward = cloud(p + vec2(-0.045, 0.06), t, cover);
  float light = clamp(0.55 + (d - toward) * 3.0, 0.0, 1.0);
  float thin = exp(-d * 2.2);
  vec3 color = mix(uShade, uLit, light);
  color = mix(color, uLit, thin * 0.45);
  float alpha = smoothstep(0.0, 0.42, d) * weight;
  return vec4(color * alpha, alpha);
}

void main() {
  vec2 p = (gl_FragCoord.xy - 0.5 * uRes) / uRes.y;
  float t = uTime;
  vec4 far = layer(p * 2.3 + uPointer * 0.025 + vec2(t * 0.006, 0.0), t * 0.55, 0.5, 0.6);
  vec4 near = layer(p * 1.2 + uPointer * 0.07 + vec2(t * 0.012, 0.0) + vec2(3.1, 1.7), t, 0.47, 1.0);
  vec4 color = near + far * (1.0 - near.a);
  // A day sky: a warm haze, deepest toward the top, that the white tops
  // stand out against. Absent at night.
  vec2 uv = gl_FragCoord.xy / uRes;
  float haze = uSkyAlpha * smoothstep(0.0, 1.0, uv.y) * (0.6 + 0.4 * uv.x);
  vec4 sky = vec4(uSky * haze, haze);
  color = color + sky * (1.0 - color.a);
  gl_FragColor = color * uStrength;
}
`;

export interface CloudColors {
  /** Sunlit faces. */
  lit: [number, number, number];
  /** Faces turned away from the sun. */
  shade: [number, number, number];
  /** The haze behind the clouds, and how much of it (0 at night). */
  sky: [number, number, number];
  skyAlpha: number;
  strength: number;
}

export interface Clouds {
  setColors(colors: CloudColors): void;
  /** Pointer position in CSS pixels from the canvas's top left. */
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

/** Starts the clouds on `canvas`, or returns null where WebGL is unavailable. */
export function startClouds(canvas: HTMLCanvasElement, colors: CloudColors, onFirstFrame: () => void): Clouds | null {
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

  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const position = gl.getAttribLocation(program, 'position');
  gl.enableVertexAttribArray(position);
  gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);

  const uniform = (name: string) => gl.getUniformLocation(program, name);
  const uRes = uniform('uRes');
  const uTime = uniform('uTime');
  const uPointer = uniform('uPointer');
  const uLit = uniform('uLit');
  const uShade = uniform('uShade');
  const uStrength = uniform('uStrength');
  const uSky = uniform('uSky');
  const uSkyAlpha = uniform('uSkyAlpha');

  const target = { x: 0, y: 0 };
  const pointer = { x: 0, y: 0 };
  let frame = 0;
  let last = 0;
  let visible = true;
  let started = false;
  // Start somewhere along the wind, so the first frame is already a sky.
  const origin = performance.now() - 40_000;

  const apply = (next: CloudColors) => {
    gl.uniform3fv(uLit, next.lit);
    gl.uniform3fv(uShade, next.shade);
    gl.uniform1f(uStrength, next.strength);
    gl.uniform3fv(uSky, next.sky);
    gl.uniform1f(uSkyAlpha, next.skyAlpha);
  };
  apply(colors);

  const resize = () => {
    const width = Math.max(1, Math.round(canvas.clientWidth * SCALE));
    const height = Math.max(1, Math.round(canvas.clientHeight * SCALE));
    if (width === canvas.width && height === canvas.height) return;
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
    pointer.x += (target.x - pointer.x) * 0.04;
    pointer.y += (target.y - pointer.y) * 0.04;
    gl.uniform1f(uTime, (now - origin) / 1000);
    gl.uniform2f(uPointer, pointer.x, pointer.y);
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
      target.x = Math.max(-1, Math.min(1, (x / canvas.clientWidth) * 2 - 1));
      target.y = Math.max(-1, Math.min(1, 1 - (y / canvas.clientHeight) * 2));
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
