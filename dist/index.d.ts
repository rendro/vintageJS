import type { TCanvas, TEffect, TResult, TSource } from './types';
export type { TCanvas, TCurve, TDrawable, TEffect, TLightLeak, TLightLeakEdge, TResult, TRGBAColor, TRGBColor, TSource, } from './types';
declare const vintagejs: <C extends TCanvas = HTMLCanvasElement>(src: TSource, partialEffect: Partial<TEffect>) => Promise<TResult<C>>;
export default vintagejs;
