import type { TUnaryFn, TResult } from './types';
export declare const compose: <T1, T2, R>(f: TUnaryFn<T2, R>, g: TUnaryFn<T1, T2>) => TUnaryFn<T1, R>;
export declare const createCanvasAndCtxFromImage: (el: HTMLImageElement, width?: number, height?: number) => [HTMLCanvasElement, CanvasRenderingContext2D];
export declare const cloneCanvasAndCtx: (source: HTMLCanvasElement) => [HTMLCanvasElement, CanvasRenderingContext2D];
export declare const getCanvasAndCtx: (el: HTMLCanvasElement | HTMLImageElement) => [HTMLCanvasElement, CanvasRenderingContext2D];
export declare const getGradient: (ctx: CanvasRenderingContext2D, width: number, height: number, colorSteps: Array<string>) => CanvasGradient;
export declare const loadImage: (src: string) => Promise<HTMLImageElement>;
export declare const loadImageWithCache: (src: string) => Promise<HTMLImageElement>;
export declare const getResult: (canvas: HTMLCanvasElement) => TResult;
