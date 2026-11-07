// Renders real pixels in Node: @napi-rs/canvas (Skia) stands in for
// OffscreenCanvas, the same way vintagejs runs in a Web Worker.
import { Canvas, Image } from '@napi-rs/canvas';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { grainSize, lightLeakOrigin, seededRandom } from '../src/effects';

let vintagejs: typeof import('../src/index').default;

beforeEach(async () => {
  vi.resetModules();
  vi.stubGlobal('document', undefined);
  vi.stubGlobal('Image', undefined);
  vi.stubGlobal('OffscreenCanvas', Canvas);
  vi.stubGlobal('ImageBitmap', Image);
  vintagejs = (await import('../src/index')).default;
});

afterEach(() => {
  vi.unstubAllGlobals();
});

const flat = (width: number, height: number, value: number) => {
  const canvas = new Canvas(width, height);
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = `rgb(${value},${value},${value})`;
  ctx.fillRect(0, 0, width, height);
  return canvas;
};

const render = async (source: Canvas, effect: object) => {
  const res = await vintagejs<OffscreenCanvas>(
    source as unknown as OffscreenCanvas,
    effect,
  );
  const canvas = res.getCanvas() as unknown as Canvas;
  return canvas
    .getContext('2d')
    .getImageData(0, 0, canvas.width, canvas.height).data;
};

/** Mean and standard deviation of the red channel in a column range. */
const stats = (
  data: Uint8ClampedArray,
  width: number,
  fromX = 0,
  toX = width,
) => {
  const values: number[] = [];
  for (let i = 0; i < data.length; i += 4) {
    const x = (i / 4) % width;
    if (x >= fromX && x < toX) values.push(data[i]);
  }
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const sd = Math.sqrt(
    values.reduce((a, b) => a + (b - mean) ** 2, 0) / values.length,
  );
  return { mean, sd };
};

describe('helpers', () => {
  it('seededRandom repeats its sequence and stays in [0, 1)', () => {
    const a = seededRandom(42);
    const b = seededRandom(42);
    const values = Array.from({ length: 1000 }, () => a());
    expect(Array.from({ length: 1000 }, () => b())).toEqual(values);
    expect(Math.min(...values)).toBeGreaterThanOrEqual(0);
    expect(Math.max(...values)).toBeLessThan(1);
  });

  it('grain texture is capped relative to the image, never upscaled', () => {
    expect(grainSize(6000, 4000)).toEqual([1200, 800]);
    expect(grainSize(4000, 6000)).toEqual([800, 1200]);
    expect(grainSize(600, 400)).toEqual([600, 400]);
  });

  it('puts the light leak just outside the chosen edge', () => {
    expect(lightLeakOrigin(100, 100, 'right')[0]).toBeGreaterThan(100);
    expect(lightLeakOrigin(100, 100, 'left')[0]).toBeLessThan(0);
    expect(lightLeakOrigin(100, 100, 'top')[1]).toBeLessThan(0);
    expect(lightLeakOrigin(100, 100, 'bottom')[1]).toBeGreaterThan(100);
  });
});

describe('grain', () => {
  it('adds texture to a flat image without shifting its brightness', async () => {
    const data = await render(flat(200, 120, 128), { grain: 0.6 });
    const { mean, sd } = stats(data, 200);
    expect(sd).toBeGreaterThan(5);
    expect(Math.abs(mean - 128)).toBeLessThan(4);
  });

  it('is identical on every run', async () => {
    const a = await render(flat(120, 80, 128), { grain: 0.5 });
    const b = await render(flat(120, 80, 128), { grain: 0.5 });
    expect(Buffer.from(a).equals(Buffer.from(b))).toBe(true);
  });

  it('does nothing at 0', async () => {
    const data = await render(flat(60, 40, 128), { grain: 0 });
    expect(stats(data, 60).sd).toBe(0);
  });
});

describe('light leak', () => {
  it('brightens and warms the chosen edge', async () => {
    const width = 300;
    const data = await render(flat(width, 200, 60), {
      lightLeak: { intensity: 0.8, edge: 'right' },
    });
    const left = stats(data, width, 0, 60).mean;
    const right = stats(data, width, 240, 300).mean;
    expect(right).toBeGreaterThan(left + 40);

    // Warm: at the right edge, red rises more than blue.
    const i = (100 * width + 290) * 4;
    expect(data[i]).toBeGreaterThan(data[i + 2] + 40);
  });

  it('does nothing at intensity 0', async () => {
    const data = await render(flat(60, 40, 60), {
      lightLeak: { intensity: 0 },
    });
    expect(stats(data, 60).sd).toBe(0);
    expect(stats(data, 60).mean).toBe(60);
  });
});
