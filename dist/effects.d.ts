import type { TCanvas, TContext, TLightLeak, TLightLeakEdge, TRGBColor } from './types';
/**
 * Noise cells across the image's long edge. Grain is generated at this
 * resolution and scaled to the image, so it looks the same on a small preview
 * and on the full-size photo (instead of getting finer as images get larger).
 */
export declare const GRAIN_CELLS = 1200;
/** mulberry32: a small seeded PRNG, so grain is identical on every run. */
export declare const seededRandom: (seed: number) => (() => number);
/** Size of the grain texture for an image: at most GRAIN_CELLS on the long edge. */
export declare const grainSize: (width: number, height: number) => [number, number];
/** Mid-grey noise texture; the last one is reused (same size, same seed). */
export declare const createGrain: (width: number, height: number) => TCanvas;
/**
 * Film grain, blended with "overlay" so it shows most in the midtones (as on
 * film) and least in deep shadows and highlights. `amount` is 0–1.
 */
export declare const applyGrain: (ctx: TContext, width: number, height: number, amount: number, supportsBlendModes: boolean) => void;
export declare const DEFAULT_LIGHT_LEAK_COLOR: TRGBColor;
/**
 * Center of the leak's glow: just outside the given edge and off-center, the
 * way light gets into a camera through a gap in the back.
 */
export declare const lightLeakOrigin: (width: number, height: number, edge: TLightLeakEdge) => [number, number];
/** A warm glow bleeding in from one edge, blended with "screen". */
export declare const applyLightLeak: (ctx: TContext, width: number, height: number, leak: TLightLeak, supportsBlendModes: boolean) => void;
