import React from "react";

/* ─────────────────────────────────────────────────────────────────────────────
   3D football renderer.

   The ball is a real sphere: for every pixel we take the view-space normal,
   rotate it into texture space and ask which face of a truncated icosahedron
   the radial ray hits (32 face planes — 12 pentagons, 20 hexagons). Lighting is
   fixed in view space, so the ball turns while the highlight stays put.

   Frames are pre-rendered once per tone into a shared sprite atlas, so any
   number of loaders on a page costs one drawImage each per frame.
   ────────────────────────────────────────────────────────────────────────── */

const PHI = (1 + Math.sqrt(5)) / 2;
const FRAME_SIZE = 208;
const FRAME_COUNT = 24;
const TEX_W = 384;
const TEX_H = 192;
/* pentagon face planes sit further from the centre than hexagon ones
   (h_pent 2.3274 vs h_hex 2.2673 at edge = 1) */
const PENT_SCALE = 0.97418;
const SEAM = 0.012;
const AXIS = normalize([0.2, 1, 0.14]);
const LIGHT = normalize([-0.4, 0.5, 0.78]);
const HALF = normalize([LIGHT[0], LIGHT[1], LIGHT[2] + 1]);

function normalize(v) {
  const l = Math.hypot(v[0], v[1], v[2]);
  return [v[0] / l, v[1] / l, v[2] / l];
}

function faceCentres() {
  const pent = [];
  const hex = [];
  for (const a of [1, -1]) {
    for (const b of [1, -1]) {
      pent.push([0, a, b * PHI], [a, b * PHI, 0], [a * PHI, 0, b]);
      hex.push([a / PHI, 0, b * PHI], [0, a * PHI, b / PHI], [a * PHI, b / PHI, 0]);
    }
  }
  for (const a of [1, -1]) for (const b of [1, -1]) for (const c of [1, -1]) hex.push([a, b, c]);
  return pent.map(normalize).concat(hex.map(normalize)); // first 12 = pentagons
}

function rodrigues(a, t) {
  const c = Math.cos(t), s = Math.sin(t), k = 1 - c, [x, y, z] = a;
  return [
    c + k * x * x, k * x * y - s * z, k * x * z + s * y,
    k * y * x + s * z, c + k * y * y, k * y * z - s * x,
    k * z * x - s * y, k * z * y + s * x, c + k * z * z,
  ];
}

let TEXTURE = null;
function texture() {
  if (TEXTURE) return TEXTURE;
  const C = faceCentres();
  const tex = new Uint8Array(TEX_W * TEX_H); // 0 hexagon · 1 pentagon · 2 seam
  for (let y = 0; y < TEX_H; y++) {
    const lat = Math.PI / 2 - ((y + 0.5) / TEX_H) * Math.PI;
    const cy = Math.cos(lat), sy = Math.sin(lat);
    for (let x = 0; x < TEX_W; x++) {
      const lon = ((x + 0.5) / TEX_W) * Math.PI * 2 - Math.PI;
      const dx = cy * Math.cos(lon), dy = sy, dz = cy * Math.sin(lon);
      let d1 = -2, d2 = -2, i1 = 0;
      for (let i = 0; i < C.length; i++) {
        const c = C[i];
        const d = (dx * c[0] + dy * c[1] + dz * c[2]) * (i < 12 ? PENT_SCALE : 1);
        if (d > d1) { d2 = d1; d1 = d; i1 = i; } else if (d > d2) d2 = d;
      }
      tex[y * TEX_W + x] = d1 - d2 < SEAM ? 2 : i1 < 12 ? 1 : 0;
    }
  }
  TEXTURE = tex;
  return tex;
}

