// @flow

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
  noise: number,
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
  noise: 0,
  viewFinder: false,
  sepia: false,
  brightness: 0,
  contrast: 0,
};

// ApplyEffect :: SourceElement -> $Shape<Effect> -> Promise<string>
export default (
  srcEl: SourceElement,
  partialEffect: $Shape<Effect>,
): Promise<string> =>
  new Promise((resolve, reject) => {
    resolve('result');
  });
