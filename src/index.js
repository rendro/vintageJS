// @flow

import type {
  TEffect,
  TResult,
  TSource,
  TUint8Array,
  TUnaryFn,
} from './types.js';

import {
  compose,
  createCanvasAndCtxFromImage,
  getCanvasAndCtx,
  getGradient,
  getResult,
  loadImage,
  loadImageWithCache,
} from './utils.js';

const defaultEffect: TEffect = {
  curves: false,
  screen: false,
  saturation: 1,
  vignette: 0,
  lighten: 0,
  viewfinder: false,
  sepia: false,
  gray: false,
  brightness: 0,
  contrast: 0,
};

const idFn: TUnaryFn<number, number> = c => c;
const curvesFn: TUnaryFn<TUint8Array, TUnaryFn<number, number>> = curves =>
  c => curves[c];
const contrastFn: TUnaryFn<number, TUnaryFn<number, number>> = f =>
  c => 259 * (f * 256 + 255) / (255 * (259 - f * 256)) * (c - 128) + 128;
const brightnessFn: TUnaryFn<number, TUnaryFn<number, number>> = f =>
  c => c + f * 256;
const screenFn: TUnaryFn<number, TUnaryFn<number, TUnaryFn<number, number>>> = sa =>
  sc => c => 255 - (255 - c) * (255 - sc * sa) / 255;

const getLUT = (effect: TEffect): Array<TUint8Array> => {
  const { curves, contrast, brightness, screen, saturation } = effect;
  let rMod = idFn;
  let gMod = idFn;
  let bMod = idFn;

  if (curves) {
    rMod = compose(curvesFn(curves.r), rMod);
    gMod = compose(curvesFn(curves.g), gMod);
    bMod = compose(curvesFn(curves.b), bMod);
  }

  if (contrast) {
    let f = contrastFn(contrast);
    rMod = compose(f, rMod);
    gMod = compose(f, gMod);
    bMod = compose(f, bMod);
  }

  if (brightness) {
    let f = brightnessFn(brightness);
    rMod = compose(f, rMod);
    gMod = compose(f, gMod);
    bMod = compose(f, bMod);
  }

  if (screen) {
    let f = screenFn(screen.a);
    rMod = compose(f(screen.r), rMod);
    gMod = compose(f(screen.g), gMod);
    bMod = compose(f(screen.b), bMod);
  }
  const idArr = (Uint8ClampedArray
    ? new Uint8ClampedArray(256)
    : new Array(256).fill(1)).map((_, idx) => idx);
  return [idArr.map(rMod), idArr.map(gMod), idArr.map(bMod)];
};

const applyEffect = (effect: TEffect) => {
  const LUT = getLUT(effect);
  return (
    [canvas, ctx]: [HTMLCanvasElement, CanvasRenderingContext2D],
  ): Promise<TResult> =>
    new Promise((resolve, reject) => {
      const { width, height } = canvas;
      ctx.globalCompositeOperation = 'multiply';
      const supportsBlendModes = ctx.globalCompositeOperation === 'multiply';
      const data = ctx.getImageData(0, 0, width, height);
      const id = data.data.slice(0);
      const { sepia, saturation, gray } = effect;

      for (let i = id.length / 4; i >= 0; --i) {
        let ri = i << 2;
        let gi = ri + 1;
        let bi = ri + 2;

        let r = LUT[0][id[ri]];
        let g = LUT[1][id[gi]];
        let b = LUT[2][id[bi]];

        if (sepia) {
          [r, g, b] = [
            r * 0.393 + g * 0.769 + b * 0.189,
            r * 0.349 + g * 0.686 + b * 0.168,
            r * 0.272 + g * 0.534 + b * 0.131,
          ];
        }

        if (gray) {
          [r, g, b] = [
            r * 0.21 + g * 0.72 + b * 0.07,
            r * 0.21 + g * 0.72 + b * 0.07,
            r * 0.21 + g * 0.72 + b * 0.07,
          ];
        }

        if (saturation < 1) {
          const avg = (r + g + b) / 3;
          r += (avg - r) * (1 - saturation);
          g += (avg - g) * (1 - saturation);
          b += (avg - b) * (1 - saturation);
        }

        id[ri] = r;
        id[gi] = g;
        id[bi] = b;
      }

      data.data.set(id);
      ctx.putImageData(data, 0, 0);

      if (effect.vignette) {
        ctx.globalCompositeOperation = supportsBlendModes
          ? 'multiply'
          : 'source-over';
        ctx.fillStyle = getGradient(ctx, width, height, [
          'rgba(0,0,0,0)',
          'rgba(0,0,0,0)',
          `rgba(0,0,0,${effect.vignette})`,
        ]);
        ctx.fillRect(0, 0, width, height);
      }

      if (effect.lighten) {
        ctx.globalCompositeOperation = supportsBlendModes
          ? 'screen'
          : 'lighter';
        ctx.fillStyle = getGradient(ctx, width, height, [
          `rgba(255,255,255,${effect.lighten})`,
          'rgba(255,255,255,0)',
          'rgba(0,0,0,0)',
        ]);
        ctx.fillRect(0, 0, width, height);
      }

      if (!effect.viewfinder) {
        return resolve(getResult(canvas));
      }

      return loadImageWithCache(effect.viewfinder).then(img => {
        if (supportsBlendModes) {
          ctx.globalCompositeOperation = 'multiply';
          ctx.drawImage(img, 0, 0, width, height);
        } else {
          const [_, vfCtx] = createCanvasAndCtxFromImage(img, width, height);
          const { data: vfData } = vfCtx.getImageData(0, 0, width, height);
          const imageData = ctx.getImageData(0, 0, width, height);
          imageData.data.set(imageData.data.map((v, i) => v * vfData[i] / 255));
          ctx.putImageData(imageData, 0, 0);
        }

        return resolve(getResult(canvas));
      });
    });
};

// vintagejs :: TSource -> $Shape<TEffect> -> Promise<TResult>
export default (
  src: TSource,
  partialEffect: $Shape<TEffect>,
): Promise<TResult> => {
  const genSource = typeof src === 'string'
    ? loadImage(src).then(getCanvasAndCtx)
    : Promise.resolve(getCanvasAndCtx(src));

  return genSource.then(applyEffect({
      ...defaultEffect,
      ...partialEffect,
    }));
};
