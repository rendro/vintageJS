// @flow

import type { TUnaryFn, TSource, TResult } from './types.js';

import nullthrows from 'nullthrows';

const IMAGE_TYPE = 'image/jpeg';
const IMAGE_QUALITY = 1;

export const compose = <T1, T2, R>(
  f: TUnaryFn<T2, R>,
  g: TUnaryFn<T1, T2>,
): TUnaryFn<T1, R> =>
  x => f(g(x));

export const createCanvasAndCtxFromImage = (
  el: HTMLImageElement,
  width?: number,
  height?: number,
): [HTMLCanvasElement, CanvasRenderingContext2D] => {
  const canvas = document.createElement('canvas');
  if (!width) width = el.width;
  if (!height) height = el.height;
  canvas.width = width;
  canvas.height = height;
  const ctx = nullthrows(
    canvas.getContext('2d'),
    'Could not get 2d context for canvas',
  );
  ctx.drawImage(el, 0, 0, width, height);

  return [canvas, ctx];
};

export const cloneCanvasAndCtx = (
  source: HTMLCanvasElement,
): [HTMLCanvasElement, CanvasRenderingContext2D] => {
  const { width, height } = source;
  const target = document.createElement('canvas');
  const targetCtx = nullthrows(
    target.getContext('2d'),
    'Could not get 2d context for canvas',
  );
  target.width = width;
  target.height = height;
  targetCtx.drawImage(source, 0, 0, width, height);

  return [target, targetCtx];
};

export const getCanvasAndCtx = (
  el: HTMLCanvasElement | HTMLImageElement,
): [HTMLCanvasElement, CanvasRenderingContext2D] => {
  if (el instanceof HTMLImageElement) {
    return createCanvasAndCtxFromImage(el);
  }
  if (el instanceof HTMLCanvasElement) {
    return cloneCanvasAndCtx(el);
  }
  throw new Error(
    `Unsupported source element. Expected HTMLCanvasElement or HTMLImageElement, got ${typeof el}.`,
  );
};

export const getGradient = (
  ctx: CanvasRenderingContext2D,
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

export const loadImage = (src: string): Promise<Image> => new Promise((
  resolve,
  reject,
) => {
  const img = new Image();
  img.onload = () => resolve(img);
  img.crossOrigin = 'anonymous';
  img.onerror = (err: Error): void => reject(err);
  img.src = src;
});

export const loadImageWithCache = (() => {
  const cache: { [src: string]: Image } = {};
  return (src: string): Promise<Image> => cache[src]
    ? Promise.resolve(cache[src])
    : loadImage(src).then(img => {
        cache[src] = img;
        return img;
      });
})();

export const getResult = (canvas: HTMLCanvasElement): TResult => ({
  getDataURL(
    mimeType: string = IMAGE_TYPE,
    quality: number = IMAGE_QUALITY,
  ): string {
    return canvas.toDataURL(mimeType, quality);
  },
  getCanvas(): HTMLCanvasElement {
    return canvas;
  },
  genImage(
    mimeType: string = IMAGE_TYPE,
    quality: number = IMAGE_QUALITY,
  ): Promise<HTMLImageElement> {
    return loadImage(canvas.toDataURL(mimeType, quality));
  },
});
