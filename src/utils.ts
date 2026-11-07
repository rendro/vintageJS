import type {
  TCanvas,
  TContext,
  TDrawable,
  TResult,
  TUnaryFn,
} from './types';

import nullthrows from 'nullthrows';

const IMAGE_TYPE = 'image/jpeg';
const IMAGE_QUALITY = 1;

export const compose = <T1, T2, R>(
  f: TUnaryFn<T2, R>,
  g: TUnaryFn<T1, T2>,
): TUnaryFn<T1, R> =>
  x => f(g(x));

const hasDOM = (): boolean =>
  typeof document !== 'undefined' &&
  typeof document.createElement === 'function';

// `typeof` guards keep these checks safe where a constructor does not exist
// (e.g. HTMLImageElement in a Web Worker).
const isHTMLImage = (el: unknown): el is HTMLImageElement =>
  typeof HTMLImageElement !== 'undefined' && el instanceof HTMLImageElement;
const isHTMLCanvas = (el: unknown): el is HTMLCanvasElement =>
  typeof HTMLCanvasElement !== 'undefined' && el instanceof HTMLCanvasElement;
const isImageBitmap = (el: unknown): el is ImageBitmap =>
  typeof ImageBitmap !== 'undefined' && el instanceof ImageBitmap;
const isOffscreenCanvas = (el: unknown): el is OffscreenCanvas =>
  typeof OffscreenCanvas !== 'undefined' && el instanceof OffscreenCanvas;

// Creates an HTMLCanvasElement when a DOM is available (unchanged behavior in
// browser windows) and an OffscreenCanvas otherwise (e.g. in a Web Worker).
export const createCanvas = (width: number, height: number): TCanvas => {
  if (hasDOM()) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    return canvas;
  }
  if (typeof OffscreenCanvas !== 'undefined') {
    return new OffscreenCanvas(width, height);
  }
  throw new Error(
    'vintagejs needs either a DOM or OffscreenCanvas support to create a canvas.',
  );
};

export const get2dContext = (canvas: TCanvas): TContext =>
  nullthrows(
    canvas.getContext('2d') as TContext | null,
    'Could not get 2d context for canvas',
  );

export const createCanvasAndCtxFromImage = (
  el: TDrawable,
  width?: number,
  height?: number,
): [TCanvas, TContext] => {
  if (!width) width = el.width;
  if (!height) height = el.height;
  const canvas = createCanvas(width, height);
  const ctx = get2dContext(canvas);
  ctx.drawImage(el, 0, 0, width, height);

  return [canvas, ctx];
};

export const cloneCanvasAndCtx = (source: TCanvas): [TCanvas, TContext] =>
  createCanvasAndCtxFromImage(source, source.width, source.height);

export const getCanvasAndCtx = (el: TDrawable): [TCanvas, TContext] => {
  if (isHTMLImage(el) || isImageBitmap(el)) {
    return createCanvasAndCtxFromImage(el);
  }
  if (isHTMLCanvas(el) || isOffscreenCanvas(el)) {
    return cloneCanvasAndCtx(el);
  }
  throw new Error(
    `Unsupported source element. Expected HTMLImageElement, HTMLCanvasElement, OffscreenCanvas or ImageBitmap, got ${typeof el}.`,
  );
};

export const getGradient = (
  ctx: TContext,
  width: number,
  height: number,
  colorSteps: Array<string>,
): CanvasGradient => {
  const gradient = ctx.createRadialGradient(
    width / 2,
    height / 2,
    0,
    width / 2,
    height / 2,
    Math.sqrt(Math.pow(width / 2, 2) + Math.pow(height / 2, 2)),
  );
  colorSteps.forEach((color, idx, steps) => {
    gradient.addColorStop(idx / (steps.length - 1), color);
  });
  return gradient;
};

const loadImageElement = (src: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.crossOrigin = 'anonymous';
    img.onerror = (err) => reject(err);
    img.src = src;
  });

const loadImageBitmap = (src: string): Promise<ImageBitmap> =>
  fetch(src)
    .then(res => {
      if (!res.ok) {
        throw new Error(`Could not load image ${src}: HTTP ${res.status}`);
      }
      return res.blob();
    })
    .then(blob => createImageBitmap(blob));

// Uses an <img> element when available (unchanged behavior in browser
// windows) and fetch + createImageBitmap otherwise (e.g. in a Web Worker).
export const loadImage = (
  src: string,
): Promise<HTMLImageElement | ImageBitmap> =>
  typeof Image !== 'undefined' ? loadImageElement(src) : loadImageBitmap(src);

export const loadImageWithCache = (() => {
  const cache: { [src: string]: Promise<HTMLImageElement | ImageBitmap> } = {};
  return (src: string): Promise<HTMLImageElement | ImageBitmap> => {
    if (!cache[src]) {
      cache[src] = loadImage(src).catch(err => {
        delete cache[src];
        throw err;
      });
    }
    return cache[src];
  };
})();

export const getResult = <C extends TCanvas>(canvas: C): TResult<C> => {
  const getDataURL = (
    mimeType: string = IMAGE_TYPE,
    quality: number = IMAGE_QUALITY,
  ): string => {
    if (!isHTMLCanvas(canvas)) {
      throw new Error(
        'getDataURL() needs an HTMLCanvasElement. Use getBlob() when running in a Web Worker.',
      );
    }
    return canvas.toDataURL(mimeType, quality);
  };

  return {
    getDataURL,
    getCanvas(): C {
      return canvas;
    },
    getBlob(
      mimeType: string = IMAGE_TYPE,
      quality: number = IMAGE_QUALITY,
    ): Promise<Blob> {
      if (isHTMLCanvas(canvas)) {
        return new Promise((resolve, reject) => {
          canvas.toBlob(
            blob =>
              blob ? resolve(blob) : reject(new Error('Could not encode canvas')),
            mimeType,
            quality,
          );
        });
      }
      return (canvas as OffscreenCanvas).convertToBlob({
        type: mimeType,
        quality,
      });
    },
    genImage(
      mimeType: string = IMAGE_TYPE,
      quality: number = IMAGE_QUALITY,
    ): Promise<HTMLImageElement> {
      return new Promise<string>(resolve =>
        resolve(getDataURL(mimeType, quality)),
      ).then(loadImageElement);
    },
  };
};
