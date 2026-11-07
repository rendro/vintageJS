// Exercises vintagejs in an environment without a DOM (like a Web Worker):
// no `document`, no `Image`, no `HTMLCanvasElement`, only OffscreenCanvas,
// ImageBitmap, createImageBitmap and fetch. Those are faked minimally below.
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

class FakeBitmap {
  constructor(
    public width: number,
    public height: number,
    public data: Uint8ClampedArray,
  ) {}
}

class FakeContext {
  globalCompositeOperation = 'source-over';
  fillStyle: unknown = null;
  constructor(private canvas: FakeOffscreenCanvas) {}

  drawImage(src: FakeOffscreenCanvas | FakeBitmap) {
    const { data } = this.canvas;
    if (this.globalCompositeOperation === 'multiply') {
      for (let i = 0; i < data.length; i++) data[i] = (data[i] * src.data[i]) / 255;
    } else {
      data.set(src.data);
    }
  }
  getImageData() {
    return { data: new Uint8ClampedArray(this.canvas.data) };
  }
  putImageData(imageData: { data: Uint8ClampedArray }) {
    this.canvas.data.set(imageData.data);
  }
  createRadialGradient() {
    return { addColorStop() {} };
  }
  fillRect() {}
}

class FakeOffscreenCanvas {
  data: Uint8ClampedArray;
  constructor(
    public width: number,
    public height: number,
  ) {
    this.data = new Uint8ClampedArray(width * height * 4);
  }
  getContext(type: string) {
    return type === '2d' ? new FakeContext(this) : null;
  }
  convertToBlob = vi.fn(
    (opts: { type: string; quality: number }) =>
      Promise.resolve({ fake: 'blob', ...opts }) as unknown as Promise<Blob>,
  );
}

const pixels = (...rgba: number[]) => new Uint8ClampedArray(rgba);

let vintagejs: typeof import('../src/index').default;

beforeEach(async () => {
  vi.resetModules();
  vi.stubGlobal('document', undefined);
  vi.stubGlobal('Image', undefined);
  vi.stubGlobal('OffscreenCanvas', FakeOffscreenCanvas);
  vi.stubGlobal('ImageBitmap', FakeBitmap);
  vintagejs = (await import('../src/index')).default;
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('vintagejs without a DOM (Web Worker)', () => {
  it('applies an effect to an ImageBitmap and returns an OffscreenCanvas', async () => {
    const bitmap = new FakeBitmap(1, 1, pixels(50, 100, 150, 255));
    const res = await vintagejs<OffscreenCanvas>(
      bitmap as unknown as ImageBitmap,
      { brightness: 0.5 },
    );
    const canvas = res.getCanvas() as unknown as FakeOffscreenCanvas;

    expect(canvas).toBeInstanceOf(FakeOffscreenCanvas);
    expect(Array.from(canvas.data)).toEqual([178, 228, 255, 255]);
  });

  it('clones an OffscreenCanvas source instead of drawing on it', async () => {
    const source = new FakeOffscreenCanvas(1, 1);
    source.data.set([10, 20, 30, 255]);
    const res = await vintagejs<OffscreenCanvas>(
      source as unknown as OffscreenCanvas,
      { brightness: 0.5 },
    );

    expect(Array.from(source.data)).toEqual([10, 20, 30, 255]);
    expect(res.getCanvas()).not.toBe(source);
  });

  it('loads the viewfinder with fetch + createImageBitmap and multiplies it in', async () => {
    const blob = { kind: 'viewfinder-blob' };
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      blob: () => Promise.resolve(blob),
    });
    const createImageBitmapMock = vi
      .fn()
      .mockResolvedValue(new FakeBitmap(1, 1, pixels(255, 0, 255, 255)));
    vi.stubGlobal('fetch', fetchMock);
    vi.stubGlobal('createImageBitmap', createImageBitmapMock);

    const bitmap = new FakeBitmap(1, 1, pixels(200, 200, 200, 255));
    const res = await vintagejs<OffscreenCanvas>(
      bitmap as unknown as ImageBitmap,
      { viewfinder: '/film-1.jpg' },
    );
    const canvas = res.getCanvas() as unknown as FakeOffscreenCanvas;

    expect(fetchMock).toHaveBeenCalledWith('/film-1.jpg');
    expect(createImageBitmapMock).toHaveBeenCalledWith(blob);
    expect(Array.from(canvas.data)).toEqual([200, 0, 200, 255]);
  });

  it('rejects instead of hanging when the viewfinder cannot be loaded', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: false, status: 404 }),
    );
    const bitmap = new FakeBitmap(1, 1, pixels(1, 2, 3, 255));

    await expect(
      vintagejs(bitmap as unknown as ImageBitmap, { viewfinder: '/missing.jpg' }),
    ).rejects.toThrow('HTTP 404');
  });

  it('encodes the result with getBlob via convertToBlob', async () => {
    const bitmap = new FakeBitmap(1, 1, pixels(1, 2, 3, 255));
    const res = await vintagejs<OffscreenCanvas>(
      bitmap as unknown as ImageBitmap,
      {},
    );
    const canvas = res.getCanvas() as unknown as FakeOffscreenCanvas;

    await res.getBlob('image/png', 0.8);
    expect(canvas.convertToBlob).toHaveBeenCalledWith({
      type: 'image/png',
      quality: 0.8,
    });

    await res.getBlob();
    expect(canvas.convertToBlob).toHaveBeenLastCalledWith({
      type: 'image/jpeg',
      quality: 1,
    });
  });

  it('explains that getDataURL and genImage need the main thread', async () => {
    const bitmap = new FakeBitmap(1, 1, pixels(1, 2, 3, 255));
    const res = await vintagejs(bitmap as unknown as ImageBitmap, {});

    expect(() => res.getDataURL()).toThrow('Use getBlob()');
    await expect(res.genImage()).rejects.toThrow('Use getBlob()');
  });
});
