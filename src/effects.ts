import type {
  TCanvas,
  TContext,
  TLightLeak,
  TLightLeakEdge,
  TRGBColor,
} from './types';

import { createCanvas, get2dContext } from './utils';

/**
 * Noise cells across the image's long edge. Grain is generated at this
 * resolution and scaled to the image, so it looks the same on a small preview
 * and on the full-size photo (instead of getting finer as images get larger).
 */
export const GRAIN_CELLS = 1200;
const GRAIN_SEED = 0x5eed;

/** mulberry32: a small seeded PRNG, so grain is identical on every run. */
export const seededRandom = (seed: number): (() => number) => {
  let state = seed | 0;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

/** Size of the grain texture for an image: at most GRAIN_CELLS on the long edge. */
export const grainSize = (width: number, height: number): [number, number] => {
  const scale = Math.min(1, GRAIN_CELLS / Math.max(width, height));
  return [
    Math.max(1, Math.round(width * scale)),
    Math.max(1, Math.round(height * scale)),
  ];
};

let grainCache: { key: string; canvas: TCanvas } | null = null;

/** Mid-grey noise texture; the last one is reused (same size, same seed). */
export const createGrain = (width: number, height: number): TCanvas => {
  const [gw, gh] = grainSize(width, height);
  const key = `${gw}x${gh}`;
  if (grainCache && grainCache.key === key) return grainCache.canvas;

  const random = seededRandom(GRAIN_SEED);
  // The sum of three uniform values is roughly normally distributed.
  const noise = (amplitude: number) =>
    (random() + random() + random() - 1.5) * amplitude;

  // Film grain clumps, so start with coarse noise at half resolution and
  // scale it up smoothly…
  const cw = Math.max(1, Math.round(gw / 2));
  const ch = Math.max(1, Math.round(gh / 2));
  const coarse = createCanvas(cw, ch);
  const coarseCtx = get2dContext(coarse);
  const coarseImage = coarseCtx.createImageData(cw, ch);
  for (let i = 0; i < coarseImage.data.length; i += 4) {
    const v = 128 + noise(48);
    coarseImage.data[i] = v;
    coarseImage.data[i + 1] = v;
    coarseImage.data[i + 2] = v;
    coarseImage.data[i + 3] = 255;
  }
  coarseCtx.putImageData(coarseImage, 0, 0);

  const canvas = createCanvas(gw, gh);
  const ctx = get2dContext(canvas);
  ctx.imageSmoothingEnabled = true;
  ctx.drawImage(coarse, 0, 0, gw, gh);

  // …then add a finer layer on top.
  const image = ctx.getImageData(0, 0, gw, gh);
  const data = image.data;
  for (let i = 0; i < data.length; i += 4) {
    const v = data[i] + noise(32);
    data[i] = v;
    data[i + 1] = v;
    data[i + 2] = v;
  }
  ctx.putImageData(image, 0, 0);
  grainCache = { key, canvas };
  return canvas;
};

/**
 * Film grain, blended with "overlay" so it shows most in the midtones (as on
 * film) and least in deep shadows and highlights. `amount` is 0–1.
 */
export const applyGrain = (
  ctx: TContext,
  width: number,
  height: number,
  amount: number,
  supportsBlendModes: boolean,
): void => {
  const grain = createGrain(width, height);
  if (supportsBlendModes) {
    ctx.save();
    ctx.globalCompositeOperation = 'overlay';
    ctx.globalAlpha = amount;
    ctx.imageSmoothingEnabled = true;
    ctx.drawImage(grain, 0, 0, width, height);
    ctx.restore();
    return;
  }

  // Fallback without blend modes: add the noise to the pixels directly.
  const scaled = createCanvas(width, height);
  const scaledCtx = get2dContext(scaled);
  scaledCtx.drawImage(grain, 0, 0, width, height);
  const noise = scaledCtx.getImageData(0, 0, width, height).data;
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;
  for (let i = 0; i < data.length; i += 4) {
    const n = (noise[i] - 128) * amount;
    data[i] += n;
    data[i + 1] += n;
    data[i + 2] += n;
  }
  ctx.putImageData(imageData, 0, 0);
};

export const DEFAULT_LIGHT_LEAK_COLOR: TRGBColor = { r: 255, g: 112, b: 36 };
const LEAK_CORE_COLOR: TRGBColor = { r: 255, g: 214, b: 150 };

/**
 * Center of the leak's glow: just outside the given edge and off-center, the
 * way light gets into a camera through a gap in the back.
 */
export const lightLeakOrigin = (
  width: number,
  height: number,
  edge: TLightLeakEdge,
): [number, number] => {
  switch (edge) {
    case 'left':
      return [-0.06 * width, 0.62 * height];
    case 'top':
      return [0.62 * width, -0.06 * height];
    case 'bottom':
      return [0.38 * width, 1.06 * height];
    default:
      return [1.06 * width, 0.38 * height];
  }
};

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const rgba = ({ r, g, b }: TRGBColor, alpha: number) =>
  `rgba(${r},${g},${b},${clamp01(alpha)})`;

/** A warm glow bleeding in from one edge, blended with "screen". */
export const applyLightLeak = (
  ctx: TContext,
  width: number,
  height: number,
  leak: TLightLeak,
  supportsBlendModes: boolean,
): void => {
  const intensity = clamp01(leak.intensity);
  if (intensity === 0) return;
  const color = leak.color || DEFAULT_LIGHT_LEAK_COLOR;
  const [x, y] = lightLeakOrigin(width, height, leak.edge || 'right');
  const reach = Math.max(width, height);

  ctx.save();
  ctx.globalCompositeOperation = supportsBlendModes ? 'screen' : 'lighter';

  // A wide, soft glow…
  let gradient = ctx.createRadialGradient(x, y, 0, x, y, reach * 0.8);
  gradient.addColorStop(0, rgba(color, intensity));
  gradient.addColorStop(0.4, rgba(color, intensity * 0.45));
  gradient.addColorStop(1, rgba(color, 0));
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  // …with a hotter, paler core close to the edge.
  gradient = ctx.createRadialGradient(x, y, 0, x, y, reach * 0.32);
  gradient.addColorStop(0, rgba(LEAK_CORE_COLOR, intensity * 0.9));
  gradient.addColorStop(1, rgba(LEAK_CORE_COLOR, 0));
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  ctx.restore();
};