function readRGB(name, fallback) {
  if (typeof window === "undefined") return fallback;
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  const m = /^#?([0-9a-f]{6})$/i.exec(v);
  if (!m) return fallback;
  const n = parseInt(m[1], 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function palette(tone) {
  const ink = readRGB("--color-ink", [17, 24, 39]);
  const canvas = readRGB("--color-canvas", [255, 255, 255]);
  const body = readRGB("--color-body", [55, 65, 81]);
  const pale = readRGB("--color-primary-pale", [228, 240, 196]);
  return tone === "night"
    ? { hex: [26, 33, 47], pent: pale, seam: [10, 14, 22] }
    : { hex: [Math.min(250, canvas[0]), Math.min(250, canvas[1]), Math.min(250, canvas[2])], pent: ink, seam: body };
}

const ATLASES = new Map();
function atlasFor(tone) {
  let a = ATLASES.get(tone);
  if (a) return a;
  const canvas = document.createElement("canvas");
  canvas.width = FRAME_SIZE * FRAME_COUNT;
  canvas.height = FRAME_SIZE;
  // interleaved order: coverage stays even while frames are still being made
  const order = [];
  const seen = new Set();
  for (let step = FRAME_COUNT; step >= 1; step = Math.floor(step / 2)) {
    for (let i = 0; i < FRAME_COUNT; i += step) if (!seen.has(i)) { seen.add(i); order.push(i); }
    if (step === 1) break;
  }
  a = { canvas, done: new Uint8Array(FRAME_COUNT), queue: order, colors: palette(tone) };
  ATLASES.set(tone, a);
  return a;
}

function renderFrame(a, f) {
  const r = FRAME_SIZE / 2;
  const ctx = a.canvas.getContext("2d");
  const img = ctx.createImageData(FRAME_SIZE, FRAME_SIZE);
  const data = img.data;
  const m = rodrigues(AXIS, -(f / FRAME_COUNT) * Math.PI * 2);
  const tex = texture();
  const { hex, pent, seam } = a.colors;
  for (let py = 0; py < FRAME_SIZE; py++) {
    const ny = -(py + 0.5 - r) / r;
    for (let px = 0; px < FRAME_SIZE; px++) {
      const i = (py * FRAME_SIZE + px) * 4;
      const nx = (px + 0.5 - r) / r;
      const q = nx * nx + ny * ny;
      if (q >= 1) { data[i + 3] = 0; continue; }
      const nz = Math.sqrt(1 - q);
      const dx = m[0] * nx + m[1] * ny + m[2] * nz;
      const dy = m[3] * nx + m[4] * ny + m[5] * nz;
      const dz = m[6] * nx + m[7] * ny + m[8] * nz;
      let u = (((Math.atan2(dz, dx) + Math.PI) / (Math.PI * 2)) * TEX_W) | 0;
      let v = (((Math.PI / 2 - Math.asin(dy < -1 ? -1 : dy > 1 ? 1 : dy)) / Math.PI) * TEX_H) | 0;
      if (u < 0) u = 0; else if (u >= TEX_W) u = TEX_W - 1;
      if (v < 0) v = 0; else if (v >= TEX_H) v = TEX_H - 1;
      const t = tex[v * TEX_W + u];
      const col = t === 1 ? pent : t === 2 ? seam : hex;
      let diff = nx * LIGHT[0] + ny * LIGHT[1] + nz * LIGHT[2];
      if (diff < 0) diff = 0;
      const sh = 0.5 + 0.6 * diff;
      let spec = 0;
      const sp = nx * HALF[0] + ny * HALF[1] + nz * HALF[2];
      if (sp > 0.6) { let s = sp * sp; s *= s; s *= s; s *= s; spec = 0.34 * s; }
      const add = 255 * spec;
      const rr = col[0] * sh + add, gg = col[1] * sh + add, bb = col[2] * sh + add;
      data[i] = rr > 255 ? 255 : rr;
      data[i + 1] = gg > 255 ? 255 : gg;
      data[i + 2] = bb > 255 ? 255 : bb;
      const edge = (1 - Math.sqrt(q)) * r;
      data[i + 3] = edge < 1 ? edge * 255 : 255;
    }
  }
  ctx.putImageData(img, f * FRAME_SIZE, 0);
  a.done[f] = 1;
}

const LIVE = new Set();
let raf = 0;

function nearestReady(a, f) {
  for (let k = 0; k <= FRAME_COUNT; k++) {
    const x = (f + k) % FRAME_COUNT, y = (f - k + FRAME_COUNT) % FRAME_COUNT;
    if (a.done[x]) return x;
    if (a.done[y]) return y;
  }
  return -1;
}

function tick() {
  raf = requestAnimationFrame(tick);
  const start = performance.now();
  for (const inst of LIVE) {
    const a = atlasFor(inst.tone);
    while (a.queue.length && performance.now() - start < 7) renderFrame(a, a.queue.shift());
    break;
  }
  const t = performance.now() / 1000;
  for (const inst of LIVE) {
    const a = atlasFor(inst.tone);
    const c = inst.canvas;
    if (!c || !c.isConnected) continue;
    const phase = inst.still ? 0 : (t / inst.spinSeconds) % 1;
    const f = nearestReady(a, Math.floor(phase * FRAME_COUNT) % FRAME_COUNT);
    if (f < 0) continue;
    if (inst.still && inst.painted === f) continue;
    inst.painted = f;
    const ctx = c.getContext("2d");
    ctx.clearRect(0, 0, c.width, c.height);
    ctx.drawImage(a.canvas, f * FRAME_SIZE, 0, FRAME_SIZE, FRAME_SIZE, 0, 0, c.width, c.height);
  }
  if (!LIVE.size) { cancelAnimationFrame(raf); raf = 0; }
}

/** Spinning 3D football — the app's loading indicator. */
export function BallLoader({
  size = 40,
  spinSeconds = 1.1,
  tone = "classic",
  caption,
  shadow = false,
  label = "Loading",
  style,
  ...rest
}) {
  const ref = React.useRef(null);

  React.useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return undefined;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const px = Math.round(size * dpr);
    canvas.width = px;
    canvas.height = px;
    const still = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const inst = { canvas, tone, spinSeconds, still, painted: -1 };
    LIVE.add(inst);
    if (!raf) raf = requestAnimationFrame(tick);
    return () => { LIVE.delete(inst); };
  }, [size, tone, spinSeconds]);

  return (
    <div
      role="status"
      aria-label={caption ? undefined : label}
      style={{
        display: "inline-flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "var(--space-sm)",
        ...style,
      }}
      {...rest}
    >
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: Math.max(6, size * 0.11) }}>
        <canvas ref={ref} style={{ width: size, height: size, display: "block" }}></canvas>
        {shadow ? (
          <span
            aria-hidden="true"
            style={{
              width: size * 0.63,
              height: Math.max(4, size * 0.08),
              borderRadius: "var(--radius-pill)",
              background: "rgb(17 24 39 / 0.16)",
              filter: "blur(3px)",
            }}
          ></span>
        ) : null}
      </div>
      {caption ? <span style={{ font: "var(--type-body-sm-strong)", color: "var(--color-body)" }}>{caption}</span> : null}
    </div>
  );
}
