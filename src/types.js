// @flow

export type TUint8Array = Uint8ClampedArray | Array<number>;

export type TUnaryFn<A, B> = (a: A) => B;

export type TPixel = [number, number, number];

export type TSource = string | HTMLImageElement | HTMLCanvasElement;

export type TRGBAColor = {
  +r: number,
  +g: number,
  +b: number,
  +a: number,
};

export type TCurve = {
  +r: Uint8ClampedArray | Array<number>,
  +g: Uint8ClampedArray | Array<number>,
  +b: Uint8ClampedArray | Array<number>,
};

export type TEffect = {
  +curves: false | TCurve,
  +screen: false | TRGBAColor,
  +saturation: number,
  +vignette: number,
  +lighten: number,
  +viewfinder: false | string,
  +sepia: boolean,
  +gray: boolean,
  +brightness: number,
  +contrast: number,
};

export type TResult = {
  getDataURL(mimeType?: string, quality?: number): string,
  getCanvas(): HTMLCanvasElement,
  genImage(mimeType?: string, quality?: number): Promise<HTMLImageElement>,
};
