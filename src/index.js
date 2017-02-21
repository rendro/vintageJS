// @flow

import nullthrows from 'nullthrows';

export type SourceElement = HTMLImageElement | HTMLCanvasElement;

export type RGBAColor = {
  r: number,
  g: number,
  b: number,
  a: number,
};

export type Curve = {
  r: Array<number>,
  g: Array<number>,
  b: Array<number>,
};

export type Effect = {
  curves: false | Curve,
  screen: false | RGBAColor,
  saturation: number,
  vignette: number,
  lighten: number,
  viewFinder: false | string,
  sepia: boolean,
  brightness: number,
  contrast: number,
};

const defaultEffect: Effect = {
  curves: false,
  screen: false,
  saturation: 1,
  vignette: 0,
  lighten: 0,
  viewFinder: false,
  sepia: false,
  brightness: 0,
  contrast: 0,
};

const IMAGE_TYPE = 'image/jpeg';
const IMAGE_QUALITY = 1;

const readSourceFromCanvas = (el: HTMLCanvasElement): string =>
  el.toDataURL(IMAGE_TYPE, IMAGE_QUALITY);

const readSourceFromImage = (el: HTMLImageElement): string => {
  const canvas = document.createElement('canvas');
  canvas.width = el.width;
  canvas.height = el.height;
  const ctx = nullthrows(
    canvas.getContext('2d'),
    'Could not get 2d context for canvas',
  );
  ctx.drawImage(el, 0, 0, el.width, el.height);

  return readSourceFromCanvas(canvas);
};

const readSource = (el: SourceElement): string => {
  if (el instanceof HTMLImageElement) {
    return readSourceFromImage(el);
  }
  if (el instanceof HTMLCanvasElement) {
    return readSourceFromCanvas(el);
  }
  throw new Error(
    `Unsupported source element. Expected HTMLCanvasElement or HTMLImageElement, got ${typeof el}.`,
  );
};

// cool when used as contrast
// const contrastFn = _ =>
//   c => 259 * (c + 255) / (255 * (259 - c)) * (c - 128) + 128;

const compose = (f, g) => x => f(g(x));

const idFn = c => c;
const curvesFn = curves => c => curves[c];
const contrastFn = f =>
  c => 259 * (f * 256 + 255) / (255 * (259 - f * 256)) * (c - 128) + 128;
const brightnessFn = f => c => c + f * 256;
const screenFn = sa => sc => c => 255 - (255 - c) * (255 - sc * sa) / 255;

// _imageData[idx  ] += ((average - _imageData[idx  ]) * _effect.desaturate);
const getLUT = effect => {
  const { curves, contrast, brightness, screen, sepia, saturation } = effect;
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

  const id_arr = new Array(256).fill(1).map((_, idx) => idx);
  return [
    id_arr.map(rMod),
    id_arr.map(gMod),
    id_arr.map(bMod),
    id_arr.slice(0),
  ];
};

// const getVignette = (): string => {
//   const { width, height } = canvas;
//   ctx.clearRect(0, 0, width, height);
//   // ctx.globalCompositeOperation = 'multiply';
// };

// ApplyEffect :: SourceElement -> $Shape<Effect> -> Promise<string>
export default (
  srcEl: SourceElement,
  partialEffect: $Shape<Effect>,
): Promise<string> =>
  new Promise((resolve, reject) => {
    console.time('effect');
    const effect = {
      ...defaultEffect,
      ...partialEffect,
    };
    const LUT = getLUT(effect);
    const imageData = readSource(srcEl);
    const canvas = document.createElement('canvas');
    const { width, height } = srcEl;
    canvas.width = width;
    canvas.height = height;
    const ctx = nullthrows(
      canvas.getContext('2d'),
      'Could not get 2d context for canvas',
    );
    ctx.drawImage(srcEl, 0, 0, canvas.width, canvas.height);
    const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
    data.data.set(data.data.map((v, i) => LUT[i % 4][v]));
    ctx.putImageData(data, 0, 0);

    if (effect.vignette) {
      ctx.globalCompositeOperation = 'multiply';
      if (ctx.globalCompositeOperation !== 'multiply') {
        console.log('globalCompositeOperation fallback');
        ctx.globalCompositeOperation = 'source-over';
      }
      const gradient = ctx.createRadialGradient(
        width / 2,
        height / 2,
        0,
        width / 2,
        height / 2,
        Math.sqrt(Math.pow(width / 2, 2) + Math.pow(height / 2, 2)),
      );
      gradient.addColorStop(0, 'rgba(0,0,0,0)');
      gradient.addColorStop(0.5, 'rgba(0,0,0,0)');
      gradient.addColorStop(1, `rgba(0,0,0,${effect.vignette})`);
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);
    }

    if (effect.lighten) {
      ctx.globalCompositeOperation = 'lighter';
      const gradient = ctx.createRadialGradient(
        width / 2,
        height / 2,
        0,
        width / 2,
        height / 2,
        Math.sqrt(Math.pow(width / 2, 2) + Math.pow(height / 2, 2)),
      );
      gradient.addColorStop(0, `rgba(255,255,255,${effect.lighten})`);
      gradient.addColorStop(0.5, 'rgba(255,255,255,0)');
      gradient.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);
    }
    const res = canvas.toDataURL(IMAGE_TYPE, IMAGE_QUALITY);
    console.timeEnd('effect');
    resolve(res);
  });