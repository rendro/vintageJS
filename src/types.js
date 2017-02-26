// @flow

export type TUnaryFn<A, B> = (a: A) => B;

export type TPixel = [number, number, number];

export type TSourceElement = HTMLImageElement | HTMLCanvasElement;

export type TRGBAColor = {
  r: number,
  g: number,
  b: number,
  a: number,
};

export type TCurve = {
  r: Array<number>,
  g: Array<number>,
  b: Array<number>,
};

export type TEffect = {
  curves: false | TCurve,
  screen: false | TRGBAColor,
  saturation: number,
  vignette: number,
  lighten: number,
  viewfinder: false | string,
  sepia: boolean,
  brightness: number,
  contrast: number,
};

export type TResult = {
  getDataURL(mimeType?: string, quality?: number): string,
  getCanvas(): HTMLCanvasElement,
  getImage(mimeType?: string, quality?: number): Promise<HTMLImageElement>,
};
