export type TUint8Array = Uint8ClampedArray | Array<number>;

export type TUnaryFn<A, B> = (a: A) => B;

export type TPixel = [number, number, number];

/**
 * A canvas the effect can be rendered to. In a browser window this is an
 * `HTMLCanvasElement`; inside a Web Worker (no DOM) it is an `OffscreenCanvas`.
 */
export type TCanvas = HTMLCanvasElement | OffscreenCanvas;

export type TContext =
  | CanvasRenderingContext2D
  | OffscreenCanvasRenderingContext2D;

/** Anything that can be drawn onto a canvas as the effect's input. */
export type TDrawable =
  | HTMLImageElement
  | HTMLCanvasElement
  | OffscreenCanvas
  | ImageBitmap;

/**
 * A URL / data URI, or an element or bitmap to read pixels from.
 * `OffscreenCanvas` and `ImageBitmap` work in both windows and Web Workers.
 */
export type TSource = string | TDrawable;

export type TRGBAColor = {
  readonly r: number;
  readonly g: number;
  readonly b: number;
  readonly a: number;
};

export type TRGBColor = {
  readonly r: number;
  readonly g: number;
  readonly b: number;
};

export type TLightLeakEdge = 'left' | 'right' | 'top' | 'bottom';

export type TLightLeak = {
  /** 0–1 */
  readonly intensity: number;
  /** Edge the light bleeds in from. Default: 'right'. */
  readonly edge?: TLightLeakEdge;
  /** Glow color. Default: warm orange { r: 255, g: 112, b: 36 }. */
  readonly color?: TRGBColor;
};

export type TCurve = {
  readonly r: Uint8ClampedArray | Array<number>;
  readonly g: Uint8ClampedArray | Array<number>;
  readonly b: Uint8ClampedArray | Array<number>;
};

export type TEffect = {
  readonly curves: false | TCurve;
  readonly screen: false | TRGBAColor;
  readonly saturation: number;
  readonly vignette: number;
  readonly lighten: number;
  readonly viewfinder: false | string;
  readonly sepia: boolean;
  readonly gray: boolean;
  readonly brightness: number;
  readonly contrast: number;
  /** Film grain, 0–1. Scales with the image, the same on every run. */
  readonly grain: number;
  /** A warm glow bleeding in from one edge. */
  readonly lightLeak: false | TLightLeak;
};

/**
 * The result of applying an effect. `C` is the canvas type the result lives
 * on: `HTMLCanvasElement` in a window (the default) and `OffscreenCanvas` in a
 * Web Worker, e.g. `vintagejs<OffscreenCanvas>(bitmap, effect)`.
 */
export type TResult<C extends TCanvas = HTMLCanvasElement> = {
  /** Only available on the main thread (`HTMLCanvasElement`); use `getBlob` in workers. */
  getDataURL(mimeType?: string, quality?: number): string;
  getCanvas(): C;
  /** Encodes the result; works on the main thread and in Web Workers. */
  getBlob(mimeType?: string, quality?: number): Promise<Blob>;
  /** Only available on the main thread, since it creates an `HTMLImageElement`. */
  genImage(mimeType?: string, quality?: number): Promise<HTMLImageElement>;
};
